import React from "react";
import StatsHeader from "./StatsHeader";
import GameCard from "./GameCard";
import { GAME_CONFIG } from "../utils/gameConfig";

export default function MasterDex({ progress, onSelectGame }) {
  // Rings logic...
  const allKeys = Object.keys(GAME_CONFIG);
  const totalPossible = allKeys.reduce((acc, k) => acc + (GAME_CONFIG[k].total || 0), 0);
  const totalCaught = allKeys.reduce((acc, k) => acc + (progress[k]?.length || 0), 0);
  const totalPercentage = totalPossible > 0 ? Math.floor((totalCaught / totalPossible) * 100) : 0;

  return (
    <div className="animate-in fade-in duration-700">
      <StatsHeader totalCaught={totalCaught} totalPossible={totalPossible} totalPercentage={totalPercentage} />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mt-12">
        {Object.keys(GAME_CONFIG).map(k => (
          <GameCard key={k} gameKey={k} config={GAME_CONFIG[k]} progress={progress} onClick={() => onSelectGame(k)} />
        ))}
      </div>
    </div>
  );
}