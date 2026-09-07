import { useRef, useState, useMemo, type RefObject } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  Plus,
  Info,
  FolderKanban,
  ListChecks,
  AlertTriangle,
  Search,
  Sparkles,
  TrendingUp,
  X,
  Filter,
} from 'lucide-react'
import { useProjects } from '../hooks/useProjects'
import { ProjectCard } from '../components/ProjectCard'
import { ProjectFormModal } from '../components/ProjectFormModal'
import { ProjectCardSkeleton } from '../components/Skeleton'
import { AnimatedNumber } from '../components/AnimatedNumber'
import { DashboardHero } from '../components/DashboardHero'
import { useAuth } from '../context/AuthContext'

type FilterTab = 'all' | 'in_progress' | 'completed' | 'overdue'

function StatCard({
  icon: Icon,
  label,
  value,
  sublabel,
  glowColor,
}: {
  icon: typeof FolderKanban
  label: string
  value: number
  sublabel: string
  glowColor: string
}) {
  return (
    <motion.div
      whileHover={{ y: -3, scale: 1.01 }}
      transition={{ type: 'spring', stiffness: 350, damping: 20 }}
      className="liquid-glass liquid-glass-hover relative overflow-hidden rounded-2xl p-4 sm:p-5 border border-white/10"
    >
      <div className="card-glare" />
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-white/50">{label}</p>
          <p className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-white font-mono">
            <AnimatedNumber value={value} />
          </p>
          <p className="mt-1 text-xs text-white/40 flex items-center gap-1">
            <TrendingUp className="h-3 w-3 text-emerald-400" />
            {sublabel}
          </p>
        </div>
        <div
          className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 shadow-inner"
          style={{ background: glowColor }}
        >
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </motion.div>
  )
}

