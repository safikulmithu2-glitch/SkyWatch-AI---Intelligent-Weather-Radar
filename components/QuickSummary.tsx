import React from 'react';
import { Wind, Droplets, Sun, Thermometer, Compass, Sunrise, Sunset, Gauge, Eye } from 'lucide-react';
import { WeatherData } from '../types';

interface QuickSummaryProps {
  data: WeatherData;
  isMetric: boolean;
  pressureUnit: 'hPa' | 'inHg';
  distanceUnit: 'km' | 'mi';
}

const QuickSummary: React.FC<QuickSummaryProps> = ({ data, isMetric, pressureUnit, distanceUnit }) => {
  const current = data.current;
  
  const convertDistance = (val: number) => {
    return distanceUnit === 'km' ? val : Math.round(val * 0.621371 * 10) / 10;
  };
  
  const convertPressure = (val: number) => {
    return pressureUnit === 'hPa' ? val : Math.round(val * 0.02953 * 100) / 100;
  };

  const items = [
    {
      icon: <Thermometer className="w-5 h-5 text-orange-400" />,
      label: "Feels Like",
      value: `${current.feelsLike}°${isMetric ? 'C' : 'F'}`
    },
    {
      icon: <Wind className="w-5 h-5 text-blue-400" />,
      label: "Wind",
      value: `${current.windSpeed} ${isMetric ? 'km/h' : 'mph'}`
    },
    {
      icon: <Droplets className="w-5 h-5 text-cyan-400" />,
      label: "Humidity",
      value: `${current.humidity}%`
    },
    {
      icon: <Sun className="w-5 h-5 text-yellow-400" />,
      label: "UV Index",
      value: current.uvIndex.toString()
    }
  ];

  if (current.windDirection) {
    items.splice(2, 0, {
      icon: <Compass className="w-5 h-5 text-slate-400" />,
      label: "Direction",
      value: current.windDirection
    });
  }

  if (current.pressure !== undefined) {
    items.push({
      icon: <Gauge className="w-5 h-5 text-emerald-400" />,
      label: "Pressure",
      value: `${convertPressure(current.pressure)} ${pressureUnit}`
    });
  }

  if (current.visibility !== undefined) {
    items.push({
      icon: <Eye className="w-5 h-5 text-indigo-400" />,
      label: "Visibility",
      value: `${convertDistance(current.visibility)} ${distanceUnit}`
    });
  }

  if (current.sunrise) {
    items.push({
      icon: <Sunrise className="w-5 h-5 text-amber-400" />,
      label: "Sunrise",
      value: current.sunrise
    });
  }

  if (current.sunset) {
    items.push({
      icon: <Sunset className="w-5 h-5 text-fuchsia-400" />,
      label: "Sunset",
      value: current.sunset
    });
  }

  return (
    <div className="mb-6">
      <h2 className="text-lg font-bold text-slate-200 mb-3 px-1">Quick Summary</h2>
      <div className="flex overflow-x-auto pb-4 gap-4 snap-x [scrollbar-width:none] [&::-webkit-scrollbar]:hidden transform-gpu">
        {items.map((item, index) => (
          <div key={index} className="flex-none w-36 glass rounded-2xl p-4 flex flex-col items-center justify-center text-center gap-2 snap-center hover:bg-white/5 transition-colors transform-gpu">
            <div className="bg-slate-800/50 p-3 rounded-full shadow-inner">
              {item.icon}
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium mb-1">{item.label}</p>
              <p className="text-lg font-bold text-white leading-none">{item.value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuickSummary;
