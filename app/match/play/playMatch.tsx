"use client";

import { useSearchParams } from "next/navigation";

export default function PlayMatch() {
  const searchParams = useSearchParams();

  const playerA = searchParams.get("playerA") || "Player 1";
  const playerB = searchParams.get("playerB") || "Player 2";

  const gameId = searchParams.get("gameId") || "match-play-game";
  const enableHandicaps = searchParams.get("enableHandicaps") === "true";
  const enableBetting = searchParams.get("enableBetting") === "true";
  const betAmount = searchParams.get("betAmount") || "0";

  return (
    <div className="min-h-screen px-6 py-10 max-w-md mx-auto space-y-8">

      <h1 className="text-2xl font-bold text-center">Live Match</h1>

      <div className="bg-slate-900 rounded-xl p-5 space-y-2">
        <div className="text-lg font-semibold">{playerA}</div>
        <div className="text-lg font-semibold">{playerB}</div>
      </div>

      <div className="bg-slate-900 rounded-xl p-5 space-y-2">
        <div>Game: {gameId}</div>
        <div>Handicaps Enabled: {enableHandicaps ? "Yes" : "No"}</div>
        <div>Betting Enabled: {enableBetting ? "Yes" : "No"}</div>
        {enableBetting && <div>Bet Amount: ${betAmount}</div>}
      </div>

      <div className="bg-slate-900 rounded-xl p-6 text-center text-slate-400">
        Scoring UI will go here
      </div>

    </div>
  );
}