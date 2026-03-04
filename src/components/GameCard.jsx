import React from "react";

export default function GameCard({ gameKey, config, progress, onClick }) {
  const caught = progress[gameKey]?.length || 0;
  const percent = ((caught / config.total) * 100).toFixed(0);

  return (
    <div onClick={() => onClick(gameKey)} className="glass p-6 rounded-3xl cursor-pointer hover:border-purple-500/50 transition-all group">
      <img src={config.img} className="w-full h-32 object-contain opacity-60 group-hover:opacity-100 mb-4 transition-all" alt={config.label} />
      <h3 className="font-bold text-lg">{config.label}</h3>
      <div className="flex justify-between mt-2 text-[10px] font-mono text-purple-400">
        <span>{caught} / {config.total}</span>
        <span>{percent}%</span>
      </div>
    </div>
  );
}