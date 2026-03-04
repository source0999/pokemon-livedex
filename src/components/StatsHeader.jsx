import React from "react";

export default function StatsHeader({ totalCaught, totalPossible, totalPercentage, gamesStarted, user }) {
  return (
    <div className="max-w-7xl mx-auto mb-8">
      {/* THE GLOBAL GRAPH */}
      <div className="mb-8">
        <div className="flex justify-between items-end mb-2">
          <span className="text-[10px] font-mono text-purple-400 tracking-[0.2em]">MASTER_COLLECTION_SYNC</span>
          <span className="text-2xl font-black">{totalPercentage}%</span>
        </div>
        <div className="h-3 w-full bg-slate-900 rounded-full overflow-hidden border border-purple-500/20">
          <div 
            className="h-full bg-gradient-to-r from-purple-600 to-cyan-400 shadow-[0_0_15px_#a855f7] transition-all duration-1000" 
            style={{ width: `${totalPercentage}%` }}
          />
        </div>
      </div>

      {/* STATS BOXES */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "TOTAL_CAUGHT", value: totalCaught },
          { label: "REMAINING", value: totalPossible - totalCaught },
          { label: "GAMES_ACTIVE", value: `${gamesStarted} / 30` },
          { label: "SYSTEM_STATUS", value: user ? "SYNCED" : "OFFLINE", color: user ? "text-green-400" : "text-red-400" }
        ].map((stat, i) => (
          <div key={i} className="bg-slate-900/40 border border-purple-500/10 p-4 rounded-2xl">
            <p className="text-[10px] text-purple-400 font-mono mb-1">{stat.label}</p>
            <p className={`text-xl font-bold ${stat.color || "text-white"}`}>{stat.value}</p>
          </div>
        ))}
      </section>
    </div>
  );
}