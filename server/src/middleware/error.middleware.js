const { ZodError } = require('zod')

function notFound(req, res) {
  res.status(404).json({ error: 'Not found' })
}

function errorHandler(err, req, res, next) {
  if (err instanceof ZodError) {
    return res.status(400).json({ error: 'Validation failed', issues: err.issues })
  }
  if (err.code === 'P2002') {
    return res.status(409).json({ error: 'That record already exists' })
  }
  if (err.code === 'P2025') {
    return res.status(404).json({ error: 'Record not found' })
  }
  console.error(err)
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' })
}

module.exports = { notFound, errorHandler }
