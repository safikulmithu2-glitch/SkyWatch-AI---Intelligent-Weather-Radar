
import React from 'react';
import { motion } from 'motion/react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Cloud, Sun, CloudRain, CloudLightning } from 'lucide-react';

interface ForecastDay {
  day: string;
  high: number;
  low: number;
  condition: string;
  windSpeedHigh: number;
  windSpeedLow: number;
  windDirection: string;
}

interface ForecastChartProps {
  forecast: ForecastDay[];
  isMetric: boolean;
}

const ForecastChart: React.FC<ForecastChartProps> = ({ forecast, isMetric }) => {
  const convertTemp = (celsius: number) => {
    return isMetric ? Math.round(celsius) : Math.round((celsius * 9) / 5 + 32);
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

  const chartData = forecast.map(f => ({
    name: formatDay(f.day),
    temp: convertTemp(f.high),
    low: convertTemp(f.low)
  }));

  const getWeatherIcon = (condition: string) => {
    const c = condition.toLowerCase();
    if (c.includes('sunny') || c.includes('clear')) return <Sun className="w-5 h-5 text-yellow-400" />;
    if (c.includes('rain')) return <CloudRain className="w-5 h-5 text-blue-400" />;
    if (c.includes('storm') || c.includes('thunder')) return <CloudLightning className="w-5 h-5 text-purple-400" />;
    return <Cloud className="w-5 h-5 text-slate-400" />;
  };

  return (
    <motion.div 
      key={`forecast-chart-${forecast[0]?.day}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2, ease: 'easeOut' }}
      className="glass rounded-3xl p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">7-Day Forecast Trends</h3>
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-slate-800/50 px-2 py-1 rounded border border-slate-700">
          Unit: {isMetric ? 'Celsius' : 'Fahrenheit'}
        </span>
      </div>
      
      <div className="h-[240px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{fill: '#94a3b8', fontSize: 12}} 
              dy={10}
            />
            <YAxis 
              hide 
              domain={['dataMin - 10', 'dataMax + 10']} 
            />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px' }}
              itemStyle={{ color: '#f8fafc' }}
              formatter={(value) => [`${value}°${isMetric ? 'C' : 'F'}`, 'Temperature']}
            />
            <Area 
              type="monotone" 
              dataKey="temp" 
              stroke="#3b82f6" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorTemp)" 
              animationDuration={1500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="flex overflow-x-auto md:grid md:grid-cols-7 gap-2 mt-8 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden snap-x transform-gpu">
        {forecast.map((f, i) => (
          <div key={i} className="flex-none w-24 md:w-auto flex flex-col items-center gap-2 p-3 bg-slate-800/40 rounded-2xl border border-slate-700/50 snap-center transform-gpu">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter">{formatDay(f.day)}</span>
            {getWeatherIcon(f.condition)}
            <div className="flex flex-col items-center mt-1">
              <span className="text-lg font-bold text-white transition-all duration-300">{convertTemp(f.high)}°</span>
              <span className="text-[10px] text-slate-500 transition-all duration-300">{convertTemp(f.low)}°</span>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default ForecastChart;
