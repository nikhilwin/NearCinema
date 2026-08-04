import jwt from 'jsonwebtoken';

export const protect = (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'nearcinema_dev_secret_key_135792468');
    req.user = { id: decoded.id };
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Not authorized, invalid token' });
  }
};
