"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";

export default function PlayMatch() {
  const params = useSearchParams();

  const playerA = params.get("playerA") || "Player 1";
  const playerB = params.get("playerB") || "Player 2";

  const enableHandicaps = params.get("enableHandicaps") === "true";
  const enableBetting = params.get("enableBetting") === "true";
  const betAmount = Number(params.get("betAmount") || 0);

  const [par, setPar] = useState(4);
  const [hole, setHole] = useState(1);

  const [scoreA, setScoreA] = useState<number | null>(null);
  const [scoreB, setScoreB] = useState<number | null>(null);

  const [history, setHistory] = useState<
  { hole: number; a: number; b: number }[]
  >([]);

  function getScoreStyle(score: number) {
    const diff = score - par;

    if (diff <= -2)
      return "border-4 rounded-full border-sky-400 ring-2 ring-sky-400";

    if (diff === -1)
      return "border-2 rounded-full border-sky-400";

    if (diff === 0)
      return "border border-slate-600";

    if (diff === 1)
      return "border-2 border-orange-400";

    return "border-4 border-red-500";
  }

  function submitHole() {
    if (scoreA === null || scoreB === null) return;

    const updated = [...history, { hole, a: scoreA, b: scoreB }];

    setHistory(updated);

    setScoreA(null);
    setScoreB(null);

    setHole(hole + 1);
  }

  const holeWinsA = history.filter((h) => h.a < h.b).length;
  const holeWinsB = history.filter((h) => h.b < h.a).length;

  const matchStatus =
    holeWinsA === holeWinsB
      ? "All Square"
      : holeWinsA > holeWinsB
      ? `${playerA} ${holeWinsA - holeWinsB} UP`
      : `${playerB} ${holeWinsB - holeWinsA} UP`;

  const betBalance = enableBetting
    ? (holeWinsA - holeWinsB) * betAmount
    : 0;

  function ScoreGrid({
    selected,
    onSelect,
  }: {
    selected: number | null;
    onSelect: (n: number) => void;
  }) {
    return (
      <div className="grid grid-cols-5 gap-2 mt-3">
        {[1,2,3,4,5,6,7,8,9,10].map((n) => (
          <button
            key={n}
            onClick={() => onSelect(n)}
            className={`w-14 h-14 flex items-center justify-center text-lg font-semibold bg-slate-800 transition ${
              getScoreStyle(n)
            } ${
              selected === n
                ? "scale-110 bg-sky-400/20"
                : ""
            }`}
          >
            {n}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex justify-center px-4">
      <div className="w-full max-w-md py-8 space-y-6">

        {/* Header */}

        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold">
            Hole {hole}
          </h1>

          <div className="text-sky-400 font-semibold">
            {matchStatus}
          </div>
        </div>

        {/* Par Selection */}

        <div className="flex justify-center gap-3">
          {[3,4,5].map((p) => (
            <button
              key={p}
              onClick={() => setPar(p)}
              className={`px-4 py-2 rounded-lg ${
                par === p
                  ? "bg-sky-400 text-black"
                  : "bg-slate-800"
              }`}
            >
              Par {p}
            </button>
          ))}
        </div>

        {/* Player A */}

        <div className="bg-slate-800 p-5 rounded-xl">
          <div className="font-semibold">
            {playerA}
          </div>

          <ScoreGrid
            selected={scoreA}
            onSelect={(n) => setScoreA(n)}
          />
        </div>

        {/* Player B */}

        <div className="bg-slate-800 p-5 rounded-xl">
          <div className="font-semibold">
            {playerB}
          </div>

          <ScoreGrid
            selected={scoreB}
            onSelect={(n) => setScoreB(n)}
          />
        </div>

        {/* Submit */}

        <button
          onClick={submitHole}
          className="w-full py-4 rounded-xl bg-sky-400 text-black font-bold text-lg"
        >
          Submit Hole {hole} Score
        </button>

        {/* Match Panel */}

        <div className="bg-slate-800 rounded-xl p-4 space-y-2 text-sm">

          <div className="font-semibold">
            Match Summary
          </div>

          <div>Match: {matchStatus}</div>

          <div>
            Front 9:{" "}
            {hole <= 9 ? matchStatus : "Complete"}
          </div>

          <div>
            Back 9:{" "}
            {hole > 9 ? matchStatus : "—"}
          </div>

          {enableBetting && (
            <div>
              Bet Balance: ${betBalance}
            </div>
          )}

        </div>

        {/* Hole History */}

        <div className="bg-slate-800 rounded-xl p-4 space-y-1 text-sm">

          <div className="font-semibold">
            Hole Results
          </div>

          {history.map((h) => (
            <div
              key={h.hole}
              className="flex justify-between"
            >
              <span>Hole {h.hole}</span>
              <span>
                {playerA} {h.a} - {playerB} {h.b}
              </span>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}