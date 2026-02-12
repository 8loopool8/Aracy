"""
llm_wrapper.py

LLM Integration Wrapper for ARACY (Groq Edition).
Handles dynamic prompt injection with intelligent model selection.

GAMP5 COMPLIANCE: This module receives data through function parameters only.
No hardcoded personal data. All context is injected at runtime from config.py.

Updated for 2026: Uses Groq SDK with dynamic "Model Hunter" for bulletproof model selection.
"""

from groq import Groq
from config import get_muse_context, get_api_keys
from logic_protocols.mirror_config import get_identity_prompt
import os
from datetime import datetime


def get_best_model(client):
    """
    The Model Hunter: Dynamically discovers the best available Groq model.
    
    Priority Logic:
    1. The Muse: Newest Mixtral model
    2. The Scholar: Newest Llama-3 model (8b or 70b)
    3. The Survivor: Most recent model with JSON mode support
    
    Args:
        client: Initialized Groq client
    
    Returns:
        str: Model ID to use
    """
    try:
        # Fetch all available models
        models = client.models.list()
        
        if not models or not hasattr(models, 'data'):
            raise ValueError("No models returned from Groq API")
        
        model_list = models.data
        
        # Priority 1: Find newest Mixtral model
        mixtral_models = [m for m in model_list if 'mixtral' in m.id.lower()]
        if mixtral_models:
            # Sort by created timestamp (newest first)
            mixtral_models.sort(key=lambda x: x.created if hasattr(x, 'created') else 0, reverse=True)
            selected = mixtral_models[0].id
            print(f"✧ Model Hunter: Found Mixtral (The Muse) → {selected}")
            return selected
        
        # Priority 2: Find newest Llama-3 model (8b or 70b)
        llama3_models = [m for m in model_list if 'llama-3' in m.id.lower() or 'llama3' in m.id.lower()]
        if llama3_models:
            # Prefer 70b over 8b, then sort by created timestamp
            llama3_70b = [m for m in llama3_models if '70b' in m.id.lower()]
            llama3_8b = [m for m in llama3_models if '8b' in m.id.lower()]
            
            if llama3_70b:
                llama3_70b.sort(key=lambda x: x.created if hasattr(x, 'created') else 0, reverse=True)
                selected = llama3_70b[0].id
                print(f"✧ Model Hunter: Found Llama-3 70B (The Scholar) → {selected}")
                return selected
            elif llama3_8b:
                llama3_8b.sort(key=lambda x: x.created if hasattr(x, 'created') else 0, reverse=True)
                selected = llama3_8b[0].id
                print(f"✧ Model Hunter: Found Llama-3 8B (The Scholar) → {selected}")
                return selected
        
        # Priority 3: Most recent model with JSON mode support
        # Filter models that likely support JSON mode (chat models)
        chat_models = [m for m in model_list if 'chat' in m.id.lower() or 'instruct' in m.id.lower() or 'versatile' in m.id.lower()]
        if chat_models:
            chat_models.sort(key=lambda x: x.created if hasattr(x, 'created') else 0, reverse=True)
            selected = chat_models[0].id
            print(f"✧ Model Hunter: Found recent chat model (The Survivor) → {selected}")
            return selected
        
        # Last resort: pick first available model
        if model_list:
            selected = model_list[0].id
            print(f"✧ Model Hunter: Using first available model (Emergency) → {selected}")
            return selected
        
        raise ValueError("No models available")
    
    except Exception as e:
        # Hard fallback if discovery fails
        fallback = "llama-3.3-70b-versatile"
        print(f"⚠ Model Hunter failed: {e}. Using hard fallback → {fallback}")
        return fallback


