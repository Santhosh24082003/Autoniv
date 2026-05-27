const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'autoniv-dev-secret';

function signUserToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      role: user.role,
      tenantId: user.tenantId,
      email: user.email,
      name: user.name,
    },
    JWT_SECRET,
    { expiresIn: '7d' },
  );
}

function verifyUserToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

module.exports = {
  signUserToken,
  verifyUserToken,
};