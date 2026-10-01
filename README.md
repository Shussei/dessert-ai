# SavorSense — AI Culinary Experimentation Studio

AI-powered culinary R&D platform. SavorSense reads a dessert recipe,
deconstructs it into a grounded **Culinary Model** (structure, sensory, ingredient roles),
then runs **what-if experiments** to predict how a change reshapes the result — with
confidence labels and honest uncertainty instead of fake precision.

Shipped demo loop: **Understand → Predict → Experiment → Compare → Learn.**

## Live demo
- **App (Vercel):** https://flavormind-chi.vercel.app
- **Backend (Render):** https://savorsense.onrender.com (`/health`; free tier sleeps ~15 min idle — warm it up before a demo)

## Features
- **Evaluator** — full recipe deconstruction: structure, sensory profile, ingredient roles, recommendations
- **Culinary Digital Twin** — a visual model of the recipe: ingredients → system roles → sensory state, tagged **Fact / Deterministic / Predicted / Uncertain** (shown in evaluator results and every experiment outcome)
- **What-If Lab** — two modes:
  - *Direct modification*: propose one change (e.g. "Reduce sugar by 25%") and see predicted effects, risks, compensation, base-vs-modified comparison, and the deterministic ingredient delta
  - *State a goal*: describe an intent ("25% less sugar, keep the texture") and review up to 3 candidate experiments with interpreted goal, predicted fit, trade-offs, and risk — then run the one you pick
- **Prediction → Reality** — record qualitative outcome (sweetness / texture / browning / volume) after actually baking; the library compares your notes against the experiment's predictions (aligned / differs / unrated)
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
  - `server/culinaryRules.js` — modification detection (`reduce sugar by 25%` → `{action, category, pct}`), grounding notes, conflict detection, deterministic ingredient deltas, `parseGoalHints` for goal interpretation
  - Pipeline: classify roles → rules → LLM → sanitize/validate → conflict detection → confidence
- **LLM**: Groq (`openai/gpt-oss-120b` via `GROQ_MODEL`), one batched call for candidate generation
- **Data**: Firestore (`library` collection, per-user)

## Demo walkthrough (≈4 min)
1. Open **Evaluator** → paste the *Chocolate Cake* example → **Analyze**. See the **Culinary Digital Twin** (ingredients → system roles → sensory) with Fact / Deterministic tags.
2. Open **What-If Lab** → switch to **State a goal** → *"25% less sugar, keep the texture"* → **Design candidate experiments**. Review the interpreted goal + up to 3 candidate cards (predicted fit, effects, trade-offs, risks, deterministic delta where measurable).
3. Pick **Candidate A** → **Use this →** → run the full experiment: digital twin with the amber **Deterministic** sugar cut (`200g → 150g`), sensory shift radar, effects with **Why?** toggles, risks, compensation.
4. **Save Experiment** → open **Research Library**, view the record, and **Record Prediction → Reality** (sweetness / texture / browning / volume) to see aligned-vs-differs chips against the predictions.

## API Endpoints (backend on Render)
- `GET /health` — status + model
- `POST /evaluate` — Culinary Model analysis
- `POST /experiment` — What-If experiment (base + modification → predicted effect + deterministic delta)
- `POST /experiment/candidates` — goal-based candidate generation (goal → interpreted goal + up to 3 candidates with predicted fit)
- `POST /reformulate`, `POST /analyze-flavor`, `POST /generate`, `GET /logs`

## Environment variables
| Variable | Where | Purpose |
|---|---|---|
| `GROQ_API_KEY` | backend | LLM provider key |
| `GROQ_MODEL` | backend | default `openai/gpt-oss-120b` |
| `PORT` | backend | server port (default 3000) |
| `ALLOWED_ORIGINS` | backend optional | comma-separated CORS allow-list; unset = allow-all |
| `VITE_API_URL` | frontend | backend base URL; empty = dev proxy |
| `VITE_FIREBASE_*` | frontend | Firebase config (apiKey, authDomain, projectId, storageBucket, messagingSenderId, appId) |

See `.env.example` for placeholder names. Never commit `.env`.

## Local Development
1. Copy `.env.example` → `.env` and fill in keys (Groq + Firebase).
2. `npm install`
3. Terminals:
   - Backend: `node server/server.js` (http://localhost:3000)
   - Frontend: `npm run dev` (http://localhost:5173) — Vite proxies `/evaluate`, `/experiment`, `/reformulate`, `/analyze-flavor`, `/generate`, `/health`, `/logs` to the backend
4. Scripts: `npm run lint` (ESLint), `npm run build` (Vite), `npm run preview`.

## Deployment
- **Frontend**: Vercel static (`vercel.json` SPA rewrite; set `VITE_API_URL=https://savorsense.onrender.com`)
- **Backend**: Render free service (`render.yaml`; synced `GROQ_API_KEY`, `GROQ_MODEL`, `ALLOWED_ORIGINS`) — free tier may sleep ~15 min, first request can take 30–60s
- **Firestore rules**: ensure the `library` collection is scoped by `uid` in the Firebase console

## Notes
- Zero-fabrication policy: qualitative `low | moderate | high` levels and confidence `high | moderate | low | unknown`; no invented calories/nutrition/safety claims.
- `/logs` is an unauthenticated in-memory ring buffer — fine for a hackathon, harden before shipping to production.