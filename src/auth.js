const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'myflix-dev-secret-change-me';
function signToken(user) {
  return jwt.sign({ Username: user.Username, _id: user._id }, JWT_SECRET, { expiresIn: '7d' });
}
function auth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ message: 'Login required' });
  try { req.user = jwt.verify(token, JWT_SECRET); next(); }
  catch { return res.status(401).json({ message: 'Invalid or expired token' }); }
}
module.exports = { signToken, auth };
