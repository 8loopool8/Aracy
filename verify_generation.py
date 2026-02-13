#!/usr/bin/env python3
"""
ARACY Auto-Testing Script: verify_generation.py
Tests the generation endpoint to ensure it reliably produces exactly 19 alints.
Also tests the crystallization endpoint to ensure the feedback loop works.
"""

import requests
import json
import time
import sys
import re
from typing import Dict, List, Any, Optional
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    handlers=[logging.StreamHandler()]
)
logger = logging.getLogger(__name__)

# Configuration
BACKEND_URL = "http://localhost:8000"  # Update this if your backend runs on a different URL
ENDPOINT = "/api/lab/generate"
TEST_KEYWORDS = ["celestial", "ethereal", "luminous", "arcane", "ephemeral"]
REQUEST_TIMEOUT = 30  # seconds

def send_test_request(keywords: List[str]) -> Dict[str, Any]:
    """Send a test request to the generation endpoint."""
    url = f"{BACKEND_URL}{ENDPOINT}"
    payload = {
        "style": "deep",
        "language": "en",
        "catalysts": keywords,
        "vibe": "celestial"
    }
    
    logger.info(f"Sending request to {url} with keywords: {keywords}")
    start_time = time.time()
    
    try:
        logger.info("Attempting to connect to backend server...")
        response = requests.post(url, json=payload, timeout=REQUEST_TIMEOUT)
        elapsed_time = time.time() - start_time
        
        logger.info(f"Received response with status code: {response.status_code}")
        
        # Check for HTTP errors
        if response.status_code != 200:
            logger.error(f"HTTP Error: {response.status_code} - {response.text}")
            return {
                "success": False,
                "error": f"HTTP Error {response.status_code}",
                "details": response.text,
                "elapsed_time": elapsed_time
            }
        
        # Parse the response
        try:
            data = response.json()
            return {
                "success": True,
                "data": data,
                "elapsed_time": elapsed_time
            }
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse JSON response: {e}")
            return {
                "success": False,
                "error": "JSON Parse Error",
                "details": str(e),
                "elapsed_time": elapsed_time
            }
            
    except requests.exceptions.Timeout:
        logger.error(f"Request timed out after {REQUEST_TIMEOUT} seconds")
        return {
            "success": False,
            "error": "Timeout",
            "details": f"Request timed out after {REQUEST_TIMEOUT} seconds",
            "elapsed_time": time.time() - start_time
        }
    except requests.exceptions.ConnectionError:
        logger.error("Connection error - is the backend server running?")
        return {
            "success": False,
            "error": "Connection Error",
            "details": "Failed to connect to the backend server",
            "elapsed_time": time.time() - start_time
        }
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        return {
            "success": False,
            "error": "Unexpected Error",
            "details": str(e),
            "elapsed_time": time.time() - start_time
        }

def validate_alints(result: Dict[str, Any]) -> Dict[str, Any]:
    """Validate that the response contains exactly 19 alints."""
    if not result["success"]:
        return result
    
    data = result["data"]
    
    # Check if 'alints' key exists
    if "alints" not in data:
        logger.error("Response does not contain 'alints' key")
        return {
            "success": False,
            "error": "Invalid Response",
            "details": "Response does not contain 'alints' key",
            "elapsed_time": result["elapsed_time"]
        }
    
    alints = data["alints"]
    
    # Check if alints is a list
    if not isinstance(alints, list):
        logger.error("'alints' is not a list")
        return {
            "success": False,
            "error": "Invalid Response",
            "details": "'alints' is not a list",
            "elapsed_time": result["elapsed_time"]
        }
    
    # Check if there are exactly 19 alints
    if len(alints) != 19:
        logger.error(f"Expected 19 alints, but got {len(alints)}")
        return {
            "success": False,
            "error": "Invalid Alint Count",
            "details": f"Expected 19 alints, but got {len(alints)}",
            "elapsed_time": result["elapsed_time"]
        }
    
    # Check if all alints are non-empty strings
    invalid_alints = [i for i, alint in enumerate(alints) if not isinstance(alint, str) or not alint.strip()]
    if invalid_alints:
        logger.error(f"Found {len(invalid_alints)} invalid alints at indices: {invalid_alints}")
        return {
            "success": False,
            "error": "Invalid Alint Content",
            "details": f"Found {len(invalid_alints)} invalid alints",
            "elapsed_time": result["elapsed_time"]
        }
    
    # Check for hybrid generation (mix of vault and generated alints)
    vault_pattern = r"^.+\s+-\s+.+$"  # Pattern for "Word - Meaning" format
    vault_alints = [a for a in alints if re.match(vault_pattern, a)]
    generated_alints = [a for a in alints if not re.match(vault_pattern, a)]
    
    logger.info(f"Found {len(vault_alints)} alints from vault and {len(generated_alints)} generated alints")
    
    # All checks passed
    return {
        "success": True,
        "data": data,
        "elapsed_time": result["elapsed_time"],
        "alint_count": len(alints),
        "vault_count": len(vault_alints),
        "generated_count": len(generated_alints),
        "alints": alints  # Return the alints for crystallization testing
    }

