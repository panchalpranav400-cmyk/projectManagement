import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { Sparkles, ArrowRight, CheckCircle2, ShieldCheck, Zap } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const { signIn, continueAsGuest } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { error } = await signIn(email, password)
    setLoading(false)
    if (error) {
      setError(error)
      return
    }
    navigate('/')
  }

  function handleGuest() {
    continueAsGuest()
    navigate('/')
  }

  return (
    <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 sm:px-6">
      {/* Brand header */}
      <Link
        to="/"
        className="absolute left-6 top-6 flex items-center gap-2 text-sm font-bold tracking-tight text-white/90 hover:text-white transition-colors"
      >
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-tr from-brand to-brand-2 text-black shadow-[0_0_12px_var(--color-brand-glow)]">
          <Sparkles className="h-4 w-4" />
        </div>
        <span>Flowboard</span>
      </Link>

      {/* Floating decorative cards behind */}
      <div className="pointer-events-none absolute -top-12 left-1/4 hidden lg:block opacity-40 animate-float">
        <div className="liquid-glass rounded-2xl p-4 border border-white/10 shadow-xl w-48 rotate-[-6deg]">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-300">
            <CheckCircle2 className="h-3.5 w-3.5" /> All tasks completed
          </div>
          <p className="mt-1 text-[11px] text-white/40">Ship interactive release</p>
        </div>
      </div>

      <div
        className="pointer-events-none absolute bottom-16 right-1/4 hidden lg:block opacity-40 animate-float"
        style={{ animationDelay: '2s' }}
      >
        <div className="liquid-glass rounded-2xl p-4 border border-white/10 shadow-xl w-52 rotate-[4deg]">
          <div className="flex items-center gap-2 text-xs font-semibold text-brand-2">
            <Zap className="h-3.5 w-3.5" /> High priority task
          </div>
          <p className="mt-1 text-[11px] text-white/40">Spring animations enabled</p>
        </div>
      </div>

      {/* Main card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-brand to-brand-2 text-black shadow-[0_0_24px_var(--color-brand-glow)]">
            <Sparkles className="h-6 w-6" />
          </div>
          <h1 className="shiny-text text-3xl font-extrabold tracking-tight">Welcome back</h1>
          <p className="mt-2 text-xs sm:text-sm text-white/50">
            Sign in to access your projects, tasks, and shared workspaces.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="liquid-glass relative rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl space-y-4"
        >
          <div className="card-glare" />

          <div>
            <label className="mb-1.5 block text-xs font-medium text-white/60">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder-white/30 outline-none focus:border-brand-2 focus:ring-1 focus:ring-brand-2 transition-all"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-white/60">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder-white/30 outline-none focus:border-brand-2 focus:ring-1 focus:ring-brand-2 transition-all"
            />
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-lg bg-red-500/10 border border-red-500/20 p-2.5 text-xs text-red-300"
            >
              {error}
            </motion.p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-brand to-brand-2 py-2.5 text-sm font-semibold text-black shadow-[0_0_20px_var(--color-brand-glow)] transition-all active:scale-[0.98] disabled:opacity-50 hover:opacity-95"
          >
            <span>{loading ? 'Signing in…' : 'Sign in to workspace'}</span>
            {!loading && <ArrowRight className="h-4 w-4" />}
          </button>

          <p className="text-center text-xs text-white/40 pt-1">
            Don't have an account?{' '}
            <Link to="/signup" className="font-medium text-white hover:underline underline-offset-2">
              Sign up
            </Link>
          </p>

          <div className="flex items-center gap-3 py-1 text-[11px] uppercase tracking-wider text-white/30">
            <span className="h-px flex-1 bg-white/10" />
            <span>or explore instantly</span>
            <span className="h-px flex-1 bg-white/10" />
          </div>

          <button
            type="button"
            onClick={handleGuest}
            className="w-full flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/[0.03] py-2.5 text-xs sm:text-sm font-medium text-white/80 transition-all hover:bg-white/10 hover:border-white/30 hover:text-white active:scale-[0.98]"
          >
            <ShieldCheck className="h-4 w-4 text-brand-2" />
            <span>Continue without an account (Guest Mode)</span>
          </button>
        </form>
      </motion.div>
    </div>
  )
}
