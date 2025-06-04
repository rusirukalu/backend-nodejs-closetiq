// debug-server.ts - Create this in your src folder
import express from 'express';
import dotenv from 'dotenv';

console.log('🔍 Step-by-step server debugging...');

// Load environment variables
dotenv.config();
console.log('✅ Environment variables loaded');

const app = express();
console.log('✅ Express app created');

// Test each middleware one by one - uncomment one at a time to find the culprit

// Step 1: Basic middleware
app.use(express.json());
console.log('✅ Express JSON middleware added');

// Step 2: CORS (uncomment to test)
import cors from 'cors';
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
console.log('✅ CORS middleware added');

// Step 3: Helmet (uncomment to test)
import helmet from 'helmet';
app.use(helmet());
console.log('✅ Helmet middleware added');

// Step 4: Rate limiting (uncomment to test)
import rateLimit from 'express-rate-limit';
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);
console.log('✅ Rate limiting added');

// Step 5: Morgan (uncomment to test)
import morgan from 'morgan';
app.use(morgan('combined'));
console.log('✅ Morgan logging added');

// Step 6: Database connection (uncomment to test)
import connectDatabase from './config/database';
connectDatabase();
console.log('✅ Database connection initiated');

// Step 7: Custom middleware (uncomment to test)
import { generalRateLimit } from './middleware/security';
app.use('/api', generalRateLimit);
console.log('✅ Custom rate limiting added');

// Step 8: Auth middleware (uncomment to test)
import { authenticateUser } from './middleware/auth';
console.log('✅ Auth middleware loaded');

// Step 9: Individual routes (uncomment ONE at a time to test)
import authRoutes from './routes/authRoutes';
app.use('/api/auth', authRoutes);
console.log('✅ Auth routes added');

// Simple test route
app.get('/debug', (req, res) => {
  res.json({ 
    message: 'Debug server working!',
    timestamp: new Date().toISOString()
  });
});

const PORT = 3002;

try {
  const server = app.listen(PORT, () => {
    console.log(`🚀 Debug server running on port ${PORT}`);
    console.log(`Test it: http://localhost:${PORT}/debug`);
  });
} catch (error) {
  console.error('❌ Server failed to start:', error);
}

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});