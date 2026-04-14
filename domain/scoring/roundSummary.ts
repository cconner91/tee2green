import { HoleResult } from "../core/HoleResult";
import { Player, PlayerId } from "../models/Player";
import { GolfGameDefinition, ScoringFormat, BettingMode, BettingConfig } from "../gameConfig/types";
import { Course } from "../models/Course";
import { NassauPress } from "@/store/matchStore";

// ─── Player-level ─────────────────────────────────────────────────────────────

export interface PlayerSummary {
  id: PlayerId;
  name: string;
  grossTotal: number;
  netTotal: number;
  grossToPar: number;
  netToPar: number;
  holesPlayed: number;
  stablefordPoints?: number;
}

// ─── Match Play ───────────────────────────────────────────────────────────────

export interface MatchPlaySummary {
  /** e.g. "3 UP", "All Square", "Dormie 2", "3&2" */
  status: string;
  leaderId: PlayerId | null;
  trailerId: PlayerId | null;
  holesUp: number;
  holesWon: Record<PlayerId, number>;
  matchOver: boolean;
}

// ─── Nassau ───────────────────────────────────────────────────────────────────

export interface NassauPressSummary {
  id: string;
  startHole: number;
  amount: number;
  /** Match play status for holes startHole → 18 */
  match: MatchPlaySummary;
}

export interface NassauSummary {
  front: MatchPlaySummary;
  back: MatchPlaySummary;
  overall: MatchPlaySummary;
  presses: NassauPressSummary[];
  /** Current net balance per player across all bets if the round ended now */
  balance: Record<PlayerId, number>;
}

// ─── Hole-by-hole ─────────────────────────────────────────────────────────────

export interface HoleByHoleSummary {
  /** Running net balance per player (positive = won, negative = owed) */
  balance: Record<PlayerId, number>;
  history: Array<{
    holeNumber: number;
    winner: PlayerId | "TIE";
    /** How much each player gained/lost on this hole */
    delta: Record<PlayerId, number>;
  }>;
}

// ─── Full match ───────────────────────────────────────────────────────────────

export interface FullMatchSummary {
  /** Current leader id (if round complete, definitive winner) */
  leaderId: PlayerId | null;
  /** Net balance per player: positive = won, negative = owed */
  balance: Record<PlayerId, number>;
}

// ─── Skins ────────────────────────────────────────────────────────────────────

export interface SkinEntry {
  holeNumber: number;
  winner: PlayerId | "CARRY";
  value: number;
}

export interface SkinsSummary {
  history: SkinEntry[];
  skinsWon: Record<PlayerId, number>;
  moneyWon: Record<PlayerId, number>;
  currentCarryValue: number;
}

// ─── Top-level ────────────────────────────────────────────────────────────────

