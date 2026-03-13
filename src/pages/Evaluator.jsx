import { useState } from "react"
import FlavorGraph from "../components/FlavorGraph"

export default function Evaluator() {

  const [recipeText, setRecipeText] = useState("")

  const [result, resResult] = useState(null)
  const [loading, setLoading] = useState(false)

  async function evaluate() {

    if (recipeText.trim() === "") {
      alert("Please provide the dessert recipe or ingredients first.")
      return
    }

    setLoading(true)
    resResult(null)

    try {
      const res = await fetch("https://flavormind-api.onrender.com/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipeText: recipeText })
      })

      const data = await res.json()

      if (data.error) {
        alert("Error analyzing recipe: " + data.error)
        setLoading(false)
        return
      }

      resResult(data)
    } catch (err) {
      console.error(err)
      alert("Failed to evaluate. Ensure server is running.")
    }

    setLoading(false)
  }

  function reset() {
    setRecipeText("")
    resResult(null)
  }

  function loadExample() {
    setRecipeText(`Classic Chocolate Mousse

200 ml whole milk, gently heated in a pan
100 ml heavy cream, whipped to soft peaks
40 g white granulated sugar, dissolved into the milk
25 g high quality cocoa powder, mixed enthusiastically
5 g instant coffee, brewed with a splash of hot water

Fold all components together and chill for 4 hours until firm.`)
    resResult(null)
  }

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-start justify-center p-6 lg:p-10 relative overflow-hidden">

      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-pink-600/10 rounded-full blur-3xl -z-10 mix-blend-screen pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[30rem] h-[30rem] bg-purple-600/10 rounded-full blur-3xl -z-10 mix-blend-screen pointer-events-none"></div>

      <div className="w-full max-w-5xl">

        <div className="text-center mb-10">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400 mb-4 inline-block">
            AI Dessert Evaluator
          </h1>
          <p className="text-slate-400 text-lg">
            Paste your dessert recipe below for AI structural analysis and flavor prediction
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          <div className={`${result ? "lg:col-span-7" : "lg:col-span-12"} col-span-12 transition-all duration-500`}>
            <div className="bg-slate-900/60 backdrop-blur-xl p-6 sm:p-8 rounded-3xl border border-white/10 shadow-2xl shadow-pink-900/10">

              <div className="mb-6 relative w-full">
                <div className="absolute -inset-1 blur-md bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-2xl pointer-events-none"></div>
                <textarea
                  value={recipeText}
                  onChange={(e) => setRecipeText(e.target.value)}
                  placeholder={"Enter your recipe ingredients, quantities, methods, and steps here...\n\ne.g.\n2 cups of flour\n1/2 cup sugar\nMix and bake at 350F for 30 minutes."}
                  className="w-full h-80 bg-slate-800/80 backdrop-blur-md border border-slate-700/80 rounded-2xl p-6 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-pink-500/50 resize-y relative z-10 transition-shadow shadow-inner shadow-black/50"
                />
              </div>

              <div className="flex items-center gap-4 mt-8 flex-nowrap">
                <button
                  onClick={evaluate}
                  disabled={loading}
                  className="flex-1 min-w-[180px] bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white px-6 py-3.5 rounded-xl font-semibold shadow-lg shadow-pink-500/20 hover:shadow-pink-500/40 transition-all focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : "✧ Evaluate Dessert ✧"}
                </button>

                <button
                  onClick={loadExample}
                  className="flex-none px-6 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-slate-600 rounded-xl font-medium transition-all"
                >
                  Load Example
                </button>

                <button
                  onClick={reset}
                  className="flex-none w-[52px] h-[52px] flex items-center justify-center bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 border border-slate-700 hover:border-red-500/30 rounded-xl transition-all"
                  title="Reset form"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>

            </div>
          </div>

          {result && (
            <div className="lg:col-span-5 animate-slide-in-right">
              <div className="bg-slate-900/80 backdrop-blur-xl p-6 sm:p-8 rounded-3xl border border-pink-500/30 shadow-2xl shadow-purple-900/30 sticky top-24">

                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">Analysis Results</h2>
                  <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-pink-500 to-purple-500 flex items-center justify-center font-bold text-xl text-white shadow-lg shadow-pink-500/40 border border-white/20">
                    {result.score}
                  </div>
                </div>

                <div className="w-full bg-slate-800 rounded-full h-2.5 mb-8 overflow-hidden flex border border-slate-700/50">
                  <div
                    className="h-2.5 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 transition-all duration-1000 ease-out relative"
                    style={{ width: `${result.score * 10}%` }}
                  >
                    <div className="absolute top-0 right-0 w-4 h-full bg-white/30 rounded-full blur-[2px]"></div>
                  </div>
                </div>

                <div className="space-y-6 max-h-[calc(100vh-300px)] overflow-y-auto pr-2 custom-scrollbar">

                  <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/50">
                    <h3 className="text-pink-400 font-bold mb-2 flex items-center gap-2">
                      Flavor Profile
                    </h3>
                    <p className="text-slate-300 text-sm leading-relaxed">{result.flavorAnalysis}</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/50">
                    <h3 className="text-purple-400 font-bold mb-2 flex items-center gap-2">
                      Texture Prediction
                    </h3>
                    <p className="text-slate-300 text-sm leading-relaxed">{result.textureAnalysis}</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/50">
                    <h3 className="text-indigo-400 font-bold mb-2 flex items-center gap-2">
                      Creativity Assessment
                    </h3>
                    <p className="text-slate-300 text-sm leading-relaxed">{result.creativity}</p>
                  </div>

                  {result.suggestions && result.suggestions.length > 0 && (
                    <div className="p-4 rounded-2xl bg-yellow-500/10 border border-yellow-500/20">
                      <h3 className="text-yellow-400 font-bold mb-3 flex items-center gap-2">
                        Chef's Suggestions
                      </h3>
                      <ul className="space-y-2">
                        {result.suggestions.map((s, i) => (
                          <li key={i} className="text-slate-300 text-sm flex items-start gap-2">
                            <span className="text-yellow-500/50 mt-0.5">•</span>
                            <span>{s}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="pt-4 border-t border-slate-700/50">
                    <h3 className="text-white font-bold mb-4 text-center">Component Balance</h3>
                    <div className="bg-slate-950/50 p-4 rounded-2xl">
                      <FlavorGraph roles={result.roles} />
                    </div>
                  </div>

                </div>

              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
