const express = require('express');
const bcrypt = require('bcryptjs');
const { signUserToken } = require('../lib/auth');
const { getUserByEmail, getUserById } = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

function publicUserView(user) {
  return {
    id: user.id,
    role: user.role,
    name: user.name,
    email: user.email,
    blocked: user.blocked,
    plan: user.plan,
    usageMinutes: user.usageMinutes,
    usageLimit: user.usageLimit,
    tenantId: user.tenantId,
  };
}

router.post('/login', async (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const user = await getUserByEmail(email);

  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  if (user.blocked) {
    return res.status(403).json({ error: 'Your account is blocked' });
  }

  const passwordValid = bcrypt.compareSync(String(password), user.passwordHash);
  if (!passwordValid) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = signUserToken(user);
  return res.json({ token, user: publicUserView(user) });
});

router.get('/me', requireAuth, async (req, res) => {
  const freshUser = await getUserById(req.user.id);

  if (!freshUser) {
    return res.status(404).json({ error: 'User not found' });
  }

  return res.json({ user: publicUserView(freshUser) });
});

module.exports = router;
