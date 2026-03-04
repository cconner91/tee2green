import { GameEngine } from "./types";
import { StrokePlayEngine } from "./strokePlayEngine";
import { MatchPlayEngine } from "./matchPlayEngine";

export function createGameEngine(
  gameId: string
): GameEngine {
  switch (gameId) {
    case "stroke-play-game":
      return new StrokePlayEngine();

    case "match-play-game":
      return new MatchPlayEngine();

    default:
      throw new Error(
        `Unsupported game type: ${gameId}`
      );
  }
}