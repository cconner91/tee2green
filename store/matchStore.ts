"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

import { GolfGameDefinition } from "@/domain/gameConfig/types";
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

export interface BettingConfig {
  enabled: boolean;
  /** Base bet per match / per Nassau segment */
  baseBetAmount: number;
  /** Value per skin (Skins game only) */
  skinValue: number;
}

export interface SetupState {
  step: 1 | 2 | 3 | 4 | 5;
  playerCount: number;
  players: PlayerDraft[];
  enableHandicaps: boolean;
  selectedCourse: APICourse | null;
  selectedTee: APITee | null;
  selectedGame: GolfGameDefinition | null;
  betting: BettingConfig;
}

// ─── Round types ──────────────────────────────────────────────────────────────

export interface ActiveRound {
  players: Player[];
  game: GolfGameDefinition;
  course: Course;
  /**
   * Mutable copy of course holes. Par can be edited per-hole during a round
   * since we don't have a full course DB — users can correct any hole on the fly.
   */
  courseHoles: Hole[];
  playingHandicaps: Record<PlayerId, number>;
  currentHole: number; // 1-18
  holeResults: HoleResult[];
  isComplete: boolean;
  enableHandicaps: boolean;
  betting: BettingConfig;
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
  selectGame: (game: GolfGameDefinition) => void;
  updateBetting: (partial: Partial<BettingConfig>) => void;
  clearSetup: () => void;

  // Round actions
  startRound: () => void;
  setHolePar: (holeNumber: number, par: number) => void;
  submitHole: (grossScores: Record<PlayerId, number>) => void;
  undoLastHole: () => void;
  abandonRound: () => void;
}

// ─── Defaults ─────────────────────────────────────────────────────────────────

const defaultBetting: BettingConfig = {
  enabled: false,
  baseBetAmount: 5,
  skinValue: 2,
};

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
            selectedGame: null,
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
        set({ setup: { ...setup, selectedCourse: null, selectedTee: null } });
      },

      selectGame: (game) => {
        const { setup } = get();
        if (!setup) return;
        set({ setup: { ...setup, selectedGame: game } });
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
            : mockCourse;
        // Deep copy holes so par edits during the round don't mutate the source
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
            betting: { ...setup.betting },
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

      submitHole: (grossScores) => {
        const { round } = get();
        if (!round || round.isComplete) return;

        // Use the mutable courseHoles so any par edit is reflected
        const holeData = round.courseHoles[round.currentHole - 1];
        const result = evaluateHole(holeData, grossScores, round.playingHandicaps);

        const newResults = [...round.holeResults, result];
        const nextHole = round.currentHole + 1;
        const isComplete = nextHole > round.courseHoles.length;

        set({
          round: {
            ...round,
            holeResults: newResults,
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

        set({
          round: {
            ...round,
            holeResults: newResults,
            currentHole: Math.max(1, prevHole),
            isComplete: false,
          },
        });
      },

      abandonRound: () => set({ round: null }),
    }),
    {
      name: "tee2green-match-v2",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ round: state.round }),
      // v2: ActiveRound gained courseHoles — old persisted state is incompatible
      migrate: (persisted: unknown) => {
        const state = persisted as { round?: ActiveRound | null };
        if (state?.round && !state.round.courseHoles) {
          // Patch missing field from the static course data
          state.round.courseHoles = state.round.course.holes.map((h) => ({ ...h }));
        }
        return state;
      },
      version: 2,
    }
  )
);
