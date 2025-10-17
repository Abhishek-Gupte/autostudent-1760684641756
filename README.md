# AutoStudent — Captcha Solver Demo

**Round:** 1 → 2 capable  
**What it does:** Receives a task JSON, verifies secret, generates a static page in `docs/` that loads a captcha image from `?url=...` (or sample) and uses Tesseract.js to OCR within ~15s.  
**Deploy:** GitHub Pages (main branch, `/docs`).

## Setup
```bash
npm i
cp .env.example .env # or create manually
npm run dev
