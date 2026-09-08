import { useState } from "react"
import { analyzeFlavorPairing } from "../services/culinaryEngine"

const EXAMPLE_PAIRS = [
  { a: "Dark Chocolate (70%)", b: "Passion Fruit" },
  { a: "Vanilla Bean", b: "Lavender" },
  { a: "Pistachio", b: "Raspberry" },
  { a: "Miso", b: "Caramel" },
  { a: "Yuzu", b: "White Chocolate" },
]

export default function FlavorLab() {
  const [ingredient1, setIngredient1] = useState("")
  const [ingredient2, setIngredient2] = useState("")
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [history, setHistory] = useState([])

  async function handleAnalyze() {
    if (!ingredient1.trim() || !ingredient2.trim()) {
      setError("Please enter both ingredients to analyze their pairing.")
      return
    }
    if (ingredient1.trim().length < 2 || ingredient2.trim().length < 2) {
      setError("Each ingredient name must be at least 2 characters.")
      return
    }

    setError("")
    setResult(null)
    setLoading(true)

    try {
      const response = await analyzeFlavorPairing(ingredient1.trim(), ingredient2.trim())
      setResult(response.data)
      setHistory(prev => {
        const entry = { a: ingredient1.trim(), b: ingredient2.trim(), ts: Date.now() }
        const next = [entry, ...prev.filter(h => !(h.a === entry.a && h.b === entry.b))]
        return next.slice(0, 8)
      })
    } catch (err) {
      if (err.message?.includes("Could not connect")) {
        setError("Could not connect to the analysis server. Please ensure the backend is running.")
      } else if (err.message?.includes("timed out") || err.message?.includes("timeout")) {
        setError("AI analysis timed out. Try simpler ingredient names.")
      } else {
        setError(err.message || "An unexpected error occurred during flavor analysis.")
      }
    } finally {
      setLoading(false)
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !loading) handleAnalyze()
  }

  function loadExample(a, b) {
    setIngredient1(a)
    setIngredient2(b)
    setResult(null)
    setError("")
  }

  function ProvenanceTag({ type }) {
    const styles = {
      "AI-Estimated": "bg-caramel-100 text-caramel-700 border border-caramel-300",
      "AI-Predicted": "bg-dustyrose-100 text-dustyrose-700 border border-dustyrose-200",
      "Culinary Reference": "bg-sage-100 text-sage-700 border border-sage-200",
      "Data-Derived": "bg-cream-200 text-chocolate-500 border border-cream-300",
    }
    return (
      <span className={`provenance-tag ${styles[type] || styles["AI-Estimated"]}`}>
        {type}
      </span>
    )
  }

  function RatingChip({ label, rating }) {
    const tone = {
      strong: "bg-sage-100 text-sage-700 border-sage-200",
      moderate: "bg-caramel-100 text-caramel-700 border-caramel-300",
      weak: "bg-cream-200 text-chocolate-500 border-cream-300",
      poor: "bg-dustyrose-100 text-dustyrose-700 border-dustyrose-200",
      complementary: "bg-sage-100 text-sage-700 border-sage-200",
      contrasting: "bg-dustyrose-100 text-dustyrose-700 border-dustyrose-200",
      neutral: "bg-cream-200 text-chocolate-500 border-cream-300",
      excellent: "bg-sage-100 text-sage-700 border-sage-200",
      good: "bg-sage-50 text-sage-600 border-sage-200",
      fair: "bg-caramel-100 text-caramel-700 border-caramel-300",
    }
    return (
      <div className="flex items-start gap-3 rounded-xl bg-cream-50 border border-cream-200 p-4">
        <span className="text-[10px] text-chocolate-400 uppercase tracking-wider font-mono w-28 shrink-0 pt-0.5">
          {label}
        </span>
        <div className="min-w-0">
          <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize border ${tone[rating] || "bg-cream-100 text-chocolate-600 border-cream-300"}`}>
            {rating || "—"}
          </span>
        </div>
      </div>
    )
  }

  function Explanation({ text }) {
    if (!text) return null
    return <p className="text-sm text-chocolate-600 leading-relaxed">{text}</p>
  }

  const compat = result?.compatibility || {}
  const aromatic = result?.aromaticCompatibility || {}
  const taste = result?.tasteContrast || {}
  const dominance = result?.dominance || {}
  const imbalance = result?.potentialImbalance || {}
  const overall = result?.overallAssessment || {}

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">

      {/* Header */}
      <div className="border-b border-cream-300 pb-6">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span className="badge-warm">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            Flavor Intelligence
          </span>
          <span className="text-xs text-chocolate-300 font-mono">SavorSense Pairing Engine</span>
        </div>
        <h1 className="section-heading">Flavor Interaction Explorer</h1>
        <p className="section-subheading">
          Analyze the compatibility, contrast, and synergy between any two ingredients
        </p>
      </div>

      {/* Input Section */}
      <div className="card-warm p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-chocolate-600 uppercase tracking-wider">
              Ingredient A
            </label>
            <input
              type="text"
              value={ingredient1}
              onChange={(e) => setIngredient1(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="e.g. Dark Chocolate (70%)"
              className="input-warm"
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-chocolate-600 uppercase tracking-wider">
              Ingredient B
            </label>
            <input
              type="text"
              value={ingredient2}
              onChange={(e) => setIngredient2(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="e.g. Passion Fruit"
              className="input-warm"
              disabled={loading}
            />
          </div>
        </div>

        <button
          onClick={handleAnalyze}
          disabled={loading || !ingredient1.trim() || !ingredient2.trim()}
          className="btn-primary w-full sm:w-auto flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Analyzing Pairing...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Analyze Pairing
            </>
          )}
        </button>

        {/* Example Pairs */}
        <div className="mt-4 pt-4 border-t border-cream-200">
          <p className="text-[10px] text-chocolate-300 font-mono uppercase tracking-wider mb-2">Try an example pairing</p>
          <div className="flex flex-wrap gap-2">
            {EXAMPLE_PAIRS.map(({ a, b }) => (
              <button
                key={`${a}-${b}`}
                onClick={() => loadExample(a, b)}
                disabled={loading}
                className="px-3 py-1.5 rounded-lg bg-cream-100 hover:bg-cream-200 border border-cream-300 text-chocolate-600 text-xs font-medium transition-all disabled:opacity-50"
              >
                {a} + {b}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 rounded-xl bg-dustyrose-50 border border-dustyrose-200 flex items-start gap-3 animate-fade-in">
          <svg className="w-5 h-5 text-dustyrose-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <div>
            <p className="text-sm font-semibold text-dustyrose-700">Analysis Error</p>
            <p className="text-xs text-dustyrose-600 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="card-warm p-8 animate-fade-in">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-caramel-100 border border-caramel-300 flex items-center justify-center">
              <svg className="w-8 h-8 text-caramel-500 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-chocolate-900">Analyzing Flavor Pairing</p>
              <div className="mt-2 space-y-1 text-xs text-chocolate-400">
                <p>Identifying flavor compounds...</p>
                <p>Evaluating aromatic compatibility...</p>
                <p>Cross-referencing culinary evidence...</p>
              </div>
            </div>
            <div className="w-48 h-1.5 rounded-full bg-cream-200 overflow-hidden">
              <div className="h-full rounded-full bg-caramel-400 animate-pulse" style={{ width: "65%" }} />
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {result && !loading && (
        <div className="space-y-6 animate-fade-in-up">

          {/* Compatibility Overview */}
          <div className="card-warm p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-display text-xl font-bold text-chocolate-900">Pairing Analysis</h2>
                  <ProvenanceTag type="AI-Estimated" />
                </div>
                <p className="text-xs text-chocolate-400 mt-1">
                  {ingredient1.trim()} + {ingredient2.trim()}
                </p>
              </div>
              {overall.rating && (
                <div className="flex items-center gap-3 bg-cream-100 px-4 py-2 rounded-xl border border-cream-300">
                  <div className="text-right">
                    <span className="text-[10px] text-chocolate-400 block font-mono">Overall Assessment</span>
                    <span className="text-xl font-bold text-caramel-600 capitalize">{overall.rating}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <RatingChip label="Compatibility" rating={compat.rating} />
                <RatingChip label="Aromatic Match" rating={aromatic.rating} />
                <RatingChip label="Taste Contrast" rating={taste.rating} />
              </div>

              {compat.explanation && <Explanation text={compat.explanation} />}
              {aromatic.explanation && (
                <p className="text-sm text-chocolate-600 leading-relaxed">
                  <span className="font-semibold text-chocolate-700">Aromatic:</span> {aromatic.explanation}
                </p>
              )}
              {taste.explanation && (
                <p className="text-sm text-chocolate-600 leading-relaxed">
                  <span className="font-semibold text-chocolate-700">Contrast:</span> {taste.explanation}
                </p>
              )}
              {overall.explanation && (
                <p className="text-sm text-chocolate-600 leading-relaxed bg-cream-50 border border-cream-200 rounded-xl p-4">
                  <span className="font-semibold text-chocolate-700">Summary — </span>
                  {overall.explanation}
                  {overall.confidence && (
                    <span className="block mt-2 text-xs text-chocolate-400 font-mono">
                      confidence: {overall.confidence}
                    </span>
                  )}
                </p>
              )}
            </div>
          </div>

          {/* Dominance */}
          {dominance.dominant && (
            <div className="card-warm p-6">
              <div className="flex items-center gap-2 mb-3">
                <h3 className="font-display text-lg font-bold text-chocolate-900">Dominant Character</h3>
                <ProvenanceTag type="AI-Estimated" />
              </div>
              <p className="text-sm text-chocolate-600 leading-relaxed">
                <span className="font-bold text-chocolate-800 capitalize">{dominance.dominant}</span>
                {dominance.explanation && ` — ${dominance.explanation}`}
              </p>
            </div>
          )}

          {/* Potential Imbalance */}
          {imbalance.description && (
            <div className="card-warm p-6">
              <div className="flex items-center gap-2 mb-3">
                <h3 className="font-display text-lg font-bold text-chocolate-900">Potential Imbalance</h3>
                {imbalance.severity && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize border bg-dustyrose-100 text-dustyrose-700 border-dustyrose-200">
                    {imbalance.severity} severity
                  </span>
                )}
              </div>
              <p className="text-sm text-chocolate-600 leading-relaxed bg-cream-50 border border-cream-200 rounded-xl p-4">
                {imbalance.description}
              </p>
            </div>
          )}

          {/* Shared Flavor Families */}
          {result.sharedFlavorFamilies && result.sharedFlavorFamilies.length > 0 && (
            <div className="card-warm p-6">
              <div className="flex items-center gap-2 mb-4">
                <h3 className="font-display text-lg font-bold text-chocolate-900">Shared Flavor Families</h3>
                <ProvenanceTag type="AI-Predicted" />
              </div>
              <div className="flex flex-wrap gap-2">
                {result.sharedFlavorFamilies.map((family, idx) => (
                  <span key={idx} className="px-3 py-1.5 rounded-full bg-caramel-100 border border-caramel-300 text-caramel-700 text-xs font-semibold">
                    {family}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Texture Interaction */}
          {result.textureInteraction?.description && (
            <div className="card-warm p-6">
              <div className="flex items-center gap-2 mb-3">
                <h3 className="font-display text-lg font-bold text-chocolate-900">Texture Interaction</h3>
                <ProvenanceTag type="AI-Estimated" />
              </div>
              <p className="text-sm text-chocolate-600 leading-relaxed bg-cream-50 border border-cream-200 rounded-xl p-4">
                {result.textureInteraction.description}
              </p>
            </div>
          )}

          {/* Culinary Evidence */}
          {result.culinaryEvidence && (
            <div className="card-warm p-6">
              <div className="flex items-center gap-2 mb-3">
                <h3 className="font-display text-lg font-bold text-chocolate-900">Culinary Evidence</h3>
                <ProvenanceTag type="Culinary Reference" />
              </div>
              <p className="text-sm text-chocolate-600 leading-relaxed bg-cream-50 border border-cream-200 rounded-xl p-4">
                {result.culinaryEvidence}
              </p>
            </div>
          )}

          {/* Contextual Suitability */}
          {result.contextualSuitability && (
            <div className="card-warm p-6">
              <div className="flex items-center gap-2 mb-3">
                <h3 className="font-display text-lg font-bold text-chocolate-900">Contextual Suitability</h3>
                <ProvenanceTag type="AI-Estimated" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {result.contextualSuitability.applications?.length > 0 && (
                  <div>
                    <p className="text-[10px] text-chocolate-400 uppercase tracking-wider font-mono mb-2">Great for</p>
                    <ul className="space-y-1.5">
                      {result.contextualSuitability.applications.map((app, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-chocolate-600">
                          <span className="w-1.5 h-1.5 rounded-full bg-sage-400 mt-2 shrink-0" />
                          {app}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {result.contextualSuitability.avoidIn?.length > 0 && (
                  <div>
                    <p className="text-[10px] text-chocolate-400 uppercase tracking-wider font-mono mb-2">Avoid in</p>
                    <ul className="space-y-1.5">
                      {result.contextualSuitability.avoidIn.map((app, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-chocolate-600">
                          <span className="w-1.5 h-1.5 rounded-full bg-dustyrose-400 mt-2 shrink-0" />
                          {app}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Assumptions & Limitations */}
          {(result.assumptions?.length > 0 || result.limitations?.length > 0) && (
            <div className="card-warm p-6">
              <h3 className="text-xs font-semibold text-chocolate-400 uppercase tracking-wider mb-4">
                Assumptions & Limitations
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-sm text-chocolate-500">
                <div className="space-y-1.5">
                  <p className="text-[10px] text-chocolate-400 uppercase tracking-wider font-mono">Assumptions</p>
                  {(result.assumptions || []).map((a, i) => (
                    <p key={i} className="flex items-start gap-2 leading-relaxed">
                      <span className="text-chocolate-300 mt-1">·</span>
                      {a}
                    </p>
                  ))}
                </div>
                <div className="space-y-1.5">
                  <p className="text-[10px] text-chocolate-400 uppercase tracking-wider font-mono">Limitations</p>
                  {(result.limitations || []).map((l, i) => (
                    <p key={i} className="flex items-start gap-2 leading-relaxed">
                      <span className="text-chocolate-300 mt-1">·</span>
                      {l}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Full Result JSON (collapsed debug view) */}
          {result && typeof result === "object" && (
            <details className="card-warm">
              <summary className="p-4 cursor-pointer text-xs font-mono text-chocolate-400 hover:text-chocolate-600 transition-colors select-none">
                Raw Analysis Data
              </summary>
              <div className="px-4 pb-4">
                <pre className="p-4 rounded-xl bg-cream-50 border border-cream-200 text-xs font-mono text-chocolate-600 overflow-x-auto max-h-64 overflow-y-auto">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            </details>
          )}
        </div>
      )}

      {/* Recent Pairing History */}
      {history.length > 0 && !loading && (
        <div className="card-warm p-6">
          <h3 className="text-xs font-semibold text-chocolate-400 uppercase tracking-wider mb-3">Recent Pairings</h3>
          <div className="space-y-2">
            {history.map((h) => (
              <button
                key={h.ts}
                onClick={() => loadExample(h.a, h.b)}
                className="w-full text-left px-4 py-2.5 rounded-xl bg-cream-50 hover:bg-cream-100 border border-cream-200 hover:border-cream-300 transition-all flex items-center justify-between group"
              >
                <span className="text-sm text-chocolate-700 font-medium">
                  {h.a} <span className="text-caramel-400">+</span> {h.b}
                </span>
                <svg className="w-4 h-4 text-chocolate-300 group-hover:text-caramel-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
