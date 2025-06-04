//src/routes/aiRoutes.ts
import express from 'express';
import axios from 'axios';
import FormData from 'form-data';
import {
  classifyImage,
  batchClassifyImages,
  findSimilarItems,
  checkStyleCompatibility,
  analyzeItemAttributes,
  getStyleRecommendations,
  queryKnowledgeGraph
} from '../controllers/aiController';
import {
  validateObjectId,
  validatePagination
} from '../middleware/validation';
import { uploadRateLimit } from '../middleware/security';
import multer from 'multer';

const router = express.Router();

// Configure multer for image uploads with memory storage
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage, // Explicitly set memory storage
  limits: {
    fileSize: 16 * 1024 * 1024, // 16MB limit
    files: 10, // Max 10 files for batch
  },
  fileFilter: (req, file, cb) => {
    console.log('=== MULTER FILEFILTER ===');
    console.log('Field name:', file.fieldname);
    console.log('Original name:', file.originalname);
    console.log('MIME type:', file.mimetype);
    console.log('========================');

    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Add debug middleware to log all requests
router.use((req, res, next) => {
  console.log(`=== AI ROUTE DEBUG ===`);
  console.log(`${req.method} ${req.path}`);
  console.log('Original URL:', req.originalUrl);
  console.log('Base URL:', req.baseUrl);
  console.log('Headers:', req.headers);
  console.log('Content-Type:', req.get('content-type'));
  console.log('Content-Length:', req.get('content-length'));
  console.log('======================');
  next();
});

// Test routes for debugging
router.get('/test', (req, res) => {
  res.json({ 
    success: true, 
    message: 'AI routes are working!',
    timestamp: new Date().toISOString(),
    baseUrl: req.baseUrl,
    originalUrl: req.originalUrl,
    path: req.path
  });
});

router.post('/test-upload', upload.single('image'), (req, res) => {
  console.log('=== UPLOAD TEST DEBUG ===');
  console.log('Headers:', req.headers);
  console.log('File:', req.file);
  console.log('Body:', req.body);
  console.log('========================');

  if (!req.file) {
    res.status(400).json({
      success: false,
      error: 'No file received in test upload',
      headers: req.headers,
      contentType: req.get('content-type'),
      fieldname: 'Expected: image'
    });
    return;
  }

  res.json({
    success: true,
    message: 'File upload test successful',
    file: {
      fieldname: req.file.fieldname,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size
    }
  });
});

// DEBUG CLASSIFY ROUTE - Added for troubleshooting
router.post('/debug-classify',
  upload.single('image'),
  async (req: express.Request, res: express.Response): Promise<void> => {
    try {
      console.log('🔍 DEBUG: Starting classification debug...');
      console.log('🔍 DEBUG: File received:', req.file ? 'YES' : 'NO');
      
      if (!req.file) {
        res.json({ 
          debug: true,
          error: 'No file provided',
          files_received: Object.keys(req.files || {}),
          body: req.body
        });
        return;
      }

      console.log('🔍 DEBUG: File details:', {
        fieldname: req.file.fieldname,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size
      });

      const formData = new FormData();
      formData.append('image', req.file.buffer, {
        filename: req.file.originalname,
        contentType: req.file.mimetype,
      });

      const flaskUrl = process.env.FLASK_AI_URL || 'http://localhost:5002';
      console.log('🔍 DEBUG: Forwarding to Flask at:', `${flaskUrl}/api/classify`);
      
      const flaskResponse = await axios.post(`${flaskUrl}/api/classify`, formData, {
        headers: {
          ...formData.getHeaders(),
        },
        timeout: 30000,
      });

      console.log('🔍 DEBUG: Flask response status:', flaskResponse.status);
      console.log('🔍 DEBUG: Flask response headers:', flaskResponse.headers);
      console.log('🔍 DEBUG: Flask response data:', JSON.stringify(flaskResponse.data, null, 2));

      // Return exactly what Flask returned plus debug info
      res.json({
        debug: true,
        success: true,
        flask_status: flaskResponse.status,
        flask_headers: flaskResponse.headers,
        flask_data: flaskResponse.data,
        file_info: {
          name: req.file.originalname,
          size: req.file.size,
          type: req.file.mimetype,
          fieldname: req.file.fieldname
        },
        request_info: {
          flask_url: flaskUrl,
          headers_sent: formData.getHeaders(),
          timestamp: new Date().toISOString()
        }
      });

    } catch (error: any) {
      console.error('🔍 DEBUG: Error occurred:', error);
      console.error('🔍 DEBUG: Error details:', {
        message: error.message,
        code: error.code,
        response_status: error.response?.status,
        response_data: error.response?.data
      });
      
      res.json({
        debug: true,
        success: false,
        error: error.message,
        error_code: error.code,
        flask_error: error.response?.data,
        flask_status: error.response?.status,
        error_details: {
          name: error.name,
          stack: error.stack,
          config: error.config ? {
            url: error.config.url,
            method: error.config.method,
            timeout: error.config.timeout
          } : null
        },
        file_info: req.file ? {
          name: req.file.originalname,
          size: req.file.size,
          type: req.file.mimetype
        } : null
      });
    }
  }
);

// Image classification endpoints
router.post('/classify', 
  (req, res, next) => {
    console.log('=== CLASSIFY ROUTE MIDDLEWARE ===');
    console.log('Before multer - Content-Type:', req.get('content-type'));
    console.log('Before multer - Content-Length:', req.get('content-length'));
    console.log('================================');
    next();
  },
  upload.single('image'), 
  (req, res, next) => {
    console.log('=== AFTER MULTER MIDDLEWARE ===');
    console.log('File received:', req.file ? 'YES' : 'NO');
    if (req.file) {
      console.log('File details:', {
        fieldname: req.file.fieldname,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size
      });
    }
    console.log('==============================');
    next();
  },
  uploadRateLimit, 
  classifyImage
);

router.post('/classify/batch', upload.array('images', 10), uploadRateLimit, batchClassifyImages);

// Similarity and recommendation endpoints
router.post('/similarity/find', findSimilarItems);
router.post('/compatibility/check', checkStyleCompatibility);
router.post('/attributes/analyze', upload.single('image'), analyzeItemAttributes);
router.post('/recommendations/style', getStyleRecommendations);

// Knowledge graph queries
router.post('/knowledge/query', queryKnowledgeGraph);

export default router;
