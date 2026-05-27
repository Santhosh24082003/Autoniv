const { verifyUserToken } = require('../lib/auth');
const { getUserById } = require('../db');

function getTokenFromRequest(req) {
  const header = req.headers.authorization || '';

  if (header.startsWith('Bearer ')) {
    return header.slice(7);
  }

  return null;
}

async function requireAuth(req, res, next) {
  const token = getTokenFromRequest(req);

  if (!token) {
    return res.status(401).json({ error: 'Missing authorization token' });
  }

  try {
    const payload = verifyUserToken(token);
    const user = await getUserById(payload.sub);

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    if (user.blocked) {
      return res.status(403).json({ error: 'User account is blocked' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
}

module.exports = {
  requireAuth,
  requireRole,
};