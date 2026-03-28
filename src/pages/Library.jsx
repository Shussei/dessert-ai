import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { collection, query, where, orderBy, onSnapshot, deleteDoc, doc } from "firebase/firestore"
import { db } from "../firebase"
import { useAuth } from "../context/AuthContext"

function EmptyState({ message, linkTo, linkLabel, icon }) {
  return (
    <div className="text-center py-16 px-6">
      <div className="text-5xl mb-4">{icon}</div>
      <p className="text-slate-400 mb-6">{message}</p>
      <Link
        to={linkTo}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white text-sm font-semibold transition-all shadow-lg shadow-pink-500/20"
      >
        {linkLabel}
      </Link>
    </div>
  )
}

function RecipeCard({ item, onDelete }) {
  const [expanded, setExpanded] = useState(false)
  const isGenerated = item.type === "generated"
  const isEvaluated = item.type === "evaluated"
  const isFlavor = item.type === "flavor"

  const date = item.createdAt?.toDate ? item.createdAt.toDate().toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric"
  }) : ""

  return (
    <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-all group">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${
              isGenerated ? "bg-indigo-500/15 text-indigo-400 border border-indigo-500/20" :
              isFlavor ? "bg-purple-500/15 text-purple-400 border border-purple-500/20" :
              "bg-pink-500/15 text-pink-400 border border-pink-500/20"
            }`}>
              {isFlavor ? "Flavor Lab" : isGenerated ? "Generated" : "Evaluated"}
            </span>
            {date && <span className="text-[11px] text-slate-500">{date}</span>}
          </div>
          <h3 className="text-white font-semibold text-base leading-snug truncate">
            {item.name || item.theme || (isFlavor ? `${item.ingredient1} + ${item.ingredient2}` : "Untitled")}
          </h3>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {isEvaluated && item.score !== undefined && (
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-pink-500 to-purple-500 flex items-center justify-center font-bold text-sm text-white shadow">
              {item.score}
            </div>
          )}
          <button
            onClick={() => setExpanded(v => !v)}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-all"
            title={expanded ? "Collapse" : "Expand"}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 transition-transform ${expanded ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <button
            onClick={() => onDelete(item.id)}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-red-500/20 flex items-center justify-center text-slate-500 hover:text-red-400 transition-all border border-transparent hover:border-red-500/30"
            title="Delete"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {expanded && (
        <div className="mt-4 space-y-3 border-t border-white/5 pt-4 text-sm animate-fade-in-up">

          {/* Generated recipe details */}
          {isGenerated && item.ingredients && (
            <div>
              <p className="text-indigo-400 font-semibold mb-2 uppercase tracking-wider text-[11px]">Ingredients</p>
              <ul className="space-y-1.5">
                {item.ingredients.map((ing, i) => (
                  <li key={i} className="text-slate-300 flex items-start gap-2">
                    <span className="text-emerald-400">•</span> {ing}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {isGenerated && item.steps && (
            <div>
              <p className="text-emerald-400 font-semibold mb-2 uppercase tracking-wider text-[11px]">Steps</p>
              <ol className="space-y-2">
                {item.steps.map((step, i) => (
                  <li key={i} className="text-slate-300 flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-[11px] font-bold">{i + 1}</span>
                    <span className="pt-0.5">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Evaluated recipe details */}
          {isEvaluated && item.flavorAnalysis && (
            <div>
              <p className="text-pink-400 font-semibold mb-1 uppercase tracking-wider text-[11px]">Flavor Profile</p>
              <p className="text-slate-300 leading-relaxed">{item.flavorAnalysis}</p>
            </div>
          )}
          {isEvaluated && item.textureAnalysis && (
            <div>
              <p className="text-purple-400 font-semibold mb-1 uppercase tracking-wider text-[11px]">Texture Prediction</p>
              <p className="text-slate-300 leading-relaxed">{item.textureAnalysis}</p>
            </div>
          )}
          {isEvaluated && item.creativity && (
            <div>
              <p className="text-indigo-400 font-semibold mb-1 uppercase tracking-wider text-[11px]">Creativity</p>
              <p className="text-slate-300 leading-relaxed">{item.creativity}</p>
            </div>
          )}
          {isEvaluated && item.suggestions && item.suggestions.length > 0 && (
            <div>
              <p className="text-yellow-400 font-semibold mb-1 uppercase tracking-wider text-[11px]">Chef&apos;s Suggestions</p>
              <ul className="space-y-1">
                {item.suggestions.map((s, i) => (
                  <li key={i} className="text-slate-300 flex gap-2"><span className="text-yellow-500/60">•</span> {s}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Flavor Lab details */}
          {isFlavor && item.flavorAnalysis && (
            <div>
              <p className="text-purple-400 font-semibold mb-1 uppercase tracking-wider text-[11px]">Compatibility Analysis</p>
              <p className="text-slate-300 leading-relaxed">{item.flavorAnalysis}</p>
            </div>
          )}

        </div>
      )}
    </div>
  )
}

export default function Library() {
  const { user } = useAuth()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("all") // "all" | "evaluated" | "generated" | "flavor"

  useEffect(() => {
    if (!user) {
      console.log("Diagnostic: No user found in AuthContext")
      setLoading(false)
      return
    }

    // --- Firebase System Check ---
    console.log("--- Firebase System Check ---")
    console.log("Project ID:", db.app.options.projectId)
    console.log("Auth Domain:", db.app.options.authDomain)
    console.log("User UID:", user.uid)
    console.log("API Key (Start):", db.app.options.apiKey?.slice(0, 10))
    console.log("----------------------------")

    const q = query(
      collection(db, "library"),
      where("uid", "==", user.uid)
      // orderBy("createdAt", "desc") // Temporarily disabled to check if indexing is the issue
    )

    console.log("Setting up snapshot for UID:", user.uid)

    const unsub = onSnapshot(q, (snap) => {
      console.log("Snapshot received! Docs:", snap.size)
      setItems(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      setLoading(false)
    }, (err) => {
      console.error("Firestore error in Library:", err)
      setLoading(false)
    })

    return unsub
  }, [user])

  async function handleDelete(id) {
    if (!window.confirm("Remove this recipe from your library?")) return
    await deleteDoc(doc(db, "library", id))
  }

  const filtered = activeTab === "all" ? items : items.filter(i => i.type === activeTab)
  const evaluatedCount = items.filter(i => i.type === "evaluated").length
  const generatedCount = items.filter(i => i.type === "generated").length
  const flavorCount = items.filter(i => i.type === "flavor").length

  if (!user) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[30rem] h-[30rem] bg-indigo-600/20 rounded-full blur-3xl -z-10 mix-blend-screen pointer-events-none" />
        <div className="w-full max-w-md text-center bg-slate-900/60 backdrop-blur-xl p-12 rounded-3xl border border-white/10 shadow-2xl shadow-indigo-900/20">
          <div className="text-5xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-white mb-3">Your Personal Library</h1>
          <p className="text-slate-400 mb-6">Sign in to access your saved recipes and flavor analyses. Your library is private and unique to you.</p>
          <Link
            to="/auth"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-semibold transition-all shadow-lg shadow-pink-500/20"
          >
            Sign in / Sign up
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-64px)] px-4 sm:px-6 py-10 relative overflow-hidden">

      <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl -z-10 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-pink-600/10 rounded-full blur-3xl -z-10 pointer-events-none" />

      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="text-3xl">📚</div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">
              My Library
            </h1>
          </div>
          <p className="text-slate-400">
            Your personal collection of AI-crafted and evaluated recipes.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          <div className="bg-slate-900/50 border border-pink-500/20 rounded-2xl p-4 text-center">
            <p className="text-2xl font-bold text-pink-400">{evaluatedCount}</p>
            <p className="text-slate-500 text-xs uppercase tracking-wider mt-1">Evaluated</p>
          </div>
          <div className="bg-slate-900/50 border border-indigo-500/20 rounded-2xl p-4 text-center">
            <p className="text-2xl font-bold text-indigo-400">{generatedCount}</p>
            <p className="text-slate-500 text-xs uppercase tracking-wider mt-1">Generated</p>
          </div>
          <div className="bg-slate-900/50 border border-purple-500/20 rounded-2xl p-4 text-center">
            <p className="text-2xl font-bold text-purple-400">{flavorCount}</p>
            <p className="text-slate-500 text-xs uppercase tracking-wider mt-1">Flavor Lab</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {[
            { key: "all", label: `All (${items.length})` },
            { key: "evaluated", label: `Evaluated (${evaluatedCount})` },
            { key: "generated", label: `Generated (${generatedCount})` },
            { key: "flavor", label: `Flavor Lab (${flavorCount})` },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.key
                  ? "bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-lg shadow-pink-500/20"
                  : "bg-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-10 h-10 border-2 border-pink-500/30 border-t-pink-500 rounded-full animate-spin mx-auto mb-3" />
            <p className="text-slate-500 text-sm">Loading your library...</p>
          </div>
        ) : filtered.length === 0 ? (
          activeTab === "evaluated" || activeTab === "all" && evaluatedCount === 0 && generatedCount === 0 ? (
            <EmptyState
              icon="🍰"
              message="Your library is empty. Start by evaluating or generating a recipe!"
              linkTo="/evaluator"
              linkLabel="→ Go to Evaluator"
            />
          ) : activeTab === "generated" ? (
            <EmptyState
              icon="✨"
              message="No generated recipes yet. Create one from the Generator!"
              linkTo="/generator"
              linkLabel="→ Go to Generator"
            />
          ) : activeTab === "flavor" ? (
            <EmptyState
              icon="🧪"
              message="No flavor analyses yet. Try the Flavor Lab!"
              linkTo="/flavorlab"
              linkLabel="→ Go to Flavor Lab"
            />
          ) : (
            <EmptyState
              icon="📭"
              message="Nothing here yet. Start exploring the tools above!"
              linkTo="/"
              linkLabel="→ Go Home"
            />
          )
        ) : (
          <div className="space-y-3">
            {filtered.map(item => (
              <RecipeCard key={item.id} item={item} onDelete={handleDelete} />
            ))}
          </div>
        )}

      </div>
    </div>
  )
}