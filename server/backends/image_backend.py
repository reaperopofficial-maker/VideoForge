import os
import time
import httpx
import asyncio
from typing import Dict, Any

class ImageGeneratorBackend:
    def __init__(self):
        self.api_key = os.getenv("GEMINIGEN_API_KEY")
        self.endpoint = "https://api.geminigen.ai/uapi/v1/generate"
        self.headers = {
            "x-api-key": self.api_key or "",
            "Content-Type": "application/json"
        }
        self.timeout = 60.0
        self.max_retries = 3

        self.costs = {
            "imagen-4-ultra": 0.04,
            "nano-banana": 0.01
        }
        
    async def _make_request(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        if not self.api_key:
            return {
                "success": False,
                "error": "GEMINIGEN_API_KEY is not set in environment variables.",
                "cost": 0.0,
                "generation_time": 0.0
            }

        start_time = time.time()
        model_name = payload.get("model", "imagen-4-ultra")
        cost = self.costs.get(model_name, 0.04)

        async with httpx.AsyncClient(timeout=self.timeout) as client:
            for attempt in range(self.max_retries):
                try:
                    response = await client.post(
                        self.endpoint,
                        headers=self.headers,
                        json=payload
                    )
                    response.raise_for_status()
                    data = response.json()
                    
                    generation_time = round(time.time() - start_time, 2)
                    
                    # Ensure we can extract image_url consistently
                    image_url = data.get("image_url")
                    if not image_url and "data" in data and isinstance(data["data"], list) and len(data["data"]) > 0:
                        image_url = data["data"][0].get("url")
                         
                    if not image_url:
                        if attempt < self.max_retries - 1:
                            await asyncio.sleep(2 ** attempt)
                            continue
                        raise ValueError("Image URL not found in the API response.")

                    return {
                        "success": True,
                        "image_url": image_url,
                        "model": model_name,
                        "cost": cost,
                        "generation_time": generation_time
                    }
                except httpx.HTTPStatusError as e:
                    if attempt < self.max_retries - 1 and e.response.status_code >= 500:
                        await asyncio.sleep(2 ** attempt)
                        continue
                    generation_time = round(time.time() - start_time, 2)
                    return {
                        "success": False,
                        "error": f"HTTP error occurred: {e.response.status_code} - {e.response.text}",
                        "model": model_name,
                        "cost": 0.0,
                        "generation_time": generation_time
                    }
                except httpx.RequestError as e:
                    if attempt < self.max_retries - 1:
                        await asyncio.sleep(2 ** attempt)
                        continue
                    generation_time = round(time.time() - start_time, 2)
                    return {
                        "success": False,
                        "error": f"Request error occurred: {str(e)}",
                        "model": model_name,
                        "cost": 0.0,
                        "generation_time": generation_time
                    }
                except Exception as e:
                    if attempt < self.max_retries - 1:
                        await asyncio.sleep(2 ** attempt)
                        continue
                    generation_time = round(time.time() - start_time, 2)
                    return {
                        "success": False,
                        "error": f"An unexpected error occurred: {str(e)}",
                        "model": model_name,
                        "cost": 0.0,
                        "generation_time": generation_time
                    }
            
            return {
                "success": False,
                "error": "Max retries exceeded.",
                "model": model_name,
                "cost": 0.0,
                "generation_time": round(time.time() - start_time, 2)
            }

    async def generate(self, prompt: str) -> Dict[str, Any]:
        """Basic image generation using imagen-4-ultra."""
        payload = {
            "type": "image",
            "prompt": prompt,
            "model": "imagen-4-ultra",
            "aspect_ratio": "9:16",
            "style": "cinematic"
        }
        return await self._make_request(payload)

    async def generate_with_reference(self, prompt: str, reference_url: str) -> Dict[str, Any]:
        """Character consistency generation using a reference image."""
        payload = {
            "type": "image",
            "prompt": prompt,
            "model": "nano-banana",
            "reference_url": reference_url,
            "aspect_ratio": "9:16",
            "style": "cinematic"
        }
        return await self._make_request(payload)

    async def generate_character(self, character_name: str, description: str) -> Dict[str, Any]:
        """Character design using imagen-4-ultra for high detail portrait."""
        prompt = f"Highly detailed, cinematic portrait of {character_name}. {description}. Professional photography, clear facial features, 8k resolution, cinematic lighting."
        payload = {
            "type": "image",
            "prompt": prompt,
            "model": "imagen-4-ultra",
            "aspect_ratio": "9:16",
            "style": "cinematic"
        }
        return await self._make_request(payload)

    async def generate_storyboard(self, scene_description: str, character_ref_url: str) -> Dict[str, Any]:
        """Storyboard frame generation with scene and character reference."""
        prompt = f"Cinematic storyboard frame. {scene_description}. High dramatic lighting, film composition."
        payload = {
            "type": "image",
            "prompt": prompt,
            "model": "nano-banana",
            "reference_url": character_ref_url,
            "aspect_ratio": "9:16",
            "style": "cinematic"
        }
        return await self._make_request(payload)
