import {
  GolfGameDefinition,
  ScoringFormat,
  GameplayFormat,
  MatchupFormat,
} from "./types";

export const gameDefinitions: GolfGameDefinition[] = [
  {
    id: "stroke-play-game",
    name: "Stroke Play Game",
    description:
      "Lowest total strokes over 18 holes wins.",

    scoringFormat: ScoringFormat.StrokePlay,
    gameplayFormat: GameplayFormat.Individual,
    matchupFormat: MatchupFormat.H2H,

    minPlayers: 2,
    maxPlayers: 8,

    bettingEnabled: true,
    handicapEnabled: true,

    tags: ["Classic", "Total Score"],
  },

  {
    id: "match-play-game",
    name: "Match Play Game",
    description:
      "Hole-by-hole competition. Most holes won wins the match.",

    scoringFormat: ScoringFormat.MatchPlay,
    gameplayFormat: GameplayFormat.Individual,
    matchupFormat: MatchupFormat.H2H,

    minPlayers: 2,
    maxPlayers: 4,

    bettingEnabled: true,
    handicapEnabled: true,

    tags: ["Classic", "Head to Head"],
  },

  {
    id: "team-best-ball",
    name: "Team Best Ball",
    description:
      "Teams of 2. Each player plays their own ball. Lowest score per team counts.",

    scoringFormat: ScoringFormat.StrokePlay,
    gameplayFormat: GameplayFormat.BestBall,
    matchupFormat: MatchupFormat.TeamPlay,

    minPlayers: 4,
    maxPlayers: 8,

    bettingEnabled: true,
    handicapEnabled: true,

    tags: ["Team", "Best Ball"],
  },

  {
    id: "scramble-game",
    name: "Scramble",
    description:
      "All players tee off. Best shot selected. All play from that position.",

    scoringFormat: ScoringFormat.StrokePlay,
    gameplayFormat: GameplayFormat.Scramble,
    matchupFormat: MatchupFormat.TeamPlay,

    minPlayers: 4,
    maxPlayers: 8,

    bettingEnabled: true,
    handicapEnabled: true,

    tags: ["Team", "Scramble"],
  },
];