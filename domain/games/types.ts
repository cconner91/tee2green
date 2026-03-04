import { HoleResult } from "../core/HoleResult";

export interface GameEngine {
  evaluate(holeResults: HoleResult[]): any;
}