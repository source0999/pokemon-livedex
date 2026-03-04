import React, { useState, useEffect } from "react";
import { auth, provider, db } from "./firebase";
import { 
  signInWithPopup, 
  signInWithRedirect, 
  getRedirectResult, 
  onAuthStateChanged, 
  signOut 
} from "firebase/auth";
import { doc, setDoc, onSnapshot } from "firebase/firestore";
import { GAME_CONFIG } from "./gameConfig.js";
import PokemonTile from "./components/PokemonTile.jsx";

export default function App() {
  const [user, setUser] = useState(null);
  const [selectedGame, setSelectedGame] = useState(null);
  const [pokemon, setPokemon] = useState([]);
  const [progress, setProgress] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Handle returning from a Redirect login
    getRedirectResult(auth).catch((error) => {
      if (error.code !== "auth/redirect-cancelled-by-user") {
        console.error("Redirect Error:", error);
      }
    });

    // 2. Listen for Auth State changes
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // 3. Sync progress from Firestore
        const userDoc = doc(db, "users", currentUser.uid);
        const unsubSnapshot = onSnapshot(userDoc, (docSnap) => {
          if (docSnap.exists()) {
            setProgress(docSnap.data().progress || {});
          }
          setLoading(false);
        });
        return () => unsubSnapshot();
      } else {
        setProgress({});
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const login = async () => {
    console.log("Attempting Login...");
    try {
      // Attempt popup first
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Popup failed, trying redirect:", error);
      // If popup is blocked, use redirect
      if (error.code === "auth/popup-blocked" || error.code === "auth/cancelled-popup-request") {
        await signInWithRedirect(auth, provider);
      } else {
        alert("Login Error: " + error.message);
      }
    }
  };

  const logout = () => signOut(auth);

  const toggleCaught = async (id) => {
    if (!user) return alert("Sign in to save progress!");
    
    const currentList = progress[selectedGame] || [];
    const newList = currentList.includes(id) 
      ? currentList.filter(i => i !== id) 
      : [...currentList, id];
    
    const newProgress = { ...progress, [selectedGame]: newList };
    setProgress(newProgress);

    // Save to Firebase
    try {
      await setDoc(doc(db, "users", user.uid), { progress: newProgress }, { merge: true });
    } catch (err) {
      console.error("Save failed:", err);
    }
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) return <div className="bg-[#02010a] min-h-screen flex items-center justify-center text-purple-500 font-mono">INITIALIZING_AETHER...</div>;

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
            Initialize Sync
          </button>
        )}
      </nav>

      <main className="max-w-7xl mx-auto">
        {!selectedGame ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Object.keys(GAME_CONFIG).map(key => (
              <div key={key} onClick={() => loadGame(key)} className="glass p-6 rounded-3xl cursor-pointer border border-transparent hover:border-purple-500/50 transition-all group">
                <div className="relative overflow-hidden rounded-xl mb-4 h-32">
                   <img src={GAME_CONFIG[key].img} className="w-full h-full object-cover opacity-40 group-hover:opacity-100 transition-opacity" alt={key} />
                </div>
                <h3 className="font-bold text-lg">{GAME_CONFIG[key].label}</h3>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs text-purple-400 font-mono">
                    {progress[key]?.length || 0} / {GAME_CONFIG[key].total}
                  </span>
                  <div className="h-1 w-24 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-purple-500 transition-all duration-500" 
                      style={{ width: `${((progress[key]?.length || 0) / GAME_CONFIG[key].total) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div>
            <button onClick={() => setSelectedGame(null)} className="mb-8 text-purple-400 font-bold uppercase text-xs tracking-widest flex items-center gap-2">
              <span>←</span> BACK_TO_ORBIT
            </button>
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