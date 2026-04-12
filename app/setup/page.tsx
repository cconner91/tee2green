"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useMatchStore, SetupState } from "@/store/matchStore";
import { useGameLibraryStore } from "@/store/gameLibraryStore";
import { GolfGameDefinition, BettingMode, ScoringFormat } from "@/domain/gameConfig/types";
import { gameDefinitions } from "@/domain/gameConfig/definitions";
import { getGamesForPlayerCount } from "@/domain/gameConfig/filters";

// ─── Shared ───────────────────────────────────────────────────────────────────

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
    <div className="text-[10px] uppercase tracking-widest text-slate-600 mb-2">
      {children}
    </div>
  );
}

// ─── Step 1: Group size ───────────────────────────────────────────────────────

function StepGroupSize() {
  const { setup, initSetup } = useMatchStore();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold">How many players?</h2>
        <p className="text-slate-500 text-sm mt-1">
          The game list will adjust automatically.
        </p>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {[2, 3, 4, 5, 6, 7, 8].map((n) => (
          <button
            key={n}
            onClick={() => initSetup(n)}
            className={`py-5 rounded-xl text-2xl font-bold transition active:scale-95 ${
              setup?.playerCount === n
                ? "bg-emerald-500 text-black"
                : "bg-white/[0.06] text-slate-300 hover:bg-white/10"
            }`}
          >
            {n}
          </button>
        ))}
      </div>
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
        <h2 className="text-xl font-bold">Who&apos;s playing?</h2>
        <p className="text-slate-500 text-sm mt-1">Names are optional.</p>
      </div>

      {/* Handicap toggle */}
      <div className="flex items-center justify-between bg-[#111] border border-white/[0.07] rounded-xl px-4 py-3.5">
        <div>
          <div className="text-sm font-medium">Use Handicaps</div>
          <div className="text-slate-500 text-xs mt-0.5">Net scores for fair competition</div>
        </div>
        <Toggle on={setup.enableHandicaps} onToggle={() => setEnableHandicaps(!setup.enableHandicaps)} />
      </div>

      {/* Player inputs */}
      <div className="space-y-2">
        {setup.players.map((player, i) => (
          <div key={i} className="bg-[#111] border border-white/[0.07] rounded-xl p-4 space-y-2.5">
            <div className="text-emerald-500 text-[10px] uppercase tracking-widest font-semibold">
              Player {i + 1}
            </div>
            <input
              value={player.name}
              onChange={(e) => {
                const updated = [...setup.players];
                updated[i] = { ...updated[i], name: e.target.value };
                updatePlayers(updated);
              }}
              placeholder={`Player ${i + 1}`}
              className="w-full bg-white/[0.05] border border-white/[0.07] rounded-lg px-3 py-2.5 text-white placeholder-slate-700 focus:outline-none focus:border-emerald-500/40 text-sm transition"
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
                className="w-full bg-white/[0.05] border border-white/[0.07] rounded-lg px-3 py-2.5 text-white placeholder-slate-700 focus:outline-none focus:border-emerald-500/40 text-sm transition"
                min={0}
                max={54}
                step={0.1}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Step 3: Game selection ───────────────────────────────────────────────────

function formatBadge(game: GolfGameDefinition): string {
  if (game.bettingMode === BettingMode.Nassau) return "Nassau";
  if (game.bettingMode === BettingMode.Skins)  return "Skins";
  if (game.scoringFormat === ScoringFormat.PointsBased) return "Points";
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
      className={`p-4 rounded-xl text-left space-y-2 border transition ${
        selected
          ? "border-emerald-500 bg-emerald-500/[0.08]"
          : "border-white/[0.07] bg-[#111] hover:border-white/20"
      }`}
    >
      <div className="flex items-start justify-between gap-1">
        <div className="font-semibold text-sm leading-tight">{game.name}</div>
        {badge && (
          <span className="text-[9px] uppercase tracking-wide bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded shrink-0">
            {badge}
          </span>
        )}
      </div>
      <div className="text-slate-500 text-xs leading-relaxed">{game.description}</div>
      <div className="text-slate-700 text-[10px]">
        {game.minPlayers === game.maxPlayers
          ? `${game.minPlayers} players`
          : `${game.minPlayers}–${game.maxPlayers} players`}
      </div>
    </button>
  );
}

function StepGame() {
  const { setup, selectGame } = useMatchStore();
  const { customGames } = useGameLibraryStore();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  if (!setup) return null;

  const allGames = [...gameDefinitions, ...(mounted ? customGames : [])];
  const available = getGamesForPlayerCount(setup.playerCount, allGames);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold">Choose your game</h2>
        <p className="text-slate-500 text-sm mt-1">
          {available.length} games for {setup.playerCount} players
        </p>
      </div>

      {available.length === 0 ? (
        <div className="text-center py-10 text-slate-600 text-sm">
          No games for {setup.playerCount} players. Adjust your group size.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2">
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

      <div className="text-center pt-2">
        <a href="/games" className="text-emerald-500 text-xs hover:text-emerald-400 transition">
          Browse full game library →
        </a>
      </div>
    </div>
  );
}

// ─── Step 4: Betting ──────────────────────────────────────────────────────────

function StepBetting() {
  const { setup, updateBetting } = useMatchStore();
  if (!setup) return null;

  const { betting, selectedGame } = setup;
  const isSkins  = selectedGame?.bettingMode === BettingMode.Skins;
  const isNassau = selectedGame?.bettingMode === BettingMode.Nassau;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold">Betting</h2>
        <p className="text-slate-500 text-sm mt-1">Optional — set stakes for the round.</p>
      </div>

      {/* Enable toggle */}
      <div className="flex items-center justify-between bg-[#111] border border-white/[0.07] rounded-xl px-4 py-3.5">
        <div>
          <div className="text-sm font-medium">Enable Betting</div>
          <div className="text-slate-500 text-xs mt-0.5">Track winnings hole by hole</div>
        </div>
        <Toggle on={betting.enabled} onToggle={() => updateBetting({ enabled: !betting.enabled })} />
      </div>

      {betting.enabled && (
        <div className="space-y-3">
          {/* Skins value */}
          {isSkins && (
            <div className="bg-[#111] border border-white/[0.07] rounded-xl p-4 space-y-3">
              <SectionLabel>Value Per Skin</SectionLabel>
              <p className="text-slate-500 text-xs">
                Each skin is worth this amount. Carries over on ties.
              </p>
              <div className="flex items-center gap-2">
                <span className="text-slate-500 text-sm">$</span>
                <input
                  type="number"
                  value={betting.skinValue}
                  onChange={(e) => updateBetting({ skinValue: Math.max(0, Number(e.target.value)) })}
                  className="flex-1 bg-white/[0.05] border border-white/[0.07] rounded-lg px-3 py-2.5 text-white font-semibold focus:outline-none focus:border-emerald-500/40 transition"
                  min={0}
                  step={1}
                />
              </div>
            </div>
          )}

          {/* Base bet (match play / nassau / stroke play) */}
          {!isSkins && (
            <div className="bg-[#111] border border-white/[0.07] rounded-xl p-4 space-y-3">
              <SectionLabel>{isNassau ? "Bet Per Segment" : "Match Bet"}</SectionLabel>
              <p className="text-slate-500 text-xs">
                {isNassau
                  ? "Front 9, Back 9, and Overall are each worth this amount independently."
                  : "Winner collects this amount from each opponent."}
              </p>
              <div className="flex items-center gap-2">
                <span className="text-slate-500 text-sm">$</span>
                <input
                  type="number"
                  value={betting.baseBetAmount}
                  onChange={(e) => updateBetting({ baseBetAmount: Math.max(0, Number(e.target.value)) })}
                  className="flex-1 bg-white/[0.05] border border-white/[0.07] rounded-lg px-3 py-2.5 text-white font-semibold focus:outline-none focus:border-emerald-500/40 transition"
                  min={0}
                  step={1}
                />
              </div>
              {isNassau && (
                <div className="text-slate-600 text-xs">
                  Max exposure: ${betting.baseBetAmount * 3} per player (3 bets)
                </div>
              )}
            </div>
          )}

          {/* Game + bet summary */}
          {selectedGame && (
            <div className="border border-white/[0.05] rounded-xl p-4 space-y-1.5">
              <SectionLabel>Summary</SectionLabel>
              <div className="text-sm font-medium">{selectedGame.name}</div>
              <div className="text-emerald-400 text-sm">
                {isSkins && `$${betting.skinValue} per skin`}
                {isNassau && `$${betting.baseBetAmount} × 3 segments`}
                {!isSkins && !isNassau && `$${betting.baseBetAmount} match`}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SetupPage() {
  const router = useRouter();
  const { setup, initSetup, setSetupStep, startRound } = useMatchStore();

  useEffect(() => {
    if (!setup) initSetup(2);
  }, [setup, initSetup]);

  if (!setup) return null;

  const canAdvance =
    setup.step === 3 ? setup.selectedGame !== null : true;

  function handleBack() {
    if (setup!.step === 1) router.push("/");
    else setSetupStep((setup!.step - 1) as SetupState["step"]);
  }

  function handleNext() {
    if (!canAdvance) return;
    if (setup!.step < 4) {
      setSetupStep((setup!.step + 1) as SetupState["step"]);
    } else {
      startRound();
      router.push("/round");
    }
  }

  const stepLabels = ["Group", "Players", "Game", "Betting"];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col max-w-md mx-auto">
      {/* Header */}
      <div className="px-4 pt-5 pb-4 border-b border-white/[0.05]">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={handleBack}
            className="text-slate-600 hover:text-white transition text-sm"
          >
            ← {setup.step === 1 ? "Home" : "Back"}
          </button>
          <div className="flex items-center gap-1">
            {stepLabels.map((label, i) => (
              <div key={i} className="flex items-center gap-1">
                <div
                  className={`text-[10px] font-medium transition ${
                    i + 1 === setup.step
                      ? "text-white"
                      : i + 1 < setup.step
                      ? "text-emerald-500"
                      : "text-slate-700"
                  }`}
                >
                  {label}
                </div>
                {i < stepLabels.length - 1 && (
                  <div className={`text-slate-800 text-[10px]`}>·</div>
                )}
              </div>
            ))}
          </div>
          <div className="w-12" />
        </div>
        {/* Progress bar */}
        <div className="h-px bg-white/[0.06] rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 rounded-full transition-all duration-300"
            style={{ width: `${(setup.step / 4) * 100}%` }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 py-6 overflow-y-auto">
        {setup.step === 1 && <StepGroupSize />}
        {setup.step === 2 && <StepPlayers />}
        {setup.step === 3 && <StepGame />}
        {setup.step === 4 && <StepBetting />}
      </div>

      {/* Footer */}
      <div className="px-4 pt-3 pb-8 border-t border-white/[0.05]">
        <button
          onClick={handleNext}
          disabled={!canAdvance}
          className={`w-full py-3.5 rounded-xl font-bold text-sm transition ${
            canAdvance
              ? "bg-emerald-500 text-black hover:bg-emerald-400 active:scale-[0.98]"
              : "bg-white/[0.04] text-slate-700 cursor-not-allowed"
          }`}
        >
          {setup.step === 4 ? "Start Round →" : "Continue →"}
        </button>
        {setup.step === 3 && !setup.selectedGame && (
          <p className="text-center text-slate-700 text-xs mt-2">
            Select a game to continue
          </p>
        )}
      </div>
    </div>
  );
}
