# SavorSense — AI Culinary Experimentation Studio

AI-powered culinary R&D platform for MUMENT 2026. SavorSense reads a dessert recipe,
deconstructs it into a grounded **Culinary Model** (structure, sensory, ingredient roles),
then runs **what-if experiments** to predict how a change reshapes the result — with
confidence labels and honest uncertainty instead of fake precision.

Shipped demo loop: **Understand → Predict → Experiment → Compare → Learn.**

## Features
- **Evaluator** — full recipe deconstruction: structure, sensory profile, ingredient roles, recommendations
- **What-If Lab** — propose a modification and see predicted effects, risks, compensation, and base-vs-modified comparison
- **Flavor Lab** — two-ingredient interaction analysis
- **Reformulation** — vegan / gluten-free / keto adaptation with trade-off analysis
- **Comparison** — side-by-side formulation comparison
- **Generator** — structured dessert concept generation
- **Research Library** — Firestore-backed notebook; experiments are saved as `base → iteration` chains with "Run What-If on this"

## Architecture
- **Frontend**: React + Vite + Tailwind (brutalist pastry-lab design system)
- **Backend**: Node.js + Express (`server/server.js`)
- **Grounded reasoning layer**: deterministic rules before/after the LLM
  - `server/culinaryModel.js` — shared Culinary Model + Zod validation + `normalizeQuantity` (never fabricates unparseable amounts)
  - `server/culinaryRules.js` — modification detection (`reduce sugar by 25%` → `{action, category, pct}`), grounding notes, conflict detection, deterministic ingredient deltas
  - Pipeline: classify roles → rules → LLM → sanitize/validate → conflict detection → confidence
- **LLM**: Groq (`openai/gpt-oss-120b` via `GROQ_MODEL`)
- **Data**: Firestore (`library` collection, per-user)

## API Endpoints (backend on Render)
- `GET /health` — status + model
- `POST /evaluate` — Culinary Model analysis
- `POST /experiment` — What-If experiment (base + modification → predicted effect)
- `POST /reformulate`, `POST /analyze-flavor`, `POST /generate`, `GET /logs`

## Local Development
1. Copy `.env.example` → `.env` and fill in keys (Groq + Firebase).
2. `npm install`
3. Terminals:
   - Backend: `node server/server.js` (http://localhost:3000)
   - Frontend: `npm run dev` (http://localhost:5173) — Vite proxies `/api/*` to the backend

## Deployment
- **Frontend**: Vercel static (`vercel.json` SPA rewrite; set `VITE_API_URL=https://savorsense.onrender.com`)
- **Backend**: Render free service (`render.yaml`; synced `GROQ_API_KEY`, `GROQ_MODEL`, `ALLOWED_ORIGINS`) — free tier may sleep ~15 min, first request can take 30–60s
- **Firestore rules**: ensure the `library` collection is scoped by `uid` in the Firebase console

## Notes
- Zero-fabrication policy: qualitative `low | moderate | high` levels and confidence `high | moderate | low | unknown`; no invented calories/nutrition/safety claims.
- `/logs` is an unauthenticated in-memory ring buffer — fine for a hackathon, harden before shipping to production.