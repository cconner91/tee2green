"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useMatchStore, SetupState, ManualCourseDetails } from "@/store/matchStore";
import { useGameLibraryStore } from "@/store/gameLibraryStore";
import {
  GolfGameDefinition,
  BettingMode,
  BettingStructure,
} from "@/domain/gameConfig/types";
import { gameDefinitions } from "@/domain/gameConfig/definitions";
import {
  getGamesForPlayerCount,
  getFormatsForPlayerCount,
} from "@/domain/gameConfig/filters";
import { APICourse, APITee, getTeeName } from "@/domain/course/types";
import { searchCourses, getCourseById } from "@/domain/course/CourseService";

// ─── Shared helpers ───────────────────────────────────────────────────────────

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className={`relative w-12 h-6 rounded-full transition-colors shrink-0 ${
        on ? "bg-emerald-500" : "bg-white/10"
      }`}
    >
      <span
        className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${
          on ? "left-6" : "left-0.5"
        }`}
      />
    </button>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[10px] uppercase tracking-widest text-slate-500 mb-2">
      {children}
    </div>
  );
}

/** Dollar amount input that always shows the $ prefix and handles empty state cleanly. */
function AmountInput({
  value,
  onChange,
}: {
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <div className="flex items-center bg-white/[0.04] border border-white/[0.08] rounded-xl overflow-hidden focus-within:border-emerald-500/50 transition">
      <span className="text-slate-400 text-sm font-semibold pl-4 pr-1 select-none">$</span>
      <input
        type="text"
        inputMode="numeric"
        value={value === 0 ? "" : String(value)}
        onChange={(e) => {
          const raw = e.target.value.replace(/\D/g, "");
          onChange(raw === "" ? 0 : Math.max(0, parseInt(raw, 10)));
        }}
        placeholder="0"
        className="flex-1 bg-transparent py-3.5 pr-4 text-white font-bold focus:outline-none text-base placeholder-slate-600"
      />
    </div>
  );
}

// ─── Step 1: Group size ───────────────────────────────────────────────────────

function StepGroupSize() {
  const { setup, initSetup, setSetupStep } = useMatchStore();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">How many players?</h2>
        <p className="text-slate-500 text-sm mt-1.5">
          Available games adjust automatically.
        </p>
      </div>
      <div className="grid grid-cols-4 gap-2.5">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
          <button
            key={n}
            onClick={() => {
              initSetup(n);
              setSetupStep(2); // auto-advance
            }}
            className={`py-5 rounded-2xl text-2xl font-black transition active:scale-95 ${
              setup?.playerCount === n
                ? "bg-emerald-500 text-black shadow-[0_0_20px_rgba(16,185,129,0.4)]"
                : "bg-white/[0.05] text-slate-300 hover:bg-white/[0.09] border border-white/[0.07]"
            }`}
          >
            {n}
          </button>
        ))}
      </div>
      {setup?.playerCount === 1 && (
        <p className="text-slate-500 text-xs text-center">
          Solo round — track your score vs par. Betting not available.
        </p>
      )}
    </div>
  );
}

// ─── Step 2: Players ─────────────────────────────────────────────────────────

function StepPlayers() {
  const { setup, updatePlayers, setEnableHandicaps } = useMatchStore();
  if (!setup) return null;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Who&apos;s playing?</h2>
        <p className="text-slate-500 text-sm mt-1.5">Enter names for the scorecard.</p>
      </div>

      {setup.playerCount > 1 && (
        <div className="flex items-center justify-between bg-white/[0.04] border border-white/[0.07] rounded-2xl px-4 py-3.5">
          <div>
            <div className="text-sm font-semibold">Use Handicaps</div>
            <div className="text-slate-500 text-xs mt-0.5">Net scores for fair competition</div>
          </div>
          <Toggle on={setup.enableHandicaps} onToggle={() => setEnableHandicaps(!setup.enableHandicaps)} />
        </div>
      )}

      <div className="space-y-2.5">
        {setup.players.map((player, i) => {
          const isEmpty = !player.name.trim();
          return (
            <div key={i} className="bg-white/[0.04] border border-white/[0.07] rounded-2xl p-4 space-y-3">
              <div className="text-emerald-500 text-[10px] uppercase tracking-widest font-bold">
                Player {i + 1}
              </div>
              <input
                value={player.name}
                onChange={(e) => {
                  const updated = [...setup.players];
                  updated[i] = { ...updated[i], name: e.target.value };
                  updatePlayers(updated);
                }}
                placeholder={`Player ${i + 1} name`}
                className={`w-full bg-white/[0.05] border rounded-xl px-3.5 py-3 text-white placeholder-slate-700 focus:outline-none text-sm transition ${
                  isEmpty
                    ? "border-white/[0.07] focus:border-emerald-500/40"
                    : "border-emerald-500/20"
                }`}
              />
              {setup.enableHandicaps && (
                <input
                  type="number"
                  value={player.handicapIndex || ""}
                  onChange={(e) => {
                    const updated = [...setup.players];
                    updated[i] = { ...updated[i], handicapIndex: parseFloat(e.target.value) || 0 };
                    updatePlayers(updated);
                  }}
                  placeholder="Handicap index (e.g. 14.2)"
                  className="w-full bg-white/[0.05] border border-white/[0.07] rounded-xl px-3.5 py-3 text-white placeholder-slate-700 focus:outline-none focus:border-emerald-500/40 text-sm transition"
                  min={0}
                  max={54}
                  step={0.1}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Step 3: Course selection ─────────────────────────────────────────────────

const DEFAULT_MANUAL: ManualCourseDetails = {
  name: "",
  par: 72,
  courseRating: 72.0,
  slopeRating: 113,
};

function StepCourse() {
  const { setup, selectCourse, clearCourse, setSetupStep, setManualCourse } = useMatchStore();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<APICourse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [showManual, setShowManual] = useState(false);
  const [manualFields, setManualFields] = useState<ManualCourseDetails>(
    setup?.manualCourse ?? DEFAULT_MANUAL
  );
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  if (!setup) return null;

  function handleQueryChange(val: string) {
    setQuery(val);
    setError(null);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!val.trim()) { setResults([]); return; }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const searchResults = await searchCourses(val);
        const detailed = await Promise.all(
          searchResults.slice(0, 5).map((r) => getCourseById(r.id))
        );
        setResults(detailed);
      } catch {
        setError("Search failed. Check your connection and try again.");
      } finally {
        setLoading(false);
      }
    }, 500);
  }

  function handleSelectTee(course: APICourse, tee: APITee) {
    selectCourse(course, tee);
    setManualCourse(null);
    setResults([]);
    setQuery("");
    setExpanded(null);
    setTimeout(() => setSetupStep(4), 350);
  }

  function handleManualField(field: keyof ManualCourseDetails, value: string | number) {
    const updated = { ...manualFields, [field]: value };
    setManualFields(updated);
    // Only save to store if any meaningful value is set
    const hasData = updated.courseRating !== 72.0 || updated.slopeRating !== 113 || updated.name.trim();
    setManualCourse(hasData ? updated : null);
  }

  function toggleManual(show: boolean) {
    setShowManual(show);
    if (!show) {
      setManualFields(DEFAULT_MANUAL);
      setManualCourse(null);
    }
  }

  const selected = setup.selectedCourse;
  const selectedTee = setup.selectedTee;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Select a course</h2>
        <p className="text-slate-500 text-sm mt-1.5">
          Search for your course, enter details manually, or skip.
        </p>
      </div>

      {/* Selected course confirmation */}
      {selected && selectedTee && (
        <div className="bg-emerald-500/[0.08] border border-emerald-500/25 rounded-2xl p-4 flex items-start justify-between gap-3">
          <div>
            <div className="font-bold text-sm text-white">{selected.name}</div>
            <div className="text-emerald-400 text-xs mt-1">
              {getTeeName(selectedTee)} · Par {selectedTee.parTotal} · {selectedTee.totalYards.toLocaleString()} yds
            </div>
            <div className="text-slate-500 text-xs mt-0.5">
              CR {selectedTee.courseRating} · Slope {selectedTee.slopeRating}
            </div>
          </div>
          <button
            onClick={() => clearCourse()}
            className="text-slate-500 hover:text-red-400 text-xs shrink-0 transition mt-0.5"
          >
            Change
          </button>
        </div>
      )}

      {/* Search */}
      {!selected && (
        <div className="space-y-3">
          <div className="relative">
            <input
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              placeholder="Search by course name…"
              className="w-full bg-white/[0.04] border border-white/[0.07] rounded-2xl px-4 py-3.5 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500/40 text-sm transition pr-10"
            />
            {loading && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                <div className="w-4 h-4 border-2 border-emerald-500/40 border-t-emerald-500 rounded-full animate-spin" />
              </div>
            )}
          </div>

          {error && <p className="text-red-400 text-xs px-1">{error}</p>}

          {results.length > 0 && (
            <div className="space-y-2">
              {results.map((course) => (
                <div
                  key={course.id}
                  className="bg-white/[0.04] border border-white/[0.07] rounded-2xl overflow-hidden"
                >
                  <button
                    onClick={() => setExpanded(expanded === course.id ? null : course.id)}
                    className="w-full px-4 py-3.5 text-left flex items-center justify-between gap-2"
                  >
                    <div>
                      <div className="font-semibold text-sm text-white">{course.name}</div>
                      <div className="text-slate-500 text-xs mt-0.5">
                        {course.location.city}, {course.location.state} · {course.tees.length} tee options
                      </div>
                    </div>
                    <svg
                      width="14" height="14" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                      className={`text-slate-600 shrink-0 transition-transform ${expanded === course.id ? "rotate-180" : ""}`}
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>
                  {expanded === course.id && (
                    <div className="border-t border-white/[0.05] px-4 py-2 space-y-0.5">
                      {course.tees.map((tee) => (
                        <button
                          key={getTeeName(tee)}
                          onClick={() => handleSelectTee(course, tee)}
                          className="w-full flex items-center justify-between py-3 hover:text-emerald-400 transition text-left group"
                        >
                          <div>
                            <span className="text-sm font-semibold group-hover:text-emerald-400 transition">
                              {getTeeName(tee)}
                            </span>
                            <span className="text-slate-600 text-xs ml-2">
                              {tee.totalYards.toLocaleString()} yds
                            </span>
                          </div>
                          <div className="text-slate-600 text-xs">
                            CR {tee.courseRating} · {tee.slopeRating}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {query && !loading && results.length === 0 && !error && (
            <p className="text-slate-600 text-xs text-center py-4">
              No courses found for &ldquo;{query}&rdquo;
            </p>
          )}

          {/* Manual entry section */}
          <div className="border border-white/[0.07] rounded-2xl overflow-hidden">
            <button
              onClick={() => toggleManual(!showManual)}
              className="w-full flex items-center justify-between px-4 py-3.5 text-left"
            >
              <div>
                <div className="text-sm font-semibold text-white">
                  {showManual ? "Manual Entry" : "Enter Course Details Manually"}
                </div>
                <div className="text-slate-600 text-xs mt-0.5">
                  {showManual
                    ? "CR & Slope used for handicap calculations"
                    : "Useful for local or unlisted courses"}
                </div>
              </div>
              <svg
                width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                className={`text-slate-600 shrink-0 transition-transform ${showManual ? "rotate-180" : ""}`}
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            {showManual && (
              <div className="border-t border-white/[0.05] px-4 py-4 space-y-3 bg-white/[0.02]">
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-slate-600 mb-1.5">Course Name (optional)</div>
                  <input
                    value={manualFields.name}
                    onChange={(e) => handleManualField("name", e.target.value)}
                    placeholder="e.g. Pebble Beach Golf Links"
                    className="w-full bg-white/[0.04] border border-white/[0.07] rounded-xl px-3.5 py-2.5 text-white placeholder-slate-700 focus:outline-none focus:border-emerald-500/40 text-sm transition"
                  />
                </div>
                <div className="grid grid-cols-3 gap-2.5">
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-slate-600 mb-1.5">Par</div>
                    <input
                      type="number"
                      value={manualFields.par}
                      onChange={(e) => handleManualField("par", parseInt(e.target.value) || 72)}
                      className="w-full bg-white/[0.04] border border-white/[0.07] rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-emerald-500/40 text-sm transition text-center"
                      min={54} max={90}
                    />
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-slate-600 mb-1.5">Course Rating</div>
                    <input
                      type="number"
                      value={manualFields.courseRating}
                      onChange={(e) => handleManualField("courseRating", parseFloat(e.target.value) || 72.0)}
                      className="w-full bg-white/[0.04] border border-white/[0.07] rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-emerald-500/40 text-sm transition text-center"
                      min={60} max={80} step={0.1}
                    />
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-slate-600 mb-1.5">Slope</div>
                    <input
                      type="number"
                      value={manualFields.slopeRating}
                      onChange={(e) => handleManualField("slopeRating", parseInt(e.target.value) || 113)}
                      className="w-full bg-white/[0.04] border border-white/[0.07] rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-emerald-500/40 text-sm transition text-center"
                      min={55} max={155}
                    />
                  </div>
                </div>
                <p className="text-slate-700 text-[10px]">
                  CR &amp; Slope drive handicap stroke allocation. Hole-by-hole pars use a standard Par 72 layout.
                </p>
              </div>
            )}
          </div>

          {/* Skip */}
          <div className="text-center">
            <button
              onClick={() => setSetupStep(4)}
              className="text-slate-500 text-xs hover:text-slate-300 transition"
            >
              Continue without a course →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Step 4: Game selection ───────────────────────────────────────────────────

function formatBadge(game: GolfGameDefinition): string {
  if (game.bettingMode === BettingMode.Nassau) return "Nassau";
  if (game.bettingMode === BettingMode.Skins)  return "Skins";
  return "";
}

function GameCard({
  game,
  selected,
  onClick,
}: {
  game: GolfGameDefinition;
  selected: boolean;
  onClick: () => void;
}) {
  const badge = formatBadge(game);

  return (
    <button
      onClick={onClick}
      className={`p-4 rounded-2xl text-left space-y-2 border transition active:scale-[0.97] ${
        selected
          ? "border-emerald-500/60 bg-emerald-500/[0.08] shadow-[0_0_16px_rgba(16,185,129,0.12)]"
          : "border-white/[0.07] bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/[0.12]"
      }`}
    >
      <div className="flex items-start justify-between gap-1">
        <div className="font-bold text-sm leading-snug">{game.name}</div>
        {badge && (
          <span className="text-[9px] uppercase tracking-wide bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded-md shrink-0 mt-0.5">
            {badge}
          </span>
        )}
      </div>
      <div className="text-slate-500 text-xs leading-relaxed">{game.description}</div>
      <div className="text-slate-600 text-[10px]">
        {game.minPlayers === game.maxPlayers
          ? `${game.minPlayers} players`
          : `${game.minPlayers}–${game.maxPlayers} players`}
      </div>
    </button>
  );
}

function StepGame() {
  const { setup, selectGame, selectFormat } = useMatchStore();
  const { customGames } = useGameLibraryStore();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  if (!setup) return null;

  const allGames = [
    ...gameDefinitions.filter((g) => g.engineStatus !== "stub"),
    ...(mounted ? customGames : []),
  ];
  const available = getGamesForPlayerCount(setup.playerCount, allGames);

  const validFormats = setup.selectedGame
    ? getFormatsForPlayerCount(setup.selectedGame, setup.playerCount)
    : [];

  // Auto-select when only 1 valid format
  useEffect(() => {
    if (setup.selectedGame && validFormats.length === 1 && !setup.selectedFormat) {
      selectFormat(validFormats[0]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setup.selectedGame?.id]);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Choose your game</h2>
        <p className="text-slate-500 text-sm mt-1.5">
          {available.length} game{available.length !== 1 ? "s" : ""} for {setup.playerCount} player{setup.playerCount !== 1 ? "s" : ""}
        </p>
      </div>

      {available.length === 0 ? (
        <div className="text-center py-10 text-slate-600 text-sm">
          No games for {setup.playerCount} players. Adjust your group size.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2.5">
          {available.map((game) => (
            <GameCard
              key={game.id}
              game={game}
              selected={setup.selectedGame?.id === game.id}
              onClick={() => selectGame(game)}
            />
          ))}
        </div>
      )}

      {/* Format picker */}
      {setup.selectedGame && validFormats.length > 1 && (
        <div className="space-y-2 pt-1">
          <SectionLabel>How are you playing?</SectionLabel>
          <div className="space-y-2">
            {validFormats.map((fmt) => (
              <button
                key={fmt.label}
                onClick={() => selectFormat(fmt)}
                className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl border text-left transition ${
                  setup.selectedFormat?.label === fmt.label
                    ? "border-emerald-500/60 bg-emerald-500/[0.08]"
                    : "border-white/[0.07] bg-white/[0.03] hover:bg-white/[0.06]"
                }`}
              >
                <span className="text-sm font-semibold">{fmt.label}</span>
                {setup.selectedFormat?.label === fmt.label && (
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="text-center pt-1">
        <a href="/games" className="text-slate-600 text-xs hover:text-emerald-400 transition">
          Browse full game library →
        </a>
      </div>
    </div>
  );
}

