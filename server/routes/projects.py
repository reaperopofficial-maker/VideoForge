import os
import shutil
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from typing import List, Optional

from server.models.database import get_db, Project, Scene, Character

router = APIRouter()

class ProjectCreate(BaseModel):
    name: str
    description: Optional[str] = None

class ProjectResponse(BaseModel):
    id: str
    name: str
    description: Optional[str]
    status: str
    novel_text: Optional[str]
    
    class Config:
        from_attributes = True

@router.post("", response_model=ProjectResponse)
async def create_project(project: ProjectCreate, db: AsyncSession = Depends(get_db)):
    db_project = Project(
        name=project.name,
        description=project.description,
        status="pending"
    )
    db.add(db_project)
    await db.commit()
    await db.refresh(db_project)
    
    project_dir = os.path.join("projects", db_project.id)
    os.makedirs(project_dir, exist_ok=True)
    os.makedirs(os.path.join(project_dir, "videos"), exist_ok=True)
    os.makedirs(os.path.join(project_dir, "images"), exist_ok=True)
    
    return db_project

@router.get("", response_model=List[ProjectResponse])
async def list_projects(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Project).order_by(Project.created_at.desc()))
    return result.scalars().all()

@router.get("/{project_id}")
async def get_project(project_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Project).where(Project.id == project_id))
    project = result.scalar_one_or_none()
    
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
        
    scenes_result = await db.execute(select(Scene).where(Scene.project_id == project_id).order_by(Scene.scene_number))
    characters_result = await db.execute(select(Character).where(Character.project_id == project_id))
    
    return {
        "id": project.id,
        "name": project.name,
        "description": project.description,
        "status": project.status,
        "novel_text": project.novel_text,
        "scenes": scenes_result.scalars().all(),
        "characters": characters_result.scalars().all()
    }

@router.delete("/{project_id}")
async def delete_project(project_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Project).where(Project.id == project_id))
    project = result.scalar_one_or_none()
    
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
        
    await db.delete(project)
    await db.commit()
    
    project_dir = os.path.join("projects", project_id)
    if os.path.exists(project_dir):
        shutil.rmtree(project_dir)
        
    return {"success": True}

@router.post("/{project_id}/upload")
async def upload_novel(project_id: str, file: UploadFile = File(...), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Project).where(Project.id == project_id))
    project = result.scalar_one_or_none()
    
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
        
    content = await file.read()
    text = content.decode("utf-8")
    
    project.novel_text = text
    await db.commit()
    
    return {"success": True, "message": "Novel text uploaded successfully"}
