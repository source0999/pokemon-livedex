import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { doc, updateDoc, deleteDoc, setDoc, serverTimestamp } from "firebase/firestore";
import CircularProgress from "./CircularProgress"; 

export default function BacklogManager({ user, games = [] }) {
  const [isAdding, setIsAdding] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [filter, setFilter] = useState("PLAYING");

  const total = games.length;
  const completed = games.filter(g => g.status === "COMPLETED").length;
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

  const RAWG_KEY = "ca54d0fddb3f484d9c24fa453b5923b3"; 

  useEffect(() => {
    if (query.length < 3) return setResults([]);
    const delay = setTimeout(async () => {
      try {
        const res = await fetch(`https://api.rawg.io/api/games?key=${RAWG_KEY}&search=${encodeURIComponent(query)}&page_size=5`);
        const data = await res.json();
        setResults(data.results || []);
      } catch (err) { console.error(err); }
    }, 600);
    return () => clearTimeout(delay);
  }, [query]);

  // Moves an existing game to a specific category
  const moveGame = async (gameId, newStatus) => {
    if (!user) return;
    await updateDoc(doc(db, "users", user.uid, "library", gameId), {
      status: newStatus
    });
  };

  const addGameWithStatus = async (game, status) => {
    if (!user) return;
    await setDoc(doc(db, "users", user.uid, "library", game.id.toString()), {
      label: game.name,
      image: game.background_image || "",
      status: status,
      addedAt: serverTimestamp()
    });
    setIsAdding(false);
    setQuery("");
  };

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-700">
      {/* STATS HEADER */}
      <div className="flex items-center justify-between mb-12">
        <div className="flex items-center gap-6">
          <CircularProgress percentage={percent} size={60} strokeWidth={6} color="#a855f7" />
          <div>
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Collection Status</h2>
            <p className="text-xl font-bold italic text-white uppercase">{completed} / {total} Finished</p>
          </div>
        </div>
        <button onClick={() => setIsAdding(!isAdding)} className="bg-white text-black text-[10px] font-black px-8 py-3 rounded-full uppercase hover:bg-purple-600 hover:text-white transition-all shadow-2xl">
          {isAdding ? "Cancel Search" : "Add New Game"}
        </button>
      </div>

      {/* SEARCH INTERFACE */}
      {isAdding && (
        <div className="mb-12 bg-[#0d0d14] border border-white/5 p-8 rounded-[2rem] shadow-2xl animate-in slide-in-from-top-4">
          <input 
            className="w-full bg-black/40 border border-white/5 rounded-2xl px-6 py-4 text-white mb-6 focus:border-purple-500/50 outline-none font-bold" 
            placeholder="Search for a game to add..." 
            value={query} 
            onChange={(e) => setQuery(e.target.value)} 
          />
          <div className="space-y-3">
            {results.map(g => (
              <div key={g.id} className="flex items-center gap-4 p-4 bg-white/[0.02] rounded-3xl border border-white/5">
                <img src={g.background_image} className="w-20 h-12 object-cover rounded-xl shadow-lg" />
                <span className="flex-1 font-bold text-white text-sm">{g.name}</span>
                <div className="flex gap-2">
                  {["TODO", "PLAYING", "COMPLETED"].map(status => (
                    <button 
                      key={status}
                      onClick={() => addGameWithStatus(g, status)}
                      className="bg-white/5 hover:bg-purple-600 text-[8px] font-black px-3 py-2 rounded-lg transition-all border border-white/5 uppercase"
                    >
                      + {status}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FILTER TABS */}
      <div className="flex gap-3 mb-8 overflow-x-auto pb-2 scrollbar-hide">
        {["PLAYING", "TODO", "COMPLETED", "ALL"].map(cat => (
          <button key={cat} onClick={() => setFilter(cat)} className={`text-[10px] font-bold px-6 py-2 rounded-xl border transition-all ${filter === cat ? "bg-purple-600 border-purple-600 text-white shadow-lg shadow-purple-600/20" : "border-white/5 text-slate-500 hover:text-white"}`}>{cat}</button>
        ))}
      </div>

      {/* THE GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {games.filter(g => filter === "ALL" || g.status === filter).map(game => (
          <div key={game.id} className="relative bg-[#050508] border border-white/5 rounded-[2rem] overflow-hidden h-60 group transition-all hover:border-white/10">
            <img src={game.image} className={`absolute inset-0 w-full h-full object-cover opacity-20 transition-all duration-700 ${game.status === 'COMPLETED' ? 'grayscale opacity-5' : 'group-hover:opacity-30'}`} />
            
            <div className="relative p-6 flex flex-col justify-between h-full">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-black text-white italic leading-tight uppercase tracking-tighter">{game.label}</h3>
                  <span className="text-[8px] font-black text-purple-500 uppercase tracking-widest bg-purple-500/10 px-2 py-0.5 rounded mt-1 inline-block">
                    Current: {game.status}
                  </span>
                </div>
                <button onClick={() => deleteDoc(doc(db, "users", user.uid, "library", game.id))} className="text-slate-600 hover:text-red-500 transition-colors p-2 bg-black/40 rounded-xl">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                </button>
              </div>

              {/* MOVE TO CONTROLS */}
              <div className="bg-black/40 border border-white/5 p-3 rounded-2xl backdrop-blur-sm">
                <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-2">Move To:</p>
                <div className="flex gap-1.5">
                  {["TODO", "PLAYING", "COMPLETED"].map(status => (
                    <button 
                      key={status}
                      disabled={game.status === status}
                      onClick={() => moveGame(game.id, status)}
                      className={`flex-1 text-[8px] font-black py-1.5 rounded-lg transition-all border ${
                        game.status === status 
                        ? "bg-white/5 border-transparent opacity-20 cursor-not-allowed" 
                        : "bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/20 text-white"
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}