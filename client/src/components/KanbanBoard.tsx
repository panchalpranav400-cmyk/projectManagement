import { useState } from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { AnimatePresence } from 'motion/react'
import { Plus, CheckCircle2, Clock, Trash2 } from 'lucide-react'
import { TaskCard, TaskCardGhost } from './TaskCard'
import { triggerConfetti } from '../lib/confetti'
import type { Task, TaskStatus } from '../types'

const COLUMNS: { status: TaskStatus; label: string; dot: string; glow: string }[] = [
  {
    status: 'design',
    label: 'Designs',
    dot: 'bg-purple-400',
    glow: 'rgba(192, 132, 252, 0.12)',
  },
  {
    status: 'todo',
    label: 'To do',
    dot: 'bg-white/40',
    glow: 'rgba(255, 255, 255, 0.05)',
  },
  {
    status: 'in_progress',
    label: 'In progress',
    dot: 'bg-amber-400',
    glow: 'rgba(251, 191, 36, 0.08)',
  },
  {
    status: 'done',
    label: 'Done',
    dot: 'bg-emerald-400',
    glow: 'rgba(52, 211, 153, 0.08)',
  },
]

interface Props {
  tasks: Task[]
  onStatusChange: (taskId: number, status: TaskStatus) => void
  onDelete: (taskId: number) => void
  onSelectTask?: (task: Task) => void
  onQuickAddTask?: (status: TaskStatus) => void
  viewMode?: 'kanban' | 'list'
}

function Column({
  status,
  label,
  dot,
  tasks,
  onDelete,
  onStatusChange,
  onSelectTask,
  onQuickAddTask,
}: {
  status: TaskStatus
  label: string
  dot: string
  tasks: Task[]
  onDelete: (id: number) => void
  onStatusChange: (id: number, status: TaskStatus) => void
  onSelectTask?: (task: Task) => void
  onQuickAddTask?: (status: TaskStatus) => void
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status })

  return (
    <div
      ref={setNodeRef}
      className={`flex min-h-[16rem] flex-1 flex-col gap-3 rounded-2xl border p-3.5 transition-all duration-200 min-w-[240px] ${
        isOver
          ? 'border-brand-2/60 bg-white/[0.06] shadow-[0_0_24px_var(--color-brand-glow)]'
          : 'border-white/10 bg-white/[0.015]'
      }`}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${dot}`} />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-white/60">{label}</h3>
          <span className="rounded-full bg-white/10 px-2 py-0.2 text-[11px] font-mono text-white/40">
            {tasks.length}
          </span>
        </div>

        {onQuickAddTask && (
          <button
            onClick={() => onQuickAddTask(status)}
            title={`Add task to ${label}`}
            className="flex h-6 w-6 items-center justify-center rounded-lg text-white/40 hover:bg-white/10 hover:text-white transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Column Tasks */}
      <div className="flex flex-1 flex-col gap-2.5">
        <AnimatePresence initial={false}>
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onDelete={() => onDelete(task.id)}
              onStatusChange={onStatusChange}
              onSelect={onSelectTask}
            />
          ))}
        </AnimatePresence>

        {tasks.length === 0 && (
          <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-white/10 p-6 text-center text-xs text-white/30">
            Drop task here
          </div>
        )}
      </div>
    </div>
  )
}

function TaskListView({
  tasks,
  onStatusChange,
  onDelete,
  onSelectTask,
}: {
  tasks: Task[]
  onStatusChange: (id: number, status: TaskStatus) => void
  onDelete: (id: number) => void
  onSelectTask?: (task: Task) => void
}) {
  return (
    <div className="liquid-glass overflow-hidden rounded-2xl border border-white/10">
      <div className="divide-y divide-white/5">
        {tasks.map((task) => {
          const isDone = task.status === 'done'
          return (
            <div
              key={task.id}
              onClick={() => onSelectTask?.(task)}
              className="flex items-center justify-between gap-4 p-4 hover:bg-white/[0.03] transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    const next = isDone ? 'todo' : 'done'
                    if (next === 'done') {
                      triggerConfetti(e.clientX, e.clientY)
                    }
                    onStatusChange(task.id, next)
                  }}
                  className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-md border ${
                    isDone
                      ? 'bg-emerald-500 border-emerald-400 text-black'
                      : 'border-white/30 hover:border-white'
                  }`}
                >
                  {isDone && <CheckCircle2 className="h-3 w-3" />}
                </button>
                <div className="min-w-0">
                  <p
                    className={`text-sm font-medium truncate ${
                      isDone ? 'line-through text-white/40' : 'text-white'
                    }`}
                  >
                    {task.title}
                  </p>
                  {task.description && (
                    <p className="text-xs text-white/40 truncate">{task.description}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span
                  className={`text-[11px] font-semibold uppercase px-2 py-0.5 rounded-full border ${
                    task.status === 'done'
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                      : task.status === 'in_progress'
                      ? 'bg-amber-500/10 border-amber-500/20 text-amber-300'
                      : 'bg-white/5 border-white/10 text-white/50'
                  }`}
                >
                  {task.status.replace('_', ' ')}
                </span>
                {task.dueDate && (
                  <span className="text-xs text-white/40 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {new Date(task.dueDate).toLocaleDateString()}
                  </span>
                )}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    onDelete(task.id)
                  }}
                  className="p-1 rounded text-white/30 hover:text-red-300 hover:bg-white/5 transition-colors"
                  title="Delete task"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function KanbanBoard({
  tasks,
  onStatusChange,
  onDelete,
  onSelectTask,
  onQuickAddTask,
  viewMode = 'kanban',
}: Props) {
  const [activeTask, setActiveTask] = useState<Task | null>(null)
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))

  function handleDragStart(event: DragStartEvent) {
    const task = tasks.find((t) => t.id === Number(event.active.id))
    setActiveTask(task ?? null)
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveTask(null)
    const { active, over } = event
    if (!over) return
    const taskId = Number(active.id)
    const newStatus = over.id as TaskStatus
    const task = tasks.find((t) => t.id === taskId)
    if (task && task.status !== newStatus) {
      if (newStatus === 'done') {
        triggerConfetti()
      }
      onStatusChange(taskId, newStatus)
    }
  }

  if (viewMode === 'list') {
    return (
      <TaskListView
        tasks={tasks}
        onStatusChange={onStatusChange}
        onDelete={onDelete}
        onSelectTask={onSelectTask}
      />
    )
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveTask(null)}
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 overflow-x-auto pb-4">
        {COLUMNS.map((col) => (
          <Column
            key={col.status}
            status={col.status}
            label={col.label}
            dot={col.dot}
            tasks={tasks.filter((t) => t.status === col.status)}
            onDelete={onDelete}
            onStatusChange={onStatusChange}
            onSelectTask={onSelectTask}
            onQuickAddTask={onQuickAddTask}
          />
        ))}
      </div>
      <DragOverlay>{activeTask ? <TaskCardGhost task={activeTask} /> : null}</DragOverlay>
    </DndContext>
  )
}
