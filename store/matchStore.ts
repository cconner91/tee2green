"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

import { GolfGameDefinition, GameFormat, BettingConfig } from "@/domain/gameConfig/types";
import { Player, PlayerId } from "@/domain/models/Player";
import { Hole } from "@/domain/models/Hole";
import { Course } from "@/domain/models/Course";
import { HoleResult } from "@/domain/core/HoleResult";
import { mockCourse } from "@/data/mockCourse";
import { APICourse, APITee } from "@/domain/course/types";
import { adaptCourseForRound } from "@/domain/course/CourseService";
import {
  calculateCourseHandicap,
  calculatePlayingHandicap,
} from "@/domain/core/handicap";
import { evaluateHole } from "@/domain/core/evaluateHole";

// ─── Setup types ──────────────────────────────────────────────────────────────

export interface PlayerDraft {
  name: string;
  handicapIndex: number;
}

export interface ManualCourseDetails {
  name: string;
  par: number;
  courseRating: number;
  slopeRating: number;
}

export interface SetupState {
  step: 1 | 2 | 3 | 4 | 5;
  playerCount: number;
  players: PlayerDraft[];
  enableHandicaps: boolean;
  selectedCourse: APICourse | null;
  selectedTee: APITee | null;
  /** Manually entered course details (used when no API course is selected). */
  manualCourse: ManualCourseDetails | null;
  selectedGame: GolfGameDefinition | null;
  /** Chosen format combination (only required when game has multiple supportedFormats). */
  selectedFormat: GameFormat | null;
  betting: BettingConfig;
}

// ─── Round types ──────────────────────────────────────────────────────────────

export interface NassauPress {
  id: string;
  /** Hole number where this press starts. */
  startHole: number;
  /** Dollar amount for this press. */
  amount: number;
}

export interface ActiveRound {
  players: Player[];
  game: GolfGameDefinition;
  course: Course;
  courseHoles: Hole[];
  playingHandicaps: Record<PlayerId, number>;
  currentHole: number;
  holeResults: HoleResult[];
  isComplete: boolean;
  enableHandicaps: boolean;
  betting: BettingConfig;
  /** Chosen format for this round (resolved from selectedFormat or game defaults). */
  gameplayFormat: string;
  matchupFormat: string;
  /** Active Nassau presses. Only relevant when betting.structure === "Nassau". */
  nassauPresses: NassauPress[];
}

// ─── Store interface ──────────────────────────────────────────────────────────

interface MatchStore {
  setup: SetupState | null;
  round: ActiveRound | null;

  // Setup actions
  initSetup: (playerCount: number) => void;
  setSetupStep: (step: SetupState["step"]) => void;
  updatePlayers: (players: PlayerDraft[]) => void;
  setEnableHandicaps: (enabled: boolean) => void;
  selectCourse: (course: APICourse, tee: APITee) => void;
  clearCourse: () => void;
  setManualCourse: (details: ManualCourseDetails | null) => void;
  selectGame: (game: GolfGameDefinition) => void;
  selectFormat: (format: GameFormat) => void;
  updateBetting: (partial: Partial<BettingConfig>) => void;
  clearSetup: () => void;

  // Round actions
  startRound: () => void;
  setHolePar: (holeNumber: number, par: number) => void;
  setHoleStrokeIndex: (holeNumber: number, strokeIndex: number) => void;
  editHoleScore: (holeNumber: number, playerId: PlayerId, score: number) => void;
  submitHole: (grossScores: Record<PlayerId, number>) => void;
  undoLastHole: () => void;
  addNassauPress: () => void;
  abandonRound: () => void;
}

// ─── Defaults ─────────────────────────────────────────────────────────────────

const defaultBetting: BettingConfig = {
  enabled: false,
  structure: "FullMatch",
  amount: 5,
  skinValue: 2,
  nassauAutoPressAt: 0,
};

// ─── Auto-press helper ────────────────────────────────────────────────────────

