# Contributing to Aracy — Expanding the Laws of Affection

Welcome, fellow Alchemist! Aracy invites you to weave new languages, cultures, and modes of affection into its constellation.

## Affection Laws

Each "Affection Law" is a modular piece of logic (typically a Python class or JS module) that governs how "alints" are invented or understood in a given language, culture, or ritual. These can range from new Gemini-based prompts to handcrafted modules that pull from folklore, linguistics, or pop culture.

### To Add a New Law:

1. **Backend (FastAPI Python):**
   - Create a new module in `backend/affection_laws/` (e.g., `kiss.py`, `kanji_love.py`).
   - Inherit from a standard interface (see examples in `affection_laws/base.py` if present).
   - Implement a method: `generate_alint(input: dict) -> str`
   - Register the law in the backend's routing or law registry.

2. **Frontend (React/JS):**
   - Extend components in `src/components/` if user input or special display is needed for new modules.
   - Integrate the new law via API endpoints or direct logic where relevant.

### Example Structure:
```python
# backend/affection_laws/goth_poetry.py

class GothPoetryLaw:
    name = "Goth Poetry"

    def generate_alint(self, input):
        # custom logic
        pass
```
### Adding Language or Culture Modules

- Reference local idioms, names, or rituals with care.
- Validate outputs for appropriateness and inclusivity: Aracy celebrates ALL forms of healthy affection.
- Add your signature to new modules! Each law is a tribute.

## Submitting a Pull Request

- Include meaningful tests, and poetic docstrings where you can.
- Describe your law and its intended cultural effect in the PR description.

## Community

- Play nice—Alchemists and Muses work with reverence.
- We welcome inspiration from all backgrounds: linguists, poets, coders, lovers.

---

_To leave a law is to leave a light._