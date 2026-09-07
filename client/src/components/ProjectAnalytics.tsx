import { useMemo } from 'react'
import {
  TrendingUp,
  AlertTriangle,
  Clock,
  Users,
  FolderKanban,
  BarChart3,
  PieChart,
  ListChecks,
} from 'lucide-react'
import type { Task, ProjectMember, TaskStatus, TaskPriority } from '../types'

interface Props {
  tasks: Task[]
  members: ProjectMember[]
  progress: number
}

export function ProjectAnalytics({ tasks, members, progress }: Props) {
  const total = tasks.length
  const done = tasks.filter((t) => t.status === 'done').length
  const overdue = tasks.filter(
    (t) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'done'
  ).length

  // Status breakdown
  const statusCounts: Record<TaskStatus, number> = useMemo(() => {
    const counts: Record<TaskStatus, number> = { design: 0, todo: 0, in_progress: 0, done: 0 }
    tasks.forEach((t) => {
      counts[t.status] = (counts[t.status] || 0) + 1
    })
    return counts
  }, [tasks])

  // Priority breakdown
  const priorityCounts: Record<TaskPriority, number> = useMemo(() => {
    const counts: Record<TaskPriority, number> = { high: 0, medium: 0, low: 0 }
    tasks.forEach((t) => {
      counts[t.priority] = (counts[t.priority] || 0) + 1
    })
    return counts
  }, [tasks])

  // Workload by Assignee
  const workloadByMember = useMemo(() => {
    const map: Record<string, { name: string; total: number; done: number }> = {}

    // Initialize all members
    members.forEach((m) => {
      map[m.userId] = {
        name: m.user.name || m.user.email,
        total: 0,
        done: 0,
      }
    })

    // Add unassigned bucket
    map['unassigned'] = { name: 'Unassigned', total: 0, done: 0 }

    tasks.forEach((t) => {
      const key = t.assigneeId && map[t.assigneeId] ? t.assigneeId : 'unassigned'
      map[key].total += 1
      if (t.status === 'done') map[key].done += 1
    })

    return Object.values(map).filter((item) => item.total > 0 || item.name !== 'Unassigned')
  }, [tasks, members])

  // Total logged & estimated hours
  const totalEstimated = tasks.reduce((sum, t) => sum + (t.estimatedHours || 0), 0)
  const totalLogged = tasks.reduce((sum, t) => sum + (t.loggedHours || 0), 0)

  // Subtasks completion rate
  const allSubtasks = tasks.flatMap((t) => t.subtasks || [])
  const totalSubtasks = allSubtasks.length
  const completedSubtasks = allSubtasks.filter((s) => s.completed).length

  return (
    <div className="space-y-6">
      {/* Top 4 KPI Metrics Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Completion Progress */}
        <div className="liquid-glass rounded-2xl p-4 border border-white/10 relative overflow-hidden">
          <div className="card-glare" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-white/50 uppercase tracking-wider">Overall Velocity</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-3xl font-extrabold text-white font-mono">{progress}%</p>
          <p className="mt-1 text-xs text-white/40">{done} of {total} tasks completed</p>
        </div>

        {/* Total Tasks */}
        <div className="liquid-glass rounded-2xl p-4 border border-white/10 relative overflow-hidden">
          <div className="card-glare" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-white/50 uppercase tracking-wider">Total Backlog</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400">
              <BarChart3 className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-3xl font-extrabold text-white font-mono">{total}</p>
          <p className="mt-1 text-xs text-white/40">{statusCounts.in_progress} in active progress</p>
        </div>

        {/* Time Tracking */}
        <div className="liquid-glass rounded-2xl p-4 border border-white/10 relative overflow-hidden">
          <div className="card-glare" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-white/50 uppercase tracking-wider">Hours Logged</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-3xl font-extrabold text-white font-mono">{totalLogged}h</p>
          <p className="mt-1 text-xs text-white/40">{totalEstimated > 0 ? `${totalEstimated}h estimated budget` : 'No budget set'}</p>
        </div>

        {/* Overdue Alert */}
        <div className="liquid-glass rounded-2xl p-4 border border-white/10 relative overflow-hidden">
          <div className="card-glare" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-white/50 uppercase tracking-wider">Overdue Risk</span>
            <div className={`flex h-8 w-8 items-center justify-center rounded-xl ${overdue > 0 ? 'bg-red-500/15 text-red-400' : 'bg-emerald-500/15 text-emerald-400'}`}>
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <p className={`mt-2 text-3xl font-extrabold font-mono ${overdue > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
            {overdue}
          </p>
          <p className="mt-1 text-xs text-white/40">{overdue === 0 ? 'All deadlines on track' : 'Requires immediate triage'}</p>
        </div>
      </div>

      {/* Main Breakdown Row: Status Distribution & Priority Breakdown */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Status Distribution Breakdown */}
        <div className="liquid-glass rounded-2xl p-5 border border-white/10 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <FolderKanban className="h-4 w-4 text-brand-2" /> Workflow Status Distribution
            </h4>
            <span className="text-xs text-white/40 font-mono">{total} tasks</span>
          </div>

          <div className="space-y-3">
            {[
              { label: 'Designs & Specs', count: statusCounts.design, color: 'bg-purple-500', bar: 'from-purple-500 to-indigo-500' },
              { label: 'To Do', count: statusCounts.todo, color: 'bg-blue-500', bar: 'from-blue-500 to-cyan-500' },
              { label: 'In Progress', count: statusCounts.in_progress, color: 'bg-amber-500', bar: 'from-amber-500 to-orange-500' },
              { label: 'Completed', count: statusCounts.done, color: 'bg-emerald-500', bar: 'from-emerald-500 to-teal-500' },
            ].map((item) => {
              const pct = total === 0 ? 0 : Math.round((item.count / total) * 100)
              return (
                <div key={item.label} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2 text-white/70">
                      <span className={`h-2 w-2 rounded-full ${item.color}`} />
                      {item.label}
                    </span>
                    <span className="font-mono text-white/60">
                      {item.count} ({pct}%)
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${item.bar} transition-all duration-500`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Priority & Subtasks Breakdown */}
        <div className="liquid-glass rounded-2xl p-5 border border-white/10 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <PieChart className="h-4 w-4 text-purple-400" /> Priority & Checklists
            </h4>
            <span className="text-xs text-white/40 font-mono">{totalSubtasks} subtasks</span>
          </div>

          <div className="space-y-4">
            {/* Priority Bars */}
            <div className="space-y-2.5">
              <p className="text-[11px] font-semibold text-white/40 uppercase tracking-wider">Priority Breakdown</p>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-2.5">
                  <p className="text-[10px] uppercase font-semibold text-red-300">High</p>
                  <p className="text-xl font-bold font-mono text-white mt-0.5">{priorityCounts.high}</p>
                </div>
                <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-2.5">
                  <p className="text-[10px] uppercase font-semibold text-amber-300">Medium</p>
                  <p className="text-xl font-bold font-mono text-white mt-0.5">{priorityCounts.medium}</p>
                </div>
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-2.5">
                  <p className="text-[10px] uppercase font-semibold text-emerald-300">Low</p>
                  <p className="text-xl font-bold font-mono text-white mt-0.5">{priorityCounts.low}</p>
                </div>
              </div>
            </div>

            {/* Subtasks Completion Gauge */}
            <div className="pt-2 border-t border-white/5 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-white/70">
                  <ListChecks className="h-3.5 w-3.5 text-cyan-400" /> Subtask Checklist Velocity
                </span>
                <span className="font-mono text-white/50">
                  {completedSubtasks} / {totalSubtasks} done
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full bg-gradient-to-r from-cyan-400 to-brand-2 transition-all duration-500"
                  style={{ width: `${totalSubtasks === 0 ? 0 : (completedSubtasks / totalSubtasks) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Workload by Team Member */}
      <div className="liquid-glass rounded-2xl p-5 border border-white/10 space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <Users className="h-4 w-4 text-cyan-400" /> Team Workload & Allocation
          </h4>
          <span className="text-xs text-white/40 font-mono">{members.length} members</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {workloadByMember.map((m) => {
            const pct = m.total === 0 ? 0 : Math.round((m.done / m.total) * 100)
            return (
              <div key={m.name} className="rounded-xl border border-white/5 bg-white/[0.02] p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-white truncate">{m.name}</span>
                  <span className="text-[10px] font-mono text-white/40">{m.done}/{m.total} done</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full bg-gradient-to-r from-brand to-brand-2 transition-all duration-300"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
