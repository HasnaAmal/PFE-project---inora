import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma.js';

export const protect = async (req, res, next) => {
  try {
    let token = req.cookies?.token;
    
    // ✅ IMPORTANT: Read token from Authorization header (for localStorage)
    if (req.headers.authorization) {
      const authHeader = req.headers.authorization;
      if (authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
        console.log('✅ [protect] Token from Authorization header');
      }
    }
    
    // Fallback to cookie
    if (!token && req.cookies?.token) {
      token = req.cookies.token;
      console.log('✅ [protect] Token from cookie');
    }

    if (!token) {
      console.log('❌ [protect] No token found');
      return res.status(401).json({ message: 'No token provided' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('✅ [protect] Token verified for user:', decoded.id);
    
    // Get user
    const user = await prisma.user.findUnique({ 
      where: { id: decoded.id },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        isDeleted: true,
        suspended: true,
      }
    });

    if (!user || user.isDeleted) {
      return res.status(401).json({ message: 'Account not found.' });
    }

    if (user.suspended) {
      return res.status(403).json({ message: 'Account suspended.' });
    }

    req.user = user;
    next();
    
  } catch (error) {
    console.error('❌ [protect] Error:', error.message);
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    return res.status(401).json({ message: 'Invalid token' });
  }
};

export default protect;