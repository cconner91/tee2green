import { GolfGameDefinition } from "./types";

export function getGamesForPlayerCount(
  playerCount: number,
  games: GolfGameDefinition[]
) {
  return games.filter(
    (game) =>
      playerCount >= game.minPlayers &&
      playerCount <= game.maxPlayers
  );
}