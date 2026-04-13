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
 * Describes HOW the betting is structured — independent of the core scoring format.
 *
 * Nassau and Skins are bet overlays, not gameplay formats. A Nassau is simply
 * three simultaneous match-play bets (front 9 / back 9 / overall) settled
 * independently. Skins is a per-hole prize pool with carry-overs on ties.
 * Both can technically be layered on top of any scoring format, but in practice
 * they imply specific scoring rules (match play and stroke play respectively).
 */
export enum BettingMode {
  Standard = "Standard", // single settlement at end
  Nassau = "Nassau",     // front / back / overall as three separate bets
  Skins = "Skins",       // per-hole skin with carry-overs on ties
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
   * "ready"  — fully wired to the scoring engine, playable today.
   * "stub"   — shown in the Game Library as "coming soon" but blocked in setup.
   *            Games that need a custom per-hole engine (Wolf, Vegas, Bingo Bango
   *            Bongo) or team-assignment UI (Team Match Play, Ryder Cup) live here
   *            until their dedicated engines are built.
   * Omitting this field is equivalent to "ready".
   */
  engineStatus?: "ready" | "stub";
}