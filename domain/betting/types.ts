export interface BettingConfiguration {
  enabled: boolean;

  baseBetAmount?: number;

  perHoleBet?: boolean;
  frontNineBet?: boolean;
  backNineBet?: boolean;
  overallBet?: boolean;
}