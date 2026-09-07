import { api } from './client'
import type { Task, TaskPriority, TaskStatus, Subtask, TaskComment } from '../types'

export interface TaskInput {
  title: string
  description?: string | null
  status?: TaskStatus
  priority?: TaskPriority
  assigneeId?: string | null
  dueDate?: string | null
  startDate?: string | null
  tags?: string[]
  subtasks?: Subtask[]
  comments?: TaskComment[]
  estimatedHours?: number | null
  loggedHours?: number | null
}

export async function createTask(projectId: number, input: TaskInput) {
  return (await api.post<Task>(`/projects/${projectId}/tasks`, input)).data
}

export async function updateTask(taskId: number, input: Partial<TaskInput>) {
  return (await api.patch<Task>(`/tasks/${taskId}`, input)).data
}

export async function deleteTask(taskId: number) {
  await api.delete(`/tasks/${taskId}`)
}
