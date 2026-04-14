"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMatchStore } from "@/store/matchStore";
import { useGameLibraryStore } from "@/store/gameLibraryStore";
import { gameDefinitions } from "@/domain/gameConfig/definitions";
import { gameLibrary, GameLibraryEntry } from "@/data/gameLibrary";
import { GolfGameDefinition } from "@/domain/gameConfig/types";

// ─── Filter config ────────────────────────────────────────────────────────────

const PLAYER_OPTIONS = [2, 3, 4, 5, 6];
const SCORING_OPTIONS = ["Stroke Play", "Match Play", "Points-Based"];
const GAMEPLAY_OPTIONS = ["Individual", "Best Ball", "Scramble", "Shamble", "Alt Shot"];
const MATCHUP_OPTIONS = ["Solo", "H2H", "Team Play"];
const BETTING_OPTIONS = ["Flat Bet", "Nassau", "Skins", "Hole-by-Hole", "Custom"];

interface FilterState {
  players: number[];
  scoring: string[];
  gameplay: string[];
  matchup: string[];
  betting: string[];
  handicaps: boolean | null;
}

const emptyFilters: FilterState = {
  players: [],
  scoring: [],
  gameplay: [],
  matchup: [],
  betting: [],
  handicaps: null,
};

function toggleItem<T>(arr: T[], val: T): T[] {
  return arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val];
}

function activeCount(f: FilterState): number {
  return (
    f.players.length + f.scoring.length + f.gameplay.length +
    f.matchup.length + f.betting.length + (f.handicaps !== null ? 1 : 0)
  );
}

function matchesFilters(game: GameLibraryEntry, search: string, f: FilterState): boolean {
  const q = search.toLowerCase();
  if (q && !game.name.toLowerCase().includes(q) && !game.overview.toLowerCase().includes(q)) {
    return false;
  }
  if (f.players.length > 0 && !f.players.some((n) => n >= game.minPlayers && n <= game.maxPlayers)) return false;
  if (f.scoring.length > 0 && !f.scoring.some((s) => game.scoringFormats.includes(s))) return false;
  if (f.gameplay.length > 0 && !f.gameplay.some((g) => game.gameplayFormats.includes(g))) return false;
  if (f.matchup.length > 0 && !f.matchup.some((m) => game.matchupFormats.includes(m))) return false;
  if (f.betting.length > 0 && !f.betting.some((b) => game.bettingFormats.includes(b))) return false;
  if (f.handicaps !== null && game.handicapsAllowed !== f.handicaps) return false;
  return true;
}

// ─── Chip ─────────────────────────────────────────────────────────────────────

