const SENSORY_LABELS = [
  { key: "sweetness", label: "Sweetness" },
  { key: "acidity", label: "Acidity" },
  { key: "bitterness", label: "Bitterness" },
  { key: "richness", label: "Richness" },
  { key: "aroma", label: "Aroma" },
  { key: "texture", label: "Texture" },
  { key: "contrast", label: "Contrast" },
  { key: "overallBalance", label: "Overall Balance" },
]

const LEVEL_INDEX = { low: 0, moderate: 1, high: 2 }

function LevelBadge({ level }) {
  if (!level) return <span className="text-chocolate-300 text-[10px] font-mono">unknown</span>
  const styles = {
    low: "bg-cream-100 text-chocolate-500 border-cream-300",
    moderate: "bg-caramel-100 text-caramel-700 border-caramel-300",
    high: "bg-sage-100 text-sage-700 border-sage-300",
  }
  return <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase border ${styles[level] || styles.moderate}`}>{level}</span>
}

function TwinLabel({ kind, children }) {
  const styles = {
    FACT: "bg-white text-chocolate-500 border-chocolate-900",
    DETERMINISTIC: "bg-saffron-100 text-chocolate-900 border-chocolate-900",
    PREDICTED: "bg-caramel-100 text-caramel-700 border-caramel-300",
    UNCERTAIN: "bg-white text-chocolate-400 border-dashed",
  }
  return (
    <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border-2 ${styles[kind] || styles.FACT}`}>
      {children}
    </span>
  )
}

