import {
  GolfGameDefinition,
  ScoringFormat,
  GameplayFormat,
  MatchupFormat,
} from "./types";

export const gameDefinitions: GolfGameDefinition[] = [
  {
    id: "stroke-play",
    name: "Stroke Play",
    description:
      "Traditional golf scoring. Lowest total strokes wins.",
    minPlayers: 1,
    maxPlayers: 8,
    scoringFormats: [ScoringFormat.StrokePlay],
    gameplayFormats: [GameplayFormat.Individual],
    matchupFormats: [
      MatchupFormat.Solo,
      MatchupFormat.H2H,
      MatchupFormat.TeamPlay,
    ],
    bettingEnabled: true,
    handicapEnabled: true,
    tags: ["Classic"],
  },
  {
    id: "match-play",
    name: "Match Play",
    description:
      "Hole-by-hole competition. Most holes won wins.",
    minPlayers: 2,
    maxPlayers: 4,
    scoringFormats: [ScoringFormat.MatchPlay],
    gameplayFormats: [GameplayFormat.Individual],
    matchupFormats: [MatchupFormat.H2H],
    bettingEnabled: true,
    handicapEnabled: true,
    tags: ["Classic"],
  },
  {
    id: "nassau",
    name: "Nassau",
    description:
      "Front 9, Back 9, Overall match.",
    minPlayers: 2,
    maxPlayers: 4,
    scoringFormats: [
      ScoringFormat.MatchPlay,
      ScoringFormat.StrokePlay,
    ],
    gameplayFormats: [GameplayFormat.Individual],
    matchupFormats: [MatchupFormat.H2H],
    bettingEnabled: true,
    handicapEnabled: true,
    tags: ["Betting"],
  },
];