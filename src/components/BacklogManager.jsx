import React, { useState } from "react";
import { db } from "../firebase";
import { doc, updateDoc, deleteDoc, setDoc, serverTimestamp } from "firebase/firestore";
import CircularProgress from "./CircularProgress";

export default function BacklogManager({ user, games }) {
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newStatus, setNewStatus] = useState("TODO");
  const [innerTab, setInnerTab] = useState("PLAYING");

  // Library Progress based strictly on your database games
  const totalGames = games.length;
  const completedCount = games.filter(g => g.status === "COMPLETED").length;
  const libraryPercent = totalGames > 0 ? (completedCount / totalGames) * 100 : 0;

  const handleAddGame = async (e) => {
    e.preventDefault();
    if (!user) return alert("Please sign in to save games.");
    
    try {
      const gameId = Date.now().toString(); 
      await setDoc(doc(db, "users", user.uid, "library", gameId), {
        label: newName,
        status: newStatus,
        createdAt: serverTimestamp()
      });
      setNewName("");
      setIsAdding(false);
    } catch (err) {
      console.error("Firebase Error:", err);
      alert("Permission Denied: Ensure your Firestore Rules allow writes to /users/{userId}/library/{gameId}");
    }
  };

  const updateStatus = async (id, status) => {
    await updateDoc(doc(db, "users", user.uid, "library", id), { status });
  };

  const handleDelete = async (id) => {
    if (confirm("Permanently delete this game from your library?")) {
      await deleteDoc(doc(db, "users", user.uid, "library", id));
    }
  };

  const filteredGames = games.filter(g => innerTab === "ALL" || g.status === innerTab);

  return (
    <div className="animate-in fade-in duration-500">
      {/* STATS PANEL */}
      <div className="bg-[#0a0a0f] border border-white/5 p-10 rounded-[3rem] flex flex-col items-center mb-12 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500/20 to-transparent" />
        <CircularProgress percentage={libraryPercent} size={150} strokeWidth={12} color="#a855f7" />
        <div className="text-center mt-6">
          <p className="text-[10px] text-purple-500 font-bold tracking-[0.3em] uppercase mb-2">Library_Completion</p>
          <p className="text-3xl font-black text-white">
            {completedCount} <span className="text-slate-700">/</span> {totalGames}
          </p>
        </div>
      </div>

      {/* FILTER TABS & ADD ACTION */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-6">
        <div className="flex bg-white/5 p-1.5 rounded-2xl border border-white/5">
          {["PLAYING", "TODO", "COMPLETED", "ALL"].map((t) => (
            <button
              key={t}
              onClick={() => setInnerTab(t)}
              className={`px-6 py-2 rounded-xl text-[10px] font-black tracking-widest transition-all ${
                innerTab === t ? "bg-purple-600 text-white shadow-lg" : "text-slate-500 hover:text-slate-300"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="bg-white text-black text-[11px] font-black px-10 py-3 rounded-full hover:scale-105 transition-all shadow-xl shadow-white/5"
        >
          {isAdding ? "CANCEL" : "ADD GAME"}
        </button>
      </div>

      {/* CLEAN ADD FORM */}
      {isAdding && (
        <form onSubmit={handleAddGame} className="bg-purple-600/5 border border-purple-500/20 p-2 rounded-[2rem] flex items-center gap-2 mb-10 animate-in zoom-in-95 duration-200">
          <input 
            className="bg-transparent px-6 py-4 text-sm flex-1 outline-none text-white placeholder:text-slate-600"
            placeholder="Game title..."
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            required
          />
          <select 
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
            className="bg-slate-900 border border-white/5 rounded-xl px-4 py-2 text-[10px] font-bold outline-none text-slate-400 cursor-pointer"
          >
            <option value="PLAYING">PLAYING</option>
            <option value="TODO">TO DO</option>
            <option value="COMPLETED">COMPLETED</option>
          </select>
          <button type="submit" className="bg-purple-600 text-white px-8 py-3 rounded-2xl text-[10px] font-black uppercase hover:bg-purple-500 transition-colors mr-1">
            Add
          </button>
        </form>
      )}

      {/* LIVE DATABASE LIST */}
      <div className="grid gap-4">
        {filteredGames.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-white/5 rounded-[3rem] text-slate-700 font-bold uppercase text-[10px] tracking-[0.4em]">
            No_Games_In_{innerTab}
          </div>
        ) : (
          filteredGames.map(game => (
            <div key={game.id} className="bg-[#0a0a0f] border border-white/5 p-6 rounded-[2.5rem] flex items-center justify-between group hover:border-purple-500/20 transition-all">
              <div className="flex items-center gap-6">
                <div className={`w-1.5 h-8 rounded-full ${game.status === 'PLAYING' ? 'bg-purple-500 shadow-[0_0_15px_#a855f7]' : 'bg-slate-800'}`} />
                <h3 className="text-lg font-bold text-white tracking-tight">{game.label}</h3>
              </div>

              <div className="flex items-center gap-4">
                <select 
                  value={game.status}
                  onChange={(e) => updateStatus(game.id, e.target.value)}
                  className="bg-slate-900 text-[10px] font-bold border border-white/10 rounded-xl px-4 py-2 outline-none cursor-pointer focus:border-purple-500 transition-colors"
                >
                  <option value="PLAYING">PLAYING</option>
                  <option value="TODO">TO DO</option>
                  <option value="COMPLETED">COMPLETED</option>
                </select>
                <button onClick={() => handleDelete(game.id)} className="opacity-0 group-hover:opacity-100 p-2 text-slate-600 hover:text-red-500 transition-all">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}