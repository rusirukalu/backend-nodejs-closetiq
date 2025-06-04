// src/controllers/weatherController.ts - Weather Service Controller (Fixed)
import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import weatherService from '../services/weatherService';

export const getCurrentWeather = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { lat, lon } = req.query;

    if (!lat || !lon) {
      res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required'
      });
      return;
    }

    const weather = await weatherService.getCurrentWeather(
      parseFloat(lat as string),
      parseFloat(lon as string)
    );

    res.json({
      success: true,
      data: weather,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Get current weather error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get current weather'
    });
  }
};

export const getWeatherForecast = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { lat, lon } = req.query;

    if (!lat || !lon) {
      res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required'
      });
      return;
    }

    const forecast = await weatherService.getForecast(
      parseFloat(lat as string),
      parseFloat(lon as string)
    );

    res.json({
      success: true,
      data: forecast,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Get weather forecast error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get weather forecast'
    });
  }
};

export const getWeatherByCity = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    // Fixed: Changed from req.params.cityName to req.query.city
    const { city } = req.query;

    if (!city) {
      res.status(400).json({
        success: false,
        message: 'City name is required as query parameter'
      });
      return;
    }

    const weather = await weatherService.getWeatherByCity(city as string);

    res.json({
      success: true,
      data: weather,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Get weather by city error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get weather for city'
    });
  }
};

export const getWeatherBasedRecommendations = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { lat, lon } = req.body;

    if (!lat || !lon) {
      res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required'
      });
      return;
    }

    const recommendations = await weatherService.getWeatherBasedSuggestions(lat, lon);

    res.json({
      success: true,
      data: recommendations,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Get weather recommendations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get weather-based recommendations'
    });
  }
};