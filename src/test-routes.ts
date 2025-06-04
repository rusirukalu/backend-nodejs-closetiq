// test-routes.ts - Create this file in your src folder
import express from 'express';

const testRoute = (routeName: string, routePath: string) => {
  try {
    console.log(`Testing ${routeName}...`);
    const router = express.Router();
    
    // Try to import the route
    const routeModule = require(routePath);
    router.use('/', routeModule.default || routeModule);
    
    console.log(`✅ ${routeName} - OK`);
    return true;
  } catch (error) {
    console.error(`❌ ${routeName} - FAILED:`, (error as Error).message);
    return false;
  }
};

// Test each route file individually
console.log('🔍 Testing individual route files...\n');

testRoute('Auth Routes', './routes/authRoutes');
testRoute('User Routes', './routes/userRoutes');
testRoute('Wardrobe Routes', './routes/wardrobeRoutes');
testRoute('Clothing Routes', './routes/clothingRoutes');
testRoute('Outfit Routes', './routes/outfitRoutes');
testRoute('Chat Routes', './routes/chatRoutes');
testRoute('AI Routes', './routes/aiRoutes');
testRoute('Weather Routes', './routes/weatherRoutes');
testRoute('Database Routes', './routes/databaseRoutes');