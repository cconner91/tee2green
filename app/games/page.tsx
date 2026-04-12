"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMatchStore } from "@/store/matchStore";
import { useGameLibraryStore } from "@/store/gameLibraryStore";
import { gameDefinitions } from "@/domain/gameConfig/definitions";
import { GolfGameDefinition, ScoringFormat, BettingMode } from "@/domain/gameConfig/types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatLabel(game: GolfGameDefinition): string {
  const fmt: string[] = [];
  if (game.scoringFormat === ScoringFormat.StrokePlay)  fmt.push("Stroke");
  if (game.scoringFormat === ScoringFormat.MatchPlay)   fmt.push("Match");
  if (game.scoringFormat === ScoringFormat.PointsBased) fmt.push("Stableford");
  if (game.bettingMode === BettingMode.Nassau) fmt.push("Nassau");
  if (game.bettingMode === BettingMode.Skins)  fmt.push("Skins");
  return fmt.join(" · ");
}

function playerRange(game: GolfGameDefinition): string {
  if (game.minPlayers === game.maxPlayers) return `${game.minPlayers} players`;
  return `${game.minPlayers}–${game.maxPlayers} players`;
}

// ─── Game card ────────────────────────────────────────────────────────────────

function GameCard({
  game,
  onPlay,
  onDelete,
  isCustom = false,
}: {
  game: GolfGameDefinition;
  onPlay: (game: GolfGameDefinition) => void;
  onDelete?: () => void;
  isCustom?: boolean;
}) {
  return (
    <div className="bg-[#111] border border-white/[0.07] rounded-xl p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="font-semibold text-white">{game.name}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">{formatLabel(game)}</div>
        </div>
        <div className="text-[11px] text-slate-500 shrink-0 mt-0.5">
          {playerRange(game)}
        </div>
      </div>

      <p className="text-slate-400 text-xs leading-relaxed">{game.description}</p>

      <div className="flex flex-wrap gap-1.5">
        {game.tags.map((tag) => (
          <span
            key={tag}
            className="text-[10px] uppercase tracking-wide bg-white/[0.06] text-slate-400 px-2 py-0.5 rounded"
          >
            {tag}
          </span>
        ))}
        {isCustom && (
          <span className="text-[10px] uppercase tracking-wide bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded">
            Custom
          </span>
        )}
      </div>

      <div className="flex items-center gap-2 pt-1">
        <button
          onClick={() => onPlay(game)}
          className="flex-1 py-2 bg-emerald-500 text-black font-semibold text-sm rounded-lg hover:bg-emerald-400 active:scale-[0.98] transition"
        >
          Play This Game
        </button>
        {isCustom && onDelete && (
          <button
            onClick={onDelete}
            className="px-3 py-2 text-slate-500 hover:text-red-400 text-sm transition"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Special format notice ─────────────────────────────────────────────────────

function SpecialFormatsCard() {
  return (
    <div className="bg-[#111] border border-white/[0.07] rounded-xl p-4 space-y-2 opacity-60">
      <div className="flex items-center justify-between">
        <div className="font-semibold text-white">Wolf, Vegas &amp; More</div>
        <span className="text-[10px] uppercase tracking-wide bg-white/[0.06] text-slate-400 px-2 py-0.5 rounded">
          Coming Soon
        </span>
      </div>
      <p className="text-slate-400 text-xs leading-relaxed">
        Games like Wolf and Vegas require per-hole role assignment and custom
        score-combination rules that go beyond the standard format axes. These
        are on the roadmap as dedicated game engines.
      </p>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function GamesPage() {
  const router = useRouter();
  const { initSetup, selectGame, setSetupStep } = useMatchStore();
  const { customGames, removeCustomGame } = useGameLibraryStore();
  const [mounted, setMounted] = useState(false);
  const [playerFilter, setPlayerFilter] = useState<number | null>(null);

  useEffect(() => { setMounted(true); }, []);

  function handlePlay(game: GolfGameDefinition) {
    initSetup(Math.max(game.minPlayers, 2));
    selectGame(game);
    setSetupStep(2); // skip group size since we have a game pre-selected
    router.push("/setup");
  }

  const allGames = [...gameDefinitions, ...(mounted ? customGames : [])];
  const filtered = playerFilter
    ? allGames.filter(
        (g) => playerFilter >= g.minPlayers && playerFilter <= g.maxPlayers
      )
    : allGames;

  const standard = filtered.filter((g) => !customGames.some((c) => c.id === g.id));
  const custom   = filtered.filter((g) =>  customGames.some((c) => c.id === g.id));

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 max-w-md mx-auto px-4 py-8 space-y-8">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Game Library</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {allGames.length} games available
          </p>
        </div>
        <Link
          href="/games/build"
          className="flex items-center gap-1.5 bg-emerald-500 text-black font-semibold text-sm px-4 py-2 rounded-lg hover:bg-emerald-400 active:scale-[0.98] transition"
        >
          + Build Game
        </Link>
      </div>

      {/* Player count filter */}
      <div>
        <div className="text-[10px] uppercase tracking-widest text-slate-500 mb-2">
          Filter by players
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setPlayerFilter(null)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
              playerFilter === null
                ? "bg-white text-black"
                : "bg-white/[0.06] text-slate-400 hover:text-white"
            }`}
          >
            All
          </button>
          {[2, 3, 4, 5, 6].map((n) => (
            <button
              key={n}
              onClick={() => setPlayerFilter(playerFilter === n ? null : n)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                playerFilter === n
                  ? "bg-white text-black"
                  : "bg-white/[0.06] text-slate-400 hover:text-white"
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      {/* Standard games */}
      <div className="space-y-3">
        <div className="text-[10px] uppercase tracking-widest text-slate-500">
          Official Games
        </div>
        {standard.map((game) => (
          <GameCard
            key={game.id}
            game={game}
            onPlay={handlePlay}
          />
        ))}
        <SpecialFormatsCard />
      </div>

      {/* Custom games */}
      {mounted && custom.length > 0 && (
        <div className="space-y-3">
          <div className="text-[10px] uppercase tracking-widest text-slate-500">
            Your Games
          </div>
          {custom.map((game) => (
            <GameCard
              key={game.id}
              game={game}
              onPlay={handlePlay}
              onDelete={() => removeCustomGame(game.id)}
              isCustom
            />
          ))}
        </div>
      )}

      {filtered.length === 0 && (
        <div className="text-center py-12 text-slate-500 text-sm">
          No games available for {playerFilter} players.
        </div>
      )}

    </div>
  );
}
