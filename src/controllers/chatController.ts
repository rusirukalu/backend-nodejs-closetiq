// src/controllers/chatController.ts - Chat Management Controller
import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import ChatSession from '../models/ChatSession';

export const getChatSessions = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const totalSessions = await ChatSession.countDocuments({ userId: req.userId });
    
    const sessions = await ChatSession.find({ userId: req.userId })
      .sort({ lastMessageAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('sessionType title lastMessageAt isActive');

    res.json({
      success: true,
      data: {
        sessions,
        pagination: {
          total: totalSessions,
          page,
          limit,
          pages: Math.ceil(totalSessions / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get chat sessions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch chat sessions'
    });
  }
};

export const createChatSession = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { sessionType = 'general', title } = req.body;

    const chatSession = new ChatSession({
      userId: req.userId,
      sessionType,
      title: title || `${sessionType} session`,
      messages: [],
      isActive: true,
      createdAt: new Date(),
      lastMessageAt: new Date()
    });

    await chatSession.save();

    res.status(201).json({
      success: true,
      message: 'Chat session created successfully',
      data: chatSession
    });

  } catch (error) {
    console.error('Create chat session error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create chat session'
    });
  }
};

export const getChatSessionById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const chatSession = await ChatSession.findOne({
      _id: req.params.id,
      userId: req.userId
    });

    if (!chatSession) {
      res.status(404).json({
        success: false,
        message: 'Chat session not found or access denied'
      });
      return;
    }

    res.json({
      success: true,
      data: chatSession
    });

  } catch (error) {
    console.error('Get chat session error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch chat session'
    });
  }
};

export const sendMessage = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { content, sessionType } = req.body;
    const sessionId = req.params.id;

    let chatSession = await ChatSession.findOne({
      _id: sessionId,
      userId: req.userId
    });

    if (!chatSession) {
      res.status(404).json({
        success: false,
        message: 'Chat session not found or access denied'
      });
      return;
    }

    // Add user message
    chatSession.messages.push({
      role: 'user',
      content,
      timestamp: new Date()
    });

    chatSession.lastMessageAt = new Date();
    await chatSession.save();

    // Generate AI response (placeholder - would integrate with AI service)
    const aiResponse = generateAIResponse(content, sessionType);
    
    chatSession.messages.push({
      role: 'assistant',
      content: aiResponse,
      timestamp: new Date()
    });

    await chatSession.save();

    res.json({
      success: true,
      message: 'Message sent successfully',
      data: {
        userMessage: content,
        aiResponse,
        sessionId: chatSession._id
      }
    });

  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message'
    });
  }
};

export const deleteChatSession = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const chatSession = await ChatSession.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId
    });

    if (!chatSession) {
      res.status(404).json({
        success: false,
        message: 'Chat session not found or access denied'
      });
      return;
    }

    res.json({
      success: true,
      message: 'Chat session deleted successfully'
    });

  } catch (error) {
    console.error('Delete chat session error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete chat session'
    });
  }
};

export const getChatHistory = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const chatSession = await ChatSession.findOne({
      _id: req.params.id,
      userId: req.userId
    }).select('messages');

    if (!chatSession) {
      res.status(404).json({
        success: false,
        message: 'Chat session not found or access denied'
      });
      return;
    }

    res.json({
      success: true,
      data: {
        messages: chatSession.messages,
        totalMessages: chatSession.messages.length
      }
    });

  } catch (error) {
    console.error('Get chat history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch chat history'
    });
  }
};

// AI response generation (placeholder)
function generateAIResponse(message: string, sessionType: string): string {
  // This would integrate with your AI backend
  const responses = {
    style_advice: "Based on your question about style, I'd recommend...",
    outfit_help: "For outfit suggestions, consider these combinations...",
    general: "That's an interesting question! Let me help you with that..."
  };
  
  return responses[sessionType as keyof typeof responses] || responses.general;
}