def test_crystallize_endpoint(alints: List[str]) -> bool:
    """Test the crystallize endpoint."""
    logger.info("Testing crystallization endpoint...")
    
    # Create sample alints to crystallize
    sample_alints = []
    
    # Process the first 3 alints from the generation result
    for alint in alints[:3]:
        if " - " in alint:
            word, meaning = alint.split(" - ", 1)
            sample_alints.append({
                "word": word,
                "meaning": meaning,
                "language": "English",
                "vibe": "Deep"
            })
    
    # If we couldn't parse any alints, use some defaults
    if not sample_alints:
        sample_alints = [
            {
                "word": "Serendipity",
                "meaning": "The occurrence of events by chance in a happy or beneficial way",
                "language": "English",
                "vibe": "Poetic"
            },
            {
                "word": "Ephemeral",
                "meaning": "Lasting for a very short time",
                "language": "English",
                "vibe": "Deep"
            }
        ]
    
    url = f"{BACKEND_URL}/api/vault/crystallize"
    
    try:
        logger.info(f"Sending crystallization request to {url}")
        response = requests.post(
            url,
            json={"alints": sample_alints},
            timeout=REQUEST_TIMEOUT
        )
        
        if response.status_code != 200:
            logger.error(f"HTTP Error: {response.status_code} - {response.text}")
            return False
        
        result = response.json()
        logger.info(f"Crystallization result: {result}")
        
        if result.get("status") == "success":
            logger.info(f"✅ Crystallization test PASSED! {result.get('crystallized_count', 0)} alints crystallized")
            return True
        else:
            logger.error(f"❌ Crystallization test FAILED: {result}")
            return False
            
    except Exception as e:
        logger.error(f"Error testing crystallization endpoint: {str(e)}")
        return False

def run_test() -> bool:
    """Run the test and return True if it passes, False otherwise."""
    logger.info("Starting verification test...")
    
    # Send the test request
    result = send_test_request(TEST_KEYWORDS)
    
    # Validate the response
    validation = validate_alints(result)
    
    generation_success = False
    if validation["success"]:
        logger.info(f"✅ Test PASSED! Generated exactly 19 alints in {validation['elapsed_time']:.2f} seconds")
        logger.info(f"✅ Hybrid Generation: {validation.get('vault_count', 0)} from vault, {validation.get('generated_count', 0)} newly generated")
        
        # Display the first 3 alints as a sample
        alints = validation["data"]["alints"]
        logger.info("Sample of generated alints:")
        for i, alint in enumerate(alints[:3]):
            logger.info(f"  {i+1}. {alint}")
        logger.info(f"  ... plus {len(alints) - 3} more")
        
        generation_success = True
        
        # Test the crystallization endpoint with the generated alints
        crystallization_success = test_crystallize_endpoint(alints)
    else:
        logger.error(f"❌ Generation test FAILED: {validation['error']} - {validation['details']}")
        return False
    
    # Overall success requires both tests to pass
    return generation_success and crystallization_success

if __name__ == "__main__":
    success = run_test()
    sys.exit(0 if success else 1)