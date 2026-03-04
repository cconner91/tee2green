"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import { gameDefinitions } from "@/domain/gameConfig/definitions";
import { getGamesForPlayerCount } from "@/domain/gameConfig/filters";
import { validatePresetGame } from "@/domain/gameConfig/validateGameConfiguration";
import { GolfGameDefinition } from "@/domain/gameConfig/types";

export default function NewMatchPage() {
  const router = useRouter();

  const [playerCount, setPlayerCount] = useState(2);
  const [availableGames, setAvailableGames] = useState<GolfGameDefinition[]>([]);
  const [selectedGame, setSelectedGame] = useState<GolfGameDefinition | null>(null);

  const [playerA, setPlayerA] = useState("");
  const [playerB, setPlayerB] = useState("");
  const [hcpA, setHcpA] = useState("");
  const [hcpB, setHcpB] = useState("");

  const [enableHandicaps, setEnableHandicaps] = useState(true);
  const [enableBetting, setEnableBetting] = useState(false);
  const [betAmount, setBetAmount] = useState("");

  useEffect(() => {
    const filtered = getGamesForPlayerCount(playerCount, gameDefinitions);
    setAvailableGames(filtered);
    setSelectedGame(null);
  }, [playerCount]);

  const startMatch = () => {
    if (!selectedGame) return;

    const validation = validatePresetGame(selectedGame, playerCount);
    if (!validation.valid) {
      alert(validation.reason);
      return;
    }

    const params = new URLSearchParams({
      playerA,
      playerB,
      hcpA,
      hcpB,
      gameId: selectedGame.id,
      enableHandicaps: enableHandicaps.toString(),
      enableBetting: enableBetting.toString(),
      betAmount,
    });

    router.push(`/match/play?${params.toString()}`);
  };

  return (
    <div className="min-h-screen px-6 py-12 max-w-md mx-auto space-y-8">

      <h1 className="text-2xl font-bold text-center">New Match</h1>

      {/* Player Count */}
      <div className="space-y-2">
        <label className="text-sm text-slate-400">Players</label>
        <select
          value={playerCount}
          onChange={(e) => setPlayerCount(Number(e.target.value))}
          className="w-full p-3 rounded-xl bg-slate-800"
        >
          {[2,3,4,5,6,7,8].map((n) => (
            <option key={n} value={n}>
              {n} Players
            </option>
          ))}
        </select>
      </div>

      {/* Game Selection */}
      <div className="space-y-3">
        <div className="text-sm text-slate-400">Game Type</div>

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
            <div className="font-semibold">{game.name}</div>
            <div className="text-xs opacity-70">{game.description}</div>
          </div>
        ))}
      </div>

      {/* Toggles */}
      <div className="flex justify-between bg-slate-900 p-4 rounded-xl">
        <span>Enable Handicaps</span>
        <button
          onClick={() => setEnableHandicaps(!enableHandicaps)}
          className={`w-14 h-7 rounded-full relative transition ${
            enableHandicaps ? "bg-sky-500" : "bg-slate-600"
          }`}
        >
          <div
            className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition ${
              enableHandicaps ? "translate-x-7" : ""
            }`}
          />
        </button>
      </div>

      <div className="flex justify-between bg-slate-900 p-4 rounded-xl">
        <span>Enable Match Betting</span>
        <button
          onClick={() => setEnableBetting(!enableBetting)}
          className={`w-14 h-7 rounded-full relative transition ${
            enableBetting ? "bg-sky-500" : "bg-slate-600"
          }`}
        >
          <div
            className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition ${
              enableBetting ? "translate-x-7" : ""
            }`}
          />
        </button>
      </div>

      {enableBetting && (
        <input
          type="number"
          placeholder="Base Bet Amount ($)"
          value={betAmount}
          onChange={(e) => setBetAmount(e.target.value)}
          className="w-full p-3 rounded-xl bg-slate-800"
        />
      )}

      {/* Player Inputs */}
      <input
        placeholder="Player 1 Name"
        className="w-full p-3 rounded-xl bg-slate-800"
        value={playerA}
        onChange={(e) => setPlayerA(e.target.value)}
      />

      <input
        placeholder="Player 1 Handicap"
        className="w-full p-3 rounded-xl bg-slate-800"
        value={hcpA}
        onChange={(e) => setHcpA(e.target.value)}
      />

      <input
        placeholder="Player 2 Name"
        className="w-full p-3 rounded-xl bg-slate-800"
        value={playerB}
        onChange={(e) => setPlayerB(e.target.value)}
      />

      <input
        placeholder="Player 2 Handicap"
        className="w-full p-3 rounded-xl bg-slate-800"
        value={hcpB}
        onChange={(e) => setHcpB(e.target.value)}
      />

      <button
        onClick={startMatch}
        disabled={!selectedGame}
        className={`w-full py-4 rounded-xl font-semibold ${
          selectedGame
            ? "bg-sky-500 text-black"
            : "bg-slate-700 text-slate-400"
        }`}
      >
        Start Match
      </button>
    </div>
  );
}