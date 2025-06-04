import jwt from 'jsonwebtoken';

// Helper function to verify token from request body
const verifyTokenFromBody = (req: RequestWithBodyToken): { userId: string | null; error: string | null } => {
  try {
    // Extract token from body or FormData
    const token = req.body.bearerToken || req.bearerToken;
    
    if (!token) {
      return { userId: null, error: 'Bearer token is required' };
    }

    // Remove 'Bearer ' prefix if present
    const cleanToken = token.replace(/^Bearer\s+/i, '');
    
    // Verify the token
    const decoded = jwt.verify(cleanToken, process.env.JWT_SECRET || 'your-secret-key') as any;
    
    return { userId: decoded.userId || decoded.id, error: null };
  } catch (error) {
    console.error('Token verification error:', error);
    return { userId: null, error: 'Invalid or expired token' };
  }
};
