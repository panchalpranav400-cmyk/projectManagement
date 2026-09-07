export interface Profile {
  id: string
  name: string
  email: string
  createdAt: string
}

export interface ProjectMember {
  projectId: number
  userId: string
  role: 'owner' | 'member'
  joinedAt: string
  user: Profile
}

export type TaskStatus = 'design' | 'todo' | 'in_progress' | 'done'
export type TaskPriority = 'low' | 'medium' | 'high'

export interface Subtask {
  id: string
  title: string
  completed: boolean
}

export interface TaskComment {
  id: string
  authorName: string
  authorEmail?: string
  content: string
  createdAt: string
}

export interface Task {
  id: number
  projectId: number
  title: string
  description: string | null
  status: TaskStatus
  priority: TaskPriority
  assigneeId: string | null
  assignee: Profile | null
  dueDate: string | null
  startDate?: string | null
  tags?: string[]
  subtasks?: Subtask[]
  comments?: TaskComment[]
  estimatedHours?: number | null
  loggedHours?: number | null
  createdAt: string
  updatedAt: string
}

export interface Project {
  id: number
  name: string
  description: string | null
  ownerId: string
  createdAt: string
  members: ProjectMember[]
  tasks?: Task[]
  taskCount: number
  doneCount: number
  overdueCount: number
  progress: number
}

export interface ProjectProgress {
  total: number
  done: number
  progress: number
  statusCounts: Record<TaskStatus, number>
  overdue: number
}
