import { Link, useLocation, useNavigate } from "react-router-dom"
import { useState } from "react"
import { useAuth } from "../context/AuthContext"

const NAV_LINKS = [
  { to: "/evaluator", label: "Evaluator" },
  { to: "/flavorlab", label: "Flavor Lab" },
  { to: "/reformulate", label: "Reformulate" },
  { to: "/compare", label: "Compare" },
  { to: "/generator", label: "Generator" },
  { to: "/library", label: "Library" },
  { to: "/about", label: "About" },
]

export default function Navbar() {
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const isActive = (path) => location.pathname === path

  async function handleLogout() {
    await logout()
    navigate("/")
    setMenuOpen(false)
  }

  return (
    <nav className="sticky top-0 z-50 w-full bg-cream-50 border-b-[3px] border-chocolate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">

          {/* Logo + Brand */}
          <Link to="/" className="flex items-center gap-2.5 group shrink-0">
            <span className="w-9 h-9 checker rounded-sm border-2 border-chocolate-900 grid place-items-center font-display font-extrabold text-chocolate-900 text-base leading-none group-hover:rotate-3 transition-transform duration-150">
              S
            </span>
            <span className="flex flex-col leading-none">
              <span className="font-display text-xl font-extrabold tracking-tight text-chocolate-900">
                SavorSense
              </span>
              <span className="text-[9px] text-chocolate-400 font-mono font-medium uppercase tracking-[0.2em] hidden lg:block">
                MUMENT 2026
              </span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-0">
            {NAV_LINKS.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                aria-current={isActive(to) ? "page" : undefined}
                className={`px-1.5 lg:px-3 py-1.5 text-[11px] lg:text-xs font-bold uppercase tracking-wider transition-all duration-100 border-2 ${
                  isActive(to)
                    ? "bg-chocolate-900 text-cream-100 border-chocolate-900 shadow-warm"
                    : "bg-transparent text-chocolate-500 border-transparent hover:text-chocolate-900 hover:bg-saffron-100 hover:border-chocolate-900"
                }`}
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Auth */}
          <div className="flex items-center gap-2 shrink-0">
            {user ? (
              <div className="hidden md:flex items-center gap-2 pl-2 border-l-2 border-chocolate-200">
                <div className="w-8 h-8 rounded-sm bg-chocolate-900 flex items-center justify-center text-cream-100 text-[11px] font-bold shrink-0">
                  {(user.displayName || user.email || "U")[0].toUpperCase()}
                </div>
                <button
                  onClick={handleLogout}
                  className="text-[11px] px-2.5 py-1.5 rounded-md bg-transparent hover:bg-cream-200 border-2 border-chocolate-300 text-chocolate-600 hover:text-chocolate-900 transition-all"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <Link
                to="/auth"
                className="hidden md:block px-4 py-2 rounded-md bg-saffron-400 hover:bg-saffron-300 border-2 border-chocolate-900 text-chocolate-900 text-xs font-bold shadow-warm transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
              >
                Sign In
              </Link>
            )}

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle navigation menu"
              aria-expanded={menuOpen}
              className="md:hidden w-10 h-10 flex items-center justify-center rounded-sm bg-cream-100 border-2 border-chocolate-900 text-chocolate-800 text-lg shadow-warm"
            >
              {menuOpen ? "✕" : "≡"}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden border-t-[3px] border-chocolate-900 bg-cream-50 animate-slide-down">
          <div className="max-w-7xl mx-auto px-4 py-3 grid grid-cols-1 gap-2">
            {NAV_LINKS.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setMenuOpen(false)}
                className={`px-3 py-2.5 rounded-md text-xs font-bold uppercase tracking-wider transition-all border-2 ${
                  isActive(to)
                    ? "bg-chocolate-900 text-cream-100 border-chocolate-900"
                    : "bg-white text-chocolate-600 border-cream-300 hover:border-chocolate-900"
                }`}
              >
                {label}
              </Link>
            ))}
          </div>

          <div className="px-4 pb-3 pt-2 border-t-2 border-cream-200 flex items-center justify-between gap-3">
            {user ? (
              <button
                onClick={handleLogout}
                className="text-xs px-3 py-1.5 rounded-md bg-cream-200 border-2 border-chocolate-300 text-chocolate-600"
              >
                Sign out
              </button>
            ) : (
              <Link
                to="/auth"
                onClick={() => setMenuOpen(false)}
                className="text-xs px-3 py-1.5 rounded-md bg-saffron-400 border-2 border-chocolate-900 text-chocolate-900 font-bold"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}