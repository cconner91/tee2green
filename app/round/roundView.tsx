"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useMatchStore, ActiveRound } from "@/store/matchStore";
import { PlayerId } from "@/domain/models/Player";
import { Hole } from "@/domain/models/Hole";
import { BettingMode } from "@/domain/gameConfig/types";
import {
  calculateRoundSummary,
  RoundSummary,
  PlayerSummary,
  MatchPlaySummary,
} from "@/domain/scoring/roundSummary";

// ─── Score utilities ──────────────────────────────────────────────────────────

function formatToPar(n: number): string {
  if (n === 0) return "E";
  return n > 0 ? `+${n}` : String(n);
}

function toParColor(n: number): string {
  if (n < 0)   return "text-sky-400";
  if (n === 0) return "text-white";
  if (n === 1) return "text-orange-400";
  return "text-red-500";
}

// Ring/bg decoration only — no text color. Applied to a fixed-size container.
// Two-ring effects use double box-shadow: inner ring at 1px, gap, outer ring at 3px.
function scoreRing(score: number, par: number): string {
  const d = score - par;
  if (score === 1 || d <= -3) return "rounded-full bg-emerald-500";                                     // Ace/Albatross — filled green
  if (d === -2) return "rounded-full shadow-[0_0_0_1.5px_#34d399,0_0_0_3px_#060d1a,0_0_0_4.5px_#34d399]"; // Eagle — 2 circle rings
  if (d === -1) return "rounded-full shadow-[0_0_0_2px_#38bdf8]";                                       // Birdie — 1 circle ring
  if (d === 0)  return "";                                                                               // Par — plain
  if (d === 1)  return "rounded shadow-[0_0_0_2px_#fb923c]";                                            // Bogey — 1 square ring
  if (d === 2)  return "rounded shadow-[0_0_0_1.5px_#ef4444,0_0_0_3px_#060d1a,0_0_0_4.5px_#ef4444]"; // Double — 2 square rings
  return "rounded bg-red-700";                                                                           // Triple+ — filled red
}

