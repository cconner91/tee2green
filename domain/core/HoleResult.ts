import { PlayerId } from "../models/Player";

export interface HoleResult {
  holeNumber: number;

  // Raw strokes entered by players
  grossScores: Record<PlayerId, number>;

  // Strokes after handicap applied
  netScores: Record<PlayerId, number>;

  // Winner of the hole based on net score
  winner: PlayerId | "TIE";
}