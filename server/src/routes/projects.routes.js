const express = require('express')
const { requireAuth } = require('../middleware/auth.middleware')
const { requireProjectMember } = require('../middleware/project.middleware')
const projects = require('../controllers/projects.controller')
const tasks = require('../controllers/tasks.controller')

const router = express.Router()
router.use(requireAuth)

router.get('/', projects.listProjects)
router.post('/', projects.createProject)

router.get('/:id', requireProjectMember, projects.getProject)
router.patch('/:id', requireProjectMember, projects.updateProject)
router.delete('/:id', requireProjectMember, projects.deleteProject)

router.post('/:id/members', requireProjectMember, projects.addMember)
router.delete('/:id/members/:userId', requireProjectMember, projects.removeMember)

router.get('/:id/progress', requireProjectMember, projects.getProgress)

router.get('/:id/tasks', requireProjectMember, tasks.listTasks)
router.post('/:id/tasks', requireProjectMember, tasks.createTask)

module.exports = router
