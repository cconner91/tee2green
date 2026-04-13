"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useMatchStore, ActiveRound } from "@/store/matchStore";
import { PlayerId } from "@/domain/models/Player";
import { Hole } from "@/domain/models/Hole";
import { BettingMode } from "@/domain/gameConfig/types";
import {
  calculateRoundSummary,
  RoundSummary,
  PlayerSummary,
} from "@/domain/scoring/roundSummary";

// ─── Score utilities ──────────────────────────────────────────────────────────

function formatToPar(n: number): string {
  if (n === 0) return "E";
  return n > 0 ? `+${n}` : String(n);
}

function toParColor(n: number): string {
  if (n < 0)  return "text-sky-400";
  if (n === 0) return "text-white";
  if (n === 1) return "text-orange-400";
  return "text-red-500";
}

/** Tailwind classes for a score cell relative to par */
function scoreStyle(score: number, par: number) {
  const d = score - par;
  if (d <= -2) return "rounded-full ring-1 ring-amber-400 text-amber-400";
  if (d === -1) return "rounded-full ring-1 ring-sky-400 text-sky-400";
  if (d === 0)  return "text-slate-300";
  if (d === 1)  return "ring-1 ring-orange-400 text-orange-400";
  return "ring-2 ring-red-500 text-red-400";
}

function scoreLabel(score: number, par: number): string {
  const d = score - par;
  if (score === 1) return "ACE";
  if (d <= -3)  return "ALBA";
  if (d === -2) return "EAGLE";
  if (d === -1) return "BIRDIE";
  if (d === 0)  return "PAR";
  if (d === 1)  return "BOGEY";
  if (d === 2)  return "DBL";
  if (d === 3)  return "TRPL";
  return `+${d}`;
}

// ─── No round ─────────────────────────────────────────────────────────────────

function NoRoundView() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-5 px-8 text-center">
      <div className="w-16 h-16 rounded-full bg-white/[0.04] flex items-center justify-center text-3xl">
        ⛳
      </div>
      <div>
        <h2 className="text-lg font-semibold">No Active Round</h2>
        <p className="text-slate-500 text-sm mt-1">Start a new round to begin scoring.</p>
      </div>
      <Link
        href="/setup"
        className="bg-emerald-500 text-black font-semibold px-8 py-2.5 rounded-xl text-sm hover:bg-emerald-400 active:scale-[0.98] transition"
      >
        Start Round
      </Link>
    </div>
  );
}

// ─── Round complete ───────────────────────────────────────────────────────────

