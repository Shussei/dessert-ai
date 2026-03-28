import { Link, useLocation, useNavigate } from "react-router-dom"
import { useState } from "react"
import { useAuth } from "../context/AuthContext"

export default function Navbar() {

  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const getLinkClass = (path) => {
    const isActive = location.pathname === path

    return `transition-colors duration-200 text-sm font-medium ${isActive
        ? "text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400"
        : "text-slate-300 hover:text-white"
      }`
  }

  async function handleLogout() {
    await logout()
    navigate("/")
    setMenuOpen(false)
  }

  return (
    <nav className="sticky top-0 z-50 w-full backdrop-blur-md bg-slate-950/80 border-b border-white/10">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">

        {/* Logo */}
        <div className="flex items-center gap-3">

          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-pink-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-pink-500/20">
            F
          </div>

          <h2 className="hidden sm:block text-lg sm:text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 tracking-tight">
            FlavorMind AI
          </h2>

        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-6">

          <Link className={getLinkClass("/")} to="/">Home</Link>
          <Link className={getLinkClass("/evaluator")} to="/evaluator">Evaluator</Link>
          <Link className={getLinkClass("/flavorlab")} to="/flavorlab">Flavor Lab</Link>
          <Link className={getLinkClass("/generator")} to="/generator">Generator</Link>
          <Link className={getLinkClass("/library")} to="/library">Library</Link>
          <Link className={getLinkClass("/about")} to="/about">About</Link>

          {user ? (
            <div className="flex items-center gap-3 ml-2 pl-4 border-l border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-pink-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                  {(user.displayName || user.email || "U")[0].toUpperCase()}
                </div>
                <span className="text-slate-300 text-sm max-w-[100px] truncate">
                  {user.displayName || user.email}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="text-xs px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition-all"
              >
                Sign out
              </button>
            </div>
          ) : (
            <Link
              to="/auth"
              className="ml-2 px-4 py-2 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white text-sm font-semibold shadow-lg shadow-pink-500/20 transition-all"
            >
              Sign in
            </Link>
          )}

        </div>

        {/* Mobile Hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden text-slate-200 text-2xl"
        >
          ☰
        </button>

      </div>

      {/* Mobile Menu */}
      {menuOpen && (

        <div className="md:hidden flex flex-col gap-4 px-6 pb-6 pt-2 bg-slate-950/95 border-t border-white/10">

          <Link onClick={() => setMenuOpen(false)} className={getLinkClass("/")} to="/">Home</Link>
          <Link onClick={() => setMenuOpen(false)} className={getLinkClass("/evaluator")} to="/evaluator">Evaluator</Link>
          <Link onClick={() => setMenuOpen(false)} className={getLinkClass("/flavorlab")} to="/flavorlab">Flavor Lab</Link>
          <Link onClick={() => setMenuOpen(false)} className={getLinkClass("/generator")} to="/generator">Generator</Link>
          <Link onClick={() => setMenuOpen(false)} className={getLinkClass("/library")} to="/library">Library</Link>
          <Link onClick={() => setMenuOpen(false)} className={getLinkClass("/about")} to="/about">About</Link>

          {user ? (
            <div className="pt-3 border-t border-white/10">
              <p className="text-slate-400 text-xs mb-2">Signed in as <span className="text-white">{user.displayName || user.email}</span></p>
              <button
                onClick={handleLogout}
                className="w-full text-sm px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition-all text-left"
              >
                Sign out
              </button>
            </div>
          ) : (
            <Link
              to="/auth"
              onClick={() => setMenuOpen(false)}
              className="mt-2 px-4 py-3 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 text-white text-sm font-semibold text-center"
            >
              Sign in / Sign up
            </Link>
          )}

        </div>

      )}

    </nav>
  )
}