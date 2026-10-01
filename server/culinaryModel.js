import { z } from "zod"

export const CONFIDENCE_LEVELS = ["high", "moderate", "low", "unknown"] 
export const SENSORY_LEVELS = ["low", "moderate", "high"]

const confidenceSchema = z.enum(CONFIDENCE_LEVELS)
const sensoryLevelSchema = z.enum(SENSORY_LEVELS)

export const ingredientSchema = z.object({
  name: z.string().default(""),
  quantity: z.string().nullable().default(null),
  role: z.string().default("other"),
  function: z.string().default(""),
  macroRoll: z.string().default(""),
})

export const sensoryDimensionSchema = z.object({
  level: sensoryLevelSchema.optional(),
  explanation: z.string().default(""),
})

export const sensoryProfileSchema = z.record(z.string(), sensoryDimensionSchema)

export const structuralLayerSchema = z.object({
  name: z.string().default(""),
  type: z.string().default("other"),
  description: z.string().default(""),
  ingredients: z.array(z.string()).default([]),
})

export const flavorInteractionSchema = z.object({
  ingredients: z.array(z.string()).default([]),
  relationship: z.string().default("neutral"),
  explanation: z.string().default(""),
  confidence: confidenceSchema.default("unknown"),
})

export const claimSchema = z.object({
  claim: z.string().default(""),
  evidence: z.string().default(""),
  confidence: confidenceSchema.default("unknown"),
})

export const issueSchema = z.object({
  claim: z.string().default(""),
  evidence: z.string().default(""),
  severity: z.string().default("moderate"),
})

export const recommendationSchema = z.object({
  action: z.string().default(""),
  reasoning: z.string().default(""),
  basis: z.string().default(""),
  confidence: confidenceSchema.default("unknown"),
  limitations: z.string().default(""),
})

export const servingInfoSchema = z.object({
  temperature: z.string().default(""),
  shelfStability: z.string().default(""),
  difficulty: z.string().default("unknown"),
})

export const culinaryModelSchema = z.object({
  recipeName: z.string().default(""),
  ingredients: z.array(ingredientSchema).default([]),
  macroRolls: z.record(z.string(), z.array(z.string())).default({}),
  structuralLayers: z.array(structuralLayerSchema).default([]),
  sensoryProfile: sensoryProfileSchema.default({}),
  flavorInteractions: z.array(flavorInteractionSchema).default([]),
  strengths: z.array(claimSchema).default([]),
  potentialIssues: z.array(issueSchema).default([]),
  recommendations: z.array(recommendationSchema).default([]),
  assumptions: z.array(z.string()).default([]),
  limitations: z.array(z.string()).default([]),
  servingInfo: servingInfoSchema.default({}),
  confidence: z.record(z.string(), confidenceSchema.default("unknown")).default({}),
}).passthrough()

function asArray(value) {
  if (value == null) return []
  return Array.isArray(value) ? value : []
}

function asString(value, fallback = "") {
  if (value == null) return fallback
  return typeof value === "string" ? value : String(value)
}

function coerceConfidence(value) {
  if (typeof value === "string" && CONFIDENCE_LEVELS.includes(value)) return value
  return "unknown"
}

function coerceSensoryLevel(value) {
  if (typeof value === "string" && SENSORY_LEVELS.includes(value)) return value
  return undefined
}

export function normalizeQuantity(raw) {
  if (!raw || typeof raw !== "string") return { amount: null, unit: null }
  const cleaned = raw.trim()
  if (!cleaned) return { amount: null, unit: null }

  const match = cleaned.match(/^([0-9]+(?:\.[0-9]+)?(?:\s*\/\s*[0-9]+)?)\s*([a-zA-Z%]+)?/)
  if (!match) return { amount: null, unit: null }

  let amount = null
  try {
    if (match[1].includes("/")) {
      const [num, den] = match[1].split("/").map((s) => parseFloat(s))
      amount = Number((num / den).toFixed(2))
    } else {
      amount = parseFloat(match[1])
    }
  } catch {
    amount = null
  }
  if (amount == null || Number.isNaN(amount)) amount = null

  const rawUnit = (match[2] || "").toLowerCase()
  const unitMap = {
    g: "g", gr: "g", gram: "g", grams: "g",
    kg: "kg", kilogram: "kg",
    oz: "oz", ounce: "oz",
    lb: "lb",
    ml: "ml", cl: "cl", l: "l", litre: "l", liter: "l",
    tbsp: "tbsp", tablespoon: "tbsp", tablespoons: "tbsp",
    tsp: "tsp", teaspoon: "tsp", teaspoons: "tsp",
    cup: "cup", cups: "cup",
    pinch: "pinch", dash: "dash",
    pcs: "piece", pc: "piece", slice: "slice", slices: "slice",
    whole: "whole", item: "item",
  }
  const unit = unitMap[rawUnit] || null

  return { amount, unit }
}

