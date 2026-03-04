import { HoleResult } from "../core/HoleResult";
import { PlayerId } from "../models/Player";

export interface NassauResult {
  frontWinner: PlayerId | "TIE";
  backWinner: PlayerId | "TIE";
  overallWinner: PlayerId | "TIE";
}

export function evaluateNassau(
  holeResults: HoleResult[]
): NassauResult {

  const frontWins: Record<PlayerId, number> = {};
  const backWins: Record<PlayerId, number> = {};
  const totalWins: Record<PlayerId, number> = {};

  for (const result of holeResults) {
    if (result.winner === "TIE") continue;

    const playerId = result.winner;

    frontWins[playerId] = frontWins[playerId] ?? 0;
    backWins[playerId] = backWins[playerId] ?? 0;
    totalWins[playerId] = totalWins[playerId] ?? 0;

    totalWins[playerId]++;

    if (result.holeNumber <= 9) {
      frontWins[playerId]++;
    } else {
      backWins[playerId]++;
    }
  }

  function determineWinner(record: Record<PlayerId, number>): PlayerId | "TIE" {
    const entries = Object.entries(record);

    if (entries.length === 0) return "TIE";

    entries.sort((a, b) => b[1] - a[1]);

    if (entries.length > 1 && entries[0][1] === entries[1][1]) {
      return "TIE";
    }

    return entries[0][0];
  }

  return {
    frontWinner: determineWinner(frontWins),
    backWinner: determineWinner(backWins),
    overallWinner: determineWinner(totalWins),
  };
}