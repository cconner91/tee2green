"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import { gameDefinitions } from "@/domain/gameConfig/definitions";
import { getGamesForPlayerCount } from "@/domain/gameConfig/filters";
import { GolfGameDefinition } from "@/domain/gameConfig/types";

export default function NewMatchPage() {
  const router = useRouter();

  // Player Info
  const [playerA, setPlayerA] = useState("");
  const [playerB, setPlayerB] = useState("");
  const [hcpA, setHcpA] = useState("");
  const [hcpB, setHcpB] = useState("");

  // Game Config
  const [playerCount, setPlayerCount] = useState(2);
  const [availableGames, setAvailableGames] = useState<GolfGameDefinition[]>([]);
  const [selectedGame, setSelectedGame] = useState<GolfGameDefinition | null>(null);
  const [enableHandicaps, setEnableHandicaps] = useState(true);

  // Filter games based on player count
  useEffect(() => {
    const validGames = getGamesForPlayerCount(playerCount, gameDefinitions);
    setAvailableGames(validGames);
    setSelectedGame(null); // reset selection if player count changes
  }, [playerCount]);

  const startMatch = () => {
    if (!selectedGame) return;

    const params = new URLSearchParams({
      playerA,
      playerB,
      hcpA,
      hcpB,
      gameId: selectedGame.id,
      enableHandicaps: enableHandicaps.toString(),
    });

    router.push(`/match/play?${params.toString()}`);
  };

  return (
    <div className="min-h-screen px-6 py-16 max-w-md mx-auto space-y-10">

      <h1 className="text-2xl font-bold text-center">
        Start Match
      </h1>

      {/* Number of Players */}
      <div className="space-y-2">
        <label className="text-sm text-slate-400">
          Number of Players
        </label>

        <select
          value={playerCount}
          onChange={(e) => setPlayerCount(Number(e.target.value))}
          className="w-full p-3 rounded-xl bg-slate-800"
        >
          {[1,2,3,4,5,6,7,8].map((num) => (
            <option key={num} value={num}>
              {num} Player{num > 1 && "s"}
            </option>
          ))}
        </select>
      </div>

      {/* Available Games */}
      <div className="space-y-3">
        <div className="text-sm text-slate-400">
          Available Games
        </div>

        {availableGames.map((game) => (
          <div
            key={game.id}
            onClick={() => setSelectedGame(game)}
            className={`p-4 rounded-xl border cursor-pointer transition ${
              selectedGame?.id === game.id
                ? "bg-sky-500 text-black border-sky-400"
                : "bg-slate-900 border-slate-800 hover:border-sky-400"
            }`}
          >
            <div className="font-semibold">
              {game.name}
            </div>
            <div className="text-xs opacity-70">
              {game.description}
            </div>
          </div>
        ))}
      </div>

      {/* Handicap Toggle */}
      <div className="flex items-center justify-between bg-slate-900 p-4 rounded-xl">
        <span>Enable Handicaps</span>

        <button
          onClick={() => setEnableHandicaps(!enableHandicaps)}
          className={`w-14 h-7 rounded-full transition relative ${
            enableHandicaps
              ? "bg-sky-500"
              : "bg-slate-600"
          }`}
        >
          <div
            className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition ${
              enableHandicaps
                ? "translate-x-7"
                : ""
            }`}
          />
        </button>
      </div>

      {/* Player Inputs */}
      <input
        placeholder="Player 1 Name"
        className="w-full p-3 rounded-xl bg-slate-800"
        value={playerA}
        onChange={(e) => setPlayerA(e.target.value)}
      />

      <input
        placeholder="Player 1 Handicap (optional)"
        className="w-full p-3 rounded-xl bg-slate-800"
        value={hcpA}
        onChange={(e) => setHcpA(e.target.value)}
      />

      {playerCount > 1 && (
        <>
          <input
            placeholder="Player 2 Name"
            className="w-full p-3 rounded-xl bg-slate-800"
            value={playerB}
            onChange={(e) => setPlayerB(e.target.value)}
          />

          <input
            placeholder="Player 2 Handicap (optional)"
            className="w-full p-3 rounded-xl bg-slate-800"
            value={hcpB}
            onChange={(e) => setHcpB(e.target.value)}
          />
        </>
      )}

      {/* Start Button */}
      <button
        onClick={startMatch}
        disabled={!selectedGame}
        className={`w-full py-4 rounded-xl font-semibold transition ${
          selectedGame
            ? "bg-sky-500 text-black hover:bg-sky-400"
            : "bg-slate-700 text-slate-400 cursor-not-allowed"
        }`}
      >
        Start Match
      </button>

    </div>
  );
}