
import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Wind, Droplets, Sun, Thermometer, ChevronUp, Compass, TrendingUp, Sunrise, Sunset, Share2, Calendar, Cloud, CloudRain, CloudLightning, Check, Moon } from 'lucide-react';
import { WeatherData } from '../types';

interface WeatherCardProps {
  data: WeatherData;
  isMetric: boolean;
  setIsMetric: (val: boolean) => void;
}

const MoonPhaseIcon: React.FC<{ phaseType: string; className?: string }> = ({ phaseType, className = "w-5 h-5" }) => {
  switch (phaseType) {
    case 'new':
      return (
        <svg className={`${className} text-slate-500`} viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="9" className="fill-slate-900 stroke-slate-600" strokeWidth="1.5" />
        </svg>
      );
    case 'waxing_crescent':
      return (
        <svg className={`${className} text-indigo-300`} viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="9" className="fill-slate-900 stroke-slate-600" strokeWidth="1.5" />
          <path d="M12 3a9 9 0 0 1 0 18 6 6 0 0 0 0-18z" className="fill-indigo-300" />
        </svg>
      );
    case 'first_quarter':
      return (
        <svg className={`${className} text-indigo-300`} viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="9" className="fill-slate-900 stroke-slate-600" strokeWidth="1.5" />
          <path d="M12 3a9 9 0 0 1 0 18z" className="fill-indigo-300" />
        </svg>
      );
    case 'waxing_gibbous':
      return (
        <svg className={`${className} text-indigo-300`} viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="9" className="fill-indigo-300 stroke-indigo-300" strokeWidth="1.5" />
          <path d="M12 3a9 9 0 0 0 0 18 4.5 4.5 0 0 1 0-18z" className="fill-slate-900" />
        </svg>
      );
    case 'full':
      return (
        <svg className={`${className} text-indigo-200`} viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="9" className="fill-indigo-100 stroke-indigo-300" strokeWidth="1.5" />
        </svg>
      );
    case 'waning_gibbous':
      return (
        <svg className={`${className} text-indigo-300`} viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="9" className="fill-indigo-300 stroke-indigo-300" strokeWidth="1.5" />
          <path d="M12 3a9 9 0 0 1 0 18 4.5 4.5 0 0 0 0-18z" className="fill-slate-900" />
        </svg>
      );
    case 'third_quarter':
      return (
        <svg className={`${className} text-indigo-300`} viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="9" className="fill-slate-900 stroke-slate-600" strokeWidth="1.5" />
          <path d="M12 3a9 9 0 0 0 0 18z" className="fill-indigo-300" />
        </svg>
      );
    case 'waning_crescent':
      return (
        <svg className={`${className} text-indigo-300`} viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="9" className="fill-slate-900 stroke-slate-600" strokeWidth="1.5" />
          <path d="M12 3a9 9 0 0 0 0 18 6 6 0 0 1 0-18z" className="fill-indigo-300" />
        </svg>
      );
    default:
      return <Moon className={className} />;
  }
};

function getMoonPhaseDetails(date: Date = new Date()) {
  const refNewMoon = Date.UTC(2024, 0, 11, 11, 57, 0);
  const cycleDays = 29.53058770576;
  const diffDays = (date.getTime() - refNewMoon) / (1000 * 60 * 60 * 24);
  const currentAge = ((diffDays % cycleDays) + cycleDays) % cycleDays;
  const normalizedPhase = currentAge / cycleDays;

  let daysUntilFullMoon = (cycleDays * 0.5) - currentAge;
  if (daysUntilFullMoon < 0) {
    daysUntilFullMoon += cycleDays;
  }
  const nextFullMoonDate = new Date(date.getTime() + daysUntilFullMoon * 86400000);
  const nextFullMoonFormatted = nextFullMoonDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  let name = '';
  let phaseIconType = 'full';

  if (normalizedPhase < 0.03 || normalizedPhase >= 0.97) {
    name = 'New Moon';
    phaseIconType = 'new';
  } else if (normalizedPhase >= 0.03 && normalizedPhase < 0.22) {
    name = 'Waxing Crescent';
    phaseIconType = 'waxing_crescent';
  } else if (normalizedPhase >= 0.22 && normalizedPhase < 0.28) {
    name = 'First Quarter';
    phaseIconType = 'first_quarter';
  } else if (normalizedPhase >= 0.28 && normalizedPhase < 0.47) {
    name = 'Waxing Gibbous';
    phaseIconType = 'waxing_gibbous';
  } else if (normalizedPhase >= 0.47 && normalizedPhase < 0.53) {
    name = 'Full Moon';
    phaseIconType = 'full';
  } else if (normalizedPhase >= 0.53 && normalizedPhase < 0.72) {
    name = 'Waning Gibbous';
    phaseIconType = 'waning_gibbous';
  } else if (normalizedPhase >= 0.72 && normalizedPhase < 0.78) {
    name = 'Third Quarter';
    phaseIconType = 'third_quarter';
  } else {
    name = 'Waning Crescent';
    phaseIconType = 'waning_crescent';
  }

  const illumination = Math.round((1 - Math.cos(normalizedPhase * 2 * Math.PI)) / 2 * 100);

  return {
    name,
    illumination,
    nextFullMoonFormatted,
    phaseIconType
  };
}

