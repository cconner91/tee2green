export enum ScoringFormat {
  StrokePlay = "StrokePlay",
  MatchPlay = "MatchPlay",
  PointsBased = "PointsBased",
}

export enum GameplayFormat {
  Individual = "Individual",
  BestBall = "BestBall",
  Scramble = "Scramble",
  Shamble = "Shamble",
  AltShot = "AltShot",
}

export enum MatchupFormat {
  Solo = "Solo",
  H2H = "H2H",
  TeamPlay = "TeamPlay",
}

/**
 * A valid combination of gameplay + matchup format for a multi-format game.
 * Medal Play supports Solo and H2H individual, for example.
 */
export interface GameFormat {
  gameplayFormat: GameplayFormat;
  matchupFormat: MatchupFormat;
  minPlayers: number;
  maxPlayers: number;
  /** Shown in the format picker, e.g. "Solo Round", "Individual vs Individual" */
  label: string;
}

/**
 * How the monetary bet is structured for stroke play and match play games.
 * Chosen by the user in the betting setup step.
 * Skins is its own game format — not a BettingStructure.
 */
export type BettingStructure = "HoleByHole" | "FullMatch" | "Nassau";

/**
 * Full betting configuration for a round.
 * Defined here (not in matchStore) so roundSummary.ts can import it cleanly.
 */
export interface BettingConfig {
  enabled: boolean;
  /** Betting structure. Defaults to FullMatch. */
  structure: BettingStructure;
  /**
   * Dollar amount:
   * - HoleByHole: per hole won
   * - FullMatch: total match bet (winner collects from each opponent)
   * - Nassau: per segment (front / back / overall each worth this)
   */
  amount: number;
  /** Value per skin — only used by the Skins game. */
  skinValue: number;
  /** Nassau only: auto-press when a player is this many holes down. 0 = disabled. */
  nassauAutoPressAt: number;
}

/**
 * @deprecated kept for the Skins game definition and Nassau game backward-compat.
 * New code should use BettingStructure + BettingConfig instead.
 */
export enum BettingMode {
  Standard = "Standard", // single settlement at end
  Nassau   = "Nassau",   // kept for Nassau game definition
  Skins    = "Skins",    // Skins game: per-hole pool with carryovers
}

export interface GameConfiguration {
  scoringFormat: ScoringFormat;
  gameplayFormat: GameplayFormat;
  matchupFormat: MatchupFormat;
  playerCount: number;
}

export interface GolfGameDefinition {
  id: string;
  name: string;
  description: string;

  scoringFormat: ScoringFormat;
  gameplayFormat: GameplayFormat;
  matchupFormat: MatchupFormat;
  bettingMode: BettingMode;

  minPlayers: number;
  maxPlayers: number;

  bettingEnabled: boolean;
  handicapEnabled: boolean;

  tags: string[];

  /**
   * Optional: all valid gameplay+matchup combinations for this game.
   * If present, the setup wizard filters by player count and shows a
   * format picker when multiple combinations are valid.
   * If absent, the game is locked to its gameplayFormat + matchupFormat.
   */
  supportedFormats?: GameFormat[];

  /**
   * "ready"  — fully wired, playable today.
   * "stub"   — shown in game library as coming soon, blocked in setup.
   * Omitting is equivalent to "ready".
   */
  engineStatus?: "ready" | "stub";
}
