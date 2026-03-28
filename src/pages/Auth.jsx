import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

export default function Auth() {
  const [mode, setMode] = useState("login") // "login" | "signup"
  const [displayName, setDisplayName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const { signup, login } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      if (mode === "signup") {
        if (!displayName.trim()) {
          setError("Please enter your name.")
          setLoading(false)
          return
        }
        await signup(email, password, displayName)
      } else {
        await login(email, password)
      }
      navigate("/")
    } catch (err) {
      const code = err.code || ""
      if (code === "auth/email-already-in-use") setError("Email already in use.")
      else if (code === "auth/weak-password") setError("Password must be at least 6 characters.")
      else if (code === "auth/user-not-found" || code === "auth/wrong-password" || code === "auth/invalid-credential")
        setError("Invalid email or password.")
      else setError("Something went wrong. Try again.")
    }

    setLoading(false)
  }

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-6 relative overflow-hidden">

      {/* Background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[30rem] h-[30rem] bg-pink-600/15 rounded-full blur-3xl -z-10 mix-blend-screen pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-[25rem] h-[25rem] bg-purple-600/15 rounded-full blur-3xl -z-10 mix-blend-screen pointer-events-none" />

      <div className="w-full max-w-md bg-slate-900/70 backdrop-blur-xl p-8 sm:p-10 rounded-3xl border border-white/10 shadow-2xl shadow-pink-900/20">

        {/* Icon */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-pink-500 to-purple-600 text-white text-2xl mb-4 shadow-lg shadow-pink-500/30">
            🍰
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400 mb-1">
            {mode === "login" ? "Welcome Back" : "Create Account"}
          </h1>
          <p className="text-slate-400 text-sm">
            {mode === "login" ? "Sign in to access your personal recipe library." : "Join to save and explore AI-crafted recipes."}
          </p>
        </div>

        {error && (
          <div className="mb-5 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">

          {mode === "signup" && (
            <div>
              <label className="block text-slate-400 text-xs font-medium mb-1.5 uppercase tracking-wider">Name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your name"
                required
                className="w-full bg-slate-800/60 border border-slate-700 text-white placeholder-slate-500 px-4 py-3.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all"
              />
            </div>
          )}

          <div>
            <label className="block text-slate-400 text-xs font-medium mb-1.5 uppercase tracking-wider">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full bg-slate-800/60 border border-slate-700 text-white placeholder-slate-500 px-4 py-3.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-slate-400 text-xs font-medium mb-1.5 uppercase tracking-wider">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full bg-slate-800/60 border border-slate-700 text-white placeholder-slate-500 px-4 py-3.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 mt-2 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-semibold text-base hover:shadow-lg hover:shadow-pink-500/25 transition-all focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : mode === "login" ? "Sign In" : "Create Account"}
          </button>

        </form>

        <p className="text-center text-slate-500 text-sm mt-6">
          {mode === "login" ? (
            <>Don&apos;t have an account?{" "}
              <button onClick={() => { setMode("signup"); setError("") }} className="text-pink-400 hover:text-pink-300 font-medium transition-colors">
                Sign up
              </button>
            </>
          ) : (
            <>Already have an account?{" "}
              <button onClick={() => { setMode("login"); setError("") }} className="text-pink-400 hover:text-pink-300 font-medium transition-colors">
                Sign in
              </button>
            </>
          )}
        </p>

      </div>
    </div>
  )
}