export function Dashboard() {
  const { data: projects, isLoading } = useProjects()
  const [modalOpen, setModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<FilterTab>('all')
  const { guest } = useAuth()
  const statsRef = useRef<HTMLDivElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)

  const totalProjects = projects?.length ?? 0
  const totalTasks = projects?.reduce((sum, p) => sum + p.taskCount, 0) ?? 0
  const totalOverdue = projects?.reduce((sum, p) => sum + p.overdueCount, 0) ?? 0

  function scrollTo(ref: RefObject<HTMLDivElement | null>) {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  // Filtered projects
  const filteredProjects = useMemo(() => {
    if (!projects) return []
    return projects.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()))

      if (!matchesSearch) return false

      if (activeTab === 'in_progress') return p.progress < 100 && p.progress > 0
      if (activeTab === 'completed') return p.progress === 100
      if (activeTab === 'overdue') return p.overdueCount > 0
      return true
    })
  }, [projects, searchQuery, activeTab])

  const tabs: { id: FilterTab; label: string; count?: number }[] = [
    { id: 'all', label: 'All Projects', count: totalProjects },
    {
      id: 'in_progress',
      label: 'In Progress',
      count: projects?.filter((p) => p.progress < 100 && p.progress > 0).length,
    },
    {
      id: 'completed',
      label: 'Completed',
      count: projects?.filter((p) => p.progress === 100).length,
    },
    { id: 'overdue', label: 'Overdue', count: totalOverdue },
  ]

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8 sm:py-12 pointer-events-none">
      {guest && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="liquid-glass mb-8 flex items-center justify-between gap-3 rounded-2xl px-4 py-3 text-xs sm:text-sm text-white/70 border border-brand/20 bg-brand/5 pointer-events-auto"
        >
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 shrink-0 text-brand-2" />
            <span>
              Browsing as <strong className="text-white">Guest</strong> — your projects and tasks are stored safely in local memory.
            </span>
          </div>
          <span className="hidden sm:inline rounded-full bg-white/10 px-2 py-0.5 text-[11px] text-white/60">
            Offline ready
          </span>
        </motion.div>
      )}

      {/* Hero with interactive animations */}
      <div className="pointer-events-auto">
        <DashboardHero
          onCreateProject={() => setModalOpen(true)}
          onScrollToStats={() => scrollTo(statsRef)}
          onScrollToProjects={() => scrollTo(gridRef)}
        />
      </div>

      {/* Stats cards grid */}
      <motion.div
        ref={statsRef}
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="grid scroll-mt-20 grid-cols-1 gap-4 sm:grid-cols-3 pointer-events-auto"
      >
        <StatCard
          icon={FolderKanban}
          label="Active Projects"
          value={totalProjects}
          sublabel="Total initiatives"
          glowColor="rgba(61, 129, 227, 0.25)"
        />
        <StatCard
          icon={ListChecks}
          label="Tracked Tasks"
          value={totalTasks}
          sublabel="Across all boards"
          glowColor="rgba(77, 208, 230, 0.25)"
        />
        <StatCard
          icon={AlertTriangle}
          label="Overdue Items"
          value={totalOverdue}
          sublabel={totalOverdue > 0 ? 'Requires attention' : 'All on schedule'}
          glowColor="rgba(244, 63, 94, 0.25)"
        />
      </motion.div>

      {/* Projects toolbar with instant search and filter pills */}
      <div ref={gridRef} className="mt-12 scroll-mt-20 space-y-4 pointer-events-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-brand-2" />
            <h2 className="text-lg font-bold tracking-tight text-white">Your Workspace Projects</h2>
            <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-white/50 font-mono">
              {filteredProjects.length}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/40" />
              <input
                type="text"
                placeholder="Filter by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-full border border-white/10 bg-white/5 pl-9 pr-8 py-1.5 text-xs text-white outline-none focus:border-brand-2/50 focus:ring-1 focus:ring-brand-2 transition-all placeholder-white/30"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* New Project CTA */}
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 text-xs font-semibold text-black shadow-md hover:bg-white/90 transition-all shrink-0"
            >
              <Plus className="h-3.5 w-3.5" />
              New project
            </motion.button>
          </div>
        </div>

        {/* Tab Filters */}
        <div className="flex flex-wrap items-center gap-2 border-b border-white/5 pb-2">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition-all ${
                  isActive ? 'text-white' : 'text-white/50 hover:text-white/80 hover:bg-white/5'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="dashboard-tab-active"
                    className="absolute inset-0 rounded-full bg-white/10 border border-white/15 shadow-sm"
                    transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                  />
                )}
                <span className="relative">{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={`relative rounded-full px-1.5 py-0.2 text-[10px] font-mono ${
                      isActive ? 'bg-white/20 text-white' : 'bg-white/5 text-white/40'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 pointer-events-auto">
          {[0, 1, 2].map((i) => (
            <ProjectCardSkeleton key={i} />
          ))}
        </div>
      )}

      {/* No matching results empty state */}
      {!isLoading && filteredProjects.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="liquid-glass mt-6 rounded-3xl p-12 text-center border border-white/10 pointer-events-auto"
        >
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 text-white/40 mb-4">
            <Filter className="h-6 w-6" />
          </div>
          <h3 className="text-base font-semibold text-white">No projects found</h3>
          <p className="mt-1 text-sm text-white/50 max-w-sm mx-auto">
            {searchQuery
              ? `No projects matched "${searchQuery}". Try a different keyword or reset filters.`
              : 'You have no projects in this category yet.'}
          </p>
          <div className="mt-5 flex justify-center gap-3">
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="rounded-full border border-white/15 px-4 py-1.5 text-xs font-medium text-white hover:bg-white/10 transition-colors"
              >
                Clear search
              </button>
            )}
            <button
              onClick={() => setModalOpen(true)}
              className="rounded-full bg-gradient-to-r from-brand to-brand-2 px-4 py-1.5 text-xs font-semibold text-black transition-all shadow-md"
            >
              Create new project
            </button>
          </div>
        </motion.div>
      )}

      {/* Project Cards Grid */}
      <motion.div layout className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 pointer-events-auto">
        <AnimatePresence>
          {filteredProjects.map((project, i) => (
            <ProjectCard key={project.id} project={project} index={i} />
          ))}
        </AnimatePresence>
      </motion.div>

      <ProjectFormModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  )
}
