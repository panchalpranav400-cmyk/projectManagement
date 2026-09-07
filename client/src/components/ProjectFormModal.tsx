import { useState, type FormEvent } from 'react'
import { Modal } from './Modal'
import { useCreateProject } from '../hooks/useProjects'

export function ProjectFormModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const createProject = useCreateProject()

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    await createProject.mutateAsync({ name, description: description || undefined })
    setName('')
    setDescription('')
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title="New project">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-xs text-white/50">Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoFocus
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:ring-1 focus:ring-brand"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-white/50">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full resize-none rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:ring-1 focus:ring-brand"
          />
        </div>
        {createProject.isError && (
          <p className="text-xs text-red-300">Something went wrong. Try again.</p>
        )}
        <button
          type="submit"
          disabled={createProject.isPending}
          className="w-full rounded-full bg-white px-4 py-2 text-sm font-medium text-black transition-transform active:scale-[0.98] disabled:opacity-50"
        >
          {createProject.isPending ? 'Creating…' : 'Create project'}
        </button>
      </form>
    </Modal>
  )
}
