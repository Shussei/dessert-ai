import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import Groq from "groq-sdk"

dotenv.config({ override: true })

const app = express()

const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",")
  : ["http://localhost:5173", "http://localhost:3000"]

app.use(cors({
  origin: (origin, cb) => {
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

// ── EVALUATE RECIPE ──
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
    return res.status(503).json({
      error: "AI service not available. GROQ_API_KEY not configured.",
      requestId: id,
      fallback: true,
    })
  }

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
  "flavorInteractions": [{ "ingredients": ["string","string"], "relationship": "complementary|contrasting|neutral", "explanation": "string", "confidence": "high|moderate|low" }],
  "strengths": [{ "claim": "string", "evidence": "string", "confidence": "high|moderate|low" }],
  "potentialIssues": [{ "claim": "string", "evidence": "string", "severity": "minor|moderate|significant" }],
  "recommendations": [{ "action": "string", "reasoning": "string", "basis": "string", "confidence": "high|moderate|low", "limitations": "string" }],
  "assumptions": ["string"],
  "limitations": ["string"],
  "servingInfo": { "temperature": "string", "shelfStability": "string", "difficulty": "easy|intermediate|advanced|expert" }
}
IMPORTANT: Do NOT invent numerical scores. Use qualitative assessments (low/moderate/high). Always provide explanations and confidence levels.`

  try {
    const result = await callGroqWithTimeout([
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: `Analyze this dessert recipe:\n\n${validation.value}` },
    ], 2500, 30000)

    const parsed = parseJsonResponse(result.content)
    logRequest(id, "/evaluate", Date.now() - start, "success")
    return res.json({
      data: parsed,
      metadata: {
        requestId: id,
        model: result.model,
        tokensUsed: result.usage?.total_tokens || 0,
        source: "ai_estimated",
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
    return res.status(503).json({
      error: "AI service not available. GROQ_API_KEY not configured.",
      requestId: id,
      fallback: true,
    })
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
  "overallAssessment": { "rating": "excellent|good|fair|poor", "explanation": "string", "confidence": "high|moderate|low" },
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
    return res.status(503).json({
      error: "AI service not available. GROQ_API_KEY not configured.",
      requestId: id,
      fallback: true,
    })
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
    return res.status(503).json({
      error: "AI service not available. GROQ_API_KEY not configured.",
      requestId: id,
      fallback: true,
    })
  }

  const SYSTEM_PROMPT = `You are a food scientist specializing in dietary reformulation of desserts.
Return a JSON object with this EXACT structure:
{
  "dietaryTarget": "${dietaryTarget}",
  "removedIngredients": [{ "name": "string", "reason": "string" }],
  "addedSubstitutes": [{ "original": "string", "replacement": "string", "ratio": "string", "reason": "string" }],
  "textureChanges": { "description": "string", "confidence": "high|moderate|low" },
  "bakingAdjustments": [{ "parameter": "string", "original": "string", "adjusted": "string", "reason": "string" }],
  "culinaryTradeOffs": [{ "tradeoff": "string", "severity": "minor|moderate|significant" }],
  "crossContaminationNotes": "string or null",
  "overallAssessment": { "rating": "good|fair|challenging", "explanation": "string", "confidence": "high|moderate|low" },
  "assumptions": ["string"],
  "limitations": ["string"]
}
Be technically responsible. Do not make health or medical claims.`

  try {
    const result = await callGroqWithTimeout([
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: `Reformulate this recipe to be ${dietaryTarget}:\n\n${validation.value}` },
    ], 2500, 30000)

    const parsed = parseJsonResponse(result.content)
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

// ── REQUEST LOG ENDPOINT ──
app.get("/logs", (_req, res) => {
  res.json({ logs: REQUEST_LOG.slice(-50) })
})

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
