#!/usr/bin/env python3
"""
ARACY Bond Flow Verification Script
Tests the Bond ID system and data flow between endpoints.
"""

import requests
import json
import time
import sys
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    handlers=[logging.StreamHandler()]
)
logger = logging.getLogger(__name__)

# Configuration
BACKEND_URL = "http://localhost:8000"

def test_bond_flow():
    bond_code = "TEST-BOND-2026"
    user_id = "test-user-1"
    
    logger.info("=== Starting Bond Flow Verification ===")
    
    # 1. Link Bond
    logger.info(f"1. Testing Bond Linking with code: {bond_code}")
    try:
        res = requests.post(f"{BACKEND_URL}/api/bond/link", json={"bond_code": bond_code, "user_id": user_id})
        if res.status_code == 200:
            data = res.json()
            bond_id = data.get("bond_id")
            logger.info(f"✅ Bond Linked! Bond ID: {bond_id}")
        else:
            logger.error(f"❌ Bond Linking Failed: {res.status_code} - {res.text}")
            return False
    except Exception as e:
        logger.error(f"❌ Connection Error: {e}")
        return False

    # 2. Crystallize Alints (as User A)
    logger.info("2. Testing Crystallization with Bond ID")
    alints_to_crystallize = [
        {"word": "BondTest1", "meaning": "A test alint for bond verification", "language": "en", "vibe": "test"},
        {"word": "BondTest2", "meaning": "Another test alint", "language": "en", "vibe": "test"}
    ]
    
    headers = {"X-Bond-ID": bond_id}
    
    try:
        res = requests.post(f"{BACKEND_URL}/api/vault/crystallize", json={"alints": alints_to_crystallize}, headers=headers)
        if res.status_code == 200:
            logger.info("✅ Crystallization Successful")
        else:
            logger.error(f"❌ Crystallization Failed: {res.status_code} - {res.text}")
            return False
    except Exception as e:
        logger.error(f"❌ Connection Error: {e}")
        return False
        
    # 3. Fetch Partner Echoes (as User B - sharing same bond ID)
    logger.info("3. Testing Fetch Partner Echoes")
    try:
        res = requests.get(f"{BACKEND_URL}/api/ritual/echo", headers=headers)
        if res.status_code == 200:
            data = res.json()
            echoes = data.get("alints", [])
            logger.info(f"Received {len(echoes)} echoes")
            
            # Verify content
            words = [a["word"] for a in echoes]
            if "BondTest1" in words and "BondTest2" in words:
                logger.info("✅ Echoes content verified")
            else:
                logger.error(f"❌ Echoes content mismatch. Got: {words}")
                return False
        else:
            logger.error(f"❌ Fetch Echoes Failed: {res.status_code} - {res.text}")
            return False
    except Exception as e:
        logger.error(f"❌ Connection Error: {e}")
        return False

    # 4. Reflect on Alint
    logger.info("4. Testing Reflection")
    try:
        res = requests.post(f"{BACKEND_URL}/api/ritual/reflect", json={"bond_id": bond_id, "index": 0, "reflected": True}, headers=headers)
        if res.status_code == 200:
            logger.info("✅ Reflection Marked")
        else:
            logger.error(f"❌ Reflection Failed: {res.status_code} - {res.text}")
            return False
    except Exception as e:
        logger.error(f"❌ Connection Error: {e}")
        return False

    # 5. Check Reflected State
    logger.info("5. Checking Reflected State")
    try:
        res = requests.get(f"{BACKEND_URL}/api/ritual/reflected/{bond_id}")
        if res.status_code == 200:
            data = res.json()
            indices = data.get("reflected_indices", [])
            if 0 in indices:
                logger.info("✅ Reflected state verified")
            else:
                logger.error(f"❌ Reflected state mismatch. Expected 0 in {indices}")
                return False
        else:
            logger.error(f"❌ Get Reflected State Failed: {res.status_code} - {res.text}")
            return False
    except Exception as e:
        logger.error(f"❌ Connection Error: {e}")
        return False

    logger.info("=== All Bond Flow Tests Passed! ===")
    return True

if __name__ == "__main__":
    success = test_bond_flow()
    sys.exit(0 if success else 1)
