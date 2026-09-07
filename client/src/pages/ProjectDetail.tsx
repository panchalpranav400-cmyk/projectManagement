import { useState, useMemo, type FormEvent } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion } from 'motion/react'
import {
  ArrowLeft,
  Plus,
  AlertTriangle,
  FolderKanban,
  List,
  Search,
  Trash2,
  Sparkles,
  Users,
  Calendar as CalendarIcon,
  BarChart3,
  Download,
} from 'lucide-react'
import { useProject, useAddMember, useRemoveMember, useDeleteProject } from '../hooks/useProjects'
import { useUpdateTask, useDeleteTask } from '../hooks/useTasks'
import { KanbanBoard } from '../components/KanbanBoard'
import { TimelineView } from '../components/TimelineView'
import { CalendarView } from '../components/CalendarView'
import { ProjectAnalytics } from '../components/ProjectAnalytics'
import { TaskFormModal } from '../components/TaskFormModal'
import { TaskDetailModal } from '../components/TaskDetailModal'
import { ProgressBar } from '../components/ProgressBar'
import { TaskCardSkeleton } from '../components/Skeleton'
import { useAuth } from '../context/AuthContext'
import type { Task, TaskPriority, TaskStatus } from '../types'

type ViewMode = 'kanban' | 'list' | 'timeline' | 'calendar' | 'analytics'

