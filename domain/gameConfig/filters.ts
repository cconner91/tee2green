import { GolfGameDefinition, GameFormat } from "./types";

/**
 * Returns games that support the given player count.
 * Checks supportedFormats first (if present), then falls back to minPlayers/maxPlayers.
 */
export function getGamesForPlayerCount(
  playerCount: number,
  games: GolfGameDefinition[]
): GolfGameDefinition[] {
  return games.filter((game) => {
    if (game.supportedFormats && game.supportedFormats.length > 0) {
      return game.supportedFormats.some(
        (f) => playerCount >= f.minPlayers && playerCount <= f.maxPlayers
      );
    }
    return playerCount >= game.minPlayers && playerCount <= game.maxPlayers;
  });
}

/**
 * Returns the valid format combinations for a game given a player count.
 * Returns an empty array if the game has no supportedFormats (locked to its default).
 */
export function getFormatsForPlayerCount(
  game: GolfGameDefinition,
  playerCount: number
): GameFormat[] {
  if (!game.supportedFormats) return [];
  return game.supportedFormats.filter(
    (f) => playerCount >= f.minPlayers && playerCount <= f.maxPlayers
  );
}
