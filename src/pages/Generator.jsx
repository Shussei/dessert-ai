import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { collection, addDoc } from "firebase/firestore"
import { generateRecipe } from "../services/culinaryEngine"
import { useAuth } from "../context/AuthContext"
import { db } from "../firebase"

const LOADING_STAGES = [
  "Parsing flavor concept",
  "Consulting culinary knowledge base",
  "Architecting structural layers",
  "Calibrating technique & timings",
  "Polishing plating & finish",
]

const DIETARY_OPTIONS = [
  { value: "none", label: "None" },
  { value: "vegan", label: "Vegan" },
  { value: "gluten-free", label: "Gluten-Free" },
  { value: "keto", label: "Keto" },
]

const DEFAULT_DISCLAIMER = "Recipe is AI-generated. Verify technique and timing in practice."

function SectionCard({ number, title, children }) {
  return (
    <div className="card-warm p-6 sm:p-8">
      <div className="flex items-center gap-3 mb-5">
        <span className="w-8 h-8 rounded-lg bg-caramel-100 border border-caramel-300 text-caramel-700 font-display font-bold text-sm flex items-center justify-center shrink-0">
          {number}
        </span>
        <h2 className="font-display text-lg sm:text-xl font-bold text-chocolate-900">{title}</h2>
      </div>
      {children}
    </div>
  )
}

