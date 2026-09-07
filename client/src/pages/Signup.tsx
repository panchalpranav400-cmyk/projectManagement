import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export function Signup() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const { signUp } = useAuth()

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { error } = await signUp(email, password, name)
    setLoading(false)
    if (error) {
      setError(error)
      return
    }
    setNotice('Check your email to confirm your account, then sign in.')
  }

  if (notice) {
    return (
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="liquid-glass max-w-sm rounded-3xl p-8 border border-white/10 shadow-2xl"
        >
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-300">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Check your email</h2>
          <p className="text-sm text-white/60 mb-6">{notice}</p>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2 text-xs font-semibold text-black hover:bg-white/90 transition-all"
          >
            Back to sign in
          </Link>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 sm:px-6">
      <Link
        to="/"
        className="absolute left-6 top-6 flex items-center gap-2 text-sm font-bold tracking-tight text-white/90 hover:text-white transition-colors"
      >
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-tr from-brand to-brand-2 text-black shadow-[0_0_12px_var(--color-brand-glow)]">
          <Sparkles className="h-4 w-4" />
        </div>
        <span>Flowboard</span>
      </Link>

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
          <h1 className="shiny-text text-3xl font-extrabold tracking-tight">Create your account</h1>
          <p className="mt-2 text-xs sm:text-sm text-white/50">
            Start organizing projects, collaborating with teams, and shipping faster.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="liquid-glass relative rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl space-y-4"
        >
          <div className="card-glare" />

          <div>
            <label className="mb-1.5 block text-xs font-medium text-white/60">Full Name</label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Alex Morgan"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder-white/30 outline-none focus:border-brand-2 focus:ring-1 focus:ring-brand-2 transition-all"
            />
          </div>

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
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
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
            <span>{loading ? 'Creating account…' : 'Get started now'}</span>
            {!loading && <ArrowRight className="h-4 w-4" />}
          </button>

          <p className="text-center text-xs text-white/40 pt-1">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-white hover:underline underline-offset-2">
              Sign in
            </Link>
          </p>
        </form>
      </motion.div>
    </div>
  )
}
