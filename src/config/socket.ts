import { Server as SocketIOServer } from 'socket.io';
import { Server } from 'http';
import { auth } from './firebase';
import User from '../models/User';
import ChatSession from '../models/ChatSession';
import { corsOptions } from '../middleware/security';

export interface AuthenticatedSocket {
  userId?: string;
  user?: any;
}

export const initializeSocket = (server: Server): SocketIOServer => {
  const io = new SocketIOServer(server, {
    cors: corsOptions,
    transports: ['websocket', 'polling']
  });

  // Authentication middleware for Socket.io
  io.use(async (socket: any, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication error'));
      }

      // Verify Firebase token
      const decodedToken = await auth.verifyIdToken(token);
      const user = await User.findOne({ firebaseUid: decodedToken.uid });
      
      if (!user || !user.isActive) {
        return next(new Error('User not found or inactive'));
      }

      socket.userId = user._id.toString();
      socket.user = decodedToken;
      
      next();
    } catch (error) {
      next(new Error('Authentication failed'));
    }
  });

  // Handle socket connections
  io.on('connection', (socket: any) => {
    console.log(`✅ User connected: ${socket.userId}`);
    
    // Join user to their personal room
    socket.join(`user_${socket.userId}`);

    // Handle chat message
    socket.on('chat_message', async (data: any) => {
      try {
        const { sessionId, content, sessionType = 'general' } = data;
        
        // Find or create chat session
        let chatSession = await ChatSession.findById(sessionId);
        
        if (!chatSession) {
          chatSession = new ChatSession({
            userId: socket.userId,
            sessionType,
            messages: [],
            isActive: true
          });
        }

        // Add user message
        chatSession.messages.push({
          role: 'user',
          content,
          timestamp: new Date()
        });

        chatSession.lastMessageAt = new Date();
        await chatSession.save();

        // Emit message back to user
        socket.emit('message_received', {
          sessionId: chatSession._id,
          message: {
            role: 'user',
            content,
            timestamp: new Date()
          }
        });

        // Generate AI response (placeholder)
        setTimeout(async () => {
          const aiResponse = await generateAIResponse(content, sessionType);
          
          chatSession!.messages.push({
            role: 'assistant',
            content: aiResponse,
            timestamp: new Date()
          });

          await chatSession!.save();

          socket.emit('ai_response', {
            sessionId: chatSession!._id,
            message: {
              role: 'assistant',
              content: aiResponse,
              timestamp: new Date()
            }
          });
        }, 1000);

      } catch (error) {
        console.error('Chat message error:', error);
        socket.emit('chat_error', { message: 'Failed to process message' });
      }
    });

    // Handle typing indicator
    socket.on('typing_start', () => {
      socket.broadcast.to(`user_${socket.userId}`).emit('user_typing', {
        userId: socket.userId,
        isTyping: true
      });
    });

    socket.on('typing_stop', () => {
      socket.broadcast.to(`user_${socket.userId}`).emit('user_typing', {
        userId: socket.userId,
        isTyping: false
      });
    });

    // Handle outfit recommendation requests
    socket.on('request_outfit_recommendation', async (data: any) => {
      try {
        socket.emit('outfit_generation_started', {
          message: 'Generating outfit recommendations...'
        });

        // This would integrate with AI service
        // const recommendations = await aiService.generateOutfits(...);
        
        // Simulate AI processing
        setTimeout(() => {
          socket.emit('outfit_recommendations', {
            recommendations: [
              // Sample recommendations
            ],
            generatedAt: new Date()
          });
        }, 3000);

      } catch (error) {
        socket.emit('outfit_error', { message: 'Failed to generate recommendations' });
      }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`❌ User disconnected: ${socket.userId}`);
    });
  });

  return io;
};

// AI Response Generation (placeholder)
async function generateAIResponse(message: string, sessionType: string): Promise<string> {
  // This would integrate with OpenAI API or your preferred AI service
  const responses = {
    style_advice: [
      "That's a great question about style! Based on current fashion trends, I'd recommend...",
      "For your style preferences, consider these combinations...",
      "Here are some styling tips that might help..."
    ],
    outfit_help: [
      "Let me help you put together a great outfit! Based on what you've described...",
      "For that occasion, I'd suggest these combinations...",
      "Here are some outfit ideas that would work perfectly..."
    ],
    general: [
      "I'm here to help with all your fashion needs! What would you like to know?",
      "That's an interesting question! Let me share some insights...",
      "I'd be happy to help you with that fashion query..."
    ]
  };

  const typeResponses = responses[sessionType as keyof typeof responses] || responses.general;
  return typeResponses[Math.floor(Math.random() * typeResponses.length)];
}
