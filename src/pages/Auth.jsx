import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

export default function Auth() {
  const [mode, setMode] = useState("login")
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
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white/90 backdrop-blur-sm p-8 sm:p-10 rounded-3xl border border-cream-300 shadow-warm-xl">

        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-xl bg-chocolate-900 flex items-center justify-center text-cream-100 font-display font-semibold text-2xl mb-4 mx-auto">
            S
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-chocolate-900 mb-1">
            {mode === "login" ? "Welcome back" : "Create account"}
          </h1>
          <p className="text-sm text-chocolate-400">
            {mode === "login" ? "Sign in to access your culinary research library." : "Save and manage your culinary analyses."}
          </p>
        </div>

        {error && (
          <div className="mb-5 px-4 py-3 bg-dustyrose-50 border border-dustyrose-200 rounded-xl text-dustyrose-600 text-sm text-center" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">

          {mode === "signup" && (
            <div>
              <label htmlFor="name" className="block text-chocolate-500 text-xs font-medium mb-1.5 uppercase tracking-wider">Name</label>
              <input
                id="name"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your name"
                required
                className="input-warm"
              />
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-chocolate-500 text-xs font-medium mb-1.5 uppercase tracking-wider">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="input-warm"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-chocolate-500 text-xs font-medium mb-1.5 uppercase tracking-wider">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="input-warm"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 mt-2 btn-primary disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Please wait..." : mode === "login" ? "Sign In" : "Create Account"}
          </button>

        </form>

        <div className="relative my-8 text-center">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-cream-300"></div>
          </div>
          <span className="relative z-10 bg-white px-3 text-xs font-semibold tracking-widest text-chocolate-300">
            OR
          </span>
        </div>

        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full py-4 rounded-xl bg-cream-100 hover:bg-cream-200 text-chocolate-800 font-medium text-sm transition-all border border-cream-300 flex items-center justify-center gap-3 disabled:opacity-50"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          Continue with Google
        </button>

        <p className="text-center text-chocolate-400 text-sm mt-6">
          {mode === "login" ? (
            <>Don&apos;t have an account?{" "}
              <button onClick={() => { setMode("signup"); setError("") }} className="text-caramel-600 hover:text-caramel-700 font-medium">
                Sign up
              </button>
            </>
          ) : (
            <>Already have an account?{" "}
              <button onClick={() => { setMode("login"); setError("") }} className="text-caramel-600 hover:text-caramel-700 font-medium">
                Sign in
              </button>
            </>
          )}
        </p>

      </div>
    </div>
  )
}