// ─── Step 5: Betting ──────────────────────────────────────────────────────────

const BETTING_STRUCTURES: Array<{
  id: BettingStructure;
  label: string;
  description: string;
}> = [
  {
    id: "FullMatch",
    label: "Full Match",
    description: "One bet — winner at end collects from each opponent.",
  },
  {
    id: "HoleByHole",
    label: "Hole by Hole",
    description: "Win each hole, collect from every opponent.",
  },
  {
    id: "Nassau",
    label: "Nassau",
    description: "Three bets: front 9, back 9, and overall.",
  },
];

function StepBetting() {
  const { setup, updateBetting } = useMatchStore();
  if (!setup) return null;

  const { betting, selectedGame, playerCount } = setup;
  const isSkins    = selectedGame?.bettingMode === BettingMode.Skins;
  const isNassauGame = selectedGame?.bettingMode === BettingMode.Nassau;
  const isSolo     = playerCount === 1;

  useEffect(() => {
    if (isNassauGame && betting.structure !== "Nassau") {
      updateBetting({ structure: "Nassau" });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isNassauGame]);

  const amountLabel =
    betting.structure === "HoleByHole" ? "Per Hole" :
    betting.structure === "Nassau"     ? "Per Segment" :
    "Match Bet";

  const amountDescription =
    betting.structure === "HoleByHole"
      ? "Winner of each hole collects from every opponent."
      : betting.structure === "Nassau"
      ? "Front 9, Back 9, and Overall are each worth this."
      : "Winner at end of round collects from each opponent.";

  if (isSolo) {
    return (
      <div className="space-y-5">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Betting</h2>
          <p className="text-slate-500 text-sm mt-1.5">Not available for solo rounds.</p>
        </div>
        <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl px-4 py-8 text-center text-slate-600 text-sm">
          Solo rounds don&apos;t support betting.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Betting</h2>
        <p className="text-slate-500 text-sm mt-1.5">Optional — set stakes for the round.</p>
      </div>

      {/* Enable toggle */}
      <div className="flex items-center justify-between bg-white/[0.04] border border-white/[0.07] rounded-2xl px-4 py-3.5">
        <div>
          <div className="text-sm font-semibold">Enable Betting</div>
          <div className="text-slate-500 text-xs mt-0.5">Track winnings in real time</div>
        </div>
        <Toggle on={betting.enabled} onToggle={() => updateBetting({ enabled: !betting.enabled })} />
      </div>

      {betting.enabled && (
        <div className="space-y-4">
          {/* Structure picker */}
          {!isSkins && !isNassauGame && (
            <div className="space-y-2">
              <SectionLabel>Betting Structure</SectionLabel>
              {BETTING_STRUCTURES.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => updateBetting({ structure: opt.id })}
                  className={`w-full flex items-start gap-3 px-4 py-3.5 rounded-2xl border text-left transition ${
                    betting.structure === opt.id
                      ? "border-emerald-500/60 bg-emerald-500/[0.08]"
                      : "border-white/[0.07] bg-white/[0.03] hover:bg-white/[0.06]"
                  }`}
                >
                  <div
                    className={`mt-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition ${
                      betting.structure === opt.id ? "border-emerald-500" : "border-slate-600"
                    }`}
                  >
                    {betting.structure === opt.id && (
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    )}
                  </div>
                  <div>
                    <div className="text-sm font-semibold">{opt.label}</div>
                    <div className="text-slate-500 text-xs mt-0.5">{opt.description}</div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Skin value */}
          {isSkins && (
            <div className="bg-white/[0.04] border border-white/[0.07] rounded-2xl p-4 space-y-3">
              <SectionLabel>Value Per Skin</SectionLabel>
              <p className="text-slate-500 text-xs">Each skin carries over on ties.</p>
              <AmountInput value={betting.skinValue} onChange={(n) => updateBetting({ skinValue: n })} />
            </div>
          )}

          {/* Amount input */}
          {!isSkins && (
            <div className="bg-white/[0.04] border border-white/[0.07] rounded-2xl p-4 space-y-3">
              <SectionLabel>{amountLabel}</SectionLabel>
              <p className="text-slate-500 text-xs">{amountDescription}</p>
              <AmountInput value={betting.amount} onChange={(n) => updateBetting({ amount: n })} />
              {betting.structure === "Nassau" && betting.amount > 0 && (
                <div className="text-slate-600 text-xs pt-1">
                  Max exposure: ${betting.amount * 3} per player
                </div>
              )}
            </div>
          )}

          {/* Nassau options */}
          {(betting.structure === "Nassau" || isNassauGame) && (
            <div className="bg-white/[0.04] border border-white/[0.07] rounded-2xl p-4 space-y-4">
              <SectionLabel>Nassau Options</SectionLabel>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold">Auto-Press</div>
                  <div className="text-slate-500 text-xs mt-0.5">
                    Auto press when {betting.nassauAutoPressAt || 2} down
                  </div>
                </div>
                <Toggle
                  on={betting.nassauAutoPressAt > 0}
                  onToggle={() => updateBetting({ nassauAutoPressAt: betting.nassauAutoPressAt > 0 ? 0 : 2 })}
                />
              </div>
              {betting.nassauAutoPressAt > 0 && (
                <div className="space-y-2">
                  <div className="text-slate-600 text-[10px] uppercase tracking-widest">Press when down by</div>
                  <div className="flex gap-2">
                    {[1, 2, 3].map((n) => (
                      <button
                        key={n}
                        onClick={() => updateBetting({ nassauAutoPressAt: n })}
                        className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition ${
                          betting.nassauAutoPressAt === n
                            ? "bg-emerald-500 text-black"
                            : "bg-white/[0.05] text-slate-400 hover:bg-white/10"
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <p className="text-slate-600 text-xs border-t border-white/[0.07] pt-3">
                Manual presses can be called anytime during the round.
              </p>
            </div>
          )}

          {/* Summary */}
          {selectedGame && betting.amount > 0 && (
            <div className="border border-white/[0.06] rounded-2xl p-4 space-y-1">
              <SectionLabel>Summary</SectionLabel>
              <div className="text-sm font-semibold">{selectedGame.name}</div>
              <div className="text-emerald-400 text-sm font-medium">
                {isSkins && `$${betting.skinValue} per skin`}
                {!isSkins && betting.structure === "Nassau" && `$${betting.amount} × 3 segments`}
                {!isSkins && betting.structure === "HoleByHole" && `$${betting.amount} per hole`}
                {!isSkins && betting.structure === "FullMatch" && `$${betting.amount} match`}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Match summary modal ──────────────────────────────────────────────────────

function SummaryRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3 border-t border-white/[0.06]">
      <div className="text-[10px] uppercase tracking-widest text-slate-600 font-semibold shrink-0 mt-0.5 w-20">
        {label}
      </div>
      <div className="flex-1 text-right space-y-0.5">{children}</div>
    </div>
  );
}

function MatchSummaryModal({
  setup,
  onConfirm,
  onEdit,
}: {
  setup: SetupState;
  onConfirm: () => void;
  onEdit: () => void;
}) {
  const players = setup.players.slice(0, setup.playerCount);
  const { selectedCourse, selectedTee, manualCourse, selectedGame, selectedFormat, betting, enableHandicaps } = setup;

  const courseName = selectedCourse
    ? selectedCourse.name
    : manualCourse?.name || "Generic Course";

  const courseDetail = selectedCourse && selectedTee
    ? `${getTeeName(selectedTee)} · CR ${selectedTee.courseRating} · Slope ${selectedTee.slopeRating}`
    : manualCourse
    ? `CR ${manualCourse.courseRating} · Slope ${manualCourse.slopeRating} · Par ${manualCourse.par}`
    : "Par 72 · CR 72.0 · Slope 130";

  const bettingLabel = !betting.enabled
    ? "Disabled"
    : betting.structure === "Nassau"
    ? `Nassau · $${betting.amount}/segment`
    : betting.structure === "HoleByHole"
    ? `$${betting.amount}/hole`
    : `$${betting.amount} full match`;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/75 backdrop-blur-sm px-4"
      onClick={onEdit}
    >
      <div
        className="w-full max-w-sm bg-[#0e1a2e] border border-white/[0.1] rounded-3xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <div>
            <h2 className="text-base font-bold tracking-tight">Ready to tee off?</h2>
            <p className="text-slate-500 text-xs mt-0.5">Review your match details</p>
          </div>
          <button
            onClick={onEdit}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-white/[0.06] text-slate-400 hover:text-white hover:bg-white/[0.1] transition"
            aria-label="Close"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Divider */}
        <div className="h-px bg-white/[0.06] mx-5" />

        {/* Summary rows */}
        <div className="px-5 py-2">
          <SummaryRow label="Players">
            {players.map((p, i) => (
              <div key={i} className="flex items-center justify-end gap-2">
                <span className="text-white text-sm font-medium">
                  {p.name.trim() || `Player ${i + 1}`}
                </span>
                {enableHandicaps && p.handicapIndex > 0 && (
                  <span className="text-slate-500 text-xs">HCP {p.handicapIndex}</span>
                )}
              </div>
            ))}
          </SummaryRow>

          <SummaryRow label="Game">
            <div className="text-white text-sm font-medium">{selectedGame?.name}</div>
            {selectedFormat && (
              <div className="text-slate-500 text-xs">{selectedFormat.label}</div>
            )}
          </SummaryRow>

          <SummaryRow label="Course">
            <div className="text-white text-sm font-medium">{courseName}</div>
            <div className="text-slate-500 text-xs">{courseDetail}</div>
          </SummaryRow>

          <SummaryRow label="Handicaps">
            <span className={`text-sm font-medium ${enableHandicaps ? "text-emerald-400" : "text-slate-500"}`}>
              {enableHandicaps ? "On" : "Off"}
            </span>
          </SummaryRow>

          <SummaryRow label="Betting">
            <span className={`text-sm font-medium ${betting.enabled ? "text-emerald-400" : "text-slate-500"}`}>
              {bettingLabel}
            </span>
          </SummaryRow>
        </div>

        {/* Actions */}
        <div className="px-5 pb-5 pt-3 flex flex-col gap-2">
          <button
            onClick={onConfirm}
            className="w-full py-4 rounded-2xl font-black text-sm text-black bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] transition shadow-[0_4px_24px_rgba(16,185,129,0.35)]"
          >
            ⛳ Start Match
          </button>
          <button
            onClick={onEdit}
            className="w-full py-3 rounded-2xl font-semibold text-sm text-slate-400 hover:text-white transition"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SetupPage() {
  const router = useRouter();
  const { setup, initSetup, setSetupStep, startRound } = useMatchStore();
  const [showSummary, setShowSummary] = useState(false);

  useEffect(() => {
    if (!setup) initSetup(2);
  }, [setup, initSetup]);

  // Auto-advance from step 4 when game + format are both selected.
  // Must be declared before any early returns to satisfy Rules of Hooks.
  useEffect(() => {
    if (!setup || setup.step !== 4) return;
    const validFormats = setup.selectedGame
      ? getFormatsForPlayerCount(setup.selectedGame, setup.playerCount)
      : [];
    const needsFormat = validFormats.length > 1;
    const isReady = setup.selectedGame !== null && (!needsFormat || setup.selectedFormat !== null);
    if (!isReady) return;
    const timer = setTimeout(() => {
      if (setup.playerCount === 1) {
        startRound();
        router.push("/round");
      } else {
        setSetupStep(5);
      }
    }, 350);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setup?.selectedGame?.id, setup?.selectedFormat?.label, setup?.step]);

  if (!setup) return null;

  // Derived values (non-hook)
  const validFormats = setup.selectedGame
    ? getFormatsForPlayerCount(setup.selectedGame, setup.playerCount)
    : [];
  const needsFormat = validFormats.length > 1;

  // Validation
  const allNamed = setup.players
    .slice(0, setup.playerCount)
    .every((p) => p.name.trim().length > 0);

  const canAdvance =
    setup.step === 2 ? allNamed :
    setup.step === 4 ? (setup.selectedGame !== null && (!needsFormat || setup.selectedFormat !== null)) :
    true;

  function handleBack() {
    if (setup!.step === 1) router.push("/");
    else setSetupStep((setup!.step - 1) as SetupState["step"]);
  }

  function handleNext() {
    if (!canAdvance) return;
    if (setup!.step === 5) {
      setShowSummary(true);
    } else {
      setSetupStep((setup!.step + 1) as SetupState["step"]);
    }
  }

  function handleConfirmMatch() {
    startRound();
    router.push("/round");
  }

  const stepLabels = ["Group", "Players", "Course", "Game", "Betting"];

  return (
    <div className="text-slate-100 flex flex-col max-w-md mx-auto">
      {showSummary && setup && (
        <MatchSummaryModal
          setup={setup}
          onConfirm={handleConfirmMatch}
          onEdit={() => setShowSummary(false)}
        />
      )}
      {/* Header — sticky below the NavShell top bar */}
      <div className="sticky top-14 z-20 bg-[#060d1a] px-4 pt-4 pb-3 border-b border-white/[0.06]">
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={handleBack}
            className="text-slate-600 hover:text-white transition text-sm font-medium"
          >
            {setup.step === 1 ? "← Home" : "← Back"}
          </button>
          <div className="flex items-center gap-1.5">
            {stepLabels.map((label, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <div
                  className={`text-[10px] font-semibold transition ${
                    i + 1 === setup.step ? "text-white" :
                    i + 1 < setup.step  ? "text-emerald-500" :
                    "text-slate-700"
                  }`}
                >
                  {label}
                </div>
                {i < stepLabels.length - 1 && (
                  <div className="text-slate-800 text-[10px]">·</div>
                )}
              </div>
            ))}
          </div>
          <div className="w-14" />
        </div>
        {/* Progress bar */}
        <div className="h-0.5 bg-white/[0.06] rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 rounded-full transition-all duration-300"
            style={{ width: `${(setup.step / 5) * 100}%` }}
          />
        </div>
      </div>

      {/* Content — extra bottom padding on steps with fixed Continue button */}
      <div className={`px-4 py-6 ${[2, 3, 5].includes(setup.step) ? "pb-36" : ""}`}>
        {setup.step === 1 && <StepGroupSize />}
        {setup.step === 2 && <StepPlayers />}
        {setup.step === 3 && <StepCourse />}
        {setup.step === 4 && <StepGame />}
        {setup.step === 5 && <StepBetting />}
      </div>

      {/* Fixed Continue button — floats above the tab bar, never overlaps content */}
      {(setup.step === 2 || setup.step === 3 || setup.step === 5) && (
        <div className="fixed bottom-24 inset-x-0 z-20 flex justify-center px-4 pointer-events-none">
          <div className="w-full max-w-md pointer-events-auto">
            <div className="bg-gradient-to-t from-[#060d1a] via-[#060d1a]/90 to-transparent pt-6 pb-3 px-0">
              <button
                onClick={handleNext}
                disabled={!canAdvance}
                className={`w-full py-4 rounded-2xl font-bold text-sm transition active:scale-[0.98] ${
                  canAdvance
                    ? "bg-emerald-500 text-black hover:bg-emerald-400 shadow-[0_4px_24px_rgba(16,185,129,0.3)]"
                    : "bg-white/[0.04] text-slate-600 cursor-not-allowed border border-white/[0.07]"
                }`}
              >
                {setup.step === 5 ? "Review & Start →" : "Continue →"}
              </button>
              {setup.step === 2 && !allNamed && (
                <p className="text-center text-slate-600 text-xs mt-2">
                  Enter all player names to continue
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
