import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { doc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import CircularProgress from "./CircularProgress"; 
// Ensure SaveImporter.jsx exists in your components folder
import SaveImporter from "./SaveImporter"; 

export default function DexGrid({ gameKey, config, progress = [], onBack, user }) {
  const [pokemonList, setPokemonList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const percent = pokemonList.length > 0 
    ? Math.round((progress.length / pokemonList.length) * 100) 
    : 0;

  useEffect(() => {
    async function fetchDex() {
      if (!config?.api) return;
      setLoading(true);
      try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokedex/${config.api}/`);
        const data = await response.json();
        const pokes = data.pokemon_entries.map(entry => ({
          id: entry.pokemon_species.url.split('/').filter(Boolean).pop(),
          name: entry.pokemon_species.name
        }));
        setPokemonList(pokes);
      } catch (err) {
        console.error("Error fetching Pokedex:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchDex();
  }, [config]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-20 text-white">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mb-4"></div>
      <p className="font-black uppercase tracking-widest text-[10px]">Accessing Database...</p>
    </div>
  );

  const togglePokemon = async (id) => {
    if (!user) return;
    const userRef = doc(db, "users", user.uid);
    const isCaught = progress.includes(id);
    await updateDoc(userRef, {
      [`progress.${gameKey}`]: isCaught ? arrayRemove(id) : arrayUnion(id)
    });
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* NEW TOP BAR WITH GRAPH AND IMPORTER */}
      <div className="bg-[#0a0a0f] border border-white/5 rounded-[2.5rem] p-8 mb-8 flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl">
        <div className="flex items-center gap-6">
          <button onClick={onBack} className="p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-all border border-white/5 text-white group">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="group-hover:-translate-x-1 transition-transform"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          </button>
          
          <div className="flex items-center gap-6 border-l border-white/10 pl-6">
            <CircularProgress percentage={percent} size={70} strokeWidth={7} color="#a855f7" />
            <div>
              <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white leading-none">{config.label}</h2>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-2">Data Synchronized: {progress.length} Units</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
          {/* Re-adding the SaveImporter component */}
          <SaveImporter gameKey={gameKey} user={user} />
          
          <input 
            type="text"
            placeholder="Search Database..."
            className="bg-black/40 border border-white/5 rounded-2xl px-6 py-4 text-sm font-bold text-white outline-none focus:border-purple-500/50 flex-1 md:w-64 transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-3">
        {pokemonList.filter(p => p.name.includes(search.toLowerCase())).map((poke) => {
          const isCaught = progress.includes(poke.id);
          return (
            <button
              key={poke.id}
              onClick={() => togglePokemon(poke.id)}
              className={`relative aspect-square rounded-2xl border transition-all duration-300 group overflow-hidden ${
                isCaught 
                ? "bg-purple-600/20 border-purple-500/50" 
                : "bg-white/[0.02] border-white/5 hover:border-white/10"
              }`}
            >
              <span className="absolute top-2 left-2 text-[8px] font-black text-white/20">#{poke.id.toString().padStart(3, '0')}</span>
              <img 
                src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${poke.id}.png`}
                alt={poke.name}
                className={`w-full h-full object-contain p-2 transition-all duration-500 group-hover:scale-110 ${!isCaught ? 'grayscale opacity-30 brightness-50' : ''}`}
              />
              <div className="absolute bottom-0 left-0 right-0 p-1 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-[7px] font-black uppercase truncate text-center text-white">{poke.name}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}