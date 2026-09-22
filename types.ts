
export interface WeatherData {
  location: string;
  current: {
    temp: number;
    condition: string;
    description: string;
    humidity: number;
    windSpeed: number;
    windGust?: number;
    windDirection?: string;
    feelsLike: number;
    uvIndex: number;
    aqi?: number;
    sunrise?: string;
    sunset?: string;
    pressure?: number;
    visibility?: number;
  };
  forecast: Array<{
    day: string;
    high: number;
    low: number;
    condition: string;
    windSpeedHigh: number;
    windSpeedLow: number;
    windDirection: string;
  }>;
  aiInsights: string;
  reliabilityScore: number;
  alerts?: Array<{
    title: string;
    description: string;
    severity: string;
    link?: string;
  }>;
}

export interface WeatherNews {
  title: string;
  url: string;
  snippet: string;
  source: string;
  date?: string;
}

export interface HistoricalWeatherData {
  date: string;
  location: string;
  highTemp: number;
  lowTemp: number;
  avgTemp: number;
  precipitation: string;
  conditions: string;
  summary: string;
  sources: string[];
}

export interface RadarEcho {
  x: number; // -100 to 100 relative to center
  y: number; // -100 to 100 relative to center
  intensity: number; // 0 to 1
  type: 'rain' | 'snow' | 'hail' | 'storm';
  size: number;
}

export interface RadarSnapshot {
  timestamp: string;
  echoes: RadarEcho[];
  summary: string;
}

export interface RadarData {
  intensity: number; // 0-100
  type: 'rain' | 'snow' | 'clear' | 'thunderstorm';
  coverage: number; // percentage
}
