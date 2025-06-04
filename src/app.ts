// src/app.ts - Fixed Version with Multipart Support
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import dotenv from 'dotenv';
import routes from './routes';
import connectDatabase from './config/database';
import { errorHandler } from './middleware/errorHandler';

// Load environment variables
dotenv.config();

const app = express();

// Connect to database
connectDatabase();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// IMPORTANT: Only use JSON parsing for specific routes, not globally
// This prevents interference with multipart/form-data uploads

// Compression (before routes)
app.use(compression());

// Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined'));
}

// Add JSON parsing only for non-file upload routes
app.use('/api/auth', express.json({ limit: '10mb' }));
app.use('/api/users', express.json({ limit: '10mb' }));
app.use('/api/wardrobes', express.json({ limit: '10mb' }));
app.use('/api/clothing', express.json({ limit: '10mb' }));
app.use('/api/outfits', express.json({ limit: '10mb' }));
app.use('/api/chat', express.json({ limit: '10mb' }));
app.use('/api/weather', express.json({ limit: '10mb' }));
app.use('/api/database', express.json({ limit: '10mb' }));

// URL encoded parsing for forms (but not for file uploads)
app.use('/api/auth', express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/api/users', express.urlencoded({ extended: true, limit: '10mb' }));

// Routes - Mount all routes (AI routes will handle their own parsing)
app.use('/', routes);

// Error handling
app.use(errorHandler);

// 404 handler for unmatched routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`
  });
});

export default app;
