import { useState, useEffect, type FormEvent } from 'react'
import { Modal } from './Modal'
import { useUpdateTask, useDeleteTask } from '../hooks/useTasks'
import { triggerConfetti } from '../lib/confetti'
import { useAuth } from '../context/AuthContext'
import type { Task, ProjectMember, TaskPriority, TaskStatus, Subtask, TaskComment } from '../types'
import { Calendar, Trash2, User, Plus, Tag, Clock, ListChecks, MessageSquare, Send } from 'lucide-react'

interface Props {
  open: boolean
  onClose: () => void
  task: Task | null
  projectId: number
  members: ProjectMember[]
}

const AVAILABLE_TAGS = ['Feature', 'Bug', 'UI/UX', 'Backend', 'DevOps', 'Design', 'Research']

export function TaskDetailModal({ open, onClose, task, projectId, members }: Props) {
  const { user, guest } = useAuth()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<TaskPriority>('medium')
  const [status, setStatus] = useState<TaskStatus>('todo')
  const [assigneeId, setAssigneeId] = useState('')
  const [startDate, setStartDate] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [subtasks, setSubtasks] = useState<Subtask[]>([])
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('')
  const [estimatedHours, setEstimatedHours] = useState<number | ''>('')
  const [loggedHours, setLoggedHours] = useState<number | ''>('')
  const [comments, setComments] = useState<TaskComment[]>([])
  const [newCommentText, setNewCommentText] = useState('')

  const updateTask = useUpdateTask(projectId)
  const deleteTask = useDeleteTask(projectId)

  useEffect(() => {
    if (task) {
      setTitle(task.title || '')
      setDescription(task.description || '')
      setPriority(task.priority || 'medium')
      setStatus(task.status || 'todo')
      setAssigneeId(task.assigneeId || '')
      setStartDate(task.startDate ? task.startDate.split('T')[0] : '')
      setDueDate(task.dueDate ? task.dueDate.split('T')[0] : '')
      setTags(task.tags || [])
      setSubtasks(task.subtasks || [])
      setEstimatedHours(task.estimatedHours ?? '')
      setLoggedHours(task.loggedHours ?? '')
      setComments(task.comments || [])
    }
  }, [task])

  if (!task) return null

  function handleToggleTag(tag: string) {
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    )
  }

  function handleAddSubtask() {
    if (!newSubtaskTitle.trim()) return
    setSubtasks((prev) => [
      ...prev,
      { id: `st-${Date.now()}`, title: newSubtaskTitle.trim(), completed: false },
    ])
    setNewSubtaskTitle('')
  }

  function handleToggleSubtask(id: string) {
    setSubtasks((prev) =>
      prev.map((s) => (s.id === id ? { ...s, completed: !s.completed } : s))
    )
  }

  function handleDeleteSubtask(id: string) {
    setSubtasks((prev) => prev.filter((s) => s.id !== id))
  }

  function handleAddComment() {
    if (!newCommentText.trim()) return
    const authorName = user?.email ? user.email.split('@')[0] : guest ? 'Guest User' : 'Team Member'
    const newComment: TaskComment = {
      id: `comm-${Date.now()}`,
      authorName,
      authorEmail: user?.email,
      content: newCommentText.trim(),
      createdAt: new Date().toISOString(),
    }
    setComments((prev) => [...prev, newComment])
    setNewCommentText('')
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!task) return

    const wasDone = task.status === 'done'
    const isNowDone = status === 'done'

    await updateTask.mutateAsync({
      id: task.id,
      title,
      description: description || null,
      priority,
      status,
      assigneeId: assigneeId || null,
      startDate: startDate ? new Date(startDate).toISOString() : null,
      dueDate: dueDate ? new Date(dueDate).toISOString() : null,
      tags,
      subtasks,
      comments,
      estimatedHours: estimatedHours === '' ? null : Number(estimatedHours),
      loggedHours: loggedHours === '' ? null : Number(loggedHours),
    })

    if (!wasDone && isNowDone) {
      triggerConfetti()
    }

    onClose()
  }

  async function handleDelete() {
    if (!task) return
    if (confirm('Delete this task?')) {
      await deleteTask.mutateAsync(task.id)
      onClose()
    }
  }

  const completedSubtasksCount = subtasks.filter((s) => s.completed).length

  return (
    <Modal open={open} onClose={onClose} title="Task Details & Management">
      <form onSubmit={handleSubmit} className="space-y-4 max-h-[78vh] overflow-y-auto pr-1">
        {/* Title */}
        <div>
          <label className="mb-1 block text-xs font-medium text-white/50">Task Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm font-medium text-white outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all"
          />
        </div>

        {/* Description */}
        <div>
          <label className="mb-1 block text-xs font-medium text-white/50">Notes & Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            placeholder="Add extra context, specifications, or links..."
            className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-sm text-white placeholder-white/30 outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all resize-none"
          />
        </div>

        {/* Status & Priority */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-white/50">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as TaskStatus)}
              className="w-full rounded-xl border border-white/10 bg-[#16181d] px-3 py-2 text-xs sm:text-sm text-white outline-none focus:border-brand transition-all"
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
              className="w-full rounded-xl border border-white/10 bg-[#16181d] px-3 py-2 text-xs sm:text-sm text-white outline-none focus:border-brand transition-all"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>

        {/* Tags Selector */}
        <div>
          <label className="mb-1.5 flex items-center gap-1 text-xs font-medium text-white/50">
            <Tag className="h-3 w-3 text-brand-2" /> Tags & Labels
          </label>
          <div className="flex flex-wrap gap-1.5">
            {AVAILABLE_TAGS.map((tag) => {
              const isSelected = tags.includes(tag)
              return (
                <button
                  type="button"
                  key={tag}
                  onClick={() => handleToggleTag(tag)}
                  className={`rounded-full px-2.5 py-1 text-xs font-medium border transition-all ${
                    isSelected
                      ? 'bg-brand/20 border-brand text-brand-2 shadow-sm'
                      : 'border-white/10 bg-white/5 text-white/50 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {isSelected && '✓ '}
                  {tag}
                </button>
              )
            })}
          </div>
        </div>

        {/* Dates: Start Date & Due Date */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 flex items-center gap-1 text-xs font-medium text-white/50">
              <Calendar className="h-3 w-3" /> Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-[#16181d] px-3 py-2 text-xs sm:text-sm text-white outline-none focus:border-brand transition-all [color-scheme:dark]"
            />
          </div>

          <div>
            <label className="mb-1 flex items-center gap-1 text-xs font-medium text-white/50">
              <Calendar className="h-3 w-3" /> Due Date
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-[#16181d] px-3 py-2 text-xs sm:text-sm text-white outline-none focus:border-brand transition-all [color-scheme:dark]"
            />
          </div>
        </div>

        {/* Assignee & Time Tracking */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="mb-1 flex items-center gap-1 text-xs font-medium text-white/50">
              <User className="h-3 w-3" /> Assignee
            </label>
            <select
              value={assigneeId}
              onChange={(e) => setAssigneeId(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-[#16181d] px-3 py-2 text-xs sm:text-sm text-white outline-none focus:border-brand transition-all"
            >
              <option value="">Unassigned</option>
              {members.map((m) => (
                <option key={m.userId} value={m.userId}>
                  {m.user.name || m.user.email}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 flex items-center gap-1 text-xs font-medium text-white/50">
              <Clock className="h-3 w-3" /> Hours (Logged / Est)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                step="0.5"
                placeholder="Logged"
                value={loggedHours}
                onChange={(e) => setLoggedHours(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-1/2 rounded-xl border border-white/10 bg-[#16181d] px-2.5 py-2 text-xs text-white outline-none focus:border-brand font-mono"
              />
              <span className="text-white/30">/</span>
              <input
                type="number"
                min="0"
                step="0.5"
                placeholder="Estimated"
                value={estimatedHours}
                onChange={(e) => setEstimatedHours(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-1/2 rounded-xl border border-white/10 bg-[#16181d] px-2.5 py-2 text-xs text-white outline-none focus:border-brand font-mono"
              />
              <button
                type="button"
                onClick={() => setLoggedHours((prev) => (Number(prev) || 0) + 1)}
                title="Log +1 Hour"
                className="rounded-lg border border-white/15 bg-white/5 px-2 py-1.5 text-xs text-white/70 hover:bg-white/15 hover:text-white"
              >
                +1h
              </button>
            </div>
          </div>
        </div>

        {/* Subtasks / Checklist Section */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-3.5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs font-bold text-white">
              <ListChecks className="h-4 w-4 text-cyan-400" /> Subtasks Checklist
            </span>
            {subtasks.length > 0 && (
              <span className="text-xs font-mono text-white/40">
                {completedSubtasksCount}/{subtasks.length} ({Math.round((completedSubtasksCount / subtasks.length) * 100)}%)
              </span>
            )}
          </div>

          {/* Subtasks List */}
          <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
            {subtasks.map((st) => (
              <div
                key={st.id}
                className="flex items-center justify-between gap-2 rounded-xl border border-white/5 bg-white/[0.02] px-2.5 py-1.5 group hover:border-white/15 transition-all"
              >
                <label className="flex items-center gap-2 text-xs cursor-pointer min-w-0 flex-1">
                  <input
                    type="checkbox"
                    checked={st.completed}
                    onChange={() => handleToggleSubtask(st.id)}
                    className="rounded border-white/20 text-brand focus:ring-brand h-3.5 w-3.5 bg-black/40"
                  />
                  <span className={`truncate ${st.completed ? 'line-through text-white/40' : 'text-white/80'}`}>
                    {st.title}
                  </span>
                </label>
                <button
                  type="button"
                  onClick={() => handleDeleteSubtask(st.id)}
                  className="opacity-0 group-hover:opacity-100 text-white/30 hover:text-red-400 transition-opacity p-0.5"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>

          {/* Add Subtask Input */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Add a new checklist step..."
              value={newSubtaskTitle}
              onChange={(e) => setNewSubtaskTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleAddSubtask()
                }
              }}
              className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white placeholder-white/30 outline-none focus:border-brand"
            />
            <button
              type="button"
              onClick={handleAddSubtask}
              className="flex items-center gap-1 rounded-xl bg-white/10 hover:bg-white/20 px-3 py-1.5 text-xs font-semibold text-white transition-all"
            >
              <Plus className="h-3.5 w-3.5" /> Add
            </button>
          </div>
        </div>

        {/* Discussion / Comments Section */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-3.5 space-y-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-white">
            <MessageSquare className="h-4 w-4 text-purple-400" /> Activity & Discussion ({comments.length})
          </div>

          {/* Comment Stream */}
          <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
            {comments.length === 0 ? (
              <p className="text-xs text-white/30 italic">No comments yet. Start a discussion below.</p>
            ) : (
              comments.map((comm) => (
                <div key={comm.id} className="rounded-xl border border-white/5 bg-white/[0.03] p-2.5 space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-white/40">
                    <span className="font-semibold text-white/70">{comm.authorName}</span>
                    <span>{new Date(comm.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <p className="text-xs text-white/80 leading-relaxed">{comm.content}</p>
                </div>
              ))
            )}
          </div>

          {/* Add Comment Input */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Leave an update or comment..."
              value={newCommentText}
              onChange={(e) => setNewCommentText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleAddComment()
                }
              }}
              className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white placeholder-white/30 outline-none focus:border-brand"
            />
            <button
              type="button"
              onClick={handleAddComment}
              className="flex items-center gap-1 rounded-xl bg-purple-600/80 hover:bg-purple-600 px-3 py-1.5 text-xs font-semibold text-white transition-all"
            >
              <Send className="h-3 w-3" /> Send
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex items-center justify-between pt-4 border-t border-white/10">
          <button
            type="button"
            onClick={handleDelete}
            className="flex items-center gap-1.5 rounded-full border border-red-500/20 px-3 py-1.5 text-xs text-red-300 hover:bg-red-500/10 transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-white/10 px-4 py-1.5 text-xs font-medium text-white/70 hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updateTask.isPending}
              className="rounded-full bg-gradient-to-r from-brand to-brand-2 px-5 py-1.5 text-xs font-semibold text-black shadow-md hover:opacity-95 transition-all disabled:opacity-50"
            >
              {updateTask.isPending ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  )
}
