from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from typing import List, Dict, Any

from server.models.database import get_db, Project, Scene, Character
from server.agents.main_agent import MainAgent

router = APIRouter()
main_agent = MainAgent()

class ChatRequest(BaseModel):
    project_id: str
    message: str
    history: List[Dict[str, Any]]

@router.post("/chat")
async def chat_with_agent(req: ChatRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Project).where(Project.id == req.project_id))
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Project not found")

    messages = req.history.copy()
    messages.append({"role": "user", "content": req.message})
    
    agent_res = await main_agent.chat(messages, req.project_id)
    
    if not agent_res.get("success"):
        raise HTTPException(status_code=500, detail=agent_res.get("error"))
        
    return {
        "success": True,
        "type": agent_res.get("type"),
        "content": agent_res.get("content"),
        "tool_calls": agent_res.get("tool_calls", []),
        "assistant_message": agent_res.get("assistant_message")
    }

@router.get("/status/{project_id}")
async def get_project_status(project_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Project).where(Project.id == project_id))
    project = result.scalar_one_or_none()
    
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
        
    scenes_result = await db.execute(select(Scene).where(Scene.project_id == project_id))
    characters_result = await db.execute(select(Character).where(Character.project_id == project_id))
    
    scenes = scenes_result.scalars().all()
    characters = characters_result.scalars().all()
    
    has_script = len(scenes) > 0
    has_chars = len(characters) > 0
    has_images = all([s.image_url for s in scenes]) if has_script else False
    has_videos = all([s.video_url for s in scenes]) if has_script else False
    
    return {
        "status": project.status,
        "novel_text_uploaded": project.novel_text is not None,
        "script": {"completed": has_script, "count": len(scenes)},
        "characters": {"completed": has_chars, "count": len(characters)},
        "images": {"completed": has_images},
        "videos": {"completed": has_videos},
        "final_video": project.status == "completed"
    }
