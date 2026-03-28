/* eslint-env node */
import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import Groq from "groq-sdk"
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

dotenv.config({ override: true })

const app = express()

app.use(cors())
app.use(express.json())

/* ---------------- Path Setup ---------------- */

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const DATA_DIR = path.join(__dirname, "data")
const ROLE_DB_PATH = path.join(DATA_DIR, "ingredientRoles.json")

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR)
}

if (!fs.existsSync(ROLE_DB_PATH)) {
  fs.writeFileSync(ROLE_DB_PATH, "{}")
}

/* ---------------- Load Ingredient Database ---------------- */

let ingredientRoles = {}

try {
  ingredientRoles = JSON.parse(fs.readFileSync(ROLE_DB_PATH))
} catch {
  ingredientRoles = {}
}

/* ---------------- Groq Setup ---------------- */

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
})

let lastRequestTime = 0

/* ---------------- Ingredient Role Classifier ---------------- */

async function classifyIngredientRole(ingredient) {

  const prompt = `
Classify the culinary role of the ingredient.

Ingredient: ${ingredient}

Possible roles:
sweetener
fat
acid
structure
flavor
fruit
nut
spice
liquid
thickener
protein

Return ONLY the role.
`

  const completion = await groq.chat.completions.create({
    model: "llama3-70b-8192",
    messages: [{ role: "user", content: prompt }],
    temperature: 0
  })

  return completion.choices[0].message.content.trim().toLowerCase()
}

/* ---------------- Dynamic Role Resolver ---------------- */

async function getIngredientRole(ingredient) {

  ingredient = ingredient.trim().toLowerCase()

  if (ingredientRoles[ingredient]) {
    return ingredientRoles[ingredient]
  }

  const role = await classifyIngredientRole(ingredient)

  ingredientRoles[ingredient] = role

  fs.writeFileSync(
    ROLE_DB_PATH,
    JSON.stringify(ingredientRoles, null, 2)
  )

  return role
}

/* ---------------- Ingredient Role Analyzer ---------------- */

async function analyzeIngredientRoles(recipe) {

  const roles = {}

  for (const item of recipe) {

    const ingredient = item.ingredient

    const role = await getIngredientRole(ingredient)

    if (!roles[role]) roles[role] = 0
    roles[role]++
  }

  return roles
}

/* ---------------- Ratio Analyzer ---------------- */

function analyzeRatios(recipe) {

  let liquid = 0
  let fat = 0
  let sugar = 0

  for (const item of recipe) {

    const qty = Number(item.quantity) || 0

    if (item.unit === "ml") liquid += qty

    if (item.ingredient.includes("cream") || item.ingredient.includes("butter")) {
      fat += qty
    }

    if (item.ingredient.includes("sugar")) {
      sugar += qty
    }

  }

  return { liquid, fat, sugar }
}

/* ---------------- Improved Texture Engine ---------------- */

function predictTexture(roles, ratios, recipe) {

  const textures = []

  const fat = roles.fat || 0
  const liquid = roles.liquid || 0
  const structure = roles.structure || 0
  const thickener = roles.thickener || 0
  const protein = roles.protein || 0

  if (liquid >= 1 && protein >= 1) {
    textures.push("smooth custard-like body")
  }

  if (liquid >= 1 && fat >= 1 && structure === 0) {
    textures.push("creamy pudding or mousse consistency")
  }

  if (fat >= 1 && liquid >= 1) {
    textures.push("rich velvety mouthfeel")
  }

  if (structure >= 1) {
    textures.push("structured baked crumb texture")
  }

  if (thickener >= 1) {
    textures.push("gelled or thickened dessert texture")
  }

  /* method based influence */

  for (const item of recipe) {

    if (item.method === "whipped") {
      textures.push("light airy structure from whipping")
    }

    if (item.method === "heated") {
      textures.push("heat activated thickening")
    }

    if (item.method === "chilled") {
      textures.push("firm set texture after cooling")
    }

  }

  if (textures.length === 0) {
    textures.push("texture difficult to determine due to missing structural components")
  }

  return textures.join(", ")
}

/* ---------------- Dessert Evaluation ---------------- */

