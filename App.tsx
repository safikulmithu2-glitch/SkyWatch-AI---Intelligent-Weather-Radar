
import React, { useState, useEffect, useCallback } from 'react';
import { Search, MapPin, AlertTriangle, CloudRain, RefreshCw, Info, User, Settings, LogOut, Facebook, Instagram, Youtube, Twitter, Mic } from 'lucide-react';
import { fetchWeatherInsights, fetchLiveWeatherNews, fetchRadarSnapshot, fetchLocationSuggestions } from './services/gemini';
import { WeatherData, WeatherNews, RadarSnapshot } from './types';
import WeatherCard from './components/WeatherCard';
import QuickSummary from './components/QuickSummary';
import WeatherRadar from './components/WeatherRadar';
import NewsPanel from './components/NewsPanel';
import ForecastChart from './components/ForecastChart';
import HistoricalPanel from './components/HistoricalPanel';
import AIInsightsPanel from './components/AIInsightsPanel';
import AuthModal from './components/AuthModal';
import SettingsModal from './components/SettingsModal';
import { auth } from './services/firebase';
import { onAuthStateChanged, signOut, User as FirebaseUser } from 'firebase/auth';

const App: React.FC = () => {
  const [location, setLocation] = useState<string>('London, UK');
  const [searchInput, setSearchInput] = useState<string>('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [news, setNews] = useState<WeatherNews[]>([]);
  const [radarSnapshot, setRadarSnapshot] = useState<RadarSnapshot | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isQuotaExceeded, setIsQuotaExceeded] = useState<boolean>(false);
  
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  
  const [notificationPermission, setNotificationPermission] = useState<string>('default');
  const [isListening, setIsListening] = useState<boolean>(false);
  const notifiedAlertIds = React.useRef(new Set<string>());

  // Unit system state: true = Metric (C, km/h), false = Imperial (F, mph)
  const [isMetric, setIsMetric] = useState<boolean>(() => {
    const saved = localStorage.getItem('skywatch-units');
    return saved !== null ? JSON.parse(saved) : true;
  });

  const [pressureUnit, setPressureUnit] = useState<'hPa' | 'inHg'>(() => {
    const saved = localStorage.getItem('skywatch-pressure-unit');
    return saved === 'inHg' ? 'inHg' : 'hPa';
  });

  const [distanceUnit, setDistanceUnit] = useState<'km' | 'mi'>(() => {
    const saved = localStorage.getItem('skywatch-distance-unit');
    return saved === 'mi' ? 'mi' : 'km';
  });

  useEffect(() => {
    localStorage.setItem('skywatch-units', JSON.stringify(isMetric));
  }, [isMetric]);

  useEffect(() => {
    localStorage.setItem('skywatch-pressure-unit', pressureUnit);
  }, [pressureUnit]);

  useEffect(() => {
    localStorage.setItem('skywatch-distance-unit', distanceUnit);
  }, [distanceUnit]);

  useEffect(() => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  const handleRequestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
    }
  };

  useEffect(() => {
    if (weatherData?.alerts && 'Notification' in window && Notification.permission === 'granted') {
      weatherData.alerts.forEach((alert) => {
        const alertId = `${location}-${alert.title}`;
        if (alert.severity.toLowerCase() === 'severe' && !notifiedAlertIds.current.has(alertId)) {
          new Notification(`Severe Weather Alert`, {
            body: alert.title + '\n' + alert.description,
            icon: '/favicon.ico'
          });
          notifiedAlertIds.current.add(alertId);
        }
      });
    }
  }, [weatherData, location]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const loadData = useCallback(async (loc: string) => {
    setLoading(true);
    setError(null);
    setIsQuotaExceeded(false);
    try {
      const [weather, newsData, radar] = await Promise.all([
        fetchWeatherInsights(loc),
        fetchLiveWeatherNews(loc),
        fetchRadarSnapshot(loc)
      ]);
      setWeatherData(weather);
      setNews(newsData.news);
      setRadarSnapshot(radar);
    } catch (err: any) {
      const errorStr = err.message || JSON.stringify(err);
      if (errorStr.includes('429') || errorStr.includes('RESOURCE_EXHAUSTED')) {
        setIsQuotaExceeded(true);
        setError('Gemini API quota exceeded. Please wait a minute or check your billing plan.');
      } else if (errorStr.includes('xhr error') || errorStr.includes('UNKNOWN') || errorStr.includes('Script error')) {
        console.error(err);
        setError('A network or API connectivity error occurred. Please try again.');
      } else {
        console.error(err);
        setError('Failed to fetch weather data. Please try another location.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshNews = useCallback(async () => {
    try {
      const newsData = await fetchLiveWeatherNews(location);
      setNews(newsData.news);
      setIsQuotaExceeded(false);
    } catch (err: any) {
      const errorStr = err.message || JSON.stringify(err);
      if (errorStr.includes('429') || errorStr.includes('RESOURCE_EXHAUSTED')) {
        setIsQuotaExceeded(true);
      } else {
        console.error('Failed to refresh news:', err);
      }
    }
  }, [location]);

  const refreshRadar = useCallback(async () => {
    try {
      const radar = await fetchRadarSnapshot(location);
      setRadarSnapshot(radar);
      setIsQuotaExceeded(false);
    } catch (err: any) {
      const errorStr = err.message || JSON.stringify(err);
      if (errorStr.includes('429') || errorStr.includes('RESOURCE_EXHAUSTED')) {
        setIsQuotaExceeded(true);
      } else {
        console.error('Failed to auto-refresh radar:', err);
      }
    }
  }, [location]);

  useEffect(() => {
    loadData(location);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchInput.trim().length < 3) {
        setSuggestions([]);
        return;
      }
      setIsTyping(true);
      try {
        const sugs = await fetchLocationSuggestions(searchInput);
        setSuggestions(sugs);
      } catch (err) {
        console.error("Failed to fetch suggestions", err);
      } finally {
        setIsTyping(false);
      }
    };

    const debounceId = setTimeout(fetchSuggestions, 500);
    return () => clearTimeout(debounceId);
  }, [searchInput]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setShowSuggestions(false);
      setLocation(searchInput);
      loadData(searchInput);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchInput(suggestion);
    setShowSuggestions(false);
    setLocation(suggestion);
    loadData(suggestion);
  };

  const handleGeoLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          const geoLoc = `${latitude.toFixed(2)}, ${longitude.toFixed(2)}`;
          setLocation(geoLoc);
          loadData(geoLoc);
        },
        () => setError('Geolocation permission denied.')
      );
    }
  };

  const handleVoiceSearch = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Your browser does not support Speech Recognition.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setSearchInput(transcript);
      setLocation(transcript);
      loadData(transcript);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const getBackgroundClass = () => {
    if (!weatherData) return "bg-[#0f172a]"; // default dark
    const cond = weatherData.current.condition.toLowerCase();
    if (cond.includes('sun') || cond.includes('clear')) return "weather-gradient-sunny";
    if (cond.includes('cloud') || cond.includes('overcast')) return "weather-gradient-cloudy";
    if (cond.includes('rain') || cond.includes('drizzle') || cond.includes('shower')) return "weather-gradient-rainy";
    if (cond.includes('snow') || cond.includes('ice') || cond.includes('flurr')) return "weather-gradient-snowy";
    if (cond.includes('storm') || cond.includes('thunder')) return "weather-gradient-stormy";
    return "bg-[#0f172a]"; // fallback
  };

  const bgClass = getBackgroundClass();
  
  return (
    <div className={`min-h-screen pb-12 relative z-0`}>
      {/* Background layers for smooth transitions */}
      <div className={`fixed inset-0 transition-opacity duration-1000 ${bgClass === 'bg-[#0f172a]' ? 'opacity-100' : 'opacity-0'} bg-[#0f172a] -z-10`} />
      <div className={`fixed inset-0 transition-opacity duration-1000 ${bgClass === 'weather-gradient-sunny' ? 'opacity-100' : 'opacity-0'} weather-gradient-sunny -z-10`} />
      <div className={`fixed inset-0 transition-opacity duration-1000 ${bgClass === 'weather-gradient-cloudy' ? 'opacity-100' : 'opacity-0'} weather-gradient-cloudy -z-10`} />
      <div className={`fixed inset-0 transition-opacity duration-1000 ${bgClass === 'weather-gradient-rainy' ? 'opacity-100' : 'opacity-0'} weather-gradient-rainy -z-10`} />
      <div className={`fixed inset-0 transition-opacity duration-1000 ${bgClass === 'weather-gradient-snowy' ? 'opacity-100' : 'opacity-0'} weather-gradient-snowy -z-10`} />
      <div className={`fixed inset-0 transition-opacity duration-1000 ${bgClass === 'weather-gradient-stormy' ? 'opacity-100' : 'opacity-0'} weather-gradient-stormy -z-10`} />

      {/* Navbar */}
      <nav className="sticky top-0 z-50 glass px-4 py-3 mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 p-2 rounded-lg shadow-lg shadow-blue-500/20">
            <CloudRain className="text-white w-6 h-6" />
          </div>
          <span className="text-xl font-bold tracking-tight hidden sm:block">SkyWatch <span className="text-blue-400">AI</span></span>
        </div>

        <form onSubmit={handleSearch} className="flex-1 max-w-md mx-4 relative flex items-center">
          <div className="w-full relative">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              placeholder="Search location..."
              className="w-full bg-slate-800/50 border border-slate-700 rounded-full py-2 pl-10 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm text-white"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <button
              type="button"
              onClick={handleVoiceSearch}
              className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full transition-colors ${
                isListening ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30' : 'text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
              title="Search by voice"
            >
              <Mic className={`w-4 h-4 ${isListening ? 'animate-pulse' : ''}`} />
            </button>
            {showSuggestions && searchInput.trim().length >= 3 && (
              <div className="absolute top-full mt-2 w-full bg-slate-800/95 backdrop-blur-md border border-slate-700 rounded-xl shadow-xl overflow-hidden z-50">
                {isTyping ? (
                  <div className="px-4 py-3 text-sm text-slate-400 text-center animate-pulse">
                    Loading...
                  </div>
                ) : suggestions.length > 0 ? (
                  <ul>
                    {suggestions.map((suggestion, index) => (
                      <li key={index}>
                        <button
                          type="button"
                          className="w-full text-left px-4 py-2.5 text-sm text-slate-200 hover:bg-blue-500/20 transition-colors"
                          onClick={() => handleSuggestionClick(suggestion)}
                        >
                          <MapPin className="inline-block w-4 h-4 mr-2 text-slate-400" />
                          {suggestion}
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="px-4 py-3 text-sm text-slate-400 text-center">
                    No locations found
                  </div>
                )}
              </div>
            )}
          </div>
        </form>

        <div className="flex items-center gap-2">
          <button 
            onClick={handleGeoLocation}
            className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-300"
            title="Use my location"
          >
            <MapPin className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setIsSettingsModalOpen(true)}
            className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-300"
            title="Settings"
          >
            <Settings className="w-5 h-5" />
          </button>
          
          {user ? (
            <div className="flex items-center gap-3 ml-2">
              <span className="hidden sm:block text-sm text-slate-300 font-medium">
                {user.email?.split('@')[0]}
              </span>
              <button 
                onClick={() => signOut(auth)}
                className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm transition-colors"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setIsAuthModalOpen(true)}
              className="flex items-center gap-1 ml-2 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors shadow-lg shadow-blue-500/20"
            >
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Login / Sign Up</span>
            </button>
          )}
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {isQuotaExceeded && (
          <div className="bg-amber-500/10 border border-amber-500/50 text-amber-500 p-4 rounded-xl mb-6 flex flex-col sm:flex-row items-center gap-4 transition-all animate-in fade-in slide-in-from-top-4">
            <div className="flex items-center gap-3 flex-1">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <div>
                <p className="font-bold">Quota Limit Reached</p>
                <p className="text-xs opacity-80">You've hit the Gemini API rate limit. Background updates are paused. Use a paid API key for higher limits.</p>
              </div>
            </div>
            <div className="flex gap-2">
              <a 
                href="https://ai.google.dev/gemini-api/docs/billing" 
                target="_blank" 
                rel="noopener noreferrer"
                className="px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-500 text-xs font-bold rounded-lg transition-colors flex items-center gap-1"
              >
                <Info className="w-3 h-3" /> Billing Info
              </a>
              <button 
                onClick={() => loadData(location)}
                className="px-4 py-2 bg-amber-500 text-slate-900 text-xs font-bold rounded-lg transition-colors flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" /> Retry Now
              </button>
            </div>
          </div>
        )}

        {error && !isQuotaExceeded && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-xl mb-6 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-400 animate-pulse font-medium">Communicating with Gemini...</p>
          </div>
        ) : weatherData ? (
          <>
            {weatherData.alerts && weatherData.alerts.length > 0 && (
              <div className="mb-6 space-y-4">
                {weatherData.alerts.map((alert, idx) => (
                  <div key={idx} className={`bg-red-500/10 border border-red-500/50 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center gap-4 animate-fade-in-up delay-${idx + 1}`}>
                    <div className="bg-red-500/20 p-3 rounded-full hidden sm:block">
                      <AlertTriangle className="w-6 h-6 text-red-400" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 text-xs font-bold rounded uppercase tracking-wider ${
                          alert.severity.toLowerCase() === 'severe' ? 'bg-red-500 text-white' : 
                          alert.severity.toLowerCase() === 'moderate' ? 'bg-orange-500 text-white' : 
                          'bg-yellow-500 text-slate-900'
                        }`}>
                          {alert.severity}
                        </span>
                        <h3 className="font-bold text-red-100 flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 sm:hidden text-red-400" />
                          {alert.title}
                        </h3>
                      </div>
                      <p className="text-sm text-red-200 mt-1">{alert.description}</p>
                    </div>
                    {alert.link && (
                      <a 
                        href={alert.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-red-500/20 hover:bg-red-500/40 text-red-300 hover:text-red-100 text-sm font-semibold rounded-lg transition-colors whitespace-nowrap border border-red-500/30"
                      >
                        Details
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            <div className="lg:col-span-8 space-y-6">
              <QuickSummary data={weatherData} isMetric={isMetric} pressureUnit={pressureUnit} distanceUnit={distanceUnit} />
              <WeatherCard 
                data={weatherData} 
                isMetric={isMetric} 
                setIsMetric={setIsMetric} 
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <WeatherRadar 
                  snapshot={radarSnapshot} 
                  onRefresh={refreshRadar}
                />
                <AIInsightsPanel 
                  insights={weatherData.aiInsights} 
                  score={weatherData.reliabilityScore} 
                />
              </div>

              <ForecastChart 
                forecast={weatherData.forecast} 
                isMetric={isMetric}
              />
            </div>

            <div className="lg:col-span-4 space-y-6">
              <HistoricalPanel 
                location={weatherData.location} 
                isMetric={isMetric}
              />
              <NewsPanel 
                news={news} 
                location={weatherData.location} 
                onRefresh={refreshNews}
              />
            </div>

          </div>
          </>
        ) : (
          !loading && isQuotaExceeded && (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <AlertTriangle className="w-16 h-16 text-amber-500/50 mb-4" />
              <h2 className="text-2xl font-bold mb-2">Service Temporarily Unavailable</h2>
              <p className="text-slate-400 max-w-md">Gemini is currently rate-limiting this request. Please wait a few moments and try again.</p>
              <button 
                onClick={() => loadData(location)}
                className="mt-6 px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all"
              >
                Retry Request
              </button>
            </div>
          )
        )}
      </main>

      {/* Footer */}
      <footer className="mt-12 border-t border-slate-800/50 pt-8 pb-4 text-center">
        <div className="flex items-center justify-center gap-6 mb-4">
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-blue-500 transition-colors" title="Facebook">
            <Facebook className="w-5 h-5" />
          </a>
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-pink-500 transition-colors" title="Instagram">
            <Instagram className="w-5 h-5" />
          </a>
          <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-red-500 transition-colors" title="YouTube">
            <Youtube className="w-5 h-5" />
          </a>
          <a href="https://x.com" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-slate-100 transition-colors" title="X (Twitter)">
            <Twitter className="w-5 h-5" />
          </a>
        </div>
        <p className="text-sm text-slate-500">© 2026 SkyWatch AI. All rights reserved.</p>
      </footer>

      {/* Modals */}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />
      
      <SettingsModal 
        isOpen={isSettingsModalOpen} 
        onClose={() => setIsSettingsModalOpen(false)} 
        notificationPermission={notificationPermission as any}
        onRequestNotificationPermission={handleRequestNotificationPermission}
        pressureUnit={pressureUnit}
        setPressureUnit={setPressureUnit}
        distanceUnit={distanceUnit}
        setDistanceUnit={setDistanceUnit}
      />
    </div>
  );
};

export default App;
