from fastapi import FastAPI, Depends, HTTPException
from pydantic import BaseModel
from backend.gemini_wrapper import GeminiWrapper
import os
from backend.config import get_muse_context
from backend.logger import log_error, get_errors, ignore_error, get_memory_usage_mb

app = FastAPI(title="ARACY Backend")

# Placeholder for actual Gemini API key retrieval, use env variable
API_KEY = os.environ.get("GEMINI_API_KEY", "demo-key")
gemini = GeminiWrapper(api_key=API_KEY)

@app.get("/health")
async def health():
    return {"status": "ok"}

from fastapi import Body

@app.post("/generate-alint")
async def generate_alint(prompt: str = Body("", embed=True)):
    """
    Generates an 'alint' using personalized core logic.
    The Muse context from .env is always injected.
    Returns a strict JSON object as per Mirror Lab codex.
    """
    try:
        result = gemini.generate_alint(prompt)
        # Try to parse result as JSON if it's a string
        import json
        try:
            return json.loads(result)
        except Exception:
            # If not valid JSON, return raw
            return {"raw": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Alint generation failed: {e}")

# ------------------- Log Management (Error/Nonconformity) -------------------

from fastapi import Query

@app.get("/api/logs/errors")
async def get_error_logs():
    """Retrieve all errors (for expert review/UI)."""
    try:
        return {"errors": get_errors()}
    except Exception as e:
        log_error(f"Failed to retrieve logs: {e}", level="CRITICAL")
        raise HTTPException(status_code=500, detail="Failed to retrieve error logs.")

@app.post("/api/logs/ignore")
async def ignore_log_entry(timestamp: str = Query(..., description="Timestamp of log to ignore")):
    """Mark a specific log entry as ignored by timestamp."""
    if not timestamp:
        raise HTTPException(status_code=400, detail="Timestamp parameter required.")
    success = ignore_error(timestamp)
    if not success:
        raise HTTPException(status_code=404, detail="Log entry not found or could not update.")
    return {"status": "ignored", "timestamp": timestamp}

# ------------------- Bond Linking -------------------

class BondLinkRequest(BaseModel):
    bond_code: str
    user_id: str  # In real flow, derive from auth

class BondLinkResponse(BaseModel):
    status: str
    bond_id: str = None
@app.get("/api/context")
async def get_context():
    """
    Returns the Muse context as provided by get_muse_context.
    Securely loads user-supplied values from .env via backend/config.py
    """
    try:
        context_data = get_muse_context()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    return context_data

@app.post("/api/bond/link", response_model=BondLinkResponse)
async def link_bond(req: BondLinkRequest):
    # TODO: Implement actual DB logic (find bond by code, associate user)
    # This is a placeholder stub for portfolio code
    if req.bond_code == "DEMO123":
        # Simulate bond found and linked
        return BondLinkResponse(status="linked", bond_id="demo-bond-id")
    raise HTTPException(status_code=404, detail="Bond code not found")

# ------------------- Resource Footprint -------------------
@app.get("/api/resource-footprint")
async def get_resource_footprint():
    """
    Returns current system/memory resource stats for The Resource Footprint plaque.
    Includes memory usage and estimated token count for AI operations.
    """
    try:
        import platform
        import psutil
        from backend.logger import estimate_token_count

        mem_mb = get_memory_usage_mb()
        cpu_percent = psutil.cpu_percent(interval=0.2)
        sys = platform.system()
        pyver = platform.python_version()
        
        # Estimate tokens from recent operations (placeholder - can be enhanced)
        # In production, track actual token usage from Gemini API responses
        estimated_tokens = 0
        try:
            errors = get_errors()
            # Rough estimate: count tokens in error messages
            for error in errors[-10:]:  # Last 10 errors
                estimated_tokens += estimate_token_count(error.get('message', ''))
        except:
            pass
        
        return {
            "memory_mb": mem_mb,
            "cpu_percent": cpu_percent,
            "estimated_tokens": estimated_tokens,
            "system": sys,
            "python_version": pyver
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to query resource stats: {e}")
