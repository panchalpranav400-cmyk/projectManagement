import { useDraggable } from '@dnd-kit/core'
import { motion } from 'motion/react'
import { Clock, Trash2, GripVertical, Check, AlertCircle, ListChecks, MessageSquare, Tag } from 'lucide-react'
import { triggerConfetti } from '../lib/confetti'
import type { Task, TaskPriority } from '../types'

const PRIORITY_STYLES: Record<
  TaskPriority,
  { bg: string; text: string; dot: string; label: string }
> = {
  low: {
    bg: 'bg-emerald-500/10 border-emerald-500/20',
    text: 'text-emerald-300',
    dot: 'bg-emerald-400',
    label: 'Low',
  },
  medium: {
    bg: 'bg-amber-500/10 border-amber-500/20',
    text: 'text-amber-300',
    dot: 'bg-amber-400',
    label: 'Med',
  },
  high: {
    bg: 'bg-red-500/10 border-red-500/20',
    text: 'text-red-300',
    dot: 'bg-red-400',
    label: 'High',
  },
}

const TAG_COLORS: Record<string, string> = {
  'Bug': 'bg-rose-500/15 text-rose-300 border-rose-500/30',
  'Feature': 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
  'UI/UX': 'bg-purple-500/15 text-purple-300 border-purple-500/30',
  'Backend': 'bg-blue-500/15 text-blue-300 border-blue-500/30',
  'DevOps': 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  'Design': 'bg-pink-500/15 text-pink-300 border-pink-500/30',
  'Research': 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
}

interface CardBodyProps {
  task: Task
  overdue: boolean
  onDelete?: () => void
  onToggleDone?: (e: React.MouseEvent) => void
  onClick?: () => void
  dragHandleProps?: Record<string, unknown>
  ghost?: boolean
}

