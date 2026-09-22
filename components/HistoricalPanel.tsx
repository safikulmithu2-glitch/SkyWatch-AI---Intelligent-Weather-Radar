
import React, { useState } from 'react';
import { History, Search, Calendar, Thermometer, CloudRain, Info, ExternalLink } from 'lucide-react';
import { fetchHistoricalWeather } from '../services/gemini';
import { HistoricalWeatherData } from '../types';

interface HistoricalPanelProps {
  location: string;
  isMetric: boolean;
}

const HistoricalPanel: React.FC<HistoricalPanelProps> = ({ location, isMetric }) => {
  const [date, setDate] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<HistoricalWeatherData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const convertTemp = (celsius: number) => {
    return isMetric ? Math.round(celsius) : Math.round((celsius * 9) / 5 + 32);
  };

  const handleFetchHistory = async () => {
    if (!date) {
      setError("Please select a date first.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await fetchHistoricalWeather(location, date);
      setResult(data);
    } catch (err: any) {
      const errorStr = err.message || JSON.stringify(err);
      if (errorStr.includes('429') || errorStr.includes('RESOURCE_EXHAUSTED')) {
        setError("Gemini API quota exceeded. Please wait a minute or check your billing plan.");
      } else if (errorStr.includes('xhr error') || errorStr.includes('UNKNOWN') || errorStr.includes('Script error')) {
        console.error(err);
        setError("A network or API connectivity error occurred. Please try again.");
      } else {
        console.error(err);
        setError("Unable to retrieve historical data for this date and location.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass rounded-3xl p-6 flex flex-col h-full">
      <div className="flex items-center gap-2 mb-6">
        <div className="bg-purple-500/20 p-2 rounded-lg">
          <History className="w-5 h-5 text-purple-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">Historical Archive</h3>
          <p className="text-xs text-slate-500">Query past weather events</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="relative">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            max={new Date().toISOString().split('T')[0]}
            className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all text-sm text-white color-scheme-dark"
            style={{ colorScheme: 'dark' }}
          />
        </div>

        <button
          onClick={handleFetchHistory}
          disabled={loading || !date}
          className="w-full bg-purple-600 hover:bg-purple-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-900/20"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : (
            <>
              <Search className="w-4 h-4" />
              Retrieve Data
            </>
          )}
        </button>

        {error && (
          <p className="text-xs text-red-400 bg-red-400/10 p-3 rounded-lg border border-red-400/20">
            {error}
          </p>
        )}

        {result && !loading && (
          <div className="mt-6 space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="p-4 bg-slate-800/40 rounded-2xl border border-slate-700/50">
              <div className="flex items-center gap-2 text-purple-400 mb-2">
                <Calendar className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">{result.date}</span>
              </div>
              <h4 className="text-xl font-bold text-white mb-4">{result.conditions}</h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Max Temp</span>
                  <div className="flex items-center gap-2">
                    <Thermometer className="w-4 h-4 text-orange-400" />
                    <span className="text-lg font-bold text-white transition-all duration-300">
                      {convertTemp(result.highTemp)}°{isMetric ? 'C' : 'F'}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Precipitation</span>
                  <div className="flex items-center gap-2">
                    <CloudRain className="w-4 h-4 text-blue-400" />
                    <span className="text-lg font-bold text-white">{result.precipitation}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-slate-700/50">
                <div className="flex items-start gap-2 text-slate-300">
                  <Info className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                  <p className="text-sm leading-relaxed">{result.summary}</p>
                </div>
              </div>

              {result.sources && result.sources.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {result.sources.map((src, idx) => (
                    <a 
                      key={idx} 
                      href={src} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-[10px] bg-slate-700/50 hover:bg-slate-700 p-1.5 px-2 rounded flex items-center gap-1 text-slate-400 transition-colors"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Ref {idx + 1}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
        
        {!result && !loading && !error && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Calendar className="w-12 h-12 text-slate-700 mb-4" />
            <p className="text-slate-500 text-sm">Select a date to unlock historical climate data for this region.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoricalPanel;
