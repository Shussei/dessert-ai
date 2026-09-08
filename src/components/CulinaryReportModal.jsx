export default function CulinaryReportModal({ isOpen, onClose, reportData }) {
  if (!isOpen || !reportData) return null

  const handlePrint = () => {
    window.print()
  }

  const d = reportData

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-chocolate-900/50 backdrop-blur-sm overflow-y-auto animate-fade-in">
      <div className="w-full max-w-3xl p-6 sm:p-8 rounded-3xl bg-cream-50 border border-cream-300 shadow-warm-xl relative my-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-cream-300 mb-6 gap-4">
          <div>
            <span className="px-2.5 py-0.5 rounded bg-caramel-100 border border-caramel-300 text-caramel-700 text-xs font-bold uppercase tracking-wider">
              Saved Record
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-chocolate-900 tracking-tight mt-1">
              {d.name || "Recipe Record"}
            </h2>
            <p className="text-xs text-chocolate-400 capitalize">{d.type || "Saved item"}</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-2 rounded-xl btn-secondary text-xs flex items-center gap-1.5"
            >
              Export
            </button>
            <button
              onClick={onClose}
              aria-label="Close"
              className="text-chocolate-400 hover:text-chocolate-900 text-xl p-1 ml-2 px-3 py-1 rounded-lg bg-cream-200 border border-cream-300"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Recipe Text */}
        {d.recipeText && (
          <div className="p-4 rounded-2xl bg-cream-100 border border-cream-300 mb-6">
            <span className="text-[10px] text-caramel-600 font-mono uppercase tracking-wider block mb-2">
              Recipe Input
            </span>
            <pre className="text-sm text-chocolate-700 whitespace-pre-wrap font-sans leading-relaxed">
              {d.recipeText}
            </pre>
          </div>
        )}

        {/* Dietary target */}
        {d.dietaryTarget && (
          <div className="mb-6">
            <span className="badge-warm">{d.dietaryTarget}</span>
          </div>
        )}

        {/* Structural Layers */}
        {Array.isArray(d.structuralLayers) && d.structuralLayers.length > 0 && (
          <div className="mb-6">
            <h4 className="text-sm font-bold text-chocolate-900 mb-3">Structural Architecture</h4>
            <ul className="space-y-2">
              {d.structuralLayers.map((layer, idx) => (
                <li key={idx} className="p-3 rounded-xl bg-white border border-cream-300">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-chocolate-800 capitalize">
                      {layer.type || idx + 1}
                    </span>
                    {layer.name && <span className="text-[10px] font-mono text-chocolate-400">{layer.name}</span>}
                  </div>
                  {layer.description && (
                    <p className="text-xs text-chocolate-600 mt-1">{layer.description}</p>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Sensory Profile */}
        {d.sensoryProfile && (
          <div className="mb-6">
            <h4 className="text-sm font-bold text-chocolate-900 mb-3">Sensory Profile</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {Object.entries(d.sensoryProfile).map(([key, val]) => (
                <div key={key} className="p-3 rounded-xl bg-white border border-cream-300 flex items-center justify-between">
                  <span className="text-xs text-chocolate-500 capitalize">{key.replace(/([A-Z])/g, " $1")}</span>
                  <span className="text-xs font-bold text-chocolate-800 capitalize">{val?.level || "-"}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Flavor Interactions */}
        {Array.isArray(d.flavorInteractions) && d.flavorInteractions.length > 0 && (
          <div className="mb-6">
            <h4 className="text-sm font-bold text-chocolate-900 mb-3">Flavor Interactions</h4>
            <ul className="space-y-2">
              {d.flavorInteractions.map((fi, idx) => (
                <li key={idx} className="p-3 rounded-xl bg-white border border-cream-300 text-sm text-chocolate-600">
                  <span className="font-semibold text-chocolate-800">
                    {(fi.ingredients || []).join(" + ")}
                  </span>
                  {fi.relationship && (
                    <span className={`ml-2 px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      fi.relationship === "complementary" ? "bg-sage-100 text-sage-700"
                      : fi.relationship === "contrasting" ? "bg-caramel-100 text-caramel-700"
                      : "bg-cream-200 text-chocolate-500"
                    }`}>{fi.relationship}</span>
                  )}
                  {fi.explanation && <p className="text-xs text-chocolate-500 mt-1">{fi.explanation}</p>}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Strengths & Issues */}
        {Array.isArray(d.strengths) && d.strengths.length > 0 && (
          <div className="mb-6">
            <h4 className="text-sm font-bold text-sage-700 mb-3">Strengths</h4>
            <ul className="space-y-1.5">
              {d.strengths.map((s, idx) => (
                <li key={idx} className="text-sm text-chocolate-600 flex items-start gap-2">
                  <span className="text-sage-400 mt-0.5">•</span>
                  <span>{typeof s === "object" ? s.claim || s.text : s}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {Array.isArray(d.potentialIssues) && d.potentialIssues.length > 0 && (
          <div className="mb-6">
            <h4 className="text-sm font-bold text-dustyrose-700 mb-3">Potential Issues</h4>
            <ul className="space-y-1.5">
              {d.potentialIssues.map((s, idx) => (
                <li key={idx} className="text-sm text-chocolate-600 flex items-start gap-2">
                  <span className="text-dustyrose-400 mt-0.5">•</span>
                  <span>{typeof s === "object" ? s.claim || s.text : s}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Assumptions & Limitations */}
        {((Array.isArray(d.assumptions) && d.assumptions.length > 0) || (Array.isArray(d.limitations) && d.limitations.length > 0)) && (
          <div className="mb-6">
            <h4 className="text-sm font-bold text-chocolate-900 mb-3">Assumptions & Limitations</h4>
            {Array.isArray(d.assumptions) && d.assumptions.length > 0 && (
              <div className="mb-2">
                <span className="text-[10px] font-mono uppercase text-chocolate-400">Assumptions</span>
                <ul className="space-y-1 mt-1">
                  {d.assumptions.map((a, idx) => (
                    <li key={idx} className="text-xs text-chocolate-500 flex items-start gap-2">
                      <span className="text-caramel-400 mt-0.5">•</span>
                      <span>{a}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {Array.isArray(d.limitations) && d.limitations.length > 0 && (
              <div>
                <span className="text-[10px] font-mono uppercase text-chocolate-400">Limitations</span>
                <ul className="space-y-1 mt-1">
                  {d.limitations.map((a, idx) => (
                    <li key={idx} className="text-xs text-chocolate-500 flex items-start gap-2">
                      <span className="text-dustyrose-400 mt-0.5">•</span>
                      <span>{a}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="pt-4 border-t border-cream-300 flex items-center justify-between text-xs text-chocolate-400 font-mono">
          <span>SavorSense Research Library</span>
          <span>AI-Estimated analysis</span>
        </div>
      </div>
    </div>
  )
}
