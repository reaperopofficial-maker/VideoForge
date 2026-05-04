import os
import json
import asyncio
from typing import Dict, Any, List
from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel

from server.models.database import get_db, Project, Scene, Character, GenerationLog
from server.agents.script_agent import ScriptAgent
from server.agents.character_agent import CharacterAgent
from server.backends.image_backend import ImageGeneratorBackend
from server.backends.video_backend import VideoGeneratorBackend
from server.core.ffmpeg import merge_videos

router = APIRouter()

script_agent = ScriptAgent()
character_agent = CharacterAgent()
image_backend = ImageGeneratorBackend()
video_backend = VideoGeneratorBackend()

project_progress = {}

def update_progress(project_id: str, step: str, progress: int, message: str):
    if project_id not in project_progress:
        project_progress[project_id] = []
    
    project_progress[project_id].append({
        "step": step,
        "progress": progress,
        "message": message
    })

@router.get("/progress/{project_id}")
async def get_progress_stream(project_id: str, request: Request):
    async def event_generator():
        last_idx = 0
        while True:
            if await request.is_disconnected():
                break
                
            messages = project_progress.get(project_id, [])
            if last_idx < len(messages):
                for msg in messages[last_idx:]:
                    yield f"data: {json.dumps(msg)}\n\n"
                last_idx = len(messages)
            
            await asyncio.sleep(2)
            
    return StreamingResponse(event_generator(), media_type="text/event-stream")

@router.post("/script/{project_id}")
async def generate_script(project_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Project).where(Project.id == project_id))
    project = result.scalar_one_or_none()
    if not project or not project.novel_text:
        raise HTTPException(status_code=404, detail="Project or novel text not found")
        
    update_progress(project_id, "script", 10, "Generating script using Claude API...")
    
    script_res = await script_agent.generate_script(project.novel_text)
    if not script_res.get("success"):
        raise HTTPException(status_code=500, detail=script_res.get("error"))
        
    script_data = script_res["data"]
    
    for scene_data in script_data.get("scenes", []):
        scene = Scene(
            project_id=project_id,
            scene_number=scene_data.get("sequence", 1),
            description=scene_data.get("description", ""),
            image_prompt=scene_data.get("image_prompt", ""),
            video_prompt=scene_data.get("video_prompt", ""),
            duration=scene_data.get("duration", 5)
        )
        db.add(scene)
        
    await db.commit()
    update_progress(project_id, "script", 100, "Script generation completed")
    
    return {"success": True, "script": script_data}

@router.post("/characters/{project_id}")
async def generate_characters(project_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Project).where(Project.id == project_id))
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    scenes_result = await db.execute(select(Scene).where(Scene.project_id == project_id))
    scenes = scenes_result.scalars().all()
    
    update_progress(project_id, "characters", 10, "Extracting characters using Claude API...")
    
    script_json = {"scenes": [{"characters": s.description} for s in scenes]}
    char_res = await character_agent.generate_characters(script_json)
    
    if not char_res.get("success"):
        raise HTTPException(status_code=500, detail=char_res.get("error"))
        
    characters_data = char_res["data"].get("characters", [])
    
    update_progress(project_id, "characters", 50, "Generating character images...")
    
    created_chars = []
    total_cost = 0.0
    
    for idx, char_data in enumerate(characters_data):
        img_res = await image_backend.generate_character(char_data.get("name", "Unknown"), char_data.get("appearance", ""))
        
        char_obj = Character(
            project_id=project_id,
            name=char_data.get("name", ""),
            appearance=char_data.get("appearance", ""),
            image_prompt=char_data.get("image_prompt", ""),
            reference_prompt=char_data.get("reference_prompt", ""),
            image_url=img_res.get("image_url", "") if img_res.get("success") else None
        )
        db.add(char_obj)
        created_chars.append(char_obj)
        
        if img_res.get("success"):
            total_cost += img_res.get("cost", 0.0)
            
        update_progress(project_id, "characters", 50 + int(50 * (idx + 1) / len(characters_data)), f"Generated image for {char_obj.name}")

    log = GenerationLog(project_id=project_id, step="characters", status="completed", cost=total_cost)
    db.add(log)
    await db.commit()
    
    update_progress(project_id, "characters", 100, "Character generation completed")
    return {"success": True, "message": "Characters extracted and generated"}