app.post("/evaluate", async (req, res) => {

  console.log("Evaluation request received")

  const now = Date.now()

  if (now - lastRequestTime < 1500) {
    return res.json({
      score: 0,
      flavorAnalysis: "Please wait before evaluating again.",
      textureAnalysis: "",
      creativity: "",
      suggestions: [],
      roles: {}
    })
  }

  lastRequestTime = now

  const recipeText = req.body.recipeText

  if (!recipeText) {
    return res.json({ error: "Recipe text missing" })
  }

  try {
    // 1. Parse natural language into structured array
    const parsingPrompt = `
You are a culinary data extractor. 
Convert the following recipe text into a structured JSON array of ingredients.

Recipe Text:
${recipeText}

Return STRICT JSON ONLY. It must be an array of objects.

[
  {
    "ingredient": "string (name of ingredient)",
    "quantity": "number or string (amount)",
    "unit": "string (ml, g, cup, tbsp, etc. Leave empty if none)",
    "method": "string (chopped, heated, mixed, etc. Leave empty if none)"
  }
]
`
    const parsingCompletion = await groq.chat.completions.create({
      model: "llama3-70b-8192",
      messages: [{ role: "user", content: parsingPrompt }],
      temperature: 0.1
    })

    const parsingText = parsingCompletion.choices[0].message.content
    const parsingMatch = parsingText.match(/\[[\s\S]*\]/)

    if (!parsingMatch) {
      throw new Error("Failed to parse recipe text into structured JSON")
    }

    const recipe = JSON.parse(parsingMatch[0])

    // Fallback if parsing returns empty
    if (!recipe || recipe.length === 0) {
      throw new Error("Parsed recipe is empty")
    }

    const ingredientText = recipe
      .map(i => `${i.ingredient} ${i.quantity}${i.unit} ${i.method}`)
      .join(", ")

    try {

      const roleAnalysis = await analyzeIngredientRoles(recipe)

      const ratioData = analyzeRatios(recipe)

      const texturePrediction = predictTexture(roleAnalysis, ratioData, recipe)

      const prompt = `
You are a professional pastry chef and food scientist.

Evaluate the following dessert recipe for flavor, texture, and nutritional balance.

Recipe:
${ingredientText}

Return STRICT JSON ONLY.

{
"score": number,
"flavorAnalysis": "short paragraph",
"creativity": "short paragraph",
"suggestions": ["suggestion1","suggestion2"],
"healthScore": number,
"healthySwap": "one sentence suggestion"
}

Rules:
- Score from 0 to 100
- healthScore from 0 to 10
- Only use provided ingredients
- Do NOT invent ingredients
`

      const completion = await groq.chat.completions.create({
        model: "llama3-70b-8192",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3
      })

      const text = completion.choices[0].message.content

      const jsonMatch = text.match(/\{[\s\S]*\}/)

      if (!jsonMatch) {
        throw new Error("JSON not detected")
      }

      const parsed = JSON.parse(jsonMatch[0])

      const normalizedScore = Math.round(parsed.score / 10)

      res.json({
        score: normalizedScore,
        flavorAnalysis: parsed.flavorAnalysis,
        creativity: parsed.creativity,
        suggestions: parsed.suggestions,
        textureAnalysis: texturePrediction,
        roles: roleAnalysis,
        healthScore: parsed.healthScore || 5,
        healthySwap: parsed.healthySwap || "Focus on natural sweeteners."
      })

    } catch (err) {

      console.log("Evaluation error:", err)

      res.json({
        score: 5,
        flavorAnalysis: "AI evaluation failed.",
        textureAnalysis: "Unable to evaluate texture.",
        creativity: "Unknown",
        suggestions: ["Check ingredient balance"],
        healthScore: 5,
        healthySwap: "Unable to evaluate nutrition.",
        roles: {}
      })
    }
  } catch (err) {
    console.log("Parsing error:", err)
    res.json({ error: "Failed to parse recipe from text. Please ensure it contains ingredients." })
  }

})

/* ---------------- Flavor Lab Analyst ---------------- */
app.post("/analyze-flavor", async (req, res) => {

  console.log("Flavor Lab request received")

  const { ingredient1, ingredient2 } = req.body

  if (!ingredient1 || !ingredient2) {
    return res.json({ error: "Two ingredients are required for analysis." })
  }

  try {
    const prompt = `
You are a world-class food scientist and sensory analyst.

Analyze the flavor synergy between these two ingredients:
1. ${ingredient1}
2. ${ingredient2}

Provide a scientific yet accessible explanation of why they do (or do not) work together. Mention aromatic compounds, flavor profiles (sweet, salty, etc.), and texture contrasts.

Return STRICT JSON ONLY.

{
"flavorAnalysis": "a detailed 2-3 sentence analysis"
}
`

    const completion = await groq.chat.completions.create({
      model: "llama3-70b-8192",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.6
    })

    const text = completion.choices[0].message.content
    const jsonMatch = text.match(/\{[\s\S]*\}/)

    if (!jsonMatch) {
      throw new Error("JSON not detected")
    }

    res.json(JSON.parse(jsonMatch[0]))

  } catch (err) {
    console.log("Flavor Analysis error:", err)
    res.json({
      flavorAnalysis: `The pairing of ${ingredient1} and ${ingredient2} offers an intriguing sensory profile, often working well when balanced properly in experimental desserts.`
    })
  }

})

/* ---------------- Dessert Generator ---------------- */

app.post("/generate", async (req, res) => {

  console.log("Generator request received")

  const theme = req.body.theme
  const isHealthy = req.body.isHealthy || false

  try {

    const prompt = `
You are a professional pastry chef.

Create a dessert recipe based on this theme:
${theme}

${isHealthy ? "NOTE: This must be a HEALTHY or LOW-CALORIE version. Prioritize monk fruit, almond flour, avocado, or natural fruits." : ""}

Return STRICT JSON ONLY.

{
"name":"dessert name",
"ingredients":["ingredient1","ingredient2","ingredient3"],
"steps":["step1","step2","step3","step4"]
}

Rules:
- Use 5–8 ingredients
- Keep the recipe realistic
`

    const completion = await groq.chat.completions.create({
      model: "llama3-70b-8192",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7
    })

    const text = completion.choices[0].message.content

    const jsonMatch = text.match(/\{[\s\S]*\}/)

    if (!jsonMatch) {
      throw new Error("JSON not detected")
    }

    const parsed = JSON.parse(jsonMatch[0])

    res.json(parsed)

  } catch (err) {

    console.log("Generator error:", err)

    res.json({
      name: "Generation failed",
      ingredients: [],
      steps: []
    })
  }
})

/* ---------------- Start Server ---------------- */

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("AI server running on port", PORT);
});