import os
import json
import asyncio
from typing import Dict, Any
from anthropic import AsyncAnthropic

class CharacterAgent:
    def __init__(self):
        self.api_key = os.getenv("ANTHROPIC_API_KEY")
        self.client = AsyncAnthropic(api_key=self.api_key or "")
        self.model = "claude-haiku-4-5"
        self.max_retries = 3

    async def generate_characters(self, script_json: Dict[str, Any]) -> Dict[str, Any]:
        """Extract character designs from JSON script."""
        
        if not self.api_key:
            return {"success": False, "error": "ANTHROPIC_API_KEY not found"}

        system_prompt = """You are an expert character designer and concept artist.
Analyze the provided JSON script and output a detailed character design JSON.
Return ONLY valid JSON. No markdown formatting, no extra text.

OUTPUT FORMAT:
{
  "characters": [
    {
      "id": "char_1",
      "name": "Character Name",
      "role": "protagonist/antagonist/supporting",
      "age": "25",
      "appearance": "Physical description detail mein",
      "personality": "Character traits",
      "costume": "Kapde ka description",
      "image_prompt": "Detailed GeminiGen.ai prompt for character design - full body, white background, anime/realistic style",
      "reference_prompt": "Short prompt for consistency in scenes"
    }
  ]
}

RULES:
- ONLY output valid JSON.
- image_prompt MUST be photorealistic or cinematic for GeminiGen.ai.
- reference_prompt must be kept short to maintain consistency across scenes.
"""

        prompt = f"Extract and design characters from this script:\n\n{json.dumps(script_json, indent=2)}"

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
