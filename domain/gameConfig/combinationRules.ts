import {
  ScoringFormat,
  GameplayFormat,
  MatchupFormat,
  GameConfiguration,
} from "./types";

export function isValidCombination(
  config: GameConfiguration
): { valid: boolean; reason?: string } {
  const {
    scoringFormat,
    gameplayFormat,
    matchupFormat,
    playerCount,
  } = config;

  // --- PLAYER COUNT RULES ---
  if (matchupFormat === MatchupFormat.Solo && playerCount !== 1) {
    return {
      valid: false,
      reason: "Solo format requires exactly 1 player.",
    };
  }

  if (matchupFormat === MatchupFormat.TeamPlay && playerCount < 4) {
    return {
      valid: false,
      reason: "Team Play requires at least 4 players.",
    };
  }

  if (matchupFormat === MatchupFormat.H2H && playerCount < 2) {
    return {
      valid: false,
      reason: "H2H requires at least 2 players.",
    };
  }

  // --- GAMEPLAY CONSTRAINTS ---
  if (
    gameplayFormat === GameplayFormat.AltShot &&
    matchupFormat !== MatchupFormat.TeamPlay
  ) {
    return {
      valid: false,
      reason: "Alternate Shot requires Team Play.",
    };
  }

  if (
    gameplayFormat === GameplayFormat.Scramble &&
    matchupFormat !== MatchupFormat.TeamPlay
  ) {
    return {
      valid: false,
      reason: "Scramble requires Team Play.",
    };
  }

  if (
    gameplayFormat === GameplayFormat.BestBall &&
    matchupFormat === MatchupFormat.Solo
  ) {
    return {
      valid: false,
      reason: "Best Ball requires multiple players.",
    };
  }

  // --- SCORING RULES ---
  if (
    scoringFormat === ScoringFormat.MatchPlay &&
    matchupFormat === MatchupFormat.Solo
  ) {
    return {
      valid: false,
      reason: "Match Play cannot be Solo.",
    };
  }

  return { valid: true };
}