class LLMWrapper:
    """
    Flexible LLM wrapper using Groq with dynamic model selection.
    Provides fast, reliable inference with guaranteed JSON output.
    """
    
    def __init__(self, api_key=None, model=None):
        """
        Initialize the LLM wrapper with API key and optional model.
        
        Args:
            api_key: Groq API key (if None, loads from config)
            model: Model name (if None, uses Model Hunter)
        """
        # Load API key from config if not provided
        if api_key is None:
            try:
                api_keys = get_api_keys()
                api_key = api_keys.get('groq_api_key') or os.getenv('GROQ_API_KEY')
            except:
                api_key = os.getenv('GROQ_API_KEY')
        
        if not api_key:
            raise ValueError("GROQ_API_KEY not found in config or environment variables")
        
        self.api_key = api_key
        self.client = Groq(api_key=api_key)
        
        # Use Model Hunter if no model specified
        if model is None:
            self.model = get_best_model(self.client)
        else:
            self.model = model
            print(f"✧ Groq Model Selected (Manual): {model}")
    
    def generate_alint(self, prompt=None, category="general"):
        """
        Generate an 'alint' (affectionate intelligence) using the Mirror Lab engine.
        
        Args:
            prompt: Optional additional user prompt to append
            category: Type of alint (general, silly, deep, astro)
        
        Returns:
            Generated JSON string containing the alint
        """
        # Get Muse context from config
        muse = get_muse_context()
        
        # Build the identity prompt with injected data
        identity_prompt = get_identity_prompt(
            name=muse['name'],
            profession=muse['profession'],
            traits=muse['traits'],
            astro_full_chart=muse['astro_chart']
        )
        
        # Append category-specific instructions
        category_instructions = {
            "silly": "\n\nTone: Playful, whimsical, lighthearted. Include a fun chemistry pun or cosmic joke.",
            "deep": "\n\nTone: Profound, introspective, emotionally resonant. Explore the depths of connection.",
            "astro": "\n\nTone: Mystical, celestial, prophetic. Focus heavily on current astrological transits and their meaning.",
            "general": ""
        }
        
        full_prompt = identity_prompt + category_instructions.get(category, "")
        
        # Optionally append extra user prompt
        if prompt:
            full_prompt = f"{full_prompt}\n\nAdditional Context:\n{prompt}"
        
        # Generate content using Groq
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": "You are the Mirror Lab's Divine Muse Engine. You MUST respond with valid JSON only, no markdown, no code blocks, no explanations. Just pure JSON."
                    },
                    {
                        "role": "user",
                        "content": full_prompt
                    }
                ],
                response_format={"type": "json_object"},
                temperature=0.8,
                max_tokens=2048
            )
            
            # Extract text from response
            return response.choices[0].message.content
        
        except Exception as e:
            raise RuntimeError(f"Groq generation failed: {e}")
    
    def generate_bond_name(self):
        """
        Generate a mystical bond name for the couple using cosmic alchemy.
        
        Returns:
            A unique, poetic bond name (e.g., "COVALENT STARDUST")
        """
        muse = get_muse_context()
        
        prompt = f"""
Generate a mystical, unique bond name for a cosmic connection.

Context:
- Muse: {muse['name']}, {muse['profession']}
- Traits: {muse['traits']}
- Astrological Signature: {muse['astro_chart']}

Requirements:
1. Combine MOLECULAR chemistry terms with CELESTIAL imagery
2. Use 2-3 words maximum
3. Should feel like an alchemical formula or cosmic spell
4. Examples: "COVALENT STARDUST", "TRANSMUTE BOND", "NEBULA CATALYST"
5. Return ONLY the bond name, nothing else

Generate the bond name now:
"""
        
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": "You generate mystical bond names. Respond with ONLY the bond name, no explanations."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                temperature=0.9,
                max_tokens=50
            )
            
            return response.choices[0].message.content.strip().upper()
        
        except Exception as e:
            print(f"⚠ Bond name generation failed: {e}")
            return "STELLAR UNION"


def build_muse_prompt(base_prompt):
    """
    Legacy function for backward compatibility.
    Incorporates Muse context into a base prompt.
    
    Args:
        base_prompt: The base prompt to enhance with Muse context
    
    Returns:
        Enhanced prompt with Muse details prepended
    """
    muse = get_muse_context()
    muse_desc = (
        f"Muse Name: {muse['name']}\n"
        f"Birth Date: {muse['birth_date']}\n"
        f"Profession: {muse['profession']}\n"
        f"Traits: {muse['traits']}\n"
        f"Astro Chart:\n{muse['astro_chart']}\n"
    )
    return f"{muse_desc}\n{base_prompt}"


