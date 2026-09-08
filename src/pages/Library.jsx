import { useState, useEffect } from "react"
import { collection, query, where, getDocs, deleteDoc, doc } from "firebase/firestore"
import { db } from "../firebase"
import { useAuth } from "../context/AuthContext"
import CulinaryReportModal from "../components/CulinaryReportModal"
import { Link } from "react-router-dom"

export default function Library() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedReport, setSelectedReport] = useState(null)
  const { user } = useAuth()

  useEffect(() => {
    async function fetchLibrary() {
      if (!user) {
        setItems([])
        setLoading(false)
        return
      }

      try {
        const q = query(collection(db, "library"), where("uid", "==", user.uid))
        const snap = await getDocs(q)
        const fetched = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        fetched.sort((a, b) => {
          const ta = a.createdAt?.seconds || 0
          const tb = b.createdAt?.seconds || 0
          return tb - ta
        })
        setItems(fetched)
      } catch (err) {
        console.error("Library fetch error:", err)
      }
      setLoading(false)
    }
    fetchLibrary()
  }, [user])

  async function handleDelete(item) {
    if (!user || !item?.id) return
    if (!window.confirm("Delete this item from your library?")) return
    try {
      await deleteDoc(doc(db, "library", item.id))
      setItems(prev => prev.filter(i => i.id !== item.id))
    } catch (err) {
      console.error("Delete failed:", err)
    }
  }

  function itemTypeLabel(type) {
    return {
      evaluated: "Analysis",
      generated: "Generated Recipe",
      reformulated: "Reformulation",
      compared: "Comparison",
    }[type] || type || "Saved Item"
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <svg className="animate-spin h-8 w-8 text-caramel-500 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-sm text-chocolate-400">Loading library...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">

      {/* Header */}
      <div className="border-b border-cream-300 pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="badge-warm">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              Saved Work
            </span>
          </div>
          <h1 className="section-heading">Culinary Research Library</h1>
          <p className="section-subheading">
            Your personal notebook of analyses, recipes, and experiments
          </p>
        </div>
        <Link to="/evaluator" className="btn-primary shrink-0 text-center">
          + New Evaluation
        </Link>
      </div>

      {/* Not signed in */}
      {!user && (
        <div className="p-12 text-center rounded-2xl bg-white border border-cream-300 shadow-warm">
          <div className="w-12 h-12 rounded-xl bg-cream-200 border border-cream-300 flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-chocolate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
            </svg>
          </div>
          <h2 className="font-display text-xl font-bold text-chocolate-900 mb-2">Your library is private</h2>
          <p className="text-sm text-chocolate-400 max-w-md mx-auto mb-6">
            Sign in to save and revisit your analyses. Library records are only visible to you.
          </p>
          <Link to="/auth" className="btn-primary inline-flex">
            Sign In
          </Link>
        </div>
      )}

      {/* Signed in but empty */}
      {user && items.length === 0 && (
        <div className="p-12 text-center rounded-2xl bg-white border border-cream-300 shadow-warm">
          <div className="w-12 h-12 rounded-xl bg-cream-200 border border-cream-300 flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-chocolate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h2 className="font-display text-xl font-bold text-chocolate-900 mb-2">No saved items yet</h2>
          <p className="text-sm text-chocolate-400 max-w-md mx-auto mb-6">
            Evaluate or generate a recipe to save it to your library.
          </p>
          <Link to="/evaluator" className="btn-primary inline-flex">
            Launch Evaluator
          </Link>
        </div>
      )}

      {/* Items list */}
      {user && items.length > 0 && (
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="p-5 rounded-2xl bg-white border border-cream-300 hover:border-caramel-300 shadow-warm transition-all flex flex-col gap-3"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <span className="text-[10px] text-caramel-600 font-mono uppercase tracking-wider block">
                    {itemTypeLabel(item.type)}
                  </span>
                  <h3 className="text-base font-bold text-chocolate-900 mt-0.5 break-words">
                    {item.name || "Untitled"}
                  </h3>
                  {item.recipeText && (
                    <p className="text-xs text-chocolate-400 mt-1 truncate max-w-xl">{item.recipeText}</p>
                  )}
                  {item.dietaryTarget && (
                    <span className="badge-warm mt-2">{item.dietaryTarget}</span>
                  )}
                </div>
                {item.createdAt?.seconds && (
                  <span className="text-[10px] text-chocolate-300 font-mono shrink-0">
                    {new Date(item.createdAt.seconds * 1000).toLocaleDateString()}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap gap-2 pt-2 border-t border-cream-200">
                <button
                  onClick={() => setSelectedReport(item)}
                  className="btn-secondary text-xs"
                >
                  View
                </button>
                <button
                  onClick={() => handleDelete(item)}
                  className="px-3 py-2 rounded-xl bg-dustyrose-50 hover:bg-dustyrose-100 border border-dustyrose-200 text-dustyrose-600 font-semibold text-xs transition-all"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedReport && (
        <CulinaryReportModal
          isOpen={!!selectedReport}
          onClose={() => setSelectedReport(null)}
          reportData={selectedReport}
          recipeName={selectedReport.name || "Saved Item"}
        />
      )}
    </div>
  )
}
