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
  H2HModified = "H2HModified",
  TeamPlay = "TeamPlay",
}

export interface GolfGameDefinition {
  id: string;
  name: string;
  description: string;

  minPlayers: number;
  maxPlayers: number;

  scoringFormats: ScoringFormat[];
  gameplayFormats: GameplayFormat[];
  matchupFormats: MatchupFormat[];

  bettingEnabled: boolean;
  handicapEnabled: boolean;

  tags: string[];
}