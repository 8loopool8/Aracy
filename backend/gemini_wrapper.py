"""
gemini_wrapper.py

Gemini AI Integration Wrapper for ARACY.
Handles flexible model selection and dynamic prompt injection.

GAMP5 COMPLIANCE: This module receives data through function parameters only.
No hardcoded personal data. All context is injected at runtime from config.py.
"""

import google.generativeai as genai
from config import get_muse_context, get_api_keys
from logic_protocols.mirror_config import get_identity_prompt


class GeminiWrapper:
    """
    Flexible Gemini AI wrapper with automatic model fallback.
    Tries latest models first, falls back to stable versions if unavailable.
    """
    
    def __init__(self, api_key=None, preferred_models=None):
        """
        Initialize the Gemini wrapper with API key and model preferences.
        
        Args:
            api_key: Gemini API key (if None, loads from config)
            preferred_models: List of model names to try in order
        """
        if preferred_models is None:
            preferred_models = [
                "gemini-2.0-flash-exp",
                "gemini-2.0-flash-thinking-exp",
                "gemini-1.5-pro-latest",
                "gemini-1.5-pro",
                "gemini-1.5-flash",
                "gemini-pro",
            ]
        
        # Load API key from config if not provided
        if api_key is None:
            api_keys = get_api_keys()
            api_key = api_keys['gemini_api_key']
        
        self.api_key = api_key
        self.preferred_models = preferred_models
        self.available_model = None
        self._init_model()
    
    def _init_model(self):
        """
        Initialize and select the best available Gemini model.
        Tries each preferred model in order until one is available.
        """
        genai.configure(api_key=self.api_key)
        
        try:
            # Get list of available models
            available_models = genai.list_models()
            available_names = {model.name for model in available_models}
            
            # Try each preferred model in order
            for preferred in self.preferred_models:
                # Check if this model is available (partial match)
                for available in available_names:
                    if preferred in available:
                        self.available_model = preferred
                        print(f"✧ Gemini Model Selected: {preferred}")
                        return
            
            # If no preferred model found, use first available generative model
            for model in available_models:
                if 'generateContent' in model.supported_generation_methods:
                    self.available_model = model.name.split('/')[-1]
                    print(f"✧ Gemini Model Selected (fallback): {self.available_model}")
                    return
            
            raise RuntimeError("No compatible Gemini models available.")
        
        except Exception as e:
            # If listing fails, try the first preferred model directly
            print(f"⚠ Model listing failed: {e}. Attempting direct connection...")
            self.available_model = self.preferred_models[0]
    
    def generate_alint(self, prompt=None, category="general"):
        """
        Generate an 'alint' (affectionate intelligence) using the Mirror Lab engine.
        
        Args:
            prompt: Optional additional user prompt to append
            category: Type of alint (general, silly, deep, astro)
        
        Returns:
            Generated JSON string containing the alint
        """
        if not self.available_model:
            raise RuntimeError("No Gemini model initialized.")
        
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
        
        # Generate content
        try:
            model = genai.GenerativeModel(self.available_model)
            response = model.generate_content(full_prompt)
            
            # Extract text from response
            if hasattr(response, 'text'):
                return response.text
            elif hasattr(response, 'parts'):
                return ''.join(part.text for part in response.parts)
            else:
                return str(response)
        
        except Exception as e:
            raise RuntimeError(f"Gemini generation failed: {e}")
    
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
            model = genai.GenerativeModel(self.available_model)
            response = model.generate_content(prompt)
            
            if hasattr(response, 'text'):
                return response.text.strip().upper()
            else:
                return "COSMIC BOND"
        
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
    # Get API key from config
    api_keys = get_api_keys()
    api_key = api_keys['gemini_api_key']
    
    # Configure Gemini
    genai.configure(api_key=api_key)
    
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
    
    # Try models in order of preference (updated for 2026 API)
    preferred_models = [
        "models/gemini-2.5-flash",
        "models/gemini-2.5-pro",
        "models/gemini-2.0-flash",
        "models/gemini-flash-latest",
        "models/gemini-pro-latest",
    ]
    
    for model_name in preferred_models:
        try:
            model = genai.GenerativeModel(model_name)
            response = model.generate_content(full_prompt)
            
            # Extract text from response
            if hasattr(response, 'text'):
                return response.text
            elif hasattr(response, 'parts'):
                return ''.join(part.text for part in response.parts)
            else:
                return str(response)
        
        except Exception as e:
            print(f"⚠ Model {model_name} failed: {e}. Trying next...")
            continue
    
    # If all models fail
    raise RuntimeError("All Gemini models failed to generate content.")
