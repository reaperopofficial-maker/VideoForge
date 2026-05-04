import os
from fastapi import Request, HTTPException, Security
from fastapi.security import APIKeyHeader

api_key_header = APIKeyHeader(name="Authorization", auto_error=False)

async def get_current_user(request: Request, auth_header: str = Security(api_key_header)):
    # Default DEV_MODE to true if not explicitly set to false, to allow easy setup
    dev_mode_str = os.getenv("DEV_MODE", "true").lower()
    dev_mode = dev_mode_str in ("true", "1", "yes")
    
    if dev_mode:
        # Development mode: Bypass authentication
        return {"user_id": "dev_user", "role": "admin"}
        
    if not auth_header:
        raise HTTPException(status_code=401, detail="Not authenticated. Please provide Authorization header.")
        
    # Production authentication logic (e.g., verify token)
    # Placeholder for actual token verification
    if not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid auth token format. Must be Bearer token.")
        
    token = auth_header.split(" ")[1]
    
    # In a real app, verify the JWT token here
    if token == "test-token":  # Replace with actual verification
        return {"user_id": "prod_user", "role": "user"}
        
    raise HTTPException(status_code=401, detail="Invalid token")
