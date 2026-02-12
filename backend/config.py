"""
config.py

Configuration module for ARACY backend.
Loads environment variables from .env and provides structured access to Muse context.

GAMP5 COMPLIANCE: This is the ONLY module that reads personal data from .env.
All other modules receive data through function parameters, ensuring traceability.
"""

import os
import re
from dotenv import load_dotenv

# Load .env on module import
dotenv_path = os.path.join(os.path.dirname(__file__), '.env')
load_dotenv(dotenv_path)

# Security & API Configuration
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY', '')
SUPABASE_URL = os.getenv('SUPABASE_URL', '')
SUPABASE_KEY = os.getenv('SUPABASE_KEY', '')

# Muse Personal Data (loaded from .env)
MUSE_NAME = os.getenv('MUSE_NAME', '')
MUSE_BIRTH_DATE = os.getenv('MUSE_BIRTH_DATE', '')
MUSE_TRAITS = os.getenv('MUSE_TRAITS', '')

# Astrological Chart Components
ASTRO_SUN = os.getenv('ASTRO_SUN', '')
ASTRO_MOON = os.getenv('ASTRO_MOON', '')
ASTRO_ASC = os.getenv('ASTRO_ASC', '')
ASTRO_MERCURY = os.getenv('ASTRO_MERCURY', '')
ASTRO_VENUS = os.getenv('ASTRO_VENUS', '')
ASTRO_MARS = os.getenv('ASTRO_MARS', '')
ASTRO_JUPITER = os.getenv('ASTRO_JUPITER', '')
ASTRO_SATURN = os.getenv('ASTRO_SATURN', '')
ASTRO_URANUS = os.getenv('ASTRO_URANUS', '')
ASTRO_NEPTUNE = os.getenv('ASTRO_NEPTUNE', '')
ASTRO_PLUTO = os.getenv('ASTRO_PLUTO', '')


def extract_profession(traits: str) -> str:
    """
    Extracts the profession from the traits string.
    Assumes profession is the first phrase before a comma or parenthesis.
    
    Args:
        traits: Full traits string from .env
    
    Returns:
        Extracted profession string
    """
    if not traits:
        return ""
    # Match everything before the first comma or opening parenthesis
    match = re.match(r'^([^,(]+)', traits)
    return match.group(1).strip() if match else ""


def format_astro_chart() -> str:
    """
    Formats the complete astrological chart into a readable string.
    Identifies and highlights stelliums (3+ planets in same sign).
    
    Returns:
        Formatted astrological chart string with stellium annotations
    """
    chart_lines = [
        f"    Sun: {ASTRO_SUN}",
        f"    Moon: {ASTRO_MOON}",
        f"    Ascendant: {ASTRO_ASC}",
        f"    Mercury: {ASTRO_MERCURY}",
        f"    Venus: {ASTRO_VENUS}",
        f"    Mars: {ASTRO_MARS}",
        f"    Jupiter: {ASTRO_JUPITER}",
        f"    Saturn: {ASTRO_SATURN}",
        f"    Uranus: {ASTRO_URANUS}",
        f"    Neptune: {ASTRO_NEPTUNE}",
        f"    Pluto: {ASTRO_PLUTO}",
    ]
    
    # Detect Aquarius Stellium (Mercury, Uranus, Neptune in Aquarius)
    aquarius_count = sum([
        'Aquarius' in ASTRO_MERCURY,
        'Aquarius' in ASTRO_URANUS,
        'Aquarius' in ASTRO_NEPTUNE
    ])
    
    chart_text = "\n".join(chart_lines)
    
    if aquarius_count >= 3:
        chart_text += "\n\n    ✧ AQUARIUS STELLIUM (Mercury, Uranus, Neptune in Aquarius) ✧"
        chart_text += "\n    Signature: Scientific intuition, prophetic dreams, revolutionary thinking, cosmic connection."
    
    # Highlight Venus in Pisces if present
    if 'Pisces' in ASTRO_VENUS:
        chart_text += "\n\n    ✧ Venus in Pisces: Transcendent love, artistic soul, boundless compassion."
    
    return chart_text


def get_muse_context() -> dict:
    """
    Returns a complete dictionary of all Muse context data.
    This is the primary interface for accessing Muse information throughout the application.
    
    Returns:
        Dictionary containing:
            - name: Muse's name
            - birth_date: Birth date and time
            - profession: Extracted profession
            - traits: Full traits description
            - astro: Dictionary of individual astrological placements
            - astro_chart: Formatted complete chart string
    """
    profession = extract_profession(MUSE_TRAITS)
    
    return {
        'name': MUSE_NAME,
        'birth_date': MUSE_BIRTH_DATE,
        'profession': profession,
        'traits': MUSE_TRAITS,
        'astro': {
            'sun': ASTRO_SUN,
            'moon': ASTRO_MOON,
            'ascendant': ASTRO_ASC,
            'mercury': ASTRO_MERCURY,
            'venus': ASTRO_VENUS,
            'mars': ASTRO_MARS,
            'jupiter': ASTRO_JUPITER,
            'saturn': ASTRO_SATURN,
            'uranus': ASTRO_URANUS,
            'neptune': ASTRO_NEPTUNE,
            'pluto': ASTRO_PLUTO,
        },
        'astro_chart': format_astro_chart()
    }


def get_api_keys() -> dict:
    """
    Returns API keys and credentials for external services.
    
    Returns:
        Dictionary containing API keys for Gemini and Supabase
    """
    return {
        'gemini_api_key': GEMINI_API_KEY,
        'supabase_url': SUPABASE_URL,
        'supabase_key': SUPABASE_KEY
    }