function CardBody({
  task,
  overdue,
  onDelete,
  onToggleDone,
  onClick,
  dragHandleProps,
  ghost,
}: CardBodyProps) {
  const isDone = task.status === 'done'
  const priority = PRIORITY_STYLES[task.priority] || PRIORITY_STYLES.medium

  const totalSubtasks = task.subtasks?.length ?? 0
  const completedSubtasks = task.subtasks?.filter((s) => s.completed).length ?? 0
  const commentsCount = task.comments?.length ?? 0

  return (
    <div
      onClick={onClick}
      className={`liquid-glass liquid-glass-hover group relative flex cursor-pointer flex-col gap-2.5 rounded-2xl p-3.5 border border-white/10 transition-all duration-200 ${
        ghost ? 'shadow-2xl shadow-brand/40 scale-105 border-brand-2/50' : ''
      } ${isDone ? 'bg-white/[0.01] opacity-75' : ''}`}
    >
      <div className="card-glare" />

      {/* Top row: Checkbox, Title, Drag handle */}
      <div className="flex items-start gap-2.5 min-w-0">
        {/* Interactive completion checkbox */}
        <button
          type="button"
          onClick={onToggleDone}
          title={isDone ? 'Mark as incomplete' : 'Mark as completed'}
          className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-md border transition-all duration-200 ${
            isDone
              ? 'bg-emerald-500 border-emerald-400 text-black shadow-[0_0_10px_rgba(16,185,129,0.4)]'
              : 'border-white/25 hover:border-brand-2 hover:bg-brand/10'
          }`}
        >
          {isDone && <Check className="h-3 w-3 stroke-[3]" />}
        </button>

        {/* Task Title & optional description preview */}
        <div className="min-w-0 flex-1">
          <p
            className={`text-sm font-medium leading-snug transition-all ${
              isDone ? 'line-through text-white/40' : 'text-white group-hover:text-white'
            }`}
          >
            {task.title}
          </p>
          {task.description && (
            <p className="mt-1 line-clamp-1 text-xs text-white/40">{task.description}</p>
          )}
        </div>

        {/* Drag handle */}
        <button
          {...dragHandleProps}
          onClick={(e) => e.stopPropagation()}
          className="shrink-0 cursor-grab touch-none p-0.5 text-white/20 hover:text-white active:cursor-grabbing"
          aria-label="Drag task"
          tabIndex={ghost ? -1 : 0}
        >
          <GripVertical className="h-4 w-4" />
        </button>
      </div>

      {/* Tags row */}
      {task.tags && task.tags.length > 0 && (
        <div className="flex flex-wrap items-center gap-1">
          {task.tags.map((tag) => {
            const colorClass = TAG_COLORS[tag] || 'bg-white/10 text-white/70 border-white/15'
            return (
              <span
                key={tag}
                className={`inline-flex items-center gap-0.5 rounded-full border px-2 py-0.2 text-[9px] font-medium tracking-wide ${colorClass}`}
              >
                <Tag className="h-2 w-2 opacity-60" />
                {tag}
              </span>
            )
          })}
        </div>
      )}

      {/* Subtasks progress bar if any */}
      {totalSubtasks > 0 && (
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[10px] text-white/40 font-mono">
            <span className="flex items-center gap-1">
              <ListChecks className="h-3 w-3 text-cyan-400" /> Subtasks
            </span>
            <span>
              {completedSubtasks}/{totalSubtasks} ({Math.round((completedSubtasks / totalSubtasks) * 100)}%)
            </span>
          </div>
          <div className="h-1 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full bg-gradient-to-r from-cyan-400 to-brand-2 transition-all duration-300"
              style={{ width: `${(completedSubtasks / totalSubtasks) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Bottom row: Priority pill, Due Date, Hours, Comments, Assignee & actions */}
      <div className="mt-1 flex items-center justify-between gap-2 pt-2 border-t border-white/5">
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          {/* Priority pill */}
          <span
            className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${priority.bg} ${priority.text}`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${priority.dot} ${
                task.priority === 'high' && !isDone ? 'animate-pulse' : ''
              }`}
            />
            {priority.label}
          </span>

          {/* Due date */}
          {task.dueDate && (
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium border ${
                overdue
                  ? 'border-red-500/30 bg-red-500/10 text-red-300 animate-pulse'
                  : 'border-white/10 bg-white/5 text-white/50'
              }`}
            >
              {overdue ? <AlertCircle className="h-2.5 w-2.5" /> : <Clock className="h-2.5 w-2.5" />}
              {new Date(task.dueDate).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
              })}
            </span>
          )}

          {/* Estimated / Logged Hours */}
          {task.estimatedHours && (
            <span
              title="Time tracking (logged / estimated hours)"
              className="inline-flex items-center gap-0.5 rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-white/50 font-mono"
            >
              <Clock className="h-2.5 w-2.5 text-amber-300" />
              {task.loggedHours ?? 0}/{task.estimatedHours}h
            </span>
          )}

          {/* Comments count */}
          {commentsCount > 0 && (
            <span
              title={`${commentsCount} comments`}
              className="inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] text-white/40 hover:text-white/70 transition-colors"
            >
              <MessageSquare className="h-2.5 w-2.5 text-brand-2" />
              {commentsCount}
            </span>
          )}
        </div>

        {/* Right side: Assignee avatar & hover actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          {task.assignee && (
            <span
              title={`Assigned to ${task.assignee.name}`}
              className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-tr from-brand to-brand-2 text-[10px] font-bold text-black ring-1 ring-white/20"
            >
              {task.assignee.name.slice(0, 1).toUpperCase()}
            </span>
          )}

          {/* Hover action: Delete */}
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onDelete()
              }}
              className="rounded-md p-1 text-white/0 transition-all group-hover:text-white/30 hover:!text-red-300 hover:bg-white/5"
              aria-label="Delete task"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function isOverdue(task: Task) {
  return Boolean(task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done')
}

export function TaskCard({
  task,
  onDelete,
  onStatusChange,
  onSelect,
}: {
  task: Task
  onDelete: () => void
  onStatusChange?: (taskId: number, newStatus: Task['status']) => void
  onSelect?: (task: Task) => void
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: task.id })

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined

  function handleToggleDone(e: React.MouseEvent) {
    e.stopPropagation()
    const nextStatus = task.status === 'done' ? 'todo' : 'done'
    if (nextStatus === 'done') {
      const rect = e.currentTarget.getBoundingClientRect()
      triggerConfetti(rect.left + rect.width / 2, rect.top)
    }
    onStatusChange?.(task.id, nextStatus)
  }

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: isDragging ? 0.35 : 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
    >
      <CardBody
        task={task}
        overdue={isOverdue(task)}
        onDelete={onDelete}
        onToggleDone={handleToggleDone}
        onClick={() => onSelect?.(task)}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </motion.div>
  )
}

/** Static ghost rendered inside DragOverlay */
export function TaskCardGhost({ task }: { task: Task }) {
  return (
    <motion.div
      initial={{ scale: 1.05, rotate: 2 }}
      animate={{ scale: 1.05, rotate: 2 }}
      className="cursor-grabbing"
    >
      <CardBody task={task} overdue={isOverdue(task)} ghost />
    </motion.div>
  )
}
