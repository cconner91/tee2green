export type BetType =
  | "NASSAU"
  | "MATCH_PLAY"
  | "STROKE_PLAY"
  | "SKINS";

export interface Bet {
  id: string;
  type: BetType;
  amount: number;

  // Who placed the bet
  placedBy: string;

  // Who it is against
  opponent: string;

  // Settlement status
  status: "OPEN" | "WON" | "LOST" | "PUSH";

  createdAt: Date;
}