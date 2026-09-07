/**
 * Local-only data source for "Continue without an account". Mirrors the shape of
 * api/projects.ts + api/tasks.ts so hooks can swap between the real API and this
 * one transparently. Data lives in localStorage — never leaves the browser.
 */
import type { Project, ProjectMember, ProjectProgress, Task } from '../types'
import type { ProjectInput } from './projects'
import type { TaskInput } from './tasks'

const STORAGE_KEY = 'flowboard.guest_data.v1'

interface GuestState {
  projects: Project[]
  nextProjectId: number
  nextTaskId: number
}

const GUEST_USER = {
  id: 'guest-local',
  name: 'Guest',
  email: 'guest@local',
  createdAt: new Date(0).toISOString(),
}

function emptyState(): GuestState {
  return { projects: [], nextProjectId: 1, nextTaskId: 1 }
}

function load(): GuestState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw) as GuestState
  } catch {
    // corrupt or blocked storage — fall through to a fresh state
  }
  return emptyState()
}

function save(state: GuestState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // storage unavailable (private mode, quota) — guest data just won't persist
  }
}

function computeProgress(project: Project): Project {
  const tasks = project.tasks ?? []
  const total = tasks.length
  const done = tasks.filter((t) => t.status === 'done').length
  const overdue = tasks.filter(
    (t) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'done',
  ).length
  return {
    ...project,
    taskCount: total,
    doneCount: done,
    overdueCount: overdue,
    progress: total === 0 ? 0 : Math.round((done / total) * 100),
  }
}

function requireProject(state: GuestState, id: number): Project {
  const project = state.projects.find((p) => p.id === id)
  if (!project) throw new Error('Project not found')
  return project
}

export async function fetchProjects(): Promise<Project[]> {
  return load().projects.map(computeProgress)
}

export async function fetchProject(id: number): Promise<Project> {
  return computeProgress(requireProject(load(), id))
}

export async function fetchProjectProgress(id: number): Promise<ProjectProgress> {
  const project = requireProject(load(), id)
  const tasks = project.tasks ?? []
  const statusCounts: ProjectProgress['statusCounts'] = { design: 0, todo: 0, in_progress: 0, done: 0 }
  let overdue = 0
  for (const t of tasks) {
    statusCounts[t.status] += 1
    if (t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'done') overdue += 1
  }
  const total = tasks.length
  return {
    total,
    done: statusCounts.done,
    progress: total === 0 ? 0 : Math.round((statusCounts.done / total) * 100),
    statusCounts,
    overdue,
  }
}

export async function createProject(input: ProjectInput): Promise<Project> {
  const state = load()
  const id = state.nextProjectId++
  const member: ProjectMember = {
    projectId: id,
    userId: GUEST_USER.id,
    role: 'owner',
    joinedAt: new Date().toISOString(),
    user: GUEST_USER,
  }
  const project = computeProgress({
    id,
    name: input.name,
    description: input.description ?? null,
    ownerId: GUEST_USER.id,
    createdAt: new Date().toISOString(),
    members: [member],
    tasks: [],
    taskCount: 0,
    doneCount: 0,
    overdueCount: 0,
    progress: 0,
  })
  state.projects.push(project)
  save(state)
  return project
}

export async function updateProject(id: number, input: Partial<ProjectInput>): Promise<Project> {
  const state = load()
  const project = requireProject(state, id)
  if (input.name !== undefined) project.name = input.name
  if (input.description !== undefined) project.description = input.description ?? null
  save(state)
  return computeProgress(project)
}

export async function deleteProject(id: number): Promise<void> {
  const state = load()
  state.projects = state.projects.filter((p) => p.id !== id)
  save(state)
}

export async function addMember(_projectId: number, _email: string): Promise<ProjectMember> {
  throw new Error('Inviting teammates requires a real account — sign up to collaborate.')
}

export async function removeMember(_projectId: number, _userId: string): Promise<void> {
  // no-op — the guest is always the only member
}

export async function createTask(projectId: number, input: TaskInput): Promise<Task> {
  const state = load()
  const project = requireProject(state, projectId)
  const task: Task = {
    id: state.nextTaskId++,
    projectId,
    title: input.title,
    description: input.description ?? null,
    status: input.status ?? 'todo',
    priority: input.priority ?? 'medium',
    assigneeId: input.assigneeId ?? null,
    assignee: input.assigneeId
      ? (project.members.find((m) => m.userId === input.assigneeId)?.user ?? null)
      : null,
    dueDate: input.dueDate ?? null,
    startDate: input.startDate ?? null,
    tags: input.tags ?? [],
    subtasks: input.subtasks ?? [],
    comments: input.comments ?? [],
    estimatedHours: input.estimatedHours ?? null,
    loggedHours: input.loggedHours ?? null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  project.tasks = [...(project.tasks ?? []), task]
  save(state)
  return task
}

export async function updateTask(taskId: number, input: Partial<TaskInput>): Promise<Task> {
  const state = load()
  for (const project of state.projects) {
    const task = project.tasks?.find((t) => t.id === taskId)
    if (task) {
      Object.assign(task, input, { updatedAt: new Date().toISOString() })
      save(state)
      return task
    }
  }
  throw new Error('Task not found')
}

export async function deleteTask(taskId: number): Promise<void> {
  const state = load()
  for (const project of state.projects) {
    if (project.tasks?.some((t) => t.id === taskId)) {
      project.tasks = project.tasks.filter((t) => t.id !== taskId)
      save(state)
      return
    }
  }
}
