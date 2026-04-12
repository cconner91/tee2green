import { HoleResult } from "../core/HoleResult";
import { Player, PlayerId } from "../models/Player";
import { GolfGameDefinition, ScoringFormat, BettingMode } from "../gameConfig/types";
import { Course } from "../models/Course";

// ─── Player-level ─────────────────────────────────────────────────────────────

export interface PlayerSummary {
  id: PlayerId;
  name: string;
  grossTotal: number;
  netTotal: number;
  /** +/- relative to par for holes played so far */
  grossToPar: number;
  netToPar: number;
  holesPlayed: number;
  /** Only populated for Stableford games */
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

export interface NassauSummary {
  front: MatchPlaySummary;
  back: MatchPlaySummary;
  overall: MatchPlaySummary;
}

// ─── Skins ────────────────────────────────────────────────────────────────────

export interface SkinEntry {
  holeNumber: number;
  winner: PlayerId | "CARRY";
  /** Dollar value of this skin (0 if carry) */
  value: number;
}

export interface SkinsSummary {
  history: SkinEntry[];
  skinsWon: Record<PlayerId, number>;
  moneyWon: Record<PlayerId, number>;
  /** Dollar value currently sitting in the pot waiting to be won */
  currentCarryValue: number;
}

// ─── Top-level ────────────────────────────────────────────────────────────────

export interface RoundSummary {
  playerSummaries: PlayerSummary[];
  /** Standard match play status (not populated for Nassau — use nassau instead) */
  matchPlay?: MatchPlaySummary;
  nassau?: NassauSummary;
  skins?: SkinsSummary;
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
  if (holesUp >= remaining && remaining > 0) return `Dormie ${holesUp}`;
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

  return {
    history,
    skinsWon,
    moneyWon,
    currentCarryValue: carry,
  };
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function calculateRoundSummary(
  holeResults: HoleResult[],
  players: Player[],
  game: GolfGameDefinition,
  course: Course,
  skinValue = 1
): RoundSummary {
  const holesPlayed = holeResults.length;
  const totalHoles = course.holes.length;
  const playerIds = players.map((p) => p.id);

  // ── Player summaries ──────────────────────────────────────────────────────
  const playerSummaries: PlayerSummary[] = players.map((player) => {
    const played = holeResults.filter((hr) => player.id in hr.grossScores);
    const grossTotal = played.reduce((s, hr) => s + hr.grossScores[player.id], 0);
    const netTotal = played.reduce((s, hr) => s + hr.netScores[player.id], 0);
    const parPlayed = played.reduce((s, hr) => s + hr.par, 0);

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
        return s + 5; // albatross or better
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
  const isMatchPlay =
    game.scoringFormat === ScoringFormat.MatchPlay ||
    game.bettingMode === BettingMode.Nassau;

  const matchPlay =
    isMatchPlay && game.bettingMode !== BettingMode.Nassau
      ? calcMatchPlay(holeResults, playerIds, holesPlayed, totalHoles)
      : undefined;

  // ── Nassau ─────────────────────────────────────────────────────────────────
  let nassau: NassauSummary | undefined;
  if (game.bettingMode === BettingMode.Nassau) {
    const front = holeResults.filter((hr) => hr.holeNumber <= 9);
    const back  = holeResults.filter((hr) => hr.holeNumber >= 10);
    nassau = {
      front:   calcMatchPlay(front, playerIds, front.length, 9),
      back:    calcMatchPlay(back,  playerIds, back.length,  9),
      overall: calcMatchPlay(holeResults, playerIds, holesPlayed, totalHoles),
    };
  }

  // ── Skins ──────────────────────────────────────────────────────────────────
  const skins =
    game.bettingMode === BettingMode.Skins
      ? calcSkins(holeResults, playerIds, skinValue)
      : undefined;

  return { playerSummaries, matchPlay, nassau, skins, holesPlayed, totalHoles };
}
