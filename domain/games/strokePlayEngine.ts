import { HoleResult } from "../core/HoleResult";

export function evaluateStrokePlay(
  holeResults: HoleResult[]
) {
  const totals: Record<string, number> = {};

  holeResults.forEach((hole) => {
    Object.entries(hole.grossScores).forEach(
      ([playerId, score]) => {
        totals[playerId] =
          (totals[playerId] || 0) + score;
      }
    );
  });

  return totals;
}