export function inferMacroRoll(name) {
  if (!name) return "unknown"
  const n = name.toLowerCase()
  const rules = [
    [/sugar|syrup|honey|corn sweetener|agave|molasses|powdered sugar|brown sugar|monk fruit|stevia/, "sweetener"],
    [/butter|shortening|oil|margarine|lard|tallow|cocoa butter|coconut oil|ghee/, "fat"],
    [/egg|egg white|egg yolk/, "egg"],
    [/flour|almond flour|cornstarch|starch|polenta|ground almond|meal/, "structure"],
    [/cream|milk|custard|yogurt|buttermilk|creme|cremeux|ganache/, "dairy"],
    [/gelatin|agar|pectin|gellan/, "thickener"],
    [/baking powder|baking soda|yeast|cream of tartar/, "leavener"],
    [/cocoa|chocolate|vanilla|spice|zest|pistachio|hazelnut|almond|berry|fruit|coffee|yuzu|matcha|caramel|miso|lavender|rose|raspberry|lemon|lime|orange/, "flavor"],
    [/pasteur|puree|pure_|juice|water|wine/, "liquid"],
    [/salt/, "seasoning"],
  ]
  for (const [re, roll] of rules) {
    if (re.test(n)) return roll
  }
  return "unknown"
}

export function buildSensoryProfile(report) {
  const profile = {}
  const source = report?.sensoryProfile || {}
  const raw = typeof source === "object" && !Array.isArray(source) ? source : {}
  for (const key of [
    "sweetness", "acidity", "bitterness", "richness", "aroma", "texture", "contrast", "overallBalance",
  ]) {
    const dim = raw[key]
    const level = coerceSensoryLevel(typeof dim === "object" ? dim?.level : dim)
    const explanation = typeof dim === "object" ? asString(dim?.explanation) : ""
    const candidate = raw[key + "Level"]
    const altLevel = coerceSensoryLevel(typeof candidate === "string" ? candidate : null)
    profile[key] = { level: level ?? altLevel, explanation }
  }
  return profile
}

export function sanitizeCulinaryModel(raw) {
  const source = raw && typeof raw === "object" ? raw : {}
  const ingredients = asArray(source.ingredients).map((ing) => {
    const parsed = ingredientSchema.safeParse(ing)
    const base = parsed.success ? parsed.data : { name: asString(ing?.name), quantity: asString(ing?.quantity, null), role: asString(ing?.role, "other"), function: "", macroRoll: "" }
    const quant = normalizeQuantity(base.quantity)
    return {
      name: asString(base.name),
      quantity: base.quantity,
      amount: quant.amount,
      unit: quant.unit,
      role: asString(base.role, "other"),
      function: asString(base.function),
      macroRoll: asString(base.macroRoll) || inferMacroRoll(base.name),
    }
  })

  const layers = asArray(source.structuralLayers).map((layer) => {
    const parsed = structuralLayerSchema.safeParse(layer)
    const base = parsed.success ? parsed.data : {}
    return {
      name: asString(base.name),
      type: asString(base.type, "other"),
      description: asString(base.description),
      ingredients: asArray(base.ingredients).map(asString),
    }
  })

  const interactions = asArray(source.flavorInteractions).map((fi) => {
    const parsed = flavorInteractionSchema.safeParse(fi)
    const base = parsed.success ? parsed.data : {}
    return {
      ingredients: asArray(base.ingredients).map(asString),
      relationship: asString(base.relationship, "neutral"),
      explanation: asString(base.explanation),
      confidence: coerceConfidence(base.confidence),
    }
  })

  const strengths = asArray(source.strengths).map((s) => {
    const parsed = claimSchema.safeParse(s)
    const base = parsed.success ? parsed.data : { claim: asString(s), evidence: "", confidence: "unknown" }
    return { claim: asString(base.claim), evidence: asString(base.evidence), confidence: coerceConfidence(base.confidence) }
  })

  const issues = asArray(source.potentialIssues).map((s) => {
    const parsed = issueSchema.safeParse(s)
    const base = parsed.success ? parsed.data : { claim: asString(s), evidence: "", severity: "moderate" }
    return { claim: asString(base.claim), evidence: asString(base.evidence), severity: asString(base.severity, "moderate") }
  })

  const recommendations = asArray(source.recommendations).map((r) => {
    const parsed = recommendationSchema.safeParse(r)
    const base = parsed.success ? parsed.data : {}
    return {
      action: asString(base.action),
      reasoning: asString(base.reasoning),
      basis: asString(base.basis),
      confidence: coerceConfidence(base.confidence),
      limitations: asString(base.limitations),
    }
  })

  const serving = servingInfoSchema.safeParse(source.servingInfo)
  const servingData = serving.success ? serving.data : {}

  const macroRolls = {}
  for (const ing of ingredients) {
    if (!ing.macroRoll || ing.macroRoll === "unknown") continue
    macroRolls[ing.macroRoll] = macroRolls[ing.macroRoll] || []
    if (!macroRolls[ing.macroRoll].includes(ing.name)) macroRolls[ing.macroRoll].push(ing.name)
  }

  return {
    recipeName: asString(source.recipeName),
    ingredients,
    macroRolls,
    structuralLayers: layers,
    sensoryProfile: buildSensoryProfile(source),
    flavorInteractions: interactions,
    strengths,
    potentialIssues: issues,
    recommendations,
    assumptions: asArray(source.assumptions).map(asString),
    limitations: asArray(source.limitations).map(asString),
    servingInfo: {
      temperature: asString(servingData.temperature),
      shelfStability: asString(servingData.shelfStability),
      difficulty: asString(servingData.difficulty, "unknown"),
    },
    confidence: {
      overall: coerceConfidence(source.confidence?.overall),
      sensory: coerceConfidence(source.confidence?.sensory),
      structure: coerceConfidence(source.confidence?.structure),
      interactions: coerceConfidence(source.confidence?.interactions),
    },
    _raw: source,
  }
}

