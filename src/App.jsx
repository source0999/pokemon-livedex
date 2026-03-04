import React, { useState, useEffect } from "react";
import { auth, provider, db } from "./firebase";
import { signInWithPopup, onAuthStateChanged, signOut } from "firebase/auth";
import { doc, setDoc, onSnapshot, collection, query } from "firebase/firestore";
import { GAME_CONFIG } from "./gameConfig.js";

import PokemonTile from "./components/PokemonTile.jsx";
import StatsHeader from "./components/StatsHeader.jsx";
import GameCard from "./components/GameCard.jsx";
import BacklogManager from "./components/BacklogManager";
import CircularProgress from "./components/CircularProgress";

export default function App() {
  const [activeTab, setActiveTab] = useState("DEX");
  const [user, setUser] = useState(null);
  const [selectedGame, setSelectedGame] = useState(null);
  const [pokemon, setPokemon] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [progress, setProgress] = useState({});
  const [libraryGames, setLibraryGames] = useState([]);
  const [loading, setLoading] = useState(true);

  // Global Stat Calculations
  const totalPossible = Object.values(GAME_CONFIG).reduce((acc, g) => acc + g.total, 0);
  const totalCaught = Object.values(progress).reduce((acc, list) => acc + (list?.length || 0), 0);
  const totalPercentage = totalPossible > 0 ? ((totalCaught / totalPossible) * 100).toFixed(1) : 0;
  const libraryTotal = libraryGames.length;
const libraryCompleted = libraryGames.filter(g => g.status === "COMPLETED").length;
const libraryPercent = libraryTotal > 0 ? ((libraryCompleted / libraryTotal) * 100).toFixed(1) : 0;

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        onSnapshot(doc(db, "users", currentUser.uid), (snap) => {
          if (snap.exists()) setProgress(snap.data().progress || {});
          setLoading(false);
        });
        const libQuery = query(collection(db, "users", currentUser.uid, "library"));
        onSnapshot(libQuery, (snap) => {
          setLibraryGames(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        });
      } else {
        setLoading(false);
        setProgress({});
        setLibraryGames([]);
      }
    });
    return () => unsubAuth();
  }, []);

  const loadGame = async (key) => {
    const res = await fetch(`https://pokeapi.co/api/v2/pokedex/${GAME_CONFIG[key].api}/`);
    const data = await res.json();
    setPokemon(data.pokemon_entries.map(e => ({
      id: e.pokemon_species.url.split('/').filter(Boolean).pop(),
      name: e.pokemon_species.name
    })));
    setSelectedGame(key);
  };

  const toggleCaught = async (id) => {
    if (!user) return;
    const current = progress[selectedGame] || [];
    const newList = current.includes(id) ? current.filter(i => i !== id) : [...current, id];
    const newProgress = { ...progress, [selectedGame]: newList };
    setProgress(newProgress);
    await setDoc(doc(db, "users", user.uid), { progress: newProgress }, { merge: true });
  };

  if (loading) return null;

  return (
    <div className="min-h-screen p-8 text-white bg-[#02010a]">
      <nav className="max-w-7xl mx-auto mb-12 flex justify-between items-center border-b border-white/5 pb-8">
        <h1 className="text-3xl font-black text-purple-500 italic uppercase">Aether.sys</h1>
        <div className="flex bg-white/5 p-1 rounded-2xl border border-white/5 shadow-inner">
          <button onClick={() => {setActiveTab("DEX"); setSelectedGame(null);}} className={`px-8 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${activeTab === "DEX" ? "bg-purple-600 text-white shadow-lg" : "text-slate-500"}`}>Master_Dex</button>
          <button onClick={() => setActiveTab("BACKLOG")} className={`px-8 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${activeTab === "BACKLOG" ? "bg-purple-600 text-white shadow-lg" : "text-slate-500"}`}>Game_Library</button>
        </div>
        {user ? <button onClick={() => signOut(auth)} className="text-[10px] text-slate-500 font-black">EXIT_SESSION</button> : <button onClick={() => signInWithPopup(auth, provider)} className="text-xs font-bold text-purple-400">AUTHORIZE</button>}
      </nav>

      <main className="max-w-7xl mx-auto">
        {activeTab === "DEX" ? (
          <>
            {/* FORCE HEADER TO SHOW ON MAIN LIST */}
            {!selectedGame && (
               <StatsHeader 
                totalCaught={totalCaught} 
                totalPossible={totalPossible} 
                totalPercentage={totalPercentage} 
                user={user} 
              />
            )}

            {!selectedGame ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {Object.keys(GAME_CONFIG).map(key => (
                  <GameCard key={key} gameKey={key} config={GAME_CONFIG[key]} progress={progress} onClick={loadGame} />
                ))}
              </div>
            ) : (
              <div className="animate-in fade-in duration-500">
                <div className="bg-[#0a0a0f] border border-white/5 p-8 rounded-[2.5rem] mb-10 flex items-center gap-8 shadow-2xl overflow-hidden">
                   <CircularProgress percentage={((progress[selectedGame]?.length || 0) / GAME_CONFIG[selectedGame].total * 100).toFixed(1)} size={80} strokeWidth={8} color="#a855f7" />
                   <h2 className="text-2xl font-black italic uppercase flex-1">{GAME_CONFIG[selectedGame].label}</h2>
                   <input type="text" placeholder="Search Dex..." className="bg-slate-900 border border-white/5 rounded-2xl py-4 px-6 text-sm outline-none focus:border-purple-500/50 transition-all" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                   <button onClick={() => setSelectedGame(null)} className="bg-white/5 px-8 py-4 rounded-2xl text-[10px] font-black hover:bg-white/10 transition-all">BACK</button>
                </div>
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3">
                  {pokemon.filter(p => p.name.includes(searchQuery.toLowerCase())).map(p => (
                    <PokemonTile key={p.id} {...p} isCaught={progress[selectedGame]?.includes(p.id)} onToggle={toggleCaught} />
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
        <BacklogManager user={user} games={libraryGames} />
        )}
      </main>
    </div>
  );
}