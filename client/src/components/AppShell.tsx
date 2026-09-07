import { useState, useEffect, type ReactNode } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { LogOut, Search, Palette, Sparkles, Layers } from 'lucide-react'
import { Sidebar } from './Sidebar'
import { CommandPalette } from './CommandPalette'
import { ProjectFormModal } from './ProjectFormModal'
import { useAuth } from '../context/AuthContext'
import { useTheme, THEMES, type AccentTheme } from '../context/ThemeContext'

export function AppShell({ children }: { children: ReactNode }) {
  const { user, guest, signOut } = useAuth()
  const { theme, setTheme } = useTheme()
  const navigate = useNavigate()
  const [paletteOpen, setPaletteOpen] = useState(false)
  const [projectModalOpen, setProjectModalOpen] = useState(false)
  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false)

  // Listen for global Ctrl+K / Cmd+K
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setPaletteOpen((prev) => !prev)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  async function handleSignOut() {
    await signOut()
    navigate('/login')
  }

  const themeOptions: AccentTheme[] = ['cyan', 'violet', 'emerald', 'rose']

  return (
    <div className="relative z-10 flex min-h-screen pointer-events-none">
      <div className="pointer-events-auto">
        <Sidebar onOpenNewProject={() => setProjectModalOpen(true)} />
      </div>
      
      <div className="flex min-h-screen flex-1 flex-col pointer-events-none">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-white/10 bg-[#0c0c0c]/80 px-4 sm:px-6 backdrop-blur-xl pointer-events-auto">
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold tracking-tight text-white sm:hidden flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-brand animate-pulse" />
              Flowboard
            </span>

            {/* Quick search command palette trigger */}
            <button
              onClick={() => setPaletteOpen(true)}
              className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/50 transition-all hover:border-white/20 hover:bg-white/10 hover:text-white sm:w-64"
            >
              <Search className="h-3.5 w-3.5 shrink-0" />
              <span className="flex-1 text-left hidden sm:inline">Search projects or commands...</span>
              <span className="sm:hidden text-left">Search...</span>
              <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded bg-white/10 px-1.5 py-0.2 text-[10px] text-white/40 font-mono">
                ⌘K
              </kbd>
            </button>

            {/* Projects Showcase Navbar Entry */}
            <Link
              to="/designs"
              className="flex items-center gap-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1.5 text-xs font-medium text-cyan-300 hover:bg-cyan-500/20 hover:border-cyan-400 transition-all shadow-[0_0_12px_rgba(6,182,212,0.15)]"
            >
              <Layers className="h-3.5 w-3.5 text-cyan-300" />
              <span className="hidden sm:inline">Projects</span>
              <span className="sm:hidden">Projects</span>
            </Link>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-4 text-xs sm:text-sm">
            {/* Theme Selector Popover */}
            <div className="relative">
              <button
                onClick={() => setThemeDropdownOpen(!themeDropdownOpen)}
                title="Change theme accent glow"
                className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs text-white/70 transition-all hover:bg-white/10 hover:text-white"
              >
                <span
                  className="h-3 w-3 rounded-full transition-colors shadow-sm"
                  style={{ backgroundColor: THEMES[theme].secondary }}
                />
                <span className="hidden md:inline">{THEMES[theme].name}</span>
                <Palette className="h-3 w-3 opacity-60 ml-0.5" />
              </button>

              {themeDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setThemeDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 z-50 w-48 rounded-xl border border-white/15 bg-[#14151a]/95 p-2 shadow-2xl backdrop-blur-2xl">
                    <p className="px-2 py-1 text-[11px] font-medium uppercase tracking-wider text-white/40">
                      Glow Accent
                    </p>
                    <div className="mt-1 space-y-1">
                      {themeOptions.map((t) => {
                        const config = THEMES[t]
                        const isSelected = theme === t
                        return (
                          <button
                            key={t}
                            onClick={() => {
                              setTheme(t)
                              setThemeDropdownOpen(false)
                            }}
                            className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs transition-colors ${
                              isSelected
                                ? 'bg-white/10 text-white font-medium'
                                : 'text-white/60 hover:bg-white/5 hover:text-white'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span
                                className="h-2.5 w-2.5 rounded-full ring-2 ring-white/20"
                                style={{ backgroundColor: config.secondary }}
                              />
                              {config.name}
                            </div>
                            {isSelected && (
                              <Sparkles className="h-3 w-3 text-brand-2 animate-pulse" />
                            )}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* User status */}
            <div className="hidden sm:flex items-center gap-2 text-white/60 text-xs">
              <span className="h-2 w-2 rounded-full bg-emerald-400/80 shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
              <span className="max-w-[140px] truncate">{user ? user.email : 'Guest Mode'}</span>
            </div>

            <button
              onClick={handleSignOut}
              className="flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-1.5 text-xs text-white/70 transition-all hover:border-white/25 hover:bg-white/5 hover:text-white"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{guest ? 'Exit guest mode' : 'Sign out'}</span>
            </button>
          </div>
        </header>

        <main className="flex-1 pointer-events-none">{children}</main>
      </div>

      <CommandPalette
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        onOpenNewProjectModal={() => setProjectModalOpen(true)}
      />

      <ProjectFormModal
        open={projectModalOpen}
        onClose={() => setProjectModalOpen(false)}
      />
    </div>
  )
}
