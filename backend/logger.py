import psutil
import os
import logging
import json
from datetime import datetime
from typing import List, Dict

logging.basicConfig(
    format="%(asctime)s | %(levelname)s | %(message)s", level=logging.INFO
)

ERROR_LOG_PATH = os.path.join(os.path.dirname(__file__), "error_log.json")

def log_error(message: str, level: str = "ERROR"):
    """Logs an error event to error_log.json with ignore status"""
    entry = {
        "timestamp": datetime.now().isoformat(timespec='seconds'),
        "level": level,
        "message": message,
        "ignored": False,
    }
    # Append entry to JSON file
    try:
        if os.path.exists(ERROR_LOG_PATH):
            with open(ERROR_LOG_PATH, "r", encoding="utf-8") as f:
                logs = json.load(f)
        else:
            logs = []
        logs.append(entry)
        with open(ERROR_LOG_PATH, "w", encoding="utf-8") as f:
            json.dump(logs, f, indent=2)
    except Exception as e:
        logging.error(f"Failed to log error: {e}")

def get_errors() -> List[Dict]:
    """Retrieve all errors/logs"""
    try:
        if os.path.exists(ERROR_LOG_PATH):
            with open(ERROR_LOG_PATH, "r", encoding="utf-8") as f:
                return json.load(f)
        else:
            return []
    except Exception as e:
        logging.error(f"Failed to load errors: {e}")
        return []

def ignore_error(timestamp: str) -> bool:
    """Set ignored=True for the log entry with the matching timestamp."""
    try:
        logs = get_errors()
        updated = False
        for entry in logs:
            if entry.get("timestamp") == timestamp:
                entry["ignored"] = True
                updated = True
        if updated:
            with open(ERROR_LOG_PATH, "w", encoding="utf-8") as f:
                json.dump(logs, f, indent=2)
        return updated
    except Exception as e:
        logging.error(f"Failed to ignore error: {e}")
        return False

def get_memory_usage_mb() -> float:
    """Returns current process memory usage in MB."""
    process = psutil.Process(os.getpid())
    mem = process.memory_info().rss / (1024 * 1024)
    return round(mem, 2)


def estimate_token_count(text: str) -> int:
    """Estimates 'token' count in the given text. Placeholder for real tokenizer."""
    return len(text.strip().split())


def log_resource_footprint(text: str = ""):
    mem = get_memory_usage_mb()
    tokens = estimate_token_count(text)
    logging.info(f"[Resource Footprint] Memory: {mem}MB | Tokens: {tokens}")


if __name__ == "__main__":
    # Quick demo/test
    s = "Example text with a few tokens."
    log_resource_footprint(s)