import { useMemo, useState } from 'react'
import { motion } from 'motion/react'
import { Calendar as CalendarIcon, CheckCircle2, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react'
import type { Task, TaskStatus } from '../types'

interface Props {
  tasks: Task[]
  onSelectTask?: (task: Task) => void
}

const STATUS_CONFIG: Record<TaskStatus, { bg: string; border: string; text: string; label: string }> = {
  design: { bg: 'bg-purple-500/20', border: 'border-purple-500/40', text: 'text-purple-300', label: 'Design' },
  todo: { bg: 'bg-blue-500/20', border: 'border-blue-500/40', text: 'text-blue-300', label: 'To do' },
  in_progress: { bg: 'bg-amber-500/20', border: 'border-amber-500/40', text: 'text-amber-300', label: 'In progress' },
  done: { bg: 'bg-emerald-500/20', border: 'border-emerald-500/40', text: 'text-emerald-300', label: 'Done' },
}

export function TimelineView({ tasks, onSelectTask }: Props) {
  const [offsetDays, setOffsetDays] = useState(0)

  // Timeline window: 14 days centered around today + offset
  const timelineDays = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const days: Date[] = []
    for (let i = -2 + offsetDays; i < 12 + offsetDays; i++) {
      const d = new Date(today)
      d.setDate(today.getDate() + i)
      days.push(d)
    }
    return days
  }, [offsetDays])

  const startDate = timelineDays[0]
  const endDate = timelineDays[timelineDays.length - 1]
  const totalDays = timelineDays.length

  function getTaskBarCoordinates(task: Task) {
    const taskDue = task.dueDate ? new Date(task.dueDate) : new Date(task.createdAt)
    const taskStart = task.startDate ? new Date(task.startDate) : new Date(task.createdAt)
    taskDue.setHours(0, 0, 0, 0)
    taskStart.setHours(0, 0, 0, 0)

    const windowStartTime = startDate.getTime()
    const windowEndTime = endDate.getTime()
    const msPerDay = 24 * 60 * 60 * 1000

    // Clamp inside window
    const clampedStart = Math.max(windowStartTime, taskStart.getTime())
    const clampedEnd = Math.max(clampedStart, Math.min(windowEndTime + msPerDay, taskDue.getTime() + msPerDay))

    const leftPercent = Math.max(0, Math.min(100, ((clampedStart - windowStartTime) / (totalDays * msPerDay)) * 100))
    const widthPercent = Math.max(
      4,
      Math.min(100 - leftPercent, ((clampedEnd - clampedStart) / (totalDays * msPerDay)) * 100)
    )

    return { leftPercent, widthPercent }
  }

  const isToday = (d: Date) => {
    const now = new Date()
    return (
      d.getDate() === now.getDate() &&
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear()
    )
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-[#0c0d12]/80 backdrop-blur-xl overflow-hidden shadow-2xl">
      {/* Timeline Controls Header */}
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-3.5 bg-white/[0.02]">
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-4 w-4 text-brand-2" />
          <h3 className="text-sm font-bold text-white">Interactive Gantt Roadmap</h3>
          <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-white/50 font-mono">
            {tasks.length} tasks
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setOffsetDays((prev) => prev - 7)}
            className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-white/70 hover:bg-white/10 hover:text-white transition-all"
          >
            <ChevronLeft className="h-3.5 w-3.5" /> Previous Week
          </button>
          <button
            type="button"
            onClick={() => setOffsetDays(0)}
            className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-white/70 hover:bg-white/10 hover:text-white transition-all"
          >
            Today
          </button>
          <button
            type="button"
            onClick={() => setOffsetDays((prev) => prev + 7)}
            className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-white/70 hover:bg-white/10 hover:text-white transition-all"
          >
            Next Week <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Timeline Grid Container */}
      <div className="overflow-x-auto">
        <div className="min-w-[760px]">
          {/* Days Header */}
          <div className="grid grid-cols-[200px_1fr] border-b border-white/10 bg-white/[0.01]">
            <div className="p-3 text-xs font-semibold text-white/40 uppercase tracking-wider border-r border-white/10">
              Task Item
            </div>
            <div className="grid" style={{ gridTemplateColumns: `repeat(${totalDays}, minmax(0, 1fr))` }}>
              {timelineDays.map((day, i) => {
                const today = isToday(day)
                return (
                  <div
                    key={i}
                    className={`py-2.5 text-center text-xs border-r border-white/5 transition-colors ${
                      today ? 'bg-brand/10 text-brand-2 font-bold' : 'text-white/50'
                    }`}
                  >
                    <div className="text-[10px] uppercase font-mono">
                      {day.toLocaleDateString(undefined, { weekday: 'narrow' })}
                    </div>
                    <div className={`mt-0.5 font-mono ${today ? 'text-cyan-300 font-extrabold' : ''}`}>
                      {day.getDate()}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Task Rows */}
          <div className="divide-y divide-white/5">
            {tasks.length === 0 ? (
              <div className="py-12 text-center text-xs text-white/40 italic">
                No tasks to schedule in this timeline.
              </div>
            ) : (
              tasks.map((task) => {
                const { leftPercent, widthPercent } = getTaskBarCoordinates(task)
                const config = STATUS_CONFIG[task.status] || STATUS_CONFIG.todo
                const isOverdue =
                  task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done'

                return (
                  <div
                    key={task.id}
                    onClick={() => onSelectTask?.(task)}
                    className="grid grid-cols-[200px_1fr] hover:bg-white/[0.02] transition-colors cursor-pointer group py-2 items-center"
                  >
                    {/* Left title column */}
                    <div className="px-3 border-r border-white/10 flex items-center justify-between gap-2 min-w-0">
                      <div className="truncate text-xs font-medium text-white group-hover:text-brand-2 transition-colors">
                        {task.title}
                      </div>
                      {task.assignee && (
                        <span
                          title={task.assignee.name || task.assignee.email}
                          className="h-5 w-5 shrink-0 rounded-full bg-white/10 border border-white/15 flex items-center justify-center text-[10px] font-bold text-white/70"
                        >
                          {(task.assignee.name || task.assignee.email)[0].toUpperCase()}
                        </span>
                      )}
                    </div>

                    {/* Right Gantt bar track */}
                    <div className="relative h-9 px-2 flex items-center">
                      {/* Vertical today line */}
                      {timelineDays.map((day, idx) =>
                        isToday(day) ? (
                          <div
                            key={idx}
                            className="absolute top-0 bottom-0 w-px bg-cyan-400/40 z-0"
                            style={{ left: `${((idx + 0.5) / totalDays) * 100}%` }}
                          />
                        ) : null
                      )}

                      {/* Scheduled Bar */}
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        className={`absolute h-7 rounded-xl border px-2.5 flex items-center justify-between text-xs shadow-md z-10 ${config.bg} ${config.border} ${config.text}`}
                        style={{
                          left: `${leftPercent}%`,
                          width: `${widthPercent}%`,
                        }}
                      >
                        <span className="truncate font-semibold text-[11px] mr-1">
                          {task.title}
                        </span>
                        {task.status === 'done' ? (
                          <CheckCircle2 className="h-3 w-3 text-emerald-400 shrink-0" />
                        ) : isOverdue ? (
                          <AlertCircle className="h-3 w-3 text-red-400 shrink-0 animate-pulse" />
                        ) : (
                          <span className="text-[10px] font-mono opacity-60 shrink-0">
                            {config.label}
                          </span>
                        )}
                      </motion.div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
