export default function About(){

  return(
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-6 lg:p-12 relative overflow-hidden">
      
      {/* Background decorations */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl -z-10 mix-blend-screen pointer-events-none"></div>
      <div className="absolute bottom-1/4 left-1/4 w-[28rem] h-[28rem] bg-indigo-600/20 rounded-full blur-3xl -z-10 mix-blend-screen pointer-events-none"></div>

      <div className="w-full max-w-4xl bg-slate-900/60 backdrop-blur-xl p-8 sm:p-12 rounded-3xl border border-white/10 shadow-2xl shadow-purple-900/20">
        
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-500/10 text-indigo-400 mb-6 drop-shadow-lg group-hover:scale-110 transition-transform text-3xl">
            ℹ️
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 mb-6">
            About The Lab
          </h1>
          <p className="text-slate-300 text-lg leading-relaxed max-w-2xl mx-auto">
            This platform demonstrates how artificial intelligence can assist in culinary creativity and recipe analysis. The system evaluates dessert recipes using both AI reasoning and food science principles.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          
          <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 hover:border-indigo-500/30 transition-colors">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <span className="text-indigo-400">✨</span> Key Features
            </h2>
            <ul className="space-y-3 text-slate-300">
              <li className="flex items-start gap-2"><span className="text-indigo-500 mt-1">•</span> AI-powered dessert recipe evaluation</li>
              <li className="flex items-start gap-2"><span className="text-indigo-500 mt-1">•</span> Flavor compatibility analysis</li>
              <li className="flex items-start gap-2"><span className="text-indigo-500 mt-1">•</span> Ingredient intelligence classification</li>
              <li className="flex items-start gap-2"><span className="text-indigo-500 mt-1">•</span> Self-learning ingredient knowledge base</li>
              <li className="flex items-start gap-2"><span className="text-indigo-500 mt-1">•</span> Visual flavor balance charts</li>
            </ul>
          </div>

          <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 hover:border-purple-500/30 transition-colors">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <span className="text-purple-400">🧠</span> How the AI Works
            </h2>
            <p className="text-slate-300 mb-4 leading-relaxed text-sm">
              The system analyzes a recipe by examining ingredient combinations, quantities, and preparation methods. An AI model trained on culinary knowledge evaluates flavor balance, texture, and creativity.
            </p>
            <p className="text-slate-300 leading-relaxed text-sm">
              Additionally, the platform classifies ingredients into culinary roles such as sweetener, fat, acid, or flavor component. This allows the system to analyze structural balance and predict how ingredients will interact in a dessert.
            </p>
          </div>

        </div>

        <div className="space-y-8">
          
          <div className="pt-8 border-t border-white/10">
            <h2 className="text-2xl font-bold text-white mb-4">Ingredient Intelligence Engine</h2>
            <p className="text-slate-300 leading-relaxed">
              The platform contains a dynamic ingredient knowledge base. When a new ingredient is encountered, the AI determines its culinary role and stores it for future analysis. Over time, this database grows and improves the accuracy of recipe evaluations.
            </p>
          </div>

          <div className="pt-8 border-t border-white/10">
            <h2 className="text-2xl font-bold text-white mb-4">System Architecture</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800">
                <span className="block text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Frontend</span>
                <span className="text-slate-200">React web interface</span>
              </div>
              <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800">
                <span className="block text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Backend</span>
                <span className="text-slate-200">Node.js + Express API</span>
              </div>
              <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800">
                <span className="block text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">AI Engine</span>
                <span className="text-slate-200">LLM via Groq</span>
              </div>
              <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800">
                <span className="block text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Data Layer</span>
                <span className="text-slate-200">Self-learning database</span>
              </div>
              <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800">
                <span className="block text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Visualization</span>
                <span className="text-slate-200">Chart.js flavor graphs</span>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-white/10 text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Applications</h2>
            <p className="text-slate-300 leading-relaxed max-w-3xl mx-auto mb-6">
              AI-assisted culinary tools can help chefs experiment with new combinations, assist recipe developers, and support food innovation by predicting how ingredients interact before cooking.
            </p>
            <div className="inline-block px-4 py-2 rounded-full bg-slate-800 text-slate-400 text-sm italic">
              Demonstrating the intersection of artificial intelligence and culinary science.
            </div>
          </div>

        </div>

      </div>

    </div>
  )
}