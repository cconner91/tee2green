"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useMatchStore, ActiveRound } from "@/store/matchStore";

function ResumeCard({ round }: { round: ActiveRound }) {
  const { abandonRound } = useMatchStore();
  const holesLeft = round.courseHoles.length - round.holeResults.length;

  return (
    <div className="bg-[#111] border border-emerald-500/20 rounded-xl p-4 space-y-4">
      <div className="flex items-start justify-between">
        <div className="space-y-0.5">
          <div className="text-[10px] uppercase tracking-widest text-emerald-500 font-semibold">
            Round in Progress
          </div>
          <div className="font-bold">{round.game.name}</div>
          <div className="text-slate-500 text-xs">
            {round.players.map((p) => p.name).join(" · ")} &mdash; Hole {round.currentHole}
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className="text-2xl font-black text-white">{holesLeft}</div>
          <div className="text-slate-600 text-[10px]">holes left</div>
        </div>
      </div>

      {/* Live scores */}
      <div className="flex gap-2">
        {round.players.map((player) => {
          const results = round.holeResults.filter((r) => player.id in r.grossScores);
          const parPlayed = results.reduce((s, r) => s + r.par, 0);
          const net = results.reduce((s, r) => s + r.netScores[player.id], 0);
          const toPar = net - parPlayed;
          return (
            <div key={player.id} className="flex-1 bg-white/[0.04] rounded-lg px-3 py-2">
              <div className="text-slate-500 text-[10px] truncate">{player.name || `P${player.id.slice(-1)}`}</div>
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

      <div className="flex items-center gap-2">
        <Link
          href="/round"
          className="flex-1 py-2.5 bg-emerald-500 text-black font-semibold text-sm rounded-lg text-center hover:bg-emerald-400 active:scale-[0.98] transition"
        >
          Resume Round
        </Link>
        <button
          onClick={abandonRound}
          className="px-4 py-2.5 text-slate-600 hover:text-slate-400 text-sm transition"
        >
          Abandon
        </button>
      </div>
    </div>
  );
}

function QuickLink({
  href,
  title,
  subtitle,
}: {
  href: string;
  title: string;
  subtitle: string;
}) {
  return (
    <Link href={href}>
      <div className="flex items-center justify-between px-4 py-3.5 bg-[#111] border border-white/[0.07] rounded-xl hover:border-white/20 transition cursor-pointer group">
        <div>
          <div className="font-medium text-sm text-slate-200 group-hover:text-white transition">
            {title}
          </div>
          <div className="text-slate-600 text-xs mt-0.5">{subtitle}</div>
        </div>
        <span className="text-slate-700 group-hover:text-slate-400 transition text-lg">›</span>
      </div>
    </Link>
  );
}

export default function Home() {
  const { round } = useMatchStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const hasRound = mounted && round && !round.isComplete;

  return (
    <div className="min-h-[calc(100vh-56px)] px-4 py-10 max-w-md mx-auto space-y-8">

      {/* Hero */}
      <div className="space-y-1 pt-2">
        <h1 className="text-3xl font-black tracking-tight">Tee2Green</h1>
        <p className="text-slate-600 text-sm">Golf Scoring &amp; Betting Engine</p>
      </div>

      {/* Resume card */}
      {hasRound && <ResumeCard round={round} />}

      {/* Primary CTA */}
      <Link href="/setup">
        <div className="bg-emerald-500 text-black font-bold py-4 rounded-xl text-center text-sm hover:bg-emerald-400 active:scale-[0.98] transition cursor-pointer shadow-lg shadow-emerald-500/10">
          {hasRound ? "Start New Round" : "Start a Round →"}
        </div>
      </Link>

      {/* Browse links */}
      <div className="space-y-2">
        <div className="text-[10px] uppercase tracking-widest text-slate-700 px-1 mb-3">
          Browse
        </div>
        <QuickLink
          href="/games"
          title="Game Library"
          subtitle="Stroke, Match, Nassau, Skins + custom formats"
        />
        <QuickLink
          href="/history"
          title="Round History"
          subtitle="Past scores and results"
        />
        <QuickLink
          href="/profile"
          title="My Profile"
          subtitle="Handicap and preferences"
        />
      </div>

    </div>
  );
}
