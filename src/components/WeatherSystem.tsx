import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sun, Cloud, CloudRain, CloudSnow, Zap, 
  Thermometer, Droplets, Wind, Eye 
} from 'lucide-react';
import { WeatherData, WeatherCondition, WeatherEffect } from '../types';
import { useGameContext } from '../context/GameContext';
import { useGameNotifications } from '../hooks/useGameNotifications';
import './WeatherSystem.css';

class WeatherEngine {
  private static instance: WeatherEngine;
  
  public static getInstance(): WeatherEngine {
    if (!WeatherEngine.instance) {
      WeatherEngine.instance = new WeatherEngine();
    }
    return WeatherEngine.instance;
  }

  /**
   * Generate current weather condition
   */
  generateWeather(): WeatherCondition {
    const weatherTypes = ['sunny', 'cloudy', 'rainy', 'stormy', 'snowy'] as const;
    const weights = [30, 25, 20, 15, 10]; // Probability weights
    
    const randomValue = Math.random() * 100;
    let cumulative = 0;
    let selectedWeather = 'sunny' as const;
    
    for (let i = 0; i < weatherTypes.length; i++) {
      cumulative += weights[i];
      if (randomValue <= cumulative) {
        selectedWeather = weatherTypes[i];
        break;
      }
    }

    return {
      type: selectedWeather,
      temperature: this.generateTemperature(selectedWeather),
      humidity: this.generateHumidity(selectedWeather),
      timestamp: new Date(),
      duration: this.generateDuration(selectedWeather),
    };
  }

  /**
   * Calculate weather effects on gameplay
   */
  calculateWeatherEffects(weather: WeatherCondition): WeatherEffect[] {
    const effects: WeatherEffect[] = [];

    switch (weather.type) {
      case 'sunny':
        effects.push({
          type: 'mood',
          value: 15,
          isPercentage: true,
          description: 'Sunny weather boosts character happiness',
        });
        effects.push({
          type: 'productivity',
          value: 10,
          isPercentage: true,
          description: 'Clear skies increase work efficiency',
        });
        break;

      case 'cloudy':
        effects.push({
          type: 'mood',
          value: -5,
          isPercentage: true,
          description: 'Overcast skies slightly dampen mood',
        });
        effects.push({
          type: 'creativity',
          value: 20,
          isPercentage: true,
          description: 'Cloudy weather inspires creative thinking',
        });
        break;

      case 'rainy':
        effects.push({
          type: 'mood',
          value: -10,
          isPercentage: true,
          description: 'Rain makes characters feel gloomy',
        });
        effects.push({
          type: 'focus',
          value: 25,
          isPercentage: true,
          description: 'Rain helps with concentration',
        });
        effects.push({
          type: 'creativity',
          value: 15,
          isPercentage: true,
          description: 'Rainy atmosphere enhances creativity',
        });
        break;

      case 'stormy':
        effects.push({
          type: 'mood',
          value: -20,
          isPercentage: true,
          description: 'Storms create anxiety and stress',
        });
        effects.push({
          type: 'focus',
          value: 30,
          isPercentage: true,
          description: 'Storm intensity increases focus',
        });
        effects.push({
          type: 'productivity',
          value: -15,
          isPercentage: true,
          description: 'Loud thunder disrupts work',
        });
        break;

      case 'snowy':
        effects.push({
          type: 'mood',
          value: 5,
          isPercentage: true,
          description: 'Snow creates a peaceful atmosphere',
        });
        effects.push({
          type: 'productivity',
          value: -10,
          isPercentage: true,
          description: 'Cold weather slows down activities',
        });
        effects.push({
          type: 'creativity',
          value: 25,
          isPercentage: true,
          description: 'Winter wonder sparks imagination',
        });
        break;
    }

    // Temperature effects
    if (weather.temperature > 30) {
      effects.push({
        type: 'productivity',
        value: -10,
        isPercentage: true,
        description: 'High temperature reduces efficiency',
      });
    } else if (weather.temperature < 5) {
      effects.push({
        type: 'productivity',
        value: -15,
        isPercentage: true,
        description: 'Very cold weather hampers work',
      });
    }

    // Humidity effects
    if (weather.humidity > 80) {
      effects.push({
        type: 'mood',
        value: -8,
        isPercentage: true,
        description: 'High humidity creates discomfort',
      });
    }

    return effects;
  }

