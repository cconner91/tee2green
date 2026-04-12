"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { GolfGameDefinition } from "@/domain/gameConfig/types";

interface GameLibraryStore {
  customGames: GolfGameDefinition[];
  addCustomGame: (game: GolfGameDefinition) => void;
  removeCustomGame: (id: string) => void;
}

export const useGameLibraryStore = create<GameLibraryStore>()(
  persist(
    (set) => ({
      customGames: [],

      addCustomGame: (game) =>
        set((state) => ({ customGames: [...state.customGames, game] })),

      removeCustomGame: (id) =>
        set((state) => ({
          customGames: state.customGames.filter((g) => g.id !== id),
        })),
    }),
    {
      name: "tee2green-game-library",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