@router.post("/images/{project_id}")
async def generate_images(project_id: str, db: AsyncSession = Depends(get_db)):
    scenes_result = await db.execute(select(Scene).where(Scene.project_id == project_id).order_by(Scene.scene_number))
    scenes = scenes_result.scalars().all()
    
    if not scenes:
        raise HTTPException(status_code=404, detail="No scenes found for this project")
        
    update_progress(project_id, "images", 0, "Starting storyboard generation...")
    
    total_cost = 0.0
    
    for idx, scene in enumerate(scenes):
        scene.status = "processing"
        await db.commit()
        
        res = await image_backend.generate(scene.image_prompt)
        
        if res.get("success"):
            scene.image_url = res.get("image_url")
            scene.status = "image_completed"
            total_cost += res.get("cost", 0.0)
            update_progress(project_id, "images", int(100 * (idx + 1) / len(scenes)), f"Scene {idx + 1}/{len(scenes)} image generated")
        else:
            scene.status = "image_failed"
            update_progress(project_id, "images", int(100 * (idx + 1) / len(scenes)), f"Failed to generate scene {idx + 1} image")
            
        await db.commit()
        
    log = GenerationLog(project_id=project_id, step="images", status="completed", cost=total_cost)
    db.add(log)
    await db.commit()
    
    return {"success": True}

@router.post("/videos/{project_id}")
async def generate_videos(project_id: str, db: AsyncSession = Depends(get_db)):
    scenes_result = await db.execute(select(Scene).where(Scene.project_id == project_id).order_by(Scene.scene_number))
    scenes = scenes_result.scalars().all()
    
    total_cost = 0.0
    
    for idx, scene in enumerate(scenes):
        if not scene.image_url:
            continue
            
        update_progress(project_id, "videos", int(100 * idx / len(scenes)), f"Generating video for Scene {scene.scene_number}...")
        
        res = await video_backend.generate(
            prompt=scene.video_prompt,
            image_url=scene.image_url,
            duration=scene.duration,
            project_id=project_id,
            scene_id=scene.id
        )
        
        if res.get("success"):
            scene.video_url = res.get("video_url")
            scene.local_video_path = res.get("local_path")
            scene.status = "completed"
            total_cost += res.get("cost", 0.0)
            update_progress(project_id, "videos", int(100 * (idx + 1) / len(scenes)), f"Scene {idx + 1}/{len(scenes)} video finished")
        else:
            scene.status = "video_failed"
            update_progress(project_id, "videos", int(100 * (idx + 1) / len(scenes)), f"Failed to generate scene {idx + 1} video")
            
        await db.commit()
        
    log = GenerationLog(project_id=project_id, step="videos", status="completed", cost=total_cost)
    db.add(log)
    await db.commit()
    
    return {"success": True}

@router.post("/final/{project_id}")
async def merge_final_video(project_id: str, db: AsyncSession = Depends(get_db)):
    scenes_result = await db.execute(select(Scene).where(Scene.project_id == project_id).order_by(Scene.scene_number))
    scenes = scenes_result.scalars().all()
    
    video_paths = [s.local_video_path for s in scenes if s.local_video_path and os.path.exists(s.local_video_path)]
    
    if not video_paths:
        raise HTTPException(status_code=400, detail="No local videos found to merge")
        
    update_progress(project_id, "final", 50, f"Merging {len(video_paths)} videos...")
    
    output_path = os.path.join("projects", project_id, "final_video.mp4")
    
    try:
        final_path = await merge_videos(video_paths, output_path)
        update_progress(project_id, "final", 100, "Final video created successfully")
        
        result = await db.execute(select(Project).where(Project.id == project_id))
        project = result.scalar_one_or_none()
        if project:
            project.status = "completed"
            await db.commit()
            
        return {"success": True, "final_video_path": final_path}
    except Exception as e:
        update_progress(project_id, "final", 100, f"Failed to merge videos: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

