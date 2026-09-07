const prisma = require('../lib/prisma')

async function getMe(req, res, next) {
  try {
    let profile = await prisma.profile.findUnique({ where: { id: req.user.id } })
    if (!profile) {
      profile = await prisma.profile.create({
        data: {
          id: req.user.id,
          email: req.user.email,
          name: req.user.name || req.user.email.split('@')[0],
        },
      })
    }
    res.json(profile)
  } catch (err) {
    next(err)
  }
}

module.exports = { getMe }
