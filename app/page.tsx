"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useMatchStore, ActiveRound } from "@/store/matchStore";

// ─── Logo icon ────────────────────────────────────────────────────────────────

function LogoIcon() {
  return (
    <svg width="38" height="38" viewBox="0 0 38 38" fill="none">
      <line x1="15" y1="5" x2="15" y2="33" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M15 5 L28 11 L15 17 Z" fill="#10b981" />
      <ellipse cx="15" cy="33" rx="8" ry="2.4" fill="#10b981" fillOpacity="0.25" />
    </svg>
  );
}

// ─── Resume card ──────────────────────────────────────────────────────────────

function ResumeCard({ round }: { round: ActiveRound }) {
  const { abandonRound } = useMatchStore();
  const holesLeft = round.courseHoles.length - round.holeResults.length;

  return (
    <div
      className="rounded-2xl p-5 space-y-4 border border-emerald-500/20"
      style={{
        background: "linear-gradient(135deg, rgba(16,185,129,0.09) 0%, rgba(5,150,105,0.04) 100%)",
        boxShadow: "0 0 0 1px rgba(16,185,129,0.1) inset",
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-0.5">
          <div className="text-[10px] uppercase tracking-widest text-emerald-400 font-semibold">
            Round in Progress
          </div>
          <div className="font-bold text-sm">{round.game.name}</div>
          <div className="text-slate-500 text-xs">
            {round.players.map((p) => p.name).join(" · ")} &mdash; Hole {round.currentHole}
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className="text-2xl font-black text-white">{holesLeft}</div>
          <div className="text-slate-600 text-[10px]">holes left</div>
        </div>
      </div>

      <div className="flex gap-2">
        {round.players.map((player) => {
          const results = round.holeResults.filter((r) => player.id in r.grossScores);
          const parPlayed = results.reduce((s, r) => s + r.par, 0);
          const net = results.reduce((s, r) => s + r.netScores[player.id], 0);
          const toPar = net - parPlayed;
          return (
            <div key={player.id} className="flex-1 bg-white/[0.06] rounded-xl px-3 py-2">
              <div className="text-slate-500 text-[10px] truncate">
                {player.name || `P${player.id.slice(-1)}`}
              </div>
              <div
                className={`text-lg font-bold mt-0.5 ${
                  toPar < 0 ? "text-sky-400" : toPar === 0 ? "text-white" : "text-orange-400"
                }`}
              >
                {toPar === 0 ? "E" : toPar > 0 ? `+${toPar}` : toPar}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-3">
        <Link
          href="/round"
          className="flex-1 py-3 bg-emerald-500 text-black font-bold text-sm rounded-xl text-center active:scale-[0.98] transition-transform"
        >
          Resume Round
        </Link>
        <button
          onClick={abandonRound}
          className="px-4 py-3 text-slate-600 text-sm active:text-slate-400 transition-colors"
        >
          Abandon
        </button>
      </div>
    </div>
  );
}

// ─── Secondary nav button ─────────────────────────────────────────────────────

function NavButton({
  href,
  icon,
  title,
  subtitle,
}: {
  href: string;
  icon: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <Link href={href}>
      <div className="flex items-center gap-4 px-5 py-4 bg-white/[0.04] border border-white/[0.07] rounded-2xl active:bg-white/[0.08] transition-colors group">
        <div className="w-10 h-10 rounded-xl bg-white/[0.07] flex items-center justify-center text-xl shrink-0">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm text-white">{title}</div>
          {subtitle && (
            <p className="text-slate-500 text-xs mt-0.5 leading-snug">{subtitle}</p>
          )}
        </div>
        <svg
          className="w-4 h-4 text-slate-700 shrink-0"
          fill="none"
          viewBox="0 0 16 16"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M6 12l4-4-4-4" />
        </svg>
      </div>
    </Link>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Home() {
  const { round } = useMatchStore();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  const hasRound = mounted && round && !round.isComplete;

  return (
    <div className="max-w-md mx-auto px-5 pt-6 pb-10 space-y-6">

      {/* Hero */}
      <div className="flex flex-col items-center text-center pt-4 pb-2 space-y-5">
        <div
          className="w-[76px] h-[76px] rounded-[22px] flex items-center justify-center"
          style={{
            background: "linear-gradient(145deg, rgba(16,185,129,0.18) 0%, rgba(5,150,105,0.07) 100%)",
            boxShadow: "0 0 0 1px rgba(16,185,129,0.22) inset, 0 8px 32px rgba(16,185,129,0.18)",
          }}
        >
          <LogoIcon />
        </div>

        <div className="space-y-2">
          <h1
            className="text-[2.8rem] leading-none font-black tracking-[-0.02em]"
            style={{
              background: "linear-gradient(140deg, #ffffff 10%, #6ee7b7 52%, #ffffff 90%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            TEE2GREEN
          </h1>
          <p className="text-slate-400 text-[13px] font-medium leading-snug tracking-wide">
            The Ultimate Golf Scoring &amp; Betting Engine
          </p>
        </div>
      </div>

      {/* Resume card */}
      {hasRound && <ResumeCard round={round} />}

      {/* Primary CTA */}
      <Link href="/setup" className="block">
        <div
          className="relative w-full py-[19px] rounded-2xl text-center overflow-hidden active:scale-[0.97] transition-transform duration-100"
          style={{
            background: "linear-gradient(180deg, #4ade80 0%, #059669 100%)",
            boxShadow: [
              "0 0 0 1px rgba(255,255,255,0.2) inset",
              "0 1px 0 rgba(255,255,255,0.25) inset",
              "0 12px 40px rgba(16,185,129,0.55)",
              "0 4px 16px rgba(0,0,0,0.4)",
            ].join(", "),
          }}
        >
          <div className="absolute inset-x-0 top-0 h-[45%] bg-gradient-to-b from-white/[0.12] to-transparent pointer-events-none" />
          <span className="relative z-10 font-black text-[15px] text-black tracking-wide">
            ⛳&nbsp;&nbsp;Start New Match
          </span>
        </div>
      </Link>

      {/* Secondary nav */}
      <div className="space-y-2.5">
        <NavButton
          href="/games"
          icon="🎮"
          title="Game Library"
          subtitle="Stroke, Match, Nassau, Skins + custom formats"
        />
        <NavButton
          href="/profile"
          icon="👤"
          title="My Profile"
          subtitle="Handicap index & preferences"
        />
        <NavButton
          href="/friends"
          icon="🍺"
          title="19th Hole"
          subtitle="Friends, groups & head-to-head records"
        />
      </div>
    </div>
  );
}
