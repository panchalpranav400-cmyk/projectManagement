import { useState, type MouseEvent } from 'react'
import { motion, useMotionValue, useTransform } from 'motion/react'
import { Link } from 'react-router-dom'
import { Users, ListChecks, AlertTriangle, ArrowUpRight, CheckCircle2, Star } from 'lucide-react'
import type { Project } from '../types'

function CircularProgress({ value }: { value: number }) {
  const radius = 18
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (value / 100) * circumference

  return (
    <div className="relative flex items-center justify-center">
      <svg className="h-12 w-12 -rotate-90 transform">
        <circle
          cx="24"
          cy="24"
          r={radius}
          stroke="rgba(255, 255, 255, 0.08)"
          strokeWidth="3.5"
          fill="transparent"
        />
        <circle
          cx="24"
          cy="24"
          r={radius}
          stroke="url(#progress-gradient)"
          strokeWidth="3.5"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          className="transition-all duration-700 ease-out"
        />
        <defs>
          <linearGradient id="progress-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--color-brand)" />
            <stop offset="100%" stopColor="var(--color-brand-2)" />
          </linearGradient>
        </defs>
      </svg>
      <span className="absolute text-[11px] font-bold text-white font-mono">{value}%</span>
    </div>
  )
}

export function ProjectCard({
  project,
  index,
}: {
  project: Project
  index: number
}) {
  const [starred, setStarred] = useState(false)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rotateX = useTransform(y, [-80, 80], [7, -7])
  const rotateY = useTransform(x, [-80, 80], [-7, 7])

  function handleMouseMove(e: MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect()
    const offsetX = e.clientX - rect.left
    const offsetY = e.clientY - rect.top
    x.set(offsetX - rect.width / 2)
    y.set(offsetY - rect.height / 2)
    e.currentTarget.style.setProperty('--mouse-x', `${offsetX}px`)
    e.currentTarget.style.setProperty('--mouse-y', `${offsetY}px`)
  }

  function handleMouseLeave(e: MouseEvent<HTMLDivElement>) {
    x.set(0)
    y.set(0)
    e.currentTarget.style.removeProperty('--mouse-x')
    e.currentTarget.style.removeProperty('--mouse-y')
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1], delay: index * 0.05 }}
      style={{ perspective: 1000 }}
      className="relative group"
    >
      <motion.div
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ rotateX, rotateY }}
        whileHover={{ scale: 1.02, y: -2 }}
        transition={{ type: 'spring', stiffness: 350, damping: 22 }}
      >
        <div className="liquid-glass liquid-glass-hover relative flex flex-col justify-between rounded-2xl p-5 border border-white/10 transition-all duration-300 min-h-[220px]">
          {/* Mouse-following glare highlight */}
          <div className="card-glare" />

          {/* Top section: Title, favorite, and progress ring */}
          <div>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <Link
                    to={`/projects/${project.id}`}
                    className="truncate text-base font-semibold text-white group-hover:text-brand-2 transition-colors flex items-center gap-1.5"
                  >
                    <span>{project.name}</span>
                    <ArrowUpRight className="h-3.5 w-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-brand-2" />
                  </Link>
                </div>
                {project.description && (
                  <p className="mt-1 line-clamp-2 text-xs sm:text-sm text-white/50">
                    {project.description}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setStarred(!starred)
                  }}
                  title={starred ? 'Starred' : 'Star project'}
                  className="rounded-full p-1.5 text-white/30 hover:text-amber-400 hover:bg-white/5 transition-colors"
                >
                  <Star
                    className={`h-4 w-4 transition-all ${
                      starred ? 'fill-amber-400 text-amber-400 scale-110' : ''
                    }`}
                  />
                </button>
                <CircularProgress value={project.progress} />
              </div>
            </div>

            {/* Overdue tag badge */}
            {project.overdueCount > 0 && (
              <div className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-red-500/30 bg-red-500/10 px-2.5 py-0.5 text-xs text-red-300">
                <AlertTriangle className="h-3 w-3 animate-pulse text-red-400" />
                <span>{project.overdueCount} overdue</span>
              </div>
            )}
          </div>

          {/* Bottom section: Task counts, member avatars & link */}
          <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
            {/* Task count pill */}
            <div className="flex items-center gap-1.5 text-xs text-white/50">
              <ListChecks className="h-3.5 w-3.5 text-brand-2" />
              <span>
                {project.doneCount}/{project.taskCount} tasks
              </span>
              {project.progress === 100 && (
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 ml-1" />
              )}
            </div>

            {/* Member avatars */}
            <div className="flex items-center -space-x-1.5 overflow-hidden">
              {project.members.slice(0, 3).map((m) => (
                <div
                  key={m.userId}
                  title={`${m.user.name} (${m.role})`}
                  className="flex h-6 w-6 items-center justify-center rounded-full border border-black bg-gradient-to-tr from-brand to-brand-2 text-[10px] font-bold text-black ring-1 ring-white/20"
                >
                  {m.user.name.slice(0, 1).toUpperCase()}
                </div>
              ))}
              {project.members.length > 3 && (
                <div className="flex h-6 w-6 items-center justify-center rounded-full border border-black bg-white/10 text-[9px] font-semibold text-white/70">
                  +{project.members.length - 3}
                </div>
              )}
              {project.members.length === 0 && (
                <span className="flex items-center gap-1 text-[11px] text-white/30">
                  <Users className="h-3 w-3" /> 0 members
                </span>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
