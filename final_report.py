#!/usr/bin/env python3
import json

# Load the alints vault
with open('backend/alints_vault.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# Print the total count
print(f'TOTAL ALINTS IN VAULT: {len(data["alints"])}')