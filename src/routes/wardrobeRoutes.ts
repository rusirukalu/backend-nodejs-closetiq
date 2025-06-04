import express from 'express';
import {
  createWardrobe,
  getUserWardrobes,
  getWardrobeById,
  updateWardrobe,
  deleteWardrobe,
  shareWardrobe,
  getSharedWardrobes
} from '../controllers/wardrobeController';
import {
  validateWardrobe,
  validateObjectId,
  validatePagination
} from '../middleware/validation';

const router = express.Router();

// Wardrobe CRUD operations
router.post('/', validateWardrobe, createWardrobe);
router.get('/', validatePagination, getUserWardrobes);
router.get('/shared', getSharedWardrobes);
router.get('/:id', validateObjectId, getWardrobeById);
router.put('/:id', validateObjectId, validateWardrobe, updateWardrobe);
router.delete('/:id', validateObjectId, deleteWardrobe);

// Wardrobe sharing
router.post('/:id/share', validateObjectId, shareWardrobe);

export default router;
