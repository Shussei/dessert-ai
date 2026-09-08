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
    <nav className="sticky top-0 z-50 w-full bg-cream-50/95 backdrop-blur-md border-b border-cream-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">

          {/* Logo + Brand */}
          <Link to="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-chocolate-700 to-chocolate-800 flex items-center justify-center text-cream-100 font-display font-bold text-lg shadow-warm group-hover:opacity-90 transition-opacity">
              S
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-base font-display font-bold text-chocolate-900 tracking-tight">SavorSense</span>
              <span className="text-[9px] text-caramel-600 font-semibold tracking-wider hidden sm:block">
                AI Culinary Intelligence
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                aria-current={isActive(to) ? "page" : undefined}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-150 ${
                  isActive(to)
                    ? "bg-chocolate-800 text-cream-100"
                    : "text-chocolate-500 hover:text-chocolate-900 hover:bg-cream-200/60"
                }`}
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Auth */}
          <div className="flex items-center gap-2 shrink-0">
            {user ? (
              <div className="hidden lg:flex items-center gap-2 pl-2 border-l border-cream-300">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-dustyrose-500 to-chocolate-700 flex items-center justify-center text-cream-50 text-[11px] font-bold shrink-0">
                  {(user.displayName || user.email || "U")[0].toUpperCase()}
                </div>
                <button
                  onClick={handleLogout}
                  className="text-[11px] px-2.5 py-1.5 rounded-lg bg-cream-200 hover:bg-cream-300 border border-cream-300 text-chocolate-600 hover:text-chocolate-900 transition-all"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <Link
                to="/auth"
                className="hidden lg:block px-4 py-2 rounded-lg bg-chocolate-800 hover:bg-chocolate-700 text-cream-100 text-xs font-semibold shadow-warm transition-all"
              >
                Sign In
              </Link>
            )}

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle navigation menu"
              aria-expanded={menuOpen}
              className="lg:hidden w-9 h-9 flex items-center justify-center rounded-lg bg-cream-100 border border-cream-300 text-chocolate-700 text-lg"
            >
              {menuOpen ? "✕" : "☰"}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="lg:hidden border-t border-cream-300 bg-cream-50 animate-slide-down">
          <div className="max-w-7xl mx-auto px-4 py-3 grid grid-cols-2 gap-1">
            {NAV_LINKS.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setMenuOpen(false)}
                className={`px-3 py-2.5 rounded-md text-xs font-semibold transition-all ${
                  isActive(to)
                    ? "bg-chocolate-800 text-cream-100"
                    : "text-chocolate-500 hover:text-chocolate-900 hover:bg-cream-200"
                }`}
              >
                {label}
              </Link>
            ))}
          </div>

          <div className="px-4 pb-3 pt-1 border-t border-cream-300 flex items-center justify-between gap-3">
            {user ? (
              <button
                onClick={handleLogout}
                className="text-xs px-3 py-1.5 rounded-lg bg-cream-200 border border-cream-300 text-chocolate-600"
              >
                Sign out
              </button>
            ) : (
              <Link
                to="/auth"
                onClick={() => setMenuOpen(false)}
                className="text-xs px-3 py-1.5 rounded-lg bg-chocolate-800 text-cream-100"
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
