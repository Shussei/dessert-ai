import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import Groq from "groq-sdk"
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"
import {
  sanitizeCulinaryModel,
  buildSensoryProfile,
  validateExperimentResult,
} from "./culinaryModel.js"
import {
  classifyRolesFromText,
  detectModification,
  groundingNotes,
  suggestedCompensationGrounding,
  detectConflicts,
  deterministicDelta,
} from "./culinaryRules.js"

dotenv.config({ override: true })

const app = express()

const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map((s) => s.trim())
  : null

app.use(cors({
  origin: (origin, cb) => {
    if (!ALLOWED_ORIGINS) {
      return cb(null, true)
    }
    if (!origin || ALLOWED_ORIGINS.includes(origin)) return cb(null, true)
    cb(new Error("Not allowed by CORS"))
  },
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"],
}))

app.use(express.json({ limit: "10kb" }))

const GROQ_API_KEY = process.env.GROQ_API_KEY
if (!GROQ_API_KEY || GROQ_API_KEY === "dummy-key") {
  console.warn("[SavorSense] WARNING: GROQ_API_KEY not set. AI features will fail with a clear error.")
}

const groq = GROQ_API_KEY && GROQ_API_KEY !== "dummy-key"
  ? new Groq({ apiKey: GROQ_API_KEY })
  : null

const MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile"

const REQUEST_LOG = []

function logRequest(id, endpoint, duration, status, error) {
  const entry = { id, endpoint, duration, status, error: error || null, timestamp: new Date().toISOString() }
  REQUEST_LOG.push(entry)
  if (REQUEST_LOG.length > 200) REQUEST_LOG.shift()
  console.log(`[${id}] ${endpoint} ${duration}ms ${status}`)
}

