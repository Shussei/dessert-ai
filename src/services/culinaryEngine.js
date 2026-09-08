import { metrics } from "../components/SystemMetricsWidget"

const API_BASE = import.meta.env.VITE_API_URL || ""

async function apiRequest(endpoint, body, timeoutMs = 35000) {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)
  const start = performance.now()

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    })

    clearTimeout(timeoutId)
    const elapsed = Math.round(performance.now() - start)

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}))
      const errorMsg = errData.error || `Server returned ${res.status}`
      metrics.update("AI Error", elapsed, false)
      throw new Error(errorMsg)
    }

    const result = await res.json()
    metrics.update("Live AI Engine", elapsed, true)
    return result
  } catch (err) {
    clearTimeout(timeoutId)
    const elapsed = Math.round(performance.now() - start)
    if (err.name === "AbortError") {
      metrics.update("Timeout", elapsed, false)
      throw new Error("Request timed out. The AI service took too long to respond.")
    }
    if (err.message?.includes("Failed to fetch") || err.message?.includes("NetworkError")) {
      metrics.update("Offline", elapsed, false)
      throw new Error("Could not connect to the analysis server. Please ensure the backend is running.")
    }
    metrics.update("Error", elapsed, false)
    throw err
  }
}

export async function evaluateDessertRecipe(recipeText) {
  return apiRequest("/evaluate", { recipeText })
}

export async function analyzeFlavorPairing(ingredient1, ingredient2) {
  return apiRequest("/analyze-flavor", { ingredient1, ingredient2 })
}

export async function generateRecipe(data) {
  return apiRequest("/generate", data)
}

export async function reformulateRecipe(recipeText, dietaryTarget) {
  return apiRequest("/reformulate", { recipeText, dietaryTarget })
}

export async function checkHealth() {
  try {
    const res = await fetch(`${API_BASE}/health`)
    return await res.json()
  } catch {
    return { status: "unavailable", aiAvailable: false }
  }
}
