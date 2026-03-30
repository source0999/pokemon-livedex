import React from "react";

const StatsHeader = ({ progress }) => {
  // Safe math: calculate total caught across all games
  const totalCaught = progress ? Object.values(progress).flat().length : 0;
  const totalGoal = 151; // Adjust based on your current goal

  const percentage = totalGoal > 0 ? Math.round((totalCaught / totalGoal) * 100) : 0;
  const remaining = Math.max(0, totalGoal - totalCaught);

  return (
    <div className="flex gap-12 justify-center items-center py-6 bg-[#0a0a0f] rounded-3xl border border-white/5">
      <div className="flex flex-col items-center">
        <div className="relative w-16 h-16 flex items-center justify-center border-4 border-purple-500 rounded-full shadow-[0_0_15px_rgba(168,85,247,0.4)]">
          <span className="text-sm font-black italic">{percentage}%</span>
        </div>
        <span className="text-[10px] text-purple-400 mt-3 font-black uppercase tracking-widest">Total Synchronization</span>
      </div>

      <div className="flex flex-col items-center">
        <div className="relative w-16 h-16 flex items-center justify-center border-4 border-cyan-500 rounded-full shadow-[0_0_15px_rgba(6,182,212,0.4)]">
          <span className="text-sm font-black italic">{remaining}</span>
        </div>
        <span className="text-[10px] text-cyan-400 mt-3 font-black uppercase tracking-widest">Remaining Targets</span>
      </div>
    </div>
  );
};

export default StatsHeader;