import React, { useState, useEffect } from "react";
import { auth, db } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, onSnapshot, collection, query } from "firebase/firestore";

import MasterDex from "./components/MasterDex";
import BacklogManager from "./components/BacklogManager";
import DexGrid from "./components/DexGrid";
import StatsHeader from "./components/StatsHeader";
import { GAME_CONFIG } from "./utils/gameConfig";

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedGame, setSelectedGame] = useState(null); 
  const [currentTab, setCurrentTab] = useState("master"); 
  const [progress, setProgress] = useState({});
  const [libraryGames, setLibraryGames] = useState([]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (u) {
        const pUnsub = onSnapshot(doc(db, "users", u.uid), (s) => {
          if (s.exists()) setProgress(s.data().progress || {});
        });

        const q = query(collection(db, "users", u.uid, "library"));
        const lUnsub = onSnapshot(q, (s) => {
          setLibraryGames(s.docs.map(d => ({ id: d.id, ...d.data() })));
          setLoading(false);
        });

        return () => { pUnsub(); lUnsub(); };
      } else {
        setLoading(false);
      }
    });
    return () => unsub();
  }, []);

  if (loading) return <div className="min-h-screen bg-[#02010a]" />;

  return (
    <div className="min-h-screen p-8 text-white bg-[#02010a] font-sans">
      {/* 1. TOP BAR: Title and Tab Toggle */}
      <nav className="max-w-7xl mx-auto flex justify-between items-center border-b border-white/5 pb-6">
        <div className="flex flex-col">
          <h1 className="text-4xl font-black text-purple-500 italic uppercase tracking-tighter leading-none">AETHER.SYS</h1>
          <div className="flex gap-2 mt-1">
            <span className="text-[9px] bg-purple-600 px-2 py-0.5 rounded font-black uppercase tracking-widest text-white">Terminal Active</span>
            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">V3.0.1</span>
          </div>
        </div>

        <div className="flex bg-[#0a0a0f] p-1 rounded-2xl border border-white/10">
          <button 
            onClick={() => { setSelectedGame(null); setCurrentTab("master"); }} 
            className={`px-8 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all ${currentTab === "master" ? 'bg-purple-600 text-white' : 'text-slate-500'}`}
          >
            Master Dex
          </button>
          <button 
            onClick={() => { setSelectedGame(null); setCurrentTab("library"); }} 
            className={`px-8 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all ${currentTab === "library" ? 'bg-purple-600 text-white' : 'text-slate-500'}`}
          >
            Library
          </button>
        </div>
      </nav>

      {/* 2. STATS BAR: Under the Nav Toggle */}
      <div className="max-w-7xl mx-auto mt-8">
         <StatsHeader progress={progress} />
      </div>

      {/* 3. MAIN CONTENT */}
      <main className="max-w-7xl mx-auto mt-8">
        {selectedGame ? (
          <DexGrid 
            gameKey={selectedGame} 
            config={GAME_CONFIG[selectedGame]} 
            progress={progress[selectedGame] || []} 
            onBack={() => setSelectedGame(null)} 
            user={user}
          />
        ) : currentTab === "master" ? (
          <MasterDex 
            progress={progress} 
            onSelectGame={setSelectedGame} 
            user={user}
          />
        ) : (
          <BacklogManager user={user} games={libraryGames} /> 
        )}
      </main>
    </div>
  );
}