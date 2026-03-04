"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { mockCourse } from "../../../data/mockCourse";
import {
  calculateCourseHandicap,
  calculatePlayingHandicap,
} from "../../../domain/core/handicap";
import { playHole } from "../../../state/matchEngine";
import { MatchState } from "../../../state/matchState";

export default function MatchPage() {
  const searchParams = useSearchParams();

  const playerAName = searchParams.get("playerA") || "";
  const playerBName = searchParams.get("playerB") || "";

  const rawHcpA = searchParams.get("hcpA");
  const rawHcpB = searchParams.get("hcpB");

  const baseHcpA = rawHcpA ? Number(rawHcpA) : 0;
  const baseHcpB = rawHcpB ? Number(rawHcpB) : 0;

  const gameType =
    (searchParams.get("gameType") as
      | "MATCH_PLAY"
      | "STROKE_PLAY") || "MATCH_PLAY";
  const enableHandicaps =
  searchParams.get("enableHandicaps") === "true";

  const playerA = {
    id: "playerA",
    name: playerAName,
    handicapIndex: baseHcpA,
  };

  const playerB = {
    id: "playerB",
    name: playerBName,
    handicapIndex: baseHcpB,
  };

  const courseHcpA = calculateCourseHandicap(
    baseHcpA,
    mockCourse.slopeRating,
    mockCourse.courseRating,
    mockCourse.par
  );

  const courseHcpB = calculateCourseHandicap(
    baseHcpB,
    mockCourse.slopeRating,
    mockCourse.courseRating,
    mockCourse.par
  );

  const playingHcpA = calculatePlayingHandicap(courseHcpA);
  const playingHcpB = calculatePlayingHandicap(courseHcpB);

  const initialState: MatchState = {
    players: [playerA, playerB],
    course: mockCourse,
    playingHandicaps: {
      [playerA.id]: playingHcpA,
      [playerB.id]: playingHcpB,
    },
    holeResults: [],
    currentHole: 1,
    gameType,
    enableHandicaps,
  };

  const [matchState, setMatchState] = useState(initialState);

  const [holePars, setHolePars] = useState(
    mockCourse.holes.map((h) => h.par)
  );

  const [grossA, setGrossA] = useState("");
  const [grossB, setGrossB] = useState("");

  const currentHoleIndex = matchState.currentHole - 1;
  const currentPar = holePars[currentHoleIndex];

  const setPar = (value: number) => {
    const updated = [...holePars];
    updated[currentHoleIndex] = value;
    setHolePars(updated);
  };

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

  const totalA = matchState.holeResults.reduce(
    (sum, h) => sum + h.grossScores[playerA.id],
    0
  );

  const totalB = matchState.holeResults.reduce(
    (sum, h) => sum + h.grossScores[playerB.id],
    0
  );

  const parSoFar = holePars
    .slice(0, matchState.holeResults.length)
    .reduce((sum, p) => sum + p, 0);

  const toParA = totalA - parSoFar;
  const toParB = totalB - parSoFar;

  const winsA = matchState.holeResults.filter(
    (h) => h.winner === playerA.id
  ).length;

  const winsB = matchState.holeResults.filter(
    (h) => h.winner === playerB.id
  ).length;

  let leader: "A" | "B" | null = null;
  let scoreDisplayA = "";
  let scoreDisplayB = "";

  if (gameType === "MATCH_PLAY") {
    const diff = winsA - winsB;

    if (diff > 0) {
      leader = "A";
      scoreDisplayA = `${diff}U`;
      scoreDisplayB = `${diff}D`;
    } else if (diff < 0) {
      leader = "B";
      scoreDisplayA = `${Math.abs(diff)}D`;
      scoreDisplayB = `${Math.abs(diff)}U`;
    } else {
      scoreDisplayA = "AS";
      scoreDisplayB = "AS";
    }
  }

  if (gameType === "STROKE_PLAY") {
    if (totalA < totalB) leader = "A";
    if (totalB < totalA) leader = "B";

        scoreDisplayA =
            toParA === 0
                ? "E"
                : toParA > 0
                ? `+${toParA}`
                : toParA.toString();

        scoreDisplayB =
            toParB === 0
                ? "E"
                : toParB > 0
                ? `+${toParB}`
                : toParB.toString();
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex justify-center px-4">
      <div className="w-full max-w-md py-10 space-y-6">

        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Tee2Green</h1>

          <div className="text-sky-400 font-semibold">
            Hole {matchState.currentHole}
          </div>

          {/* 3 Visible Par Buttons */}
          <div className="flex justify-center gap-3">
            {[3, 4, 5].map((par) => (
              <button
                key={par}
                onClick={() => setPar(par)}
                className={`px-5 py-2 rounded-xl font-semibold transition ${
                  currentPar === par
                    ? "bg-sky-500 text-slate-900 shadow-lg"
                    : "bg-slate-800 hover:bg-slate-700"
                }`}
              >
                Par {par}
              </button>
            ))}
          </div>
        </div>

        {[playerA, playerB].map((player, idx) => {
          const isA = idx === 0;
          const scoreDisplay = isA
            ? scoreDisplayA
            : scoreDisplayB;
          const isLeader =
            (leader === "A" && isA) ||
            (leader === "B" && !isA);

          return (
            <div
              key={player.id}
              className={`rounded-2xl p-6 transition ${
                isLeader
                  ? "bg-sky-500/10 shadow-lg"
                  : "bg-slate-800"
              }`}
            >
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-semibold text-lg">
                    {player.name}
                  </div>
                  <div className="text-xs text-slate-400">
                    Index {player.handicapIndex} • Course{" "}
                    {isA ? playingHcpA : playingHcpB}
                  </div>
                </div>

                <div className="text-2xl font-bold text-sky-400">
                  {scoreDisplay}
                </div>
              </div>

              <input
                type="number"
                value={isA ? grossA : grossB}
                onChange={(e) =>
                  isA
                    ? setGrossA(e.target.value)
                    : setGrossB(e.target.value)
                }
                className="mt-4 w-full text-center text-3xl bg-slate-700 border border-slate-600 rounded-xl py-4"
                placeholder="-"
              />
            </div>
          );
        })}

        <button
          onClick={handleSubmit}
          className="w-full py-4 rounded-2xl text-lg font-bold bg-sky-400 text-slate-900"
        >
          Submit Hole {matchState.currentHole} Score
        </button>
      </div>
    </div>
  );
}