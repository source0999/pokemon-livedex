import React from 'react';

export default function DexGrid({ gameKey, config, pokemon, progress, onToggle, onBack }) {
  const toggle = (id) => {
    const newList = progress.includes(id) ? progress.filter(i => i !== id) : [...progress, id];
    onToggle(newList);
  };

  return (
    <div className="animate-in fade-in duration-500">
      <div className="bg-[#0a0a0f] border border-white/5 p-8 rounded-[2.5rem] mb-10 flex items-center gap-8">
        <img src={config.img} className="w-16 h-20 object-contain rounded shadow-lg" alt="" />
        <div className="flex-1">
          <h2 className="text-2xl font-black italic uppercase leading-none">{config.label}</h2>
          <p className="text-purple-400 font-bold text-sm mt-1 uppercase tracking-widest">{progress.length} / {config.total} Caught</p>
        </div>
        <button onClick={onBack} className="bg-white/5 px-8 py-3 rounded-xl text-[10px] font-black uppercase border border-white/10">Back to Library</button>
      </div>

      <SaveImporter selectedGame={gameKey} onImport={onToggle} />

      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3 mt-8">
        {pokemon.map(p => (
          <div 
            key={p.id} 
            onClick={() => toggle(p.id)} 
            className={`aspect-square rounded-2xl border transition-all cursor-pointer flex flex-col items-center justify-center p-2 ${
              progress.includes(p.id) 
                ? "bg-purple-600 border-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.3)]" 
                : "bg-white/5 border-white/5 grayscale opacity-40 hover:opacity-100"
            }`}
          >
            <img src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.id}.png`} alt={p.name} className="w-full h-auto object-contain" />
            <span className="text-[8px] font-black uppercase truncate w-full text-center mt-1">{p.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}