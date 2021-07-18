const bcrypt = require('bcryptjs');
const { JWT_SECRET } = require('../secrets');
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const { password } = req.body;
  const user = req.user;
  if (user && bcrypt.compareSync(password, user.password)) {
    const token = buildToken(user);
    req.token = token;
    next();
  } else {
    res.status(401).json({ message: 'invalid credentials' });
  }
};

const buildToken = (user) => {
  const payload = {
    subject: user.id,
    username: user.username,
  };
  const config = {
    expiresIn: '1d',
  };
  return jwt.sign(payload, JWT_SECRET, config);
};