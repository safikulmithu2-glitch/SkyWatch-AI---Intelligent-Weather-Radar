import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import cors from "cors";
import { GoogleGenAI, Type } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  const ai = new GoogleGenAI({ 
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });

  app.post("/api/gemini/weather-insights", async (req, res) => {
    try {
      const { location } = req.body;
      const prompt = `Provide detailed current weather conditions, a 7-day forecast, and any active severe weather alerts for ${location}. 
  Include: temperature (Celsius), conditions, humidity, wind speed (km/h), wind gust (km/h, if any), wind direction (e.g., "N", "SW", "270°"), UV index, Air Quality Index (AQI as a number), pressure (hPa), visibility (km), feels like temperature, daily sunrise time, and daily sunset time.
  For each day in the 7-day forecast, include: high/low temp, general condition, daily high wind speed (km/h), daily low wind speed (km/h), and dominant wind direction.
  Also provide a unique AI insight or recommendation based on this specific weather pattern.
  Finally, provide a 'reliabilityScore' between 0 and 100 based on the complexity and certainty of the prediction.
  If the location is not a real place, return an empty array.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              location: { type: Type.STRING },
              current: {
                type: Type.OBJECT,
                properties: {
                  temp: { type: Type.NUMBER },
                  condition: { type: Type.STRING },
                  description: { type: Type.STRING },
                  humidity: { type: Type.NUMBER },
                  windSpeed: { type: Type.NUMBER },
                  windGust: { type: Type.NUMBER },
                  windDirection: { type: Type.STRING },
                  feelsLike: { type: Type.NUMBER },
                  uvIndex: { type: Type.NUMBER },
                  aqi: { type: Type.NUMBER },
                  sunrise: { type: Type.STRING },
                  sunset: { type: Type.STRING },
                  pressure: { type: Type.NUMBER },
                  visibility: { type: Type.NUMBER },
                },
                required: ["temp", "condition", "description", "humidity", "windSpeed", "feelsLike", "uvIndex", "aqi", "pressure", "visibility"]
              },
              forecast: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    day: { type: Type.STRING },
                    high: { type: Type.NUMBER },
                    low: { type: Type.NUMBER },
                    condition: { type: Type.STRING },
                    windSpeedHigh: { type: Type.NUMBER },
                    windSpeedLow: { type: Type.NUMBER },
                    windDirection: { type: Type.STRING },
                  },
                  required: ["day", "high", "low", "condition", "windSpeedHigh", "windSpeedLow", "windDirection"]
                }
              },
              aiInsights: { type: Type.STRING },
              reliabilityScore: { type: Type.NUMBER },
              alerts: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    description: { type: Type.STRING },
                    severity: { type: Type.STRING },
                    link: { type: Type.STRING }
                  },
                  required: ["title", "description", "severity"]
                }
              }
            },
            required: ["location", "current", "forecast", "aiInsights", "reliabilityScore"]
          }
        }
      });
      res.json(JSON.parse(response.text));
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/gemini/live-news", async (req, res) => {
    try {
      const { location } = req.body;
      const prompt = `Find the most recent and relevant live weather news, alerts, and environment updates for ${location}. 
  Focus on breaking news, storm alerts, or seasonal warnings from the last 24-48 hours.`;
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }]
        }
      });
      const sourceUrls = response.candidates?.[0]?.groundingMetadata?.groundingChunks
        ?.map(chunk => chunk.web?.uri)
        .filter((uri): uri is string => !!uri) || [];
      
      const newsPrompt = `Summarize the following weather news into a JSON array of objects with 'title', 'url', 'snippet', and 'source'. If URLs are missing, use the search grounding info provided.
    News data: ${response.text}`;
      const structuredResponse = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: newsPrompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                url: { type: Type.STRING },
                snippet: { type: Type.STRING },
                source: { type: Type.STRING }
              },
              required: ["title", "url", "snippet", "source"]
            }
          }
        }
      });
      res.json({ news: JSON.parse(structuredResponse.text), sourceUrls });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/gemini/historical-weather", async (req, res) => {
    try {
      const { location, date } = req.body;
      const searchPrompt = `What was the weather like in ${location} on ${date}? Find high/low temperatures, precipitation, and general conditions.`;
      const searchResponse = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: searchPrompt,
        config: { tools: [{ googleSearch: {} }] }
      });
      const sourceUrls = searchResponse.candidates?.[0]?.groundingMetadata?.groundingChunks
        ?.map(chunk => chunk.web?.uri)
        .filter((uri): uri is string => !!uri) || [];

      const extractionPrompt = `Convert the following weather information for ${location} on ${date} into a structured JSON object. 
    Include: highTemp (number), lowTemp (number), avgTemp (number), precipitation (string), conditions (string), summary (string), and sources (array of strings).
    Information to parse: ${searchResponse.text}`;
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: extractionPrompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              date: { type: Type.STRING },
              location: { type: Type.STRING },
              highTemp: { type: Type.NUMBER },
              lowTemp: { type: Type.NUMBER },
              avgTemp: { type: Type.NUMBER },
              precipitation: { type: Type.STRING },
              conditions: { type: Type.STRING },
              summary: { type: Type.STRING },
              sources: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              }
            },
            required: ["date", "location", "highTemp", "lowTemp", "avgTemp", "precipitation", "conditions", "summary"]
          }
        }
      });
      
      const data = JSON.parse(response.text);
      if (!data.sources || data.sources.length === 0) {
        data.sources = sourceUrls.slice(0, 3);
      }
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/gemini/radar", async (req, res) => {
    try {
      const { location } = req.body;
      const searchPrompt = `Find actual current radar data, precipitation intensity, and movement for ${location}. 
  Identify specific areas of rain, snow, or storms relative to the city center (e.g., '10 miles north-east', 'scattered showers to the west').`;
      const searchResponse = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: searchPrompt,
        config: { tools: [{ googleSearch: {} }] }
      });
      const extractionPrompt = `Based on this radar report: "${searchResponse.text}", 
    create a structured JSON object for a radar visualization.
    The 'echoes' should be an array of objects with: 
    - x: horizontal position from center (-100 to 100)
    - y: vertical position from center (-100 to 100)
    - intensity: 0 to 1 (0.2 for light, 0.9 for heavy)
    - type: 'rain', 'snow', 'hail', or 'storm'
    - size: diameter in pixels (10 to 80)
    Include a short text summary.`;
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: extractionPrompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              timestamp: { type: Type.STRING },
              summary: { type: Type.STRING },
              echoes: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    x: { type: Type.NUMBER },
                    y: { type: Type.NUMBER },
                    intensity: { type: Type.NUMBER },
                    type: { type: Type.STRING },
                    size: { type: Type.NUMBER }
                  },
                  required: ["x", "y", "intensity", "type", "size"]
                }
              }
            },
            required: ["timestamp", "summary", "echoes"]
          }
        }
      });
      res.json(JSON.parse(response.text));
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/gemini/suggest-locations", async (req, res) => {
    try {
      const { query } = req.body;
      const prompt = `Suggest up to 5 real locations (city and state/country) that match the search query: "${query}". Use Google Search to verify real locations if necessary. Do not include extra text. Return an array of strings.`;
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        }
      });
      res.json({ suggestions: JSON.parse(response.text) });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
