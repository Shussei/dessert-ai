import { useState, useEffect, useMemo } from "react"
import { useSearchParams, Link } from "react-router-dom"
import { runExperiment, generateCandidates } from "../services/culinaryEngine"
import FlavorRadar from "../components/FlavorRadar"
import DigitalTwin from "../components/DigitalTwin"
import ExperimentMatrix from "../components/ExperimentMatrix"
import { useAuth } from "../context/AuthContext"
import { collection, query, where, getDocs, addDoc, getDoc, doc, serverTimestamp } from "firebase/firestore"
import { db } from "../firebase"

const EXAMPLE_RECIPES = [
  {
    label: "Chocolate Cake",
    text: `Classic Chocolate Cake
- 250g all-purpose flour
- 200g granulated sugar
- 3 eggs
- 150g unsalted butter
- 60g cocoa powder
- 200ml whole milk
- 8g baking powder
- pinch of salt
Method: cream butter and sugar, beat in eggs, fold dry ingredients with milk, bake at 170C for 35 minutes.`,
  },
  {
    label: "Dark Chocolate Entremet",
    text: `Dark Chocolate & Passion Fruit Entremet
Base: 150g Hazelnut Sablé Breton
Core: 100ml Passion Fruit gelée insert
Body: 200g 70% Dark Chocolate Bavarian Mousse (eggs, sugar, cream)
Glaze: Glossy Cocoa Mirror Glaze`,
  },
]

const QUICK_MODS = [
  "Reduce sugar by 25%",
  "Remove the eggs",
  "Replace butter with coconut oil",
  "Reduce flour by 15%",
  "Swap whole milk for oat milk",
]

const QUICK_GOALS = [
  "25% less sugar, keep the texture",
  "Make it richer and more indulgent",
  "Lighten it — less butter, keep the crumb",
  "Reduce sweetness without losing moisture",
]

const GOAL_STAGES = [
  "Interpreting your goal...",
  "Finding candidate modifications...",
  "Grounding candidates with deterministic rules...",
  "Rating predicted fit for each candidate...",
  "Preparing experiment plans...",
]

function ConfidenceBadge({ level }) {
  if (!level) return null
  const styles = {
    high: "bg-sage-100 text-sage-700 border-sage-300",
    moderate: "bg-caramel-100 text-caramel-700 border-caramel-300",
    low: "bg-dustyrose-100 text-dustyrose-700 border-dustyrose-200",
    unknown: "bg-cream-100 text-chocolate-400 border-cream-300",
  }
  return (
    <span className={`provenance-tag ${styles[level] || styles.unknown}`}>{level}</span>
  )
}

function SeverityBadge({ level }) {
  if (!level) return null
  const styles = {
    minor: "bg-cream-100 text-chocolate-500 border-cream-300",
    moderate: "bg-caramel-100 text-caramel-700 border-caramel-300",
    significant: "bg-dustyrose-100 text-dustyrose-700 border-dustyrose-200",
  }
  return (
    <span className={`provenance-tag ${styles[level] || styles.moderate}`}>{level}</span>
  )
}

function ProvenanceTag({ children }) {
  return (
    <span className="provenance-tag bg-caramel-100 text-caramel-700 border-caramel-300">
      {children}
    </span>
  )
}

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

const STAGES = [
  "Classifying ingredient roles...",
  "Detecting the modification...",
  "Applying deterministic culinary rules...",
  "Reasoning through predicted effects...",
  "Checking conflicts and compensation...",
]
const MAX_STAGE = STAGES.length - 1

function buildSensoryDiff(base, predicted) {
  return SENSORY_LABELS.map(({ key, label }) => {
    const l1 = base?.[key]?.level
    const l2 = predicted?.[key]?.level
    let direction = null
    if (l1 && l2 && l1 !== l2) {
      direction = LEVEL_INDEX[l2] > LEVEL_INDEX[l1] ? "up" : (LEVEL_INDEX[l2] < LEVEL_INDEX[l1] ? "down" : null)
    }
    return { key, label, l1, l2, direction, explanation: predicted?.[key]?.explanation }
  })
}

