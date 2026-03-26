import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma.js';

export default async function auth(req, res, next) {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.id }
    });

    if (!user || user.isDeleted) {
      return res.status(401).json({ message: 'Account not found.' });
    }

    if (user.suspended) {
      return res.status(403).json({
        message: 'Your account has been suspended. Please contact support.'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth error:', error.message);
    return res.status(401).json({ message: 'Invalid token' });
  }
}
