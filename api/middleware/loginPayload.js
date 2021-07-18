module.exports = (req, res, next) => {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(401).json({ message: 'username and password required' });
    } else {
      next();
    }
  };