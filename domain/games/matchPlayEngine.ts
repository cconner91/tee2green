import { HoleResult } from "../core/HoleResult";

export function evaluateMatchPlay(
  holeResults: HoleResult[]
) {
  const wins: Record<string, number> = {};

  holeResults.forEach((hole) => {
    if (hole.winner !== "TIE") {
      wins[hole.winner] =
        (wins[hole.winner] || 0) + 1;
    }
  });

  return wins;
}