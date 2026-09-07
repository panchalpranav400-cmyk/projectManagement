const prisma = require('../lib/prisma')

/** Loads the :id project param, ensures the caller is a member, attaches req.projectId. */
async function requireProjectMember(req, res, next) {
  try {
    const projectId = Number(req.params.id)
    if (!Number.isInteger(projectId)) {
      return res.status(400).json({ error: 'Invalid project id' })
    }
    const membership = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId: req.user.id } },
    })
    if (!membership) {
      return res.status(403).json({ error: 'Not a member of this project' })
    }
    req.projectId = projectId
    req.membership = membership
    next()
  } catch (err) {
    next(err)
  }
}

/** Loads the :id task param, ensures the caller is a member of its project, attaches req.task. */
async function requireTaskMember(req, res, next) {
  try {
    const taskId = Number(req.params.id)
    if (!Number.isInteger(taskId)) {
      return res.status(400).json({ error: 'Invalid task id' })
    }
    const task = await prisma.task.findUnique({ where: { id: taskId } })
    if (!task) {
      return res.status(404).json({ error: 'Task not found' })
    }
    const membership = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId: task.projectId, userId: req.user.id } },
    })
    if (!membership) {
      return res.status(403).json({ error: 'Not a member of this project' })
    }
    req.task = task
    req.projectId = task.projectId
    next()
  } catch (err) {
    next(err)
  }
}

module.exports = { requireProjectMember, requireTaskMember }
