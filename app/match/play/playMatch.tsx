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

  const [currentHole, setCurrentHole] = useState(1);

  const [scoreA, setScoreA] = useState("");
  const [scoreB, setScoreB] = useState("");

  const [scores, setScores] = useState<
    { hole: number; a: number; b: number }[]
  >([]);

  const submitHole = () => {
    if (!scoreA || !scoreB) return;

    const updated = [
      ...scores,
      {
        hole: currentHole,
        a: Number(scoreA),
        b: Number(scoreB),
      },
    ];

    setScores(updated);
    setCurrentHole(currentHole + 1);

    setScoreA("");
    setScoreB("");
  };

  const strokesA = scores.reduce((t, h) => t + h.a, 0);
  const strokesB = scores.reduce((t, h) => t + h.b, 0);

  const holeWinsA = scores.filter((h) => h.a < h.b).length;
  const holeWinsB = scores.filter((h) => h.b < h.a).length;

  const matchStatus =
    holeWinsA === holeWinsB
      ? "All Square"
      : holeWinsA > holeWinsB
      ? `${playerA} ${holeWinsA - holeWinsB} UP`
      : `${playerB} ${holeWinsB - holeWinsA} UP`;

  const wagerBalance = enableBetting
    ? (holeWinsA - holeWinsB) * betAmount
    : 0;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex justify-center px-4">
      <div className="w-full max-w-md py-10 space-y-6">

        <h1 className="text-2xl font-bold text-center">
          Hole {currentHole}
        </h1>

        {/* Match Status */}
        <div className="bg-slate-800 p-4 rounded-xl text-center text-lg font-semibold">
          {matchStatus}
        </div>

        {/* Player A */}
        <div className="bg-slate-800 p-5 rounded-xl space-y-3">
          <div className="font-semibold">{playerA}</div>

          <input
            type="number"
            value={scoreA}
            onChange={(e) => setScoreA(e.target.value)}
            placeholder="Enter Score"
            className="w-full text-center text-3xl bg-slate-700 border border-slate-600 rounded-xl py-4"
          />
        </div>

        {/* Player B */}
        <div className="bg-slate-800 p-5 rounded-xl space-y-3">
          <div className="font-semibold">{playerB}</div>

          <input
            type="number"
            value={scoreB}
            onChange={(e) => setScoreB(e.target.value)}
            placeholder="Enter Score"
            className="w-full text-center text-3xl bg-slate-700 border border-slate-600 rounded-xl py-4"
          />
        </div>

        {/* Submit */}
        <button
          onClick={submitHole}
          className="w-full py-4 rounded-xl bg-sky-400 text-black font-bold text-lg hover:bg-sky-300 transition"
        >
          Submit Hole {currentHole} Score
        </button>

        {/* Betting */}
        {enableBetting && (
          <div className="bg-slate-800 rounded-xl p-4 text-center">
            Wager Balance: ${wagerBalance}
          </div>
        )}

        {/* Scorecard */}
        <div className="bg-slate-800 rounded-xl p-4 space-y-2">
          <div className="font-semibold">Scorecard</div>

          {scores.map((h) => (
            <div
              key={h.hole}
              className="flex justify-between text-sm border-b border-slate-700 pb-1"
            >
              <span>Hole {h.hole}</span>
              <span>{playerA}: {h.a}</span>
              <span>{playerB}: {h.b}</span>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className="bg-slate-800 rounded-xl p-4 text-sm space-y-1">
          <div>Total Strokes</div>
          <div>{playerA}: {strokesA}</div>
          <div>{playerB}: {strokesB}</div>
        </div>

      </div>
    </div>
  );
}