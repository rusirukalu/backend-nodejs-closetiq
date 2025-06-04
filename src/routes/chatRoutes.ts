import express from 'express';
import {
  getChatSessions,
  createChatSession,
  getChatSessionById,
  sendMessage,
  deleteChatSession,
  getChatHistory
} from '../controllers/chatController';
import {
  validateChatMessage,
  validateObjectId,
  validatePagination
} from '../middleware/validation';

const router = express.Router();

// Chat session management
router.get('/sessions', validatePagination, getChatSessions);
router.post('/sessions', createChatSession);
router.get('/sessions/:id', validateObjectId, getChatSessionById);
router.delete('/sessions/:id', validateObjectId, deleteChatSession);

// Chat messaging
router.post('/sessions/:id/messages', validateObjectId, validateChatMessage, sendMessage);
router.get('/sessions/:id/history', validateObjectId, getChatHistory);

export default router;
