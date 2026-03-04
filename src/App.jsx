import React, { useState, useEffect } from "react";
import { auth, provider, db } from "./firebase";
import { signInWithPopup, onAuthStateChanged, signOut, signInWithRedirect } from "firebase/auth";
import { doc, setDoc, getDoc, onSnapshot } from "firebase/firestore";
import { GAME_CONFIG } from "./gameConfig.js";
import PokemonTile from "./components/PokemonTile.jsx";

export default function App() {
  const [user, setUser] = useState(null);
  const [selectedGame, setSelectedGame] = useState(null);
  const [pokemon, setPokemon] = useState([]);
  const [progress, setProgress] = useState({});

  // 1. Listen for User Login
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // 2. Real-time sync with Cloud
        const userDoc = doc(db, "users", currentUser.uid);
        return onSnapshot(userDoc, (doc) => {
          if (doc.exists()) setProgress(doc.data().progress || {});
        });
      } else {
        setProgress({}); // Reset if logged out
      }
    });
    return () => unsubscribe();
  }, []);

  const login = () => signInWithRedirect(auth, provider);
  const logout = () => signOut(auth);

  // 3. Save to Cloud when progress changes
  const toggleCaught = async (id) => {
    if (!user) return alert("Please sign in to save progress!");
    
    const current = progress[selectedGame] || [];
    const updated = current.includes(id) ? current.filter(i => i !== id) : [...current, id];
    const newProgress = { ...progress, [selectedGame]: updated };
    
    setProgress(newProgress);
    await setDoc(doc(db, "users", user.uid), { progress: newProgress }, { merge: true });
  };

  const loadGame = async (gameKey) => {
    const pokedexId = GAME_CONFIG[gameKey].api;
    const res = await fetch(`https://pokeapi.co/api/v2/pokedex/${pokedexId}/`);
    const data = await res.json();
    setPokemon(data.pokemon_entries.map(e => ({
      id: e.pokemon_species.url.split('/').filter(Boolean).pop(),
      name: e.pokemon_species.name
    })));
    setSelectedGame(gameKey);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  return (
    <div className="min-h-screen p-8 text-white bg-[#02010a]">
      <nav className="flex justify-between items-center mb-12 max-w-7xl mx-auto">
        <h1 className="text-2xl font-black tracking-tighter text-purple-500">AETHER.DEX</h1>
        {user ? (
          <div className="flex items-center gap-4">
            <img src={user.photoURL} className="w-8 h-8 rounded-full border border-purple-500" alt="profile" />
            <button onClick={logout} className="text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-white">Sign Out</button>
          </div>
        ) : (
          <button onClick={login} className="glass px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-purple-600 transition-all">
            Initialize Sync (Login)
          </button>
        )}
      </nav>

      <main className="max-w-7xl mx-auto">
        {!selectedGame ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Object.keys(GAME_CONFIG).map(key => (
              <div key={key} onClick={() => loadGame(key)} className="glass p-6 rounded-3xl cursor-pointer hover:border-purple-500 transition-all">
                <img src={GAME_CONFIG[key].img} className="h-32 w-full object-cover rounded-xl mb-4 opacity-50" />
                <h3 className="font-bold">{GAME_CONFIG[key].label}</h3>
                <p className="text-xs text-purple-400 font-mono">
                  {progress[key]?.length || 0} / {GAME_CONFIG[key].total}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div>
            <button onClick={() => setSelectedGame(null)} className="mb-8 text-purple-400 font-bold uppercase text-xs tracking-widest">← Back to Base</button>
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3">
              {pokemon.map(p => (
                <PokemonTile 
                  key={p.id} 
                  {...p} 
                  isCaught={progress[selectedGame]?.includes(p.id)} 
                  onToggle={toggleCaught} 
                />
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}