function RoundComplete({ round, summary }: { round: ActiveRound; summary: RoundSummary }) {
  const { abandonRound } = useMatchStore();

  const sorted = [...summary.playerSummaries].sort((a, b) =>
    round.game.scoringFormat === "PointsBased"
      ? (b.stablefordPoints ?? 0) - (a.stablefordPoints ?? 0)
      : a.netToPar - b.netToPar
  );

  return (
    <div className="min-h-dvh text-slate-100 max-w-md mx-auto px-4 py-10 space-y-6">
      <div className="text-center space-y-1 pb-2">
        <div className="text-3xl mb-3">🏆</div>
        <h1 className="text-xl font-bold">Round Complete</h1>
        <p className="text-emerald-400 font-semibold">{sorted[0]?.name} wins</p>
      </div>

      {/* Leaderboard */}
      <div className="bg-[#111] border border-white/[0.07] rounded-xl overflow-hidden">
        <div className="px-4 py-2.5 border-b border-white/[0.07]">
          <span className="text-[10px] uppercase tracking-widest text-slate-500">Final Standings</span>
        </div>
        {sorted.map((ps, rank) => (
          <div
            key={ps.id}
            className={`flex items-center justify-between px-4 py-3.5 border-b border-white/[0.04] last:border-0 ${
              rank === 0 ? "bg-emerald-500/[0.08]" : ""
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-slate-600 text-sm w-4">{rank + 1}</span>
              <span className="font-medium text-sm">{ps.name}</span>
            </div>
            <div className="text-right space-y-0.5">
              {round.game.scoringFormat === "PointsBased" ? (
                <span className="font-bold text-emerald-400">{ps.stablefordPoints} pts</span>
              ) : (
                <>
                  <div className={`font-bold ${toParColor(ps.netToPar)}`}>
                    {formatToPar(ps.netToPar)}
                  </div>
                  <div className="text-slate-600 text-xs">{ps.grossTotal} strokes</div>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Skins */}
      {summary.skins && (
        <div className="bg-[#111] border border-white/[0.07] rounded-xl p-4 space-y-3">
          <div className="text-[10px] uppercase tracking-widest text-slate-500">Skins Settlement</div>
          {round.players.map((p) => (
            <div key={p.id} className="flex justify-between text-sm">
              <span className="text-slate-300">{p.name}</span>
              <span className="font-semibold text-emerald-400">
                {summary.skins!.skinsWon[p.id] ?? 0} skins · ${summary.skins!.moneyWon[p.id] ?? 0}
              </span>
            </div>
          ))}
          {summary.skins.currentCarryValue > 0 && (
            <p className="text-slate-500 text-xs border-t border-white/[0.07] pt-2 mt-1">
              ${summary.skins.currentCarryValue} carried — no winner on last hole
            </p>
          )}
        </div>
      )}

      {/* Nassau */}
      {summary.nassau && round.betting.enabled && (
        <div className="bg-[#111] border border-white/[0.07] rounded-xl p-4 space-y-3">
          <div className="text-[10px] uppercase tracking-widest text-slate-500">
            Nassau · ${round.betting.baseBetAmount} per segment
          </div>
          {(["front", "back", "overall"] as const).map((seg) => {
            const mp = summary.nassau![seg];
            const label = seg === "front" ? "Front 9" : seg === "back" ? "Back 9" : "Overall";
            const winner = round.players.find((p) => p.id === mp.leaderId);
            return (
              <div key={seg} className="flex justify-between text-sm">
                <span className="text-slate-400">{label}</span>
                <span className="font-medium">
                  {winner
                    ? <span className="text-emerald-400">{winner.name} +${round.betting.baseBetAmount}</span>
                    : <span className="text-slate-500">All Square</span>}
                </span>
              </div>
            );
          })}
        </div>
      )}

      <button
        onClick={abandonRound}
        className="w-full py-3.5 bg-white/[0.05] hover:bg-white/[0.08] border border-white/[0.07] rounded-xl font-medium text-sm transition"
      >
        Back to Home
      </button>
    </div>
  );
}

// ─── Par selector ─────────────────────────────────────────────────────────────

function ParSelector({ hole, onChange }: { hole: Hole; onChange: (par: number) => void }) {
  return (
    <div className="flex items-center gap-1.5">
      {[3, 4, 5].map((p) => (
        <button
          key={p}
          onClick={() => onChange(p)}
          className={`w-11 h-11 rounded-lg text-sm font-bold transition active:scale-95 ${
            hole.par === p
              ? "bg-white text-black"
              : "bg-white/[0.07] text-slate-400"
          }`}
        >
          {p}
        </button>
      ))}
    </div>
  );
}

// ─── Score buttons ────────────────────────────────────────────────────────────

function ScoreButtons({
  hole,
  selected,
  onSelect,
}: {
  hole: Hole;
  selected: number | null;
  onSelect: (n: number) => void;
}) {
  return (
    <div className="grid grid-cols-5 gap-1.5 mt-3">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => {
        const isSelected = selected === n;
        const shape = scoreStyle(n, hole.par);
        const label = scoreLabel(n, hole.par);
        return (
          <button
            key={n}
            onClick={() => onSelect(n)}
            className={`flex flex-col items-center justify-center h-[52px] rounded-lg text-sm font-bold transition-all active:scale-90 ${
              isSelected
                ? "bg-emerald-500/20 ring-1 ring-emerald-500 text-emerald-400 scale-105"
                : `bg-white/[0.05] ${shape}`
            }`}
          >
            <span className="leading-none">{n}</span>
            <span className="text-[8px] mt-0.5 opacity-50 font-normal tracking-wide leading-none">{label}</span>
          </button>
        );
      })}
    </div>
  );
}

// ─── Mini scorecard strip ─────────────────────────────────────────────────────

function ScorecardStrip({ round }: { round: ActiveRound }) {
  const current = round.currentHole;
  const isBack = current > 9;
  const holes = round.courseHoles.filter((h) => (isBack ? h.number >= 10 : h.number <= 9));
  const segPar = holes.reduce((s, h) => s + h.par, 0);
  const segLabel = isBack ? "IN" : "OUT";

  return (
    <div className="overflow-x-auto -mx-4 px-4">
      <div className="bg-[#0d0d0d] border border-white/[0.05] rounded-xl overflow-hidden" style={{ minWidth: 340 }}>

        {/* Hole numbers */}
        <div className="flex border-b border-white/[0.06]">
          <div className="w-12 shrink-0 px-2 py-2 text-[9px] uppercase tracking-widest text-slate-700 font-semibold">HOLE</div>
          {holes.map((h) => (
            <div key={h.number} className={`flex-1 text-center py-2 text-[11px] font-bold ${h.number === current ? "text-white bg-white/[0.07]" : "text-slate-600"}`}>
              {h.number}
            </div>
          ))}
          <div className="w-10 shrink-0 text-center py-2 text-[10px] font-semibold text-slate-600">{segLabel}</div>
        </div>

        {/* HCP / stroke index */}
        <div className="flex border-b border-white/[0.04]">
          <div className="w-12 shrink-0 px-2 py-1 text-[9px] uppercase tracking-widest text-slate-800 font-semibold">HCP</div>
          {holes.map((h) => (
            <div key={h.number} className={`flex-1 text-center py-1 text-[9px] text-slate-800 ${h.number === current ? "bg-white/[0.07]" : ""}`}>
              {h.strokeIndex}
            </div>
          ))}
          <div className="w-10 shrink-0" />
        </div>

        {/* Par */}
        <div className="flex border-b border-white/[0.06]">
          <div className="w-12 shrink-0 px-2 py-1.5 text-[9px] uppercase tracking-widest text-slate-600 font-semibold">PAR</div>
          {holes.map((h) => (
            <div key={h.number} className={`flex-1 text-center py-1.5 text-[10px] font-semibold text-slate-600 ${h.number === current ? "bg-white/[0.07]" : ""}`}>
              {h.par}
            </div>
          ))}
          <div className="w-10 shrink-0 text-center py-1.5 text-[10px] font-bold text-slate-500">{segPar}</div>
        </div>

        {/* Player rows */}
        {round.players.map((player, pi) => {
          const segTotal = holes.reduce((s, h) => {
            const r = round.holeResults.find((r) => r.holeNumber === h.number);
            return s + (r?.grossScores[player.id] ?? 0);
          }, 0);
          return (
            <div key={player.id} className={`flex ${pi < round.players.length - 1 ? "border-b border-white/[0.04]" : ""}`}>
              <div className="w-12 shrink-0 px-2 py-2 text-[10px] text-slate-400 font-semibold truncate">
                {player.name.slice(0, 5) || `P${pi + 1}`}
              </div>
              {holes.map((h) => {
                const result = round.holeResults.find((r) => r.holeNumber === h.number);
                const score = result?.grossScores[player.id];
                return (
                  <div key={h.number} className={`flex-1 flex items-center justify-center py-1.5 ${h.number === current ? "bg-white/[0.07]" : ""}`}>
                    {score !== undefined ? (
                      <span className={`inline-flex items-center justify-center w-6 h-6 text-[11px] font-bold ${scoreStyle(score, h.par)}`}>
                        {score}
                      </span>
                    ) : (
                      <span className="text-slate-800 text-[11px]">·</span>
                    )}
                  </div>
                );
              })}
              <div className="w-10 shrink-0 flex items-center justify-center py-1.5">
                {segTotal > 0
                  ? <span className="text-[11px] font-semibold text-slate-400">{segTotal}</span>
                  : <span className="text-slate-800 text-[11px]">—</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Scorecard tab ────────────────────────────────────────────────────────────

function ScorecardView({ round }: { round: ActiveRound }) {
  const [seg, setSeg] = useState<"front" | "back">("front");
  const holes = round.courseHoles.filter((h) => (seg === "front" ? h.number <= 9 : h.number >= 10));
  const segPar = holes.reduce((s, h) => s + h.par, 0);
  const segLabel = seg === "front" ? "OUT" : "IN";

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Front / Back toggle */}
      <div className="flex bg-white/[0.05] rounded-xl p-1 mx-4 mt-4 mb-3 shrink-0">
        {(["front", "back"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setSeg(s)}
            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition ${
              seg === s ? "bg-white text-black shadow-sm" : "text-slate-500"
            }`}
          >
            {s === "front" ? "Front 9" : "Back 9"}
          </button>
        ))}
      </div>

      {/* Scrollable card */}
      <div className="flex-1 overflow-x-auto overflow-y-auto px-4 pb-[env(safe-area-inset-bottom,16px)]">
        <div className="bg-[#0d0d0d] border border-white/[0.06] rounded-xl overflow-hidden" style={{ minWidth: 360 }}>

          {/* Hole numbers header */}
          <div className="flex border-b border-white/[0.07]">
            <div className="w-16 shrink-0 px-3 py-2.5 text-[9px] uppercase tracking-widest text-slate-700 font-semibold">HOLE</div>
            {holes.map((h) => (
              <div key={h.number} className="flex-1 text-center py-2.5 text-xs font-bold text-slate-400">
                {h.number}
              </div>
            ))}
            <div className="w-14 shrink-0 text-center py-2.5 text-xs font-bold text-slate-500">{segLabel}</div>
          </div>

          {/* Yardage — placeholder until course DB */}
          <div className="flex border-b border-white/[0.04]">
            <div className="w-16 shrink-0 px-3 py-1.5 text-[9px] uppercase tracking-widest text-slate-800 font-semibold">YDS</div>
            {holes.map((h) => (
              <div key={h.number} className="flex-1 text-center py-1.5 text-[9px] text-slate-800">—</div>
            ))}
            <div className="w-14 shrink-0 text-center py-1.5 text-[9px] text-slate-800">—</div>
          </div>

          {/* HCP / stroke index */}
          <div className="flex border-b border-white/[0.04]">
            <div className="w-16 shrink-0 px-3 py-1.5 text-[9px] uppercase tracking-widest text-slate-700 font-semibold">HCP</div>
            {holes.map((h) => (
              <div key={h.number} className="flex-1 text-center py-1.5 text-[9px] text-slate-700">{h.strokeIndex}</div>
            ))}
            <div className="w-14 shrink-0" />
          </div>

          {/* Par */}
          <div className="flex border-b border-white/[0.08]">
            <div className="w-16 shrink-0 px-3 py-2 text-[9px] uppercase tracking-widest text-slate-500 font-semibold">PAR</div>
            {holes.map((h) => (
              <div key={h.number} className="flex-1 text-center py-2 text-xs font-bold text-slate-400">
                {h.par}
              </div>
            ))}
            <div className="w-14 shrink-0 text-center py-2 text-xs font-bold text-slate-300">{segPar}</div>
          </div>

          {/* Player rows */}
          {round.players.map((player, pi) => {
            const segResults = round.holeResults.filter((r) =>
              holes.some((h) => h.number === r.holeNumber)
            );
            const total = segResults.reduce((s, r) => s + (r.grossScores[player.id] ?? 0), 0);
            const toPar = total > 0 ? total - segPar : null;
            return (
              <div key={player.id} className={`flex ${pi < round.players.length - 1 ? "border-b border-white/[0.05]" : ""}`}>
                <div className="w-16 shrink-0 px-3 py-3 text-xs font-semibold text-slate-200 truncate">
                  {player.name}
                </div>
                {holes.map((h) => {
                  const result = round.holeResults.find((r) => r.holeNumber === h.number);
                  const score = result?.grossScores[player.id];
                  return (
                    <div key={h.number} className="flex-1 flex items-center justify-center py-2.5">
                      {score !== undefined ? (
                        <span className={`inline-flex items-center justify-center w-7 h-7 text-xs font-bold ${scoreStyle(score, h.par)}`}>
                          {score}
                        </span>
                      ) : (
                        <span className="text-slate-800 text-sm">·</span>
                      )}
                    </div>
                  );
                })}
                <div className="w-14 shrink-0 flex flex-col items-center justify-center py-2.5 gap-0.5">
                  {total > 0 ? (
                    <>
                      <span className="text-xs font-bold text-white">{total}</span>
                      {toPar !== null && (
                        <span className={`text-[10px] font-semibold ${toPar < 0 ? "text-sky-400" : toPar === 0 ? "text-slate-600" : "text-orange-400"}`}>
                          {toPar === 0 ? "E" : toPar > 0 ? `+${toPar}` : toPar}
                        </span>
                      )}
                    </>
                  ) : (
                    <span className="text-slate-800 text-sm">—</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Betting strip ────────────────────────────────────────────────────────────

function BettingStrip({ round, summary }: { round: ActiveRound; summary: RoundSummary }) {
  if (!round.betting.enabled) return null;
  const { game, players, betting } = round;

  return (
    <div className="mx-4 mb-[max(12px,env(safe-area-inset-bottom))] bg-[#0d0d0d] border border-white/[0.06] rounded-xl px-4 py-3 space-y-2">
      <div className="text-[10px] uppercase tracking-widest text-slate-600 mb-1">Betting</div>

      {game.bettingMode === BettingMode.Standard && summary.matchPlay && (
        <div className="flex justify-between text-sm">
          <span className="text-slate-500">Match</span>
          <span className="font-medium text-white">
            {summary.matchPlay.leaderId
              ? `${players.find((p) => p.id === summary.matchPlay!.leaderId)?.name} — ${summary.matchPlay.status}`
              : summary.matchPlay.status}
          </span>
        </div>
      )}

      {game.bettingMode === BettingMode.Standard && !summary.matchPlay && (
        <div className="flex justify-between text-sm">
          <span className="text-slate-500">Leader</span>
          <span className="font-medium text-white">
            {[...summary.playerSummaries].sort((a, b) => a.netToPar - b.netToPar)[0]?.name ?? "—"}
          </span>
        </div>
      )}

      {game.bettingMode === BettingMode.Nassau && summary.nassau && (
        <>
          {(["front", "back", "overall"] as const).map((seg) => {
            const mp = summary.nassau![seg];
            const ldr = players.find((p) => p.id === mp.leaderId);
            return (
              <div key={seg} className="flex justify-between text-sm">
                <span className="text-slate-500 capitalize">
                  {seg === "front" ? "Front" : seg === "back" ? "Back" : "Overall"}
                </span>
                <span className="font-medium text-emerald-400">
                  {ldr ? `${ldr.name} ${mp.status}` : "All Square"}
                </span>
              </div>
            );
          })}
          <div className="text-slate-700 text-[10px] pt-0.5">
            ${betting.baseBetAmount} per segment · max ${betting.baseBetAmount * 3}
          </div>
        </>
      )}

      {game.bettingMode === BettingMode.Skins && summary.skins && (
        <>
          {players.map((p) => (
            <div key={p.id} className="flex justify-between text-sm">
              <span className="text-slate-500">{p.name}</span>
              <span className="font-medium text-emerald-400">
                {summary.skins!.skinsWon[p.id] ?? 0} skins · ${summary.skins!.moneyWon[p.id] ?? 0}
              </span>
            </div>
          ))}
          {summary.skins.currentCarryValue > 0 && (
            <div className="text-amber-400 text-xs font-medium">
              Pot: ${summary.skins.currentCarryValue} carrying
            </div>
          )}
          <div className="text-slate-700 text-[10px]">${betting.skinValue} per skin</div>
        </>
      )}
    </div>
  );
}

// ─── Hole view ────────────────────────────────────────────────────────────────

function HoleView({
  round,
  summary,
  grossScores,
  setScore,
  onSubmit,
}: {
  round: ActiveRound;
  summary: RoundSummary;
  grossScores: Record<PlayerId, number | null>;
  setScore: (id: PlayerId, n: number) => void;
  onSubmit: () => void;
}) {
  const { setHolePar } = useMatchStore();
  const hole = round.courseHoles[round.currentHole - 1];
  const allEntered = round.players.every((p) => grossScores[p.id] != null);

  const psMap = Object.fromEntries(summary.playerSummaries.map((ps) => [ps.id, ps]));

  // Leader detection
  const leaderIds = new Set<PlayerId>();
  if (summary.matchPlay?.leaderId) {
    leaderIds.add(summary.matchPlay.leaderId);
  } else if (!summary.nassau) {
    const sorted = [...summary.playerSummaries].sort((a, b) => a.netToPar - b.netToPar);
    if (sorted.length && sorted[0].holesPlayed > 0) leaderIds.add(sorted[0].id);
  }

  return (
    <div className="flex-1 flex flex-col gap-3 px-4 pt-4 pb-2 overflow-y-auto">
      {/* Hole header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-3xl font-black tracking-tight">Hole {round.currentHole}</div>
          <div className="text-slate-500 text-xs mt-0.5">
            Stroke Index {hole.strokeIndex}
          </div>
        </div>
        <div className="text-right">
          <div className="text-[10px] uppercase tracking-widest text-slate-600 mb-1.5">Par</div>
          <ParSelector hole={hole} onChange={(p) => setHolePar(hole.number, p)} />
        </div>
      </div>

      {/* Match status */}
      {summary.matchPlay && (
        <div className="flex items-center gap-2">
          <div
            className={`text-sm font-semibold ${
              summary.matchPlay.leaderId ? "text-emerald-400" : "text-slate-400"
            }`}
          >
            {summary.matchPlay.leaderId
              ? `${round.players.find((p) => p.id === summary.matchPlay!.leaderId)?.name} — ${summary.matchPlay.status}`
              : summary.matchPlay.status}
          </div>
          <div className="h-px flex-1 bg-white/[0.05]" />
          <div className="text-slate-600 text-xs">
            Thru {summary.holesPlayed}
          </div>
        </div>
      )}

      {/* Mini scorecard */}
      <ScorecardStrip round={round} />

      {/* Player cards */}
      {round.players.map((player) => {
        const ps: PlayerSummary | undefined = psMap[player.id];
        const isLeader = leaderIds.has(player.id) && summary.holesPlayed > 0;

        // Strokes received this hole
        const ph = round.playingHandicaps[player.id] ?? 0;
        const strokesThisHole =
          round.enableHandicaps && ph > 0
            ? Math.floor(ph / 18) + (hole.strokeIndex <= (ph % 18) ? 1 : 0)
            : 0;

        return (
          <div
            key={player.id}
            className={`bg-[#111] rounded-xl p-4 border transition ${
              isLeader ? "border-emerald-500/40" : "border-white/[0.06]"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm">{player.name}</span>
                {strokesThisHole > 0 && (
                  <span className="text-sky-400 text-[10px] font-medium bg-sky-400/10 px-1.5 py-0.5 rounded">
                    +{strokesThisHole} HCP
                  </span>
                )}
              </div>
              <div className="text-right">
                {ps && ps.holesPlayed > 0 ? (
                  <span className={`text-2xl font-black ${toParColor(ps.netToPar)}`}>
                    {ps.stablefordPoints !== undefined
                      ? `${ps.stablefordPoints}pts`
                      : formatToPar(ps.netToPar)}
                  </span>
                ) : (
                  <span className="text-slate-700 text-2xl font-black">—</span>
                )}
              </div>
            </div>
            <ScoreButtons
              hole={hole}
              selected={grossScores[player.id] ?? null}
              onSelect={(n) => setScore(player.id, n)}
            />
          </div>
        );
      })}

      {/* Submit + undo — padded for iOS home indicator */}
      <div className="pb-[env(safe-area-inset-bottom,8px)] space-y-1">
        <button
          onClick={onSubmit}
          disabled={!allEntered}
          className={`w-full py-4 rounded-xl font-bold text-sm transition active:scale-[0.98] ${
            allEntered
              ? "bg-emerald-500 text-black"
              : "bg-white/[0.04] text-slate-700 cursor-not-allowed"
          }`}
        >
          {allEntered ? `Submit Hole ${round.currentHole}` : "Enter all scores to continue"}
        </button>

        {round.holeResults.length > 0 && <UndoButton />}
      </div>
    </div>
  );
}

function UndoButton() {
  const { undoLastHole } = useMatchStore();
  return (
    <button
      onClick={undoLastHole}
      className="w-full text-center text-slate-600 hover:text-slate-400 text-xs py-1 transition"
    >
      ← Undo last hole
    </button>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

type Tab = "hole" | "scorecard";

export default function RoundView() {
  const { round, submitHole } = useMatchStore();
  const [tab, setTab] = useState<Tab>("hole");
  const [grossScores, setGrossScores] = useState<Record<PlayerId, number | null>>({});
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => { setGrossScores({}); setTab("hole"); }, [round?.currentHole]);

  if (!mounted) return null;
  if (!round) return <NoRoundView />;

  const summary = calculateRoundSummary(
    round.holeResults,
    round.players,
    round.game,
    round.course,
    round.betting.skinValue
  );

  if (round.isComplete) return <RoundComplete round={round} summary={summary} />;

  function setScore(id: PlayerId, n: number) {
    setGrossScores((prev) => ({ ...prev, [id]: n }));
  }

  function handleSubmit() {
    const scores: Record<PlayerId, number> = {};
    let ok = true;
    round!.players.forEach((p) => {
      const s = grossScores[p.id];
      if (s == null) { ok = false; return; }
      scores[p.id] = s;
    });
    if (!ok) return;
    submitHole(scores);
  }

  const currentPar = round.courseHoles[round.currentHole - 1].par;

  return (
    <div className="min-h-dvh text-slate-100 flex flex-col max-w-md mx-auto">
      {/* Tab bar — sits below the 56px (h-14) NavShell header */}
      <div className="flex border-b border-white/[0.06] bg-[#060d1a]/95 backdrop-blur-xl sticky top-14 z-10">
        <button
          onClick={() => setTab("hole")}
          className={`flex-1 py-3 text-sm font-medium transition border-b-2 ${
            tab === "hole"
              ? "border-emerald-500 text-white"
              : "border-transparent text-slate-600 hover:text-slate-400"
          }`}
        >
          Hole {round.currentHole} · Par {currentPar}
        </button>
        <button
          onClick={() => setTab("scorecard")}
          className={`flex-1 py-3 text-sm font-medium transition border-b-2 ${
            tab === "scorecard"
              ? "border-emerald-500 text-white"
              : "border-transparent text-slate-600 hover:text-slate-400"
          }`}
        >
          Scorecard
        </button>
      </div>

      {tab === "hole" ? (
        <>
          <HoleView
            round={round}
            summary={summary}
            grossScores={grossScores}
            setScore={setScore}
            onSubmit={handleSubmit}
          />
          <BettingStrip round={round} summary={summary} />
        </>
      ) : (
        <ScorecardView round={round} />
      )}
    </div>
  );
}
