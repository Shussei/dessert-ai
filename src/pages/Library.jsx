export default function Library(){

  return(
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-6 relative overflow-hidden">
      
      {/* Background decorations */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[30rem] h-[30rem] bg-indigo-600/20 rounded-full blur-3xl -z-10 mix-blend-screen pointer-events-none"></div>

      <div className="w-full max-w-2xl text-center bg-slate-900/60 backdrop-blur-xl p-12 rounded-3xl border border-white/10 shadow-2xl shadow-indigo-900/20 animate-fade-in-up">
        
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-slate-800/80 text-slate-400 mb-6 drop-shadow-lg shadow-inner">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
        
        <h1 className="text-3xl font-bold text-white mb-4">
          Recipe Library
        </h1>
        
        <p className="text-slate-400 text-lg max-w-md mx-auto">
          Your saved dessert recipes will appear here. Begin by generating or evaluating a recipe.
        </p>

      </div>

    </div>
  )
}