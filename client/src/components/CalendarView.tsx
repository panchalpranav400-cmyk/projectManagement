import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react'
import type { Task, TaskStatus } from '../types'

interface Props {
  tasks: Task[]
  onSelectTask?: (task: Task) => void
}

const STATUS_DOT: Record<TaskStatus, string> = {
  design: 'bg-purple-400',
  todo: 'bg-blue-400',
  in_progress: 'bg-amber-400',
  done: 'bg-emerald-400',
}

export function CalendarView({ tasks, onSelectTask }: Props) {
  const [currentDate, setCurrentDate] = useState(new Date())

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  // First day of current month & total days
  const firstDayIndex = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const monthName = currentDate.toLocaleString('default', { month: 'long' })

  // Map tasks by day of month (YYYY-MM-DD)
  const tasksByDate = useMemo(() => {
    const map: Record<string, Task[]> = {}
    tasks.forEach((t) => {
      if (t.dueDate) {
        const dateKey = t.dueDate.split('T')[0]
        if (!map[dateKey]) map[dateKey] = []
        map[dateKey].push(t)
      }
    })
    return map
  }, [tasks])

  function prevMonth() {
    setCurrentDate(new Date(year, month - 1, 1))
  }

  function nextMonth() {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  function goToday() {
    setCurrentDate(new Date())
  }

  // Days grid: blank cells before 1st day + day cells
  const calendarCells = useMemo(() => {
    const cells: Array<{ day: number | null; dateStr: string | null; isToday: boolean }> = []
    const today = new Date()

    for (let i = 0; i < firstDayIndex; i++) {
      cells.push({ day: null, dateStr: null, isToday: false })
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
      const isToday =
        today.getDate() === d && today.getMonth() === month && today.getFullYear() === year

      cells.push({ day: d, dateStr, isToday })
    }

    return cells
  }, [firstDayIndex, daysInMonth, year, month])

  const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <div className="rounded-2xl border border-white/10 bg-[#0c0d12]/80 backdrop-blur-xl overflow-hidden shadow-2xl">
      {/* Calendar Header Toolbar */}
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-3.5 bg-white/[0.02]">
        <div className="flex items-center gap-2.5">
          <CalendarIcon className="h-4 w-4 text-brand-2" />
          <h3 className="text-sm font-bold text-white tracking-tight">
            {monthName} <span className="font-mono text-white/50">{year}</span>
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={prevMonth}
            className="p-1.5 rounded-lg border border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white transition-all"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={goToday}
            className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-white/70 hover:bg-white/10 hover:text-white transition-all"
          >
            Today
          </button>
          <button
            type="button"
            onClick={nextMonth}
            className="p-1.5 rounded-lg border border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white transition-all"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Weekday Labels Header */}
      <div className="grid grid-cols-7 border-b border-white/10 bg-white/[0.01]">
        {WEEKDAYS.map((wd) => (
          <div key={wd} className="py-2.5 text-center text-[11px] font-semibold uppercase tracking-wider text-white/40">
            {wd}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 divide-x divide-y divide-white/5 min-h-[480px]">
        {calendarCells.map((cell, idx) => {
          if (cell.day === null) {
            return <div key={idx} className="bg-white/[0.005] min-h-[90px]" />
          }

          const dayTasks = cell.dateStr ? tasksByDate[cell.dateStr] || [] : []

          return (
            <div
              key={idx}
              className={`p-2 min-h-[95px] flex flex-col justify-between transition-colors ${
                cell.isToday ? 'bg-cyan-500/[0.04]' : 'hover:bg-white/[0.015]'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span
                  className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-mono font-semibold ${
                    cell.isToday
                      ? 'bg-gradient-to-tr from-brand to-brand-2 text-black shadow-sm font-bold'
                      : 'text-white/60'
                  }`}
                >
                  {cell.day}
                </span>
                {dayTasks.length > 0 && (
                  <span className="text-[10px] text-white/40 font-mono">
                    {dayTasks.length} {dayTasks.length === 1 ? 'task' : 'tasks'}
                  </span>
                )}
              </div>

              {/* Day Tasks List */}
              <div className="space-y-1 overflow-y-auto max-h-20">
                {dayTasks.map((t) => {
                  const isDone = t.status === 'done'
                  const dotColor = STATUS_DOT[t.status] || 'bg-white/40'

                  return (
                    <div
                      key={t.id}
                      onClick={() => onSelectTask?.(t)}
                      className="group flex items-center gap-1.5 rounded-lg border border-white/5 bg-white/[0.03] px-2 py-1 cursor-pointer hover:border-brand-2/50 hover:bg-white/[0.08] transition-all"
                    >
                      <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${dotColor}`} />
                      <span
                        className={`truncate text-[11px] leading-tight ${
                          isDone ? 'line-through text-white/40' : 'text-white/80 group-hover:text-white'
                        }`}
                      >
                        {t.title}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