function Chip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap ${
        active
          ? "bg-emerald-500 text-black"
          : "bg-white/[0.06] text-slate-400 hover:text-white"
      }`}
    >
      {label}
    </button>
  );
}

// ─── Filter panel ─────────────────────────────────────────────────────────────

function FilterPanel({
  filters,
  onChange,
  onClear,
}: {
  filters: FilterState;
  onChange: (next: FilterState) => void;
  onClear: () => void;
}) {
  const row = (label: string, children: React.ReactNode) => (
    <div className="space-y-1.5">
      <div className="text-[9px] uppercase tracking-widest text-slate-600 font-semibold">{label}</div>
      <div className="flex gap-1.5 overflow-x-auto pb-0.5">{children}</div>
    </div>
  );

  return (
    <div className="bg-white/[0.03] border border-white/[0.07] rounded-xl p-4 space-y-4">
      {row(
        "Players",
        PLAYER_OPTIONS.map((n) => (
          <Chip key={n} label={String(n)} active={filters.players.includes(n)}
            onClick={() => onChange({ ...filters, players: toggleItem(filters.players, n) })} />
        )),
      )}
      {row(
        "Scoring",
        SCORING_OPTIONS.map((s) => (
          <Chip key={s} label={s} active={filters.scoring.includes(s)}
            onClick={() => onChange({ ...filters, scoring: toggleItem(filters.scoring, s) })} />
        )),
      )}
      {row(
        "Gameplay",
        GAMEPLAY_OPTIONS.map((g) => (
          <Chip key={g} label={g} active={filters.gameplay.includes(g)}
            onClick={() => onChange({ ...filters, gameplay: toggleItem(filters.gameplay, g) })} />
        )),
      )}
      {row(
        "Matchup",
        MATCHUP_OPTIONS.map((m) => (
          <Chip key={m} label={m} active={filters.matchup.includes(m)}
            onClick={() => onChange({ ...filters, matchup: toggleItem(filters.matchup, m) })} />
        )),
      )}
      {row(
        "Betting",
        BETTING_OPTIONS.map((b) => (
          <Chip key={b} label={b} active={filters.betting.includes(b)}
            onClick={() => onChange({ ...filters, betting: toggleItem(filters.betting, b) })} />
        )),
      )}
      {row(
        "Handicaps",
        <>
          <Chip label="Yes" active={filters.handicaps === true}
            onClick={() => onChange({ ...filters, handicaps: filters.handicaps === true ? null : true })} />
          <Chip label="No" active={filters.handicaps === false}
            onClick={() => onChange({ ...filters, handicaps: filters.handicaps === false ? null : false })} />
        </>,
      )}
      <button
        onClick={onClear}
        className="text-xs text-slate-500 hover:text-slate-300 transition"
      >
        Clear all filters
      </button>
    </div>
  );
}

// ─── Game card ────────────────────────────────────────────────────────────────

function GameCard({
  entry,
  engineDef,
  onPlay,
  onDelete,
  isCustom = false,
}: {
  entry: GameLibraryEntry;
  engineDef?: GolfGameDefinition;
  onPlay?: (game: GolfGameDefinition) => void;
  onDelete?: () => void;
  isCustom?: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const isStub = entry.engineStatus === "stub";
  const canPlay = !isStub && !!engineDef && !!onPlay;

  return (
    <div className={`bg-[#111] border border-white/[0.07] rounded-xl overflow-hidden ${isStub ? "opacity-70" : ""}`}>
      {/* Header — always visible, tappable to expand */}
      <button className="w-full text-left p-4 space-y-2.5" onClick={() => setExpanded((e) => !e)}>
        <div className="flex items-start gap-2">
          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-white text-sm leading-tight">{entry.name}</span>
              {isStub && (
                <span className="text-[9px] uppercase tracking-wide bg-white/[0.06] text-slate-500 px-1.5 py-0.5 rounded">
                  Coming Soon
                </span>
              )}
              {isCustom && (
                <span className="text-[9px] uppercase tracking-wide bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded">
                  Custom
                </span>
              )}
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">{entry.overview}</p>
          </div>
          <div className="flex flex-col items-end gap-1 shrink-0 pl-1">
            <span className="text-[10px] text-slate-600 whitespace-nowrap">
              {entry.minPlayers === entry.maxPlayers
                ? `${entry.minPlayers}p`
                : `${entry.minPlayers}–${entry.maxPlayers}p`}
            </span>
            <svg
              className={`w-3.5 h-3.5 text-slate-600 transition-transform ${expanded ? "rotate-180" : ""}`}
              viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1">
          {entry.tags.map((tag) => (
            <span key={tag} className="text-[9px] uppercase tracking-wide bg-white/[0.05] text-slate-500 px-1.5 py-0.5 rounded">
              {tag}
            </span>
          ))}
          {entry.handicapsAllowed && (
            <span className="text-[9px] uppercase tracking-wide bg-emerald-500/10 text-emerald-500/70 px-1.5 py-0.5 rounded">
              Handicaps
            </span>
          )}
        </div>
      </button>

      {/* Expanded section */}
      {expanded && (
        <div className="border-t border-white/[0.05] px-4 pt-3 pb-4 space-y-4">

          {/* How it works */}
          {entry.howItWorks.length > 0 && entry.howItWorks[0] !== "Details coming soon." && (
            <div className="space-y-2">
              <div className="text-[9px] uppercase tracking-widest text-slate-600 font-semibold">How It Works</div>
              <ul className="space-y-1.5">
                {entry.howItWorks.map((step, i) => (
                  <li key={i} className="flex gap-2 text-xs text-slate-400 leading-relaxed">
                    <span className="text-emerald-500/60 shrink-0 mt-0.5">•</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Format grid */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-[11px]">
            {entry.typicalPlayers && (
              <div>
                <div className="text-[9px] uppercase tracking-wide text-slate-600 mb-0.5">Typically Played</div>
                <div className="text-slate-400">{entry.typicalPlayers}</div>
              </div>
            )}
            {entry.scoringFormats.length > 0 && (
              <div>
                <div className="text-[9px] uppercase tracking-wide text-slate-600 mb-0.5">Scoring</div>
                <div className="text-slate-400">{entry.scoringFormats.join(", ")}</div>
              </div>
            )}
            {entry.gameplayFormats.length > 0 && (
              <div>
                <div className="text-[9px] uppercase tracking-wide text-slate-600 mb-0.5">Gameplay</div>
                <div className="text-slate-400">{entry.gameplayFormats.join(", ")}</div>
              </div>
            )}
            {entry.matchupFormats.length > 0 && (
              <div>
                <div className="text-[9px] uppercase tracking-wide text-slate-600 mb-0.5">Matchup</div>
                <div className="text-slate-400">{entry.matchupFormats.join(", ")}</div>
              </div>
            )}
            {entry.bettingFormats.length > 0 && (
              <div>
                <div className="text-[9px] uppercase tracking-wide text-slate-600 mb-0.5">Betting</div>
                <div className="text-slate-400">{entry.bettingFormats.join(", ")}</div>
              </div>
            )}
          </div>

          {/* Action */}
          {canPlay && (
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => onPlay!(engineDef!)}
                className="flex-1 py-2.5 bg-emerald-500 text-black font-semibold text-sm rounded-lg hover:bg-emerald-400 active:scale-[0.98] transition"
              >
                Play This Game
              </button>
              {isCustom && onDelete && (
                <button onClick={onDelete} className="px-3 py-2.5 text-slate-500 hover:text-red-400 text-sm transition">
                  Delete
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function GamesPage() {
  const router = useRouter();
  const { initSetup, selectGame, setSetupStep } = useMatchStore();
  const { customGames, removeCustomGame } = useGameLibraryStore();
  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>(emptyFilters);

  useEffect(() => { setMounted(true); }, []);

  function handlePlay(game: GolfGameDefinition) {
    initSetup(Math.max(game.minPlayers, 2));
    selectGame(game);
    setSetupStep(2);
    router.push("/setup");
  }

  const numActiveFilters = activeCount(filters);

  // Library entries filtered
  const filtered = gameLibrary.filter((g) => matchesFilters(g, search, filters));
  const playable   = filtered.filter((g) => g.engineStatus !== "stub");
  const comingSoon = filtered.filter((g) => g.engineStatus === "stub");

  // Custom games: search + player count only
  const filteredCustom = mounted
    ? customGames.filter((g) => {
        const q = search.toLowerCase();
        if (q && !g.name.toLowerCase().includes(q) && !g.description.toLowerCase().includes(q)) return false;
        if (filters.players.length > 0 && !filters.players.some((n) => n >= g.minPlayers && n <= g.maxPlayers)) return false;
        return true;
      })
    : [];

  const totalPlayable = gameLibrary.filter((g) => g.engineStatus !== "stub").length + (mounted ? customGames.length : 0);
  const totalComingSoon = gameLibrary.filter((g) => g.engineStatus === "stub").length;
  const noResults = playable.length === 0 && filteredCustom.length === 0 && comingSoon.length === 0;

  return (
    <div className="min-h-dvh text-slate-100 max-w-md mx-auto px-4 py-6 space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Game Library</h1>
          <p className="text-slate-500 text-xs mt-0.5">
            {totalPlayable} playable · {totalComingSoon} coming soon
          </p>
        </div>
        <Link
          href="/games/build"
          className="flex items-center gap-1.5 bg-emerald-500 text-black font-semibold text-sm px-4 py-2 rounded-lg hover:bg-emerald-400 active:scale-[0.98] transition"
        >
          + Build Custom Game
        </Link>
      </div>

      {/* Search + filter toggle */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Search games..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/[0.06] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/40 transition"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-lg leading-none"
            >
              ×
            </button>
          )}
        </div>
        <button
          onClick={() => setShowFilters((v) => !v)}
          className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-sm font-semibold border transition whitespace-nowrap ${
            showFilters || numActiveFilters > 0
              ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
              : "bg-white/[0.06] text-slate-400 border-white/[0.08]"
          }`}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <line x1="4" y1="6" x2="20" y2="6" />
            <line x1="8" y1="12" x2="16" y2="12" />
            <line x1="11" y1="18" x2="13" y2="18" />
          </svg>
          {numActiveFilters > 0 ? `Filters (${numActiveFilters})` : "Filters"}
        </button>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <FilterPanel
          filters={filters}
          onChange={setFilters}
          onClear={() => setFilters(emptyFilters)}
        />
      )}

      {/* Playable games */}
      {playable.length > 0 && (
        <div className="space-y-3">
          <div className="text-[10px] uppercase tracking-widest text-slate-500">Playable Now</div>
          {playable.map((entry) => {
            const engineDef = gameDefinitions.find((d) => d.id === entry.id);
            return (
              <GameCard
                key={entry.id}
                entry={entry}
                engineDef={engineDef}
                onPlay={handlePlay}
              />
            );
          })}
        </div>
      )}

      {/* Custom games */}
      {filteredCustom.length > 0 && (
        <div className="space-y-3">
          <div className="text-[10px] uppercase tracking-widest text-slate-500">Your Games</div>
          {filteredCustom.map((game) => {
            const entry: GameLibraryEntry = {
              id: game.id,
              name: game.name,
              overview: game.description,
              howItWorks: [],
              minPlayers: game.minPlayers,
              maxPlayers: game.maxPlayers,
              typicalPlayers:
                game.minPlayers === game.maxPlayers
                  ? `${game.minPlayers} players`
                  : `${game.minPlayers}–${game.maxPlayers} players`,
              scoringFormats: [],
              gameplayFormats: [],
              matchupFormats: [],
              bettingFormats: [],
              handicapsAllowed: game.handicapEnabled,
              engineStatus: "ready",
              tags: game.tags,
            };
            return (
              <GameCard
                key={game.id}
                entry={entry}
                engineDef={game}
                onPlay={handlePlay}
                onDelete={() => removeCustomGame(game.id)}
                isCustom
              />
            );
          })}
        </div>
      )}

      {/* Coming soon */}
      {comingSoon.length > 0 && (
        <div className="space-y-3">
          <div className="text-[10px] uppercase tracking-widest text-slate-500">Coming Soon</div>
          {comingSoon.map((entry) => (
            <GameCard key={entry.id} entry={entry} />
          ))}
        </div>
      )}

      {/* Empty state */}
      {noResults && (
        <div className="text-center py-16 space-y-2">
          <div className="text-3xl">🔍</div>
          <div className="text-slate-500 text-sm">No games match your filters.</div>
          <button
            onClick={() => { setSearch(""); setFilters(emptyFilters); }}
            className="text-emerald-400 hover:text-emerald-300 transition text-xs"
          >
            Clear search &amp; filters
          </button>
        </div>
      )}

    </div>
  );
}
