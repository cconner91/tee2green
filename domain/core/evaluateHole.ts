import { Hole } from "../models/Hole";
import { PlayerId } from "../models/Player";
import { HoleResult } from "./HoleResult";
import { getStrokesForHole } from "./strokeAllocation";
import { calculateNetScore } from "./netScoring";

export function evaluateHole(
  hole: Hole,
  grossScores: Record<PlayerId, number>,
  playingHandicaps: Record<PlayerId, number>
): HoleResult {
  const netScores: Record<PlayerId, number> = {};

  for (const playerId in grossScores) {
    const strokesReceived = getStrokesForHole(playingHandicaps[playerId] ?? 0, hole);
    netScores[playerId] = calculateNetScore(grossScores[playerId], strokesReceived);
  }

  // Lowest net score wins the hole
  let winner: PlayerId | "TIE" = "TIE";
  let lowestScore = Infinity;

  for (const playerId in netScores) {
    const score = netScores[playerId];
    if (score < lowestScore) {
      lowestScore = score;
      winner = playerId;
    } else if (score === lowestScore) {
      winner = "TIE";
    }
  }

  return {
    holeNumber: hole.number,
    par: hole.par,
    grossScores,
    netScores,
    winner,
  };
}
