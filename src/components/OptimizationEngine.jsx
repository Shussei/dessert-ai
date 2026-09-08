function ProvenanceTag({ children = "AI-Generated" }) {
  return (
    <span className="provenance-tag bg-caramel-100 text-caramel-700 border border-caramel-300">
      {children}
    </span>
  )
}

export default function OptimizationEngine({
  optimizations = [],
  reasoning = [],
  onApplyOptimization,
}) {
  // No fabricated default optimizations. If empty, show honest empty state.
  if ((!optimizations || optimizations.length === 0) && (!reasoning || reasoning.length === 0)) {
    return (
      <div className="p-5 rounded-2xl bg-white border border-cream-300 shadow-warm">
        <div className="flex items-center gap-2 mb-2">
          <h3 className="font-display text-lg font-bold text-chocolate-900">Optimization Suggestions</h3>
          <ProvenanceTag>AI-Generated</ProvenanceTag>
        </div>
        <p className="text-sm text-chocolate-400 italic py-3">
          No optimization suggestions are available for this analysis.
        </p>
      </div>
    )
  }

  return (
    <div className="p-6 rounded-2xl bg-white border border-cream-300 shadow-warm">
      <div className="flex items-center gap-2 mb-1">
        <h3 className="font-display text-lg font-bold text-chocolate-900">Optimization Suggestions</h3>
        <ProvenanceTag>AI-Generated</ProvenanceTag>
      </div>
      <p className="text-xs text-chocolate-400 mb-5">
        Targeted recommendations to improve balance and execution. Each includes the reasoning and the
        system&apos;s confidence. These are culinary inferences, not guarantees.
      </p>

      <div className="space-y-3">
        {optimizations.map((opt, idx) => (
          <div
            key={idx}
            className="p-4 rounded-xl bg-cream-50 border border-cream-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-caramel-300 transition-colors"
          >
            <div className="space-y-1.5">
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-caramel-100 border border-caramel-300 text-caramel-700 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <div>
                  <h4 className="text-sm font-bold text-chocolate-800">
                    {opt.recommendation || opt.action || opt.title}
                  </h4>
                  {opt.reasoning && (
                    <p className="text-xs text-chocolate-500 mt-1">{opt.reasoning}</p>
                  )}
                  {opt.confidence && (
                    <span className={`inline-block mt-1.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                      opt.confidence === "high" ? "bg-sage-100 text-sage-700 border-sage-200"
                      : opt.confidence === "low" ? "bg-dustyrose-100 text-dustyrose-700 border-dustyrose-200"
                      : "bg-caramel-100 text-caramel-700 border-caramel-300"
                    }`}>
                      {opt.confidence} confidence
                    </span>
                  )}
                </div>
              </div>
              {opt.basis && (
                <p className="text-xs text-chocolate-400 pl-7">
                  <span className="font-semibold">Basis:</span> {opt.basis}
                </p>
              )}
            </div>
            {onApplyOptimization && (
              <button
                onClick={() => onApplyOptimization(opt)}
                className="px-3 py-1.5 rounded-lg btn-secondary text-xs shrink-0"
              >
                Note this suggestion
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
