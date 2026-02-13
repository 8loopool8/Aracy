#!/usr/bin/env python3
import json

# Load all files
with open('backend/alints_vault.json', 'r', encoding='utf-8') as f:
    main = json.load(f)

with open('backend/alints_vault_batch1.json', 'r', encoding='utf-8') as f:
    batch1 = json.load(f)

with open('backend/alints_vault_batch2.json', 'r', encoding='utf-8') as f:
    batch2 = json.load(f)

with open('backend/alints_vault_batch3.json', 'r', encoding='utf-8') as f:
    batch3 = json.load(f)

with open('backend/alints_vault_batch4.json', 'r', encoding='utf-8') as f:
    batch4 = json.load(f)

with open('backend/alints_vault_batch5.json', 'r', encoding='utf-8') as f:
    batch5 = json.load(f)

with open('backend/alints_vault_batch6.json', 'r', encoding='utf-8') as f:
    batch6 = json.load(f)

with open('backend/alints_vault_batch7.json', 'r', encoding='utf-8') as f:
    batch7 = json.load(f)

with open('backend/alints_vault_batch8.json', 'r', encoding='utf-8') as f:
    batch8 = json.load(f)

with open('backend/alints_vault_batch9.json', 'r', encoding='utf-8') as f:
    batch9 = json.load(f)

with open('backend/alints_vault_batch10.json', 'r', encoding='utf-8') as f:
    batch10 = json.load(f)

# Extend the main alints list with entries from new batches only
# (batch1, batch2, and batch3 are already in the main file)
main['alints'].extend(batch4['alints'])
main['alints'].extend(batch5['alints'])
main['alints'].extend(batch6['alints'])
main['alints'].extend(batch7['alints'])
main['alints'].extend(batch8['alints'])
main['alints'].extend(batch9['alints'])
main['alints'].extend(batch10['alints'])

# Save the merged file
with open('backend/alints_vault.json', 'w', encoding='utf-8') as f:
    json.dump(main, f, indent=2, ensure_ascii=False)

# Print the total count
print(f'Total entries in merged file: {len(main["alints"])}')