"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewMatch() {
  const router = useRouter();

  const [playerA, setPlayerA] = useState("");
  const [playerB, setPlayerB] = useState("");
  const [hcpA, setHcpA] = useState("");
  const [hcpB, setHcpB] = useState("");

  const [gameType, setGameType] = useState<
    "MATCH_PLAY" | "STROKE_PLAY"
  >("MATCH_PLAY");

  const [enableHandicaps, setEnableHandicaps] =
    useState(true);

  const startMatch = () => {
    const params = new URLSearchParams({
      playerA,
      playerB,
      hcpA,
      hcpB,
      gameType,
      enableHandicaps: enableHandicaps.toString(),
    });

    router.push(`/match/play?${params.toString()}`);
  };

  return (
    <div className="min-h-screen px-6 py-16 max-w-md mx-auto space-y-10">

      <h1 className="text-2xl font-bold text-center">
        Start Match
      </h1>

      {/* Handicap Toggle */}
      <div className="flex items-center justify-between bg-slate-900 p-4 rounded-xl">
        <span>Enable Handicaps</span>

        <button
          onClick={() =>
            setEnableHandicaps(!enableHandicaps)
          }
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

      {/* Game Type */}
      <div className="flex gap-4">
        <button
          onClick={() => setGameType("MATCH_PLAY")}
          className={`flex-1 py-3 rounded-xl ${
            gameType === "MATCH_PLAY"
              ? "bg-sky-500 text-black"
              : "bg-slate-800"
          }`}
        >
          Match Play
        </button>

        <button
          onClick={() => setGameType("STROKE_PLAY")}
          className={`flex-1 py-3 rounded-xl ${
            gameType === "STROKE_PLAY"
              ? "bg-sky-500 text-black"
              : "bg-slate-800"
          }`}
        >
          Stroke Play
        </button>
      </div>

      {/* Player Inputs */}
      <input
        placeholder="Player 1 Name"
        className="w-full p-3 rounded-xl bg-slate-800"
        onChange={(e) => setPlayerA(e.target.value)}
      />

      <input
        placeholder="Player 1 Handicap (optional)"
        className="w-full p-3 rounded-xl bg-slate-800"
        onChange={(e) => setHcpA(e.target.value)}
      />

      <input
        placeholder="Player 2 Name"
        className="w-full p-3 rounded-xl bg-slate-800"
        onChange={(e) => setPlayerB(e.target.value)}
      />

      <input
        placeholder="Player 2 Handicap (optional)"
        className="w-full p-3 rounded-xl bg-slate-800"
        onChange={(e) => setHcpB(e.target.value)}
      />

      <button
        onClick={startMatch}
        className="w-full py-4 bg-sky-500 text-black rounded-xl font-semibold"
      >
        Start Match
      </button>
    </div>
  );
}