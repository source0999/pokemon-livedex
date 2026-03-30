import React from "react";
import { GAME_CONFIG } from "../utils/gameConfig";
import GameCard from "./GameCard";
import { db } from "../firebase";
import { doc, updateDoc, deleteField } from "firebase/firestore";

export default function MasterDex({ progress, onSelectGame, user }) {
  const handleClearGame = async (gameKey) => {
    if (!user) return;
    if (window.confirm(`Reset all progress for ${gameKey}?`)) {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        [`progress.${gameKey}`]: deleteField()
      });
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Object.entries(GAME_CONFIG).map(([key, config]) => (
        <GameCard
          key={key}
          gameKey={key}
          config={config}
          stats={progress[key] || []}
          onSelect={onSelectGame} // This MUST match the prop in GameCard
          onClear={handleClearGame}
        />
      ))}
    </div>
  );
}