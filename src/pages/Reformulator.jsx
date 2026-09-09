import { useState } from "react"
import { reformulateRecipe } from "../services/culinaryEngine"
import SubstitutionCard from "../components/SubstitutionCard"
import { useAuth } from "../context/AuthContext"
import { collection, addDoc, serverTimestamp } from "firebase/firestore"
import { db } from "../firebase"

const DIETARY_TARGETS = [
  { value: "vegan", label: "Vegan", desc: "Plant-based adaptation" },
  { value: "gluten-free", label: "Gluten-Free", desc: "Gluten-free reformulation" },
  { value: "keto", label: "Keto", desc: "Low-carb, high-fat focus" },
]

const EXAMPLE_RECIPES = [
  {
    label: "Classic Tiramisu",
    text: "Classic Tiramisu\nLadyfinger biscuits soaked in espresso\nMascarpone cream with egg yolks and sugar\nCocoa powder dusting on top\nCoffee-flavored zabaglione layer",
  },
  {
    label: "Chocolate Lava Cake",
    text: "Chocolate Lava Cake\nDark chocolate (70%) ganache center\nButter and sugar base\nEggs and flour batter\nVanilla bean ice cream on the side",
  },
]

export default function Reformulator() {
  const [recipeText, setRecipeText] = useState("")
  const [dietaryTarget, setDietaryTarget] = useState("vegan")
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const { user } = useAuth()

  async function handleReformulate() {
    if (!recipeText.trim()) {
      setError("Please enter a recipe to reformulate.")
      return
    }
    if (recipeText.trim().split(/\s+/).length < 5) {
      setError("Recipe text is too short. Please provide more detail about the ingredients and method.")
      return
    }

    setError("")
    setResult(null)
    setLoading(true)

    try {
      const response = await reformulateRecipe(recipeText.trim(), dietaryTarget)
      setResult(response.data)
      setSaved(false)
    } catch (err) {
      if (err.message?.includes("Could not connect")) {
        setError("Could not connect to the analysis server. Please ensure the backend is running.")
      } else if (err.message?.includes("timed out") || err.message?.includes("timeout")) {
        setError("AI analysis timed out. Try a shorter or more specific recipe description.")
      } else {
        setError(err.message || "An unexpected error occurred during reformulation.")
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    if (!user || !result) return
    setSaving(true)
    try {
      await addDoc(collection(db, "library"), {
        uid: user.uid,
        name: `Reformulated: ${recipeText.split("\n")[0].trim().slice(0, 60) || "Recipe"}`,
        type: "reformulated",
        dietaryTarget,
        recipeText: recipeText.trim(),
        reformulationData: result,
        createdAt: serverTimestamp(),
      })
      setSaved(true)
    } catch (err) {
      console.error("Save failed:", err)
    } finally {
      setSaving(false)
    }
  }

  function ProvenanceTag({ type }) {
    const styles = {
      "AI-Generated": "bg-caramel-100 text-caramel-700 border border-caramel-300",
      "AI-Predicted": "bg-dustyrose-100 text-dustyrose-700 border border-dustyrose-200",
      "Culinary Reference": "bg-sage-100 text-sage-700 border border-sage-200",
    }
    return (
      <span className={`provenance-tag ${styles[type] || styles["AI-Generated"]}`}>
        {type}
      </span>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">

      {/* Header */}
      <div className="border-b border-cream-300 pb-6">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span className="badge-warm">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            Dietary Intelligence
          </span>
          <span className="text-xs text-chocolate-300 font-mono">SavorSense Reformulation Engine</span>
        </div>
        <h1 className="section-heading">Dietary Reformulation Lab</h1>
        <p className="section-subheading">
          Transform any recipe to meet dietary requirements with AI-powered ingredient substitution
        </p>
      </div>

      {/* Input Section */}
      <div className="card-warm p-6 space-y-5">

        {/* Recipe Input */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-chocolate-600 uppercase tracking-wider">
              Recipe to Reformulate
            </label>
            <div className="flex gap-2">
              {EXAMPLE_RECIPES.map((ex) => (
                <button
                  key={ex.label}
                  onClick={() => { setRecipeText(ex.text); setResult(null); setError("") }}
                  className="text-[10px] font-medium text-caramel-600 hover:text-caramel-700 underline underline-offset-2 transition-colors"
                >
                  {ex.label}
                </button>
              ))}
            </div>
          </div>
          <textarea
            rows={6}
            value={recipeText}
            onChange={(e) => setRecipeText(e.target.value)}
            placeholder={`Paste or type your recipe here...\n\nExample:\nClassic Chocolate Mousse\n- 200g dark chocolate (70%)\n- 4 eggs, separated\n- 100g sugar\n- 200ml heavy cream\n- Pinch of salt`}
            className="input-warm resize-none font-mono text-xs leading-relaxed"
            disabled={loading}
          />
          <p className="text-[10px] text-chocolate-300 font-mono">
            Include recipe name, ingredients, and preparation steps for best results
          </p>
        </div>

        {/* Dietary Target Selector */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-chocolate-600 uppercase tracking-wider">
            Dietary Target
          </label>
          <div className="grid grid-cols-3 gap-3">
            {DIETARY_TARGETS.map((target) => {
              const isActive = dietaryTarget === target.value
              return (
                <button
                  key={target.value}
                  onClick={() => { setDietaryTarget(target.value); setResult(null) }}
                  disabled={loading}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                    isActive
                      ? "bg-caramel-100 border-caramel-400 shadow-warm"
                      : "bg-white border-cream-300 hover:border-caramel-300 hover:bg-cream-50"
                  } disabled:opacity-50`}
                >
                  <span className={`text-sm font-bold block ${isActive ? "text-chocolate-900" : "text-chocolate-600"}`}>
                    {target.label}
                  </span>
                  <span className="text-[10px] text-chocolate-400 block mt-0.5">{target.desc}</span>
                  {isActive && (
                    <div className="mt-2">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-caramel-500 text-white text-[10px] font-bold">
                        <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        Selected
                      </span>
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        <button
          onClick={handleReformulate}
          disabled={loading || !recipeText.trim()}
          className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Reformulating Recipe...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Reformulate for {DIETARY_TARGETS.find(t => t.value === dietaryTarget)?.label}
            </>
          )}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 rounded-xl bg-dustyrose-50 border border-dustyrose-200 flex items-start gap-3 animate-fade-in">
          <svg className="w-5 h-5 text-dustyrose-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <div>
            <p className="text-sm font-semibold text-dustyrose-700">Reformulation Error</p>
            <p className="text-xs text-dustyrose-600 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="card-warm p-8 animate-fade-in">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-sage-100 border border-sage-200 flex items-center justify-center">
              <svg className="w-8 h-8 text-sage-500 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-chocolate-900">Reformulating Recipe</p>
              <div className="mt-2 space-y-1 text-xs text-chocolate-400">
                <p>Identifying incompatible ingredients...</p>
                <p>Researching dietary substitutes...</p>
                <p>Calculating texture adjustments...</p>
                <p>Evaluating baking parameter changes...</p>
              </div>
            </div>
            <div className="w-48 h-1.5 rounded-full bg-cream-200 overflow-hidden">
              <div className="h-full rounded-full bg-sage-400 animate-pulse" style={{ width: "70%" }} />
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {result && !loading && (
        <div className="space-y-6 animate-fade-in-up">

          {/* Overview */}
          <div className="card-warm p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-display text-xl font-bold text-chocolate-900">Reformulation Analysis</h2>
                  <ProvenanceTag type="AI-Generated" />
                </div>
                <p className="text-xs text-chocolate-400 mt-1">
                  {DIETARY_TARGETS.find(t => t.value === dietaryTarget)?.label} adaptation
                </p>
              </div>
              {result.overallAssessment && (
                <div className="bg-cream-100 px-4 py-2 rounded-xl border border-cream-300">
                  <span className="text-[10px] text-chocolate-400 block font-mono">Overall Assessment</span>
                  <span className="text-lg font-bold text-caramel-600 capitalize">
                    {result.overallAssessment.rating}
                  </span>
                  <span className="text-[10px] text-caramel-600 block font-mono">
                    {result.overallAssessment.confidence} confidence
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* SubstitutionCard (handles AI-estimated detail) */}
          <SubstitutionCard reformulationData={{ ...result, dietaryTarget }} />

          {/* Save to Library */}
          {user && (
            <div className="card-warm p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <p className="text-xs text-chocolate-400">
                Save this reformulation to your library for future reference.
              </p>
              <button
                onClick={handleSave}
                disabled={saving || saved}
                className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center gap-2 ${
                  saved
                    ? "bg-sage-100 text-sage-600 border border-sage-300"
                    : "btn-primary"
                } disabled:opacity-50`}
              >
                {saved ? (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    Saved to Library
                  </>
                ) : saving ? (
                  <>
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Saving...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                    </svg>
                    Save to Library
                  </>
                )}
              </button>
            </div>
          )}

          {!user && result && (
            <div className="card-warm p-4 text-center">
              <p className="text-xs text-chocolate-400">
                <a href="/auth" className="text-caramel-600 font-semibold hover:underline">Sign in</a> to save this reformulation to your personal library.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
