import { useState, useEffect, type FormEvent } from 'react'
import { Modal } from './Modal'
import { useCreateTask } from '../hooks/useTasks'
import type { ProjectMember, TaskPriority, TaskStatus } from '../types'

interface Props {
  open: boolean
  onClose: () => void
  projectId: number
  members: ProjectMember[]
  initialStatus?: TaskStatus
}

export function TaskFormModal({ open, onClose, projectId, members, initialStatus = 'todo' }: Props) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<TaskPriority>('medium')
  const [status, setStatus] = useState<TaskStatus>(initialStatus)
  const [assigneeId, setAssigneeId] = useState('')
  const [dueDate, setDueDate] = useState('')
  const createTask = useCreateTask(projectId)

  useEffect(() => {
    if (open) {
      setStatus(initialStatus)
    }
  }, [open, initialStatus])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    await createTask.mutateAsync({
      title,
      description: description || null,
      status,
      priority,
      assigneeId: assigneeId || null,
      dueDate: dueDate ? new Date(dueDate).toISOString() : null,
    })
    setTitle('')
    setDescription('')
    setAssigneeId('')
    setDueDate('')
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title="New task">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-xs font-medium text-white/50">Task Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            autoFocus
            placeholder="e.g. Design sleek onboarding screens"
            className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-sm text-white outline-none focus:border-brand focus:ring-1 focus:ring-brand"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-white/50">Description (optional)</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            placeholder="Key notes, requirements, or links..."
            className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-sm text-white outline-none focus:border-brand focus:ring-1 focus:ring-brand resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-white/50">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as TaskStatus)}
              className="w-full rounded-xl border border-white/10 bg-[#16181d] px-3 py-2 text-sm text-white outline-none focus:border-brand"
            >
              <option value="design">Designs</option>
              <option value="todo">To do</option>
              <option value="in_progress">In progress</option>
              <option value="done">Done</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-white/50">Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as TaskPriority)}
              className="w-full rounded-xl border border-white/10 bg-[#16181d] px-3 py-2 text-sm text-white outline-none focus:border-brand"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-white/50">Due date</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-[#16181d] px-3 py-2 text-sm text-white outline-none focus:border-brand"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-white/50">Assignee</label>
            <select
              value={assigneeId}
              onChange={(e) => setAssigneeId(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-[#16181d] px-3 py-2 text-sm text-white outline-none focus:border-brand"
            >
              <option value="">Unassigned</option>
              {members.map((m) => (
                <option key={m.userId} value={m.userId}>
                  {m.user.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {createTask.isError && <p className="text-xs text-red-300">Something went wrong. Try again.</p>}

        <div className="pt-2 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-white/10 px-4 py-2 text-xs font-medium text-white/70 hover:bg-white/5"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={createTask.isPending}
            className="rounded-full bg-gradient-to-r from-brand to-brand-2 px-5 py-2 text-xs font-semibold text-black transition-all active:scale-[0.98] disabled:opacity-50 shadow-md"
          >
            {createTask.isPending ? 'Adding…' : 'Add task'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
