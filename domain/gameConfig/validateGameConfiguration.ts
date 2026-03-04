import {
  GameConfiguration,
  GolfGameDefinition,
} from "./types";
import { isValidCombination } from "./combinationRules";

export function validateGameConfiguration(
  config: GameConfiguration
): { valid: boolean; reason?: string } {
  return isValidCombination(config);
}

export function validatePresetGame(
  preset: GolfGameDefinition,
  playerCount: number
): { valid: boolean; reason?: string } {
  if (playerCount < preset.minPlayers) {
    return {
      valid: false,
      reason: `Minimum players required: ${preset.minPlayers}`,
    };
  }

  if (playerCount > preset.maxPlayers) {
    return {
      valid: false,
      reason: `Maximum players allowed: ${preset.maxPlayers}`,
    };
  }

  return isValidCombination({
    scoringFormat: preset.scoringFormat,
    gameplayFormat: preset.gameplayFormat,
    matchupFormat: preset.matchupFormat,
    playerCount,
  });
}