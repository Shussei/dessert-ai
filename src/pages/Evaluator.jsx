import { useState } from "react"
import { evaluateDessertRecipe } from "../services/culinaryEngine"
import LayerBlueprint from "../components/LayerBlueprint"
import FlavorRadar from "../components/FlavorRadar"
import OptimizationEngine from "../components/OptimizationEngine"
import QRCodeModal from "../components/QRCodeModal"
import { useAuth } from "../context/AuthContext"
import { collection, addDoc, serverTimestamp } from "firebase/firestore"
import { db } from "../firebase"

const EXAMPLE_RECIPES = [
  {
    label: "Chocolate Entremet",
    text: `Dark Chocolate & Passion Fruit Entremet
Base: 150g Hazelnut Sablé Breton
Core: 100ml Passion Fruit gelée insert
Body: 200g 70% Dark Chocolate Bavarian Mousse
Glaze: Glossy Cocoa Mirror Glaze
Garnish: Gold Leaf & Dehydrated Tuile`,
  },
  {
    label: "Lemon Meringue",
    text: `Deconstructed Lemon Meringue
Base: 120g Shortbread Crumble
Core: 80ml Meyer Lemon Curd
Body: 150g Italian Meringue Torchon
Coating: Citrus Mirror Glaze
Garnish: Candied Lemon Zest`,
  },
]

const ANALYSIS_STAGES = [
  "Parsing recipe structure...",
  "Classifying ingredient roles...",
  "Evaluating flavor relationships...",
  "Building structural blueprint...",
  "Generating recommendations...",
]

function ProvenanceTag({ type = "AI-Estimated" }) {
  const styles = {
    "AI-Estimated": "bg-caramel-100 text-caramel-700 border-caramel-300",
    "AI-Predicted": "bg-dustyrose-100 text-dustyrose-700 border-dustyrose-200",
    "Culinary Reference": "bg-sage-100 text-sage-700 border-sage-200",
    "Data-Derived": "bg-cream-200 text-chocolate-500 border-cream-300",
  }
  return (
    <span className={`provenance-tag ${styles[type] || styles["AI-Estimated"]}`}>
      {type}
    </span>
  )
}

function LevelBadge({ level }) {
  if (!level) return null
  const styles = {
    low: "bg-dustyrose-100 text-dustyrose-700 border-dustyrose-200",
    moderate: "bg-caramel-100 text-caramel-700 border-caramel-300",
    high: "bg-sage-100 text-sage-700 border-sage-200",
    weak: "bg-dustyrose-100 text-dustyrose-700 border-dustyrose-200",
    balanced: "bg-sage-100 text-sage-700 border-sage-200",
    dominant: "bg-caramel-100 text-caramel-700 border-caramel-300",
  }
  return (
    <span className={`provenance-tag ${styles[level.toLowerCase()] || styles.moderate}`}>
      {level}
    </span>
  )
}