export function ProjectDetail() {
  const { id } = useParams()
  const projectId = Number(id)
  const { data: project, isLoading } = useProject(projectId)
  const [taskModalOpen, setTaskModalOpen] = useState(false)
  const [initialTaskStatus, setInitialTaskStatus] = useState<TaskStatus>('todo')
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [taskDetailOpen, setTaskDetailOpen] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>('kanban')
  const [searchQuery, setSearchQuery] = useState('')
  const [priorityFilter, setPriorityFilter] = useState<'all' | TaskPriority>('all')
  const [tagFilter, setTagFilter] = useState<string>('all')
  const [memberEmail, setMemberEmail] = useState('')

  const updateTask = useUpdateTask(projectId)
  const deleteTask = useDeleteTask(projectId)
  const addMember = useAddMember(projectId)
  const removeMember = useRemoveMember(projectId)
  const deleteProject = useDeleteProject()
  const { user, guest } = useAuth()
  const navigate = useNavigate()

  // Collect all unique tags
  const availableTags = useMemo(() => {
    const set = new Set<string>()
    project?.tasks?.forEach((t) => t.tags?.forEach((tag) => set.add(tag)))
    return Array.from(set)
  }, [project?.tasks])

  // Filter tasks
  const filteredTasks = useMemo(() => {
    if (!project?.tasks) return []
    return project.tasks.filter((t) => {
      const matchesSearch =
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase()))

      if (!matchesSearch) return false
      if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false
      if (tagFilter !== 'all' && (!t.tags || !t.tags.includes(tagFilter))) return false
      return true
    })
  }, [project?.tasks, searchQuery, priorityFilter, tagFilter])

  if (isLoading || !project) {
    return (
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[0, 1, 2].map((col) => (
            <div key={col} className="space-y-3 rounded-2xl border border-white/10 p-4">
              <TaskCardSkeleton />
              <TaskCardSkeleton />
              <TaskCardSkeleton />
            </div>
          ))}
        </div>
      </div>
    )
  }

  const total = project.tasks?.length ?? 0
  const done = project.tasks?.filter((t) => t.status === 'done').length ?? 0
  const progress = total === 0 ? 0 : Math.round((done / total) * 100)
  const isOwner = guest || project.members.find((m) => m.userId === user?.id)?.role === 'owner'
  const hasOverdue = project.tasks?.some(
    (t) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'done',
  )

  function handleExportCSV() {
    if (!project?.tasks) return
    const headers = ['ID', 'Title', 'Description', 'Status', 'Priority', 'Due Date', 'Estimated Hours', 'Logged Hours', 'Tags', 'Assignee']
    const rows = project.tasks.map((t) => [
      t.id,
      `"${(t.title || '').replace(/"/g, '""')}"`,
      `"${(t.description || '').replace(/"/g, '""')}"`,
      t.status,
      t.priority,
      t.dueDate ? t.dueDate.split('T')[0] : '',
      t.estimatedHours ?? '',
      t.loggedHours ?? '',
      `"${(t.tags || []).join(', ')}"`,
      `"${t.assignee?.name || t.assignee?.email || ''}"`,
    ])
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `${project.name.toLowerCase().replace(/\s+/g, '_')}_tasks.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  function handleExportJSON() {
    if (!project) return
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(project, null, 2))
    const link = document.createElement('a')
    link.href = dataStr
    link.setAttribute('download', `${project.name.toLowerCase().replace(/\s+/g, '_')}_backup.json`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  async function handleAddMember(e: FormEvent) {
    e.preventDefault()
    if (!memberEmail) return
    await addMember.mutateAsync(memberEmail)
    setMemberEmail('')
  }

  async function handleDeleteProject() {
    if (!confirm('Delete this project? This cannot be undone.')) return
    await deleteProject.mutateAsync(projectId)
    navigate('/')
  }

  function handleOpenCreateModal(status: TaskStatus = 'todo') {
    setInitialTaskStatus(status)
    setTaskModalOpen(true)
  }

  function handleSelectTask(task: Task) {
    setSelectedTask(task)
    setTaskDetailOpen(true)
  }

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8 sm:py-12 pointer-events-none">
      {/* Top breadcrumb & back button */}
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-white/50 hover:text-white transition-colors group mb-4 pointer-events-auto"
      >
        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
        Back to projects
      </Link>

      {/* Project Header Banner */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-wrap items-start justify-between gap-4 border-b border-white/10 pb-6 pointer-events-auto"
      >
        <div className="max-w-2xl">
          <div className="flex items-center gap-3">
            <h1 className="shiny-text text-2xl sm:text-4xl font-extrabold tracking-tight">
              {project.name}
            </h1>
            {hasOverdue && (
              <span className="flex items-center gap-1 rounded-full border border-red-500/30 bg-red-500/10 px-2.5 py-0.5 text-xs text-red-300 font-medium">
                <AlertTriangle className="h-3.5 w-3.5 text-red-400 animate-pulse" />
                Overdue items
              </span>
            )}
          </div>
          {project.description && (
            <p className="mt-2 text-sm sm:text-base text-white/60 leading-relaxed">
              {project.description}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Export Actions */}
          <div className="flex items-center rounded-full border border-white/10 bg-white/5 p-0.5">
            <button
              onClick={handleExportCSV}
              title="Download tasks as CSV spreadsheet"
              className="flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium text-white/70 hover:bg-white/10 hover:text-white transition-all"
            >
              <Download className="h-3 w-3" />
              CSV
            </button>
            <button
              onClick={handleExportJSON}
              title="Download full project JSON backup"
              className="flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium text-white/70 hover:bg-white/10 hover:text-white transition-all"
            >
              JSON
            </button>
          </div>

          {isOwner && (
            <button
              onClick={handleDeleteProject}
              className="flex items-center gap-1.5 rounded-full border border-red-500/20 px-3.5 py-1.5 text-xs text-red-300 hover:bg-red-500/10 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete project
            </button>
          )}
        </div>
      </motion.div>

      {/* Main Grid: Left is Tasks & Views, Right is Sidebar Info & Members */}
      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_20rem] pointer-events-auto">
        <div className="min-w-0 space-y-6">
          {/* Progress Card */}
          <div className="liquid-glass rounded-2xl p-5 border border-white/10">
            <div className="card-glare" />
            <div className="flex items-center justify-between text-xs sm:text-sm font-medium text-white/70">
              <span className="flex items-center gap-2">
                <span className="text-white font-bold">{progress}% completed</span>
                {progress === 100 && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[11px] text-emerald-300">
                    <Sparkles className="h-3 w-3" /> All Done!
                  </span>
                )}
              </span>
              <span className="font-mono text-white/50">
                {done} / {total} tasks
              </span>
            </div>
            <div className="mt-3">
              <ProgressBar value={progress} />
            </div>
          </div>

          {/* Tasks Toolbar: 5-Way View Switcher, Tag/Priority filters, and Add Task */}
          <div className="flex flex-col gap-3 pt-2">
            <div className="flex flex-wrap items-center justify-between gap-3">
              {/* 5-Way View Switcher */}
              <div className="flex flex-wrap items-center rounded-xl border border-white/10 bg-white/5 p-1 gap-0.5">
                <button
                  type="button"
                  onClick={() => setViewMode('kanban')}
                  className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                    viewMode === 'kanban'
                      ? 'bg-white text-black shadow-sm'
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  <FolderKanban className="h-3.5 w-3.5" />
                  Kanban
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                    viewMode === 'list'
                      ? 'bg-white text-black shadow-sm'
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  <List className="h-3.5 w-3.5" />
                  List
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('timeline')}
                  className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                    viewMode === 'timeline'
                      ? 'bg-white text-black shadow-sm'
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  <CalendarIcon className="h-3.5 w-3.5" />
                  Timeline
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('calendar')}
                  className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                    viewMode === 'calendar'
                      ? 'bg-white text-black shadow-sm'
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  <CalendarIcon className="h-3.5 w-3.5" />
                  Calendar
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('analytics')}
                  className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                    viewMode === 'analytics'
                      ? 'bg-white text-black shadow-sm'
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  <BarChart3 className="h-3.5 w-3.5" />
                  Analytics
                </button>
              </div>

              {/* Add Task Button */}
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => handleOpenCreateModal('todo')}
                className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-brand to-brand-2 px-3.5 py-1.5 text-xs font-semibold text-black shadow-md shrink-0"
              >
                <Plus className="h-3.5 w-3.5" />
                Add task
              </motion.button>
            </div>

            {/* Second row: Search & Filters (only for task list/kanban/timeline/calendar) */}
            {viewMode !== 'analytics' && (
              <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1">
                <div className="flex flex-wrap items-center gap-2">
                  {/* Priority Filter */}
                  <select
                    value={priorityFilter}
                    onChange={(e) => setPriorityFilter(e.target.value as any)}
                    className="rounded-xl border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs text-white outline-none focus:border-brand"
                  >
                    <option value="all" className="bg-[#121316]">
                      All Priorities
                    </option>
                    <option value="high" className="bg-[#121316]">
                      High Priority
                    </option>
                    <option value="medium" className="bg-[#121316]">
                      Medium Priority
                    </option>
                    <option value="low" className="bg-[#121316]">
                      Low Priority
                    </option>
                  </select>

                  {/* Tag Filter */}
                  {availableTags.length > 0 && (
                    <select
                      value={tagFilter}
                      onChange={(e) => setTagFilter(e.target.value)}
                      className="rounded-xl border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs text-white outline-none focus:border-brand"
                    >
                      <option value="all" className="bg-[#121316]">
                        All Tags
                      </option>
                      {availableTags.map((tag) => (
                        <option key={tag} value={tag} className="bg-[#121316]">
                          {tag}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Search tasks */}
                <div className="relative flex-1 sm:w-52">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/40" />
                  <input
                    type="text"
                    placeholder="Find task..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/5 pl-8 pr-3 py-1.5 text-xs text-white placeholder-white/30 outline-none focus:border-brand"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Active View Container */}
          <div>
            {viewMode === 'timeline' ? (
              <TimelineView tasks={filteredTasks} onSelectTask={handleSelectTask} />
            ) : viewMode === 'calendar' ? (
              <CalendarView tasks={filteredTasks} onSelectTask={handleSelectTask} />
            ) : viewMode === 'analytics' ? (
              <ProjectAnalytics
                tasks={project.tasks || []}
                members={project.members}
                progress={progress}
              />
            ) : total === 0 ? (
              <div className="liquid-glass rounded-3xl p-12 text-center border border-white/10">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 text-white/40 mb-3">
                  <Plus className="h-6 w-6" />
                </div>
                <h3 className="text-base font-semibold text-white">No tasks created yet</h3>
                <p className="mt-1 text-sm text-white/50 max-w-sm mx-auto">
                  Organize ideas into actionable tasks and drag them across stages to track momentum.
                </p>
                <button
                  onClick={() => handleOpenCreateModal('todo')}
                  className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-xs font-semibold text-black shadow-md hover:bg-white/90 transition-all"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add your first task
                </button>
              </div>
            ) : (
              <KanbanBoard
                tasks={filteredTasks}
                viewMode={viewMode}
                onStatusChange={(taskId, status) => updateTask.mutate({ id: taskId, status })}
                onDelete={(taskId) => deleteTask.mutate(taskId)}
                onSelectTask={handleSelectTask}
                onQuickAddTask={handleOpenCreateModal}
              />
            )}
          </div>
        </div>

        {/* Right Sidebar: Members & Details */}
        <div className="space-y-6">
          <div className="liquid-glass rounded-2xl p-5 border border-white/10">
            <div className="card-glare" />
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white/60">
                <Users className="h-4 w-4 text-brand-2" />
                Project Members ({project.members.length})
              </h2>
            </div>

            <ul className="mt-3 space-y-2">
              {project.members.map((m) => (
                <li
                  key={m.userId}
                  className="flex items-center justify-between rounded-xl px-2.5 py-2 hover:bg-white/5 transition-colors text-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-brand to-brand-2 text-[10px] font-bold text-black ring-1 ring-white/20">
                      {m.user.name.slice(0, 1).toUpperCase()}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-medium text-white">{m.user.name}</p>
                      <p className="truncate text-[10px] text-white/40">{m.user.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        m.role === 'owner'
                          ? 'bg-brand/20 text-brand-2'
                          : 'bg-white/10 text-white/50'
                      }`}
                    >
                      {m.role}
                    </span>
                    {isOwner && m.role !== 'owner' && (
                      <button
                        onClick={() => removeMember.mutate(m.userId)}
                        className="text-white/30 hover:text-red-300 transition-colors p-1"
                        title="Remove member"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>

            {/* Invite Form */}
            <form onSubmit={handleAddMember} className="mt-4 pt-3 border-t border-white/5 flex gap-2">
              <input
                type="email"
                placeholder="colleague@domain.com"
                value={memberEmail}
                onChange={(e) => setMemberEmail(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white placeholder-white/30 outline-none focus:border-brand"
              />
              <button
                type="submit"
                disabled={addMember.isPending}
                className="rounded-xl bg-white px-3 py-1.5 text-xs font-semibold text-black hover:bg-white/90 shrink-0 transition-colors disabled:opacity-50"
              >
                {addMember.isPending ? 'Inviting…' : 'Invite'}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Task Creation Modal */}
      <TaskFormModal
        open={taskModalOpen}
        onClose={() => setTaskModalOpen(false)}
        projectId={projectId}
        members={project.members}
        initialStatus={initialTaskStatus}
      />

      {/* Task Details & Edit Modal */}
      <TaskDetailModal
        open={taskDetailOpen}
        onClose={() => setTaskDetailOpen(false)}
        task={selectedTask}
        projectId={projectId}
        members={project.members}
      />
    </div>
  )
}
