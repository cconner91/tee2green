// ─── About Page ───────────────────────────────────────────────────────────────
// Edit the content below directly — no special syntax required.
// Sections: hero, features, how-it-works, contact.
// To add a section: copy a <Section> block and update the props/children.

export default function AboutPage() {
  return (
    <div className="max-w-md mx-auto px-5 py-10 space-y-10 text-slate-300">

      {/* ── Hero ── */}
      <div className="space-y-3 text-center">
        <h1 className="text-2xl font-black text-white">About Tee2Green</h1>
        <p className="text-slate-400 text-sm leading-relaxed">
          Tee2Green is the ultimate golf scoring and betting engine — built for
          competitive golfers who want more than a basic scorecard. Whether
          you&apos;re playing Medal Play, running a Nassau, or setting up a Wolf
          game, Tee2Green handles the scoring -- and your winnings so you can focus on your game.
        </p>
      </div>

      <hr className="border-white/[0.07]" />

      {/* ── What We Do ── */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-white uppercase tracking-widest text-[11px]">
          What We Do
        </h2>
        <p className="text-slate-400 text-sm leading-relaxed">
          Tee2Green's interactive and custom Game Library is built on 4 foundational formats.
          -Gameplay Format,
          -Matchup Format,
          -Scoring Format,
          -Betting Format.   
        </p>
        <ul className="space-y-3 text-sm text-slate-400">
          <li className="flex gap-3">
            <span className="text-emerald-400 shrink-0">⛳</span>
            <span>
              <strong className="text-white">14+ Game Formats</strong> — from
              classic Stroke Play to team scrambles and points-based formats.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="text-emerald-400 shrink-0">💰</span>
            <span>
              <strong className="text-white">Built-in Betting</strong> — Nassau,
              Skins, per-hole, and full-match structures with automatic
              settlement.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="text-emerald-400 shrink-0">🏌️</span>
            <span>
              <strong className="text-white">Handicap Engine</strong> — USGA
              course and playing handicap calculations baked in.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="text-emerald-400 shrink-0">📊</span>
            <span>
              <strong className="text-white">Live Scorecards</strong> — hole-by-
              hole scoring with real-time standings, to-par tracking, and an
              undo button for human error.
            </span>
          </li>
        </ul>
      </div>

      <hr className="border-white/[0.07]" />

      {/* ── How It Works ── */}
      <div className="space-y-4">
        <h2 className="text-[11px] font-bold text-white uppercase tracking-widest">
          How It Works
        </h2>
        <ol className="space-y-3 text-sm text-slate-400 list-none">
          {[
            ["1", "Pick your game", "Choose from 14+ formats in the Game Library or build a custom one."],
            ["2", "Set up your group", "Enter players, set handicaps, select a course and tee."],
            ["3", "Play", "Enter scores hole by hole — Tee2Green tracks standings automatically."],
            ["4", "Settle up", "View the final scorecard and betting summary when the round is complete."],
          ].map(([num, title, desc]) => (
            <li key={num} className="flex gap-3">
              <span className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-400 text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                {num}
              </span>
              <span>
                <strong className="text-white">{title}</strong> — {desc}
              </span>
            </li>
          ))}
        </ol>
      </div>

      <hr className="border-white/[0.07]" />

      {/* ── Contact / Info ── */}
      <div className="space-y-2 text-sm text-slate-500">
        <h2 className="text-[11px] font-bold text-white uppercase tracking-widest mb-3">
          Contact
        </h2>
        {/* Edit the lines below with your actual contact info */}
        <p>Questions or feedback? Reach us at <span className="text-emerald-400">hello@tee2green.app</span></p>
        <p className="text-xs text-slate-600 pt-2">
          &copy; {new Date().getFullYear()} Tee2Green. All rights reserved.
        </p>
      </div>

    </div>
  );
}
