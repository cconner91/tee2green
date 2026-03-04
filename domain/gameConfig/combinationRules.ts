import {
  ScoringFormat,
  GameplayFormat,
  MatchupFormat,
} from "./types";

export const validCombinations = {
  [GameplayFormat.Individual]: [
    MatchupFormat.Solo,
    MatchupFormat.H2H,
    MatchupFormat.TeamPlay,
  ],
  [GameplayFormat.BestBall]: [MatchupFormat.TeamPlay],
  [GameplayFormat.Scramble]: [MatchupFormat.TeamPlay],
  [GameplayFormat.Shamble]: [MatchupFormat.TeamPlay],
  [GameplayFormat.AltShot]: [MatchupFormat.TeamPlay],
};

export const invalidCombinations = [
  {
    scoring: ScoringFormat.MatchPlay,
    matchup: MatchupFormat.Solo,
  },
];

export function isValidCombination(
  scoring: ScoringFormat,
  gameplay: GameplayFormat,
  matchup: MatchupFormat
): boolean {
  const validMatchups = validCombinations[gameplay] || [];
  const isValidMatchup = validMatchups.includes(matchup);

  const isInvalid = invalidCombinations.some(
    (rule) =>
      rule.scoring === scoring &&
      rule.matchup === matchup
  );

  return isValidMatchup && !isInvalid;
}