function getMatchStanding(
  results: HoleResult[],
  idA: PlayerId,
  idB: PlayerId
): { holesUp: number; leaderId: PlayerId | null } {
  let winsA = 0;
  let winsB = 0;
  for (const hr of results) {
    if (hr.winner === idA) winsA++;
    else if (hr.winner === idB) winsB++;
  }
  const diff = winsA - winsB;
  return {
    holesUp: Math.abs(diff),
    leaderId: diff > 0 ? idA : diff < 0 ? idB : null,
  };
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useMatchStore = create<MatchStore>()(
  persist(
    (set, get) => ({
      setup: null,
      round: null,

      // ── Setup ────────────────────────────────────────────────────────────

      initSetup: (playerCount) => {
        const players: PlayerDraft[] = Array.from({ length: playerCount }, () => ({
          name: "",
          handicapIndex: 0,
        }));
        set({
          setup: {
            step: 1,
            playerCount,
            players,
            enableHandicaps: false,
            selectedCourse: null,
            selectedTee: null,
            manualCourse: null,
            selectedGame: null,
            selectedFormat: null,
            betting: { ...defaultBetting },
          },
        });
      },

      setSetupStep: (step) => {
        const { setup } = get();
        if (!setup) return;
        set({ setup: { ...setup, step } });
      },

      updatePlayers: (players) => {
        const { setup } = get();
        if (!setup) return;
        set({ setup: { ...setup, players } });
      },

      setEnableHandicaps: (enabled) => {
        const { setup } = get();
        if (!setup) return;
        set({ setup: { ...setup, enableHandicaps: enabled } });
      },

      selectCourse: (course, tee) => {
        const { setup } = get();
        if (!setup) return;
        set({ setup: { ...setup, selectedCourse: course, selectedTee: tee } });
      },

      clearCourse: () => {
        const { setup } = get();
        if (!setup) return;
        set({ setup: { ...setup, selectedCourse: null, selectedTee: null, manualCourse: null } });
      },

      setManualCourse: (details) => {
        const { setup } = get();
        if (!setup) return;
        set({ setup: { ...setup, manualCourse: details } });
      },

      selectGame: (game) => {
        const { setup } = get();
        if (!setup) return;
        // Reset format when game changes
        set({ setup: { ...setup, selectedGame: game, selectedFormat: null } });
      },

      selectFormat: (format) => {
        const { setup } = get();
        if (!setup) return;
        set({ setup: { ...setup, selectedFormat: format } });
      },

      updateBetting: (partial) => {
        const { setup } = get();
        if (!setup) return;
        set({ setup: { ...setup, betting: { ...setup.betting, ...partial } } });
      },

      clearSetup: () => set({ setup: null }),

      // ── Round ────────────────────────────────────────────────────────────

      startRound: () => {
        const { setup } = get();
        if (!setup?.selectedGame) return;

        const course =
          setup.selectedCourse && setup.selectedTee
            ? adaptCourseForRound(setup.selectedCourse, setup.selectedTee)
            : setup.manualCourse
            ? {
                ...mockCourse,
                id: "manual-course",
                name: setup.manualCourse.name || "Manual Course",
                par: setup.manualCourse.par || mockCourse.par,
                slopeRating: setup.manualCourse.slopeRating || mockCourse.slopeRating,
                courseRating: setup.manualCourse.courseRating || mockCourse.courseRating,
              }
            : mockCourse;
        const courseHoles: Hole[] = course.holes.map((h) => ({ ...h }));

        const players: Player[] = setup.players
          .slice(0, setup.playerCount)
          .map((draft, i) => ({
            id: `player-${i + 1}`,
            name: draft.name.trim() || `Player ${i + 1}`,
            handicapIndex: draft.handicapIndex,
          }));

        const playingHandicaps: Record<PlayerId, number> = {};
        players.forEach((player) => {
          if (setup.enableHandicaps && player.handicapIndex > 0) {
            const courseHcp = calculateCourseHandicap(
              player.handicapIndex,
              course.slopeRating,
              course.courseRating,
              course.par
            );
            playingHandicaps[player.id] = calculatePlayingHandicap(courseHcp);
          } else {
            playingHandicaps[player.id] = 0;
          }
        });

        // Resolve gameplay / matchup format
        const resolvedGameplayFormat =
          setup.selectedFormat?.gameplayFormat ?? setup.selectedGame.gameplayFormat;
        const resolvedMatchupFormat =
          setup.selectedFormat?.matchupFormat ?? setup.selectedGame.matchupFormat;

        // For Nassau game, force Nassau betting structure
        const resolvedBetting: BettingConfig =
          setup.selectedGame.id === "nassau"
            ? { ...setup.betting, structure: "Nassau" }
            : setup.betting;

        set({
          round: {
            players,
            game: setup.selectedGame,
            course,
            courseHoles,
            playingHandicaps,
            currentHole: 1,
            holeResults: [],
            isComplete: false,
            enableHandicaps: setup.enableHandicaps,
            betting: resolvedBetting,
            gameplayFormat: resolvedGameplayFormat,
            matchupFormat: resolvedMatchupFormat,
            nassauPresses: [],
          },
          setup: null,
        });
      },

      setHolePar: (holeNumber, par) => {
        const { round } = get();
        if (!round) return;
        const updated = round.courseHoles.map((h) =>
          h.number === holeNumber ? { ...h, par } : h
        );
        set({ round: { ...round, courseHoles: updated } });
      },

      setHoleStrokeIndex: (holeNumber, strokeIndex) => {
        const { round } = get();
        if (!round) return;
        const updated = round.courseHoles.map((h) =>
          h.number === holeNumber ? { ...h, strokeIndex } : h
        );
        set({ round: { ...round, courseHoles: updated } });
      },

      editHoleScore: (holeNumber, playerId, score) => {
        const { round } = get();
        if (!round) return;
        const updatedResults = round.holeResults.map((r) => {
          if (r.holeNumber !== holeNumber) return r;
          const holeData = round.courseHoles.find((h) => h.number === holeNumber);
          if (!holeData) return r;
          const newGrossScores = { ...r.grossScores, [playerId]: score };
          return evaluateHole(holeData, newGrossScores, round.playingHandicaps);
        });
        set({ round: { ...round, holeResults: updatedResults } });
      },

      submitHole: (grossScores) => {
        const { round } = get();
        if (!round || round.isComplete) return;

        const holeData = round.courseHoles[round.currentHole - 1];
        const result = evaluateHole(holeData, grossScores, round.playingHandicaps);

        const newResults = [...round.holeResults, result];
        const nextHole = round.currentHole + 1;
        const isComplete = nextHole > round.courseHoles.length;

        // ── Auto-press check for Nassau ────────────────────────────────────
        let newPresses = [...round.nassauPresses];
        if (
          round.betting.enabled &&
          round.betting.structure === "Nassau" &&
          round.betting.nassauAutoPressAt > 0 &&
          !isComplete &&
          round.players.length === 2
        ) {
          const [idA, idB] = round.players.map((p) => p.id);
          const standing = getMatchStanding(newResults, idA, idB);
          // Press at the start of the NEXT hole if no press already starts there
          if (
            standing.holesUp >= round.betting.nassauAutoPressAt &&
            !newPresses.some((p) => p.startHole === nextHole)
          ) {
            newPresses.push({
              id: `press-${Date.now()}`,
              startHole: nextHole,
              amount: round.betting.amount,
            });
          }
        }

        set({
          round: {
            ...round,
            holeResults: newResults,
            nassauPresses: newPresses,
            currentHole: isComplete ? round.currentHole : nextHole,
            isComplete,
          },
        });
      },

      undoLastHole: () => {
        const { round } = get();
        if (!round || round.holeResults.length === 0) return;

        const newResults = round.holeResults.slice(0, -1);
        const prevHole = round.isComplete
          ? round.currentHole
          : round.currentHole - 1;

        // Remove any presses that started at or after the hole we're undoing
        const removedHole = round.isComplete ? round.currentHole : round.currentHole - 1;
        const newPresses = round.nassauPresses.filter(
          (p) => p.startHole < removedHole
        );

        set({
          round: {
            ...round,
            holeResults: newResults,
            nassauPresses: newPresses,
            currentHole: Math.max(1, prevHole),
            isComplete: false,
          },
        });
      },

      addNassauPress: () => {
        const { round } = get();
        if (!round) return;
        if (!round.betting.enabled || round.betting.structure !== "Nassau") return;
        if (round.isComplete) return;
        // Don't double-press the same hole
        if (round.nassauPresses.some((p) => p.startHole === round.currentHole)) return;

        set({
          round: {
            ...round,
            nassauPresses: [
              ...round.nassauPresses,
              {
                id: `press-${Date.now()}`,
                startHole: round.currentHole,
                amount: round.betting.amount,
              },
            ],
          },
        });
      },

      abandonRound: () => set({ round: null }),
    }),
    {
      name: "tee2green-match-v3",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ round: state.round }),
      version: 3,
      migrate: (persisted: unknown) => {
        const state = persisted as { round?: ActiveRound | null };
        if (state?.round) {
          // Patch: courseHoles (v2 migration)
          if (!state.round.courseHoles) {
            state.round.courseHoles = state.round.course.holes.map((h) => ({ ...h }));
          }
          // Patch: nassauPresses (v3)
          if (!state.round.nassauPresses) {
            state.round.nassauPresses = [];
          }
          // Patch: gameplayFormat / matchupFormat (v3)
          if (!state.round.gameplayFormat) {
            state.round.gameplayFormat = state.round.game.gameplayFormat;
          }
          if (!state.round.matchupFormat) {
            state.round.matchupFormat = state.round.game.matchupFormat;
          }
          // Patch: BettingConfig shape (v3 renames baseBetAmount → amount, adds structure)
          const b = state.round.betting as unknown as Record<string, unknown>;
          if (b && !b.structure) {
            b.structure = "FullMatch";
            b.amount = (b.baseBetAmount as number | undefined) ?? 5;
            b.nassauAutoPressAt = 0;
          }
        }
        return state;
      },
    }
  )
);
