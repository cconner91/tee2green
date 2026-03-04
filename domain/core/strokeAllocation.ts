import { Hole } from "../models/Hole";

export function getStrokesForHole(
  playingHandicap: number,
  hole: Hole
): number {
  if (playingHandicap <= 0) return 0;

  // Base strokes per hole (for handicaps > 18)
  const baseStrokes = Math.floor(playingHandicap / 18);

  // Remaining strokes applied to hardest holes
  const remainder = playingHandicap % 18;

  let strokes = baseStrokes;

  if (hole.strokeIndex <= remainder) {
    strokes += 1;
  }

  return strokes;
}