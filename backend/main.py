from fastapi import FastAPI, Depends, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from llm_wrapper import LLMWrapper
import os
import re
import random
import json
import datetime
from typing import List, Dict
from config import get_muse_context
from logger import log_error, get_errors, ignore_error, get_memory_usage_mb

app = FastAPI(title="ARACY Backend")

# CORS Configuration - Allow frontend to connect from both local and production origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://aracy-ui.onrender.com",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize LLM wrapper (uses Groq with Model Hunter)
llm = LLMWrapper()

# Load alints vault
ALINTS_VAULT_PATH = os.path.join(os.path.dirname(__file__), "alints_vault.json")

def load_alints_vault():
    """Load the alints vault from JSON file."""
    try:
        if os.path.exists(ALINTS_VAULT_PATH):
            with open(ALINTS_VAULT_PATH, "r", encoding="utf-8") as f:
                return json.load(f)
        else:
            log_error(f"Alints vault not found at {ALINTS_VAULT_PATH}")
            return {"alints": []}
    except Exception as e:
        log_error(f"Error loading alints vault: {str(e)}")
        return {"alints": []}

def save_alint_to_vault(alint, crystallized=False):
    """
    Save a new alint to the vault.
    
    Args:
        alint: The alint to save
        crystallized: Whether this alint was manually selected by the user
    """
    try:
        vault = load_alints_vault()
        
        # Check if alint already exists in vault
        existing_words = [a["word"].lower() for a in vault["alints"]]
        if alint["word"].lower() not in existing_words:
            # Add crystallized flag if provided
            if crystallized:
                alint["crystallized"] = True
                alint["crystallized_date"] = datetime.datetime.now().isoformat()
            
            vault["alints"].append(alint)
            
            with open(ALINTS_VAULT_PATH, "w", encoding="utf-8") as f:
                json.dump(vault, f, indent=2, ensure_ascii=False)
            
            log_error(f"Alint '{alint['word']}' added to vault" + (" (crystallized)" if crystallized else ""), level="INFO")
            return True
        elif crystallized:
            # If alint exists but is now being crystallized, update it
            for existing_alint in vault["alints"]:
                if existing_alint["word"].lower() == alint["word"].lower():
                    existing_alint["crystallized"] = True
                    existing_alint["crystallized_date"] = datetime.datetime.now().isoformat()
                    
                    with open(ALINTS_VAULT_PATH, "w", encoding="utf-8") as f:
                        json.dump(vault, f, indent=2, ensure_ascii=False)
                    
                    log_error(f"Existing alint '{alint['word']}' marked as crystallized", level="INFO")
                    return True
        return False
    except Exception as e:
        log_error(f"Error saving alint to vault: {str(e)}")
        return False

