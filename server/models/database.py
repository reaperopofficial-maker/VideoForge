import os
import uuid
from datetime import datetime
from typing import AsyncGenerator
from sqlalchemy import Column, String, Text, Float, DateTime, ForeignKey, Integer
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base, relationship

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./videoforge.db")

engine = create_async_engine(DATABASE_URL, echo=False)
AsyncSessionLocal = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

Base = declarative_base()

def generate_uuid() -> str:
    return str(uuid.uuid4())

class Project(Base):
    __tablename__ = "projects"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, nullable=False)
    description = Column(String, nullable=True)
    novel_text = Column(Text, nullable=True)
    status = Column(String, default="pending") # pending/processing/completed/failed
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    scenes = relationship("Scene", back_populates="project", cascade="all, delete-orphan")
    characters = relationship("Character", back_populates="project", cascade="all, delete-orphan")
    logs = relationship("GenerationLog", back_populates="project", cascade="all, delete-orphan")

class Scene(Base):
    __tablename__ = "scenes"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    project_id = Column(String, ForeignKey("projects.id", ondelete="CASCADE"))
    scene_number = Column(Integer, nullable=False)
    description = Column(Text, nullable=True)
    image_prompt = Column(Text, nullable=True)
    video_prompt = Column(Text, nullable=True)
    image_url = Column(String, nullable=True)
    video_url = Column(String, nullable=True)
    local_video_path = Column(String, nullable=True)
    status = Column(String, default="pending") # pending/processing/completed/failed
    duration = Column(Integer, default=5)
    
    project = relationship("Project", back_populates="scenes")

class Character(Base):
    __tablename__ = "characters"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    project_id = Column(String, ForeignKey("projects.id", ondelete="CASCADE"))
    name = Column(String, nullable=False)
    appearance = Column(Text, nullable=True)
    image_prompt = Column(Text, nullable=True)
    image_url = Column(String, nullable=True)
    reference_prompt = Column(String, nullable=True)
    
    project = relationship("Project", back_populates="characters")

class GenerationLog(Base):
    __tablename__ = "generation_logs"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    project_id = Column(String, ForeignKey("projects.id", ondelete="CASCADE"))
    step = Column(String, nullable=False)
    status = Column(String, nullable=False)
    cost = Column(Float, default=0.0)
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    project = relationship("Project", back_populates="logs")

async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        yield session
