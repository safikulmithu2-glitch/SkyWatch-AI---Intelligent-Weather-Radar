
import React, { useState, useRef, useEffect } from 'react';
import { Newspaper, ExternalLink, ArrowRight, RefreshCw, ChevronDown } from 'lucide-react';
import { WeatherNews } from '../types';

interface NewsPanelProps {
  news: WeatherNews[];
  location: string;
  onRefresh: () => Promise<void>;
}

const NewsPanel: React.FC<NewsPanelProps> = ({ news, location, onRefresh }) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const touchStartRef = useRef<number>(0);

  const PULL_THRESHOLD = 80;

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await onRefresh();
    setIsRefreshing(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (scrollRef.current && scrollRef.current.scrollTop === 0) {
      touchStartRef.current = e.touches[0].clientY;
      setIsPulling(true);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isPulling) return;
    const currentY = e.touches[0].clientY;
    const diff = currentY - touchStartRef.current;
    
    if (diff > 0) {
      // Resistance effect
      const distance = Math.min(diff * 0.4, PULL_THRESHOLD + 20);
      setPullDistance(distance);
      // Prevent scrolling while pulling
      if (diff > 10 && e.cancelable) e.preventDefault();
    }
  };

  const handleTouchEnd = async () => {
    if (!isPulling) return;
    setIsPulling(false);
    
    if (pullDistance >= PULL_THRESHOLD) {
      setPullDistance(PULL_THRESHOLD);
      setIsRefreshing(true);
      await onRefresh();
      setIsRefreshing(false);
    }
    setPullDistance(0);
  };

  return (
    <div className="glass rounded-3xl p-6 h-full flex flex-col relative overflow-hidden">
      {/* Pull to Refresh Indicator */}
      <div 
        className="absolute left-0 right-0 flex flex-col items-center justify-center pointer-events-none transition-all duration-200"
        style={{ 
          top: -40 + pullDistance, 
          opacity: Math.min(pullDistance / PULL_THRESHOLD, 1) 
        }}
      >
        <RefreshCw className={`w-6 h-6 text-blue-400 ${pullDistance >= PULL_THRESHOLD ? 'animate-spin' : ''}`} />
        <span className="text-[10px] font-bold text-blue-400 uppercase mt-1 tracking-tighter">
          {pullDistance >= PULL_THRESHOLD ? 'Release to refresh' : 'Pull to refresh'}
        </span>
      </div>

      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className="flex items-center gap-2">
          <div className="bg-orange-500/20 p-2 rounded-lg">
            <Newspaper className="w-5 h-5 text-orange-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Weather News</h3>
            <p className="text-xs text-slate-500">Latest updates for {location}</p>
          </div>
        </div>
        
        <button 
          onClick={handleManualRefresh}
          disabled={isRefreshing}
          className={`p-2 rounded-full hover:bg-slate-800 transition-all ${isRefreshing ? 'opacity-50' : ''}`}
          title="Refresh news"
        >
          <RefreshCw className={`w-4 h-4 text-slate-400 ${isRefreshing ? 'animate-spin text-blue-400' : ''}`} />
        </button>
      </div>

      <div 
        ref={scrollRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="space-y-4 overflow-y-auto max-h-[800px] pr-2 custom-scrollbar relative z-10"
        style={{ transform: `translateY(${pullDistance}px)`, transition: isPulling ? 'none' : 'transform 0.3s ease-out' }}
      >
        {news.length === 0 ? (
          <p className="text-slate-500 text-sm text-center py-10">No recent weather news found for this region.</p>
        ) : (
          news.map((item, idx) => (
            <a 
              key={`${location}-${idx}`} 
              href={item.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className={`block group bg-slate-800/30 hover:bg-slate-800/60 border border-slate-700/50 rounded-2xl p-4 transition-all hover:scale-[1.02] active:scale-[0.98] animate-fade-in-up delay-${Math.min(idx + 1, 10)}`}
            >
              <div className="flex justify-between items-start gap-2 mb-2">
                <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">{item.source}</span>
                <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-blue-400 transition-colors" />
              </div>
              <h4 className="text-sm font-semibold text-white group-hover:text-blue-200 mb-2 line-clamp-2 leading-snug">
                {item.title}
              </h4>
              <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                {item.snippet}
              </p>
              <div className="mt-3 flex items-center text-[10px] text-slate-500 font-medium group-hover:text-slate-300">
                Read full coverage <ArrowRight className="w-3 h-3 ml-1" />
              </div>
            </a>
          ))
        )}
      </div>
      
      <div className="mt-auto pt-6 border-t border-slate-700/50 text-[10px] text-slate-500 flex justify-between relative z-10">
        <span>Powered by Gemini Search</span>
        <span>Verified Sources</span>
      </div>
    </div>
  );
};

export default NewsPanel;
