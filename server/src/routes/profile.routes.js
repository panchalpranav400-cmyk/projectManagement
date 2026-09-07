const express = require('express')
const { requireAuth } = require('../middleware/auth.middleware')
const { getMe } = require('../controllers/profile.controller')

const router = express.Router()

router.get('/me', requireAuth, getMe)

module.exports = router
