import { WeatherData, WeatherNews, HistoricalWeatherData, RadarSnapshot } from "../types";

async function fetchFromApi<T>(endpoint: string, body: any): Promise<T> {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || `HTTP error! status: ${response.status}`);
  }
  return response.json();
}

/**
 * Helper to call API with exponential backoff for rate limits.
 */
async function withRetry<T>(fn: () => Promise<T>, maxRetries = 3, initialDelay = 2000): Promise<T> {
  let lastError: any;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      const errorStr = error.message || JSON.stringify(error);
      const isRateLimit = errorStr.includes('429') || errorStr.includes('RESOURCE_EXHAUSTED');
      const isTransientError = errorStr.includes('500') || errorStr.includes('502') || errorStr.includes('503') || errorStr.includes('xhr error') || errorStr.includes('UNKNOWN');
      
      if ((isRateLimit || isTransientError) && i < maxRetries - 1) {
        const delay = initialDelay * Math.pow(2, i);
        console.warn(`API error (${errorStr}). Retrying in ${delay}ms... (Attempt ${i + 1} of ${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        throw error;
      }
    }
  }
  throw lastError;
}

export async function fetchWeatherInsights(location: string): Promise<WeatherData> {
  return withRetry(() => fetchFromApi<WeatherData>('/api/gemini/weather-insights', { location }));
}

export async function fetchLiveWeatherNews(location: string): Promise<{ news: WeatherNews[], sourceUrls: string[] }> {
  return withRetry(() => fetchFromApi<{ news: WeatherNews[], sourceUrls: string[] }>('/api/gemini/live-news', { location }));
}

export async function fetchHistoricalWeather(location: string, date: string): Promise<HistoricalWeatherData> {
  return withRetry(() => fetchFromApi<HistoricalWeatherData>('/api/gemini/historical-weather', { location, date }));
}

export async function fetchRadarSnapshot(location: string): Promise<RadarSnapshot> {
  return withRetry(() => fetchFromApi<RadarSnapshot>('/api/gemini/radar', { location }));
}

export async function fetchLocationSuggestions(query: string): Promise<string[]> {
  if (!query || query.trim() === '') return [];
  const res = await withRetry(() => fetchFromApi<{ suggestions: string[] }>('/api/gemini/suggest-locations', { query }));
  return res.suggestions || [];
}
