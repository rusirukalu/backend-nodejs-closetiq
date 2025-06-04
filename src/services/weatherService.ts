// src/services/weatherService.ts - Weather API Service
import axios from 'axios';

interface WeatherData {
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  description: string;
  icon: string;
}

interface WeatherForecast {
  date: string;
  temperature: {
    min: number;
    max: number;
  };
  condition: string;
  description: string;
}

class WeatherService {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.WEATHER_API_KEY || '';
    this.baseUrl = 'https://api.openweathermap.org/data/2.5';
  }

  async getCurrentWeather(lat: number, lon: number): Promise<WeatherData> {
    try {
      const response = await axios.get(`${this.baseUrl}/weather`, {
        params: {
          lat,
          lon,
          appid: this.apiKey,
          units: 'metric'
        }
      });

      const data = response.data;
      
      return {
        temperature: Math.round(data.main.temp),
        condition: data.weather[0].main,
        humidity: data.main.humidity,
        windSpeed: data.wind.speed,
        description: data.weather[0].description,
        icon: data.weather[0].icon
      };
    } catch (error) {
      console.error('Weather API error:', error);
      throw new Error('Failed to fetch weather data');
    }
  }

  async getForecast(lat: number, lon: number): Promise<WeatherForecast[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/forecast`, {
        params: {
          lat,
          lon,
          appid: this.apiKey,
          units: 'metric'
        }
      });

      const data = response.data;
      
      // Group by date and get daily forecasts
      const dailyForecasts: WeatherForecast[] = [];
      const processedDates = new Set();

      data.list.forEach((item: any) => {
        const date = new Date(item.dt * 1000).toDateString();
        
        if (!processedDates.has(date)) {
          processedDates.add(date);
          dailyForecasts.push({
            date,
            temperature: {
              min: Math.round(item.main.temp_min),
              max: Math.round(item.main.temp_max)
            },
            condition: item.weather[0].main,
            description: item.weather[0].description
          });
        }
      });

      return dailyForecasts.slice(0, 5); // Return 5-day forecast
    } catch (error) {
      console.error('Weather forecast API error:', error);
      throw new Error('Failed to fetch weather forecast');
    }
  }

  async getWeatherByCity(cityName: string): Promise<WeatherData> {
    try {
      const response = await axios.get(`${this.baseUrl}/weather`, {
        params: {
          q: cityName,
          appid: this.apiKey,
          units: 'metric'
        }
      });

      const data = response.data;
      
      return {
        temperature: Math.round(data.main.temp),
        condition: data.weather[0].main,
        humidity: data.main.humidity,
        windSpeed: data.wind.speed,
        description: data.weather[0].description,
        icon: data.weather[0].icon
      };
    } catch (error) {
      console.error('Weather API error:', error);
      throw new Error('Failed to fetch weather data for city');
    }
  }

  async getWeatherBasedSuggestions(lat: number, lon: number): Promise<any> {
    try {
      const weather = await this.getCurrentWeather(lat, lon);
      
      // Generate clothing suggestions based on weather
      const suggestions = {
        temperature: weather.temperature,
        condition: weather.condition,
        suggestions: this.generateClothingSuggestions(weather)
      };

      return suggestions;
    } catch (error) {
      console.error('Weather suggestions error:', error);
      throw new Error('Failed to generate weather-based suggestions');
    }
  }

  private generateClothingSuggestions(weather: WeatherData): string[] {
    const suggestions: string[] = [];
    
    // Temperature-based suggestions
    if (weather.temperature < 10) {
      suggestions.push('Heavy coat or jacket', 'Warm sweater', 'Long pants', 'Closed shoes', 'Scarf and gloves');
    } else if (weather.temperature < 20) {
      suggestions.push('Light jacket or cardigan', 'Long sleeves', 'Jeans or long pants', 'Comfortable shoes');
    } else if (weather.temperature < 30) {
      suggestions.push('Light shirt or blouse', 'Light pants or jeans', 'Comfortable shoes');
    } else {
      suggestions.push('Lightweight clothing', 'Shorts or light dress', 'Sandals or breathable shoes', 'Sun hat');
    }

    // Condition-based suggestions
    if (weather.condition.toLowerCase().includes('rain')) {
      suggestions.push('Umbrella', 'Waterproof jacket', 'Water-resistant shoes');
    } else if (weather.condition.toLowerCase().includes('snow')) {
      suggestions.push('Waterproof boots', 'Insulated clothing', 'Hat and gloves');
    } else if (weather.condition.toLowerCase().includes('sun')) {
      suggestions.push('Sunglasses', 'Sun hat', 'Light colors');
    }

    return suggestions;
  }
}

export default new WeatherService();
