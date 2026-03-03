export default function StatsHeader({ label, current, total, stats = [] }) {
  const percent = Math.min(Math.round((current / total) * 100) || 0, 100);
  
  return (
    <div className="w-full space-y-8">
      <div className="glass p-8 rounded-3xl relative overflow-hidden">
        <div className="flex justify-between items-end relative z-10 mb-4">
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-purple-400">{label}</p>
          <span className="text-xs font-mono text-slate-400">{current} / {total}</span>
        </div>
        <div className="h-2 w-full bg-slate-900 rounded-full relative overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-purple-600 to-cyan-500 shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all duration-1000"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      {stats.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <div key={i} className="glass p-6 rounded-2xl border-purple-500/10">
              <p className="text-[9px] uppercase font-bold text-slate-500 mb-2 tracking-[0.2em]">{stat.label}</p>
              <p className="text-2xl font-black text-white">{stat.value}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}