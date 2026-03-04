import React, { useState, useEffect } from "react";
import { auth, provider, db } from "./firebase";
import { signInWithPopup, signInWithRedirect, getRedirectResult, onAuthStateChanged, signOut } from "firebase/auth";
import { doc, setDoc, onSnapshot } from "firebase/firestore";
import { GAME_CONFIG } from "./gameConfig.js";
import PokemonTile from "./components/PokemonTile.jsx";
import StatsHeader from "./components/StatsHeader.jsx";
import GameCard from "./components/GameCard.jsx";

export default function App() {
  const [user, setUser] = useState(null);
  const [selectedGame, setSelectedGame] = useState(null);
  const [pokemon, setPokemon] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [progress, setProgress] = useState({});
  const [loading, setLoading] = useState(true);

  // --- CALCULATIONS ---
  const totalPossible = Object.values(GAME_CONFIG).reduce((acc, g) => acc + g.total, 0);
  const totalCaught = Object.values(progress).reduce((acc, list) => acc + (list?.length || 0), 0);
  const totalPercentage = ((totalCaught / totalPossible) * 100).toFixed(1);
  const gamesStarted = Object.keys(progress).filter(key => progress[key]?.length > 0).length;

  // Filter pokemon based on search
  const filteredPokemon = pokemon.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.id.toString() === searchQuery
  );

  useEffect(() => {
    getRedirectResult(auth).catch((e) => console.error(e));
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        onSnapshot(doc(db, "users", currentUser.uid), (snap) => {
          if (snap.exists()) setProgress(snap.data().progress || {});
          setLoading(false);
        });
      } else { setLoading(false); }
    });
    return () => unsubscribe();
  }, []);

  const login = async () => {
    try { await signInWithPopup(auth, provider); } 
    catch (e) { await signInWithRedirect(auth, provider); }
  };

  const loadGame = async (key) => {
    const res = await fetch(`https://pokeapi.co/api/v2/pokedex/${GAME_CONFIG[key].api}/`);
    const data = await res.json();
    setPokemon(data.pokemon_entries.map(e => ({
      id: e.pokemon_species.url.split('/').filter(Boolean).pop(),
      name: e.pokemon_species.name
    })));
    setSelectedGame(key);
    setSearchQuery(""); // Clear search when swapping games
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleCaught = async (id) => {
    if (!user) return alert("Sign in to sync!");
    const current = progress[selectedGame] || [];
    const newList = current.includes(id) ? current.filter(i => i !== id) : [...current, id];
    const newProgress = { ...progress, [selectedGame]: newList };
    setProgress(newProgress);
    await setDoc(doc(db, "users", user.uid), { progress: newProgress }, { merge: true });
  };

  if (loading) return <div className="bg-[#02010a] min-h-screen flex items-center justify-center text-purple-500 font-mono">LOADING_AETHER...</div>;

  return (
    <div className="min-h-screen p-8 text-white bg-[#02010a]">
      {/* NAV */}
      <nav className="flex justify-between items-center mb-8 max-w-7xl mx-auto">
        <h1 className="text-3xl font-black tracking-tighter text-purple-500">AETHER.DEX</h1>
        {user ? (
          <div className="flex items-center gap-4">
            <img src={user.photoURL} className="w-10 h-10 rounded-full border-2 border-purple-500" />
            <button onClick={() => signOut(auth)} className="text-[10px] font-bold text-slate-500 uppercase">Log_Out</button>
          </div>
        ) : (
          <button onClick={login} className="glass px-6 py-2 rounded-full text-xs font-bold uppercase">Initialize_Sync</button>
        )}
      </nav>

      <StatsHeader 
        totalCaught={totalCaught} 
        totalPossible={totalPossible} 
        totalPercentage={totalPercentage} 
        gamesStarted={gamesStarted} 
        user={user} 
      />

      <main className="max-w-7xl mx-auto">
        {!selectedGame ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Object.keys(GAME_CONFIG).map(key => (
              <GameCard key={key} gameKey={key} config={GAME_CONFIG[key]} progress={progress} onClick={loadGame} />
            ))}
          </div>
        ) : (
          <div>
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
              <button onClick={() => setSelectedGame(null)} className="text-purple-400 font-bold text-[10px] tracking-widest uppercase hover:text-white">
                ← RETURN_TO_BASE
              </button>
              
              {/* SEARCH BAR */}
              <div className="relative w-full md:w-64">
                <input 
                  type="text"
                  placeholder="SEARCH_BY_NAME_OR_ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-900 border border-purple-500/20 rounded-full py-2 px-6 text-xs font-mono focus:outline-none focus:border-purple-500 transition-all"
                />
              </div>

              <h2 className="text-xl font-black italic uppercase text-purple-500">{GAME_CONFIG[selectedGame].label}</h2>
            </div>
            
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3">
              {filteredPokemon.map(p => (
                <PokemonTile key={p.id} {...p} isCaught={progress[selectedGame]?.includes(p.id)} onToggle={toggleCaught} />
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}