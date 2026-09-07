import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import {
  Search,
  FolderKanban,
  Plus,
  Palette,
  Check,
  ArrowRight,
  Sparkles,
} from 'lucide-react'
import { useProjects } from '../hooks/useProjects'
import { useTheme, THEMES, type AccentTheme } from '../context/ThemeContext'

interface Props {
  open: boolean
  onClose: () => void
  onOpenNewProjectModal?: () => void
}

export function CommandPalette({ open, onClose, onOpenNewProjectModal }: Props) {
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const { data: projects } = useProjects()
  const { theme, setTheme } = useTheme()
  const navigate = useNavigate()

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        onClose() // toggle
      } else if (e.key === 'Escape' && open) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  useEffect(() => {
    if (open) {
      setQuery('')
      setSelectedIndex(0)
    }
  }, [open])

  // Build searchable items
  const items = useMemo(() => {
    const list: Array<{
      id: string
      title: string
      subtitle?: string
      icon: typeof FolderKanban
      category: 'Projects' | 'Actions' | 'Themes'
      action: () => void
      activeTheme?: boolean
    }> = []

    // Quick Actions
    list.push({
      id: 'action-new-project',
      title: 'Create New Project',
      subtitle: 'Start tracking new initiatives and tasks',
      icon: Plus,
      category: 'Actions',
      action: () => {
        onClose()
        onOpenNewProjectModal?.()
      },
    })

    list.push({
      id: 'action-projects-showcase',
      title: 'Explore Platform Features & 3D Showcase',
      subtitle: 'Browse interactive 3D marquee of Flowboard features & projects',
      icon: Sparkles,
      category: 'Actions',
      action: () => {
        onClose()
        navigate('/designs')
      },
    })

    // Theme Switchers
    ;(Object.keys(THEMES) as AccentTheme[]).forEach((themeKey) => {
      const config = THEMES[themeKey]
      list.push({
        id: `theme-${themeKey}`,
        title: `Switch Theme: ${config.name}`,
        subtitle: `Change lighting accent to ${config.name}`,
        icon: Palette,
        category: 'Themes',
        activeTheme: theme === themeKey,
        action: () => {
          setTheme(themeKey)
        },
      })
    })

    // Projects
    if (projects) {
      projects.forEach((p) => {
        list.push({
          id: `project-${p.id}`,
          title: p.name,
          subtitle: `${p.taskCount} tasks • ${p.progress}% completed`,
          icon: FolderKanban,
          category: 'Projects',
          action: () => {
            onClose()
            navigate(`/projects/${p.id}`)
          },
        })
      })
    }

    if (!query.trim()) return list

    const q = query.toLowerCase()
    return list.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        (item.subtitle && item.subtitle.toLowerCase().includes(q)) ||
        item.category.toLowerCase().includes(q)
    )
  }, [projects, query, theme, setTheme, navigate, onClose, onOpenNewProjectModal])

  useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  function handleKeyDown(e: React.KeyboardEvent) {
    if (items.length === 0) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((prev) => (prev + 1) % items.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((prev) => (prev - 1 + items.length) % items.length)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (items[selectedIndex]) {
        items[selectedIndex].action()
      }
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 sm:pt-28 px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-md"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 w-full max-w-xl overflow-hidden rounded-2xl border border-white/15 bg-[#121316]/90 shadow-2xl backdrop-blur-2xl"
          >
            {/* Header search bar */}
            <div className="relative flex items-center border-b border-white/10 px-4 py-3">
              <Search className="h-5 w-5 text-white/40" />
              <input
                type="text"
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a command or search projects..."
                className="w-full bg-transparent px-3 text-sm text-white placeholder-white/30 outline-none"
              />
              <div className="flex items-center gap-1">
                <kbd className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] font-medium text-white/50">
                  ESC
                </kbd>
              </div>
            </div>

            {/* Results list */}
            <div className="max-h-80 overflow-y-auto p-2">
              {items.length === 0 ? (
                <div className="py-10 text-center text-sm text-white/40">
                  No matching commands or projects found.
                </div>
              ) : (
                <div className="space-y-1">
                  {items.map((item, idx) => {
                    const Icon = item.icon
                    const isSelected = idx === selectedIndex

                    return (
                      <button
                        key={item.id}
                        onClick={item.action}
                        onMouseEnter={() => setSelectedIndex(idx)}
                        className={`group flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm transition-colors ${
                          isSelected ? 'bg-white/10 text-white' : 'text-white/70 hover:bg-white/5'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                              isSelected
                                ? 'bg-brand/20 text-brand-2'
                                : 'bg-white/5 text-white/40'
                            }`}
                          >
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="truncate font-medium text-white">{item.title}</p>
                            {item.subtitle && (
                              <p className="truncate text-xs text-white/40">{item.subtitle}</p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-white/30">
                          {item.activeTheme && (
                            <span className="flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[11px] font-medium text-emerald-300">
                              <Check className="h-3 w-3" /> Active
                            </span>
                          )}
                          <span className="rounded bg-white/5 px-2 py-0.5 text-[10px] text-white/40">
                            {item.category}
                          </span>
                          {isSelected && <ArrowRight className="h-3.5 w-3.5 text-white/60" />}
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Footer tips */}
            <div className="flex items-center justify-between border-t border-white/10 bg-white/[0.02] px-4 py-2 text-[11px] text-white/40">
              <span className="flex items-center gap-1.5">
                <Sparkles className="h-3 w-3 text-brand-2" />
                Quick navigate with Arrow keys & Enter
              </span>
              <span>
                <kbd className="rounded bg-white/10 px-1 py-0.5">Ctrl</kbd> +{' '}
                <kbd className="rounded bg-white/10 px-1 py-0.5">K</kbd> to toggle
              </span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
