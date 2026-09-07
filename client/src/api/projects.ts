import { api } from './client'
import type { Project, ProjectProgress } from '../types'

export interface ProjectInput {
  name: string
  description?: string | null
}

export async function fetchProjects() {
  return (await api.get<Project[]>('/projects')).data
}

export async function fetchProject(id: number) {
  return (await api.get<Project>(`/projects/${id}`)).data
}

export async function fetchProjectProgress(id: number) {
  return (await api.get<ProjectProgress>(`/projects/${id}/progress`)).data
}

export async function createProject(input: ProjectInput) {
  return (await api.post<Project>('/projects', input)).data
}

export async function updateProject(id: number, input: Partial<ProjectInput>) {
  return (await api.patch<Project>(`/projects/${id}`, input)).data
}

export async function deleteProject(id: number) {
  await api.delete(`/projects/${id}`)
}

export async function addMember(projectId: number, email: string) {
  return (await api.post(`/projects/${projectId}/members`, { email })).data
}

export async function removeMember(projectId: number, userId: string) {
  await api.delete(`/projects/${projectId}/members/${userId}`)
}
