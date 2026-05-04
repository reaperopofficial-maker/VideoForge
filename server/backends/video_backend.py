import os
import time
import httpx
import asyncio
import aiofiles
from pathlib import Path
from typing import Dict, Any, Optional

class VideoGeneratorBackend:
    def __init__(self):
        self.api_key = os.getenv("GEMINIGEN_API_KEY")
        self.endpoint = "https://api.geminigen.ai/uapi/v1/generate"
        self.status_endpoint = "https://api.geminigen.ai/uapi/v1/status/"
        self.headers = {
            "x-api-key": self.api_key or "",
            "Content-Type": "application/json"
        }
        self.timeout = 300.0  # 5 minutes for generation polling overall
        self.max_retries = 3

        self.costs_per_second = {
            "veo-3.1": 0.05,
            "veo-3-fast": 0.02
        }

    async def poll_status(self, job_id: str) -> Dict[str, Any]:
        """Poll the API until video is ready. Checks every 5 seconds, max 5 minutes."""
        url = f"{self.status_endpoint}{job_id}"
        start_time = time.time()
        max_wait = 300.0
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            while True:
                if time.time() - start_time > max_wait:
                    return {"success": False, "error": "Polling timeout exceeded (5 minutes)."}
                
                try:
                    response = await client.get(url, headers=self.headers)
                    response.raise_for_status()
                    data = response.json()
                    
                    status = data.get("status", "").lower()
                    if status == "completed" or data.get("video_url") is not None:
                        video_url = data.get("video_url")
                        if not video_url and "data" in data and isinstance(data["data"], list) and len(data["data"]) > 0:
                            video_url = data["data"][0].get("url")
                        
                        if video_url:
                            return {"success": True, "video_url": video_url, "progress": 100}
                    
                    elif status == "failed":
                        return {"success": False, "error": "Video generation failed at remote backend."}
                    
                except Exception:
                    # Ignore intermittent networking errors during polling, will retry loop
                    pass

                await asyncio.sleep(5)

    async def download_and_save(self, video_url: str, project_id: str, scene_id: str) -> str:
        """Download video from URL and save it to local storage."""
        save_dir = Path("projects") / str(project_id) / "videos"
        save_dir.mkdir(parents=True, exist_ok=True)
        
        file_path = save_dir / f"{scene_id}.mp4"
        
        async with httpx.AsyncClient(timeout=120.0) as client:
            for attempt in range(self.max_retries):
                try:
                    async with client.stream("GET", video_url) as response:
                        response.raise_for_status()
                        async with aiofiles.open(file_path, "wb") as f:
                            async for chunk in response.aiter_bytes(chunk_size=8192):
                                await f.write(chunk)
                    return str(file_path)
                except Exception as e:
                    if attempt < self.max_retries - 1:
                        await asyncio.sleep(2 ** attempt)
                        continue
                    raise RuntimeError(f"Download failed after {self.max_retries} attempts: {str(e)}")
        
        return str(file_path)

    async def _process_generation(
        self, 
        payload: Dict[str, Any], 
        project_id: Optional[str] = None, 
        scene_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """Internal helper to orchestrate request, polling, and downloading."""
        if not self.api_key:
            return {
                "success": False,
                "error": "GEMINIGEN_API_KEY is not set in environment variables.",
                "cost": 0.0,
                "generation_time": 0.0
            }

        start_time = time.time()
        model_name = payload.get("model", "veo-3.1")
        duration = payload.get("duration", 5)
        cost = self.costs_per_second.get(model_name, 0.05) * duration

        async with httpx.AsyncClient(timeout=30.0) as client:
            video_url = None
            job_id = None
            
            for attempt in range(self.max_retries):
                try:
                    response = await client.post(
                        self.endpoint,
                        headers=self.headers,
                        json=payload
                    )
                    response.raise_for_status()
                    data = response.json()
                    
                    # The API might run fast and return immediately, or enqueue and return job_id
                    video_url = data.get("video_url")
                    if not video_url and "data" in data and isinstance(data["data"], list) and len(data["data"]) > 0:
                        video_url = data["data"][0].get("url")
                        
                    job_id = data.get("job_id")
                    break 
                except httpx.HTTPError as e:
                    if attempt < self.max_retries - 1:
                        await asyncio.sleep(2 ** attempt)
                        continue
                    
                    return {
                        "success": False,
                        "error": f"API request error: {str(e)}",
                        "model": model_name,
                        "cost": 0.0,
                        "generation_time": round(time.time() - start_time, 2)
                    }
                    
            if not video_url and job_id:
                poll_result = await self.poll_status(job_id)
                if not poll_result["success"]:
                    return {
                        "success": False,
                        "error": poll_result.get("error", "Polling failed."),
                        "model": model_name,
                        "cost": 0.0,
                        "generation_time": round(time.time() - start_time, 2)
                    }
                video_url = poll_result.get("video_url")

            if not video_url:
                return {
                    "success": False,
                    "error": "Failed to retrieve video URL from the response.",
                    "model": model_name,
                    "cost": 0.0,
                    "generation_time": round(time.time() - start_time, 2)
                }

            local_path = None
            if project_id and scene_id:
                try:
                    local_path = await self.download_and_save(video_url, project_id, scene_id)
                except Exception as e:
                    return {
                        "success": False,
                        "error": f"Generated successfully but failed to download video: {str(e)}",
                        "video_url": video_url,
                        "model": model_name,
                        "cost": cost,
                        "generation_time": round(time.time() - start_time, 2)
                    }

            result = {
                "success": True,
                "video_url": video_url,
                "model": model_name,
                "duration": duration,
                "cost": round(cost, 4),
                "generation_time": round(time.time() - start_time, 2)
            }
            
            if local_path:
                result["local_path"] = local_path
            
            return result

    async def generate(
        self, 
        prompt: str, 
        image_url: str, 
        duration: int = 5,
        project_id: Optional[str] = None, 
        scene_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """Generate standard video from image."""
        payload = {
            "type": "video",
            "prompt": prompt,
            "model": "veo-3.1",
            "image_url": image_url,
            "aspect_ratio": "9:16",
            "duration": duration
        }
        return await self._process_generation(payload, project_id, scene_id)

    async def generate_fast(
        self, 
        prompt: str, 
        image_url: str, 
        duration: int = 5,
        project_id: Optional[str] = None, 
        scene_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """Generate fast video from image."""
        payload = {
            "type": "video",
            "prompt": prompt,
            "model": "veo-3-fast",
            "image_url": image_url,
            "aspect_ratio": "9:16",
            "duration": duration
        }
        return await self._process_generation(payload, project_id, scene_id)

    async def generate_text_to_video(
        self, 
        prompt: str, 
        duration: int = 5,
        project_id: Optional[str] = None, 
        scene_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """Generate video from text only, without image."""
        payload = {
            "type": "video",
            "prompt": prompt,
            "model": "veo-3.1",
            "aspect_ratio": "9:16",
            "duration": duration
        }
        return await self._process_generation(payload, project_id, scene_id)