# Load the vault on startup
alints_vault = load_alints_vault()

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
    
    Uses a hybrid approach:
    - 40% (8 alints) from the vault
    - 60% (11 alints) generated by Claude 3.7
    """
    try:
        # Build custom prompt based on Lab parameters
        catalyst_text = ", ".join(req.catalysts) if req.catalysts else ""
        vibe_text = req.vibe if req.vibe else ""
        style = req.style.lower() if req.style else "deep"
        language = req.language.lower() if req.language else "en"
        
        # Step 1: Get alints from the vault (40% - approximately 8 alints)
        vault_alints = []
        
        # Reload the vault to get the latest entries
        global alints_vault
        alints_vault = load_alints_vault()
        
        # Filter by style/vibe if possible
        matching_alints = [
            a for a in alints_vault["alints"] 
            if style in a.get("vibe", "").lower() or 
               style in a.get("word", "").lower() or
               style in a.get("meaning", "").lower()
        ]
        
        # Give higher weight to crystallized alints
        crystallized_alints = [a for a in matching_alints if a.get("crystallized", False)]
        non_crystallized_alints = [a for a in matching_alints if not a.get("crystallized", False)]
        
        # If we have crystallized alints, ensure they make up at least half of our selection if possible
        if crystallized_alints:
            # Determine how many crystallized alints to include (up to 4, or half of what we need)
            crystallized_count = min(len(crystallized_alints), 4)
            
            # Select crystallized alints first
            selected_crystallized = random.sample(crystallized_alints, crystallized_count)
            
            # Then select from non-crystallized to fill the rest
            remaining_needed = 8 - crystallized_count
            if remaining_needed > 0 and non_crystallized_alints:
                selected_non_crystallized = random.sample(
                    non_crystallized_alints, 
                    min(remaining_needed, len(non_crystallized_alints))
                )
                matching_alints = selected_crystallized + selected_non_crystallized
            else:
                matching_alints = selected_crystallized
        
        # If we have language preference, try to filter by that too
        if language != "en":
            language_matches = [
                a for a in matching_alints
                if language in a.get("language", "").lower()
            ]
            if language_matches:
                matching_alints = language_matches
        
        # If we don't have enough matching alints, use any from the vault
        if len(matching_alints) < 8:
            additional_needed = 8 - len(matching_alints)
            non_matching = [a for a in alints_vault["alints"] if a not in matching_alints]
            if non_matching:
                matching_alints.extend(random.sample(non_matching, min(additional_needed, len(non_matching))))
        
        # Select 8 random alints from the matching ones (or fewer if we don't have 8)
        if matching_alints:
            vault_alints = random.sample(matching_alints, min(8, len(matching_alints)))
        
        # Convert vault alints to simple strings
        vault_alint_strings = [a["word"] + " - " + a["meaning"] for a in vault_alints]
        
        # Step 2: Generate the remaining alints using Claude 3.7
        num_to_generate = 19 - len(vault_alint_strings)
        
        # Sophisticated system instruction for Claude 3.7 Sonnet
        system_instruction = """
        You are a Celestial Etymologist - a master of rare linguistic alchemy who crafts exquisite 'alints' (affectionate linguistic treasures).
        
        Your alints blend:
        1. Archaic Romanian/Latin roots with scientific elegance
        2. Poetic depth with cosmic imagery
        3. Emotional resonance with philosophical insight
        
        Each alint must be a single sentence, rare in construction yet clear in meaning.
        """
        
        user_message = f"""
Create exactly {num_to_generate} unique endearments/alints.

Style: {style}
Language: {language}
Catalyst Keywords: {catalyst_text}
Custom Vibe: {vibe_text}

Each alint should be in the format: "Word - Meaning"
Where "Word" is the endearment term and "Meaning" is its poetic definition.

