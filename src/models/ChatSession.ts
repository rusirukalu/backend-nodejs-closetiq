// src/models/ChatSession.ts - Chat Session Model
import mongoose, { Schema, Document } from 'mongoose';

export interface IChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface IChatSession extends Document {
  userId: string;
  sessionType: 'general' | 'style_advice' | 'outfit_help';
  title: string;
  messages: IChatMessage[];
  isActive: boolean;
  createdAt: Date;
  lastMessageAt: Date;
}

const ChatMessageSchema: Schema = new Schema({
  role: {
    type: String,
    enum: ['user', 'assistant'],
    required: true
  },
  content: {
    type: String,
    required: true,
    maxlength: 2000
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const ChatSessionSchema: Schema = new Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  sessionType: {
    type: String,
    enum: ['general', 'style_advice', 'outfit_help'],
    default: 'general'
  },
  title: {
    type: String,
    required: true,
    maxlength: 100
  },
  messages: [ChatMessageSchema],
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastMessageAt: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient queries
ChatSessionSchema.index({ userId: 1, lastMessageAt: -1 });
ChatSessionSchema.index({ userId: 1, isActive: 1 });

export default mongoose.model<IChatSession>('ChatSession', ChatSessionSchema);
