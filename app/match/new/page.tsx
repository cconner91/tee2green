"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewMatchPage() {
  const router = useRouter();

  const [playerAName, setPlayerAName] = useState("");
  const [playerBName, setPlayerBName] = useState("");

  const [hcpA, setHcpA] = useState("");
  const [hcpB, setHcpB] = useState("");

  const [selectedGame, setSelectedGame] = useState("match-play-game");

  const [enableHandicaps, setEnableHandicaps] = useState(true);
  const [enableBetting, setEnableBetting] = useState(false);

  const startMatch = () => {
    const params = new URLSearchParams({
      playerA: playerAName,
      playerB: playerBName,
      hcpA: hcpA || "0",
      hcpB: hcpB || "0",
      gameType: selectedGame,
      enableHandicaps: String(enableHandicaps),
      enableBetting: String(enableBetting),
    });

    router.push(`/match/play?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex justify-center px-4">
      <div className="w-full max-w-md py-10 space-y-8">

        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Start New Match</h1>
          <p className="text-slate-400">Setup your round</p>
        </div>

        {/* Player 1 */}
        <div className="bg-slate-800 p-5 rounded-xl space-y-3">
          <input
            value={playerAName}
            onChange={(e) => setPlayerAName(e.target.value)}
            placeholder="Input Player 1 Name"
            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2"
          />

          <input
            type="number"
            value={hcpA}
            onChange={(e) => setHcpA(e.target.value)}
            placeholder="Enter Handicap (optional)"
            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2"
          />
        </div>

        {/* Player 2 */}
        <div className="bg-slate-800 p-5 rounded-xl space-y-3">
          <input
            value={playerBName}
            onChange={(e) => setPlayerBName(e.target.value)}
            placeholder="Input Player 2 Name"
            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2"
          />

          <input
            type="number"
            value={hcpB}
            onChange={(e) => setHcpB(e.target.value)}
            placeholder="Enter Handicap (optional)"
            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2"
          />
        </div>

        {/* Game Type */}
        <div className="bg-slate-800 p-5 rounded-xl space-y-3">
          <div className="text-sm text-slate-400">Game Type</div>

          <select
            value={selectedGame}
            onChange={(e) => setSelectedGame(e.target.value)}
            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2"
          >
            <option value="match-play-game">Match Play Game</option>
            <option value="stroke-play-game">Stroke Play Game</option>
          </select>
        </div>

        {/* Options */}
        <div className="bg-slate-800 p-5 rounded-xl space-y-4">

          <label className="flex items-center justify-between">
            <span>Enable Handicaps</span>
            <input
              type="checkbox"
              checked={enableHandicaps}
              onChange={() => setEnableHandicaps(!enableHandicaps)}
            />
          </label>

          <label className="flex items-center justify-between">
            <span>Enable Match Betting</span>
            <input
              type="checkbox"
              checked={enableBetting}
              onChange={() => setEnableBetting(!enableBetting)}
            />
          </label>

        </div>

        {/* Start Match Button */}
        <button
          onClick={startMatch}
          className="w-full py-4 rounded-xl bg-sky-400 text-black font-bold text-lg hover:bg-sky-300"
        >
          Start Match
        </button>

      </div>
    </div>
  );
}