export default function Evaluator() {
  const [recipeName, setRecipeName] = useState("")
  const [ingredients, setIngredients] = useState("")
  const [preparation, setPreparation] = useState("")
  const [context, setContext] = useState("")
  const [analysis, setAnalysis] = useState(null)
  const [loading, setLoading] = useState(false)
  const [loadingStage, setLoadingStage] = useState(0)
  const [error, setError] = useState("")
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [showQR, setShowQR] = useState(false)
  const { user } = useAuth()

  function loadExample(example) {
    const lines = example.text.split("\n")
    setRecipeName(lines[0] || "")
    setIngredients(lines.slice(1).join("\n"))
    setPreparation("")
    setContext("")
    setAnalysis(null)
    setError("")
  }

  function buildRecipeText() {
    let text = ""
    if (recipeName.trim()) text += recipeName.trim() + "\n"
    if (ingredients.trim()) text += ingredients.trim() + "\n"
    if (preparation.trim()) text += "\nPreparation:\n" + preparation.trim() + "\n"
    if (context.trim()) text += "\nContext: " + context.trim() + "\n"
    return text.trim()
  }

  async function handleAnalyze() {
    const fullText = buildRecipeText()
    if (!fullText) {
      setError("Please enter a recipe name and at least some ingredients or preparation details.")
      return
    }
    if (fullText.split(/\s+/).length < 4) {
      setError("Recipe text is too short. Please provide more detail about the ingredients and method.")
      return
    }

    setError("")
    setAnalysis(null)
    setLoading(true)
    setLoadingStage(0)

    const stageInterval = setInterval(() => {
      setLoadingStage(prev => Math.min(prev + 1, ANALYSIS_STAGES.length - 1))
    }, 2000)

    try {
      const resp = await evaluateDessertRecipe(fullText)
      setAnalysis(resp.data)
      setSaved(false)
    } catch (err) {
      if (err.message?.includes("Could not connect")) {
        setError("Analysis unavailable. Could not connect to the analysis server. Please ensure the backend is running.")
      } else if (err.message?.includes("timed out") || err.message?.includes("timeout")) {
        setError("Analysis unavailable. The AI service took too long to respond. Try a shorter recipe.")
      } else {
        setError(err.message || "Analysis unavailable. The AI service could not complete this request.")
      }
    } finally {
      clearInterval(stageInterval)
      setLoading(false)
      setLoadingStage(0)
    }
  }

  async function handleSave() {
    if (!user || !analysis) return
    setSaving(true)
    try {
      await addDoc(collection(db, "library"), {
        uid: user.uid,
        name: recipeName.trim() || analysis.recipeName || "Untitled Recipe",
        type: "evaluated",
        recipeText: buildRecipeText(),
        ...analysis,
        createdAt: serverTimestamp(),
      })
      setSaved(true)
    } catch (err) {
      console.error("Save failed:", err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">

      {/* Header */}
      <div className="border-b border-cream-300 pb-6">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span className="badge-warm">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            Recipe Analysis
          </span>
          <span className="text-xs text-chocolate-300 font-mono">SavorSense Evaluation Engine</span>
        </div>
        <h1 className="section-heading">Recipe Evaluator & Architecture Studio</h1>
        <p className="section-subheading">
          Deconstruct any dessert into a structural blueprint with AI analysis, sensory profiling,
          and explainable recommendations
        </p>
      </div>

      {/* Input Form */}
      <div className="card-warm p-6 space-y-5">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h2 className="font-display text-lg font-bold text-chocolate-900">Recipe Input</h2>
          <div className="flex gap-3">
            {EXAMPLE_RECIPES.map((ex) => (
              <button
                key={ex.label}
                onClick={() => loadExample(ex)}
                className="text-[11px] font-medium text-caramel-600 hover:text-caramel-700 underline underline-offset-2 transition-colors"
              >
                {ex.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="recipe-name" className="text-xs font-semibold text-chocolate-600 uppercase tracking-wider">
            Recipe Name
          </label>
          <input
            id="recipe-name"
            type="text"
            value={recipeName}
            onChange={(e) => setRecipeName(e.target.value)}
            placeholder="e.g. Dark Chocolate & Passion Fruit Entremet"
            className="input-warm"
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="ingredients" className="text-xs font-semibold text-chocolate-600 uppercase tracking-wider">
            Ingredients & Composition
          </label>
          <textarea
            id="ingredients"
            rows={5}
            value={ingredients}
            onChange={(e) => setIngredients(e.target.value)}
            placeholder={`List ingredients and structural components:\nBase: 150g Hazelnut Sablé Breton\nCore: 100ml Passion Fruit gelée insert\nBody: 200g Dark Chocolate Bavarian Mousse\n...`}
            className="input-warm resize-none font-mono text-xs leading-relaxed"
            disabled={loading}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="prep" className="text-xs font-semibold text-chocolate-600 uppercase tracking-wider">
              Preparation Method
            </label>
            <textarea
              id="prep"
              rows={4}
              value={preparation}
              onChange={(e) => setPreparation(e.target.value)}
              placeholder="Describe the preparation steps, temperatures, timing..."
              className="input-warm resize-none font-mono text-xs leading-relaxed"
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="context" className="text-xs font-semibold text-chocolate-600 uppercase tracking-wider">
              Optional Context
              <span className="text-chocolate-300 font-normal ml-1">{"(e.g. 'for a competition')"}</span>
            </label>
            <textarea
              id="context"
              rows={4}
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="Any additional context for the AI analysis..."
              className="input-warm resize-none font-mono text-xs leading-relaxed"
              disabled={loading}
            />
          </div>
        </div>

        <button
          onClick={handleAnalyze}
          disabled={loading || (!recipeName.trim() && !ingredients.trim())}
          className="btn-primary w-full sm:w-auto flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Analyzing Recipe...
            </>
          ) : (
            <>Analyze Recipe</>
          )}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 rounded-xl bg-dustyrose-50 border border-dustyrose-200 flex items-start gap-3 animate-fade-in" role="alert">
          <svg className="w-5 h-5 text-dustyrose-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="text-sm font-semibold text-dustyrose-700">Analysis Error</p>
            <p className="text-xs text-dustyrose-600 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Loading with Stage Display */}
      {loading && (
        <div className="card-warm p-8 animate-fade-in">
          <div className="flex flex-col items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-caramel-100 border border-caramel-300 flex items-center justify-center">
              <svg className="w-8 h-8 text-caramel-500 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <div className="text-center">
              <p className="text-sm font-bold text-chocolate-900 mb-3">AI Analysis in Progress</p>
              <ul className="space-y-1.5 text-left">
                {ANALYSIS_STAGES.map((stage, idx) => (
                  <li
                    key={idx}
                    className="flex items-center gap-2 text-xs transition-opacity duration-300"
                    style={{ opacity: idx <= loadingStage ? 1 : 0.3 }}
                  >
                    {idx < loadingStage ? (
                      <svg className="w-3.5 h-3.5 text-sage-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : idx === loadingStage ? (
                      <svg className="w-3.5 h-3.5 text-caramel-500 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                    ) : (
                      <span className="w-3.5 h-3.5 rounded-full border border-cream-300" aria-hidden="true" />
                    )}
                    <span className={idx <= loadingStage ? "text-chocolate-700 font-medium" : "text-chocolate-300"}>
                      {stage}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {analysis && !loading && (
        <div className="space-y-6 animate-fade-in-up">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <h2 className="font-display text-xl font-bold text-chocolate-900">
                {analysis.recipeName || recipeName.trim() || "Analysis Results"}
              </h2>
              <ProvenanceTag type="AI-Estimated" />
            </div>
            <div className="flex items-center gap-2">
              {user ? (
                <button
                  onClick={handleSave}
                  disabled={saving || saved}
                  className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all flex items-center gap-2 ${
                    saved ? "bg-sage-100 text-sage-600 border border-sage-300" : "btn-secondary"
                  } disabled:opacity-50`}
                >
                  {saved ? "Saved ✓" : saving ? "Saving..." : "Save to Library"}
                </button>
              ) : (
                <a href="/auth" className="text-xs text-caramel-600 hover:underline">Sign in to save</a>
              )}
              <button onClick={() => setShowQR(true)} className="btn-secondary text-sm">Share</button>
            </div>
          </div>

          {/* Ingredients */}
          {Array.isArray(analysis.ingredients) && analysis.ingredients.length > 0 && (
            <div className="card-warm p-6">
              <div className="flex items-center gap-2 mb-3">
                <h3 className="font-display text-lg font-bold text-chocolate-900">Ingredients & Roles</h3>
                <ProvenanceTag type="Data-Derived" />
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-cream-100 text-chocolate-500 font-mono uppercase text-[10px] border-b border-cream-200">
                    <tr>
                      <th className="py-2.5 px-3 text-left">Ingredient</th>
                      <th className="py-2.5 px-3 text-left">Quantity</th>
                      <th className="py-2.5 px-3 text-left">Role</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-cream-200">
                    {analysis.ingredients.map((ing, idx) => (
                      <tr key={idx} className="hover:bg-cream-50 transition-colors">
                        <td className="py-2.5 px-3 text-chocolate-700 capitalize">{ing.name}</td>
                        <td className="py-2.5 px-3 text-chocolate-500 font-mono text-xs">{ing.quantity || "—"}</td>
                        <td className="py-2.5 px-3">
                          <span className="provenance-tag bg-cream-200 text-chocolate-600 border-cream-300 capitalize">
                            {ing.role || "other"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Structural Layers */}
          {Array.isArray(analysis.structuralLayers) && analysis.structuralLayers.length > 0 && (
            <LayerBlueprint layers={analysis.structuralLayers} />
          )}

          {/* Sensory Profile */}
          {analysis.sensoryProfile && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <FlavorRadar radarData={analysis.sensoryProfile} title="Sensory Profile" />
              <div className="card-warm p-6">
                <div className="flex items-center gap-2 mb-4">
                  <h3 className="font-display text-lg font-bold text-chocolate-900">Dimension Analysis</h3>
                  <ProvenanceTag type="AI-Estimated" />
                </div>
                <div className="space-y-3">
                  {Object.entries(analysis.sensoryProfile).map(([key, val]) => (
                    <div key={key} className="p-3 rounded-xl bg-cream-50 border border-cream-200">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-chocolate-700 capitalize">
                          {key.replace(/([A-Z])/g, " $1")}
                        </span>
                        <LevelBadge level={val?.level} />
                      </div>
                      {val?.explanation && (
                        <p className="text-xs text-chocolate-500 leading-relaxed">{val.explanation}</p>
                      )}
                    </div>
                  ))}
                </div>
                {analysis.metadata?.disclaimer && (
                  <p className="text-[10px] text-chocolate-400 italic mt-4">
                    {analysis.metadata.disclaimer}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Flavor Interactions */}
          {Array.isArray(analysis.flavorInteractions) && analysis.flavorInteractions.length > 0 && (
            <div className="card-warm p-6">
              <div className="flex items-center gap-2 mb-3">
                <h3 className="font-display text-lg font-bold text-chocolate-900">Flavor Interactions</h3>
                <ProvenanceTag type="AI-Estimated" />
              </div>
              <div className="space-y-2">
                {analysis.flavorInteractions.map((fi, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-cream-50 border border-cream-200 text-sm">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-chocolate-800">
                        {(fi.ingredients || []).join(" + ")}
                      </span>
                      {fi.relationship && <LevelBadge level={fi.relationship} />}
                      {fi.confidence && (
                        <span className="text-[10px] font-mono text-chocolate-400">{fi.confidence} confidence</span>
                      )}
                    </div>
                    {fi.explanation && <p className="text-xs text-chocolate-500 mt-1">{fi.explanation}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Strengths & Issues */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.isArray(analysis.strengths) && analysis.strengths.length > 0 && (
              <div className="p-5 rounded-2xl bg-sage-50 border border-sage-200">
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="font-display text-lg font-bold text-sage-700">Strengths</h3>
                  <ProvenanceTag type="AI-Estimated" />
                </div>
                <ul className="space-y-2">
                  {analysis.strengths.map((s, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <span className="text-sage-500 mt-0.5">•</span>
                      <div>
                        <p className="text-chocolate-700">{s.claim || s.text}</p>
                        {s.evidence && <p className="text-xs text-chocolate-500">{s.evidence}</p>}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {Array.isArray(analysis.potentialIssues) && analysis.potentialIssues.length > 0 && (
              <div className="p-5 rounded-2xl bg-dustyrose-50 border border-dustyrose-200">
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="font-display text-lg font-bold text-dustyrose-700">Potential Issues</h3>
                  <ProvenanceTag type="AI-Predicted" />
                </div>
                <ul className="space-y-2">
                  {analysis.potentialIssues.map((s, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <span className="text-dustyrose-500 mt-0.5">•</span>
                      <div>
                        <p className="text-chocolate-700">{s.claim || s.text}</p>
                        {s.evidence && <p className="text-xs text-chocolate-500">{s.evidence}</p>}
                        {s.severity && (
                          <span className="provenance-tag bg-dustyrose-100 text-dustyrose-600 border-dustyrose-200 capitalize mt-1">
                            {s.severity} severity
                          </span>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Recommendations */}
          {Array.isArray(analysis.recommendations) && analysis.recommendations.length > 0 && (
            <OptimizationEngine optimizations={analysis.recommendations} />
          )}

          {/* Assumptions & Limitations */}
          {((Array.isArray(analysis.assumptions) && analysis.assumptions.length > 0) ||
            (Array.isArray(analysis.limitations) && analysis.limitations.length > 0)) && (
            <div className="card-warm p-6">
              <div className="flex items-center gap-2 mb-3">
                <h3 className="font-display text-lg font-bold text-chocolate-900">Assumptions & Limitations</h3>
                <ProvenanceTag type="Data-Derived" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array.isArray(analysis.assumptions) && analysis.assumptions.length > 0 && (
                  <div>
                    <h4 className="text-[10px] font-mono uppercase text-chocolate-400 mb-2">Assumptions</h4>
                    <ul className="space-y-1.5">
                      {analysis.assumptions.map((a, idx) => (
                        <li key={idx} className="text-xs text-chocolate-500 flex items-start gap-2">
                          <span className="text-caramel-400 mt-0.5">•</span>
                          <span>{a}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {Array.isArray(analysis.limitations) && analysis.limitations.length > 0 && (
                  <div>
                    <h4 className="text-[10px] font-mono uppercase text-chocolate-400 mb-2">Limitations</h4>
                    <ul className="space-y-1.5">
                      {analysis.limitations.map((a, idx) => (
                        <li key={idx} className="text-xs text-chocolate-500 flex items-start gap-2">
                          <span className="text-dustyrose-400 mt-0.5">•</span>
                          <span>{a}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Serving info */}
          {analysis.servingInfo && (
            <div className="card-warm p-4 flex flex-wrap gap-6 text-xs font-mono text-chocolate-500">
              {analysis.servingInfo.temperature && (
                <span><span className="text-chocolate-400">Serving temp:</span> {analysis.servingInfo.temperature}</span>
              )}
              {analysis.servingInfo.shelfStability && (
                <span><span className="text-chocolate-400">Shelf stability:</span> {analysis.servingInfo.shelfStability}</span>
              )}
              {analysis.servingInfo.difficulty && (
                <span><span className="text-chocolate-400">Difficulty:</span> <span className="capitalize">{analysis.servingInfo.difficulty}</span></span>
              )}
            </div>
          )}
        </div>
      )}

      <QRCodeModal
        isOpen={showQR}
        onClose={() => setShowQR(false)}
        recipeName={recipeName.trim() || analysis?.recipeName || "Recipe Analysis"}
      />
    </div>
  )
}
