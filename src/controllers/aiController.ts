import { Request, Response } from 'express';
import axios from 'axios';
import FormData from 'form-data';

// Flask AI service URL - adjust to your Flask app port
const FLASK_AI_URL = process.env.FLASK_AI_URL || 'http://localhost:5002';

export const classifyImage = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('=== CLASSIFY IMAGE ENDPOINT ===');
    console.log('File received:', req.file ? 'Yes' : 'No');
    
    if (!req.file) {
      res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
      return;
    }

    // Validate file type
    if (!req.file.mimetype.startsWith('image/')) {
      res.status(400).json({
        success: false,
        message: 'Only image files are allowed'
      });
      return;
    }

    console.log('Forwarding to Flask AI service...');

    // Forward to Flask AI service using axios
    const formData = new FormData();
    formData.append('image', req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype,
    });

    const flaskResponse = await axios.post(`${FLASK_AI_URL}/api/classify`, formData, {
      headers: {
        ...formData.getHeaders(),
      },
      timeout: 30000,
    });

    const aiResult = flaskResponse.data;
    console.log('AI classification result:', aiResult);

    // Validate Flask response structure
    if (!aiResult || !aiResult.success) {
      res.status(500).json({
        success: false,
        message: 'AI service returned invalid response',
        error: aiResult?.error || 'Invalid AI response'
      });
      return;
    }

    if (!aiResult.classification) {
      res.status(500).json({
        success: false,
        message: 'No classification data received from AI service',
        error: 'Missing classification data'
      });
      return;
    }

    // FIXED: Create the response data structure
    const classificationData = {
      success: true,
      classification: {
        predicted_class: aiResult.classification.predicted_class || 'unknown',
        confidence: aiResult.classification.confidence || 0,
        all_predictions: aiResult.classification.all_predictions || []
      },
      attributes: aiResult.attributes || {},
      image_quality: aiResult.image_quality || { overall_score: 0.5 },
      processing_time_ms: aiResult.processing_time_ms || 0,
      model_version: aiResult.model_version || '1.0',
      timestamp: aiResult.timestamp || new Date().toISOString()
    };

    console.log('✅ Sending response to frontend:', classificationData);

    // FIXED: Wrap in ApiResponse structure that frontend expects
    res.json({
      success: true,
      data: classificationData,  // ← This is the key fix!
      message: 'Image classified successfully'
    });

  } catch (error) {
    console.error('❌ Classification error:', error);
    
    // Check if it's an axios error
    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNREFUSED') {
        res.status(503).json({
          success: false,
          message: 'AI classification service is not available. Please ensure the Flask AI service is running.',
          error: 'Service unavailable'
        });
        return;
      }
      
      // If Flask returned an error response
      if (error.response?.data) {
        res.status(error.response.status || 500).json({
          success: false,
          message: 'AI service error',
          error: error.response.data.error || error.response.data.message || 'AI service error'
        });
        return;
      }
    }

    res.status(500).json({
      success: false,
      message: 'Failed to classify image',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const batchClassifyImages = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      res.status(400).json({
        success: false,
        message: 'No image files provided'
      });
      return;
    }

    // Forward each file to Flask AI service
    const formData = new FormData();
    req.files.forEach((file, index) => {
      formData.append('images', file.buffer, {
        filename: file.originalname,
        contentType: file.mimetype,
      });
    });

    const flaskResponse = await axios.post(`${FLASK_AI_URL}/api/classify/batch`, formData, {
      headers: {
        ...formData.getHeaders(),
      },
      timeout: 60000, // 60 second timeout for batch
    });

    // Pass through Flask response directly
    res.json(flaskResponse.data);

  } catch (error) {
    console.error('Batch classification error:', error);
    
    if (axios.isAxiosError(error) && error.code === 'ECONNREFUSED') {
      res.status(503).json({
        success: false,
        message: 'AI classification service is not available'
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: 'Failed to classify images',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const findSimilarItems = async (req: Request, res: Response): Promise<void> => {
  try {
    const { item_id, top_k = 5 } = req.body;

    const flaskResponse = await axios.post(`${FLASK_AI_URL}/api/similarity/search`, {
      item_id,
      top_k
    }, {
      timeout: 15000
    });

    res.json(flaskResponse.data);

  } catch (error) {
    console.error('Similarity search error:', error);
    
    if (axios.isAxiosError(error) && error.code === 'ECONNREFUSED') {
      // Fallback to mock data if Flask service is unavailable
      const mockSimilarItems = Array.from({ length: Math.min(req.body.top_k || 5, 5) }, (_, i) => ({
        id: `item_${req.body.item_id}_similar_${i + 1}`,
        similarity_score: Math.random() * 0.3 + 0.7,
        name: `Similar Item ${i + 1}`,
        category: 'clothing'
      }));

      res.json({
        success: true,
        results: mockSimilarItems,
        total: mockSimilarItems.length
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: 'Failed to find similar items',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const checkStyleCompatibility = async (req: Request, res: Response): Promise<void> => {
  try {
    const { item1_id, item2_id, context = 'general' } = req.body;

    const flaskResponse = await axios.post(`${FLASK_AI_URL}/api/compatibility/check`, {
      item1_id,
      item2_id,
      context
    }, {
      timeout: 15000
    });

    res.json(flaskResponse.data);

  } catch (error) {
    console.error('Compatibility check error:', error);
    
    if (axios.isAxiosError(error) && error.code === 'ECONNREFUSED') {
      // Mock compatibility if Flask unavailable
      const compatibility = {
        compatible: Math.random() > 0.3,
        score: Math.random(),
        reasons: ['color harmony', 'style matching'],
        context: req.body.context || 'general'
      };

      res.json({
        success: true,
        compatibility,
        item1_id: req.body.item1_id,
        item2_id: req.body.item2_id
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: 'Failed to check compatibility',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const analyzeItemAttributes = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
      return;
    }

    const formData = new FormData();
    formData.append('image', req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype,
    });

    const flaskResponse = await axios.post(`${FLASK_AI_URL}/api/attributes/analyze`, formData, {
      headers: {
        ...formData.getHeaders(),
      },
      timeout: 30000
    });

    res.json(flaskResponse.data);

  } catch (error) {
    console.error('Attribute analysis error:', error);
    
    if (axios.isAxiosError(error) && error.code === 'ECONNREFUSED') {
      // Mock attributes if Flask unavailable
      const attributes = {
        color: { primary: 'blue', secondary: 'white' },
        material: 'cotton',
        pattern: 'solid',
        style: 'casual',
        fit: 'regular',
        season: ['spring', 'summer'],
        occasions: ['casual', 'work']
      };

      res.json({
        success: true,
        attributes
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: 'Failed to analyze attributes',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getStyleRecommendations = async (req: Request, res: Response): Promise<void> => {
  try {
    const { base_item_id, context, limit = 5 } = req.body;

    const flaskResponse = await axios.post(`${FLASK_AI_URL}/api/style/recommendations`, {
      base_item_id,
      context,
      limit
    }, {
      timeout: 20000
    });

    res.json(flaskResponse.data);

  } catch (error) {
    console.error('Style recommendations error:', error);
    
    if (axios.isAxiosError(error) && error.code === 'ECONNREFUSED') {
      // Mock recommendations if Flask unavailable
      const recommendations = Array.from({ length: Math.min(req.body.limit || 5, 5) }, (_, i) => ({
        id: `rec_${i + 1}`,
        name: `Recommended Item ${i + 1}`,
        category: 'clothing',
        confidence: Math.random() * 0.3 + 0.7,
        reason: 'Style matching'
      }));

      res.json({
        success: true,
        recommendations,
        base_item_id: req.body.base_item_id,
        context: req.body.context
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: 'Failed to get style recommendations',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const queryKnowledgeGraph = async (req: Request, res: Response): Promise<void> => {
  try {
    const { type, params } = req.body;

    const flaskResponse = await axios.post(`${FLASK_AI_URL}/api/knowledge/query`, {
      type,
      params
    }, {
      timeout: 15000
    });

    res.json(flaskResponse.data);

  } catch (error) {
    console.error('Knowledge graph query error:', error);
    
    if (axios.isAxiosError(error) && error.code === 'ECONNREFUSED') {
      // Mock knowledge graph if Flask unavailable
      const mockResponse = {
        type: req.body.type,
        results: [
          { id: 'result_1', name: 'Fashion Trend 1', relevance: 0.9 },
          { id: 'result_2', name: 'Fashion Trend 2', relevance: 0.8 }
        ],
        params: req.body.params
      };

      res.json({
        success: true,
        ...mockResponse
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: 'Failed to query knowledge graph',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