// Full style for scorecard cells: ring + text color
function scoreStyle(score: number, par: number): string {
  const ring = scoreRing(score, par);
  const d = score - par;
  let text: string;
  if (score === 1 || d <= -3) text = "text-black";
  else if (d === -2)          text = "text-emerald-400";
  else if (d === -1)          text = "text-sky-400";
  else if (d === 0)           text = "text-slate-300";
  else if (d === 1)           text = "text-orange-400";
  else if (d === 2)           text = "text-red-400";
  else                        text = "text-white";
  return ring ? `${ring} ${text}` : text;
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

function moneySign(n: number): string {
  if (n === 0) return "—";
  return n > 0 ? `+$${n}` : `-$${Math.abs(n)}`;
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
  const isSolo = round.players.length === 1;

  const sorted = [...summary.playerSummaries].sort((a, b) =>
    round.game.scoringFormat === "PointsBased"
      ? (b.stablefordPoints ?? 0) - (a.stablefordPoints ?? 0)
      : a.netToPar - b.netToPar
  );

  const winner = sorted[0];

  return (
    <div className="min-h-dvh text-slate-100 max-w-md mx-auto px-4 py-10 space-y-5">
      {/* Header */}
      <div className="text-center space-y-1 pb-2">
        {isSolo ? (
          <>
            <div className="text-3xl mb-3">⛳</div>
            <h1 className="text-xl font-bold">Round Complete</h1>
            <p className={`font-bold text-xl ${toParColor(winner?.netToPar ?? 0)}`}>
              {formatToPar(winner?.netToPar ?? 0)}
            </p>
          </>
        ) : (
          <>
            <div className="text-3xl mb-3">🏆</div>
            <h1 className="text-xl font-bold">Round Complete</h1>
            <p className="text-emerald-400 font-semibold">{winner?.name} wins</p>
          </>
        )}
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
              rank === 0 && !isSolo ? "bg-emerald-500/[0.06]" : ""
            }`}
          >
            <div className="flex items-center gap-3">
              {!isSolo && <span className="text-slate-600 text-sm w-4">{rank + 1}</span>}
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

      {/* ── Betting Settlement ──────────────────────────────────────────────── */}

      {/* Skins */}
      {summary.skins && (
        <div className="bg-[#111] border border-white/[0.07] rounded-xl overflow-hidden">
          <div className="px-4 py-2.5 border-b border-white/[0.07]">
            <span className="text-[10px] uppercase tracking-widest text-slate-500">
              Skins · ${round.betting.skinValue}/skin
            </span>
          </div>
          <div className="divide-y divide-white/[0.04]">
            {round.players.map((p) => {
              const skins = summary.skins!.skinsWon[p.id] ?? 0;
              const money = summary.skins!.moneyWon[p.id] ?? 0;
              return (
                <div key={p.id} className="flex justify-between px-4 py-3 text-sm">
                  <span className="text-slate-300">{p.name}</span>
                  <div className="text-right">
                    <span className={`font-semibold ${money > 0 ? "text-emerald-400" : "text-slate-500"}`}>
                      {money > 0 ? `+$${money}` : "—"}
                    </span>
                    <span className="text-slate-600 text-xs ml-2">{skins} skins</span>
                  </div>
                </div>
              );
            })}
          </div>
          {summary.skins.currentCarryValue > 0 && (
            <div className="px-4 py-2.5 border-t border-white/[0.07] text-slate-500 text-xs">
              ${summary.skins.currentCarryValue} carried — no winner on final hole
            </div>
          )}
        </div>
      )}

      {/* Nassau */}
      {summary.nassau && round.betting.enabled && (
        <div className="bg-[#111] border border-white/[0.07] rounded-xl overflow-hidden">
          <div className="px-4 py-2.5 border-b border-white/[0.07]">
            <span className="text-[10px] uppercase tracking-widest text-slate-500">
              Nassau Settlement · ${round.betting.amount}/segment
            </span>
          </div>
          <div className="divide-y divide-white/[0.04]">
            {(["front", "back", "overall"] as const).map((seg) => {
              const mp = summary.nassau![seg];
              const ldr = round.players.find((p) => p.id === mp.leaderId);
              const label = seg === "front" ? "Front 9" : seg === "back" ? "Back 9" : "Overall";
              return (
                <div key={seg} className="flex justify-between px-4 py-3 text-sm">
                  <span className="text-slate-500">{label}</span>
                  <span className={`font-medium ${ldr ? "text-emerald-400" : "text-slate-600"}`}>
                    {ldr ? `${ldr.name} wins · +$${round.betting.amount}` : "All Square"}
                  </span>
                </div>
              );
            })}
            {summary.nassau.presses.map((press, i) => {
              const ldr = round.players.find((p) => p.id === press.match.leaderId);
              return (
                <div key={press.id} className="flex justify-between px-4 py-3 text-sm">
                  <span className="text-slate-600">Press {i + 1} (H{press.startHole}+)</span>
                  <span className={`font-medium ${ldr ? "text-emerald-400" : "text-slate-600"}`}>
                    {ldr ? `${ldr.name} wins · +$${press.amount}` : "All Square"}
                  </span>
                </div>
              );
            })}
          </div>
          {/* Net balance */}
          <div className="px-4 py-3 border-t border-white/[0.07] space-y-1.5">
            <div className="text-[10px] uppercase tracking-widest text-slate-600 mb-2">Net Balance</div>
            {round.players.map((p) => {
              const bal = summary.nassau!.balance[p.id] ?? 0;
              return (
                <div key={p.id} className="flex justify-between text-sm">
                  <span className="text-slate-400">{p.name}</span>
                  <span className={`font-bold ${bal > 0 ? "text-emerald-400" : bal < 0 ? "text-red-400" : "text-slate-600"}`}>
                    {moneySign(bal)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Hole-by-Hole */}
      {summary.holeByHole && round.betting.enabled && (
        <div className="bg-[#111] border border-white/[0.07] rounded-xl overflow-hidden">
          <div className="px-4 py-2.5 border-b border-white/[0.07]">
            <span className="text-[10px] uppercase tracking-widest text-slate-500">
              Hole by Hole · ${round.betting.amount}/hole
            </span>
          </div>
          {/* Hole-by-hole history */}
          <div className="divide-y divide-white/[0.04] max-h-40 overflow-y-auto">
            {summary.holeByHole.history.map((h) => {
              const winnerPlayer = round.players.find((p) => p.id === h.winner);
              return (
                <div key={h.holeNumber} className="flex justify-between px-4 py-2 text-xs">
                  <span className="text-slate-600">Hole {h.holeNumber}</span>
                  <span className={`font-medium ${winnerPlayer ? "text-emerald-400" : "text-slate-600"}`}>
                    {winnerPlayer ? `${winnerPlayer.name} wins` : "Halved"}
                  </span>
                </div>
              );
            })}
          </div>
          {/* Balance */}
          <div className="px-4 py-3 border-t border-white/[0.07] space-y-1.5">
            <div className="text-[10px] uppercase tracking-widest text-slate-600 mb-2">Net Balance</div>
            {round.players.map((p) => {
              const bal = summary.holeByHole!.balance[p.id] ?? 0;
              return (
                <div key={p.id} className="flex justify-between text-sm">
                  <span className="text-slate-400">{p.name}</span>
                  <span className={`font-bold ${bal > 0 ? "text-emerald-400" : bal < 0 ? "text-red-400" : "text-slate-600"}`}>
                    {moneySign(bal)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Full Match */}
      {summary.fullMatch && round.betting.enabled && (
        <div className="bg-[#111] border border-white/[0.07] rounded-xl overflow-hidden">
          <div className="px-4 py-2.5 border-b border-white/[0.07]">
            <span className="text-[10px] uppercase tracking-widest text-slate-500">
              Full Match · ${round.betting.amount}
            </span>
          </div>
          <div className="px-4 py-3 space-y-2">
            {round.players.map((p) => {
              const bal = summary.fullMatch!.balance[p.id] ?? 0;
              return (
                <div key={p.id} className="flex justify-between text-sm">
                  <span className="text-slate-400">{p.name}</span>
                  <span className={`font-bold ${bal > 0 ? "text-emerald-400" : bal < 0 ? "text-red-400" : "text-slate-600"}`}>
                    {moneySign(bal)}
                  </span>
                </div>
              );
            })}
          </div>
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
    <div className="grid grid-cols-5 gap-2 mt-3">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => {
        const isSelected = selected === n;
        const label = scoreLabel(n, hole.par);
        return (
          <button
            key={n}
            onClick={() => onSelect(n)}
            className={`flex flex-col items-center justify-center h-14 rounded-xl font-bold transition-all active:scale-90 ${
              isSelected
                ? "bg-emerald-500/20 ring-1 ring-emerald-400 scale-[1.06]"
                : "bg-white/[0.04] hover:bg-white/[0.08]"
            }`}
          >
            <span
              className={`w-8 h-8 inline-flex items-center justify-center text-sm font-bold text-white ${
                !isSelected ? scoreRing(n, hole.par) : ""
              }`}
            >
              {n}
            </span>
            {isSelected && (
              <span className="text-[8px] font-semibold tracking-wide leading-none text-emerald-400/70 uppercase">
                {label}
              </span>
            )}
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
      <div className="bg-[#0d0d0d] border border-white/[0.05] rounded-xl overflow-hidden" style={{ minWidth: 380 }}>
        <div className="flex border-b border-white/[0.06]">
          <div className="w-20 shrink-0 px-2 py-2 text-[9px] uppercase tracking-widest text-slate-700 font-semibold">HOLE</div>
          {holes.map((h) => (
            <div key={h.number} className={`flex-1 text-center py-2 text-[11px] font-bold ${h.number === current ? "text-white bg-white/[0.07]" : "text-slate-600"}`}>
              {h.number}
            </div>
          ))}
          <div className="w-10 shrink-0 text-center py-2 text-[10px] font-semibold text-slate-600">{segLabel}</div>
        </div>

        <div className="flex border-b border-white/[0.04]">
          <div className="w-20 shrink-0 px-2 py-1 text-[9px] uppercase tracking-widest text-slate-800 font-semibold">HCP</div>
          {holes.map((h) => (
            <div key={h.number} className={`flex-1 text-center py-1 text-[9px] text-slate-800 ${h.number === current ? "bg-white/[0.07]" : ""}`}>
              {h.strokeIndex}
            </div>
          ))}
          <div className="w-10 shrink-0" />
        </div>

        <div className="flex border-b border-white/[0.06]">
          <div className="w-20 shrink-0 px-2 py-1.5 text-[9px] uppercase tracking-widest text-slate-600 font-semibold">PAR</div>
          {holes.map((h) => (
            <div key={h.number} className={`flex-1 text-center py-1.5 text-[10px] font-semibold text-slate-600 ${h.number === current ? "bg-white/[0.07]" : ""}`}>
              {h.par}
            </div>
          ))}
          <div className="w-10 shrink-0 text-center py-1.5 text-[10px] font-bold text-slate-500">{segPar}</div>
        </div>

        {round.players.map((player, pi) => {
          const segTotal = holes.reduce((s, h) => {
            const r = round.holeResults.find((r) => r.holeNumber === h.number);
            return s + (r?.grossScores[player.id] ?? 0);
          }, 0);
          return (
            <div key={player.id} className={`flex ${pi < round.players.length - 1 ? "border-b border-white/[0.04]" : ""}`}>
              <div className="w-20 shrink-0 px-2 py-2 text-[10px] text-slate-400 font-semibold truncate">
                {player.name.slice(0, 8) || `P${pi + 1}`}
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

// ─── Scorecard edit modal ─────────────────────────────────────────────────────

function ScoreEditModal({
  holeNumber,
  par,
  player,
  currentScore,
  onSave,
  onClose,
}: {
  holeNumber: number;
  par: number;
  player: ActiveRound["players"][0];
  currentScore: number | undefined;
  onSave: (score: number) => void;
  onClose: () => void;
}) {
  const [selected, setSelected] = useState<number | null>(currentScore ?? null);
  const ref = useRef<HTMLDivElement>(null);

  // Close on backdrop tap
  function handleBackdrop(e: React.MouseEvent) {
    if (ref.current && !ref.current.contains(e.target as Node)) onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm pb-[env(safe-area-inset-bottom,0px)]"
      onClick={handleBackdrop}
    >
      <div ref={ref} className="w-full max-w-md bg-[#0e1a2e] border border-white/[0.1] rounded-t-3xl px-5 pt-5 pb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-base font-bold">Hole {holeNumber} · {player.name}</div>
            <div className="text-slate-500 text-xs mt-0.5">Par {par} — tap to change score</div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-white/[0.07] text-slate-400"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div className="grid grid-cols-5 gap-2 mb-4">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
            <button
              key={n}
              onClick={() => setSelected(n)}
              className={`flex flex-col items-center justify-center h-14 rounded-xl font-bold transition active:scale-90 ${
                selected === n
                  ? "bg-emerald-500/20 ring-1 ring-emerald-400 scale-[1.06]"
                  : "bg-white/[0.05] hover:bg-white/[0.09]"
              }`}
            >
              <span className={`w-8 h-8 inline-flex items-center justify-center text-sm font-bold text-white ${
                selected !== n ? scoreRing(n, par) : ""
              }`}>{n}</span>
              {selected === n && (
                <span className="text-[8px] font-semibold tracking-wide leading-none text-emerald-400/70 uppercase">
                  {scoreLabel(n, par)}
                </span>
              )}
            </button>
          ))}
        </div>
        <button
          onClick={() => { if (selected !== null) { onSave(selected); onClose(); } }}
          disabled={selected === null}
          className={`w-full py-3.5 rounded-2xl font-bold text-sm transition ${
            selected !== null
              ? "bg-emerald-500 text-black hover:bg-emerald-400"
              : "bg-white/[0.04] text-slate-600 cursor-not-allowed"
          }`}
        >
          Save Score
        </button>
      </div>
    </div>
  );
}

// ─── Scorecard tab ────────────────────────────────────────────────────────────

function ScorecardView({ round }: { round: ActiveRound }) {
  const { setHolePar, setHoleStrokeIndex, editHoleScore } = useMatchStore();
  const [seg, setSeg] = useState<"front" | "back">("front");
  const [editCell, setEditCell] = useState<{ holeNumber: number; playerId: PlayerId } | null>(null);

  // Auto-switch to the back 9 once we're past hole 9
  useEffect(() => {
    if (round.currentHole > 9) setSeg("back");
  }, [round.currentHole]);

  const holes = round.courseHoles.filter((h) => (seg === "front" ? h.number <= 9 : h.number >= 10));
  const segPar = holes.reduce((s, h) => s + h.par, 0);
  const segLabel = seg === "front" ? "OUT" : "IN";

  const editPlayer = editCell ? round.players.find((p) => p.id === editCell.playerId) : null;
  const editHole = editCell ? round.courseHoles.find((h) => h.number === editCell.holeNumber) : null;
  const editResult = editCell ? round.holeResults.find((r) => r.holeNumber === editCell.holeNumber) : null;

  function cyclePar(holeNumber: number, currentPar: number) {
    const next = currentPar === 3 ? 4 : currentPar === 4 ? 5 : 3;
    setHolePar(holeNumber, next);
  }

  function cycleStrokeIndex(holeNumber: number, currentSI: number) {
    const next = currentSI >= 18 ? 1 : currentSI + 1;
    setHoleStrokeIndex(holeNumber, next);
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Segment toggle */}
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

      <div className="mx-3 mb-1 shrink-0">
        <p className="text-[10px] text-slate-700 text-center">Tap Par or HCP to edit · Tap a score to correct it</p>
      </div>

      <div className="flex-1 overflow-x-auto overflow-y-auto px-3 pb-[env(safe-area-inset-bottom,16px)]">
        {/* Traditional scorecard grid */}
        <div className="rounded-xl overflow-hidden border border-white/[0.08]" style={{ minWidth: 380 }}>

          {/* HOLE row — dark green header */}
          <div className="flex bg-emerald-950/80 border-b border-white/[0.06]">
            <div className="w-[72px] shrink-0 px-2.5 py-2 text-[9px] uppercase tracking-widest text-emerald-700 font-bold">HOLE</div>
            {holes.map((h) => (
              <div key={h.number} className={`flex-1 text-center py-2 text-xs font-black ${
                h.number === round.currentHole ? "text-emerald-400" : "text-emerald-600/80"
              }`}>
                {h.number}
              </div>
            ))}
            <div className="w-12 shrink-0 text-center py-2 text-[10px] font-bold text-emerald-700">{segLabel}</div>
          </div>

          {/* HCP row — tappable to cycle */}
          <div className="flex bg-white/[0.015] border-b border-white/[0.04]">
            <div className="w-[72px] shrink-0 px-2.5 py-1.5 text-[9px] uppercase tracking-widest text-slate-700 font-semibold">HCP</div>
            {holes.map((h) => (
              <button
                key={h.number}
                onClick={() => cycleStrokeIndex(h.number, h.strokeIndex)}
                className="flex-1 text-center py-1.5 text-[10px] text-slate-600 hover:text-slate-400 transition"
              >
                {h.strokeIndex}
              </button>
            ))}
            <div className="w-12 shrink-0" />
          </div>

          {/* PAR row — tappable to cycle 3/4/5 */}
          <div className="flex bg-emerald-950/30 border-b border-white/[0.08]">
            <div className="w-[72px] shrink-0 px-2.5 py-2 text-[9px] uppercase tracking-widest text-slate-500 font-semibold">PAR</div>
            {holes.map((h) => (
              <button
                key={h.number}
                onClick={() => cyclePar(h.number, h.par)}
                className="flex-1 text-center py-2 text-xs font-bold text-slate-400 hover:text-emerald-400 transition"
              >
                {h.par}
              </button>
            ))}
            <div className="w-12 shrink-0 text-center py-2 text-xs font-bold text-slate-300">{segPar}</div>
          </div>

          {/* Player score rows */}
          {round.players.map((player, pi) => {
            const segResults = round.holeResults.filter((r) =>
              holes.some((h) => h.number === r.holeNumber)
            );
            const total = segResults.reduce((s, r) => s + (r.grossScores[player.id] ?? 0), 0);
            const parPlayed = segResults.reduce((s, r) => s + r.par, 0);
            const toPar = total > 0 ? total - parPlayed : null;

            return (
              <div
                key={player.id}
                className={`flex ${pi < round.players.length - 1 ? "border-b border-white/[0.05]" : ""}`}
              >
                {/* Player name */}
                <div className="w-[72px] shrink-0 px-2.5 py-3 text-[11px] font-bold text-slate-200 truncate leading-tight flex items-center">
                  {player.name}
                </div>

                {/* Score cells */}
                {holes.map((h) => {
                  const result = round.holeResults.find((r) => r.holeNumber === h.number);
                  const score = result?.grossScores[player.id];
                  const isEditable = score !== undefined;
                  return (
                    <div key={h.number} className="flex-1 flex items-center justify-center py-2">
                      {isEditable ? (
                        <button
                          onClick={() => setEditCell({ holeNumber: h.number, playerId: player.id })}
                          className={`inline-flex items-center justify-center w-7 h-7 text-xs font-bold rounded transition active:scale-90 ${scoreStyle(score, h.par)}`}
                        >
                          {score}
                        </button>
                      ) : (
                        <span className="text-slate-800 text-sm leading-none">·</span>
                      )}
                    </div>
                  );
                })}

                {/* Segment total */}
                <div className="w-12 shrink-0 flex flex-col items-center justify-center py-2 gap-0.5">
                  {total > 0 ? (
                    <>
                      <span className="text-xs font-bold text-white">{total}</span>
                      {toPar !== null && (
                        <span className={`text-[9px] font-semibold ${toPar < 0 ? "text-sky-400" : toPar === 0 ? "text-slate-600" : "text-orange-400"}`}>
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

        {/* Overall totals strip */}
        {round.holeResults.length > 0 && (
          <div className="mt-2 rounded-xl border border-white/[0.07] overflow-hidden">
            <div className="flex bg-white/[0.03] border-b border-white/[0.06] px-3 py-1.5">
              <span className="text-[9px] uppercase tracking-widest text-slate-600 font-semibold">Total thru {round.holeResults.length}</span>
            </div>
            {round.players.map((player) => {
              const gross = round.holeResults.reduce((s, r) => s + (r.grossScores[player.id] ?? 0), 0);
              const parTotal = round.holeResults.reduce((s, r) => s + r.par, 0);
              const toPar = gross - parTotal;
              return (
                <div key={player.id} className="flex items-center justify-between px-3 py-2 border-b border-white/[0.04] last:border-0">
                  <span className="text-xs font-semibold text-slate-300">{player.name}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-500">{gross} strokes</span>
                    <span className={`text-sm font-black tabular-nums ${toPar < 0 ? "text-sky-400" : toPar === 0 ? "text-white" : "text-orange-400"}`}>
                      {toPar === 0 ? "E" : toPar > 0 ? `+${toPar}` : toPar}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Score edit modal */}
      {editCell && editPlayer && editHole && (
        <ScoreEditModal
          holeNumber={editCell.holeNumber}
          par={editHole.par}
          player={editPlayer}
          currentScore={editResult?.grossScores[editCell.playerId]}
          onSave={(score) => editHoleScore(editCell.holeNumber, editCell.playerId, score)}
          onClose={() => setEditCell(null)}
        />
      )}
    </div>
  );
}

// ─── Live Betting Panel ───────────────────────────────────────────────────────

function MatchStatusBadge({ mp, players }: { mp: MatchPlaySummary; players: ActiveRound["players"] }) {
  const leader = players.find((p) => p.id === mp.leaderId);
  if (!leader) {
    return <span className="text-slate-400 font-semibold">All Square</span>;
  }
  return (
    <span>
      <span className="text-emerald-400 font-bold">{leader.name}</span>
      <span className="text-slate-400 font-medium"> {mp.status}</span>
    </span>
  );
}

function LiveBettingPanel({
  round,
  summary,
}: {
  round: ActiveRound;
  summary: RoundSummary;
}) {
  const { addNassauPress } = useMatchStore();
  if (!round.betting.enabled) return null;

  const { betting, players, game } = round;
  const isSkins = game.bettingMode === BettingMode.Skins;

  // ── Skins ──────────────────────────────────────────────────────────────────
  if (isSkins && summary.skins) {
    const { skins } = summary;
    const pot = skins.currentCarryValue;
    return (
      <div className="mx-4 bg-[#0a0f1a] border border-white/[0.07] rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.06]">
          <span className="text-[10px] uppercase tracking-widest text-slate-500">Skins · ${betting.skinValue}/skin</span>
          {pot > 0 && (
            <span className="text-xs font-semibold text-amber-400">Pot ${pot}</span>
          )}
        </div>
        <div className="grid grid-cols-2 divide-x divide-white/[0.06]">
          {players.map((p) => (
            <div key={p.id} className="px-4 py-3 text-center">
              <div className="text-[10px] text-slate-600 truncate">{p.name}</div>
              <div className="text-lg font-black text-emerald-400 mt-0.5">
                {skins.skinsWon[p.id] ?? 0}
              </div>
              <div className="text-[10px] text-slate-600">${skins.moneyWon[p.id] ?? 0}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── Nassau ─────────────────────────────────────────────────────────────────
  if (summary.nassau) {
    const { nassau } = summary;
    const canPress =
      !round.isComplete &&
      players.length === 2 &&
      !round.nassauPresses.some((p) => p.startHole === round.currentHole);

    return (
      <div className="mx-4 bg-[#0a0f1a] border border-white/[0.07] rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.06]">
          <span className="text-[10px] uppercase tracking-widest text-slate-500">
            Nassau · ${betting.amount}/seg
          </span>
          {canPress && (
            <button
              onClick={addNassauPress}
              className="text-xs font-semibold text-amber-400 hover:text-amber-300 bg-amber-400/10 px-2 py-0.5 rounded transition"
            >
              Press +
            </button>
          )}
        </div>

        {/* Segment rows */}
        <div className="divide-y divide-white/[0.05]">
          {(["front", "back", "overall"] as const).map((seg) => {
            const mp = nassau[seg];
            const label = seg === "front" ? "Front" : seg === "back" ? "Back" : "Overall";
            const holesLabel =
              seg === "front"
                ? `${Math.min(round.holeResults.length, 9)}/9`
                : seg === "back"
                ? `${Math.max(0, round.holeResults.length - 9)}/9`
                : `${round.holeResults.length}/18`;
            return (
              <div key={seg} className="flex items-center justify-between px-4 py-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 text-xs w-12">{label}</span>
                  <span className="text-slate-700 text-[10px]">{holesLabel}</span>
                </div>
                <MatchStatusBadge mp={mp} players={players} />
              </div>
            );
          })}

          {/* Active presses */}
          {nassau.presses.map((press, i) => (
            <div key={press.id} className="flex items-center justify-between px-4 py-2 bg-amber-400/[0.03]">
              <div className="flex items-center gap-2">
                <span className="text-amber-400/70 text-xs w-12">Press {i + 1}</span>
                <span className="text-slate-700 text-[10px]">H{press.startHole}+</span>
              </div>
              <MatchStatusBadge mp={press.match} players={players} />
            </div>
          ))}
        </div>

        {/* Running balance */}
        {round.holeResults.length > 0 && (
          <div className="flex px-4 py-2.5 border-t border-white/[0.06] gap-3">
            {players.map((p) => {
              const bal = nassau.balance[p.id] ?? 0;
              return (
                <div key={p.id} className="flex items-center gap-1.5 text-xs">
                  <span className="text-slate-600 truncate max-w-[60px]">{p.name}</span>
                  <span className={`font-bold ${bal > 0 ? "text-emerald-400" : bal < 0 ? "text-red-400" : "text-slate-600"}`}>
                    {moneySign(bal)}
                  </span>
                </div>
              );
            })}
            <span className="text-slate-700 text-[10px] ml-auto self-center">est.</span>
          </div>
        )}
      </div>
    );
  }

  // ── Hole-by-Hole ───────────────────────────────────────────────────────────
  if (summary.holeByHole) {
    const { holeByHole } = summary;
    return (
      <div className="mx-4 bg-[#0a0f1a] border border-white/[0.07] rounded-xl overflow-hidden">
        <div className="px-4 py-2.5 border-b border-white/[0.06]">
          <span className="text-[10px] uppercase tracking-widest text-slate-500">
            Hole by Hole · ${betting.amount}/hole · thru {round.holeResults.length}
          </span>
        </div>
        <div className="grid divide-x divide-white/[0.06]" style={{ gridTemplateColumns: `repeat(${players.length}, 1fr)` }}>
          {players.map((p) => {
            const bal = holeByHole.balance[p.id] ?? 0;
            return (
              <div key={p.id} className="px-3 py-3 text-center">
                <div className="text-[10px] text-slate-600 truncate">{p.name}</div>
                <div className={`text-lg font-black mt-0.5 ${bal > 0 ? "text-emerald-400" : bal < 0 ? "text-red-400" : "text-slate-600"}`}>
                  {moneySign(bal)}
                </div>
              </div>
            );
          })}
        </div>
        {/* Last hole result */}
        {holeByHole.history.length > 0 && (() => {
          const last = holeByHole.history[holeByHole.history.length - 1];
          const w = players.find((p) => p.id === last.winner);
          return (
            <div className="px-4 py-2 border-t border-white/[0.05] text-xs text-slate-600">
              H{last.holeNumber}:{" "}
              <span className={w ? "text-emerald-400" : "text-slate-500"}>
                {w ? `${w.name} wins $${betting.amount}` : "Halved"}
              </span>
            </div>
          );
        })()}
      </div>
    );
  }

  // ── Full Match ─────────────────────────────────────────────────────────────
  if (summary.fullMatch) {
    const { fullMatch } = summary;
    const leader = players.find((p) => p.id === fullMatch.leaderId);

    // Show match play status for match play games, stroke lead for stroke play
    let statusLine: string;
    if (summary.matchPlay) {
      statusLine = summary.matchPlay.leaderId
        ? `${players.find((p) => p.id === summary.matchPlay!.leaderId)?.name} — ${summary.matchPlay.status}`
        : "All Square";
    } else {
      const sorted = [...summary.playerSummaries].sort((a, b) => a.netToPar - b.netToPar);
      if (sorted.length >= 2 && sorted[0].netToPar < sorted[1].netToPar) {
        const lead = sorted[0].netToPar - sorted[1].netToPar; // negative = ahead
        statusLine = `${sorted[0].name} leads by ${Math.abs(lead)}`;
      } else {
        statusLine = "All Square";
      }
    }

    return (
      <div className="mx-4 bg-[#0a0f1a] border border-white/[0.07] rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.06]">
          <span className="text-[10px] uppercase tracking-widest text-slate-500">
            Full Match · ${betting.amount}
          </span>
          <span className="text-xs text-slate-500">thru {round.holeResults.length}</span>
        </div>
        <div className="px-4 py-3 space-y-1">
          <div className="text-sm font-semibold text-slate-200">{statusLine}</div>
          {leader && (
            <div className="text-xs text-emerald-400">
              {leader.name} leads · ${betting.amount} match
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
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
  const isSolo = round.players.length === 1;

  const leaderIds = new Set<PlayerId>();
  if (summary.matchPlay?.leaderId) {
    leaderIds.add(summary.matchPlay.leaderId);
  } else if (!summary.nassau && !isSolo) {
    const sorted = [...summary.playerSummaries].sort((a, b) => a.netToPar - b.netToPar);
    if (sorted.length && sorted[0].holesPlayed > 0) leaderIds.add(sorted[0].id);
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Scrollable content */}
      <div className="flex-1 flex flex-col gap-3 px-4 pt-4 pb-2 overflow-y-auto">
        {/* Hole header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="text-4xl font-black tracking-tight leading-none">
              {round.currentHole}
              <span className="text-slate-600 text-xl font-semibold ml-1.5">/ {round.courseHoles.length}</span>
            </div>
            <div className="text-slate-500 text-xs mt-1.5 flex items-center gap-1.5">
              <span>SI {hole.strokeIndex}</span>
              {round.course.name && (
                <>
                  <span className="text-slate-700">·</span>
                  <span className="truncate max-w-[140px]">{round.course.name}</span>
                </>
              )}
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-widest text-slate-600 mb-1.5">Par</div>
            <ParSelector hole={hole} onChange={(p) => setHolePar(hole.number, p)} />
          </div>
        </div>

        {/* Mini scorecard */}
        <ScorecardStrip round={round} />

        {/* Player cards */}
        {round.players.map((player) => {
          const ps: PlayerSummary | undefined = psMap[player.id];
          const isLeader = leaderIds.has(player.id) && summary.holesPlayed > 0;

          const ph = round.playingHandicaps[player.id] ?? 0;
          const strokesThisHole =
            round.enableHandicaps && ph > 0
              ? Math.floor(ph / 18) + (hole.strokeIndex <= (ph % 18) ? 1 : 0)
              : 0;

          return (
            <div
              key={player.id}
              className={`rounded-2xl p-4 border transition ${
                isLeader
                  ? "bg-emerald-500/[0.06] border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.08)]"
                  : "bg-slate-900/60 border-slate-700/40"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm">{player.name}</span>
                  {strokesThisHole > 0 && (
                    <span className="text-sky-400 text-[10px] font-semibold bg-sky-400/10 px-1.5 py-0.5 rounded-md">
                      +{strokesThisHole}
                    </span>
                  )}
                </div>
                <div className="text-right">
                  {ps && ps.holesPlayed > 0 ? (
                    <span className={`text-2xl font-black tabular-nums ${toParColor(ps.netToPar)}`}>
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
      </div>

      {/* Submit + undo — sticky at bottom, always visible regardless of player count */}
      <div className="shrink-0 px-4 pt-2 pb-[env(safe-area-inset-bottom,10px)] space-y-1 border-t border-white/[0.05] bg-[#060d1a]">
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
    round.betting,
    round.nassauPresses ?? []
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
      {/* Tab bar */}
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
          {/* Live betting panel — sits between hole content and safe area */}
          <div className="pb-[env(safe-area-inset-bottom,12px)] pt-2 space-y-0">
            <LiveBettingPanel round={round} summary={summary} />
          </div>
        </>
      ) : (
        <ScorecardView round={round} />
      )}
    </div>
  );
}
