// index.js - Production Ready for Railway (FULLY FIXED)
import express from 'express';
import cors from 'cors';
import auth from './Routes/auth.js';
import cookieParser from 'cookie-parser';
import reviewRoutes from './Routes/reviews.js';
import dotenv from 'dotenv';
import { prisma } from './lib/prisma.js';

// Load environment variables FIRST
dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// CORS configuration
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      FRONTEND_URL,
      /\.railway\.app$/,
      /\.up\.railway\.app$/
    ];
    const isAllowed = allowedOrigins.some(allowed => {
      if (allowed instanceof RegExp) return allowed.test(origin);
      return allowed === origin;
    });
    if (isAllowed) {
      callback(null, true);
    } else {
      console.log('Blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Set-Cookie'],
  optionsSuccessStatus: 200
}));

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - Origin: ${req.get('origin') || 'No origin'}`);
  next();
});

// Health check endpoints
app.get('/', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Backend server is running on Railway',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    port: PORT
  });
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', auth);
app.use('/api/reviews', reviewRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  const message = process.env.NODE_ENV === 'production' 
    ? 'Internal server error' 
    : err.message;
  res.status(err.status || 500).json({
    success: false,
    message: message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
});

// Start server function
async function startServer() {
  try {
    console.log('🔄 Testing database connection...');
    console.log('📊 DATABASE_URL exists:', !!process.env.DATABASE_URL);
    
    await prisma.$connect();
    console.log('✅ Database connected successfully');

    const server = app.listen(PORT, '::', () => {
      console.log('=================================');
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🌍 Frontend URL: ${FRONTEND_URL}`);
      console.log(`🌐 IPv6: Listening on :: (all interfaces)`);
      console.log('=================================');
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('📦 SIGTERM received, closing server...');
      server.close(() => {
        console.log('🛑 Server closed');
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('❌ Failed to connect to database:', error);
    console.error('❌ Error details:', error.message);
    process.exit(1);
  }
}

// Start the server
startServer();

export default app;