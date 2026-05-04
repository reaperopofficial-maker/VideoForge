# VideoForge

An AI Video Generation Web App.

## Features
1. User uploads a novel/story text.
2. Claude API generates a JSON script.
3. Claude API extracts characters.
4. GeminiGen.ai generates character design images (imagen-4-ultra).
5. GeminiGen.ai generates storyboard images (nano-banana).
6. GeminiGen.ai generates video clips (veo-3.1).
7. FFmpeg merges the final video.
8. SSE provides real-time progress to the frontend.

## Tech Stack
- **Frontend**: React 19 + TypeScript + Tailwind CSS 4 + Vite + Wouter + Zustand + Framer Motion
- **Backend**: FastAPI (Python 3.12) + Uvicorn
- **AI Brain**: Anthropic Claude API (claude-sonnet-4-5)
- **Image Generation**: GeminiGen.ai API (imagen-4-ultra, nano-banana)
- **Video Generation**: GeminiGen.ai API (veo-3.1, veo-3-fast)
- **Database**: SQLite + SQLAlchemy 2.0 async
- **Media Processing**: FFmpeg
- **Web Server**: Nginx
