import { useState } from "react"
import { evaluateDessertRecipe } from "../services/culinaryEngine"
import LayerBlueprint from "../components/LayerBlueprint"
import FlavorRadar from "../components/FlavorRadar"

const SAMPLE_RECIPE = `70% Dark Chocolate & Yuzu Entremet.
Base: almond sablé breton with brown butter.
Core insert: yuzu gelée (yuzu juice, sugar, gelatin 200 bloom).
Main body: 70% dark chocolate mousse (dark chocolate, whole cream, egg yolks, sugar).
Coating: glossy cocoa mirror glaze.
Garnish: gold leaf and dehydrated raspberry powder.
Method: bloom gelatin, temper chocolate, fold aerated cream through 24°C ganache, layer in 18cm ring, glaze at 32°C, rest 12 hours at 4°C.`

const CONFIDENCE_STYLES = {
  high: "bg-sage-100 border-sage-200 text-sage-600",
  moderate: "bg-caramel-100 border-caramel-300 text-caramel-700",
  low: "bg-dustyrose-50 border-dustyrose-200 text-dustyrose-600",
}

function confidenceClass(confidence) {
  return CONFIDENCE_STYLES[confidence] || CONFIDENCE_STYLES.moderate
}

export default function ExpoKiosk() {
  const [recipeText, setRecipeText] = useState(SAMPLE_RECIPE)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState("")

  async function handleAnalyze() {
    if (!recipeText.trim()) {
      setError("Paste a recipe first, then hit Analyze.")
      return
    }
    setLoading(true)
    setError("")
    setResult(null)
    try {
      const response = await evaluateDessertRecipe(recipeText)
      setResult(response.data)
    } catch (err) {
      setError(err.message || "Analysis failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const structuralLayers = (result?.structuralLayers || []).map((layer) => ({
    name: layer.name,
    type: layer.type,
    description: layer.description,
    textureContribution: `Layer ingredients: ${(layer.ingredients || []).join(", ") || "n/a"}`,
  }))

  // Pass the raw sensory profile to FlavorRadar; it handles qualitative mapping.
  // No fabricated/fallback axes are injected.
  const radarData = result?.sensoryProfile || null

  const strengths = Array.isArray(result?.strengths) ? result.strengths : []

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
      {/* Ticker */}
      <div className="overflow-hidden border-2 border-chocolate-900 bg-chocolate-900 text-saffron-300 py-1 ticker-mask" aria-hidden="true">
        <div className="flex whitespace-nowrap animate-marquee">
          {[0, 1].map((n) => (
            <span key={n} className="flex shrink-0 items-center">
              {["SENSORY ANALYSIS", "STRUCTURAL BLUEPRINT", "FLAVOR PAIRING", "ZERO FABRICATION", "MUMENT 2026"].map((t) => (
                <span key={t + n} className="font-mono text-[11px] font-semibold uppercase tracking-[0.25em]">
                  {t}
                  <span className="mx-5 text-cream-100">●</span>
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="badge-warm">Live Demonstration</span>
          <span className="text-xs text-chocolate-400 font-mono">MUMENT 2026 Expo · Team NSSN</span>
        </div>
        <span className="px-3 py-1 rounded-sm bg-dustyrose-100 border-2 border-chocolate-900 text-dustyrose-600 text-[11px] font-bold uppercase tracking-wider">
          Demo Mode
        </span>
      </div>

      <header className="text-center animate-fade-in-up py-4">
        <div className="inline-flex items-center gap-3 mb-4">
          <span className="w-7 h-7 checker rounded-sm border-2 border-chocolate-900 grid place-items-center font-display font-extrabold text-chocolate-900 text-sm leading-none">
            S
          </span>
          <p className="font-mono text-[11px] text-saffron-600 font-bold uppercase tracking-[0.3em]">
            AI Culinary Intelligence
          </p>
        </div>
        <h1 className="font-display text-5xl sm:text-7xl font-extrabold text-chocolate-900 tracking-tight leading-none">
          SavorSense<span className="text-saffron-600">.</span>
        </h1>
        <p className="text-chocolate-500 max-w-2xl mx-auto mt-5 text-sm sm:text-base leading-relaxed">
          Paste any dessert recipe. The engine deconstructs it into structural layers, sensory dimensions, and strengths.
        </p>
        <span className="mt-5 inline-block -rotate-1 bg-saffron-300 border-2 border-chocolate-900 px-3 py-1 rounded-sm font-mono text-[10px] font-bold uppercase tracking-widest text-chocolate-900">
          Zero fabricated scores
        </span>
      </header>

      <div className="card-warm p-6 sm:p-8">
        <label htmlFor="kiosk-recipe" className="block text-xs font-semibold text-chocolate-700 uppercase tracking-wider mb-2">
          Dessert Recipe
        </label>
        <textarea
          id="kiosk-recipe"
          rows="8"
          className="input-warm resize-none font-mono text-sm leading-relaxed"
          value={recipeText}
          onChange={(e) => setRecipeText(e.target.value)}
        />
        {error && (
          <div className="mt-4 rounded-xl bg-dustyrose-50 border border-dustyrose-200 p-4 text-sm text-dustyrose-700">
            {error}
          </div>
        )}
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="btn-primary px-8 py-3 text-base disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Analyzing..." : "Analyze"}
          </button>
          <button
            onClick={() => {
              setRecipeText(SAMPLE_RECIPE)
              setResult(null)
              setError("")
            }}
            className="btn-secondary"
          >
            Reset Sample
          </button>
        </div>
      </div>

      {loading && (
        <div className="card-warm p-10 flex flex-col items-center text-center animate-fade-in">
          <svg className="animate-spin h-10 w-10 text-caramel-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="font-display text-xl font-bold text-chocolate-900">
            Deconstructing your dessert…
          </p>
          <p className="text-sm text-chocolate-400 mt-1 font-mono">Maps layers · reads sensory profile · weighs balance</p>
        </div>
      )}

      {!loading && result && (
        <div className="space-y-6 animate-fade-in-up">
          <div className="card-warm p-6 sm:p-8">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="badge-warm">Analysis Result</span>
              <span className="provenance-tag bg-cream-200 text-chocolate-500 border border-cream-300">
                ai-estimated inferences
              </span>
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-chocolate-900">
              {result.recipeName || "Untitled Dessert"}
            </h2>
            {result.servingInfo && (
              <div className="flex flex-wrap gap-2 mt-4">
                {result.servingInfo.temperature && (
                  <span className="px-3 py-1 rounded-sm bg-cream-100 border-2 border-cream-300 text-chocolate-600 text-xs font-semibold">
                    Serve at {result.servingInfo.temperature}
                  </span>
                )}
                {result.servingInfo.shelfStability && (
                  <span className="px-3 py-1 rounded-sm bg-cream-100 border-2 border-cream-300 text-chocolate-600 text-xs font-semibold">
                    {result.servingInfo.shelfStability}
                  </span>
                )}
                {result.servingInfo.difficulty && (
                  <span className="px-3 py-1 rounded-sm bg-caramel-100 border-2 border-caramel-300 text-caramel-700 text-xs font-semibold uppercase">
                    {result.servingInfo.difficulty}
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <LayerBlueprint layers={structuralLayers} />
            <FlavorRadar radarData={radarData} />
          </div>

          <div className="card-warm p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-5">
              <span className="w-8 h-8 rounded-lg bg-sage-100 border border-sage-200 text-sage-600 font-display font-bold text-sm flex items-center justify-center shrink-0">
                ✓
              </span>
              <h3 className="font-display text-lg sm:text-xl font-bold text-chocolate-900">Strengths</h3>
            </div>
            {strengths.length === 0 ? (
              <p className="text-sm text-chocolate-400 italic">No strengths flagged for this recipe.</p>
            ) : (
              <ul className="space-y-3">
                {strengths.map((s, i) => (
                  <li key={i} className="rounded-xl bg-white border border-cream-300 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm font-semibold text-chocolate-900">{s.claim}</p>
                      {s.confidence && (
                        <span className={`shrink-0 px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase border ${confidenceClass(s.confidence)}`}>
                          {s.confidence}
                        </span>
                      )}
                    </div>
                    {s.evidence && <p className="text-sm text-chocolate-500 mt-1 leading-relaxed">{s.evidence}</p>}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      <p className="text-center text-xs text-chocolate-400 font-mono pt-4">
        DEMO BUILD — results are AI-estimated culinary inferences, not laboratory measurements.
      </p>
    </div>
  )
}