const WeatherCard: React.FC<WeatherCardProps> = ({ data, isMetric, setIsMetric }) => {
  const { current, location, forecast } = data;
  const [copied, setCopied] = useState(false);
  const moonDetails = getMoonPhaseDetails();

  const convertTemp = (celsius: number) => {
    return isMetric ? Math.round(celsius) : Math.round((celsius * 9) / 5 + 32);
  };

  const convertSpeed = (speed: number) => {
    return isMetric ? speed : Math.round(speed * 0.621371);
  };

  const formatDay = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr.slice(0, 3);
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } catch {
      return dateStr.slice(0, 3);
    }
  };

  const getWeatherIcon = (condition: string) => {
    const c = condition.toLowerCase();
    if (c.includes('sunny') || c.includes('clear')) return <Sun className="w-5 h-5 text-yellow-400" />;
    if (c.includes('rain')) return <CloudRain className="w-5 h-5 text-blue-400" />;
    if (c.includes('storm') || c.includes('thunder')) return <CloudLightning className="w-5 h-5 text-purple-400" />;
    return <Cloud className="w-5 h-5 text-slate-400" />;
  };

  const windSpeedDisplay = `${convertSpeed(current.windSpeed)} ${isMetric ? 'km/h' : 'mph'}`;
  const windGustDisplay = current.windGust ? `${convertSpeed(current.windGust)} ${isMetric ? 'km/h' : 'mph'}` : null;

  const handleShare = async () => {
    const summary = `${location} Weather: ${convertTemp(current.temp)}°${isMetric ? 'C' : 'F'}, ${current.description}. Wind: ${windSpeedDisplay}.`;
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <motion.div 
      key={`weather-card-${location}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="relative overflow-hidden glass rounded-3xl p-8 group"
    >
      {/* Background Glow */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-500/20 via-blue-500/5 to-transparent rounded-full pointer-events-none"></div>
      
      <div className="relative z-10 flex flex-col gap-8">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <h1 className="text-3xl font-bold text-white">{location}</h1>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleShare}
                  className="flex items-center justify-center w-9 h-9 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                  title="Share weather summary"
                >
                  {copied ? <Check className="w-4 h-4 text-green-400" /> : <Share2 className="w-4 h-4" />}
                </button>
                {/* Unit Toggle Switch */}
                <div className="flex bg-slate-800/80 p-1 rounded-xl border border-slate-700 h-9 relative">
                  <div 
                    className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-blue-600 rounded-lg shadow-lg shadow-blue-500/20 transition-all duration-300 ease-out ${isMetric ? 'left-1' : 'left-[calc(50%+1px)]'}`}
                  />
                  <button 
                    onClick={() => setIsMetric(true)}
                    className={`relative z-10 px-3 text-xs font-bold transition-colors duration-300 w-12 ${isMetric ? 'text-white' : 'text-slate-500'}`}
                  >
                    °C
                  </button>
                  <button 
                    onClick={() => setIsMetric(false)}
                    className={`relative z-10 px-3 text-xs font-bold transition-colors duration-300 w-12 ${!isMetric ? 'text-white' : 'text-slate-500'}`}
                  >
                    °F
                  </button>
                </div>
              </div>
            </div>
            <p className="text-slate-400 text-lg capitalize">{current.description}</p>
            
            <div className="mt-6 flex items-baseline gap-2">
              <span className="text-7xl font-light tracking-tighter text-white animate-in fade-in slide-in-from-left-4 duration-500">
                {convertTemp(current.temp)}°
              </span>
              <span className="text-2xl text-slate-400">{isMetric ? 'C' : 'F'}</span>
            </div>
            
            {current.aqi !== undefined && (
              <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-700 bg-slate-800/80">
                <span className="text-sm font-medium text-slate-300">AQI: {current.aqi}</span>
                <span className={`w-2.5 h-2.5 rounded-full shadow-sm ${current.aqi <= 50 ? 'bg-green-400 shadow-green-400/50' : current.aqi <= 100 ? 'bg-yellow-400 shadow-yellow-400/50' : current.aqi <= 150 ? 'bg-orange-400 shadow-orange-400/50' : current.aqi <= 200 ? 'bg-red-500 shadow-red-500/50' : current.aqi <= 300 ? 'bg-purple-500 shadow-purple-500/50' : 'bg-rose-900 shadow-rose-900/50'}`}></span>
                <span className={`text-xs font-bold uppercase tracking-wide ${current.aqi <= 50 ? 'text-green-400' : current.aqi <= 100 ? 'text-yellow-400' : current.aqi <= 150 ? 'text-orange-400' : current.aqi <= 200 ? 'text-red-500' : current.aqi <= 300 ? 'text-purple-500' : 'text-rose-900'}`}>
                  {current.aqi <= 50 ? 'Good' : current.aqi <= 100 ? 'Moderate' : current.aqi <= 150 ? 'Unhealthy (Sensitive)' : current.aqi <= 200 ? 'Unhealthy' : current.aqi <= 300 ? 'Very Unhealthy' : 'Hazardous'}
                </span>
              </div>
            )}
            
            <div className="mt-6 flex flex-wrap items-center gap-4">
              {current.sunrise && (
                <div className="flex items-center gap-3 bg-slate-800/40 rounded-2xl p-3 border border-slate-700/50">
                  <div className="p-2 bg-amber-500/10 rounded-full">
                    <Sunrise className="w-5 h-5 text-amber-400" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Sunrise</span>
                    <span className="text-sm font-semibold text-white">{current.sunrise}</span>
                  </div>
                </div>
              )}
              {current.sunset && (
                <div className="flex items-center gap-3 bg-slate-800/40 rounded-2xl p-3 border border-slate-700/50">
                  <div className="p-2 bg-orange-500/10 rounded-full">
                    <Sunset className="w-5 h-5 text-orange-500" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Sunset</span>
                    <span className="text-sm font-semibold text-white">{current.sunset}</span>
                  </div>
                </div>
              )}
              <div className="relative group/moon flex items-center gap-3 bg-slate-800/40 rounded-2xl p-3 border border-slate-700/50 cursor-pointer hover:bg-slate-800/60 transition-colors">
                <div className="p-2 bg-indigo-500/10 rounded-full">
                  <MoonPhaseIcon phaseType={moonDetails.phaseIconType} className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Moon Phase</span>
                  <span className="text-sm font-semibold text-white">{moonDetails.name}</span>
                </div>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2.5 hidden group-hover/moon:flex flex-col items-center z-30 pointer-events-none transition-all duration-200">
                  <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700/80 text-xs text-slate-200 py-2 px-3.5 rounded-xl shadow-2xl whitespace-nowrap text-center">
                    <div className="font-semibold text-white flex items-center justify-center gap-1.5">
                      <span>{moonDetails.name}</span>
                      <span className="text-[10px] text-indigo-400 font-mono">({moonDetails.illumination}% illuminated)</span>
                    </div>
                    <div className="text-[11px] text-indigo-300 mt-0.5">
                      Next Full Moon: <span className="font-medium text-white">{moonDetails.nextFullMoonFormatted}</span>
                    </div>
                  </div>
                  <div className="w-2.5 h-2.5 bg-slate-900 border-r border-b border-slate-700 rotate-45 -mt-1.5"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Extended Forecast Section */}
        <div className="pt-6 border-t border-slate-700/50">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-4 h-4 text-blue-400" />
            <h3 className="text-sm font-semibold uppercase tracking-widest text-slate-300">7-Day Extended Forecast</h3>
          </div>
          <div className="flex overflow-x-auto md:grid md:grid-cols-7 gap-2 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden snap-x transform-gpu">
            {forecast.map((f, idx) => (
              <div key={idx} className="flex-none w-24 md:w-auto bg-slate-800/20 rounded-2xl p-3 border border-slate-700/30 flex flex-col items-center gap-2 snap-center transform-gpu">
                <span className="text-[10px] font-bold text-slate-500 uppercase">{formatDay(f.day)}</span>
                {getWeatherIcon(f.condition)}
                <div className="mt-1 flex flex-col items-center">
                  <span className="text-sm font-bold text-white">{convertTemp(f.high)}°</span>
                  <span className="text-[10px] text-slate-500">{convertTemp(f.low)}°</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Forecast Wind Outlook Section */}
        <div className="pt-6 border-t border-slate-700/50">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-blue-400" />
            <h3 className="text-sm font-semibold uppercase tracking-widest text-slate-300">Extended Wind Profile</h3>
          </div>
          <div className="flex overflow-x-auto md:grid md:grid-cols-7 gap-2 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden snap-x transform-gpu">
            {forecast.map((f, idx) => (
              <div key={idx} className="flex-none w-24 md:w-auto bg-slate-800/20 rounded-2xl p-3 border border-slate-700/30 flex flex-col items-center gap-1 snap-center transform-gpu">
                <span className="text-[10px] font-bold text-slate-500 uppercase">{formatDay(f.day)}</span>
                <Compass className="w-4 h-4 text-blue-400/70" />
                <span className="text-xs font-bold text-white">{f.windDirection}</span>
                <div className="mt-1 flex flex-col items-center">
                  <span className="text-[10px] text-orange-400 font-bold">{convertSpeed(f.windSpeedHigh)}</span>
                  <div className="h-[1px] w-4 bg-slate-700 my-0.5"></div>
                  <span className="text-[10px] text-blue-400 font-bold">{convertSpeed(f.windSpeedLow)}</span>
                  <span className="text-[8px] text-slate-600 font-medium mt-0.5 uppercase">{isMetric ? 'km/h' : 'mph'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const Stat: React.FC<{ icon: React.ReactNode; label: string; value: string }> = ({ icon, label, value }) => (
  <div className="flex flex-col gap-1">
    <div className="flex items-center gap-2 text-slate-400">
      {icon}
      <span className="text-xs font-medium uppercase tracking-wider">{label}</span>
    </div>
    <span className="text-xl font-semibold text-white">{value}</span>
  </div>
);

export default WeatherCard;
