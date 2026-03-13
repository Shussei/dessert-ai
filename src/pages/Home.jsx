import { Link } from "react-router-dom"

export default function Home(){

  return(
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center relative overflow-hidden">
      
      {/* Background decorations */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl -z-10 mix-blend-screen"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[28rem] h-[28rem] bg-pink-600/20 rounded-full blur-3xl -z-10 mix-blend-screen"></div>

      <div className="w-full max-w-4xl px-6 py-12 text-center animate-fade-in-up">
        
        <div className="inline-block px-4 py-1.5 rounded-full bg-slate-800/50 border border-slate-700/50 text-pink-400 font-medium text-sm mb-8 backdrop-blur-sm">
          Welcome to the Future of Pastry
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8">
          The <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500">Intelligent</span> Dessert Platform
        </h1>

        <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto mb-12 leading-relaxed">
          An advanced culinary system that analyzes, predicts, and generates dessert recipes using state-of-the-art AI models and food science principles.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto text-left">
          
          <Link to="/evaluator" className="group p-6 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-pink-500/50 hover:bg-slate-800/50 transition-all duration-300 backdrop-blur-sm flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-pink-500/10 flex items-center justify-center text-pink-500 group-hover:scale-110 transition-transform">✓</div>
            <div>
              <h3 className="text-lg font-bold text-white mb-2 group-hover:text-pink-400 transition-colors">Recipe Evaluator</h3>
              <p className="text-sm text-slate-400">Score and analyze dessert recipes for flavor balance and texture.</p>
            </div>
          </Link>

          <Link to="/flavorlab" className="group p-6 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-purple-500/50 hover:bg-slate-800/50 transition-all duration-300 backdrop-blur-sm flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500 group-hover:scale-110 transition-transform">🧪</div>
            <div>
              <h3 className="text-lg font-bold text-white mb-2 group-hover:text-purple-400 transition-colors">Flavor Lab</h3>
              <p className="text-sm text-slate-400">Test compatibility and synergies between ingredient pairs.</p>
            </div>
          </Link>

          <Link to="/generator" className="group p-6 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-800/50 transition-all duration-300 backdrop-blur-sm flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 group-hover:scale-110 transition-transform">✨</div>
            <div>
              <h3 className="text-lg font-bold text-white mb-2 group-hover:text-indigo-400 transition-colors">AI Generator</h3>
              <p className="text-sm text-slate-400">Create completely new, structurally sound dessert recipes from prompts.</p>
            </div>
          </Link>
          
          <Link to="/about" className="group p-6 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-800/50 transition-all duration-300 backdrop-blur-sm flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">ℹ️</div>
            <div>
              <h3 className="text-lg font-bold text-white mb-2 group-hover:text-emerald-400 transition-colors">Intelligence System</h3>
              <p className="text-sm text-slate-400">View how the model categorizes culinary roles and interacts with data.</p>
            </div>
          </Link>

        </div>

      </div>

    </div>
  )
}