import { useState } from "react"
import { collection, addDoc, serverTimestamp } from "firebase/firestore"
import { db } from "../firebase"
import { useAuth } from "../context/AuthContext"

const API = "https://flavormind-api.onrender.com"

export default function FlavorLab(){

  const [ingredient1,setIngredient1] = useState("")
  const [ingredient2,setIngredient2] = useState("")
  const [result,setResult] = useState(null)
  const [loading,setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const { user } = useAuth()

  async function analyze(){

    if(!ingredient1.trim() || !ingredient2.trim()){
      alert("Please enter two ingredients.")
      return
    }

    setLoading(true)
    setResult(null)

    try {
      const res = await fetch(`${API}/analyze-flavor`,{
        method:"POST",
        headers:{ "Content-Type":"application/json"},
        body: JSON.stringify({
          ingredient1,
          ingredient2
        })
      })

      const data = await res.json()
      setResult(data)

      // Save to user's personal library
      if (user && data && data.flavorAnalysis) {
        try {
          console.log("Saving flavor analysis to Firestore...")
          await addDoc(collection(db, "library"), {
            uid: user.uid,
            type: "flavor",
            ingredient1,
            ingredient2,
            flavorAnalysis: data.flavorAnalysis,
            createdAt: serverTimestamp(),
          })
          console.log("Successfully saved!")
          setSaved(true)
          setTimeout(() => setSaved(false), 3000)
        } catch (e) {
          console.error("Library save failed (catch):", e)
        }
      }
    } catch(err) {
      console.error(err)
      alert("Failed to analyze.")
    }

    setLoading(false)
  }

  return(
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-6 relative overflow-hidden">
      
      {/* Background decorations */}
      <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl -z-10 mix-blend-screen"></div>
      <div className="absolute bottom-1/3 right-1/4 w-[28rem] h-[28rem] bg-indigo-600/20 rounded-full blur-3xl -z-10 mix-blend-screen"></div>

      <div className="w-full max-w-2xl bg-slate-900/60 backdrop-blur-xl p-8 sm:p-12 rounded-3xl border border-white/10 shadow-2xl shadow-purple-900/20">
        
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-purple-500/10 text-purple-400 mb-6 drop-shadow-lg group-hover:scale-110 transition-transform text-3xl">
            🧪
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400 mb-4">
            Flavor Compatibility Lab
          </h1>
          <p className="text-slate-400">
            Discover how well two ingredients harmonize using AI food science analysis.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-8 relative">
          
          <div className="flex-1 relative group">
            <input
              className="w-full bg-slate-800/50 border border-slate-700 text-white placeholder-slate-500 px-5 py-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all group-hover:bg-slate-800/80"
              placeholder="e.g. Dark Chocolate"
              value={ingredient1}
              onChange={(e)=>setIngredient1(e.target.value)}
            />
          </div>

          <div className="hidden sm:flex items-center justify-center text-slate-500 font-bold">
            +
          </div>

          <div className="flex-1 relative group">
            <input
              className="w-full bg-slate-800/50 border border-slate-700 text-white placeholder-slate-500 px-5 py-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all group-hover:bg-slate-800/80"
              placeholder="e.g. Sea Salt"
              value={ingredient2}
              onChange={(e)=>setIngredient2(e.target.value)}
            />
          </div>

        </div>

        <button
          onClick={analyze}
          disabled={loading}
          className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-lg hover:shadow-lg hover:shadow-purple-500/25 transition-all focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
             <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
             </svg>
          ) : "Analyze Flavor Synergy"}
        </button>

        {result && (
          <div className="mt-10 animate-fade-in-up">
            <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-2xl">
              <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                <span className="text-purple-400">✧</span> Analysis Result
              </h3>
              <p className="text-slate-300 leading-relaxed text-sm sm:text-base">
                {result.flavorAnalysis}
              </p>
            </div>
          </div>
        )}

      </div>

    </div>
  )
}