export function validateExperimentResult(raw) {
  if (!raw || typeof raw !== "object") {
    return { ok: false, error: "AI returned no usable data. Please try again." }
  }
  if (!Array.isArray(raw.effects) && !Array.isArray(raw.predictedModifiedState)) {
    return { ok: false, error: "AI response missing expected experiment structure. Please try again." }
  }
  return { ok: true, data: raw }
}

export const FIT_LEVELS = ["high", "moderate", "low", "unknown"]

function coerceFit(value) {
  return typeof value === "string" && FIT_LEVELS.includes(value) ? value : "unknown"
}

function pickStrings(value, maxItems) {
  if (!Array.isArray(value)) return []
  return value.map(asString).filter(Boolean).slice(0, maxItems || 99)
}

export function sanitizeGoalPlan(raw) {
  const source = raw && typeof raw === "object" ? raw : {}

  const goalRaw = (typeof source.goal === "object" && source.goal !== null) ? source.goal : {}
  const targetRaw = (typeof goalRaw.target === "object" && goalRaw.target !== null) ? goalRaw.target : {}

  const goal = {
    intent: asString(goalRaw.intent),
    target: {
      ingredient: asString(targetRaw.ingredient, null),
      change: asString(targetRaw.change, null),
      notes: asString(targetRaw.notes),
    },
    constraints: pickStrings(goalRaw.constraints, 6),
  }

  const candidates = asArray(source.candidates).slice(0, 3).map((c, index) => {
    const riskRaw = (typeof c.risks === "object" && c.risks !== null) ? c.risks : {}
    return {
      id: asString(c?.id) || `candidate_${index + 1}`,
      title: asString(c?.title),
      modification: asString(c?.modification),
      rationale: asString(c?.rationale),
      predictedFit: coerceFit(c?.predictedFit),
      expectedEffects: pickStrings(c?.expectedEffects, 4),
      tradeoffs: pickStrings(c?.tradeoffs, 4),
      risks: {
        summary: asString(riskRaw.summary),
        mitigations: pickStrings(riskRaw.mitigations, 4),
      },
      compensation: pickStrings(c?.compensation, 3),
      confidence: coerceConfidence(c?.confidence),
      assumptions: pickStrings(c?.assumptions, 3),
      limitations: pickStrings(c?.limitations, 3),
      exactDelta: asString(c?.exactDelta, null),
      modificationMeta: null,
    }
  }).filter((c) => c.modification)

  return { goal, candidates }
}

export function validateGoalPlan(raw) {
  if (!raw || typeof raw !== "object") {
    return { ok: false, error: "AI returned no usable data. Please try again." }
  }
  const plan = sanitizeGoalPlan(raw)
  if (plan.candidates.length === 0 || !plan.goal.intent) {
    return { ok: false, error: "AI response missing a usable experiment plan. Please try again." }
  }
  return { ok: true, data: plan }
}