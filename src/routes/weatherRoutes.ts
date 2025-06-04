// src/routes/weatherRoutes.ts - Weather API Integration Routes (Fixed)
import express from 'express';
import {
  getCurrentWeather,
  getWeatherForecast,
  getWeatherByCity,
  getWeatherBasedRecommendations
} from '../controllers/weatherController';

const router = express.Router();

// Weather data endpoints
router.get('/current', getCurrentWeather);
router.get('/forecast', getWeatherForecast);
// Fixed: Changed from path parameter to query parameter to handle city names with spaces/special chars
router.get('/city', getWeatherByCity);

// Weather-based recommendations
router.post('/recommendations', getWeatherBasedRecommendations);

export default router;