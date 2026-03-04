import { MatchState } from "./matchState";
import { HoleResult } from "../domain/core/HoleResult";
import { PlayerId } from "../domain/models/Player";

/**
 * Determines strokes received on a hole
 * Basic allocation:
 * If handicap >= strokeIndex → receive 1 stroke
 * (Expandable later for 18+ handicaps)
 */
function strokesReceived(
  playingHandicap: number,
  strokeIndex: number
): number {
  if (playingHandicap <= 0) return 0;

  return playingHandicap >= strokeIndex ? 1 : 0;
}

export function playHole(
  state: MatchState,
  grossScores: Record<PlayerId, number>
): MatchState {
  const hole = state.course.holes[state.currentHole - 1];
  const strokeIndex = hole.strokeIndex;

  const playerA = state.players[0];
  const playerB = state.players[1];

  const grossA = grossScores[playerA.id];
  const grossB = grossScores[playerB.id];

  const strokesA = state.enableHandicaps
    ? strokesReceived(
        state.playingHandicaps[playerA.id],
        strokeIndex
      )
    : 0;

  const strokesB = state.enableHandicaps
    ? strokesReceived(
        state.playingHandicaps[playerB.id],
        strokeIndex
      )
    : 0;

  const netA = state.enableHandicaps
    ? grossA - strokesA
    : grossA;

  const netB = state.enableHandicaps
    ? grossB - strokesB
    : grossB;

  let winner: PlayerId | "TIE" = "TIE";

  if (netA < netB) winner = playerA.id;
  if (netB < netA) winner = playerB.id;

  const result: HoleResult = {
    holeNumber: state.currentHole,
    grossScores: {
      [playerA.id]: grossA,
      [playerB.id]: grossB,
    },
    netScores: {
      [playerA.id]: netA,
      [playerB.id]: netB,
    },
    winner,
  };

  return {
    ...state,
    holeResults: [...state.holeResults, result],
    currentHole: state.currentHole + 1,
  };
}