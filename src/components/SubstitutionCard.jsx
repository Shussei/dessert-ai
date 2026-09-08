function ProvenanceTag({ children = "AI-Estimated" }) {
  return (
    <span className="provenance-tag bg-caramel-100 text-caramel-700 border border-caramel-300">
      {children}
    </span>
  )
}

export default function SubstitutionCard({ reformulationData }) {
  if (!reformulationData) return null

  const data = reformulationData

  return (
    <div className="p-6 rounded-2xl bg-white border border-cream-300 shadow-warm space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-display text-xl font-bold text-chocolate-900">Reformulation Analysis</h3>
            <ProvenanceTag>AI-Estimated</ProvenanceTag>
            {data.dietaryTarget && (
              <span className="badge-warm">{data.dietaryTarget} Adaptation</span>
            )}
          </div>
          <p className="text-xs text-chocolate-400 mt-1">
            Dietary transformations with replacements, technique adjustments, and trade-offs
          </p>
        </div>
      </div>

      {/* Removed Ingredients */}
      {data.removedIngredients && data.removedIngredients.length > 0 && (
        <div className="p-4 rounded-xl bg-dustyrose-50 border border-dustyrose-200">
          <h4 className="text-xs font-bold text-dustyrose-600 uppercase tracking-wider mb-2 flex items-center gap-2">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
            Removed Ingredients
          </h4>
          <ul className="space-y-1.5 text-sm text-chocolate-600">
            {data.removedIngredients.map((item, idx) => {
              const name = typeof item === "object" ? item.name : item
              const reason = typeof item === "object" ? item.reason : null
              return (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-dustyrose-400 mt-0.5">•</span>
                  <span>
                    <span className="capitalize font-medium">{name}</span>
                    {reason && <span className="text-chocolate-400"> — {reason}</span>}
                  </span>
                </li>
              )
            })}
          </ul>
        </div>
      )}

      {/* Added Substitutes */}
      {data.addedSubstitutes && data.addedSubstitutes.length > 0 && (
        <div className="p-4 rounded-xl bg-sage-50 border border-sage-200">
          <h4 className="text-xs font-bold text-sage-600 uppercase tracking-wider mb-2 flex items-center gap-2">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            Suggested Substitutes
          </h4>
          <ul className="space-y-3 text-sm text-chocolate-600">
            {data.addedSubstitutes.map((item, idx) => (
              <li key={idx} className="flex flex-col gap-0.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium text-chocolate-800 capitalize">{item.replacement || item.original}</span>
                  {item.ratio && (
                    <span className="text-[10px] font-mono text-sage-600 bg-sage-100 border border-sage-200 px-2 py-0.5 rounded">
                      {item.ratio}
                    </span>
                  )}
                  <span className="text-chocolate-300">replaces</span>
                  <span className="capitalize">{item.original}</span>
                </div>
                {item.reason && <p className="text-xs text-chocolate-400">{item.reason}</p>}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Texture Changes */}
      {data.textureChanges && (
        <div className="space-y-3 pt-2 border-t border-cream-200">
          <div className="p-3.5 rounded-xl bg-cream-50 border border-cream-200 text-sm">
            <span className="font-bold text-caramel-700 block mb-1">Expected Texture Changes</span>
            <p className="text-chocolate-500">
              {typeof data.textureChanges === "object" ? data.textureChanges.description : data.textureChanges}
            </p>
          </div>
        </div>
      )}

      {/* Baking Adjustments */}
      {data.bakingAdjustments && data.bakingAdjustments.length > 0 && (
        <div className="pt-2 border-t border-cream-200">
          <h4 className="text-xs font-bold text-chocolate-600 uppercase tracking-wider mb-3">
            Technique & Baking Adjustments
          </h4>
          <div className="space-y-2">
            {data.bakingAdjustments.map((adj, idx) => {
              const param = typeof adj === "object" ? adj.parameter || "Adjustment" : "Adjustment"
              const detail = typeof adj === "object"
                ? (adj.adjusted || adj.original ? `${adj.original || ""} → ${adj.adjusted || ""}` : adj.reason || "")
                : adj
              return (
                <div key={idx} className="p-3 rounded-xl bg-cream-50 border border-cream-200 text-sm">
                  <span className="font-semibold text-chocolate-700 block capitalize">{param}</span>
                  <p className="text-chocolate-500">{detail}</p>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Trade-offs */}
      {data.culinaryTradeOffs && data.culinaryTradeOffs.length > 0 && (
        <div className="pt-2 border-t border-cream-200">
          <h4 className="text-xs font-bold text-chocolate-600 uppercase tracking-wider mb-3">
            Expected Culinary Trade-Offs
          </h4>
          <ul className="space-y-2 text-sm">
            {data.culinaryTradeOffs.map((t, idx) => (
              <li key={idx} className="flex items-start gap-2 text-chocolate-500">
                <span className="text-caramel-400 mt-0.5">•</span>
                <span>{typeof t === "object" ? t.tradeoff : t}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Cross contamination note */}
      {data.crossContaminationNotes && (
        <div className="p-3.5 rounded-xl bg-cream-100 border border-cream-300 text-sm">
          <span className="font-bold text-chocolate-700 block mb-1">Cross-Contamination Note</span>
          <p className="text-chocolate-500">{data.crossContaminationNotes}</p>
        </div>
      )}

      {/* Iteration note */}
      {data.assumptions && data.assumptions.length > 0 && (
        <div className="text-xs text-chocolate-400">
          <span className="font-semibold">Assumptions:</span> {data.assumptions.join("; ")}
        </div>
      )}
    </div>
  )
}
