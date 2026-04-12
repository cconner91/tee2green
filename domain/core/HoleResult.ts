import { PlayerId } from "../models/Player";

export interface HoleResult {
  holeNumber: number;
  par: number;
  grossScores: Record<PlayerId, number>;
  netScores: Record<PlayerId, number>;
  winner: PlayerId | "TIE";
}
