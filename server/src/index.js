require('dotenv').config()
const express = require('express')
const cors = require('cors')

const profileRoutes = require('./routes/profile.routes')
const projectsRoutes = require('./routes/projects.routes')
const tasksRoutes = require('./routes/tasks.routes')
const { notFound, errorHandler } = require('./middleware/error.middleware')

const app = express()

app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }))
app.use(express.json())

app.get('/api/health', (req, res) => res.json({ ok: true }))
app.use('/api/profile', profileRoutes)
app.use('/api/projects', projectsRoutes)
app.use('/api/tasks', tasksRoutes)

app.use(notFound)
app.use(errorHandler)

const port = process.env.PORT || 4000
app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`)
})
