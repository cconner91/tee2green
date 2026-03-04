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

  minPlayers: number;
  maxPlayers: number;

  bettingEnabled: boolean;
  handicapEnabled: boolean;

  tags: string[];
}