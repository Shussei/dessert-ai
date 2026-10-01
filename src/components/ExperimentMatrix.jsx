const FIT_STYLES = {
  high: "bg-sage-100 text-sage-700 border-sage-300",
  moderate: "bg-caramel-100 text-caramel-700 border-caramel-300",
  low: "bg-dustyrose-100 text-dustyrose-700 border-dustyrose-200",
  unknown: "bg-cream-100 text-chocolate-400 border-cream-300",
}

function Tag({ children, tone = "default" }) {
  const tones = {
    default: "bg-cream-100 text-chocolate-500 border-cream-300",
    warm: "bg-caramel-100 text-caramel-700 border-caramel-300",
    sage: "bg-sage-100 text-sage-700 border-sage-300",
  }
  return <span className={`provenance-tag ${tones[tone]}`}>{children}</span>
}

function ConfidenceBadge({ level }) {
  if (!level) return null
  const styles = {
    high: "bg-sage-100 text-sage-700 border-sage-300",
    moderate: "bg-caramel-100 text-caramel-700 border-caramel-300",
    low: "bg-dustyrose-100 text-dustyrose-700 border-dustyrose-200",
    unknown: "bg-cream-100 text-chocolate-400 border-cream-300",
  }
  return <span className={`provenance-tag ${styles[level] || styles.unknown}`}>{level}</span>
}

export default function ExperimentMatrix({ goal, candidates, selectedId, onSelect, generating }) {
  if (generating) return null
  if (!goal || !Array.isArray(candidates) || candidates.length === 0) return null

  return (
    <div className="space-y-4">
      {/* Interpreted goal */}
      <div className="card-warm p-5 border-dashed">
        <div className="flex flex-wrap items-center gap-2">
          <Tag tone="warm">Goal interpreted</Tag>
          <span className="text-sm font-bold text-chocolate-900 capitalize">{goal.intent || "your stated goal"}</span>
        </div>
        {goal.target?.ingredient && (
          <p className="text-xs text-chocolate-500 mt-2">
            Focus: <span className="font-mono font-semibold text-chocolate-700">{goal.target.ingredient}</span>
            {goal.target.change ? <span className="text-caramel-600"> {goal.target.change}</span> : null}
          </p>
        )}
        {Array.isArray(goal.constraints) && goal.constraints.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {goal.constraints.map((c, i) => (
              <span key={i} className="px-2 py-0.5 rounded-sm bg-sage-50 border-2 border-sage-200 text-[10px] font-medium text-sage-700 capitalize">
                preserve: {c}
              </span>
            ))}
          </div>
        )}
        {goal.target?.notes && <p className="text-xs text-chocolate-400 italic mt-2">{goal.target.notes}</p>}
      </div>

      {/* Candidate matrix */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {candidates.map((c) => (
          <button
            key={c.id}
            onClick={() => onSelect(c.id)}
            disabled={!c.modification}
            className={`text-left rounded-md border-2 p-5 flex flex-col gap-3 transition-all disabled:opacity-40 ${
              selectedId === c.id
                ? "bg-saffron-100 border-chocolate-900 shadow-warm"
                : "bg-white border-chocolate-300 hover:border-chocolate-900 hover:bg-cream-50"
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="font-mono text-[9px] uppercase tracking-wider text-caramel-600 block">Candidate {c.id}</span>
                <h4 className="font-display text-base font-bold text-chocolate-900 leading-tight">{c.title || "Untitled"}</h4>
              </div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${FIT_STYLES[c.predictedFit] || FIT_STYLES.unknown}`}>
                fit: {c.predictedFit || "unknown"}
              </span>
            </div>

            <div>
              <p className="font-mono text-[9px] text-chocolate-400 uppercase tracking-wider mb-1">Modification</p>
              <p className="text-xs text-chocolate-700 font-medium">{c.modification}</p>
            </div>

            <div>
              <p className="font-mono text-[9px] text-chocolate-400 uppercase tracking-wider mb-1">Rationale</p>
              <p className="text-[11px] text-chocolate-500 leading-snug">{c.rationale || "—"}</p>
            </div>

            {c.exactDelta && (
              <div className="px-2.5 py-1.5 rounded-sm bg-saffron-100 border-2 border-chocolate-900">
                <span className="font-mono text-[9px] text-chocolate-400 uppercase tracking-wider block">Deterministic delta</span>
                <span className="text-xs font-mono font-bold text-chocolate-900">{c.exactDelta}</span>
              </div>
            )}

            {Array.isArray(c.expectedEffects) && c.expectedEffects.length > 0 && (
              <div>
                <p className="font-mono text-[9px] text-chocolate-400 uppercase tracking-wider mb-1">Expected effects</p>
                <ul className="space-y-0.5">
                  {c.expectedEffects.map((e, i) => (
                    <li key={i} className="text-[11px] text-chocolate-600">• {e}</li>
                  ))}
                </ul>
              </div>
            )}

            {Array.isArray(c.tradeoffs) && c.tradeoffs.length > 0 && (
              <div>
                <p className="font-mono text-[9px] text-chocolate-400 uppercase tracking-wider mb-1">Trade-offs</p>
                <ul className="space-y-0.5">
                  {c.tradeoffs.map((t, i) => (
                    <li key={i} className="text-[11px] text-dustyrose-600">− {t}</li>
                  ))}
                </ul>
              </div>
            )}

            {c.risks?.summary && (
              <div className="px-2.5 py-1.5 rounded-sm bg-dustyrose-50 border-2 border-dustyrose-200">
                <p className="text-[11px] text-chocolate-600"><span className="font-mono text-[9px] uppercase tracking-wider text-dustyrose-500 block">Risk</span>{c.risks.summary}</p>
              </div>
            )}

            {Array.isArray(c.compensation) && c.compensation.length > 0 && (
              <div>
                <p className="font-mono text-[9px] text-chocolate-400 uppercase tracking-wider mb-1">Compensation</p>
                <ul className="space-y-0.5">
                  {c.compensation.map((comp, i) => (
                    <li key={i} className="text-[11px] text-sage-700">+ {comp}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-auto pt-2 flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 text-[10px] font-mono text-chocolate-400 uppercase">
                confidence <ConfidenceBadge level={c.confidence} />
              </span>
              <span className={`text-[11px] font-bold ${selectedId === c.id ? "text-chocolate-900" : "text-caramel-600"}`}>
                {selectedId === c.id ? "Selected ✓" : "Use this →"}
              </span>
            </div>

            {Array.isArray(c.limitations) && c.limitations.length > 0 && (
              <p className="text-[9px] text-chocolate-400 italic">{c.limitations.join(" · ")}</p>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}