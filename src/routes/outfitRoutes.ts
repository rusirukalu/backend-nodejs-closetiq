import express from 'express';
import {
  generateOutfitRecommendations,
  saveOutfit,
  getUserOutfits,
  getOutfitById,
  updateOutfit,
  deleteOutfit,
  rateOutfit,
  shareOutfit
} from '../controllers/outfitController';
import {
  validateOutfitRequest,
  validateObjectId,
  validatePagination
} from '../middleware/validation';

const router = express.Router();

// Outfit recommendation endpoints
router.post('/generate', validateOutfitRequest, generateOutfitRecommendations);

// Outfit CRUD operations
router.post('/', saveOutfit);
router.get('/', validatePagination, getUserOutfits);
router.get('/:id', validateObjectId, getOutfitById);
router.put('/:id', validateObjectId, updateOutfit);
router.delete('/:id', validateObjectId, deleteOutfit);

// Outfit interactions
router.post('/:id/rate', validateObjectId, rateOutfit);
router.post('/:id/share', validateObjectId, shareOutfit);

export default router;
