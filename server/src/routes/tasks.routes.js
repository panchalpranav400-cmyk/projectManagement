const express = require('express')
const { requireAuth } = require('../middleware/auth.middleware')
const { requireTaskMember } = require('../middleware/project.middleware')
const tasks = require('../controllers/tasks.controller')

const router = express.Router()
router.use(requireAuth)

router.patch('/:id', requireTaskMember, tasks.updateTask)
router.delete('/:id', requireTaskMember, tasks.deleteTask)

module.exports = router
