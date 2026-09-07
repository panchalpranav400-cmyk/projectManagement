import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import * as projectsApi from '../api/projects'
import * as guestApi from '../api/guestStore'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

function useSource() {
  const { guest } = useAuth()
  return { guest, source: guest ? guestApi : projectsApi }
}

function errorMessage(err: unknown, fallback: string) {
  if (isAxiosError(err) && err.response?.data?.error) return err.response.data.error as string
  if (err instanceof Error && err.message) return err.message
  return fallback
}

export function useProjects() {
  const { guest, source } = useSource()
  return useQuery({ queryKey: ['projects', guest], queryFn: source.fetchProjects })
}

export function useProject(id: number) {
  const { guest, source } = useSource()
  return useQuery({
    queryKey: ['projects', guest, id],
    queryFn: () => source.fetchProject(id),
    enabled: Number.isInteger(id),
  })
}

export function useProjectProgress(id: number) {
  const { guest, source } = useSource()
  return useQuery({
    queryKey: ['projects', guest, id, 'progress'],
    queryFn: () => source.fetchProjectProgress(id),
    enabled: Number.isInteger(id),
  })
}

export function useCreateProject() {
  const qc = useQueryClient()
  const { guest, source } = useSource()
  const { showToast } = useToast()
  return useMutation({
    mutationFn: source.createProject,
    onSuccess: (project) => {
      qc.invalidateQueries({ queryKey: ['projects', guest] })
      showToast(`Project "${project.name}" created`, 'success')
    },
    onError: (err) => showToast(errorMessage(err, 'Could not create project'), 'error'),
  })
}

export function useUpdateProject(id: number) {
  const qc = useQueryClient()
  const { guest, source } = useSource()
  const { showToast } = useToast()
  return useMutation({
    mutationFn: (input: Parameters<typeof projectsApi.updateProject>[1]) => source.updateProject(id, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['projects', guest] })
      qc.invalidateQueries({ queryKey: ['projects', guest, id] })
      showToast('Project updated', 'success')
    },
    onError: (err) => showToast(errorMessage(err, 'Could not update project'), 'error'),
  })
}

export function useDeleteProject() {
  const qc = useQueryClient()
  const { guest, source } = useSource()
  const { showToast } = useToast()
  return useMutation({
    mutationFn: source.deleteProject,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['projects', guest] })
      showToast('Project deleted', 'success')
    },
    onError: (err) => showToast(errorMessage(err, 'Could not delete project'), 'error'),
  })
}

export function useAddMember(projectId: number) {
  const qc = useQueryClient()
  const { guest, source } = useSource()
  const { showToast } = useToast()
  return useMutation({
    mutationFn: (email: string) => source.addMember(projectId, email),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['projects', guest, projectId] })
      showToast('Teammate invited', 'success')
    },
    onError: (err) => showToast(errorMessage(err, 'Could not add member'), 'error'),
  })
}

export function useRemoveMember(projectId: number) {
  const qc = useQueryClient()
  const { guest, source } = useSource()
  const { showToast } = useToast()
  return useMutation({
    mutationFn: (userId: string) => source.removeMember(projectId, userId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['projects', guest, projectId] })
      showToast('Member removed', 'success')
    },
    onError: (err) => showToast(errorMessage(err, 'Could not remove member'), 'error'),
  })
}
