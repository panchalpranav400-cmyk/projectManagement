import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { Copy, Sparkles, FolderPlus, ArrowDown, HelpCircle, Check } from 'lucide-react'
import { useTypewriter } from '../hooks/useTypewriter'
import { useToast } from '../context/ToastContext'
import { ScrubWaveform } from './ScrubWaveform'

const TAGLINE = "Let's turn your next idea into tasks that actually ship."
const CONTACT_EMAIL = 'hello@flowboard.app'

interface Props {
  onCreateProject: () => void
  onScrollToStats: () => void
  onScrollToProjects: () => void
}

export function DashboardHero({ onCreateProject, onScrollToStats, onScrollToProjects }: Props) {
  const { displayed, done } = useTypewriter(TAGLINE)
  const { showToast } = useToast()
  const [pillsVisible, setPillsVisible] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setPillsVisible(true), 300)
    return () => clearTimeout(t)
  }, [])

  async function handleCopyEmail() {
    try {
      await navigator.clipboard.writeText(CONTACT_EMAIL)
      setCopied(true)
      showToast('Copied hello@flowboard.app to clipboard!', 'success')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      showToast('Could not copy — copy it manually: ' + CONTACT_EMAIL, 'error')
    }
  }

  function explain() {
    showToast(
      '💡 Tip: Create a project, add tasks, drag across To do → In progress → Done, and celebrate completions with confetti!',
      'info',
    )
  }

  return (
    <section className="liquid-glass relative mb-10 overflow-hidden rounded-3xl p-6 sm:p-10 border border-white/10 shadow-2xl">
      {/* Background ambient spotlight inside card */}
      <div className="card-glare" />
      <div
        className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full opacity-20 blur-3xl"
        style={{ background: 'var(--color-brand-2)' }}
      />

      {/* Scrub interactive audio wave at bottom */}
      <ScrubWaveform />

      <div className="relative z-10 max-w-2xl">
        {/* Floating live badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.05] px-3.5 py-1 text-xs font-medium text-white/80 shadow-sm backdrop-blur-md mb-5"
        >
          <span className="flex h-2 w-2 rounded-full bg-brand-2 animate-ping" />
          <Sparkles className="h-3.5 w-3.5 text-brand-2" />
          <span className="tracking-wide text-[12px]">Interactive Workspace & Kanban Board</span>
        </motion.div>

        {/* Crisp subtitle */}
        <p className="text-sm sm:text-base font-medium text-white/60 mb-2">
          Flowboard • Your team's shared source of truth for what's next
        </p>

        {/* Dynamic typewriter headline */}
        <h1
          className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white mb-6 leading-snug"
          style={{ minHeight: '3.6rem' }}
        >
          <span className="shiny-text">{displayed}</span>
          {!done && <span className="typewriter-cursor" />}
        </h1>

        {/* Interactive action pills with hover and active physics */}
        <div
          className={`flex flex-wrap items-center gap-2.5 transition-all duration-500 ease-out ${
            pillsVisible ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'
          }`}
        >
          <motion.button
            whileHover={{ scale: 1.03, y: -1 }}
            whileTap={{ scale: 0.96 }}
            type="button"
            onClick={onCreateProject}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brand to-brand-2 px-5 py-2.5 text-xs sm:text-sm font-semibold text-black shadow-[0_0_20px_var(--color-brand-glow)] transition-all"
          >
            <FolderPlus className="h-4 w-4" />
            Create a project
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.03, y: -1 }}
            whileTap={{ scale: 0.96 }}
            type="button"
            onClick={onScrollToProjects}
            className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs sm:text-sm font-medium text-white transition-colors hover:bg-white/10 hover:border-white/30"
          >
            <ArrowDown className="h-3.5 w-3.5 text-white/50" />
            Jump to projects
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.03, y: -1 }}
            whileTap={{ scale: 0.96 }}
            type="button"
            onClick={onScrollToStats}
            className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs sm:text-sm font-medium text-white transition-colors hover:bg-white/10 hover:border-white/30"
          >
            See stats
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.03, y: -1 }}
            whileTap={{ scale: 0.96 }}
            type="button"
            onClick={explain}
            className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3.5 py-2 text-xs sm:text-sm font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-white"
          >
            <HelpCircle className="h-3.5 w-3.5 text-brand-2" />
            How it works
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.03, y: -1 }}
            whileTap={{ scale: 0.96 }}
            type="button"
            onClick={handleCopyEmail}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-3.5 py-2 text-xs sm:text-sm text-white/60 transition-colors hover:border-white/20 hover:text-white"
          >
            <span>{CONTACT_EMAIL}</span>
            {copied ? (
              <Check className="h-3.5 w-3.5 text-emerald-400" />
            ) : (
              <Copy className="h-3.5 w-3.5 opacity-60" />
            )}
          </motion.button>
        </div>
      </div>
    </section>
  )
}
