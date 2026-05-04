import os
import json
import asyncio
from typing import Dict, Any
from anthropic import AsyncAnthropic

class ScriptAgent:
    def __init__(self):
        self.api_key = os.getenv("ANTHROPIC_API_KEY")
        self.client = AsyncAnthropic(api_key=self.api_key or "")
        self.model = "claude-haiku-4-5" # Using exactly as requested, though standard is claude-3-5-haiku-latest
        self.max_retries = 3

    async def generate_script(self, novel_text: str) -> Dict[str, Any]:
        """Generate a JSON script from novel text."""
        
        if not self.api_key:
            return {"success": False, "error": "ANTHROPIC_API_KEY not found"}

        system_prompt = """You are a master screenwriter and director.
You must take the completely raw novel/story text and convert it into a structured JSON script.
Return ONLY valid JSON. No markdown formatting, no extra text.

OUTPUT FORMAT:
{
  "title": "Novel ka title",
  "total_scenes": 10,
  "estimated_duration": 50,
  "scenes": [
    {
      "id": "scene_1",
      "episode": 1,
      "sequence": 1,
      "description": "Scene ka description",
      "characters": ["Character 1", "Character 2"],
      "dialogue": "Scene mein kya bola gaya",
      "mood": "dramatic/happy/sad/action",
      "location": "Kahan ho raha hai",
      "image_prompt": "Detailed GeminiGen.ai image prompt - cinematic, detailed, 9:16 aspect ratio",
      "video_prompt": "Detailed GeminiGen.ai video prompt - camera movement, action description",
      "duration": 5
    }
  ]
}

RULES:
- ONLY output valid JSON.
- image_prompt must be highly detailed and cinematic for GeminiGen.ai.
- video_prompt must describe camera movements and action clearly.
- duration is in seconds (default 5).
"""

        prompt = f"Convert the following novel text into a JSON script:\n\n{novel_text}"

        for attempt in range(self.max_retries):
            try:
                response = await self.client.messages.create(
                    model=self.model,
                    max_tokens=4096,
                    temperature=0.7,
                    system=system_prompt,
                    messages=[
                        {"role": "user", "content": prompt}
                    ]
                )
                
                content = response.content[0].text
                
                # Cleanup potential markdown ticks if Claude still adds them
                if content.startswith("```json"):
                    content = content[7:]
                if content.startswith("```"):
                    content = content[3:]
                if content.endswith("```"):
                    content = content[:-3]
                
                content = content.strip()
                
                parsed_json = json.loads(content)
                return {
                    "success": True,
                    "data": parsed_json
                }

            except json.JSONDecodeError as e:
                if attempt < self.max_retries - 1:
                    await asyncio.sleep(2 ** attempt)
                    continue
                return {"success": False, "error": f"JSON parsing failed: {str(e)}", "raw_content": content}
            
            except Exception as e:
                if attempt < self.max_retries - 1:
                    await asyncio.sleep(2 ** attempt)
                    continue
                return {"success": False, "error": f"API request failed: {str(e)}"}
        
        return {"success": False, "error": "Max retries exceeded"}
