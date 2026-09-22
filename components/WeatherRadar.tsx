
import React, { useState, useRef, useEffect } from 'react';
import { Radio, Plus, Minus, Maximize2, Clock, Info, RefreshCw, Power } from 'lucide-react';
import { RadarSnapshot } from '../types';

interface WeatherRadarProps {
  snapshot: RadarSnapshot | null;
  onRefresh: () => Promise<void>;
}

const WeatherRadar: React.FC<WeatherRadarProps> = ({ snapshot, onRefresh }) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isAutoSync, setIsAutoSync] = useState(true);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  
  const containerRef = useRef<HTMLDivElement>(null);
  const REFRESH_INTERVAL_SEC = 300;

  useEffect(() => {
    if (!isAutoSync) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          triggerRefresh();
          return REFRESH_INTERVAL_SEC;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onRefresh, isAutoSync]);

  const triggerRefresh = async () => {
    setIsRefreshing(true);
    try {
      await onRefresh();
    } catch (e) {
      console.error("Radar refresh failed", e);
    } finally {
      setIsRefreshing(false);
      setTimeLeft(REFRESH_INTERVAL_SEC);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setScale(prev => Math.min(Math.max(prev * delta, 0.5), 4));
  };

  const resetView = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const zoomIn = () => setScale(prev => Math.min(prev + 0.2, 4));
  const zoomOut = () => setScale(prev => Math.max(prev - 0.2, 0.5));

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const getEchoColor = (type: string, intensity: number) => {
    if (type === 'snow') return 'bg-white';
    if (type === 'hail') return 'bg-cyan-200';
    if (type === 'storm') return 'bg-purple-600';
    
    // Rain intensity gradient
    if (intensity > 0.8) return 'bg-red-500';
    if (intensity > 0.6) return 'bg-orange-500';
    if (intensity > 0.4) return 'bg-yellow-500';
    if (intensity > 0.2) return 'bg-green-500';
    return 'bg-blue-500';
  };

  return (
    <div className="glass rounded-3xl p-6 flex flex-col h-[400px] select-none relative group">
      <div className="flex justify-between items-center mb-4">
        <div className="flex flex-col">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Radio className={`w-5 h-5 ${isRefreshing ? 'text-blue-400 animate-pulse' : isAutoSync ? 'text-green-400' : 'text-slate-500'}`} />
            Atmospheric Radar
          </h3>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="relative flex h-2 w-2">
              {isAutoSync && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>}
              <span className={`relative inline-flex rounded-full h-2 w-2 ${isAutoSync ? 'bg-green-500' : 'bg-slate-700'}`}></span>
            </span>
            <span className={`text-[10px] font-bold uppercase tracking-widest ${isAutoSync ? 'text-green-500' : 'text-slate-500'}`}>
              {isAutoSync ? 'Live Monitoring' : 'Sync Paused'}
            </span>
          </div>
        </div>
        
        <div className="flex flex-col items-end gap-1">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsAutoSync(!isAutoSync)}
              className={`flex items-center gap-1.5 px-2 py-1 rounded border transition-colors text-[10px] font-bold uppercase ${isAutoSync ? 'bg-green-500/10 border-green-500/50 text-green-400' : 'bg-slate-800 border-slate-700 text-slate-500 hover:text-slate-400'}`}
              title={isAutoSync ? "Disable Auto-Sync" : "Enable Auto-Sync"}
            >
              <Power className="w-3 h-3" />
              {isAutoSync ? 'Auto' : 'Manual'}
            </button>
            <div className="flex items-center gap-3">
              <button 
                onClick={triggerRefresh}
                disabled={isRefreshing}
                className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 hover:bg-slate-700 transition-colors"
                title="Manual Scan"
              >
                <RefreshCw className={`w-3 h-3 text-slate-400 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
          {isAutoSync && (
            <span className="text-[8px] text-slate-600 font-bold uppercase tracking-tighter">
              Next scan in {formatTime(timeLeft)}
            </span>
          )}
        </div>
      </div>

      <div 
        ref={containerRef}
        className={`flex-1 relative bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden cursor-${isDragging ? 'grabbing' : 'grab'}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        <div 
          className="absolute inset-0 transition-transform duration-75 ease-out origin-center"
          style={{ 
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})` 
          }}
        >
          {/* Background Grid */}
          <div className="absolute inset-[-100%] grid grid-cols-12 grid-rows-12 pointer-events-none opacity-20">
            {Array.from({ length: 144 }).map((_, i) => (
              <div key={i} className="border-[0.5px] border-slate-700"></div>
            ))}
          </div>

          {/* Centered rings */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none w-full h-full">
            {[10, 30, 60, 90, 120].map(size => (
              <div key={size} className="absolute border border-slate-700/50 rounded-full" style={{ width: `${size}%`, height: `${size}%` }}></div>
            ))}
            <div className="absolute w-full h-[1px] bg-slate-700/30"></div>
            <div className="absolute h-full w-[1px] bg-slate-700/30"></div>
          </div>

          {/* Real Radar Echoes */}
          {snapshot?.echoes.map((echo, i) => (
            <div
              key={i}
              className={`absolute rounded-full blur-xl transition-all duration-1000 ${getEchoColor(echo.type, echo.intensity)}`}
              style={{
                left: `${50 + (echo.x / 2)}%`, // Convert -100/100 to 0/100
                top: `${50 + (echo.y / 2)}%`,
                width: `${echo.size}px`,
                height: `${echo.size}px`,
                opacity: 0.3 + (echo.intensity * 0.6)
              }}
            ></div>
          ))}
        </div>

        {/* Floating Controls */}
        <div className="absolute bottom-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={zoomIn} className="p-2 bg-slate-800/80 hover:bg-slate-700 border border-slate-600 rounded-lg text-white"><Plus className="w-4 h-4" /></button>
          <button onClick={zoomOut} className="p-2 bg-slate-800/80 hover:bg-slate-700 border border-slate-600 rounded-lg text-white"><Minus className="w-4 h-4" /></button>
          <button onClick={resetView} className="p-2 bg-slate-800/80 hover:bg-slate-700 border border-slate-600 rounded-lg text-white"><Maximize2 className="w-4 h-4" /></button>
        </div>

        {isAutoSync && <div className="absolute inset-0 pointer-events-none radar-scan opacity-40"></div>}
      </div>

      <div className="mt-3 flex items-center justify-between gap-4">
        {snapshot?.summary && (
          <div className="flex items-start gap-2 p-2 bg-slate-800/30 rounded-lg border border-slate-700/50 flex-1">
            <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <p className="text-[10px] text-slate-300 leading-tight">{snapshot.summary}</p>
          </div>
        )}
        <div className="flex flex-col items-end">
           <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-slate-800 text-[10px] text-slate-400 border border-slate-700">
              <Clock className="w-3 h-3" />
              <span>{snapshot?.timestamp || 'N/A'}</span>
            </div>
        </div>
      </div>
      
      <div className="mt-auto flex justify-between text-[10px] text-slate-500 uppercase tracking-widest font-bold pt-2">
        <span>Intensity Index: {snapshot?.echoes.length ? 'Active' : 'Clear'}</span>
        <span>AI-Analyzed Imagery</span>
      </div>
    </div>
  );
};

export default WeatherRadar;