export default function WhatIf() {
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const [recipeText, setRecipeText] = useState(EXAMPLE_RECIPES[0].text)
  const [modification, setModification] = useState("Reduce sugar by 25%")
  const [mode, setMode] = useState("modify")
  const [goalText, setGoalText] = useState("")
  const [goalPlan, setGoalPlan] = useState(null)
  const [selectedCandidateId, setSelectedCandidateId] = useState(null)
  const [generating, setGenerating] = useState(false)
  const [goalError, setGoalError] = useState("")
  const [loading, setLoading] = useState(false)
  const [stage, setStage] = useState(0)
  const [error, setError] = useState("")
  const [result, setResult] = useState(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [baseLibraryId, setBaseLibraryId] = useState(null)
  const [linkedExperimentId, setLinkedExperimentId] = useState(null)
  const [showPicker, setShowPicker] = useState(false)
  const [libraryItems, setLibraryItems] = useState([])
  const [pickerLoading, setPickerLoading] = useState(false)
  const [openWhy, setOpenWhy] = useState({})

  const busy = loading || generating
  const base = result?.baseState
  const predicted = result?.predictedModifiedState
  const sensoryDiff = useMemo(
    () => (base && predicted ? buildSensoryDiff(base.sensoryProfile, predicted.sensory) : []),
    [base, predicted]
  )

  useEffect(() => {
    if (!busy) return
    const interval = setInterval(() => {
      setStage((s) => Math.min(s + 1, MAX_STAGE))
    }, 2600)
    return () => clearInterval(interval)
  }, [busy])

  useEffect(() => {
    async function loadFromUrl() {
      const baseId = searchParams.get("base")
      if (!baseId || !user) return
      try {
        const snap = await getDoc(doc(db, "library", baseId))
        if (snap.exists()) {
          const item = snap.data()
          if (item.recipeText) {
            setRecipeText(item.recipeText)
            setBaseLibraryId(baseId)
            setLinkedExperimentId(item.experimentId || null)
          }
        }
      } catch {
        // fall through silently; empty state handles the rest
      }
    }
    loadFromUrl()
  }, [searchParams, user])

  async function openPicker() {
    if (!user) return
    setPickerLoading(true)
    setShowPicker(true)
    try {
      const q = query(collection(db, "library"), where("uid", "==", user.uid))
      const snap = await getDocs(q)
      const items = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter((i) => i.recipeText)
        .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
        .slice(0, 10)
      setLibraryItems(items)
    } catch {
      setLibraryItems([])
    }
    setPickerLoading(false)
  }

  async function loadFromLibrary(item) {
    setRecipeText(item.recipeText)
    setBaseLibraryId(item.id)
    setLinkedExperimentId(item.experimentId || null)
    setShowPicker(false)
    setResult(null)
    setSaved(false)
    setError("")
    setGoalPlan(null)
    setSelectedCandidateId(null)
  }

  async function handleGenerate() {
    if (!recipeText.trim()) {
      setGoalError("Enter a recipe to design experiments for.")
      return
    }
    if (!goalText.trim()) {
      setGoalError("Describe your goal (e.g. '25% less sugar, keep the texture').")
      return
    }
    setGoalError("")
    setGoalPlan(null)
    setResult(null)
    setSaved(false)
    setError("")
    setGenerating(true)
    setStage(0)
    try {
      const resp = await generateCandidates(recipeText.trim(), goalText.trim())
      setGoalPlan(resp.data)
    } catch (err) {
      if (err.message?.includes("Could not connect")) {
        setGoalError("Could not connect to the analysis server. Please ensure the backend is running.")
      } else if (err.message?.includes("timed out") || err.message?.includes("timeout")) {
        setGoalError("Candidate generation timed out. Try a shorter goal.")
      } else {
        setGoalError(err.message || "Candidate generation failed. Please try again.")
      }
    } finally {
      setGenerating(false)
    }
  }

  async function handleUseCandidate(candidate) {
    if (!candidate?.modification) return
    setModification(candidate.modification)
    setSelectedCandidateId(candidate.id)
    await handleRun(candidate.modification)
  }

  async function handleRun(overrideMod) {
    if (!recipeText.trim()) {
      setError("Enter a recipe to run the experiment on.")
      return
    }
    const modToRun = (overrideMod || modification || "").trim()
    if (!modToRun) {
      setError("Describe the modification (e.g. 'Reduce sugar by 25%').")
      return
    }
    setError("")
    setResult(null)
    setSaved(false)
    setLoading(true)
    setStage(0)
    try {
      const resp = await runExperiment(recipeText.trim(), modToRun)
      setResult(resp.data)
    } catch (err) {
      if (err.message?.includes("Could not connect")) {
        setError("Could not connect to the analysis server. Please ensure the backend is running.")
      } else if (err.message?.includes("timed out") || err.message?.includes("timeout")) {
        setError("Experiment analysis timed out. Try a shorter recipe or modification.")
      } else {
        setError(err.message || "Experiment analysis failed. Please try again.")
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    if (!user || !result) {
      setError("Sign in to save experiments.")
      return
    }
    setSaving(true)
    try {
      const experimentId = linkedExperimentId || `exp_${Date.now()}`
      const selectedCandidate = goalPlan?.candidates?.find((c) => c.id === selectedCandidateId) || null
      await addDoc(collection(db, "library"), {
        uid: user.uid,
        name: result.modification.summary || "What-If Experiment",
        type: "experiment",
        recipeText: recipeText.trim(),
        modification: modification.trim(),
        experimentId,
        parentId: baseLibraryId || null,
        confidence: result.confidence?.overall || "unknown",
        goal: goalPlan?.goal ? { intent: goalPlan.goal.intent, constraints: goalPlan.goal.constraints, target: goalPlan.goal.target } : null,
        candidateId: selectedCandidate?.id || null,
        candidateTitle: selectedCandidate?.title || null,
        experimentData: result,
        createdAt: serverTimestamp(),
      })
      setSaved(true)
    } catch (err) {
      console.error("Save experiment failed:", err)
      setError("Could not save the experiment to your library.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">

      {/* Header */}
      <div className="border-b-[3px] border-chocolate-900 pb-6">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span className="badge-warm">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 3h8v18H8zM8 9h3m-3 4h6m-6 4h4" />
            </svg>
            Experiment Engine
          </span>
          <span className="text-xs text-chocolate-300 font-mono">Predict → Modify → Compare</span>
        </div>
        <h1 className="section-heading">What-If Culinary Lab</h1>
        <p className="section-subheading">
          Take a base recipe, propose one change, and see honest, confidence-weighted predictions anchored by
          deterministic ingredient-role rules — not invented numbers.
        </p>
      </div>

      {/* Input */}
      <div className="card-warm p-6 space-y-5">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <label className="text-xs font-semibold text-chocolate-600 uppercase tracking-wider">
            Base Recipe
          </label>
          <div className="flex items-center gap-3 flex-wrap">
            {EXAMPLE_RECIPES.map((ex) => (
              <button
                key={ex.label}
                onClick={() => { setRecipeText(ex.text); setResult(null); setSaved(false); setError("") }}
                className="text-[11px] font-medium text-caramel-600 hover:text-caramel-700 underline underline-offset-2 transition-colors"
              >
                {ex.label}
              </button>
            ))}
            {user && (
              <button
                onClick={openPicker}
                className="text-[11px] font-medium text-chocolate-600 hover:text-chocolate-900 underline underline-offset-2 transition-colors"
              >
                Load from Library
              </button>
            )}
          </div>
        </div>
        <textarea
          rows={7}
          value={recipeText}
          onChange={(e) => { setRecipeText(e.target.value); setResult(null) }}
          className="input-warm resize-none font-mono text-xs leading-relaxed"
          placeholder={`Paste a dessert recipe...\n\n- 250g flour\n- 200g sugar\n- 3 eggs\n- ...`}
          disabled={loading}
        />
        {baseLibraryId && (
          <p className="text-[10px] text-sage-600 font-mono">
            Loaded from library record — saving will link this experiment as a child of that base.
          </p>
        )}

        <div className="flex items-center gap-1 p-1 rounded-sm bg-cream-100 border-2 border-chocolate-900 w-fit mb-5">
          <button
            onClick={() => { setMode("modify"); setGoalError(""); setResult(null); setSelectedCandidateId(null) }}
            disabled={busy}
            className={`px-4 py-1.5 rounded-sm text-xs font-bold transition-all disabled:opacity-50 ${mode === "modify" ? "bg-chocolate-900 text-cream-50" : "text-chocolate-600 hover:text-chocolate-900"}`}
          >
            Direct modification
          </button>
          <button
            onClick={() => { setMode("goal"); setError(""); setSelectedCandidateId(null) }}
            disabled={busy}
            className={`px-4 py-1.5 rounded-sm text-xs font-bold transition-all disabled:opacity-50 ${mode === "goal" ? "bg-chocolate-900 text-cream-50" : "text-chocolate-600 hover:text-chocolate-900"}`}
          >
            State a goal
          </button>
        </div>

        {mode === "modify" ? (
        <div className="space-y-2 mb-5">
          <label className="text-xs font-semibold text-chocolate-600 uppercase tracking-wider">
            Modification
          </label>
          <div className="flex flex-col gap-3">
            <input
              type="text"
              value={modification}
              onChange={(e) => { setModification(e.target.value); setResult(null) }}
              placeholder="e.g. Reduce sugar by 25%"
              className="input-warm"
              disabled={busy}
            />
            <div className="flex flex-wrap gap-2">
              {QUICK_MODS.map((m) => (
                <button
                  key={m}
                  onClick={() => { setModification(m); setResult(null) }}
                  disabled={busy}
                  className="px-2.5 py-1.5 rounded-sm bg-cream-100 border-2 border-chocolate-300 hover:border-chocolate-900 hover:bg-saffron-100 text-[11px] text-chocolate-600 font-medium transition-all disabled:opacity-50"
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
        </div>
        ) : (
        <div className="space-y-2 mb-5">
          <label className="text-xs font-semibold text-chocolate-600 uppercase tracking-wider">
            Goal
          </label>
          <div className="flex flex-col gap-3">
            <textarea
              rows={2}
              value={goalText}
              onChange={(e) => { setGoalText(e.target.value); setGoalPlan(null); setResult(null) }}
              placeholder="e.g. 25% less sugar, keep the texture"
              className="input-warm resize-none font-mono text-xs leading-relaxed"
              disabled={busy}
            />
            <div className="flex flex-wrap gap-2">
              {QUICK_GOALS.map((g) => (
                <button
                  key={g}
                  onClick={() => { setGoalText(g); setGoalPlan(null); setResult(null) }}
                  disabled={busy}
                  className="px-2.5 py-1.5 rounded-sm bg-cream-100 border-2 border-chocolate-300 hover:border-chocolate-900 hover:bg-sage-50 text-[11px] text-chocolate-600 font-medium transition-all disabled:opacity-50"
                >
                  {g}
                </button>
              ))}
            </div>
          </div>
        </div>
        )}

        {goalError && mode === "goal" && (
          <p className="text-xs text-dustyrose-600 mb-2" role="alert">{goalError}</p>
        )}

        <button
          onClick={mode === "goal" ? handleGenerate : () => handleRun()}
          disabled={busy || !recipeText.trim() || (mode === "goal" ? !goalText.trim() : !modification.trim())}
          className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {busy
            ? mode === "goal" ? "Designing candidate experiments..." : "Running Experiment..."
            : mode === "goal" ? "Design candidate experiments →" : "Run Experiment →"}
        </button>

        {mode === "goal" && !goalPlan && !busy && (
          <p className="text-[10px] text-chocolate-400 font-mono mt-3">
            The engine will propose up to 3 candidate modifications, each with predicted fit, effects, trade-offs and risks.
            You pick one to run.
          </p>
        )}
      </div>

      {/* Candidate matrix (goal mode) */}
      {mode === "goal" && goalPlan && !busy && (
        <div className="animate-fade-in-up">
          <ExperimentMatrix
            goal={goalPlan.goal}
            candidates={goalPlan.candidates}
            selectedId={selectedCandidateId}
            onSelect={(id) => {
              const candidate = goalPlan.candidates.find((c) => c.id === id)
              handleUseCandidate(candidate)
            }}
            generating={generating}
          />
        </div>
      )}

      {/* Library picker */}
      {showPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-chocolate-900/50 backdrop-blur-sm overflow-y-auto animate-fade-in" onClick={() => setShowPicker(false)}>
          <div className="w-full max-w-xl p-6 rounded-md bg-cream-50 border-2 border-chocolate-900 shadow-warm-xl relative my-8" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-lg font-bold text-chocolate-900">Use a saved recipe as base</h3>
              <button onClick={() => setShowPicker(false)} aria-label="Close" className="text-chocolate-400 hover:text-chocolate-900 text-xl px-2">✕</button>
            </div>
            {pickerLoading ? (
              <p className="text-sm text-chocolate-400 py-6 text-center">Loading your library...</p>
            ) : libraryItems.length === 0 ? (
              <p className="text-sm text-chocolate-400 py-6 text-center">No saved recipes with text found. Save an evaluation from the Evaluator first.</p>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {libraryItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => loadFromLibrary(item)}
                    className="w-full text-left p-3 rounded-sm bg-white border-2 border-chocolate-300 hover:border-chocolate-900 hover:bg-saffron-100 transition-all"
                  >
                    <span className="block text-xs font-bold text-chocolate-900">{item.name || "Untitled"}</span>
                    <span className="block text-[10px] font-mono text-chocolate-400 mt-0.5">{item.type || "saved"} · {item.recipeText?.slice(0, 80)}...</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="p-4 rounded-md bg-dustyrose-50 border-2 border-dustyrose-200 flex items-start gap-3 animate-fade-in" role="alert">
          <svg className="w-5 h-5 text-dustyrose-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm text-dustyrose-700">{error}</p>
        </div>
      )}

      {/* Loading */}
      {busy && (
        <div className="card-warm p-8 animate-fade-in">
          <div className="flex flex-col items-center gap-5">
            <div className="w-16 h-16 rounded-md bg-caramel-100 border-2 border-caramel-300 flex items-center justify-center">
              <svg className="w-8 h-8 text-caramel-500 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 3h8v18H8zM8 9h3m-3 4h6m-6 4h4" />
              </svg>
            </div>
            <p className="text-sm font-bold text-chocolate-900 mb-1">{mode === "goal" ? "Designing candidate experiments" : "Running culinary what-if"}</p>
            <ul className="space-y-1.5 text-left">
              {(mode === "goal" ? GOAL_STAGES : STAGES).map((s, idx) => (
                <li key={s} className="flex items-center gap-2 text-xs transition-opacity duration-300" style={{ opacity: idx <= stage ? 1 : 0.3 }}>
                  {idx < stage ? (
                    <svg className="w-3.5 h-3.5 text-sage-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : idx === stage ? (
                    <svg className="w-3.5 h-3.5 text-caramel-500 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : (
                    <span className="w-3.5 h-3.5 rounded-full border-2 border-cream-300" aria-hidden="true" />
                  )}
                  <span className={idx <= stage ? "text-chocolate-700 font-medium" : "text-chocolate-300"}>{s}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Results */}
      {result && !loading && (
        <div className="space-y-6 animate-fade-in-up">

          {/* Title + save */}
          <div className="card-warm p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="badge-warm">Experiment Result</span>
                  <ProvenanceTag>AI-Estimated + Rules</ProvenanceTag>
                  {selectedCandidateId && goalPlan?.goal?.intent && (
                    <ProvenanceTag>goal: {goalPlan.goal.intent}</ProvenanceTag>
                  )}
                  <ConfidenceBadge level={result.confidence?.overall} />
                </div>
                <p className="font-mono text-[10px] text-chocolate-400 uppercase tracking-wider mb-1">
                  {result.baseState.recipeName || "Base recipe"}
                </p>
                <h2 className="font-display text-2xl font-bold text-chocolate-900">
                  {result.experimentTitle || result.modification?.summary || "What-If Experiment"}
                </h2>
                <p className="text-xs text-chocolate-400 mt-1">{result.modification?.summary}</p>
              </div>
              <div className="flex flex-col items-start sm:items-end gap-2 shrink-0">
                {user ? (
                  <button
                    onClick={handleSave}
                    disabled={saving || saved}
                    className={`px-4 py-2 rounded-md font-bold text-sm transition-all flex items-center gap-2 border-2 ${
                      saved
                        ? "bg-sage-100 text-sage-600 border-sage-300"
                        : "btn-secondary"
                    } disabled:opacity-50`}
                  >
                    {saved ? "Saved to Library ✓" : saving ? "Saving..." : "Save Experiment"}
                  </button>
                ) : (
                  <Link to="/auth" className="text-xs text-caramel-600 hover:underline">Sign in to save experiments</Link>
                )}
                {result.overallAssessment && (
                  <span className="inline-flex items-center gap-2 text-xs">
                    <span className="font-mono text-chocolate-400 uppercase">Assessment:</span>
                    <span className={`provenance-tag border-2 ${
                      result.overallAssessment.rating === "risky" || result.overallAssessment.rating === "avoid"
                        ? "bg-dustyrose-100 text-dustyrose-700 border-dustyrose-200"
                        : result.overallAssessment.rating === "worthwhile"
                          ? "bg-sage-100 text-sage-700 border-sage-300"
                          : "bg-caramel-100 text-caramel-700 border-caramel-300"
                    }`}>
                      {result.overallAssessment.rating}
                    </span>
                  </span>
                )}
              </div>
            </div>
            {result.overallAssessment?.explanation && (
              <p className="text-xs text-chocolate-500 mt-4 leading-relaxed">{result.overallAssessment.explanation}</p>
            )}
          </div>

          {/* Comparison summary */}
          {result.comparisonSummary && (
            <div className="card-warm p-6">
              <div className="flex items-center gap-2 mb-4">
                <h3 className="font-display text-lg font-bold text-chocolate-900">Base vs Modified</h3>
                <ProvenanceTag>AI-Estimated</ProvenanceTag>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-chocolate-400 block mb-1">What changed</span>
                  <p className="text-sm text-chocolate-700">{result.comparisonSummary.whatChanged || result.modification?.summary}</p>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-chocolate-400 block mt-4 mb-1">Why</span>
                  <p className="text-sm text-chocolate-700">{result.comparisonSummary.why || "—"}</p>
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-chocolate-400 block mb-1">Expected</span>
                  <p className="text-sm text-chocolate-700">{result.comparisonSummary.expected || "—"}</p>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-chocolate-400 block mt-4 mb-1">Trade-off</span>
                  <p className="text-sm text-chocolate-700">{result.comparisonSummary.tradeoff || "—"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 mt-4 pt-4 border-t-2 border-cream-300">
                <span className="text-[10px] font-mono uppercase tracking-wider text-chocolate-400 inline-flex items-center gap-2">
                  Confidence <ConfidenceBadge level={result.comparisonSummary.confidence} />
                </span>
                {result.comparisonSummary.verifiable && (
                  <span className="text-[10px] text-chocolate-400 font-mono">· {result.comparisonSummary.verifiable}</span>
                )}
              </div>
            </div>
          )}

          {/* Digital twin */}
          {base && (
            <DigitalTwin
              model={base}
              modified={predicted?.sensory}
              deltas={predicted?.ingredients}
              effects={result.effects}
            />
          )}

          {/* Predicted state + radar comparison */}
          {predicted && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <FlavorRadar
                radarData={base?.sensoryProfile}
                comparisonData={predicted.sensory}
                title="Sensory: Base vs Predicted"
                label1="Base"
                label2="Predicted"
              />
              <div className="card-warm p-6">
                <div className="flex items-center gap-2 mb-4">
                  <h3 className="font-display text-lg font-bold text-chocolate-900">Sensory Shift</h3>
                  <ProvenanceTag>AI-Estimated</ProvenanceTag>
                </div>
                <p className="text-xs text-chocolate-400 mb-4">
                  Qualitative levels (Low / Moderate / High). Arrows show predicted direction of change.
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-cream-100 text-chocolate-500 font-mono uppercase text-[10px] border-b-2 border-cream-200">
                      <tr>
                        <th className="py-2.5 px-3 text-left">Dimension</th>
                        <th className="py-2.5 px-3 text-center">Base</th>
                        <th className="py-2.5 px-3 text-center">Predicted</th>
                        <th className="py-2.5 px-3 text-center">Δ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-cream-200">
                      {sensoryDiff.map((row) => (
                        <tr key={row.key} className="hover:bg-cream-50 transition-colors">
                          <td className="py-2.5 px-3 font-medium text-chocolate-700">{row.label}</td>
                          <td className="py-2.5 px-3 text-center">{row.l1 ? <ConfidenceBadge level={row.l1} /> : <span className="text-chocolate-300 text-xs">—</span>}</td>
                          <td className="py-2.5 px-3 text-center">{row.l2 ? <ConfidenceBadge level={row.l2} /> : <span className="text-chocolate-300 text-xs">—</span>}</td>
                          <td className="py-2.5 px-3 text-center font-mono text-xs">
                            {row.direction === "up" ? <span className="text-sage-600">▲ up</span>
                              : row.direction === "down" ? <span className="text-dustyrose-500">▼ down</span>
                                : <span className="text-chocolate-300">—</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Ingredient deltas */}
          {predicted && Array.isArray(predicted.ingredients) && predicted.ingredients.length > 0 && (
            <div className="card-warm overflow-hidden">
              <div className="px-6 py-4 border-b-2 border-chocolate-900 flex items-center gap-2">
                <h3 className="font-display text-lg font-bold text-chocolate-900">Predicted Ingredient Changes</h3>
                <ProvenanceTag>Rules + AI</ProvenanceTag>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-cream-100 text-chocolate-500 font-mono uppercase text-[10px] border-b-2 border-cream-200">
                    <tr>
                      <th className="py-2.5 px-6 text-left">Ingredient</th>
                      <th className="py-2.5 px-3 text-left">Base</th>
                      <th className="py-2.5 px-3 text-left">Adjusted</th>
                      <th className="py-2.5 px-6 text-left">Note</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-cream-200">
                    {predicted.ingredients.map((ing, idx) => (
                      <tr key={idx} className="hover:bg-cream-50 transition-colors">
                        <td className="py-2.5 px-6 font-medium text-chocolate-800 capitalize">{ing.name || "—"}</td>
                        <td className="py-2.5 px-3 font-mono text-xs text-chocolate-500">{ing.original || "—"}</td>
                        <td className="py-2.5 px-3 font-mono text-xs text-chocolate-900">{ing.adjusted || "—"}</td>
                        <td className="py-2.5 px-6 text-xs text-chocolate-500">{ing.changeNote || ""}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {predicted.structuralNote && (
                <p className="px-6 py-3 text-xs text-chocolate-500 bg-cream-100 border-t-2 border-cream-300">
                  {predicted.structuralNote}
                </p>
              )}
            </div>
          )}

          {/* Effects */}
          {Array.isArray(result.effects) && result.effects.length > 0 && (
            <div className="card-warm p-6">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-display text-lg font-bold text-chocolate-900">Predicted Effects</h3>
                <ProvenanceTag>AI-Estimated</ProvenanceTag>
              </div>
              <p className="text-xs text-chocolate-400 mb-4">
                Qualitative directions only. Expand Why? for the reasoning surfaced for each effect.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {result.effects.map((eff, idx) => (
                  <div key={idx} className="p-4 rounded-md bg-cream-50 border-2 border-cream-300">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-sm font-bold text-chocolate-800 capitalize">{eff.dimension}</span>
                      <span className="inline-flex items-center gap-2">
                        <span className="text-xs text-caramel-600 font-semibold">{eff.change}</span>
                        <ConfidenceBadge level={eff.confidence} />
                      </span>
                    </div>
                    {eff.summary && <p className="text-xs text-chocolate-500 leading-relaxed">{eff.summary}</p>}
                    <button
                      onClick={() => setOpenWhy((prev) => ({ ...prev, [idx]: !prev[idx] }))}
                      className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-bold text-caramel-600 hover:text-caramel-700 underline underline-offset-2 transition-colors"
                    >
                      <svg className={`w-3 h-3 transition-transform ${openWhy[idx] ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                      {openWhy[idx] ? "Hide why" : "Why?"}
                    </button>
                    {openWhy[idx] && (
                      <div className="mt-2 pt-2 border-t-2 border-cream-300 animate-fade-in">
                        {eff.explanation && <p className="text-xs text-chocolate-500 leading-relaxed">{eff.explanation}</p>}
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          <span className="text-[10px] font-mono text-chocolate-400 uppercase">Driver:</span>
                          <span className="text-[11px] text-chocolate-600 capitalize">{eff.driver || eff.drivenBy || "modification extrapolation"}</span>
                          {eff.confidence && <ConfidenceBadge level={eff.confidence} />}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Compensations */}
          {Array.isArray(result.suggestedCompensation) && result.suggestedCompensation.length > 0 && (
            <div className="card-warm p-6">
              <div className="flex items-center gap-2 mb-4">
                <h3 className="font-display text-lg font-bold text-chocolate-900">Suggested Compensation</h3>
                <ProvenanceTag>Rules + AI</ProvenanceTag>
              </div>
              <div className="space-y-2">
                {result.suggestedCompensation.map((c, idx) => (
                  <div key={idx} className="p-3.5 rounded-md bg-sage-50 border-2 border-sage-200 flex flex-col sm:flex-row sm:items-center gap-2 justify-between">
                    <div className="flex items-start gap-2">
                      <span className="text-sage-500 mt-0.5">•</span>
                      <div>
                        <span className="text-xs font-bold text-chocolate-800 capitalize">{c.targetProperty}:</span>{" "}
                        <span className="text-xs text-chocolate-600">{c.action}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <ConfidenceBadge level={c.confidence} />
                      {c.source === "deterministic" && <span className="provenance-tag bg-cream-100 text-chocolate-500 border-cream-300">rule</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Risks */}
          {Array.isArray(result.risks) && result.risks.length > 0 && (
            <div className="card-warm p-6">
              <div className="flex items-center gap-2 mb-4">
                <h3 className="font-display text-lg font-bold text-chocolate-900">Risks</h3>
                <ProvenanceTag>AI-Estimated</ProvenanceTag>
              </div>
              <div className="space-y-3">
                {result.risks.map((risk, idx) => (
                  <div key={idx} className="p-4 rounded-md bg-dustyrose-50 border-2 border-dustyrose-200">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm font-semibold text-chocolate-800">{risk.risk}</p>
                      <ConfidenceBadge level={risk.confidence} />
                    </div>
                    {Array.isArray(risk.mitigations) && risk.mitigations.length > 0 && (
                      <ul className="mt-2 space-y-1">
                        {risk.mitigations.map((m, mi) => (
                          <li key={mi} className="text-xs text-chocolate-500 flex items-start gap-2">
                            <span className="text-sage-500 mt-0.5">→</span>
                            <span>{m}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Deterministic layer + conflicts */}
          {result.modification && (
            <div className="card-warm p-6">
              <div className="flex items-center gap-2 mb-4">
                <h3 className="font-display text-lg font-bold text-chocolate-900">What the rules see</h3>
                <span className="provenance-tag bg-sage-100 text-sage-700 border-sage-300">Deterministic</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-chocolate-400 block mb-2">Grounded observations</span>
                  <ul className="space-y-1.5">
                    {Array.isArray(result.modification.deterministicNotes) && result.modification.deterministicNotes.map((n, idx) => (
                      <li key={idx} className="text-xs text-chocolate-600 flex items-start gap-2">
                        <span className="text-sage-400 mt-0.5">•</span>
                        <span>{n}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-chocolate-400 block mb-2">Detected conflicts</span>
                  {Array.isArray(result.modification.conflicts) && result.modification.conflicts.length > 0 ? (
                    <ul className="space-y-1.5">
                      {result.modification.conflicts.map((c, idx) => (
                        <li key={idx} className="text-xs text-chocolate-600 flex items-start gap-2">
                          <SeverityBadge level={c.severity} />
                          <span className="pt-0.5">{c.message}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-chocolate-400 italic">No conflicts triggered by the rule layer.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Trade-offs */}
          {Array.isArray(result.tradeoffs) && result.tradeoffs.length > 0 && (
            <div className="card-warm p-6">
              <div className="flex items-center gap-2 mb-4">
                <h3 className="font-display text-lg font-bold text-chocolate-900">Culinary Trade-Offs</h3>
                <ProvenanceTag>AI-Estimated</ProvenanceTag>
              </div>
              <ul className="space-y-2">
                {result.tradeoffs.map((t, idx) => (
                  <li key={idx} className="text-sm text-chocolate-600 flex items-start gap-2">
                    <SeverityBadge level={t.severity} />
                    <span className="pt-0.5">{t.tradeoff}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Assumptions & limitations */}
          {((Array.isArray(result.assumptions) && result.assumptions.length > 0) || (Array.isArray(result.limitations) && result.limitations.length > 0)) && (
            <div className="card-warm p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] font-mono uppercase text-chocolate-400 block mb-2">Assumptions</span>
                  <ul className="space-y-1.5">
                    {result.assumptions.map((a, idx) => (
                      <li key={idx} className="text-xs text-chocolate-500 flex items-start gap-2">
                        <span className="text-caramel-400 mt-0.5">•</span>
                        <span>{a}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase text-chocolate-400 block mb-2">Limitations</span>
                  <ul className="space-y-1.5">
                    {result.limitations.map((a, idx) => (
                      <li key={idx} className="text-xs text-chocolate-500 flex items-start gap-2">
                        <span className="text-dustyrose-400 mt-0.5">•</span>
                        <span>{a}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          <p className="text-[10px] text-chocolate-400 italic font-mono">
            Experiment predictions are AI-estimated culinary inferences grounded by deterministic ingredient-role rules —
            not laboratory measurements. Test in practice before serving.
          </p>
        </div>
      )}
    </div>
  )
}