function generateId() {
  return `req_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

function validateRecipeInput(recipeText) {
  if (!recipeText || typeof recipeText !== "string") return { valid: false, error: "Recipe text is required." }
  const trimmed = recipeText.trim()
  if (trimmed.length < 10) return { valid: false, error: "Recipe text is too short. Please provide at least a recipe name and a few ingredients." }
  if (trimmed.length > 5000) return { valid: false, error: "Recipe text is too long. Maximum 5000 characters." }
  return { valid: true, value: trimmed }
}

function validateFlavorInput(ingredient1, ingredient2) {
  if (!ingredient1 || !ingredient2) return { valid: false, error: "Both ingredients are required." }
  if (typeof ingredient1 !== "string" || typeof ingredient2 !== "string") return { valid: false, error: "Ingredients must be strings." }
  if (ingredient1.length > 100 || ingredient2.length > 100) return { valid: false, error: "Ingredient names too long." }
  return { valid: true, value: { ingredient1: ingredient1.trim(), ingredient2: ingredient2.trim() } }
}

function validateGenerateInput(data) {
  const { flavor, ingredients, dietary, style } = data || {}
  if (!flavor && !ingredients) return { valid: false, error: "Provide at least a flavor concept or ingredient list." }
  return { valid: true, value: { flavor: flavor || "", ingredients: ingredients || "", dietary: dietary || "", style: style || "Haute Pâtisserie" } }
}

function validateExperimentInput(data) {
  if (!data) return { valid: false, error: "Request body is required." }
  const recipeValidation = validateRecipeInput(data.recipeText)
  if (!recipeValidation.valid) return recipeValidation
  const modification = (data.modification || "").trim()
  if (!modification) return { valid: false, error: "Describe the modification you want to experiment with (e.g. 'Reduce sugar by 25%')." }
  if (modification.length > 300) return { valid: false, error: "Modification description is too long (maximum 300 characters)." }
  return { valid: true, value: { recipeText: recipeValidation.value, modification } }
}

async function callGroqWithTimeout(messages, maxTokens = 2000, timeoutMs = 30000) {
  if (!groq) throw new Error("AI service not available. GROQ_API_KEY not configured.")
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const response = await groq.chat.completions.create({
      model: MODEL,
      messages,
      max_tokens: maxTokens,
      temperature: 0.7,
      response_format: { type: "json_object" },
    }, { signal: controller.signal })
    clearTimeout(timeoutId)
    const content = response.choices?.[0]?.message?.content
    if (!content) throw new Error("Empty response from AI model.")
    return { content, usage: response.usage, model: response.model }
  } catch (err) {
    clearTimeout(timeoutId)
    if (err.name === "AbortError") throw new Error("AI request timed out.")
    throw err
  }
}

function parseJsonResponse(content) {
  try {
    const parsed = JSON.parse(content)
    if (typeof parsed !== "object" || parsed === null) throw new Error("Response is not an object.")
    return parsed
  } catch (err) {
    throw new Error(`Failed to parse AI response as JSON: ${err.message}`)
  }
}

function coerceEnum(value, allowed, fallback) {
  return value && allowed.includes(value) ? value : fallback
}

const SEVERITIES = ["minor", "moderate", "significant"]
const CONFIDENCES = ["high", "moderate", "low", "unknown"]

function asArray(value) {
  return Array.isArray(value) ? value : []
}

function computeModelConfidence(model) {
  const dims = Object.values(model.sensoryProfile || {}).filter((d) => d?.level).length
  const sensory = dims >= 6 ? "high" : dims >= 3 ? "moderate" : dims > 0 ? "low" : "unknown"
  const structure = (model.structuralLayers || []).length > 0 ? "moderate" : "unknown"
  const interactions = (model.flavorInteractions || []).length > 0 ? "moderate" : "unknown"
  const ingredients = (model.ingredients || []).length > 0 ? "high" : "unknown"
  return { sensory, structure, interactions, ingredients }
}

function experimentDecisionLog(str) {
  console.log(`[experiment] ${str}`)
}

// ── HEALTH ──
app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    project: "SavorSense",
    aiAvailable: !!groq,
    model: MODEL,
    uptime: Math.round(process.uptime()),
  })
})

// ── EVALUATE RECIPE → Culinary Model ──
app.post("/evaluate", async (req, res) => {
  const id = generateId()
  const start = Date.now()

  const validation = validateRecipeInput(req.body.recipeText)
  if (!validation.valid) {
    logRequest(id, "/evaluate", 0, "validation_error", validation.error)
    return res.status(400).json({ error: validation.error, requestId: id })
  }

  if (!groq) {
    logRequest(id, "/evaluate", 0, "ai_unavailable")
    return res.status(503).json({ error: "AI service not available. GROQ_API_KEY not configured.", requestId: id, fallback: true })
  }

  const flags = classifyRolesFromText(validation.value)
  const deterministicFacts = Object.entries(flags)
    .filter(([k, v]) => v && !k.endsWith("Present"))
    .map(([k]) => k)
    .join(", ")

  const SYSTEM_PROMPT = `You are a professional pastry chef and food scientist analyzing a dessert recipe.
Return a JSON object with this EXACT structure:
{
  "recipeName": "string - the dessert name",
  "ingredients": [{ "name": "string", "quantity": "string", "role": "base|core|body|coating|garnish|sweetener|fat|acid|flavor|thickener|other" }],
  "structuralLayers": [{ "name": "string", "type": "base|core|body|coating|garnish", "description": "string explaining what this layer does", "ingredients": ["string"] }],
  "sensoryProfile": {
    "sweetness": { "level": "low|moderate|high", "explanation": "string" },
    "acidity": { "level": "low|moderate|high", "explanation": "string" },
    "bitterness": { "level": "low|moderate|high", "explanation": "string" },
    "richness": { "level": "low|moderate|high", "explanation": "string" },
    "aroma": { "level": "low|moderate|high", "explanation": "string" },
    "texture": { "level": "low|moderate|high", "explanation": "string" },
    "contrast": { "level": "low|moderate|high", "explanation": "string" },
    "overallBalance": { "level": "low|moderate|high", "explanation": "string" }
  },
  "flavorInteractions": [{ "ingredients": ["string","string"], "relationship": "complementary|contrasting|neutral", "explanation": "string", "confidence": "high|moderate|low|unknown" }],
  "strengths": [{ "claim": "string", "evidence": "string", "confidence": "high|moderate|low|unknown" }],
  "potentialIssues": [{ "claim": "string", "evidence": "string", "severity": "minor|moderate|significant" }],
  "recommendations": [{ "action": "string", "reasoning": "string", "basis": "string", "confidence": "high|moderate|low|unknown", "limitations": "string" }],
  "assumptions": ["string"],
  "limitations": ["string"],
  "servingInfo": { "temperature": "string", "shelfStability": "string", "difficulty": "easy|intermediate|advanced|expert" }
}
Deterministic observations from the rule layer (do not contradict them; note disagreements in limitations):
- Ingredient categories detected in the text: ${deterministicFacts || "none detected"}.
- Do NOT invent numerical scores. Use qualitative assessments (low/moderate/high). Always provide explanations and confidence levels.
- If a piece of data is unknown, omit it or mark confidence "unknown". Never fabricate measurements.`

  try {
    const result = await callGroqWithTimeout([
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: `Analyze this dessert recipe:\n\n${validation.value}` },
    ], 2500, 30000)

    const parsed = parseJsonResponse(result.content)
    const model = sanitizeCulinaryModel(parsed)

    if ((model.ingredients || []).length === 0 && !model.recipeName) {
      logRequest(id, "/evaluate", Date.now() - start, "unusable_output", "No structure recovered from AI response")
      return res.status(502).json({ error: "The AI returned an analysis that could not be structured. Please try again.", requestId: id })
    }

    const confidence = computeModelConfidence(model)
    logRequest(id, "/evaluate", Date.now() - start, "success")
    return res.json({
      data: model,
      metadata: {
        requestId: id,
        model: result.model,
        tokensUsed: result.usage?.total_tokens || 0,
        source: "ai_estimated",
        confidence,
        deterministicCategories: deterministicFacts ? deterministicFacts.split(", ") : [],
        disclaimer: "All assessments are AI-estimated culinary inferences, not laboratory measurements.",
      },
    })
  } catch (err) {
    logRequest(id, "/evaluate", Date.now() - start, "error", err.message)
    if (err.message.includes("timed out")) {
      return res.status(504).json({ error: "AI analysis timed out. Please try again.", requestId: id })
    }
    return res.status(500).json({ error: "AI analysis failed. Please try again later.", requestId: id })
  }
})

// ── ANALYZE FLAVOR PAIRING ──
app.post("/analyze-flavor", async (req, res) => {
  const id = generateId()
  const start = Date.now()

  const validation = validateFlavorInput(req.body.ingredient1, req.body.ingredient2)
  if (!validation.valid) {
    logRequest(id, "/analyze-flavor", 0, "validation_error", validation.error)
    return res.status(400).json({ error: validation.error, requestId: id })
  }

  if (!groq) {
    logRequest(id, "/analyze-flavor", 0, "ai_unavailable")
    return res.status(503).json({ error: "AI service not available. GROQ_API_KEY not configured.", requestId: id, fallback: true })
  }

  const { ingredient1, ingredient2 } = validation.value

  const SYSTEM_PROMPT = `You are a professional pastry chef and flavor scientist analyzing an ingredient pairing.
Return a JSON object with this EXACT structure:
{
  "ingredient1": "${ingredient1}",
  "ingredient2": "${ingredient2}",
  "compatibility": { "rating": "strong|moderate|weak|poor", "explanation": "string" },
  "aromaticCompatibility": { "rating": "strong|moderate|weak", "explanation": "string" },
  "tasteContrast": { "rating": "complementary|contrasting|neutral", "explanation": "string" },
  "sharedFlavorFamilies": ["string"],
  "textureInteraction": { "description": "string" },
  "culinaryEvidence": "string - known culinary pairing traditions or science",
  "dominance": { "dominant": "string", "explanation": "string" },
  "potentialImbalance": { "description": "string", "severity": "none|minor|notable" },
  "contextualSuitability": { "applications": ["string"], "avoidIn": ["string"] },
  "overallAssessment": { "rating": "excellent|good|fair|poor", "explanation": "string", "confidence": "high|moderate|low|unknown" },
  "assumptions": ["string"],
  "limitations": ["string"]
}
IMPORTANT: Do NOT produce numerical compatibility scores. Use qualitative ratings only. Always explain reasoning.`

  try {
    const result = await callGroqWithTimeout([
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: `Analyze the flavor pairing between ${ingredient1} and ${ingredient2} in the context of dessert and pastry applications.` },
    ], 2000, 25000)

    const parsed = parseJsonResponse(result.content)
    logRequest(id, "/analyze-flavor", Date.now() - start, "success")
    return res.json({
      data: parsed,
      metadata: {
        requestId: id,
        model: result.model,
        tokensUsed: result.usage?.total_tokens || 0,
        source: "ai_estimated",
        disclaimer: "Flavor assessments are AI-estimated culinary inferences.",
      },
    })
  } catch (err) {
    logRequest(id, "/analyze-flavor", Date.now() - start, "error", err.message)
    return res.status(500).json({ error: "Flavor analysis failed. Please try again.", requestId: id })
  }
})

// ── GENERATE RECIPE ──
app.post("/generate", async (req, res) => {
  const id = generateId()
  const start = Date.now()

  const validation = validateGenerateInput(req.body)
  if (!validation.valid) {
    logRequest(id, "/generate", 0, "validation_error", validation.error)
    return res.status(400).json({ error: validation.error, requestId: id })
  }

  if (!groq) {
    logRequest(id, "/generate", 0, "ai_unavailable")
    return res.status(503).json({ error: "AI service not available. GROQ_API_KEY not configured.", requestId: id, fallback: true })
  }

  const { flavor, ingredients, dietary, style } = validation.value

  const SYSTEM_PROMPT = `You are a professional pastry chef creating a structured recipe.
Return a JSON object with this EXACT structure:
{
  "concept": "string - recipe name and brief concept",
  "yield": "string - e.g. '8 servings' or 'One 20cm entremet'",
  "ingredients": [{ "name": "string", "quantity": "string", "role": "string explaining function" }],
  "preparation": [{ "step": number, "instruction": "string", "temperature": "string or null", "time": "string or null", "technique": "string" }],
  "assembly": "string - how to assemble the final dessert",
  "finishing": "string - finishing touches and presentation",
  "storage": "string - storage instructions",
  "flavorProfile": { "primary": ["string"], "secondary": ["string"], "description": "string" },
  "targetTexture": "string",
  "potentialFailurePoints": [{ "issue": "string", "prevention": "string" }],
  "substitutions": [{ "original": "string", "alternative": "string", "note": "string" }],
  "assumptions": ["string"],
  "limitations": ["string"]
}
Requirements: Include precise quantities, temperatures, and times. Be technically accurate.`

  const userParts = []
  if (flavor) userParts.push(`Flavor concept: ${flavor}`)
  if (ingredients) userParts.push(`Key ingredients to use: ${ingredients}`)
  if (dietary) userParts.push(`Dietary requirements: ${dietary}`)
  if (style) userParts.push(`Style: ${style}`)

  try {
    const result = await callGroqWithTimeout([
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: `Create a dessert recipe: ${userParts.join(". ")}` },
    ], 2500, 30000)

    const parsed = parseJsonResponse(result.content)
    logRequest(id, "/generate", Date.now() - start, "success")
    return res.json({
      data: parsed,
      metadata: {
        requestId: id,
        model: result.model,
        tokensUsed: result.usage?.total_tokens || 0,
        source: "ai_generated",
        disclaimer: "Recipe is AI-generated. Verify technique and timing in practice.",
      },
    })
  } catch (err) {
    logRequest(id, "/generate", Date.now() - start, "error", err.message)
    return res.status(500).json({ error: "Recipe generation failed. Please try again.", requestId: id })
  }
})

// ── REFORMULATE RECIPE ──
app.post("/reformulate", async (req, res) => {
  const id = generateId()
  const start = Date.now()

  const validation = validateRecipeInput(req.body.recipeText)
  if (!validation.valid) {
    logRequest(id, "/reformulate", 0, "validation_error", validation.error)
    return res.status(400).json({ error: validation.error, requestId: id })
  }

  const dietaryTarget = (req.body.dietaryTarget || "vegan").toLowerCase().trim()
  const validTargets = ["vegan", "gluten-free", "keto"]
  if (!validTargets.includes(dietaryTarget)) {
    return res.status(400).json({ error: `Dietary target must be one of: ${validTargets.join(", ")}`, requestId: id })
  }

  if (!groq) {
    logRequest(id, "/reformulate", 0, "ai_unavailable")
    return res.status(503).json({ error: "AI service not available. GROQ_API_KEY not configured.", requestId: id, fallback: true })
  }

  const flags = classifyRolesFromText(validation.value)
  const deterministicFacts = Object.entries(flags)
    .filter(([k, v]) => v && !k.endsWith("Present"))
    .map(([k]) => k)
    .join(", ")

  const SYSTEM_PROMPT = `You are a food scientist specializing in dietary reformulation of desserts.
Return a JSON object with this EXACT structure:
{
  "dietaryTarget": "${dietaryTarget}",
  "removedIngredients": [{ "name": "string", "reason": "string" }],
  "addedSubstitutes": [{ "original": "string", "replacement": "string", "ratio": "string", "reason": "string" }],
  "textureChanges": { "description": "string", "confidence": "high|moderate|low|unknown" },
  "bakingAdjustments": [{ "parameter": "string", "original": "string", "adjusted": "string", "reason": "string" }],
  "culinaryTradeOffs": [{ "tradeoff": "string", "severity": "minor|moderate|significant" }],
  "crossContaminationNotes": "string or null",
  "overallAssessment": { "rating": "good|fair|challenging", "explanation": "string", "confidence": "high|moderate|low|unknown" },
  "assumptions": ["string"],
  "limitations": ["string"]
}
Deterministic observations from the rule layer (do not contradict them; note disagreements in limitations):
- Ingredient categories detected in the text: ${deterministicFacts || "none detected"}.
Be technically responsible. Do not make health or medical claims.`

  try {
    const result = await callGroqWithTimeout([
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: `Reformulate this recipe to be ${dietaryTarget}:\n\n${validation.value}` },
    ], 2500, 30000)

    const parsed = parseJsonResponse(result.content)
    const hasStructure = Array.isArray(parsed.addedSubstitutes) || Array.isArray(parsed.removedIngredients)
    if (!hasStructure) {
      logRequest(id, "/reformulate", Date.now() - start, "unusable_output", "Missing substitution structure")
      return res.status(502).json({ error: "The AI returned a reformulation that could not be interpreted. Please try again.", requestId: id })
    }
    if (Array.isArray(parsed.culinaryTradeOffs)) {
      parsed.culinaryTradeOffs = parsed.culinaryTradeOffs
        .map((t) => (typeof t === "object" ? t : { tradeoff: String(t) }))
        .filter((t) => t && t.tradeoff)
        .map((t) => ({ tradeoff: t.tradeoff, severity: coerceEnum(t.severity, SEVERITIES, "moderate") }))
    }

    logRequest(id, "/reformulate", Date.now() - start, "success")
    return res.json({
      data: parsed,
      metadata: {
        requestId: id,
        model: result.model,
        tokensUsed: result.usage?.total_tokens || 0,
        source: "ai_estimated",
        disclaimer: "Reformulation suggestions are AI-estimated. Test in practice before serving.",
      },
    })
  } catch (err) {
    logRequest(id, "/reformulate", Date.now() - start, "error", err.message)
    return res.status(500).json({ error: "Reformulation failed. Please try again.", requestId: id })
  }
})

// ── EXPERIMENT (What-If) ──
app.post("/experiment", async (req, res) => {
  const id = generateId()
  const start = Date.now()

  const validation = validateExperimentInput(req.body)
  if (!validation.valid) {
    logRequest(id, "/experiment", 0, "validation_error", validation.error)
    return res.status(400).json({ error: validation.error, requestId: id })
  }

  if (!groq) {
    logRequest(id, "/experiment", 0, "ai_unavailable")
    return res.status(503).json({ error: "AI service not available. GROQ_API_KEY not configured.", requestId: id, fallback: true })
  }

  const { recipeText, modification } = validation.value

  // Deterministic layer runs FIRST and always grounds the LLM prompt.
  const flags = classifyRolesFromText(recipeText)
  const mod = detectModification(modification)
  const notes = groundingNotes(mod, flags)
  const compensations = suggestedCompensationGrounding(mod, flags)
  const conflicts = detectConflicts(mod, flags, {})
  const detectedCategories = Object.entries(flags).filter(([, v]) => v).map(([k]) => k)

  experimentDecisionLog(`mod="${modification}" category=${mod.category || "unknown"} action=${mod.action} pct=${mod.pct}`)
  experimentDecisionLog(`grounding notes=${notes.length} conflicts=${conflicts.length} baseFlags=${detectedCategories.join(",")}`)

  const SYSTEM_PROMPT = `You are a pastry scientist running a controlled culinary "what-if" experiment on a dessert recipe.
The user will provide a BASE RECIPE and a MODIFICATION. You must predict the honest, qualitatively-stated effects.
Return a JSON object with this EXACT structure:
{
  "baseRecipe": {
    "recipeName": "string",
    "ingredients": [{ "name": "string", "quantity": "string (as written or null)", "role": "string" }],
    "sensoryProfile": { "sweetness": {"level":"low|moderate|high","explanation":"string"}, "acidity": {...}, "bitterness": {...}, "richness": {...}, "aroma": {...}, "texture": {...}, "contrast": {...}, "overallBalance": {...} },
    "macroRollSummary": "string"
  },
  "experimentTitle": "string",
  "modificationSummary": "string - a one-line restatement of what is being changed",
  "effects": [
    { "dimension": "string e.g. sweetness, crumb moisture, browning", "change": "string e.g. 'decreases'", "explanation": "string", "confidence": "high|moderate|low|unknown" }
  ],
  "tradeoffs": [ { "tradeoff": "string", "severity": "minor|moderate|significant" } ],
  "risks": [ { "risk": "string", "mitigations": ["string"], "confidence": "high|moderate|low|unknown" } ],
  "suggestedCompensation": [ { "targetProperty": "string", "action": "string", "confidence": "high|moderate|low|unknown" } ],
  "predictedState": {
    "ingredients": [ { "name": "string", "original": "string or null", "adjusted": "string or null", "changeNote": "string" } ],
    "sensory": { "sweetness": {"level":"low|moderate|high","explanation":"string"}, "texture": {...}, "richness": {...}, "contrast": {...}, "overallBalance": {...} },
    "structuralNote": "string"
  },
  "comparisonSummary": { "whatChanged": "string", "why": "string", "expected": "string", "tradeoff": "string", "confidence": "high|moderate|low|unknown", "verifiable": "string" },
  "overallAssessment": { "rating": "worthwhile|balanced|risky|avoid", "explanation": "string", "confidence": "high|moderate|low|unknown" },
  "assumptions": ["string"],
  "limitations": ["string"]
}
STRICT RULES:
- Only qualitative levels (low/moderate/high). Never invent percentages, weights, calories, or any numeric measurement the user did not supply.
- Treat the deterministic observations below as ground truth. If they conflict with instinct, surface the conflict in limitations.
- Effects and compensations must be explicitly connected to the ingredient categories present in the recipe.
- Never guarantee outcomes. Hedge with confidence levels.`

  const userPrompt = `BASE RECIPE:\n${recipeText}\n\nMODIFICATION: ${modification}\n
DETERMINISTIC OBSERVATIONS (treat as ground truth):
${notes.map((n) => `- ${n}`).join("\n") || "- none"}

SUGGESTED COMPENSATION GROUNDING (reconcile with, and improve on, these):
${compensations.map((c) => `- [${c.confidence}] compensate ${c.targetProperty}: ${c.action}`).join("\n") || "- none"}

POTENTIAL CONFLICTS TO ADDRESS EXPLICITLY:
${conflicts.map((c) => `- [${c.severity}] ${c.message}`).join("\n") || "- none detected"}

Analyze the experiment.`

  try {
    const result = await callGroqWithTimeout([
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userPrompt },
    ], 3000, 40000)

    const parsed = parseJsonResponse(result.content)
    const validated = validateExperimentResult(parsed)
    if (!validated.ok) {
      logRequest(id, "/experiment", Date.now() - start, "unusable_output", validated.error)
      return res.status(502).json({ error: validated.error, requestId: id })
    }

    // Sanitize base recipe into the shared Culinary Model shape.
    const baseModel = sanitizeCulinaryModel(parsed.baseRecipe || {})
    const baseSensory = buildSensoryProfile(parsed.baseRecipe || {})

    // Effects / tradeoffs / risks normalization.
    const effects = asArray(parsed.effects).map((e) => ({
      dimension: e?.dimension || "general",
      change: e?.change || "changes",
      explanation: e?.explanation || "",
      confidence: coerceEnum(e?.confidence, CONFIDENCES, "unknown"),
    }))

    const tradeoffs = asArray(parsed.tradeoffs).map((t) => ({
      tradeoff: t?.tradeoff || t || "",
      severity: coerceEnum(t?.severity, SEVERITIES, "moderate"),
    })).filter((t) => t.tradeoff)

    const risks = asArray(parsed.risks).map((r) => ({
      risk: r?.risk || "",
      mitigations: asArray(r?.mitigations).map(String),
      confidence: coerceEnum(r?.confidence, CONFIDENCES, "unknown"),
    })).filter((r) => r.risk)

    // Compensation: LLM's list, then overlay deterministic gaps.
    const llmCompensation = asArray(parsed.suggestedCompensation).map((c) => ({
      targetProperty: c?.targetProperty || "general",
      action: c?.action || "",
      confidence: coerceEnum(c?.confidence, CONFIDENCES, "unknown"),
    })).filter((c) => c.action)
    const seen = new Set(llmCompensation.map((c) => c.targetProperty.toLowerCase()))
    const mergedCompensation = [...llmCompensation]
    for (const det of compensations) {
      if (!seen.has(det.targetProperty.toLowerCase())) {
        mergedCompensation.push({ ...det, source: "deterministic" })
        seen.add(det.targetProperty.toLowerCase())
      }
    }

    // Predicted ingredients with deterministic override for sweetener delta.
    let predictedIngredients = asArray(parsed.predictedState?.ingredients).map((i) => ({
      name: i?.name || "",
      original: i?.original || null,
      adjusted: i?.adjusted || null,
      changeNote: i?.changeNote || "",
    })).filter((i) => i.name)

    const delta = deterministicDelta({ ingredients: baseModel.ingredients }, mod, flags)
    if (delta) {
      const sugarIdx = predictedIngredients.findIndex((p) => /sugar|sweetener|honey|syrup/i.test(p.name))
      if (sugarIdx >= 0) {
        predictedIngredients[sugarIdx] = {
          ...predictedIngredients[sugarIdx],
          original: delta.baseAmount ? `${delta.baseAmount}${delta.baseUnit || ""}` : predictedIngredients[sugarIdx].original,
          adjusted: `${delta.modifiedAmount}${delta.baseUnit || ""}`,
          changeNote: delta.note,
        }
      } else {
        predictedIngredients.push({
          name: delta.ingredient,
          original: `${delta.baseAmount}${delta.baseUnit || ""}`,
          adjusted: `${delta.modifiedAmount}${delta.baseUnit || ""}`,
          changeNote: delta.note,
        })
      }
    }

    const predictedSensoryRaw = parsed.predictedState?.sensory || {}
    const predictedSensory = {
      sweetness: predictedSensoryRaw.sweetness || { level: undefined },
      acidity: predictedSensoryRaw.acidity || { level: undefined },
      bitterness: predictedSensoryRaw.bitterness || { level: undefined },
      richness: predictedSensoryRaw.richness || { level: undefined },
      aroma: predictedSensoryRaw.aroma || { level: undefined },
      texture: predictedSensoryRaw.texture || { level: undefined },
      contrast: predictedSensoryRaw.contrast || { level: undefined },
      overallBalance: predictedSensoryRaw.overallBalance || { level: undefined },
    }

    const cs = parsed.comparisonSummary || {}
    const overall = parsed.overallAssessment || {}

    const data = {
      experimentTitle: parsed.experimentTitle || `${baseModel.recipeName || "This recipe"}: ${mod.summary}`,
      baseState: {
        ...baseModel,
        recipeName: baseModel.recipeName || parsed.baseRecipe?.recipeName || "Untitled Base",
        sensoryProfile: baseSensory,
      },
      modification: {
        summary: mod.summary,
        category: mod.category || "unknown",
        action: mod.action,
        pct: mod.pct,
        deterministicNotes: notes,
        conflicts,
      },
      effects,
      tradeoffs,
      risks,
      suggestedCompensation: mergedCompensation,
      predictedModifiedState: {
        ingredients: predictedIngredients,
        sensory: predictedSensory,
        structuralNote: parsed.predictedState?.structuralNote || "",
      },
      comparisonSummary: {
        whatChanged: cs.whatChanged || mod.summary,
        why: cs.why || "",
        expected: cs.expected || "",
        tradeoff: cs.tradeoff || "",
        confidence: coerceEnum(cs.confidence, CONFIDENCES, "moderate"),
        verifiable: cs.verifiable || "",
      },
      overallAssessment: {
        rating: overall.rating || "balanced",
        explanation: overall.explanation || "",
        confidence: coerceEnum(overall.confidence, CONFIDENCES, "moderate"),
      },
      confidence: {
        overall: coerceEnum(overall.confidence, CONFIDENCES, "moderate"),
        determinism: conflicts.length > 0 ? "moderate" : "high",
      },
      assumptions: asArray(parsed.assumptions).map(String),
      limitations: asArray(parsed.limitations).map(String),
    }

    logRequest(id, "/experiment", Date.now() - start, "success")
    return res.json({
      data,
      metadata: {
        requestId: id,
        model: result.model,
        tokensUsed: result.usage?.total_tokens || 0,
        source: "ai_estimated",
        deterministicRules: {
          categoriesDetected: detectedCategories.length,
          groundingNotes: notes.length,
          conflicts: conflicts.length,
        },
        disclaimer: "Experiment predictions are AI-estimated culinary inferences grounded by deterministic ingredient-role rules. They are not laboratory measurements.",
      },
    })
  } catch (err) {
    logRequest(id, "/experiment", Date.now() - start, "error", err.message)
    if (err.message.includes("timed out")) {
      return res.status(504).json({ error: "Experiment analysis timed out. Try a slightly shorter recipe or modification.", requestId: id })
    }
    return res.status(500).json({ error: "Experiment analysis failed. Please try again.", requestId: id })
  }
})

// ── REQUEST LOG ENDPOINT ──
app.get("/logs", (_req, res) => {
  res.json({ logs: REQUEST_LOG.slice(-50) })
})

// ── STATIC FRONTEND (production build) ──
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DIST_DIR = path.join(__dirname, "..", "dist")

if (fs.existsSync(DIST_DIR)) {
  app.use(express.static(DIST_DIR))
  app.get(/^\/(?!evaluate|analyze-flavor|generate|reformulate|experiment|health|logs).*/, (_req, res) => {
    res.sendFile(path.join(DIST_DIR, "index.html"))
  })
  console.log("[SavorSense] Serving frontend from dist/")
} else {
  console.warn("[SavorSense] No dist/ build found — run `npm run build` to serve the UI from this server.")
}

// ── ERROR HANDLING ──
app.use((err, _req, res, _next) => {
  console.error("[SavorSense] Unhandled error:", err.message)
  if (err.message === "Not allowed by CORS") {
    return res.status(403).json({ error: "CORS policy violation." })
  }
  res.status(500).json({ error: "Internal server error." })
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`SavorSense server running on port ${PORT}`)
  console.log(`AI available: ${!!groq}`)
  console.log(`Model: ${MODEL}`)
})