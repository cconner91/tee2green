import { HoleResult } from "../core/HoleResult";
import { GameEngine } from "./types";

export class NassauEngine implements GameEngine {
  evaluate(holeResults: HoleResult[]) {
    const front = holeResults.slice(0, 9);
    const back = holeResults.slice(9, 18);

    const evaluateNine = (holes: HoleResult[]) => {
      const wins: Record<string, number> = {};

      holes.forEach((hole) => {
        if (hole.winner !== "TIE") {
          wins[hole.winner] =
            (wins[hole.winner] || 0) + 1;
        }
      });

      const players = Object.keys(wins);

      if (players.length < 2) return "TIE";

      const [a, b] = players;

      if (wins[a] > wins[b]) return a;
      if (wins[b] > wins[a]) return b;

      return "TIE";
    };

    return {
      frontWinner: evaluateNine(front),
      backWinner: evaluateNine(back),
      overallWinner: evaluateNine(holeResults),
    };
  }
}