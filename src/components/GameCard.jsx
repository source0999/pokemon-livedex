import React from 'react';

export default function GameCard({ gameKey, config, stats = [], onSelect, onClear }) {
  const count = stats.length || 0;
  const percent = config.total > 0 ? ((count / config.total) * 100).toFixed(0) : 0;

  const handleMainClick = () => {
    // Safety check: only call if onSelect is actually a function
    if (typeof onSelect === 'function') {
      onSelect(gameKey);
    } else {
      console.error("onSelect is not a function! Check MasterDex.jsx");
    }
  };

  return (
    <div 
      onClick={handleMainClick}
      className="group bg-[#0a0a0f] border border-white/5 rounded-[2rem] p-6 hover:border-purple-500/50 transition-all cursor-pointer flex flex-col items-center shadow-xl"
    >
      <div className="w-full aspect-[3/4] mb-4 overflow-hidden rounded-xl bg-black border border-white/5">
        <img 
          src={config.img} 
          alt={config.label} 
          className="w-full h-full object-cover transition-transform group-hover:scale-110"
        />
      </div>
      
      <h3 className="text-lg font-black italic uppercase text-white mb-4 leading-tight">{config.label}</h3>
      
      <div className="w-full flex justify-between items-end border-t border-white/5 pt-4">
        <div className="text-left">
          <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Status</p>
          <p className="text-xs font-bold text-white">{count} / {config.total}</p>
        </div>
        <span className="text-3xl font-black text-purple-600 italic">{percent}%</span>
      </div>

      <button 
        onClick={(e) => { 
          e.stopPropagation(); 
          if (typeof onClear === 'function') onClear(gameKey); 
        }}
        className="mt-4 text-[8px] font-black text-red-500/40 hover:text-red-500 uppercase transition-colors"
      >
        [ Reset Cache ]
      </button>
    </div>
  );
}