import React, { useState, useEffect } from "react";
import StatsHeader from "./components/StatsHeader.jsx";
import PokemonTile from "./components/PokemonTile.jsx";
import { GAME_CONFIG } from "./gameConfig.js";

export default function App() {
  const [selectedGame, setSelectedGame] = useState(null);
  const [pokemon, setPokemon] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [progress, setProgress] = useState(() => 
    JSON.parse(localStorage.getItem('livedex-v2')) || {}
  );

  // FIX: Reset scroll position when changing views
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [selectedGame]);

  useEffect(() => {
    localStorage.setItem('livedex-v2', JSON.stringify(progress));
  }, [progress]);

  const loadGame = async (gameKey) => {
    try {
      setSearchTerm("");
      const pokedexId = GAME_CONFIG[gameKey].api;
      
      const res = await fetch(`https://pokeapi.co/api/v2/pokedex/${pokedexId}/`);
      if (!res.ok) throw new Error("Pokedex not found");
      const data = await res.json();
      
      const entryData = data.pokemon_entries.map(e => ({
        id: e.pokemon_species.url.split('/').filter(Boolean).pop(),
        name: e.pokemon_species.name
      }));

      setPokemon(entryData);
      setSelectedGame(gameKey);
    } catch (error) {
      console.error("Sync Error:", error);
    }
  };

  const toggleCaught = (id) => {
    const current = progress[selectedGame] || [];
    const updated = current.includes(id) ? current.filter(i => i !== id) : [...current, id];
    setProgress({ ...progress, [selectedGame]: updated });
  };

  const gameKeys = Object.keys(GAME_CONFIG);
  const globalTotal = gameKeys.reduce((acc, k) => acc + GAME_CONFIG[k].total, 0);
  const globalCaught = gameKeys.reduce((acc, k) => acc + (progress[k]?.length || 0), 0);
  
const dashboardStats = [
    { label: "POKÉMON CAUGHT", value: globalCaught },
    { label: "TOTAL GAMES", value: gameKeys.length },
    { label: "SYNC PROGRESS", value: `${Math.round((globalCaught/globalTotal)*100) || 0}%` },
    { label: "GAMES STARTED", value: gameKeys.filter(k => progress[k]?.length > 0).length }
  ];

  return (
    <div className="min-h-screen p-4 md:p-12 text-slate-100">
      <header className="max-w-7xl mx-auto mb-16">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-black tracking-widest uppercase italic text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
            AETHER.DEX
          </h1>
          <div className="hidden md:block px-4 py-1 rounded-full border border-purple-500/30 text-[10px] font-bold text-purple-400 tracking-[0.3em]">
            STREAMS_ENCRYPTED
          </div>
        </div>
        
        <StatsHeader 
          label="MASTER_COLLECTION_SYNC" 
          current={globalCaught} 
          total={globalTotal} 
          stats={!selectedGame ? dashboardStats : []}
        />
      </header>

      <main className="max-w-7xl mx-auto">
        {!selectedGame ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 animate-in fade-in duration-1000">
            {gameKeys.map((key, index) => {
              const caught = progress[key]?.length || 0;
              const total = GAME_CONFIG[key].total;
              const percent = Math.round((caught / total) * 100);

              return (
                <div 
                  key={key} 
                  onClick={() => loadGame(key)} 
                  className="group cursor-pointer glass rounded-3xl overflow-hidden hover:border-purple-400 transition-all duration-500 hover:-translate-y-2 animate-float"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="h-48 overflow-hidden relative">
                    <img src={GAME_CONFIG[key].img} className="w-full h-full object-cover opacity-30 group-hover:opacity-100 transition-all duration-700" alt={key} />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#02010a] to-transparent" />
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-slate-200 mb-4">{GAME_CONFIG[key].label}</h3>
                    <div className="flex justify-between items-end mb-2">
                      <span className="text-[10px] font-mono text-slate-500">{caught}/{total}</span>
                      <span className="text-lg font-black text-purple-400">{percent}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                       <div className="h-full bg-gradient-to-r from-purple-600 to-cyan-500 transition-all duration-1000" style={{ width: `${percent}%` }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
            <div className="flex flex-col md:flex-row justify-between gap-6 mb-12">
              <button 
                onClick={() => setSelectedGame(null)} 
                className="group flex items-center gap-2 text-xs font-bold text-purple-400 hover:text-white transition-colors uppercase tracking-[0.2em]"
              >
                <span className="group-hover:-translate-x-1 transition-transform">←</span> Return to Base
              </button>
              
              <div className="glass px-6 py-3 rounded-full flex items-center gap-4 w-full md:w-96">
                <span className="text-purple-500 text-[10px] font-bold">SCANNER:</span>
                <input 
                  type="text" 
                  placeholder="ID OR NAME..."
                  className="bg-transparent w-full text-xs outline-none text-white font-mono uppercase"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="glass p-10 rounded-[3rem] border-purple-500/20 mb-12 flex flex-col md:flex-row items-center gap-10">
               <div className="relative w-40 h-40 flex-shrink-0 animate-float">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="80" cy="80" r="74" fill="transparent" stroke="rgba(168, 85, 247, 0.05)" strokeWidth="4" />
                    <circle 
                      cx="80" cy="80" r="74" 
                      fill="transparent" 
                      stroke="url(#pGrad)" 
                      strokeWidth="6" 
                      strokeDasharray="465" 
                      strokeDashoffset={465 - (465 * (progress[selectedGame]?.length || 0) / GAME_CONFIG[selectedGame].total)} 
                      strokeLinecap="round"
                      className="transition-all duration-1000"
                    />
                    <defs>
                      <linearGradient id="pGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#a855f7" />
                        <stop offset="100%" stopColor="#06b6d4" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-3xl font-black text-white">{Math.round(((progress[selectedGame]?.length || 0) / GAME_CONFIG[selectedGame].total) * 100)}%</span>
                  </div>
               </div>

               <div className="flex-1 text-center md:text-left">
                  <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-white mb-6 leading-none">{GAME_CONFIG[selectedGame].label}</h2>
                  <div className="flex justify-center md:justify-start gap-10">
                    <div>
                      <p className="text-[10px] text-purple-400 font-bold tracking-[0.2em] mb-1">FOUND</p>
                      <span className="text-3xl font-mono">{progress[selectedGame]?.length || 0}</span>
                    </div>
                    <div className="w-px h-12 bg-slate-800 hidden md:block" />
                    <div>
                      <p className="text-[10px] text-purple-400 font-bold tracking-[0.2em] mb-1">REMAINING</p>
                      <span className="text-3xl font-mono text-slate-500">{GAME_CONFIG[selectedGame].total - (progress[selectedGame]?.length || 0)}</span>
                    </div>
                  </div>
               </div>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-7 lg:grid-cols-9 xl:grid-cols-11 gap-4">
              {pokemon
                .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.id.toString().includes(searchTerm))
                .map(p => (
                  <PokemonTile key={p.id} {...p} isCaught={progress[selectedGame]?.includes(p.id)} onToggle={toggleCaught} />
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}