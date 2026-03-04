import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { doc, updateDoc, deleteDoc, setDoc, serverTimestamp } from "firebase/firestore";
import CircularProgress from "./CircularProgress"; 

export default function BacklogManager({ user, games = [] }) {
  const [isAdding, setIsAdding] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [filter, setFilter] = useState("PLAYING"); // Playing is now the default view
  const [selectedCategory, setSelectedCategory] = useState("TODO"); // Default category for new games

  const total = games.length;
  const completed = games.filter(g => g.status === "COMPLETED").length;
  const percent = total > 0 ? ((completed / total) * 100).toFixed(1) : 0;

  const MY_REAL_KEY = "ca54d0fddb3f484d9c24fa453b5923b3"; 
  
  // Reordered: Playing first, All last
  const categories = ["PLAYING", "TODO", "COMPLETED", "ALL"];
  const filteredGames = games.filter(g => filter === "ALL" || g.status === filter);

  useEffect(() => {
    if (query.length < 3) return setResults([]);
    const delay = setTimeout(async () => {
      try {
        const res = await fetch(`https://api.rawg.io/api/games?key=${MY_REAL_KEY}&search=${encodeURIComponent(query)}&page_size=5`);
        const data = await res.json();
        setResults(data.results || []);
      } catch (err) { console.error(err); }
    }, 600);
    return () => clearTimeout(delay);
  }, [query]);

  const addGame = async (game) => {
    if (!user) return;
    await setDoc(doc(db, "users", user.uid, "library", game.id.toString()), {
      label: game.name,
      image: game.background_image || "",
      status: selectedCategory, // Uses the category you chose in the popup
      addedAt: serverTimestamp()
    });
    setIsAdding(false);
    setQuery("");
  };

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-500">
      
      {/* 1. Header Area */}
      <div className="flex items-center justify-between mb-12">
        <div className="flex items-center gap-6">
          <CircularProgress percentage={percent} size={60} strokeWidth={6} color="#a855f7" />
          <div>
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500">Collection Status</h2>
            <p className="text-xl font-bold italic text-white uppercase">{completed} / {total} Finished</p>
          </div>
        </div>

        <button 
          onClick={() => setIsAdding(!isAdding)} 
          className="bg-white text-black text-[10px] font-black px-8 py-3 rounded-full uppercase hover:bg-purple-600 hover:text-white transition-all shadow-xl"
        >
          {isAdding ? "Close" : "Add Game"}
        </button>
      </div>

      {/* 2. Category Tabs (Playing First, All Last) */}
      <div className="flex gap-3 mb-10 overflow-x-auto pb-2 scrollbar-hide">
        {categories.map(cat => (
          <button 
            key={cat} 
            onClick={() => setFilter(cat)}
            className={`text-[10px] font-bold px-6 py-2 rounded-xl border transition-all ${
              filter === cat 
                ? "bg-purple-600 border-purple-600 text-white" 
                : "border-white/5 text-slate-500 hover:border-white/20"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* 3. Add Game Interface */}
      {isAdding && (
        <div className="mb-12 bg-[#0d0d14] border border-white/5 p-6 rounded-[2rem] shadow-2xl">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <input 
              className="flex-1 bg-black/40 border border-white/5 rounded-2xl px-6 py-4 text-white outline-none focus:border-purple-500/50 font-bold" 
              placeholder="Search database..." 
              value={query} 
              onChange={(e) => setQuery(e.target.value)} 
              autoFocus
            />
            {/* Category Selector for Adding */}
            <div className="flex bg-black/40 p-1 rounded-2xl border border-white/5">
              {["TODO", "PLAYING", "COMPLETED"].map(c => (
                <button 
                  key={c}
                  onClick={() => setSelectedCategory(c)}
                  className={`px-4 py-2 rounded-xl text-[9px] font-black transition-all ${selectedCategory === c ? "bg-purple-600 text-white" : "text-slate-500"}`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            {results.map(g => (
              <div key={g.id} className="flex items-center gap-4 p-3 bg-white/[0.02] rounded-2xl border border-white/5 hover:bg-white/[0.05]">
                <img src={g.background_image} className="w-16 h-10 object-cover rounded-xl" />
                <span className="flex-1 font-bold text-white text-sm">{g.name}</span>
                <button 
                  onClick={() => addGame(g)} 
                  className="bg-purple-600 text-white text-[9px] font-black px-6 py-2 rounded-xl hover:scale-105 transition-transform"
                >
                  Add to {selectedCategory}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Game Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredGames.map(game => (
          <div key={game.id} className="relative bg-[#050508] border border-white/5 rounded-[2rem] overflow-hidden h-52 group">
            <img 
               src={game.image} 
               className={`absolute inset-0 w-full h-full object-cover opacity-25 transition-all duration-700 ${game.status === 'COMPLETED' ? 'grayscale opacity-10' : 'group-hover:opacity-40'}`} 
            />
            <div className="relative p-6 flex flex-col justify-between h-full">
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-bold text-white italic leading-tight">{game.label}</h3>
                <button 
                  onClick={() => deleteDoc(doc(db, "users", user.uid, "library", game.id))} 
                  className="bg-black/40 text-slate-400 hover:text-red-500 p-2 rounded-xl transition-colors shadow-lg"
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                </button>
              </div>
              <div className="text-[9px] font-black px-4 py-2 rounded-full border border-white/10 self-start text-slate-400 uppercase tracking-widest bg-black/20">
                {game.status}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}