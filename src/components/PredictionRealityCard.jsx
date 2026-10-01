import { useState } from "react"
import { doc, updateDoc } from "firebase/firestore"
import { db } from "../firebase"
import { useAuth } from "../context/AuthContext"

const OBSERVATIONS = [
  { key: "sweetness", label: "Sweetness" },
  { key: "texture", label: "Texture" },
  { key: "browning", label: "Browning" },
  { key: "volume", label: "Volume / rise" },
  { key: "overall", label: "Overall result" },
]

const DIRECTIONS = ["increased", "decreased", "unchanged", "unknown"]
const EMPTY = Object.fromEntries(OBSERVATIONS.map((o) => [o.key, "unknown"]))

function normalizeDirection(text) {
  const t = (text || "").toLowerCase()
  if (/decreas|less|lower|\bdown\b|reduce|diminish/.test(t)) return "decreased"
  if (/increas|more|higher|\bup\b|boost|elevat|greater/.test(t)) return "increased"
  if (/unchang|same|stable|no change|maintain/.test(t)) return "unchanged"
  return "unknown"
}

function matchPrediction(prediction, observedKey) {
  if (!Array.isArray(prediction?.effects)) return { found: false }
  const target = observedKey === "browning" ? "brown" : observedKey
  const hit = prediction.effects.find((e) => {
    const label = ((e.dimension || "") + " " + (e.change || "")).toLowerCase()
    return label.includes(target)
  })
  if (!hit) return { found: false }
  const predictedDir = normalizeDirection(hit.change)
  return { found: true, dimension: hit.dimension, predictedDir, confidence: hit.confidence }
}

function Dot({ tone }) {
  const tones = {
    aligned: "bg-sage-500",
    different: "bg-dustyrose-500",
    norated: "bg-cream-300",
  }
  return <span className={`inline-block w-2 h-2 rounded-full ${tones[tone]}`} aria-hidden="true" />
}

export default function PredictionRealityCard({ experimentId, prediction, actual }) {
  const { user } = useAuth()
  const [form, setForm] = useState(actual?.observations || EMPTY)
  const [notes, setNotes] = useState(actual?.notes || "")
  const [saving, setSaving] = useState(false)
  const [savedNotice, setSavedNotice] = useState("")

  async function handleSave() {
    if (!user || !experimentId) {
      setSavedNotice("Sign in to record outcomes.")
      return
    }
    setSaving(true)
    try {
      await updateDoc(doc(db, "library", experimentId), {
        actualOutcome: {
          observations: Object.fromEntries(OBSERVATIONS.map((o) => [o.key, form[o.key] || "unknown"])),
          notes: notes.trim(),
          recordedAt: new Date().toISOString(),
        },
      })
      setSavedNotice("Outcome recorded ✓")
      setTimeout(() => setSavedNotice(""), 2500)
    } catch (err) {
      console.error("Recording outcome failed:", err)
      setSavedNotice("Could not record the outcome.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-4 rounded-2xl bg-white border border-cream-300 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <span className="text-[10px] text-caramel-600 font-mono uppercase tracking-wider block">Tried it in the kitchen?</span>
          <h4 className="text-sm font-bold text-chocolate-900 mt-0.5">Record Prediction → Reality</h4>
        </div>
        <span className="px-2 py-0.5 rounded bg-cream-100 border border-cream-300 text-[10px] text-chocolate-400 font-mono">
          qualitative only
        </span>
      </div>

      {actual?.observations ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {OBSERVATIONS.map((o) => {
              const observed = actual.observations[o.key] || "unknown"
              const pred = matchPrediction(prediction, o.key)
              let tone = "norated"
              if (observed === "unknown") tone = "norated"
              else if (pred.found && pred.predictedDir !== "unknown") tone = observed === pred.predictedDir ? "aligned" : "different"
              return (
                <div key={o.key} className="p-2.5 rounded-xl bg-cream-50 border border-cream-200">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-chocolate-800 capitalize">{o.label}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase border ${
                      observed === "unknown" ? "bg-cream-200 text-chocolate-400"
                        : "bg-white text-chocolate-700 border-chocolate-200"
                    }`}>{observed}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1.5 text-[10px] font-mono text-chocolate-400">
                    <Dot tone={tone} />
                    {observed === "unknown" ? (
                      <span>not rated</span>
                    ) : pred.found ? (
                      pred.predictedDir === "unknown" ? (
                        <span>no directional prediction to compare</span>
                      ) : (observed === pred.predictedDir ? (
                        <span>matches prediction ({pred.dimension} ↓↑)</span>
                      ) : (
                        <span>differs from prediction ({pred.dimension})</span>
                      ))
                    ) : (
                      <span>no prediction covers this</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
          {actual.notes && <p className="text-xs text-chocolate-500 italic bg-cream-50 border border-cream-200 rounded-xl p-2.5">“{actual.notes}”</p>}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setForm(actual.observations || EMPTY)}
              className="text-[11px] text-caramel-600 font-bold underline underline-offset-2 hover:text-caramel-700"
            >
              Edit outcome
            </button>
            {savedNotice && <span className="text-[11px] text-sage-600">{savedNotice}</span>}
          </div>
        </>
      ) : (
        <>
          <p className="text-xs text-chocolate-400">
            Bake it, taste it, and log how each dimension actually behaved. The card compares your notes against the
            experiment’s qualitative predictions.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {OBSERVATIONS.map((o) => (
              <label key={o.key} className="block">
                <span className="text-[11px] font-semibold text-chocolate-700 capitalize block mb-1">{o.label}</span>
                <select
                  value={form[o.key] || "unknown"}
                  onChange={(e) => setForm((prev) => ({ ...prev, [o.key]: e.target.value }))}
                  className="w-full p-2 rounded-xl bg-cream-50 border border-cream-300 text-xs text-chocolate-700"
                >
                  {DIRECTIONS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </label>
            ))}
          </div>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder="Notes from the kitchen (e.g. crumb collapsed slightly, browning normal)..."
            className="w-full p-2.5 rounded-xl bg-cream-50 border border-cream-300 text-xs text-chocolate-700 resize-none"
          />
          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              disabled={saving || !user}
              className="px-3.5 py-1.5 rounded-xl btn-secondary text-xs disabled:opacity-50"
            >
              {saving ? "Saving..." : "Record Actual Result"}
            </button>
            {!user && <span className="text-[11px] text-chocolate-400">Sign in to record outcomes.</span>}
            {savedNotice && <span className="text-[11px] text-sage-600">{savedNotice}</span>}
          </div>
        </>
      )}
    </div>
  )
}