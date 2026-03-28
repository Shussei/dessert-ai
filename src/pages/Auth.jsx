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

  const { signup, login, loginWithGoogle } = useAuth()
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

  async function handleGoogleSignIn() {
    setError("")
    setLoading(true)
    try {
      await loginWithGoogle()
      navigate("/")
    } catch (err) {
      console.error(err)
      setError("Failed to sign in with Google.")
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

        <div className="relative my-8 text-center uppercase">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-slate-700/50"></div>
          </div>
          <span className="relative z-10 bg-slate-900 px-3 text-xs font-semibold tracking-widest text-slate-500 rounded-full">
            OR
          </span>
        </div>

        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full py-4 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium text-sm transition-all focus:outline-none focus:ring-2 focus:ring-white/20 flex items-center justify-center gap-3 border border-white/5 disabled:opacity-50"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" alt="Google icon">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Continue with Google
        </button>

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