function TwinNode({ kind, title, sub, badge, extra }) {
  return (
    <div
      className={`px-3 py-2 rounded-md border-2 text-left flex flex-col gap-1 transition-colors ${
        kind === "DETERMINISTIC"
          ? "bg-saffron-100 border-chocolate-900 shadow-warm"
          : kind === "PREDICTED"
            ? "bg-caramel-50 border-caramel-300"
            : kind === "UNCERTAIN"
              ? "bg-white border-dashed border-chocolate-300"
              : "bg-white border-chocolate-900"
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        {title && <span className="text-xs font-bold text-chocolate-900 capitalize leading-tight">{title}</span>}
        {badge ? <TwinLabel kind={kind}>{badge}</TwinLabel> : null}
      </div>
      {sub && <span className="text-[11px] text-chocolate-500 font-mono leading-tight">{sub}</span>}
      {extra}
    </div>
  )
}

function ColumnArrow({ direction }) {
  if (direction === "right") {
    return (
      <div className="hidden md:flex items-center justify-center">
        <span className="text-2xl text-caramel-500 font-bold" aria-hidden="true">→</span>
      </div>
    )
  }
  return (
    <div className="md:hidden flex items-center justify-center py-0.5">
      <span className="text-lg text-caramel-500 font-bold" aria-hidden="true">↓</span>
    </div>
  )
}

export default function DigitalTwin({ model, modified, deltas, effects }) {
  if (!model) return null

  const ingredients = Array.isArray(model.ingredients) ? model.ingredients : []
  const macroRolls = (model.macroRolls && typeof model.macroRolls === "object" && Object.keys(model.macroRolls).length > 0)
    ? model.macroRolls
    : ingredients.reduce((acc, ing) => {
        const roll = ing.macroRoll || ing.role
        if (roll && roll !== "unknown") {
          acc[roll] = acc[roll] || []
          const label = ing.name || ""
          if (label && !acc[roll].includes(label)) acc[roll].push(label)
        }
        return acc
      }, {})
  const layers = Array.isArray(model.structuralLayers) ? model.structuralLayers : []
  const sensory = model.sensoryProfile || {}
  const hasExperimentContext = !!(modified || (Array.isArray(deltas) && deltas.length > 0) || (Array.isArray(effects) && effects.length > 0))

  const deltaMap = {}
  ;(deltas || []).forEach((d) => {
    const key = (d.name || "").toLowerCase()
    if (key) deltaMap[key] = d
  })

  function deltaFor(name) {
    const key = (name || "").toLowerCase()
    return deltaMap[key] || null
  }

  function sensoryKind(dim) {
    const base = dim.level
    const pred = modified ? modified[dim.key]?.level : null
    if (!hasExperimentContext) return { kind: "FACT", badge: null }
    if (!base) return { kind: "UNCERTAIN", badge: "UNCERTAIN" }
    if (pred == null) return { kind: "UNCERTAIN", badge: "UNCERTAIN" }
    if (pred !== base) {
      const dir = LEVEL_INDEX[pred] > LEVEL_INDEX[base] ? "▲" : "▼"
      return { kind: "PREDICTED", badge: `PREDICTED ${dir}` }
    }
    return { kind: "FACT", badge: "FACT" }
  }

  function effectChips() {
    if (Array.isArray(effects) && effects.length > 0) {
      return effects.map((e, i) => ({
        id: i,
        label: e.dimension,
        change: e.change,
        confidence: e.confidence || "unknown",
      }))
    }
    return SENSORY_LABELS
      .map((s) => ({ ...s, ...(sensoryKind(s) === "PREDICTED" ? { change: LEVEL_INDEX[modified[s.key].level] > LEVEL_INDEX[sensory[s.key].level] ? "increases" : "decreases", confidence: "unknown" } : null) }))
      .filter((s) => s.change)
      .map((s) => ({ id: s.key, label: s.label, change: s.change, confidence: s.confidence || "unknown" }))
  }
  const flow = effectChips()

  return (
    <div className="card-warm p-5 sm:p-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-3 border-b-[3px] border-chocolate-900 pb-3 mb-4">
        <div>
          <p className="font-mono text-[9px] text-caramel-600 uppercase tracking-[0.2em] mb-1">Culinary Digital Twin</p>
          <h3 className="font-display text-xl font-extrabold text-chocolate-900">{model.recipeName || "Recipe"}</h3>
        </div>
        {hasExperimentContext && (
          <div className="flex flex-wrap items-center gap-1.5">
            <TwinLabel kind="FACT">Fact</TwinLabel>
            <TwinLabel kind="DETERMINISTIC">Deterministic</TwinLabel>
            <TwinLabel kind="PREDICTED">Predicted</TwinLabel>
            <TwinLabel kind="UNCERTAIN">Uncertain</TwinLabel>
          </div>
        )}
      </div>

      <p className="text-[10px] text-chocolate-400 font-mono mb-4">
        A structured representation of the recipe used for experimentation — qualitative, not laboratory data.
      </p>

      {/* Columns */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr_auto_1fr] gap-2 md:gap-0">
        {/* INGREDIENTS */}
        <div>
          <div className="text-center mb-2">
            <span className="font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-chocolate-300 border-b-2 border-cream-300 pb-1 block">Ingredients</span>
          </div>
          <div className="space-y-2">
            {ingredients.length === 0 && <TwinNode kind="FACT" title="No ingredients parsed" sub="Unavailable in this record" />}
            {ingredients.map((ing, idx) => {
              const delta = deltaFor(ing.name || ing.macroRoll)
              const changedAmount = ing.amount != null ? `${ing.amount}${ing.unit || ""}` : (ing.quantity || "")
              if (delta && delta.adjusted && delta.original && delta.original !== delta.adjusted) {
                const deterministic = delta.deterministic
                return (
                  <TwinNode
                    key={idx}
                    kind={deterministic ? "DETERMINISTIC" : "PREDICTED"}
                    title={ing.name}
                    sub={`${delta.original} → ${delta.adjusted}`}
                    badge={deterministic ? "DETERMINISTIC" : "PREDICTED"}
                    extra={delta.changeNote ? <span className="text-[10px] text-chocolate-500 leading-snug">{delta.changeNote}</span> : null}
                  />
                )
              }
              return (
                <TwinNode
                  key={idx}
                  kind="FACT"
                  title={ing.name}
                  sub={changedAmount || ing.macroRoll || null}
                  badge={ing.macroRoll && ing.macroRoll !== "unknown" ? "FACT" : null}
                />
              )
            })}
          </div>
        </div>

        <ColumnArrow direction="right" />
        <ColumnArrow direction="down" />

        {/* SYSTEM ROLES */}
        <div>
          <div className="text-center mb-2">
            <span className="font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-chocolate-300 border-b-2 border-cream-300 pb-1 block">System Roles</span>
          </div>
          <div className="space-y-2">
            {layers.length === 0 && Object.keys(macroRolls).length === 0 && (
              <TwinNode kind="FACT" title="No structural facts" sub="Not available in this record" />
            )}
            {Object.entries(macroRolls).slice(0, 8).map(([roll, names]) => (
              <TwinNode key={roll} kind="FACT" title={roll} sub={names.slice(0, 3).join(", ")} badge="FACT" />
            ))}
            {layers.length > 0 && (
              <div className="p-3 rounded-md bg-chocolate-900 border-2 border-chocolate-900">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-cream-100">Structural layers</span>
                  <TwinLabel kind="FACT">Fact</TwinLabel>
                </div>
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {layers.map((l, i) => (
                    <span key={i} className="px-1.5 py-0.5 rounded bg-cream-100/10 border border-cream-100/20 text-cream-100 text-[10px] font-medium capitalize">
                      {l.name || l.type || `Layer ${i + 1}`}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <ColumnArrow direction="right" />
        <ColumnArrow direction="down" />

        {/* SENSORY */}
        <div>
          <div className="text-center mb-2">
            <span className="font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-chocolate-300 border-b-2 border-cream-300 pb-1 block">Sensory State</span>
          </div>
          <div className="space-y-2">
            {SENSORY_LABELS.map((s) => {
              const dim = sensory[s.key] || {}
              const st = sensoryKind({ key: s.key, ...dim })
              const pred = modified ? modified[s.key]?.level : null
              return (
                <TwinNode
                  key={s.key}
                  kind={st.kind}
                  title={s.label}
                  badge={st.badge}
                  extra={
                    <span className="flex items-center gap-1.5">
                      <LevelBadge level={dim.level} />
                      {hasExperimentContext && pred != null && (
                        <span className="text-chocolate-400 text-[10px] font-mono">→</span>
                      )}
                      {hasExperimentContext && pred != null && <LevelBadge level={pred} />}
                      {hasExperimentContext && pred == null && <span className="text-[10px] text-chocolate-300 italic">no prediction</span>}
                    </span>
                  }
                />
              )
            })}
          </div>
        </div>
      </div>

      {/* Change propagation */}
      {hasExperimentContext && flow.length > 0 && (
        <div className="mt-5 border-t-[3px] border-chocolate-900 pt-4">
          <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-caramel-600 mb-2">
            Change propagation {Array.isArray(deltas) && deltas.some((d) => d.deterministic) ? "(deterministic trigger + predicted cascade)" : "(predicted cascade)"}
          </p>
          <div className="flex flex-wrap gap-2">
            {flow.map((f) => (
              <div key={f.id} className="px-2.5 py-1.5 rounded-md bg-white border-2 border-chocolate-900 flex items-center gap-2">
                <span className="text-[11px] font-bold text-chocolate-800 capitalize">{f.label}</span>
                <span className="text-[11px] text-caramel-600 capitalize">{f.change}</span>
                <TwinLabel kind="PREDICTED">Predicted</TwinLabel>
              </div>
            ))}
          </div>
          <p className="text-[9px] text-chocolate-400 font-mono mt-2 italic">
            Arrows are qualitative directions (increase / decrease / possible), never measured magnitudes.
          </p>
        </div>
      )}
    </div>
  )
}