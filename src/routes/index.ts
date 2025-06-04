import express from 'express';
import userRoutes from './userRoutes';
import authRoutes from './authRoutes';
import wardrobeRoutes from './wardrobeRoutes';
import clothingRoutes from './clothingRoutes';
import outfitRoutes from './outfitRoutes';
import chatRoutes from './chatRoutes';
import aiRoutes from './aiRoutes';
import weatherRoutes from './weatherRoutes';
import databaseRoutes from './databaseRoutes';
import { authenticateUser } from '../middleware/auth';
import { generalRateLimit } from '../middleware/security';
import { testConnection, getDatabaseStats } from '../config/database';

const router = express.Router();

// Public health check
router.get('/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Fashion AI Backend is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Database health check
router.get('/health/database', async (req, res) => {
  try {
    const isConnected = await testConnection();
    const stats = await getDatabaseStats();
    
    res.json({
      success: true,
      database: {
        connected: isConnected,
        status: isConnected ? 'healthy' : 'unhealthy',
        stats: stats,
        mongodb_atlas: true
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      database: {
        connected: false,
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      timestamp: new Date().toISOString()
    });
  }
});

// Firebase health check
router.get('/health/firebase', (req, res) => {
  try {
    // Basic Firebase admin check
    const { auth } = require('../config/firebase');
    
    res.json({
      success: true,
      firebase: {
        status: 'healthy',
        adminSDK: auth ? 'connected' : 'disconnected'
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      firebase: {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      timestamp: new Date().toISOString()
    });
  }
});

// Apply rate limiting to all API routes
router.use('/api', generalRateLimit);

// Public routes (no authentication required)
router.use('/api/auth', authRoutes);

// AI routes - Mounted at /api directly for flexibility
// Some AI endpoints might not require authentication
router.use('/api', aiRoutes);

// Weather routes - Can be public for basic weather data
router.use('/api/weather', weatherRoutes);

// Protected routes (authentication required)
router.use('/api/users', authenticateUser, userRoutes);
router.use('/api/wardrobes', authenticateUser, wardrobeRoutes);
router.use('/api/clothing', authenticateUser, clothingRoutes);
router.use('/api/outfits', authenticateUser, outfitRoutes);
router.use('/api/chat', authenticateUser, chatRoutes);
router.use('/api/database', authenticateUser, databaseRoutes);

// 404 handler for API routes
router.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API route ${req.method} ${req.originalUrl} not found`,
    timestamp: new Date().toISOString()
  });
});

// Global 404 handler
router.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
    timestamp: new Date().toISOString()
  });
});

export default router;
