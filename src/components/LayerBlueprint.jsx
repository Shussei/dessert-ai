import { useState } from "react"

const TYPE_STYLES = {
  base: "bg-cream-100 border-cream-300 hover:border-caramel-300",
  core: "bg-sage-50 border-sage-200 hover:border-sage-300",
  body: "bg-caramel-50 border-caramel-200 hover:border-caramel-300",
  coating: "bg-dustyrose-50 border-dustyrose-200 hover:border-dustyrose-300",
  garnish: "bg-white border-cream-300 hover:border-cream-400",
}

const LAYER_LABELS = {
  base: "Base / Foundation",
  core: "Core / Insert",
  body: "Body / Main Structure",
  coating: "Coating / Finish",
  garnish: "Garnish / Accent",
}

function ProvenanceTag({ children = "AI-Estimated" }) {
  return (
    <span className="provenance-tag bg-caramel-100 text-caramel-700 border border-caramel-300">
      {children}
    </span>
  )
}

export default function LayerBlueprint({ layers = [], title = "Structural Architecture" }) {
  const [selected, setSelected] = useState(null)

  // No fabricated fallback. If no layers provided, render an honest empty state.
  if (!layers || layers.length === 0) {
    return (
      <div className="p-6 rounded-2xl bg-white border border-cream-300 shadow-warm">
        <div className="flex items-center gap-2 mb-3">
          <h3 className="font-display text-lg font-bold text-chocolate-900">{title}</h3>
          <ProvenanceTag>AI-Estimated</ProvenanceTag>
        </div>
        <p className="text-sm text-chocolate-400 italic py-4">
          No structural layers were identified for this recipe. Provide more detail about the composition
          (base, core, body, coating, garnish) to see a structural breakdown.
        </p>
      </div>
    )
  }

  // Display layers in stacking order: base at bottom, garnish at top
  const ordered = [...layers].reverse()

  return (
    <div className="p-6 rounded-2xl bg-white border border-cream-300 shadow-warm">
      <div className="flex items-center gap-2 mb-2">
        <h3 className="font-display text-lg font-bold text-chocolate-900">{title}</h3>
        <ProvenanceTag>AI-Estimated</ProvenanceTag>
      </div>
      <p className="text-xs text-chocolate-400 mb-5">
        Deconstructed structural stack. Roles are inferred from ingredient function, not measured.
      </p>

      <div className="space-y-2">
        {ordered.map((layer, index) => {
          const isSelected = selected?.index === layer.index || selected?.name === layer.name
          const typeStyle = TYPE_STYLES[layer.type] || "bg-white border-cream-300"

          return (
            <button
              key={layer.name || `${layer.type}-${index}`}
              onClick={() => setSelected(isSelected ? null : layer)}
              className={`w-full text-left p-3.5 rounded-xl border transition-all duration-200 ${typeStyle} ${
                isSelected ? "ring-2 ring-caramel-400" : ""
              }`}
              aria-expanded={isSelected}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-lg bg-white/80 border border-cream-300 flex items-center justify-center text-xs font-bold text-chocolate-600 shrink-0">
                    {ordered.length - index}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-chocolate-800">
                        {layer.name || LAYER_LABELS[layer.type] || (layer.type + " component")}
                      </h4>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-caramel-600">
                        {LAYER_LABELS[layer.type] || layer.type}
                      </span>
                    </div>
                    {layer.description && (
                      <p className="text-xs text-chocolate-500 mt-0.5">{layer.description}</p>
                    )}
                  </div>
                </div>
                <svg
                  className={`w-4 h-4 text-chocolate-300 shrink-0 transition-transform ${isSelected ? "rotate-90" : ""}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </div>

              {isSelected && layer.ingredients && layer.ingredients.length > 0 && (
                <div className="mt-3 pt-3 border-t border-current/10">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-chocolate-400">Component ingredients</span>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {layer.ingredients.map((ing, ii) => (
                      <span key={ii} className="px-2 py-0.5 rounded bg-white border border-cream-300 text-chocolate-600 text-[10px] font-medium">
                        {ing}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
