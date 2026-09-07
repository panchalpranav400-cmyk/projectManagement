import { motion } from 'motion/react'
import { Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, FolderKanban, Plus, Sparkles, Layers } from 'lucide-react'
import { useProjects } from '../hooks/useProjects'

interface Props {
  onOpenNewProject?: () => void
}

export function Sidebar({ onOpenNewProject }: Props) {
  const { pathname } = useLocation()
  const { data: projects } = useProjects()

  return (
    <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-white/10 bg-[#0c0c0c]/70 backdrop-blur-xl sm:flex">
      {/* Brand logo & tagline */}
      <div className="flex h-14 items-center justify-between px-5 border-b border-white/5">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-tr from-brand to-brand-2 shadow-[0_0_12px_var(--color-brand-glow)]">
            <Sparkles className="h-4 w-4 text-black" />
          </div>
          <div>
            <span className="text-sm font-bold tracking-tight text-white group-hover:text-brand-2 transition-colors">
              Flowboard
            </span>
          </div>
        </Link>
      </div>

      {/* Main navigation */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        <div>
          <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-white/40">
            Overview
          </div>
          <div className="space-y-1">
            <Link
              to="/"
              className="relative flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm transition-all"
            >
              {pathname === '/' && (
                <motion.div
                  layoutId="sidebar-active-pill"
                  className="absolute inset-0 rounded-xl bg-white/10 border border-white/10 shadow-sm"
                  transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                />
              )}
              <LayoutDashboard
                className={`relative h-4 w-4 shrink-0 transition-colors ${
                  pathname === '/' ? 'text-brand-2' : 'text-white/40'
                }`}
              />
              <span
                className={`relative truncate font-medium transition-colors ${
                  pathname === '/' ? 'text-white' : 'text-white/60 hover:text-white'
                }`}
              >
                Dashboard
              </span>
            </Link>

            <Link
              to="/designs"
              className="relative flex items-center justify-between rounded-xl px-3 py-2 text-sm transition-all group"
            >
              {pathname === '/designs' && (
                <motion.div
                  layoutId="sidebar-active-pill"
                  className="absolute inset-0 rounded-xl bg-white/10 border border-white/10 shadow-sm"
                  transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                />
              )}
              <div className="relative flex items-center gap-2.5 min-w-0">
                <Layers
                  className={`h-4 w-4 shrink-0 transition-colors ${
                    pathname === '/designs' ? 'text-brand-2' : 'text-white/40 group-hover:text-white/70'
                  }`}
                />
                <span
                  className={`truncate font-medium transition-colors ${
                    pathname === '/designs' ? 'text-white' : 'text-white/60 group-hover:text-white'
                  }`}
                >
                  Features & 3D
                </span>
              </div>
              <span className="relative rounded-full bg-cyan-500/15 border border-cyan-400/30 px-1.5 py-0.2 text-[10px] font-semibold text-cyan-300">
                3D
              </span>
            </Link>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between px-3 pb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-white/40">
              Projects
            </span>
            {onOpenNewProject && (
              <button
                onClick={onOpenNewProject}
                title="Create Project"
                className="rounded p-1 text-white/40 hover:bg-white/10 hover:text-white transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <div className="space-y-1">
            {projects && projects.length === 0 && (
              <p className="px-3 py-2 text-xs text-white/30 italic">No projects yet</p>
            )}

            {projects?.map((p) => {
              const active = pathname === `/projects/${p.id}`
              return (
                <Link
                  key={p.id}
                  to={`/projects/${p.id}`}
                  className="group relative flex items-center justify-between rounded-xl px-3 py-2 text-sm transition-all"
                >
                  {active && (
                    <motion.div
                      layoutId="sidebar-active-pill"
                      className="absolute inset-0 rounded-xl bg-white/10 border border-white/10 shadow-sm"
                      transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                    />
                  )}
                  <div className="relative flex items-center gap-2.5 min-w-0">
                    <FolderKanban
                      className={`h-4 w-4 shrink-0 transition-colors ${
                        active ? 'text-brand-2' : 'text-white/40 group-hover:text-white/70'
                      }`}
                    />
                    <span
                      className={`truncate font-medium transition-colors ${
                        active ? 'text-white' : 'text-white/60 group-hover:text-white'
                      }`}
                    >
                      {p.name}
                    </span>
                  </div>

                  {/* Progress percentage pill */}
                  <span
                    className={`relative text-[11px] font-mono px-1.5 py-0.5 rounded-full ${
                      p.progress === 100
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : active
                        ? 'text-white/70'
                        : 'text-white/30'
                    }`}
                  >
                    {p.progress}%
                  </span>
                </Link>
              )
            })}
          </div>
        </div>
      </div>

      {/* Footer shortcut info */}
      <div className="p-3 border-t border-white/5">
        <button
          onClick={onOpenNewProject}
          className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-medium text-white/70 hover:bg-white/10 hover:text-white transition-all shadow-sm"
        >
          <Plus className="h-3.5 w-3.5 text-brand-2" />
          <span>New Project</span>
        </button>
      </div>
    </aside>
  )
}
