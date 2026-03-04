import { HoleResult } from "../core/HoleResult";
import { GameEngine } from "./types";

export class StrokePlayEngine implements GameEngine {
  evaluate(holeResults: HoleResult[]) {
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
}