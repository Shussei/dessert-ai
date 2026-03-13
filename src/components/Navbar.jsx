import { Link, useLocation } from "react-router-dom"

export default function Navbar(){
  const location = useLocation();

  const getLinkClass = (path) => {
    const isActive = location.pathname === path;
    return `transition-colors duration-200 text-sm font-medium ${
      isActive 
        ? "text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400" 
        : "text-slate-300 hover:text-white"
    }`;
  };

  return(
    <nav className="sticky top-0 z-50 w-full backdrop-blur-md bg-slate-950/80 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-pink-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-pink-500/20">
            D
          </div>
          <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 tracking-tight">AI Dessert Lab</h2>
        </div>

        <div className="flex items-center gap-8">
          <Link className={getLinkClass("/")} to="/">Home</Link>
          <Link className={getLinkClass("/evaluator")} to="/evaluator">Evaluator</Link>
          <Link className={getLinkClass("/flavorlab")} to="/flavorlab">Flavor Lab</Link>
          <Link className={getLinkClass("/generator")} to="/generator">Generator</Link>
          <Link className={getLinkClass("/library")} to="/library">Library</Link>
          <Link className={getLinkClass("/about")} to="/about">About</Link>
        </div>
      </div>
    </nav>
  )
}