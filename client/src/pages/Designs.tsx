import { useState, useMemo } from 'react'
import { motion } from 'motion/react'
import { Sparkles, Search, Plus, FolderKanban, Filter, X } from 'lucide-react'
import { ThreeDMarqueeDemo } from '../components/ThreeDMarqueeDemo'
import { AddDesignModal } from '../components/AddDesignModal'
import { useProjects } from '../hooks/useProjects'
import { ProjectCard } from '../components/ProjectCard'
import { ProjectCardSkeleton } from '../components/Skeleton'
import { ProjectFormModal } from '../components/ProjectFormModal'

type FilterTab = 'all' | 'in_progress' | 'completed' | 'overdue'

export function Designs() {
  const [selectedDesign, setSelectedDesign] = useState<{ image: string; title: string } | null>(null)
  const [projectSearchQuery, setProjectSearchQuery] = useState('')
  const [projectActiveTab, setProjectActiveTab] = useState<FilterTab>('all')
  const [newProjectModalOpen, setNewProjectModalOpen] = useState(false)

  const { data: projects, isLoading: projectsLoading } = useProjects()

  const filteredProjects = useMemo(() => {
    if (!projects) return []
    return projects.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(projectSearchQuery.toLowerCase()) ||
        (p.description && p.description.toLowerCase().includes(projectSearchQuery.toLowerCase()))

      if (!matchesSearch) return false

      if (projectActiveTab === 'in_progress') return p.progress < 100 && p.progress > 0
      if (projectActiveTab === 'completed') return p.progress === 100
      if (projectActiveTab === 'overdue') return p.overdueCount > 0
      return true
    })
  }, [projects, projectSearchQuery, projectActiveTab])

  const tabs: { id: FilterTab; label: string; count?: number }[] = [
    { id: 'all', label: 'All Projects', count: projects?.length },
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
    {
      id: 'overdue',
      label: 'Overdue',
      count: projects?.filter((p) => p.overdueCount > 0).length,
    },
  ]

  function handleSelectDesign(image: string, title: string) {
    setSelectedDesign({ image, title })
  }

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8 sm:py-12 pointer-events-none">
      {/* Header Banner */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-center max-w-3xl mx-auto mb-8 pointer-events-auto"
      >
        <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.05] px-4 py-1 text-xs font-medium text-white/80 shadow-sm backdrop-blur-md mb-4">
          <Sparkles className="h-3.5 w-3.5 text-brand-2 animate-pulse" />
          <span className="tracking-wide">Features & 3D Interactive Showcase</span>
        </div>

        <h1 className="shiny-text text-3xl sm:text-5xl font-extrabold tracking-tight">
          Features & 3D Showcase
        </h1>
        <p className="mt-3 text-sm sm:text-base text-white/60 leading-relaxed">
          Explore Flowboard's core platform features, interactive Kanban workflows, and workspace projects in an immersive 3D perspective viewport. Click any feature or project to open and integrate it.
        </p>
      </motion.div>

      {/* 3D Marquee Stage */}
      <div className="pointer-events-auto">
        <ThreeDMarqueeDemo onSelectDesign={handleSelectDesign} />
      </div>

      {/* Projects Section - Same Layout as Dashboard */}
      <div className="mt-14 space-y-5 pointer-events-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div className="flex items-center gap-2">
            <FolderKanban className="h-5 w-5 text-brand-2" />
            <h2 className="text-xl font-bold tracking-tight text-white">Your Workspace Projects</h2>
            <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs text-white/60 font-mono">
              {filteredProjects.length}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/40" />
              <input
                type="text"
                placeholder="Filter projects by name..."
                value={projectSearchQuery}
                onChange={(e) => setProjectSearchQuery(e.target.value)}
                className="w-full rounded-full border border-white/10 bg-white/5 pl-9 pr-8 py-1.5 text-xs text-white outline-none focus:border-brand-2/50 focus:ring-1 focus:ring-brand-2 transition-all placeholder-white/30"
              />
              {projectSearchQuery && (
                <button
                  onClick={() => setProjectSearchQuery('')}
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
              onClick={() => setNewProjectModalOpen(true)}
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
            const isActive = projectActiveTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setProjectActiveTab(tab.id)}
                className={`relative flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition-all ${
                  isActive ? 'text-white' : 'text-white/50 hover:text-white/80 hover:bg-white/5'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="projects-page-tab-active"
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

        {/* Loading Skeleton */}
        {projectsLoading && (
          <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <ProjectCardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!projectsLoading && filteredProjects.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="liquid-glass rounded-3xl p-10 text-center border border-white/10"
          >
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 text-white/40 mb-3">
              <Filter className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-semibold text-white">No projects found</h3>
            <p className="mt-1 text-xs text-white/50 max-w-sm mx-auto">
              {projectSearchQuery
                ? `No projects matched "${projectSearchQuery}". Try a different keyword.`
                : 'Create your first project to start tracking tasks and 3D designs.'}
            </p>
          </motion.div>
        )}

        {/* Grid of Projects in the same layout */}
        {!projectsLoading && filteredProjects.length > 0 && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProjects.map((p, idx) => (
              <ProjectCard key={p.id} project={p} index={idx} />
            ))}
          </div>
        )}
      </div>

      {/* Add Design Modal */}
      {selectedDesign && (
        <AddDesignModal
          open={Boolean(selectedDesign)}
          onClose={() => setSelectedDesign(null)}
          designImage={selectedDesign.image}
          designTitle={selectedDesign.title}
        />
      )}

      {/* New Project Modal */}
      <ProjectFormModal
        open={newProjectModalOpen}
        onClose={() => setNewProjectModalOpen(false)}
      />
    </div>
  )
}
