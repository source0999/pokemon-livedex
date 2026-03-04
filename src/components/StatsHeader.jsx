import React from "react";
import CircularProgress from "./CircularProgress";

export default function StatsHeader({ totalCaught, totalPossible, totalPercentage }) {
  const remainingCount = totalPossible - totalCaught;
  return (
    <div className="max-w-7xl mx-auto mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#0a0a0f] border border-white/5 p-8 rounded-[2rem] flex flex-col items-center justify-center gap-4 relative overflow-hidden">
          <CircularProgress percentage={totalPercentage} size={110} strokeWidth={10} color="#a855f7" />
          <div className="text-center">
            <p className="text-[10px] text-purple-400 font-bold uppercase mb-1">Total Synchronization</p>
            <p className="text-2xl font-black text-white">{totalCaught} / {totalPossible}</p>
          </div>
        </div>
        <div className="bg-[#0a0a0f] border border-white/5 p-8 rounded-[2rem] flex flex-col items-center justify-center gap-4 relative overflow-hidden">
          <CircularProgress percentage={totalPercentage} size={110} strokeWidth={10} color="#06b6d4" />
          <div className="text-center">
            <p className="text-[10px] text-cyan-400 font-bold uppercase mb-1">Remaining Targets</p>
            <p className="text-2xl font-black text-white">{remainingCount}</p>
          </div>
        </div>
      </div>
    </div>
  );
}