Return as an array of {num_to_generate} strings.
"""
        
        # Implement retry logic
        max_retries = 3
        generated_alints = []
        
        for attempt in range(max_retries):
            try:
                # Generate using LLM
                result = llm.generate_alint(system_instruction + "\n\n" + user_message, category=style)
                
                try:
                    # Try to parse as JSON first
                    parsed = json.loads(result)
                    
                    # Handle different response formats
                    if isinstance(parsed, list):
                        generated_alints = parsed
                    elif isinstance(parsed, dict) and "alints" in parsed:
                        generated_alints = parsed["alints"]
                    elif isinstance(parsed, dict) and "endearments" in parsed:
                        generated_alints = parsed["endearments"]
                    else:
                        # Extract text lines if not in expected format
                        generated_alints = []
                        for line in result.strip().split('\n'):
                            line = line.strip()
                            # Remove numbering if present
                            if line and (line[0].isdigit() or line[0] == '-'):
                                line = re.sub(r'^\d+[\.\)-]\s*|-\s*', '', line).strip()
                            if line:
                                generated_alints.append(line)
                    
                    # Validate we have enough generated alints
                    if len(generated_alints) >= num_to_generate:
                        generated_alints = generated_alints[:num_to_generate]
                        break
                    
                    # If we don't have enough, log and retry
                    log_error(f"Generated {len(generated_alints)} alints instead of {num_to_generate} on attempt {attempt+1}. Retrying...")
                    
                except json.JSONDecodeError:
                    # If not valid JSON, try to extract lines
                    generated_alints = []
                    for line in result.strip().split('\n'):
                        line = line.strip()
                        # Remove numbering if present
                        if line and (line[0].isdigit() or line[0] == '-'):
                            line = re.sub(r'^\d+[\.\)-]\s*|-\s*', '', line).strip()
                        if line:
                            generated_alints.append(line)
                    
                    # Validate we have enough generated alints
                    if len(generated_alints) >= num_to_generate:
                        generated_alints = generated_alints[:num_to_generate]
                        break
                    
                    # If we don't have enough, log and retry
                    log_error(f"Generated {len(generated_alints)} alints instead of {num_to_generate} on attempt {attempt+1}. Retrying...")
            
            except Exception as e:
                log_error(f"Error on attempt {attempt+1}: {str(e)}")
                if attempt == max_retries - 1:
                    raise
        
        # Step 3: Combine vault alints and generated alints
        all_alints = vault_alint_strings + generated_alints
        
        # Step 4: Ensure we have exactly 19 alints
        if len(all_alints) < 19:
            # If we don't have enough, pad with generic ones
            generic_alints = [
                "Lumière - The light that guides my soul through darkness",
                "Serendipity - The fortunate accident of finding you when I wasn't looking",
                "Ethereal - Delicate and light in a way that seems too perfect for this world",
                "Ineffable - Too great to be expressed in words",
                "Quintessence - The most perfect embodiment of something"
            ]
            while len(all_alints) < 19 and generic_alints:
                all_alints.append(generic_alints.pop(0))
                
        # If we still don't have 19, duplicate some
        while len(all_alints) < 19:
            all_alints.append(random.choice(all_alints))
            
        # If we have more than 19, truncate
        all_alints = all_alints[:19]
        
        # Step 5: Save exceptional new alints to the vault
        for alint_str in generated_alints:
            # Only process properly formatted alints
            if " - " in alint_str:
                word, meaning = alint_str.split(" - ", 1)
                
                # Check if this is a high-quality alint worth saving
                if len(word) > 3 and len(meaning) > 15:
                    new_alint = {
                        "word": word.strip(),
                        "meaning": meaning.strip(),
                        "language": language,
                        "vibe": style
                    }
                    save_alint_to_vault(new_alint)
        
        return {"alints": all_alints}
    
    except Exception as e:
        log_error(f"Lab generation failed: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={"error": f"Failed to generate alints: {str(e)}"}
        )

# ------------------- Alints Vault Management -------------------

class CrystallizeRequest(BaseModel):
    alints: List[Dict[str, str]]

@app.post("/api/vault/crystallize")
async def crystallize_alints(req: CrystallizeRequest):
    """
    Crystallize selected alints by adding them to the vault.
    This endpoint receives alints that have been manually selected by the user
    and marks them as 'crystallized' in the vault.
    """
    try:
        if not req.alints:
            return JSONResponse(
                status_code=400,
                content={"error": "No alints provided for crystallization"}
            )
        
        crystallized_count = 0
        for alint_data in req.alints:
            # Validate required fields
            if not all(key in alint_data for key in ["word", "meaning"]):
                continue
                
            # Create alint object
            alint = {
                "word": alint_data["word"],
                "meaning": alint_data["meaning"],
                "language": alint_data.get("language", "Unknown"),
                "vibe": alint_data.get("vibe", "Deep")
            }
            
            # Save to vault with crystallized flag
            if save_alint_to_vault(alint, crystallized=True):
                crystallized_count += 1
        
        return {
            "status": "success", 
            "message": f"Crystallized {crystallized_count} alints",
            "crystallized_count": crystallized_count
        }
    
    except Exception as e:
        log_error(f"Error crystallizing alints: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={"error": f"Failed to crystallize alints: {str(e)}"}
        )

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