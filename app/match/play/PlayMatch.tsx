"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";

import { mockCourse } from "@/data/mockCourse";
import {
  calculateCourseHandicap,
  calculatePlayingHandicap,
} from "@/domain/core/handicap";

import { playHole } from "@/state/matchEngine";
import { MatchState } from "@/state/matchState";

import { createGameEngine } from "@/domain/games/gameFactory";

export default function PlayMatch() {
  const searchParams = useSearchParams();

  // --- URL PARAMS ---
  const playerAName = searchParams.get("playerA") || "Player 1";
  const playerBName = searchParams.get("playerB") || "Player 2";
  const rawHcpA = searchParams.get("hcpA");
  const rawHcpB = searchParams.get("hcpB");
  const gameId = searchParams.get("gameId") || "match-play";
  const enableHandicaps =
    searchParams.get("enableHandicaps") === "true";

  const hcpA = rawHcpA ? Number(rawHcpA) : 0;
  const hcpB = rawHcpB ? Number(rawHcpB) : 0;

  // --- PLAYERS ---
  const playerA = {
    id: "playerA",
    name: playerAName,
    handicapIndex: hcpA,
  };

  const playerB = {
    id: "playerB",
    name: playerBName,
    handicapIndex: hcpB,
  };

  // --- HANDICAPS ---
  const courseHcpA = calculateCourseHandicap(
    playerA.handicapIndex,
    mockCourse.slopeRating,
    mockCourse.courseRating,
    mockCourse.par
  );

  const courseHcpB = calculateCourseHandicap(
    playerB.handicapIndex,
    mockCourse.slopeRating,
    mockCourse.courseRating,
    mockCourse.par
  );

  const initialState: MatchState = {
    players: [playerA, playerB],
    course: mockCourse,
    playingHandicaps: {
      [playerA.id]: calculatePlayingHandicap(courseHcpA),
      [playerB.id]: calculatePlayingHandicap(courseHcpB),
    },
    holeResults: [],
    currentHole: 1,
    gameType: gameId as any,
    enableHandicaps,
  };

  const [matchState, setMatchState] =
    useState<MatchState>(initialState);

  const [grossA, setGrossA] = useState("");
  const [grossB, setGrossB] = useState("");

  // --- GAME ENGINE ---
  const engine = createGameEngine(gameId);
  const gameResult = engine.evaluate(
    matchState.holeResults
  );

  // --- SUBMIT HOLE ---
  const handleSubmit = () => {
    if (!grossA || !grossB) return;

    const updatedState = playHole(matchState, {
      playerA: Number(grossA),
      playerB: Number(grossB),
    });

    setMatchState(updatedState);
    setGrossA("");
    setGrossB("");
  };

  // --- UI HELPERS ---
  const currentHole = matchState.currentHole;

  return (
    <div className="min-h-screen px-6 py-10 max-w-md mx-auto space-y-8">

      <div className="text-center space-y-1">
        <h1 className="text-2xl font-bold">
          {gameId.replace("-", " ").toUpperCase()}
        </h1>
        <p className="text-slate-400">
          Hole {currentHole}
        </p>
      </div>

      {/* Player A */}
      <div className="bg-slate-900 p-5 rounded-2xl space-y-3">
        <div className="flex justify-between">
          <span className="font-semibold">
            {playerA.name}
          </span>
          <span className="text-sm text-slate-400">
            HCP {matchState.playingHandicaps[playerA.id]}
          </span>
        </div>

        <input
          type="number"
          value={grossA}
          onChange={(e) =>
            setGrossA(e.target.value)
          }
          placeholder="-"
          className="w-full text-center text-3xl bg-slate-800 rounded-xl py-4"
        />
      </div>

      {/* Player B */}
      <div className="bg-slate-900 p-5 rounded-2xl space-y-3">
        <div className="flex justify-between">
          <span className="font-semibold">
            {playerB.name}
          </span>
          <span className="text-sm text-slate-400">
            HCP {matchState.playingHandicaps[playerB.id]}
          </span>
        </div>

        <input
          type="number"
          value={grossB}
          onChange={(e) =>
            setGrossB(e.target.value)
          }
          placeholder="-"
          className="w-full text-center text-3xl bg-slate-800 rounded-xl py-4"
        />
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        className="w-full py-4 rounded-2xl font-bold bg-sky-500 text-black hover:bg-sky-400 transition"
      >
        Submit Hole {currentHole} Score
      </button>

      {/* Engine Result Display */}
      <div className="bg-slate-900 p-5 rounded-2xl space-y-3">
        <div className="font-semibold text-sky-400">
          Game Result
        </div>

        <pre className="text-xs text-slate-400 overflow-x-auto">
          {JSON.stringify(gameResult, null, 2)}
        </pre>
      </div>

    </div>
  );
}