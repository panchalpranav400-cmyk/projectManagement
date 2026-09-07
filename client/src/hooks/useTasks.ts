import { useMutation, useQueryClient, type QueryClient } from '@tanstack/react-query'
import * as tasksApi from '../api/tasks'
import * as guestApi from '../api/guestStore'
import type { Project } from '../types'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

function invalidateProject(qc: QueryClient, guest: boolean, projectId: number) {
  qc.invalidateQueries({ queryKey: ['projects', guest, projectId] })
  qc.invalidateQueries({ queryKey: ['projects', guest, projectId, 'progress'] })
  qc.invalidateQueries({ queryKey: ['projects', guest] })
}

function useSource() {
  const { guest } = useAuth()
  return { guest, source: guest ? guestApi : tasksApi }
}

export function useCreateTask(projectId: number) {
  const qc = useQueryClient()
  const { guest, source } = useSource()
  const { showToast } = useToast()
  return useMutation({
    mutationFn: (input: tasksApi.TaskInput) => source.createTask(projectId, input),
    onSuccess: () => {
      invalidateProject(qc, guest, projectId)
      showToast('Task added', 'success')
    },
    onError: () => showToast('Could not add task', 'error'),
  })
}

export function useUpdateTask(projectId: number) {
  const qc = useQueryClient()
  const { guest, source } = useSource()
  const { showToast } = useToast()
  return useMutation({
    mutationFn: ({ id, ...input }: Partial<tasksApi.TaskInput> & { id: number }) =>
      source.updateTask(id, input),
    onMutate: async (updated) => {
      await qc.cancelQueries({ queryKey: ['projects', guest, projectId] })
      const previous = qc.getQueryData<Project>(['projects', guest, projectId])
      if (previous?.tasks) {
        qc.setQueryData<Project>(['projects', guest, projectId], {
          ...previous,
          tasks: previous.tasks.map((t) => (t.id === updated.id ? { ...t, ...updated } : t)),
        })
      }
      return { previous }
    },
    onError: (_err, _updated, context) => {
      if (context?.previous) qc.setQueryData(['projects', guest, projectId], context.previous)
      showToast('Could not update task', 'error')
    },
    onSettled: () => invalidateProject(qc, guest, projectId),
  })
}

export function useDeleteTask(projectId: number) {
  const qc = useQueryClient()
  const { guest, source } = useSource()
  const { showToast } = useToast()
  return useMutation({
    mutationFn: source.deleteTask,
    onSuccess: () => {
      invalidateProject(qc, guest, projectId)
      showToast('Task deleted', 'success')
    },
    onError: () => showToast('Could not delete task', 'error'),
  })
}
