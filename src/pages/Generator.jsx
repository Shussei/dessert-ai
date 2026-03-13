import { useState } from "react"

export default function Generator(){

  const [theme,setTheme] = useState("")
  const [recipe,setRecipe] = useState(null)
  const [loading,setLoading] = useState(false)

  async function generate(){

    if(!theme.trim()){
      alert("Please enter a dessert theme")
      return
    }

    setLoading(true)
    setRecipe(null)

    try {
      const res = await fetch("http://localhost:3000/generate",{
        method:"POST",
        headers:{ "Content-Type":"application/json"},
        body:JSON.stringify({theme})
      })

      const data = await res.json()
      setRecipe(data)

    } catch(err) {
      console.error(err)
      alert("Failed to generate recipe")
    }

    setLoading(false)
  }

  return(
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-6 relative overflow-hidden">
      
      {/* Background decorations */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl -z-10 mix-blend-screen pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[28rem] h-[28rem] bg-emerald-600/20 rounded-full blur-3xl -z-10 mix-blend-screen pointer-events-none"></div>

      <div className="w-full max-w-3xl bg-slate-900/60 backdrop-blur-xl p-8 sm:p-12 rounded-3xl border border-white/10 shadow-2xl shadow-indigo-900/20">
        
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-500/10 text-indigo-400 mb-6 drop-shadow-lg group-hover:scale-110 transition-transform text-3xl">
            ✨
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-emerald-400 mb-4">
            AI Recipe Generator
          </h1>
          <p className="text-slate-400">
            Describe a concept, and let the AI architect a structurally sound dessert.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          
          <div className="flex-1 relative group">
            <input
              className="w-full bg-slate-800/50 border border-slate-700 text-white placeholder-slate-500 px-6 py-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all group-hover:bg-slate-800/80 text-lg"
              placeholder="e.g. matcha white chocolate cloud"
              value={theme}
              onChange={(e)=>setTheme(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && generate()}
            />
          </div>

          <button
            onClick={generate}
            disabled={loading}
            className="sm:w-32 py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-emerald-600 hover:from-indigo-500 hover:to-emerald-500 text-white font-semibold text-lg hover:shadow-lg hover:shadow-indigo-500/25 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? (
               <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
               </svg>
            ) : "Create"}
          </button>
        </div>

        {loading && (
          <div className="py-12 text-center animate-pulse">
            <div className="w-16 h-16 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-indigo-400 font-medium tracking-widest uppercase text-sm">Synthesizing Recipe Architecture...</p>
          </div>
        )}

        {recipe && !loading && (
          <div className="mt-8 animate-fade-in-up">
            <div className="bg-slate-800/40 border border-indigo-500/30 p-6 sm:p-8 rounded-2xl relative overflow-hidden">
              
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl"></div>

              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-8 border-b border-white/10 pb-4 relative z-10">
                {recipe.name}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                
                <div>
                  <h3 className="text-indigo-400 font-bold mb-4 flex items-center gap-2 uppercase tracking-wider text-sm">
                     Ingredients
                  </h3>
                  <ul className="space-y-3">
                    {recipe.ingredients.map((ing,i)=>(
                      <li key={i} className="text-slate-200 flex items-start gap-3 bg-slate-800/50 p-3 rounded-lg border border-white/5">
                        <span className="text-emerald-400 font-bold">•</span>
                        <span>{ing}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-emerald-400 font-bold mb-4 flex items-center gap-2 uppercase tracking-wider text-sm">
                     Preparation Steps
                  </h3>
                  <ol className="space-y-4">
                    {recipe.steps.map((step,i)=>(
                      <li key={i} className="text-slate-200 flex items-start gap-4 group">
                        <span className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-sm group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                          {i+1}
                        </span>
                        <span className="pt-1.5 text-sm leading-relaxed">{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>

              </div>

            </div>
          </div>
        )}

      </div>

    </div>
  )
}