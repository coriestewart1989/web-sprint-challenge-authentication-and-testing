const db = require('../../data/dbConfig');
module.exports = async (req, res, next) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(401).json({ message: 'username and password required' });
  }
  const userCheck = await db('users').where('username', username).first();
  if (!userCheck) {
    next();
  } else {
    return res.status(401).json({ message: 'username taken' });
  }
};