  /**
   * Generate forecast for next few periods
   */
  generateForecast(periods: number = 7): WeatherCondition[] {
    const forecast: WeatherCondition[] = [];
    let lastWeather = this.generateWeather();
    
    for (let i = 0; i < periods; i++) {
      if (i === 0) {
        forecast.push(lastWeather);
      } else {
        // Generate weather with some continuity
        const nextWeather = this.generateWeatherWithContinuity(lastWeather);
        forecast.push(nextWeather);
        lastWeather = nextWeather;
      }
    }

    return forecast;
  }

  private generateTemperature(weatherType: string): number {
    const baseTemps = {
      sunny: 25,
      cloudy: 20,
      rainy: 15,
      stormy: 18,
      snowy: 2,
    };
    
    const base = baseTemps[weatherType as keyof typeof baseTemps] || 20;
    return base + (Math.random() - 0.5) * 10;
  }

  private generateHumidity(weatherType: string): number {
    const baseHumidity = {
      sunny: 45,
      cloudy: 65,
      rainy: 85,
      stormy: 90,
      snowy: 70,
    };
    
    const base = baseHumidity[weatherType as keyof typeof baseHumidity] || 60;
    return Math.max(20, Math.min(100, base + (Math.random() - 0.5) * 20));
  }

  private generateDuration(weatherType: string): number {
    const baseDuration = {
      sunny: 8,
      cloudy: 6,
      rainy: 4,
      stormy: 2,
      snowy: 6,
    };
    
    return baseDuration[weatherType as keyof typeof baseDuration] || 6;
  }

  private generateWeatherWithContinuity(lastWeather: WeatherCondition): WeatherCondition {
    // Weather tends to persist or change gradually
    const continuityChance = 0.3;
    
    if (Math.random() < continuityChance) {
      // Continue similar weather
      return {
        ...lastWeather,
        timestamp: new Date(lastWeather.timestamp.getTime() + lastWeather.duration * 60 * 60 * 1000),
        temperature: lastWeather.temperature + (Math.random() - 0.5) * 5,
        humidity: Math.max(20, Math.min(100, lastWeather.humidity + (Math.random() - 0.5) * 20)),
      };
    } else {
      // Generate new weather
      return this.generateWeather();
    }
  }
}

interface WeatherDisplayProps {
  weather: WeatherCondition;
  effects: WeatherEffect[];
  className?: string;
}

