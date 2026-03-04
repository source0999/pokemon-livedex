import React from "react";
import CircularProgress from "./CircularProgress";

export default function StatsHeader({ totalCaught, totalPossible, totalPercentage, user }) {
  const remainingCount = totalPossible - totalCaught;
  // If we haven't caught any, this should show 0% progress on our remaining goal
  const progressTowardEnd = totalPossible > 0 ? (totalCaught / totalPossible) * 100 : 0;

  return (
    <div className="max-w-7xl mx-auto mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* MASTER SYNC */}
        <div className="bg-[#0a0a0f] border border-white/5 p-8 rounded-[2rem] flex flex-col items-center justify-center gap-4 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
          <CircularProgress percentage={totalPercentage} size={110} strokeWidth={10} color="#a855f7" />
          <div className="text-center">
            <p className="text-[10px] text-purple-400 font-bold tracking-[0.2em] uppercase mb-1">Total Progress</p>
            <p className="text-2xl font-black text-white">{totalCaught.toLocaleString()} / {totalPossible.toLocaleString()}</p>
          </div>
        </div>

        {/* REMAINING NODES */}
        <div className="bg-[#0a0a0f] border border-white/5 p-8 rounded-[2rem] flex flex-col items-center justify-center gap-4 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
          <CircularProgress percentage={totalPercentage} size={110} strokeWidth={10} color="#06b6d4" />
          <div className="text-center">
            <p className="text-[10px] text-cyan-400 font-bold tracking-[0.2em] uppercase mb-1">Remaining Nodes</p>
            <p className="text-2xl font-black text-white">{remainingCount.toLocaleString()}</p>
          </div>
        </div>

        {/* SYSTEM STATUS */}
        <div className="bg-[#0a0a0f] border border-white/5 p-8 rounded-[2rem] flex flex-col items-center justify-center shadow-2xl text-center">
          <p className="text-[10px] text-slate-500 font-bold tracking-[0.2em] uppercase mb-6">Link Status</p>
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              <div className={`w-3 h-3 rounded-full ${user ? 'bg-green-500' : 'bg-red-500'}`} />
              <div className={`absolute inset-0 w-3 h-3 rounded-full animate-ping ${user ? 'bg-green-500' : 'bg-red-500'} opacity-30`} />
            </div>
            <p className="font-bold text-lg text-white tracking-tight">
              {user ? "SYNC_ACTIVE" : "OFFLINE_MODE"}
            </p>
            <p className="text-[10px] text-slate-600 font-mono italic">Protocol: {user ? "Cloud_V3" : "Local_Cache"}</p>
          </div>
        </div>

      </div>
    </div>
  );
}