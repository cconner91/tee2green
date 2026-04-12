// GameType.ts

/**
 * Determines HOW a winner is calculated
 * This is the highest-level scoring logic
 */
export enum ScoringFramework {
  STROKE = 'stroke',
  MATCH = 'match',
  POINTS = 'points',
}

export type GameType = ScoringFramework