export interface RoundSummary {
  playerSummaries: PlayerSummary[];
  matchPlay?: MatchPlaySummary;
  nassau?: NassauSummary;
  skins?: SkinsSummary;
  holeByHole?: HoleByHoleSummary;
  fullMatch?: FullMatchSummary;
  holesPlayed: number;
  totalHoles: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function matchStatus(
  holesUp: number,
  holesPlayed: number,
  totalHoles: number,
  matchOver: boolean
): string {
  if (holesUp === 0) return "All Square";
  const remaining = totalHoles - holesPlayed;
  if (matchOver) return `${holesUp}&${remaining}`;
  if (remaining > 0 && holesUp >= remaining) return `Dormie ${holesUp}`;
  return `${holesUp} UP`;
}

function calcMatchPlay(
  results: HoleResult[],
  playerIds: PlayerId[],
  holesPlayed: number,
  totalHoles: number
): MatchPlaySummary {
  const holesWon: Record<PlayerId, number> = {};
  playerIds.forEach((id) => { holesWon[id] = 0; });

  for (const hr of results) {
    if (hr.winner !== "TIE" && hr.winner in holesWon) {
      holesWon[hr.winner]++;
    }
  }

  const [idA, idB] = playerIds;
  const winsA = holesWon[idA] ?? 0;
  const winsB = idB ? (holesWon[idB] ?? 0) : 0;
  const diff = winsA - winsB;
  const holesUp = Math.abs(diff);
  const remaining = totalHoles - holesPlayed;
  const matchOver = holesUp > remaining;
  const leaderId = diff > 0 ? idA : diff < 0 ? idB : null;
  const trailerId = diff > 0 ? idB : diff < 0 ? idA : null;

  return {
    status: matchStatus(holesUp, holesPlayed, totalHoles, matchOver),
    leaderId,
    trailerId,
    holesUp,
    holesWon,
    matchOver,
  };
}

function calcSkins(
  results: HoleResult[],
  playerIds: PlayerId[],
  skinValue: number
): SkinsSummary {
  const history: SkinEntry[] = [];
  const skinsWon: Record<PlayerId, number> = {};
  const moneyWon: Record<PlayerId, number> = {};
  playerIds.forEach((id) => { skinsWon[id] = 0; moneyWon[id] = 0; });

  let carry = 0;
  for (const hr of results) {
    if (hr.winner === "TIE") {
      carry += skinValue;
      history.push({ holeNumber: hr.holeNumber, winner: "CARRY", value: 0 });
    } else {
      const value = skinValue + carry;
      history.push({ holeNumber: hr.holeNumber, winner: hr.winner, value });
      if (hr.winner in skinsWon) {
        skinsWon[hr.winner]++;
        moneyWon[hr.winner] += value;
      }
      carry = 0;
    }
  }

  return { history, skinsWon, moneyWon, currentCarryValue: carry };
}

function calcHoleByHole(
  results: HoleResult[],
  playerIds: PlayerId[],
  amount: number
): HoleByHoleSummary {
  const balance: Record<PlayerId, number> = {};
  playerIds.forEach((id) => { balance[id] = 0; });

  const history: HoleByHoleSummary["history"] = [];

  for (const hr of results) {
    const delta: Record<PlayerId, number> = {};
    playerIds.forEach((id) => { delta[id] = 0; });

    if (hr.winner !== "TIE") {
      // Winner collects `amount` from each opponent
      delta[hr.winner] = amount * (playerIds.length - 1);
      playerIds.forEach((id) => {
        if (id !== hr.winner) delta[id] = -amount;
      });
    }

    playerIds.forEach((id) => { balance[id] += delta[id]; });
    history.push({ holeNumber: hr.holeNumber, winner: hr.winner, delta });
  }

  return { balance, history };
}

function calcFullMatch(
  playerSummaries: PlayerSummary[],
  game: GolfGameDefinition,
  matchPlaySummary: MatchPlaySummary | undefined,
  amount: number
): FullMatchSummary {
  const balance: Record<PlayerId, number> = {};
  playerSummaries.forEach((ps) => { balance[ps.id] = 0; });

  let leaderId: PlayerId | null = null;

  if (game.scoringFormat === ScoringFormat.MatchPlay && matchPlaySummary) {
    // Use hole-count winner
    leaderId = matchPlaySummary.leaderId;
  } else {
    // Stroke play: lowest net score wins
    const sorted = [...playerSummaries].sort((a, b) => a.netToPar - b.netToPar);
    if (sorted.length > 1 && sorted[0].netToPar < sorted[1].netToPar) {
      leaderId = sorted[0].id;
    }
  }

  if (leaderId) {
    balance[leaderId] = amount * (playerSummaries.length - 1);
    playerSummaries.forEach((ps) => {
      if (ps.id !== leaderId) balance[ps.id] = -amount;
    });
  }

  return { leaderId, balance };
}

function calcNassauBalance(
  front: MatchPlaySummary,
  back: MatchPlaySummary,
  overall: MatchPlaySummary,
  presses: NassauPressSummary[],
  amount: number,
  playerIds: PlayerId[]
): Record<PlayerId, number> {
  const balance: Record<PlayerId, number> = {};
  playerIds.forEach((id) => { balance[id] = 0; });

  function applyBet(mp: MatchPlaySummary, betAmount: number) {
    if (!mp.leaderId) return; // All square — no money
    balance[mp.leaderId] = (balance[mp.leaderId] ?? 0) + betAmount;
    if (mp.trailerId) {
      balance[mp.trailerId] = (balance[mp.trailerId] ?? 0) - betAmount;
    }
  }

  applyBet(front, amount);
  applyBet(back, amount);
  applyBet(overall, amount);
  presses.forEach((p) => applyBet(p.match, p.amount));

  return balance;
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function calculateRoundSummary(
  holeResults: HoleResult[],
  players: Player[],
  game: GolfGameDefinition,
  course: Course,
  betting: BettingConfig,
  nassauPresses: NassauPress[] = []
): RoundSummary {
  const holesPlayed = holeResults.length;
  const totalHoles = course.holes.length;
  const playerIds = players.map((p) => p.id);

  // ── Player summaries ──────────────────────────────────────────────────────
  const playerSummaries: PlayerSummary[] = players.map((player) => {
    const played = holeResults.filter((hr) => player.id in hr.grossScores);
    const grossTotal = played.reduce((s, hr) => s + hr.grossScores[player.id], 0);
    const netTotal   = played.reduce((s, hr) => s + hr.netScores[player.id], 0);
    const parPlayed  = played.reduce((s, hr) => s + hr.par, 0);

    let stablefordPoints: number | undefined;
    if (game.scoringFormat === ScoringFormat.PointsBased) {
      stablefordPoints = played.reduce((s, hr) => {
        const net = hr.netScores[player.id];
        const diff = net - hr.par;
        if (diff >= 2)   return s + 0;
        if (diff === 1)  return s + 1;
        if (diff === 0)  return s + 2;
        if (diff === -1) return s + 3;
        if (diff === -2) return s + 4;
        return s + 5;
      }, 0);
    }

    return {
      id: player.id,
      name: player.name,
      grossTotal,
      netTotal,
      grossToPar: grossTotal - parPlayed,
      netToPar: netTotal - parPlayed,
      holesPlayed: played.length,
      stablefordPoints,
    };
  });

  // ── Match Play ─────────────────────────────────────────────────────────────
  const isMatchPlayGame = game.scoringFormat === ScoringFormat.MatchPlay;
  const isNassauGame    = game.bettingMode === BettingMode.Nassau;
  const isNassauBet     = betting.enabled && betting.structure === "Nassau";

  const matchPlay =
    isMatchPlayGame && !isNassauGame && !isNassauBet && playerIds.length >= 2
      ? calcMatchPlay(holeResults, playerIds, holesPlayed, totalHoles)
      : undefined;

  // ── Nassau ─────────────────────────────────────────────────────────────────
  let nassau: NassauSummary | undefined;
  if ((isNassauGame || isNassauBet) && playerIds.length >= 2) {
    const front   = holeResults.filter((hr) => hr.holeNumber <= 9);
    const back    = holeResults.filter((hr) => hr.holeNumber >= 10);
    const frontMP = calcMatchPlay(front, playerIds, front.length, 9);
    const backMP  = calcMatchPlay(back,  playerIds, back.length,  9);
    const overall = calcMatchPlay(holeResults, playerIds, holesPlayed, totalHoles);

    const presses: NassauPressSummary[] = nassauPresses.map((p) => {
      const pressResults = holeResults.filter((hr) => hr.holeNumber >= p.startHole);
      const holesInPress = totalHoles - p.startHole + 1;
      return {
        id: p.id,
        startHole: p.startHole,
        amount: p.amount,
        match: calcMatchPlay(pressResults, playerIds, pressResults.length, holesInPress),
      };
    });

    const segmentAmount = isNassauGame ? betting.amount : betting.amount;
    const balance = calcNassauBalance(frontMP, backMP, overall, presses, segmentAmount, playerIds);

    nassau = {
      front: frontMP,
      back:  backMP,
      overall,
      presses,
      balance,
    };
  }

  // ── Skins ──────────────────────────────────────────────────────────────────
  const skins =
    game.bettingMode === BettingMode.Skins
      ? calcSkins(holeResults, playerIds, betting.skinValue)
      : undefined;

  // ── Hole-by-hole ───────────────────────────────────────────────────────────
  const holeByHole =
    betting.enabled && betting.structure === "HoleByHole" && playerIds.length >= 2
      ? calcHoleByHole(holeResults, playerIds, betting.amount)
      : undefined;

  // ── Full match ─────────────────────────────────────────────────────────────
  const fullMatch =
    betting.enabled && betting.structure === "FullMatch" && playerIds.length >= 2
      ? calcFullMatch(playerSummaries, game, matchPlay, betting.amount)
      : undefined;

  return {
    playerSummaries,
    matchPlay,
    nassau,
    skins,
    holeByHole,
    fullMatch,
    holesPlayed,
    totalHoles,
  };
}
