import { GameEngine } from "./types";
import { StrokePlayEngine } from "./strokePlayEngine";
import { MatchPlayEngine } from "./matchPlayEngine";
import { NassauEngine } from "./nassau";

export function createGameEngine(
  gameId: string
): GameEngine {
  switch (gameId) {
    case "stroke-play":
      return new StrokePlayEngine();

    case "match-play":
      return new MatchPlayEngine();

    case "nassau":
      return new NassauEngine();

    default:
      throw new Error(
        `Unsupported game type: ${gameId}`
      );
  }
}