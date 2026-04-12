"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useGameLibraryStore } from "@/store/gameLibraryStore";
import {
  ScoringFormat,
  GameplayFormat,
  MatchupFormat,
  BettingMode,
  GolfGameDefinition,
} from "@/domain/gameConfig/types";

// ─── Option selector ───────────────────────────────────────────────────────────

function OptionGroup<T extends string>({
  label,
  note,
  options,
  value,
  onChange,
}: {
  label: string;
  note?: string;
  options: { value: T; label: string; description: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="space-y-2">
      <div>
        <div className="text-[10px] uppercase tracking-widest text-slate-500">{label}</div>
        {note && <div className="text-xs text-slate-600 mt-0.5">{note}</div>}
      </div>
      <div className="space-y-2">
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`w-full text-left px-4 py-3 rounded-xl border transition ${
              value === opt.value
                ? "border-emerald-500 bg-emerald-500/10 text-white"
                : "border-white/[0.07] bg-[#111] text-slate-300 hover:border-white/20"
            }`}
          >
            <div className="font-medium text-sm">{opt.label}</div>
            <div className="text-xs text-slate-500 mt-0.5">{opt.description}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Axis options ──────────────────────────────────────────────────────────────

const SCORING_OPTIONS = [
  {
    value: ScoringFormat.StrokePlay,
    label: "Stroke Play",
    description: "Total strokes over the round — lowest score wins.",
  },
  {
    value: ScoringFormat.MatchPlay,
    label: "Match Play",
    description: "Win holes, not strokes — most holes won takes the match.",
  },
  {
    value: ScoringFormat.PointsBased,
    label: "Stableford Points",
    description: "Points per hole relative to par: Eagle=4, Birdie=3, Par=2, Bogey=1.",
  },
];

const GAMEPLAY_OPTIONS = [
  {
    value: GameplayFormat.Individual,
    label: "Individual",
    description: "Everyone plays their own ball throughout.",
  },
  {
    value: GameplayFormat.BestBall,
    label: "Best Ball",
    description: "Each player plays their own ball; the team's best score counts.",
  },
  {
    value: GameplayFormat.Scramble,
    label: "Scramble",
    description: "All players hit, best shot is selected, repeat.",
  },
  {
    value: GameplayFormat.Shamble,
    label: "Shamble",
    description: "Scramble off the tee, then each player plays their own ball in.",
  },
  {
    value: GameplayFormat.AltShot,
    label: "Alternate Shot",
    description: "Partners alternate hitting the same ball.",
  },
];

const MATCHUP_OPTIONS = [
  {
    value: MatchupFormat.H2H,
    label: "Head to Head",
    description: "Individual players compete against each other directly.",
  },
  {
    value: MatchupFormat.TeamPlay,
    label: "Team Play",
    description: "Players split into teams; team result counts.",
  },
];

const BETTING_OPTIONS = [
  {
    value: BettingMode.Standard,
    label: "Standard",
    description: "Single match or stroke play settlement at end of round.",
  },
  {
    value: BettingMode.Nassau,
    label: "Nassau",
    description: "Three separate bets: Front 9, Back 9, and Overall — each settled independently.",
  },
  {
    value: BettingMode.Skins,
    label: "Skins",
    description: "Each hole is worth a skin. Tied holes carry over — pressure builds.",
  },
];

// ─── Compatibility checker ─────────────────────────────────────────────────────

function getWarning(
  scoring: ScoringFormat,
  gameplay: GameplayFormat,
  matchup: MatchupFormat,
  betting: BettingMode
): string | null {
  if (gameplay === GameplayFormat.Scramble && matchup === MatchupFormat.H2H) {
    return "Scramble is a team format — Head to Head matchup may not make sense.";
  }
  if (gameplay === GameplayFormat.AltShot && matchup === MatchupFormat.H2H) {
    return "Alternate Shot requires teams — consider switching to Team Play.";
  }
  if (scoring === ScoringFormat.MatchPlay && betting === BettingMode.Skins) {
    return "Match Play + Skins is unusual. Skins usually works with stroke scoring per hole.";
  }
  return null;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

function generateId(): string {
  return `custom-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export default function BuildGamePage() {
  const router = useRouter();
  const { addCustomGame } = useGameLibraryStore();

  const [name, setName] = useState("");
  const [scoring, setScoring] = useState<ScoringFormat>(ScoringFormat.StrokePlay);
  const [gameplay, setGameplay] = useState<GameplayFormat>(GameplayFormat.Individual);
  const [matchup, setMatchup] = useState<MatchupFormat>(MatchupFormat.H2H);
  const [betting, setBetting] = useState<BettingMode>(BettingMode.Standard);
  const [minPlayers, setMinPlayers] = useState(2);
  const [maxPlayers, setMaxPlayers] = useState(4);

  const warning = getWarning(scoring, gameplay, matchup, betting);
  const canSave = name.trim().length > 0;

  function handleSave() {
    if (!canSave) return;

    const game: GolfGameDefinition = {
      id: generateId(),
      name: name.trim(),
      description: `Custom game: ${SCORING_OPTIONS.find(o => o.value === scoring)?.label} · ${GAMEPLAY_OPTIONS.find(o => o.value === gameplay)?.label} · ${MATCHUP_OPTIONS.find(o => o.value === matchup)?.label}`,
      scoringFormat: scoring,
      gameplayFormat: gameplay,
      matchupFormat: matchup,
      bettingMode: betting,
      minPlayers,
      maxPlayers,
      bettingEnabled: true,
      handicapEnabled: true,
      tags: ["Custom"],
    };

    addCustomGame(game);
    router.push("/games");
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 max-w-md mx-auto px-4 py-8 space-y-8">

      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="text-slate-500 hover:text-white transition text-sm"
        >
          ← Back
        </button>
        <div>
          <h1 className="text-xl font-bold">Build Custom Game</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Combine format axes to create your own game
          </p>
        </div>
      </div>

      {/* Wolf / Vegas note */}
      <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3">
        <div className="text-amber-400 text-xs font-semibold mb-1">
          Note on Wolf, Vegas &amp; Special Formats
        </div>
        <p className="text-slate-400 text-xs leading-relaxed">
          Games like Wolf (per-hole rotating captain + partner selection) and
          Vegas (combined two-digit team scores) require custom per-hole logic
          that goes beyond these axes. Use the builder here for any combination
          of standard formats — Wolf and Vegas are coming as dedicated engines.
        </p>
      </div>

      {/* Game name */}
      <div className="space-y-2">
        <div className="text-[10px] uppercase tracking-widest text-slate-500">Game Name</div>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Weekend Scramble, Charlie's Nassau..."
          className="w-full bg-[#111] border border-white/[0.07] rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500/50 transition text-sm"
        />
      </div>

      {/* Scoring format */}
      <OptionGroup
        label="Scoring Format"
        note="How holes and the round are scored"
        options={SCORING_OPTIONS}
        value={scoring}
        onChange={setScoring}
      />

      {/* Gameplay format */}
      <OptionGroup
        label="Gameplay Format"
        note="How players physically play the ball"
        options={GAMEPLAY_OPTIONS}
        value={gameplay}
        onChange={setGameplay}
      />

      {/* Matchup format */}
      <OptionGroup
        label="Matchup Format"
        note="Who competes against whom"
        options={MATCHUP_OPTIONS}
        value={matchup}
        onChange={setMatchup}
      />

      {/* Betting mode */}
      <OptionGroup
        label="Betting Structure"
        note="How the financial stakes are settled"
        options={BETTING_OPTIONS}
        value={betting}
        onChange={setBetting}
      />

      {/* Player count */}
      <div className="space-y-3">
        <div className="text-[10px] uppercase tracking-widest text-slate-500">
          Player Count
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs text-slate-400">Minimum</label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setMinPlayers(Math.max(1, minPlayers - 1))}
                className="w-9 h-9 rounded-lg bg-white/[0.06] text-slate-300 hover:bg-white/10 text-lg transition"
              >
                −
              </button>
              <span className="text-xl font-bold w-8 text-center">{minPlayers}</span>
              <button
                onClick={() => setMinPlayers(Math.min(maxPlayers, minPlayers + 1))}
                className="w-9 h-9 rounded-lg bg-white/[0.06] text-slate-300 hover:bg-white/10 text-lg transition"
              >
                +
              </button>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-slate-400">Maximum</label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setMaxPlayers(Math.max(minPlayers, maxPlayers - 1))}
                className="w-9 h-9 rounded-lg bg-white/[0.06] text-slate-300 hover:bg-white/10 text-lg transition"
              >
                −
              </button>
              <span className="text-xl font-bold w-8 text-center">{maxPlayers}</span>
              <button
                onClick={() => setMaxPlayers(Math.min(8, maxPlayers + 1))}
                className="w-9 h-9 rounded-lg bg-white/[0.06] text-slate-300 hover:bg-white/10 text-lg transition"
              >
                +
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Compatibility warning */}
      {warning && (
        <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl px-4 py-3">
          <p className="text-orange-400 text-xs">{warning}</p>
        </div>
      )}

      {/* Save */}
      <button
        onClick={handleSave}
        disabled={!canSave}
        className={`w-full py-4 rounded-xl font-bold text-base transition ${
          canSave
            ? "bg-emerald-500 text-black hover:bg-emerald-400 active:scale-[0.98]"
            : "bg-white/[0.05] text-slate-600 cursor-not-allowed"
        }`}
      >
        Save to My Games
      </button>
      {!canSave && (
        <p className="text-center text-slate-600 text-xs -mt-5">
          Enter a game name to continue
        </p>
      )}

    </div>
  );
}
