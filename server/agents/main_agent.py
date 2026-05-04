import os
import json
import asyncio
from typing import Dict, Any, List
from anthropic import AsyncAnthropic

class MainAgent:
    def __init__(self):
        self.api_key = os.getenv("ANTHROPIC_API_KEY")
        self.client = AsyncAnthropic(api_key=self.api_key or "")
        self.model = "claude-sonnet-4-5"
        self.max_retries = 3
        
        self.system_prompt = """Tum VideoForge ka AI assistant ho.
User ki novel se video banane mein help karo.
Hinglish mein baat karo - friendly aur helpful raho.
Har step complete hone pe user ko batao.
Agla step shuru karne se pehle confirm lo."""

        self.tools = [
            {
                "name": "get_project_status",
                "description": "Check current status of the project files and progress.",
                "input_schema": {
                    "type": "object",
                    "properties": {
                        "project_id": {"type": "string", "description": "ID of the project"}
                    },
                    "required": ["project_id"]
                }
            },
            {
                "name": "generate_script",
                "description": "Calls script_agent to generate a script from novel text.",
                "input_schema": {
                    "type": "object",
                    "properties": {
                        "project_id": {"type": "string", "description": "ID of the project"}
                    },
                    "required": ["project_id"]
                }
            },
            {
                "name": "generate_characters",
                "description": "Calls character_agent to generate characters from the script.",
                "input_schema": {
                    "type": "object",
                    "properties": {
                        "project_id": {"type": "string", "description": "ID of the project"}
                    },
                    "required": ["project_id"]
                }
            },
            {
                "name": "generate_images",
                "description": "Calls image_backend to generate images for a project.",
                "input_schema": {
                    "type": "object",
                    "properties": {
                        "project_id": {"type": "string", "description": "ID of the project"}
                    },
                    "required": ["project_id"]
                }
            },
            {
                "name": "generate_videos",
                "description": "Calls video_backend to generate video clips from images.",
                "input_schema": {
                    "type": "object",
                    "properties": {
                        "project_id": {"type": "string", "description": "ID of the project"}
                    },
                    "required": ["project_id"]
                }
            },
            {
                "name": "get_progress",
                "description": "Returns current numeric progress of the generation process.",
                "input_schema": {
                    "type": "object",
                    "properties": {
                        "project_id": {"type": "string", "description": "ID of the project"}
                    },
                    "required": ["project_id"]
                }
            }
        ]

    async def chat(self, messages: List[Dict[str, Any]], project_id: str) -> Dict[str, Any]:
        """Process chat message with conversation history and tool usage."""
        
        if not self.api_key:
            return {"success": False, "error": "ANTHROPIC_API_KEY not found", "messages": messages}

        for attempt in range(self.max_retries):
            try:
                response = await self.client.messages.create(
                    model=self.model,
                    max_tokens=4096,
                    temperature=0.7,
                    system=self.system_prompt,
                    messages=messages,
                    tools=self.tools
                )

                if response.stop_reason == "tool_use":
                    tool_calls = []
                    for content_block in response.content:
                        if content_block.type == "tool_use":
                            tool_calls.append({
                                "id": content_block.id,
                                "name": content_block.name,
                                "input": content_block.input
                            })
                    
                    return {
                        "success": True,
                        "type": "tool_use",
                        "tool_calls": tool_calls,
                        "assistant_message": response.content
                    }
                else:
                    text_content = ""
                    for content_block in response.content:
                        if content_block.type == "text":
                            text_content += content_block.text
                            
                    return {
                        "success": True,
                        "type": "text",
                        "content": text_content,
                        "assistant_message": response.content
                    }

            except Exception as e:
                if attempt < self.max_retries - 1:
                    await asyncio.sleep(2 ** attempt)
                    continue
                return {"success": False, "error": f"API request failed: {str(e)}"}
        
        return {"success": False, "error": "Max retries exceeded"}
