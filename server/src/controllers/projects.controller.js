const { z } = require('zod')
const prisma = require('../lib/prisma')

const projectSchema = z.object({
  name: z.string().min(1).max(120),
  description: z.string().max(2000).optional().nullable(),
})

function withProgress(project) {
  const { tasks, ...rest } = project
  const total = tasks.length
  const done = tasks.filter((t) => t.status === 'done').length
  const overdue = tasks.filter(
    (t) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'done',
  ).length
  return {
    ...rest,
    taskCount: total,
    doneCount: done,
    overdueCount: overdue,
    progress: total === 0 ? 0 : Math.round((done / total) * 100),
  }
}

async function listProjects(req, res, next) {
  try {
    const projects = await prisma.project.findMany({
      where: { members: { some: { userId: req.user.id } } },
      orderBy: { createdAt: 'desc' },
      include: {
        tasks: { select: { status: true, dueDate: true } },
        members: { include: { user: true } },
      },
    })
    res.json(projects.map(withProgress))
  } catch (err) {
    next(err)
  }
}

async function createProject(req, res, next) {
  try {
    const data = projectSchema.parse(req.body)
    const project = await prisma.project.create({
      data: {
        ...data,
        ownerId: req.user.id,
        members: { create: { userId: req.user.id, role: 'owner' } },
      },
      include: { members: { include: { user: true } } },
    })
    res.status(201).json({ ...project, taskCount: 0, doneCount: 0, overdueCount: 0, progress: 0 })
  } catch (err) {
    next(err)
  }
}

async function getProject(req, res, next) {
  try {
    const project = await prisma.project.findUnique({
      where: { id: req.projectId },
      include: {
        members: { include: { user: true } },
        tasks: { include: { assignee: true }, orderBy: { createdAt: 'asc' } },
      },
    })
    if (!project) return res.status(404).json({ error: 'Project not found' })
    res.json(project)
  } catch (err) {
    next(err)
  }
}

async function updateProject(req, res, next) {
  try {
    const data = projectSchema.partial().parse(req.body)
    const project = await prisma.project.update({ where: { id: req.projectId }, data })
    res.json(project)
  } catch (err) {
    next(err)
  }
}

async function deleteProject(req, res, next) {
  try {
    if (req.membership.role !== 'owner') {
      return res.status(403).json({ error: 'Only the project owner can delete it' })
    }
    await prisma.project.delete({ where: { id: req.projectId } })
    res.status(204).send()
  } catch (err) {
    next(err)
  }
}

async function addMember(req, res, next) {
  try {
    const { email } = z.object({ email: z.string().email() }).parse(req.body)
    const profile = await prisma.profile.findUnique({ where: { email } })
    if (!profile) {
      return res.status(404).json({ error: 'No user found with that email — they need to sign up first' })
    }
    const member = await prisma.projectMember.create({
      data: { projectId: req.projectId, userId: profile.id, role: 'member' },
      include: { user: true },
    })
    res.status(201).json(member)
  } catch (err) {
    next(err)
  }
}

async function removeMember(req, res, next) {
  try {
    await prisma.projectMember.delete({
      where: { projectId_userId: { projectId: req.projectId, userId: req.params.userId } },
    })
    res.status(204).send()
  } catch (err) {
    next(err)
  }
}

async function getProgress(req, res, next) {
  try {
    const tasks = await prisma.task.findMany({
      where: { projectId: req.projectId },
      select: { status: true, dueDate: true },
    })
    const total = tasks.length
    const statusCounts = { todo: 0, in_progress: 0, done: 0 }
    let overdue = 0
    for (const t of tasks) {
      statusCounts[t.status] = (statusCounts[t.status] || 0) + 1
      if (t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'done') overdue += 1
    }
    res.json({
      total,
      done: statusCounts.done,
      progress: total === 0 ? 0 : Math.round((statusCounts.done / total) * 100),
      statusCounts,
      overdue,
    })
  } catch (err) {
    next(err)
  }
}

module.exports = {
  listProjects,
  createProject,
  getProject,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
  getProgress,
}
