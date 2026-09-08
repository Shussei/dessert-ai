import { useState } from "react"
import { evaluateDessertRecipe } from "../services/culinaryEngine"

const EXAMPLE_A = `Dark Chocolate & Passion Fruit Entremet
Base: 150g Hazelnut Sablé Breton
Core: 100ml Passion Fruit gelée insert
Body: 200g 70% Dark Chocolate Bavarian Mousse
Glaze: Glossy Cocoa Mirror Glaze`

const EXAMPLE_B = `Matcha & Raspberry Sablé Tart
Base: 140g Sweet Almond Tart Crust Shell
Core: 90ml Raspberry Gelée Insert
Body: 180g Ceremonial Matcha Bavarian Cream
Coating: Whipped White Chocolate Ganache`

function RatingBadge({ level, label }) {
  if (!level) return null
  const styles = {
    low: "bg-dustyrose-100 text-dustyrose-700 border-dustyrose-200",
    moderate: "bg-caramel-100 text-caramel-700 border-caramel-300",
    high: "bg-sage-100 text-sage-700 border-sage-200",
  }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${styles[level.toLowerCase()] || styles.moderate}`}>
      {label || level}
    </span>
  )
}

function ProvenanceTag({ children = "AI-Estimated" }) {
  return (
    <span className="provenance-tag bg-caramel-100 text-caramel-700 border border-caramel-300">
      {children}
    </span>
  )
}

export default function Compare() {
  const [recipe1, setRecipe1] = useState(EXAMPLE_A)
  const [recipe2, setRecipe2] = useState(EXAMPLE_B)
  const [result1, setResult1] = useState(null)
  const [result2, setResult2] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleCompare() {
    if (!recipe1.trim() || !recipe2.trim()) {
      setError("Please fill in both recipe specifications before comparing.")
      return
    }
    setLoading(true)
    setError("")
    setResult1(null)
    setResult2(null)
    try {
      const [r1, r2] = await Promise.all([
        evaluateDessertRecipe(recipe1),
        evaluateDessertRecipe(recipe2),
      ])
      setResult1(r1.data)
      setResult2(r2.data)
    } catch (e) {
      setError(e.message || "Comparison failed. Please try again.")
    }
    setLoading(false)
  }

  function getSensoryComparison(re1, re2) {
    if (!re1?.sensoryProfile || !re2?.sensoryProfile) return []
    const keys = ["sweetness", "acidity", "bitterness", "richness", "aroma", "texture", "contrast", "overallBalance"]
    return keys
      .filter(k => re1.sensoryProfile[k] && re2.sensoryProfile[k])
      .map(k => ({
        key: k.replace(/([A-Z])/g, " $1"),
        label: k === "overallBalance" ? "Overall Balance" : k.charAt(0).toUpperCase() + k.slice(1),
        v1: re1.sensoryProfile[k].level,
        v2: re2.sensoryProfile[k].level,
      }))
  }

  const sensoryRows = result1 && result2 ? getSensoryComparison(result1, result2) : []

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">

      {/* Header */}
      <div className="border-b border-cream-300 pb-6">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span className="badge-warm">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 13v-1m4 1v-3m4 3V8M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
            </svg>
            Analytical Comparison
          </span>
          <span className="text-xs text-chocolate-300 font-mono">SavorSense Dual Evaluation</span>
        </div>
        <h1 className="section-heading">Dessert Comparison Workspace</h1>
        <p className="section-subheading">
          Compare two formulations across structural design, sensory balance, and culinary reasoning
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 rounded-xl bg-dustyrose-50 border border-dustyrose-200 flex items-start gap-3 animate-fade-in">
          <svg className="w-5 h-5 text-dustyrose-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm text-dustyrose-700">{error}</p>
        </div>
      )}

      {/* Input Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {[
          { value: recipe1, onChange: setRecipe1, label: "Concept A" },
          { value: recipe2, onChange: setRecipe2, label: "Concept B" },
        ].map(({ value, onChange, label }) => (
          <div key={label} className="card-warm p-4 space-y-2">
            <label className="text-xs font-bold text-chocolate-600 uppercase tracking-wider block">{label} Specification</label>
            <textarea
              rows={6}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="input-warm font-mono text-xs leading-relaxed resize-none"
              disabled={loading}
              aria-label={`${label} recipe specification`}
            />
          </div>
        ))}
      </div>

      <button
        onClick={handleCompare}
        disabled={loading}
        className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Running Comparative Analysis...
          </>
        ) : "Run Side-by-Side Comparison"}
      </button>

      {/* Results */}
      {result1 && result2 && (
        <div className="space-y-6 animate-fade-in-up">

          {/* Sensory Comparison Table */}
          {sensoryRows.length > 0 && (
            <div className="card-warm overflow-hidden">
              <div className="px-5 py-4 border-b border-cream-300 flex items-center gap-2">
                <h3 className="font-display text-lg font-bold text-chocolate-900">Sensory Profile Comparison</h3>
                <ProvenanceTag>AI-Estimated</ProvenanceTag>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-cream-100 text-chocolate-500 font-mono uppercase text-[10px] border-b border-cream-200">
                    <tr>
                      <th className="py-3 px-5 text-left">Dimension</th>
                      <th className="py-3 px-5 text-center text-dustyrose-600">Concept A</th>
                      <th className="py-3 px-5 text-center text-sage-600">Concept B</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-cream-200">
                    {sensoryRows.map((row) => (
                      <tr key={row.key} className="hover:bg-cream-50 transition-colors">
                        <td className="py-3.5 px-5 font-medium text-chocolate-700">{row.label}</td>
                        <td className="py-3.5 px-5 text-center"><RatingBadge level={row.v1} /></td>
                        <td className="py-3.5 px-5 text-center"><RatingBadge level={row.v2} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Structural Layers Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[result1, result2].map((res, idx) => (
              <div key={idx} className="card-warm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display text-base font-bold text-chocolate-900">
                    {idx === 0 ? "Concept A" : "Concept B"}
                  </h3>
                  <ProvenanceTag>AI-Estimated</ProvenanceTag>
                </div>
                {res.recipeName && (
                  <p className="text-sm font-semibold text-caramel-700 mb-4">{res.recipeName}</p>
                )}
                {Array.isArray(res.structuralLayers) && res.structuralLayers.length > 0 ? (
                  <ul className="space-y-2">
                    {res.structuralLayers.map((layer, li) => (
                      <li key={li} className={`p-3 rounded-xl border ${
                        layer.type === "base" ? "bg-cream-100 border-cream-300" :
                        layer.type === "core" ? "bg-sage-50 border-sage-200" :
                        layer.type === "body" ? "bg-caramel-50 border-caramel-200" :
                        layer.type === "coating" ? "bg-dustyrose-50 border-dustyrose-200" :
                        "bg-white border-cream-300"
                      }`}>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-chocolate-800 capitalize">{layer.type}</span>
                          {layer.name && <span className="text-[10px] font-mono text-chocolate-400">{layer.name}</span>}
                        </div>
                        {layer.description && (
                          <p className="text-xs text-chocolate-600 mt-1">{layer.description}</p>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-chocolate-400 italic">No structural analysis available.</p>
                )}

                {/* Strengths & Issues */}
                {Array.isArray(res.strengths) && res.strengths.length > 0 && (
                  <div className="mt-5">
                    <h4 className="text-[10px] font-bold text-sage-600 uppercase tracking-wider mb-2">Strengths</h4>
                    <ul className="space-y-1">
                      {res.strengths.slice(0, 3).map((s, si) => (
                        <li key={si} className="text-xs text-chocolate-600 flex items-start gap-2">
                          <span className="text-sage-400 mt-0.5">•</span>
                          <span>{typeof s === "object" ? s.claim || s.text : s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {Array.isArray(res.potentialIssues) && res.potentialIssues.length > 0 && (
                  <div className="mt-3">
                    <h4 className="text-[10px] font-bold text-dustyrose-600 uppercase tracking-wider mb-2">Potential Issues</h4>
                    <ul className="space-y-1">
                      {res.potentialIssues.slice(0, 3).map((s, si) => (
                        <li key={si} className="text-xs text-chocolate-600 flex items-start gap-2">
                          <span className="text-dustyrose-400 mt-0.5">•</span>
                          <span>{typeof s === "object" ? s.claim || s.text : s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Important Note */}
          <div className="p-4 rounded-xl bg-cream-100 border border-cream-300 text-xs text-chocolate-500 leading-relaxed">
            <p className="font-semibold text-chocolate-700 mb-1">About this comparison</p>
            <p>
              Sensory levels and structural roles are AI-estimated culinary inferences based on ingredient composition and recipe structure. They are not laboratory measurements. No numerical superiority is assigned between the two concepts because qualitative levels are not directly rankable.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
