const supabaseAdmin = require('../lib/supabaseAdmin')

/**
 * Verifies the caller's Supabase access token by asking Supabase's Auth server
 * to validate it (works regardless of whether the project signs tokens with a
 * shared HS256 secret or asymmetric keys), rather than verifying the JWT locally.
 */
async function requireAuth(req, res, next) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null

  if (!token) {
    return res.status(401).json({ error: 'Missing bearer token' })
  }

  const { data, error } = await supabaseAdmin.auth.getUser(token)

  if (error || !data?.user) {
    return res.status(401).json({ error: 'Invalid or expired token' })
  }

  req.user = {
    id: data.user.id,
    email: data.user.email,
    name: data.user.user_metadata?.name,
  }
  next()
}

module.exports = { requireAuth }
