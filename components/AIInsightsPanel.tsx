
import React from 'react';
import { Brain, Sparkles, ShieldCheck, Zap } from 'lucide-react';

interface AIInsightsPanelProps {
  insights: string;
  score: number;
}

const AIInsightsPanel: React.FC<AIInsightsPanelProps> = ({ insights, score }) => {
  return (
    <div className="glass rounded-3xl p-6 flex flex-col justify-between h-full relative overflow-hidden group">
      {/* Decorative Glow */}
      <div className="absolute top-0 left-0 -ml-10 -mt-10 w-40 h-40 bg-indigo-500/10 blur-[60px] rounded-full group-hover:bg-indigo-500/20 transition-colors duration-500"></div>
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Brain className="w-5 h-5 text-indigo-400 animate-pulse" />
            AI Prediction Engine
          </h3>
          <div className="flex gap-1.5">
            <span className="p-1.5 bg-indigo-500/10 rounded-lg" title="Pattern Recognition">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            </span>
            <span className="p-1.5 bg-blue-500/10 rounded-lg" title="Real-time Processing">
              <Zap className="w-3.5 h-3.5 text-blue-400" />
            </span>
          </div>
        </div>
        
        <div className="space-y-4">
          <p className="text-slate-200 leading-relaxed italic text-sm md:text-base">
            "{insights}"
          </p>
          
          <div className="flex flex-wrap gap-2">
            <div className="px-2 py-1 rounded-md bg-slate-800/50 border border-slate-700 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              Gemini 3 Flash
            </div>
            <div className="px-2 py-1 rounded-md bg-slate-800/50 border border-slate-700 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              Neural Analysis
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-slate-700/50 relative z-10">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-widest">Reliability Score</span>
          </div>
          <span className="text-sm font-bold text-white">{score}%</span>
        </div>
        
        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
          <div 
            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-1000 ease-out"
            style={{ width: `${score}%` }}
          ></div>
        </div>
        
        <p className="mt-2 text-[10px] text-slate-500 text-right">
          Confidence based on 48h temporal consistency
        </p>
      </div>
    </div>
  );
};

export default AIInsightsPanel;