function IngredientTable({ items }) {
  const list = Array.isArray(items) ? items : []
  if (list.length === 0) {
    return <p className="text-sm text-chocolate-400 italic">No structured ingredient data returned.</p>
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-cream-300 text-chocolate-400 text-xs uppercase tracking-wider">
            <th className="py-2.5 pr-4 font-semibold">Ingredient</th>
            <th className="py-2.5 pr-4 font-semibold">Quantity</th>
            <th className="py-2.5 font-semibold">Function</th>
          </tr>
        </thead>
        <tbody>
          {list.map((ing, i) => (
            <tr key={i} className="border-b border-cream-200 last:border-0">
              <td className="py-2.5 pr-4 font-medium text-chocolate-900">{ing.name || "—"}</td>
              <td className="py-2.5 pr-4 font-mono text-xs text-chocolate-600 whitespace-nowrap">{ing.quantity || "—"}</td>
              <td className="py-2.5 text-chocolate-500">{ing.role || "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function PreparationList({ steps }) {
  const list = Array.isArray(steps) ? steps : []
  if (list.length === 0) {
    return <p className="text-sm text-chocolate-400 italic">No structured preparation steps returned.</p>
  }
  return (
    <ol className="space-y-4">
      {list.map((step, i) => (
        <li key={i} className="flex gap-4">
          <span className="w-8 h-8 rounded-full bg-chocolate-600 text-white font-mono text-xs font-bold flex items-center justify-center shrink-0">
            {step.step || i + 1}
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-chocolate-800 leading-relaxed">{step.instruction || "—"}</p>
            <div className="flex flex-wrap gap-2 mt-2 text-[11px] font-mono text-chocolate-500">
              {step.technique && <span className="px-2 py-0.5 rounded-md bg-cream-200 border border-cream-300">{step.technique}</span>}
              {step.temperature && <span className="px-2 py-0.5 rounded-md bg-dustyrose-50 border border-dustyrose-200">{step.temperature}</span>}
              {step.time && <span className="px-2 py-0.5 rounded-md bg-caramel-100 border border-caramel-300">{step.time}</span>}
            </div>
          </div>
        </li>
      ))}
    </ol>
  )
}

function FailurePoints({ points }) {
  const list = Array.isArray(points) ? points : []
  if (list.length === 0) {
    return <p className="text-sm text-chocolate-400 italic">No known failure points flagged.</p>
  }
  return (
    <div className="space-y-4">
      {list.map((point, i) => (
        <div key={i} className="rounded-xl bg-dustyrose-50 border border-dustyrose-200 p-4">
          <p className="text-sm font-semibold text-dustyrose-700 mb-1">{point.issue || "Potential issue"}</p>
          {point.prevention && <p className="text-sm text-chocolate-500 leading-relaxed">{point.prevention}</p>}
        </div>
      ))}
    </div>
  )
}

function Substitutions({ subs }) {
  const list = Array.isArray(subs) ? subs : []
  if (list.length === 0) {
    return <p className="text-sm text-chocolate-400 italic">No substitutions suggested.</p>
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {list.map((sub, i) => (
        <div key={i} className="rounded-xl bg-cream-200/60 border border-cream-300 p-4">
          <div className="text-xs font-mono text-chocolate-400 mb-1">Replace {sub.original || "—"}</div>
          <p className="text-sm font-semibold text-chocolate-900">{sub.alternative || "—"}</p>
          {sub.note && <p className="text-xs text-chocolate-500 mt-1 leading-relaxed">{sub.note}</p>}
        </div>
      ))}
    </div>
  )
}

export default function Generator() {
  const { user } = useAuth()
  const [flavor, setFlavor] = useState("")
  const [ingredients, setIngredients] = useState("")
  const [dietary, setDietary] = useState("none")
  const [style, setStyle] = useState("Haute Pâtisserie")
  const [loading, setLoading] = useState(false)
  const [stageIndex, setStageIndex] = useState(0)
  const [result, setResult] = useState(null)
  const [metadata, setMetadata] = useState({})
  const [error, setError] = useState("")
  const [saveState, setSaveState] = useState(null)

  useEffect(() => {
    if (!loading) return
    const interval = setInterval(() => {
      setStageIndex((i) => (i + 1) % LOADING_STAGES.length)
    }, 2600)
    return () => clearInterval(interval)
  }, [loading])

  async function handleGenerate(e) {
    e.preventDefault()
    setError("")
    setSaveState(null)
    if (!flavor.trim() && !ingredients.trim()) {
      setError("Provide at least a flavor concept or a key ingredient list.")
      return
    }
    setLoading(true)
    setStageIndex(0)
    setResult(null)
    try {
      const response = await generateRecipe({
        flavor,
        ingredients,
        dietary: dietary === "none" ? "No dietary restrictions" : dietary,
        style,
      })
      setResult(response.data)
      setMetadata(response.metadata || {})
    } catch (err) {
      setError(err.message || "Recipe generation failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    if (!user) {
      setSaveState({ type: "info", text: "Sign in to save recipes to your library." })
      return
    }
    if (!result) return
    try {
      await addDoc(collection(db, "library"), {
        ...result,
        uid: user.uid,
        name: result.concept || "Untitled AI Recipe",
        type: "generated",
        flavorAnalysis: result.flavorProfile?.description || "AI-generated dessert concept.",
        createdAt: new Date(),
      })
      setSaveState({ type: "success", text: "Saved to your library." })
    } catch (err) {
      console.error("Save to library failed:", err)
      setSaveState({ type: "error", text: "Could not save. Please try again." })
    }
  }

  const disclaimer = metadata.disclaimer || DEFAULT_DISCLAIMER
  const recipe = result || {}

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
      <header className="animate-fade-in-up">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="badge-warm">AI Pastry Chef</span>
          <span className="text-xs text-chocolate-400 font-mono">SavorSense Generator</span>
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-chocolate-900 tracking-tight">
          AI Recipe Generator
        </h1>
        <p className="text-chocolate-500 mt-2 max-w-2xl text-sm sm:text-base leading-relaxed">
          Describe a flavor direction and the engine drafts a full pâtisserie specification — ingredients, technique
          workflow, assembly, storage, and risk points.
        </p>
      </header>

      <form onSubmit={handleGenerate} className="card-warm p-6 sm:p-8 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="sm:col-span-2">
            <label htmlFor="flavor" className="block text-xs font-semibold text-chocolate-700 uppercase tracking-wider mb-2">
              Flavor Concept
            </label>
            <input
              id="flavor"
              type="text"
              className="input-warm"
              placeholder="e.g. Smoked vanilla & burnt honey with toasted hazelnut"
              value={flavor}
              onChange={(e) => setFlavor(e.target.value)}
            />
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="ingredients" className="block text-xs font-semibold text-chocolate-700 uppercase tracking-wider mb-2">
              Key Ingredients
            </label>
            <textarea
              id="ingredients"
              rows="3"
              className="input-warm resize-none"
              placeholder="e.g. dark chocolate 70%, passion fruit puree, gelatin, almond flour"
              value={ingredients}
              onChange={(e) => setIngredients(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="dietary" className="block text-xs font-semibold text-chocolate-700 uppercase tracking-wider mb-2">
              Dietary Requirements
            </label>
            <select
              id="dietary"
              className="input-warm"
              value={dietary}
              onChange={(e) => setDietary(e.target.value)}
            >
              {DIETARY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="style" className="block text-xs font-semibold text-chocolate-700 uppercase tracking-wider mb-2">
              Style
            </label>
            <input
              id="style"
              type="text"
              className="input-warm"
              value={style}
              onChange={(e) => setStyle(e.target.value)}
            />
          </div>
        </div>

        {error && (
          <div className="rounded-xl bg-dustyrose-50 border border-dustyrose-200 p-4 text-sm text-dustyrose-700 leading-relaxed">
            {error}
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Generating..." : "Generate Recipe"}
          </button>
          <p className="text-xs text-chocolate-400 font-mono">
            Generate runs through the live AI engine.
          </p>
        </div>
      </form>

      {loading && (
        <div className="card-warm p-8 flex flex-col items-center text-center animate-fade-in">
          <svg className="animate-spin h-10 w-10 text-caramel-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="font-display text-lg font-bold text-chocolate-900 mb-1">
            Composing your pastry specification
          </p>
          <p className="text-sm text-caramel-600 font-mono mb-5">{LOADING_STAGES[stageIndex]}</p>
          <div className="flex gap-1.5">
            {LOADING_STAGES.map((_, i) => (
              <span
                key={i}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === stageIndex ? "bg-caramel-500 scale-125" : "bg-cream-300"
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {!loading && result && (
        <div className="space-y-6 animate-fade-in-up">
          <div className="card-warm p-6 sm:p-8">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="badge-warm">AI-Generated Recipe</span>
              <span className="provenance-tag bg-sage-100 text-sage-600 border border-sage-200">
                {metadata.source || "ai_generated"}
              </span>
              {metadata.model && (
                <span className="provenance-tag bg-cream-200 text-chocolate-500 border border-cream-300">
                  {metadata.model}
                </span>
              )}
              {metadata.tokensUsed != null && (
                <span className="provenance-tag bg-caramel-100 text-caramel-700 border border-caramel-300">
                  {metadata.tokensUsed} tokens
                </span>
              )}
            </div>

            <h2 className="font-display text-2xl sm:text-3xl font-bold text-chocolate-900 leading-snug">
              {recipe.concept || "Untitled Concept"}
            </h2>
            {recipe.flavorProfile?.description && (
              <p className="text-chocolate-500 mt-3 text-sm sm:text-base leading-relaxed">
                {recipe.flavorProfile.description}
              </p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6">
              <div className="rounded-xl bg-cream-200/60 border border-cream-300 p-4">
                <span className="block text-[10px] font-mono uppercase tracking-wider text-chocolate-400 mb-1">Yield</span>
                <span className="text-sm font-semibold text-chocolate-900">{recipe.yield || "—"}</span>
              </div>
              <div className="rounded-xl bg-cream-200/60 border border-cream-300 p-4">
                <span className="block text-[10px] font-mono uppercase tracking-wider text-chocolate-400 mb-1">Target Texture</span>
                <span className="text-sm font-semibold text-chocolate-900">{recipe.targetTexture || "—"}</span>
              </div>
              <div className="rounded-xl bg-cream-200/60 border border-cream-300 p-4">
                <span className="block text-[10px] font-mono uppercase tracking-wider text-chocolate-400 mb-1">Storage</span>
                <span className="text-sm font-semibold text-chocolate-900">{recipe.storage || "—"}</span>
              </div>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row sm:items-center gap-3">
              <button onClick={handleSave} className="btn-primary w-full sm:w-auto">
                {saveState?.type === "success" ? "✓ Saved to Library" : "Save to Library"}
              </button>
              {!user && (
                <Link to="/auth" className="text-xs text-caramel-600 font-semibold underline underline-offset-2 hover:text-caramel-700">
                  Sign in to save
                </Link>
              )}
              {saveState?.type === "success" && (
                <Link to="/library" className="text-xs text-chocolate-600 font-semibold underline underline-offset-2 hover:text-chocolate-800">
                  View your library →
                </Link>
              )}
            </div>
            {saveState && saveState.type !== "success" && (
              <p
                className={`text-xs mt-3 ${
                  saveState.type === "error" ? "text-dustyrose-600" : "text-caramel-600"
                }`}
              >
                {saveState.text}
              </p>
            )}

            <div className="mt-6 rounded-xl bg-dustyrose-50 border border-dustyrose-200 p-4">
              <p className="text-xs text-dustyrose-700 leading-relaxed">
                <span className="font-semibold">Provenance note:</span> {disclaimer}
                {metadata.requestId && (
                  <span className="block mt-1 font-mono text-[10px] text-dustyrose-500">
                    request {metadata.requestId}
                  </span>
                )}
              </p>
            </div>
          </div>

          <SectionCard number={1} title="Ingredient Architecture">
            <IngredientTable items={recipe.ingredients} />
          </SectionCard>

          <SectionCard number={2} title="Preparation Workflow">
            <PreparationList steps={recipe.preparation} />
          </SectionCard>

          <SectionCard number={3} title="Assembly & Finishing">
            <div className="space-y-5">
              <div>
                <h3 className="text-xs font-semibold text-chocolate-700 uppercase tracking-wider mb-2">Assembly</h3>
                <p className="text-sm text-chocolate-800 leading-relaxed">{recipe.assembly || "No assembly guidance returned."}</p>
              </div>
              <div>
                <h3 className="text-xs font-semibold text-chocolate-700 uppercase tracking-wider mb-2">Finishing</h3>
                <p className="text-sm text-chocolate-800 leading-relaxed">{recipe.finishing || "No finishing guidance returned."}</p>
              </div>
            </div>
          </SectionCard>

          <SectionCard number={4} title="Flavor Profile">
            <div className="flex flex-wrap gap-2 mb-4">
              {(recipe.flavorProfile?.primary || []).map((note, i) => (
                <span key={`p-${i}`} className="px-3 py-1 rounded-full bg-caramel-100 border border-caramel-300 text-caramel-700 text-xs font-semibold">
                  {note}
                </span>
              ))}
              {(recipe.flavorProfile?.secondary || []).map((note, i) => (
                <span key={`s-${i}`} className="px-3 py-1 rounded-full bg-cream-200 border border-cream-300 text-chocolate-600 text-xs font-semibold">
                  {note} <span className="text-chocolate-400 font-normal">· secondary</span>
                </span>
              ))}
            </div>
            {recipe.flavorProfile?.description && (
              <p className="text-sm text-chocolate-600 leading-relaxed">{recipe.flavorProfile.description}</p>
            )}
          </SectionCard>

          <SectionCard number={5} title="Potential Failure Points">
            <FailurePoints points={recipe.potentialFailurePoints} />
          </SectionCard>

          <SectionCard number={6} title="Substitutions">
            <Substitutions subs={recipe.substitutions} />
          </SectionCard>
        </div>
      )}
    </div>
  )
}