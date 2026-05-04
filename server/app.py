import os
from dotenv import load_dotenv
load_dotenv()

from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import uvicorn

from server.models.database import init_db
from server.routes import projects, generate, agent, auth
from server.core.auth import get_current_user

@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield

app = FastAPI(title="VideoForge", version="0.1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(projects.router, prefix="/api/projects", tags=["Projects"], dependencies=[Depends(get_current_user)])
app.include_router(generate.router, prefix="/api/generate", tags=["Generate"], dependencies=[Depends(get_current_user)])
app.include_router(agent.router, prefix="/api/agent", tags=["Agent"], dependencies=[Depends(get_current_user)])
app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])

@app.get("/health")
async def health_check():
    return {"status": "ok"}

frontend_dist = os.path.join(os.getcwd(), "dist")
if os.path.exists(frontend_dist):
    app.mount("/assets", StaticFiles(directory=os.path.join(frontend_dist, "assets")), name="assets")
    
    @app.get("/", include_in_schema=False)
    @app.get("/{path:path}", include_in_schema=False)
    async def serve_frontend(path: str):
        file_path = os.path.join(frontend_dist, path)
        if os.path.exists(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(frontend_dist, "index.html"))

if __name__ == "__main__":
    uvicorn.run("server.app:app", host="0.0.0.0", port=8000, reload=True)