const WeatherDisplay: React.FC<WeatherDisplayProps> = ({ weather, effects, className }) => {
  const getWeatherIcon = () => {
    switch (weather.type) {
      case 'sunny': return <Sun className="w-8 h-8 text-yellow-500" />;
      case 'cloudy': return <Cloud className="w-8 h-8 text-gray-500" />;
      case 'rainy': return <CloudRain className="w-8 h-8 text-blue-500" />;
      case 'stormy': return <Zap className="w-8 h-8 text-purple-500" />;
      case 'snowy': return <CloudSnow className="w-8 h-8 text-blue-200" />;
      default: return <Sun className="w-8 h-8" />;
    }
  };

  const getWeatherAnimation = () => {
    switch (weather.type) {
      case 'sunny':
        return {
          initial: { rotate: 0 },
          animate: { rotate: 360 },
          transition: { duration: 20, repeat: Infinity, ease: "linear" }
        };
      case 'rainy':
        return {
          initial: { y: -10 },
          animate: { y: 10 },
          transition: { duration: 1, repeat: Infinity, repeatType: "reverse" as const }
        };
      case 'stormy':
        return {
          initial: { scale: 1 },
          animate: { scale: [1, 1.1, 1] },
          transition: { duration: 0.5, repeat: Infinity }
        };
      default:
        return {};
    }
  };

  const getTemperatureColor = (temp: number) => {
    if (temp > 25) return 'text-red-500';
    if (temp < 10) return 'text-blue-500';
    return 'text-green-500';
  };

  return (
    <div className={`weather-display ${className || ''}`}>
      <div className="weather-main">
        <motion.div 
          className="weather-icon"
          {...getWeatherAnimation()}
        >
          {getWeatherIcon()}
        </motion.div>
        
        <div className="weather-info">
          <h3 className="weather-title">
            {weather.type.charAt(0).toUpperCase() + weather.type.slice(1)}
          </h3>
          
          <div className="weather-details">
            <div className="weather-stat">
              <Thermometer className="w-4 h-4" />
              <span className={getTemperatureColor(weather.temperature)}>
                {weather.temperature.toFixed(1)}°C
              </span>
            </div>
            
            <div className="weather-stat">
              <Droplets className="w-4 h-4" />
              <span>{weather.humidity.toFixed(0)}%</span>
            </div>
            
            <div className="weather-stat">
              <Eye className="w-4 h-4" />
              <span>{Math.floor(weather.duration)}h</span>
            </div>
          </div>
        </div>
      </div>

      {effects.length > 0 && (
        <div className="weather-effects">
          <h4>Current Effects:</h4>
          <div className="effects-list">
            {effects.map((effect, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`effect-item ${effect.value > 0 ? 'positive' : 'negative'}`}
              >
                <span className="effect-type">{effect.type}</span>
                <span className="effect-value">
                  {effect.value > 0 ? '+' : ''}{effect.value}
                  {effect.isPercentage ? '%' : ''}
                </span>
                <span className="effect-description">{effect.description}</span>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

interface WeatherForecastProps {
  forecast: WeatherCondition[];
}

const WeatherForecast: React.FC<WeatherForecastProps> = ({ forecast }) => {
  return (
    <div className="weather-forecast">
      <h4>7-Day Forecast</h4>
      <div className="forecast-grid">
        {forecast.map((weather, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="forecast-item"
          >
            <div className="forecast-day">
              {index === 0 ? 'Today' : `Day ${index + 1}`}
            </div>
            
            <div className="forecast-icon">
              {index === 0 ? <Sun className="w-6 h-6" /> :
               index === 1 ? <Cloud className="w-6 h-6" /> :
               index === 2 ? <CloudRain className="w-6 h-6" /> :
               <Sun className="w-6 h-6" />}
            </div>
            
            <div className="forecast-temp">
              {weather.temperature.toFixed(0)}°
            </div>
            
            <div className="forecast-type">
              {weather.type}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

const WeatherSystem: React.FC = () => {
  const { gameState, dispatch } = useGameContext();
  const { sendGameNotification } = useGameNotifications();
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [showForecast, setShowForecast] = useState(false);

  useEffect(() => {
    const weatherEngine = WeatherEngine.getInstance();
    
    // Initialize weather
    const currentWeather = weatherEngine.generateWeather();
    const forecast = weatherEngine.generateForecast();
    const effects = weatherEngine.calculateWeatherEffects(currentWeather);
    
    setWeatherData({
      current: currentWeather,
      forecast,
      effects,
    });

    // Set up weather change timer
    const weatherTimer = setInterval(() => {
      const newWeather = weatherEngine.generateWeather();
      const newForecast = weatherEngine.generateForecast();
      const newEffects = weatherEngine.calculateWeatherEffects(newWeather);
      
      setWeatherData(prev => ({
        current: newWeather,
        forecast: newForecast,
        effects: newEffects,
      }));

      // Notify about weather change
      sendGameNotification('weather_change', {
        weather: newWeather.type,
        effects: newEffects.length,
      });

      // Apply weather effects to game state
      dispatch({
        type: 'APPLY_WEATHER_EFFECTS',
        payload: { weather: newWeather, effects: newEffects }
      });

    }, 30 * 60 * 1000); // Change weather every 30 minutes

    return () => clearInterval(weatherTimer);
  }, [dispatch, sendGameNotification]);

  if (!weatherData) {
    return <div className="weather-loading">Loading weather...</div>;
  }

  return (
    <div className="weather-system">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="weather-widget"
      >
        <WeatherDisplay 
          weather={weatherData.current}
          effects={weatherData.effects}
        />
        
        <div className="weather-controls">
          <button
            className={`forecast-toggle ${showForecast ? 'active' : ''}`}
            onClick={() => setShowForecast(!showForecast)}
          >
            <Wind className="w-4 h-4" />
            {showForecast ? 'Hide' : 'Show'} Forecast
          </button>
        </div>
      </motion.div>

      <AnimatePresence>
        {showForecast && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="forecast-container"
          >
            <WeatherForecast forecast={weatherData.forecast} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WeatherSystem;
export { WeatherEngine };
