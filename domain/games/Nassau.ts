import { HoleResult } from "../core/HoleResult";

export function evaluateNassau(
  holeResults: HoleResult[]
) {
  const front = holeResults.slice(0, 9);
  const back = holeResults.slice(9, 18);

  const evaluateNine = (
    holes: HoleResult[]
  ): string => {
    const wins: Record<string, number> = {};

    holes.forEach((hole) => {
      if (hole.winner !== "TIE") {
        wins[hole.winner] =
          (wins[hole.winner] || 0) + 1;
      }
    });

    const players = Object.keys(wins);

    if (players.length === 0) return "TIE";

    const [playerA, playerB] = players;

    if (!playerB) return playerA;

    if (wins[playerA] > wins[playerB])
      return playerA;

    if (wins[playerB] > wins[playerA])
      return playerB;

    return "TIE";
  };

  return {
    frontWinner: evaluateNine(front),
    backWinner: evaluateNine(back),
    overallWinner: evaluateNine(holeResults),
  };
}