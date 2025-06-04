// src/services/aiService.ts
import axios, { AxiosResponse } from 'axios';
import FormData from 'form-data';
import fs from 'fs';

const AI_BACKEND_URL = process.env.AI_BACKEND_URL || 'http://localhost:5002';

export interface ClassificationResult {
  success: boolean;
  predicted_category: string;
  confidence: number;
  all_predictions: Array<{
    category: string;
    confidence: number;
    percentage: number;
  }>;
  quality_score: {
    score: string;
    value: number;
  };
  processing_time: number;
}

export interface SimilarityResult {
  success: boolean;
  similar_items: Array<{
    item_id: string;
    similarity_score: number;
    category: string;
  }>;
  total_found: number;
}

export interface OutfitRecommendation {
  success: boolean;
  outfits: Array<{
    items: string[];
    compatibility_score: number;
    style_score: number;
    recommendation_reason: string;
  }>;
  total_generated: number;
}

class AIService {
  private baseURL: string;
  private timeout: number;

  constructor() {
    this.baseURL = AI_BACKEND_URL;
    this.timeout = 30000; // 30 seconds
  }

  // Health check for AI backend
  async healthCheck(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.baseURL}/health`, {
        timeout: 5000
      });
      return response.data.success === true;
    } catch (error) {
      console.error('AI Backend health check failed:', error);
      return false;
    }
  }

  // Classify clothing item
  async classifyImage(imagePath: string): Promise<ClassificationResult> {
    try {
      const formData = new FormData();
      formData.append('file', fs.createReadStream(imagePath));

      const response: AxiosResponse<ClassificationResult> = await axios.post(
        `${this.baseURL}/api/classify`,
        formData,
        {
          headers: {
            ...formData.getHeaders(),
            'Content-Type': 'multipart/form-data',
          },
          timeout: this.timeout,
        }
      );

      return response.data;
    } catch (error) {
      console.error('AI classification error:', error);
      throw new Error('Failed to classify image');
    }
  }

  // Get similar items
  async findSimilarItems(
    itemId: string, 
    category: string, 
    topK: number = 5
  ): Promise<SimilarityResult> {
    try {
      const response: AxiosResponse<SimilarityResult> = await axios.post(
        `${this.baseURL}/api/similarity`,
        {
          item_id: itemId,
          category,
          top_k: topK
        },
        { timeout: this.timeout }
      );

      return response.data;
    } catch (error) {
      console.error('AI similarity search error:', error);
      throw new Error('Failed to find similar items');
    }
  }

  // Generate outfit recommendations
  async generateOutfits(
    userId: string,
    items: string[],
    occasion: string,
    season: string,
    weatherContext?: any
  ): Promise<OutfitRecommendation> {
    try {
      const response: AxiosResponse<OutfitRecommendation> = await axios.post(
        `${this.baseURL}/api/outfits/generate`,
        {
          user_id: userId,
          items,
          occasion,
          season,
          weather_context: weatherContext,
          count: 5
        },
        { timeout: this.timeout }
      );

      return response.data;
    } catch (error) {
      console.error('AI outfit generation error:', error);
      throw new Error('Failed to generate outfit recommendations');
    }
  }

  // Style compatibility check
  async checkCompatibility(
    item1Id: string,
    item2Id: string,
    context?: string
  ): Promise<any> {
    try {
      const response = await axios.post(
        `${this.baseURL}/api/compatibility`,
        {
          item1_id: item1Id,
          item2_id: item2Id,
          context
        },
        { timeout: this.timeout }
      );

      return response.data;
    } catch (error) {
      console.error('AI compatibility check error:', error);
      throw new Error('Failed to check style compatibility');
    }
  }

  // Get style recommendations
  async getStyleRecommendations(
    baseItemId: string,
    context?: string,
    limit: number = 5
  ): Promise<any> {
    try {
      const response = await axios.post(
        `${this.baseURL}/api/style/recommendations`,
        {
          base_item_id: baseItemId,
          context,
          limit
        },
        { timeout: this.timeout }
      );

      return response.data;
    } catch (error) {
      console.error('AI style recommendations error:', error);
      throw new Error('Failed to get style recommendations');
    }
  }

  // Advanced attribute analysis
  async analyzeAttributes(imagePath: string): Promise<any> {
    try {
      const formData = new FormData();
      formData.append('file', fs.createReadStream(imagePath));

      const response = await axios.post(
        `${this.baseURL}/api/attributes/analyze`,
        formData,
        {
          headers: formData.getHeaders(),
          timeout: this.timeout,
        }
      );

      return response.data;
    } catch (error) {
      console.error('AI attribute analysis error:', error);
      throw new Error('Failed to analyze item attributes');
    }
  }
}

export default new AIService();
