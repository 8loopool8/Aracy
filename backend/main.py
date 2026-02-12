from fastapi import FastAPI, Depends, HTTPException
from pydantic import BaseModel
from llm_wrapper import LLMWrapper
import os
from config import get_muse_context
from logger import log_error, get_errors, ignore_error, get_memory_usage_mb

app = FastAPI(title="ARACY Backend")

# Initialize LLM wrapper (uses Groq with Model Hunter)
llm = LLMWrapper()

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
        result = llm.generate_alint(prompt)
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
        from logger import estimate_token_count

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

# ------------------- The Lab: AI Generation with Custom Parameters -------------------

class LabGenerationRequest(BaseModel):
    style: str = "deep"  # silly, deep, astro, poetic, scientific
    language: str = "en"
    catalysts: list = []
    vibe: str = ""

@app.post("/api/lab/generate")
async def generate_with_lab(req: LabGenerationRequest):
    """
    Generate 19 endearments using The Lab parameters.
    Returns array of 19 alints with title, origin, reflection, interaction.
    """
    try:
        # Build custom prompt based on Lab parameters
        catalyst_text = ", ".join(req.catalysts) if req.catalysts else ""
        vibe_text = req.vibe if req.vibe else ""
        
        custom_prompt = f"""
Generate exactly 19 unique endearments/alints.

Style: {req.style}
Language: {req.language}
Catalyst Keywords: {catalyst_text}
Custom Vibe: {vibe_text}

Each alint must be a JSON object with:
- title: unique creative name
- origin: etymology/scientific basis
- reflection: personal poetic note
- interaction: quiz question or riddle

Return as JSON array of 19 objects.
"""
        
        # Generate using LLM
        result = llm.generate_alint(custom_prompt, category=req.style)
        
        import json
        try:
            parsed = json.loads(result)
            # Ensure it's an array of 19 items
            if isinstance(parsed, list) and len(parsed) == 19:
                return {"endearments": parsed}
            elif isinstance(parsed, dict) and "endearments" in parsed:
                return parsed
            else:
                # If single object returned, replicate to 19 with variations
                return {"endearments": [parsed] * 19}
        except:
            return {"endearments": [], "error": "Failed to parse LLM response"}
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lab generation failed: {e}")

# ------------------- The 19 Ritual: Reflection Tracking -------------------

@app.get("/api/ritual/reflected/{bond_id}")
async def get_reflected_state(bond_id: str):
    """Get which endearments have been reflected upon."""
    # TODO: Implement Supabase query
    # For now, return empty state
    return {"reflected_indices": []}

class ReflectRequest(BaseModel):
    bond_id: str
    index: int
    reflected: bool

@app.post("/api/ritual/reflect")
async def mark_reflected(req: ReflectRequest):
    """Mark an endearment as reflected upon."""
    # TODO: Implement Supabase update
    return {"status": "success"}

# ------------------- The Echo & Streak: Delivery & Tracking -------------------

@app.get("/api/streak/{bond_id}")
async def get_streak_data(bond_id: str):
    """Get streak count, delivery time, and heatmap data."""
    # TODO: Implement Supabase query
    # For now, return mock data
    return {
        "count": 0,
        "lastDelivery": None,
        "deliveryTime": "06:00",
        "heatmapData": []
    }

class DeliveryTimeRequest(BaseModel):
    bond_id: str
    delivery_time: str

@app.post("/api/streak/delivery-time")
async def update_delivery_time(req: DeliveryTimeRequest):
    """Update the daily delivery time."""
    # TODO: Implement Supabase update
    return {"status": "success", "delivery_time": req.delivery_time}

# ------------------- The Riddle: Quiz Generation & Badges -------------------

@app.get("/api/quiz/generate/{bond_id}")
async def generate_quiz(bond_id: str):
    """Generate quiz questions based on bond context."""
    try:
        # Get Muse context
        muse = get_muse_context()
        
        quiz_prompt = f"""
Generate 5 quiz questions about chemistry, astrology, and {muse['name']}'s profile.

Context:
- Name: {muse['name']}
- Profession: {muse['profession']}
- Traits: {muse['traits']}
- Astrology: {muse['astro_chart']}

Each question should be a JSON object with:
- question: the question text
- answers: array of 4 possible answers
- correctAnswer: index (0-3) of correct answer

Return as JSON object with "questions" array.
"""
        
        result = llm.generate_alint(quiz_prompt, category="general")
        
        import json
        try:
            parsed = json.loads(result)
            if "questions" in parsed:
                return parsed
            else:
                return {"questions": parsed if isinstance(parsed, list) else []}
        except:
            # Fallback mock quiz
            return {
                "questions": [
                    {
                        "question": f"What is {muse['name']}'s Sun sign?",
                        "answers": ["Aquarius", "Pisces", "Aries", "Taurus"],
                        "correctAnswer": 1
                    }
                ]
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Quiz generation failed: {e}")

@app.get("/api/quiz/badges/{bond_id}")
async def get_unlocked_badges(bond_id: str):
    """Get all unlocked badges for a bond."""
    # TODO: Implement Supabase query
    return {"badges": []}

class UnlockBadgeRequest(BaseModel):
    bond_id: str
    badge_id: str
    badge_name: str

@app.post("/api/quiz/unlock-badge")
async def unlock_badge(req: UnlockBadgeRequest):
    """Unlock a new badge."""
    # TODO: Implement Supabase insert
    return {"status": "success"}

class QuizResultsRequest(BaseModel):
    bond_id: str
    score: int
    total: int

@app.post("/api/quiz/save-results")
async def save_quiz_results(req: QuizResultsRequest):
    """Save quiz results."""
    # TODO: Implement Supabase insert
    return {"status": "success"}