def generate_alint(name, profession, traits, astro_full_chart, category="general", prompt=None):
    """
    Standalone function to generate an alint with explicit parameters.
    This is the main export function that can be imported directly.
    
    PRIMARY: Uses Groq SDK with dynamic Model Hunter for bulletproof model selection.
    FALLBACK: Falls back to Gemini only if Groq fails completely.
    
    Args:
        name: The Muse's name
        profession: The Muse's professional identity
        traits: The Muse's personality traits and interests
        astro_full_chart: Complete formatted astrological chart
        category: Type of alint (general, silly, deep, astro)
        prompt: Optional additional user prompt
    
    Returns:
        Generated JSON string containing the alint
    """
    # Build the identity prompt with injected data
    identity_prompt = get_identity_prompt(
        name=name,
        profession=profession,
        traits=traits,
        astro_full_chart=astro_full_chart
    )
    
    # Append category-specific instructions
    category_instructions = {
        "silly": "\n\nTone: Playful, whimsical, lighthearted. Include a fun chemistry pun or cosmic joke.",
        "deep": "\n\nTone: Profound, introspective, emotionally resonant. Explore the depths of connection.",
        "astro": "\n\nTone: Mystical, celestial, prophetic. Focus heavily on current astrological transits and their meaning.",
        "general": ""
    }
    
    full_prompt = identity_prompt + category_instructions.get(category, "")
    
    # Optionally append extra user prompt
    if prompt:
        full_prompt = f"{full_prompt}\n\nAdditional Context:\n{prompt}"
    
    # PRIMARY: Try Groq with Model Hunter
    try:
        api_keys = get_api_keys()
        groq_api_key = api_keys.get('groq_api_key') or os.getenv('GROQ_API_KEY')
        
        if groq_api_key:
            print("✧ Initializing Groq with Model Hunter...")
            client = Groq(api_key=groq_api_key)
            
            # Use Model Hunter to find best available model
            model_id = get_best_model(client)
            
            response = client.chat.completions.create(
                model=model_id,
                messages=[
                    {
                        "role": "system",
                        "content": "You are the Mirror Lab's Divine Muse Engine. You MUST respond with valid JSON only, no markdown, no code blocks, no explanations. Just pure JSON."
                    },
                    {
                        "role": "user",
                        "content": full_prompt
                    }
                ],
                response_format={"type": "json_object"},
                temperature=0.8,
                max_tokens=2048
            )
            
            # Extract text from response
            return response.choices[0].message.content
    
    except Exception as groq_error:
        print(f"⚠ Groq failed: {groq_error}. Attempting Gemini fallback...")
    
    # FALLBACK: Try Gemini if Groq fails
    try:
        from google import genai
        
        api_keys = get_api_keys()
        gemini_api_key = api_keys.get('gemini_api_key') or os.getenv('GEMINI_API_KEY')
        
        if not gemini_api_key:
            raise ValueError("No API keys available (Groq or Gemini)")
        
        print("✧ Using Gemini (Fallback)")
        client = genai.Client(api_key=gemini_api_key)
        
        # Try stable Gemini models
        gemini_models = ["gemini-2.0-flash", "gemini-2.5-flash", "gemini-flash-latest"]
        
        for model_name in gemini_models:
            try:
                response = client.models.generate_content(
                    model=model_name,
                    contents=full_prompt
                )
                
                # Extract text from response
                if hasattr(response, 'text'):
                    return response.text
                elif hasattr(response, 'candidates') and response.candidates:
                    return response.candidates[0].content.parts[0].text
            
            except Exception as model_error:
                # Silently skip 429 quota errors and try next model
                if "429" in str(model_error) or "RESOURCE_EXHAUSTED" in str(model_error):
                    continue
                print(f"⚠ Gemini model {model_name} failed: {model_error}")
                continue
        
        # If all Gemini models fail
        raise RuntimeError("All Gemini models exhausted or unavailable")
    
    except Exception as gemini_error:
        raise RuntimeError(f"Both Groq and Gemini failed. Groq: {groq_error}, Gemini: {gemini_error}")


# Backward compatibility alias
GeminiWrapper = LLMWrapper
