import express from 'express';
import multer from 'multer';
import {
  addClothingItem,
  getClothingItems,
  getClothingItemById,
  updateClothingItem,
  deleteClothingItem,
  classifyClothingItem,
  getSimilarItems,
  bulkUpdateItems
} from '../controllers/clothingController';
import {
  validateClothingItem,
  validateObjectId,
  validatePagination
} from '../middleware/validation';
import { uploadRateLimit } from '../middleware/security';

const router = express.Router();

// Configure multer for image uploads
const upload = multer({
  limits: {
    fileSize: 16 * 1024 * 1024, // 16MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Clothing item CRUD operations
router.post('/', upload.single('image'), uploadRateLimit, validateClothingItem, addClothingItem);
router.get('/', validatePagination, getClothingItems);
router.get('/:id', validateObjectId, getClothingItemById);
router.put('/:id', validateObjectId, validateClothingItem, updateClothingItem);
router.delete('/:id', validateObjectId, deleteClothingItem);

// AI-powered features
router.post('/:id/classify', validateObjectId, classifyClothingItem);
router.get('/:id/similar', validateObjectId, getSimilarItems);

// Bulk operations
router.patch('/bulk-update', bulkUpdateItems);

export default router;
