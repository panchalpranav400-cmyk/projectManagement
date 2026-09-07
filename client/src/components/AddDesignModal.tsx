import { useState, useEffect, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Modal } from './Modal'
import { useProjects } from '../hooks/useProjects'
import { useCreateTask } from '../hooks/useTasks'
import { triggerConfetti } from '../lib/confetti'
import { useToast } from '../context/ToastContext'
import type { TaskPriority, TaskStatus } from '../types'
import { Sparkles, FolderKanban, Columns3, ArrowRight } from 'lucide-react'

interface Props {
  open: boolean
  onClose: () => void
  designImage: string
  designTitle: string
}

export function AddDesignModal({ open, onClose, designImage, designTitle }: Props) {
  const { data: projects } = useProjects()
  const { showToast } = useToast()
  const navigate = useNavigate()

  const [projectId, setProjectId] = useState<number | null>(null)
  const [columnStatus, setColumnStatus] = useState<TaskStatus>('design')
  const [title, setTitle] = useState('')
  const [priority, setPriority] = useState<TaskPriority>('high')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    if (open) {
      setTitle(`Implement ${designTitle}`)
      setNotes(`Flowboard Feature Spec: ${designTitle}\nPreview: ${designImage}`)
      if (projects && projects.length > 0 && projectId === null) {
        setProjectId(projects[0].id)
      }
    }
  }, [open, designTitle, designImage, projects, projectId])

  const createTask = useCreateTask(projectId ?? 0)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!projectId) {
      showToast('Please select or create a project first', 'error')
      return
    }

    try {
      await createTask.mutateAsync({
        title,
        description: notes,
        status: columnStatus,
        priority,
      })

      triggerConfetti()
      showToast(`Added "${designTitle}" to project!`, 'success')
      onClose()
      navigate(`/projects/${projectId}`)
    } catch {
      showToast('Failed to add feature to project', 'error')
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Add Feature to Project">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Selected Design Preview Card */}
        <div className="flex items-center gap-3.5 rounded-2xl border border-white/10 bg-white/[0.03] p-3">
          <img
            src={designImage}
            alt={designTitle}
            className="h-16 w-24 shrink-0 rounded-xl object-cover border border-white/10"
          />
          <div className="min-w-0">
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-brand-2">
              <Sparkles className="h-3 w-3" /> Flowboard Feature Spec
            </span>
            <p className="truncate text-sm font-bold text-white">{designTitle}</p>
            <p className="text-xs text-white/40 truncate">Ready for implementation in board</p>
          </div>
        </div>

        {/* Project Selector */}
        <div>
          <label className="mb-1 flex items-center gap-1.5 text-xs font-medium text-white/60">
            <FolderKanban className="h-3.5 w-3.5 text-brand-2" /> Target Project
          </label>
          <select
            value={projectId ?? ''}
            onChange={(e) => setProjectId(Number(e.target.value))}
            required
            className="w-full rounded-xl border border-white/10 bg-[#16181d] px-3.5 py-2.5 text-sm text-white outline-none focus:border-brand"
          >
            {projects?.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.taskCount} tasks)
              </option>
            ))}
          </select>
          {(!projects || projects.length === 0) && (
            <p className="mt-1 text-xs text-amber-400">
              No projects found. Please create a project first.
            </p>
          )}
        </div>

        {/* Column & Priority */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 flex items-center gap-1.5 text-xs font-medium text-white/60">
              <Columns3 className="h-3.5 w-3.5 text-brand-2" /> Target Column
            </label>
            <select
              value={columnStatus}
              onChange={(e) => setColumnStatus(e.target.value as TaskStatus)}
              className="w-full rounded-xl border border-white/10 bg-[#16181d] px-3 py-2 text-xs sm:text-sm text-white outline-none focus:border-brand"
            >
              <option value="design">Designs (New Column)</option>
              <option value="todo">To do</option>
              <option value="in_progress">In progress</option>
              <option value="done">Done</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-white/60">Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as TaskPriority)}
              className="w-full rounded-xl border border-white/10 bg-[#16181d] px-3 py-2 text-xs sm:text-sm text-white outline-none focus:border-brand"
            >
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>
          </div>
        </div>

        {/* Task Title */}
        <div>
          <label className="mb-1 block text-xs font-medium text-white/60">Task Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-sm text-white outline-none focus:border-brand focus:ring-1 focus:ring-brand"
          />
        </div>

        {/* Notes */}
        <div>
          <label className="mb-1 block text-xs font-medium text-white/60">Component Specs & Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-xs sm:text-sm text-white outline-none focus:border-brand resize-none"
          />
        </div>

        {/* Action buttons */}
        <div className="pt-3 flex justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-white/10 px-4 py-2 text-xs font-medium text-white/70 hover:bg-white/5"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={createTask.isPending || !projectId}
            className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-brand to-brand-2 px-5 py-2 text-xs font-semibold text-black shadow-md hover:opacity-95 transition-all disabled:opacity-50"
          >
            <span>{createTask.isPending ? 'Adding to board…' : 'Add to Project Column'}</span>
            {!createTask.isPending && <ArrowRight className="h-3.5 w-3.5" />}
          </button>
        </div>
      </form>
    </Modal>
  )
}
