const { z } = require('zod')
const prisma = require('../lib/prisma')

const taskCreateSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(4000).optional().nullable(),
  status: z.enum(['todo', 'in_progress', 'done']).optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  assigneeId: z.string().uuid().optional().nullable(),
  dueDate: z.string().datetime().optional().nullable(),
})

const taskUpdateSchema = taskCreateSchema.partial()

function toData(parsed) {
  const { dueDate, ...rest } = parsed
  return {
    ...rest,
    ...(dueDate !== undefined ? { dueDate: dueDate ? new Date(dueDate) : null } : {}),
  }
}

async function listTasks(req, res, next) {
  try {
    const tasks = await prisma.task.findMany({
      where: { projectId: req.projectId },
      include: { assignee: true },
      orderBy: { createdAt: 'asc' },
    })
    res.json(tasks)
  } catch (err) {
    next(err)
  }
}

async function createTask(req, res, next) {
  try {
    const parsed = taskCreateSchema.parse(req.body)
    const task = await prisma.task.create({
      data: { ...toData(parsed), projectId: req.projectId },
      include: { assignee: true },
    })
    res.status(201).json(task)
  } catch (err) {
    next(err)
  }
}

async function updateTask(req, res, next) {
  try {
    const parsed = taskUpdateSchema.parse(req.body)
    const task = await prisma.task.update({
      where: { id: req.task.id },
      data: toData(parsed),
      include: { assignee: true },
    })
    res.json(task)
  } catch (err) {
    next(err)
  }
}

async function deleteTask(req, res, next) {
  try {
    await prisma.task.delete({ where: { id: req.task.id } })
    res.status(204).send()
  } catch (err) {
    next(err)
  }
}

module.exports = { listTasks, createTask, updateTask, deleteTask }
