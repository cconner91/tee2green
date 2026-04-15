"use client";

import { useState } from "react";
import { normalizeRawCourse, dbUpsert } from "@/domain/course/CourseService";
import { APICourse } from "@/domain/course/types";
import { RawAPICourse } from "@/domain/course/types";

// ─── JSON parsing ─────────────────────────────────────────────────────────────

function extractRawCourses(input: string): { courses: RawAPICourse[]; error?: string } {
  let json: unknown;
  try {
    json = JSON.parse(input.trim());
  } catch {
    return { courses: [], error: "Invalid JSON — check for missing brackets or quotes." };
  }

  if (!json || typeof json !== "object") return { courses: [], error: "Expected a JSON object." };
  const obj = json as Record<string, unknown>;

  // { "course": { ... } }  — detail endpoint
  if (obj.course && typeof obj.course === "object" && !Array.isArray(obj.course)) {
    return { courses: [obj.course as RawAPICourse] };
  }

  // { "courses": [ ... ] }  — search endpoint
  if (Array.isArray(obj.courses)) {
    return { courses: obj.courses as RawAPICourse[] };
  }

  // Raw course object pasted directly
  if (obj.id && obj.course_name) {
    return { courses: [obj as unknown as RawAPICourse] };
  }

  return { courses: [], error: 'Could not find a course. Paste a full API response or a raw course object.' };
}

// ─── Validation ───────────────────────────────────────────────────────────────

interface TeeWarning {
  teeName: string;
  issues: string[];
}

function validateCourse(course: APICourse): TeeWarning[] {
  return course.tees.flatMap((tee) => {
    const issues: string[] = [];
    const name = tee.teeName ?? "Unknown";

    if (tee.holes.length !== 18) {
      issues.push(`${tee.holes.length} holes (expected 18)`);
    }

    const parSum = tee.holes.reduce((s, h) => s + h.par, 0);
    if (parSum !== tee.parTotal) {
      issues.push(`Hole pars sum to ${parSum}, tee par_total is ${tee.parTotal}`);
    }

    const handicaps = tee.holes.map((h) => h.handicap).sort((a, b) => a - b);
    const expectedHcps = Array.from({ length: 18 }, (_, i) => i + 1);
    const missingHcps = expectedHcps.filter((h) => !handicaps.includes(h));
    if (missingHcps.length > 0) {
      issues.push(`Missing stroke index values: ${missingHcps.join(", ")}`);
    }

    const dupHcps = handicaps.filter((h, i) => handicaps.indexOf(h) !== i);
    if (dupHcps.length > 0) {
      issues.push(`Duplicate stroke index values: [...new Set(dupHcps)].join(", ")`);
    }

    return issues.length > 0 ? [{ teeName: name, issues }] : [];
  });
}

// ─── Preview card ─────────────────────────────────────────────────────────────

function CoursePreview({
  raw,
  normalized,
  warnings,
  status,
  onSeed,
}: {
  raw: RawAPICourse;
  normalized: APICourse;
  warnings: TeeWarning[];
  status: "idle" | "loading" | "success" | "error";
  onSeed: () => void;
}) {
  const maleTees = (raw.tees.male ?? []).map((t) => t.tee_name ?? t.name ?? "—");
  const femaleTees = (raw.tees.female ?? []).map((t) => t.tee_name ?? t.name ?? "—");

  return (
    <div className="bg-[#0c1628] border border-white/[0.08] rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-white/[0.06] flex items-start justify-between gap-4">
        <div>
          <div className="text-white font-bold text-base">{normalized.name}</div>
          <div className="text-slate-500 text-xs mt-0.5">
            ID {normalized.id} · {normalized.location.city}, {normalized.location.state}
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className="text-emerald-400 text-sm font-semibold">{normalized.tees.length} tees total</div>
          <div className="text-slate-600 text-xs">{maleTees.length}M / {femaleTees.length}F</div>
        </div>
      </div>

      {/* Tee table */}
      <div className="px-5 py-3">
        <div className="text-[10px] uppercase tracking-widest text-slate-600 mb-2">Normalized Tees</div>
        <div className="space-y-1">
          {normalized.tees.map((tee, i) => {
            const isFemale = i >= maleTees.length;
            const warn = warnings.find((w) => w.teeName === (tee.teeName ?? ""));
            return (
              <div
                key={i}
                className={`flex items-center justify-between text-xs rounded-lg px-3 py-2 ${
                  warn ? "bg-yellow-500/10 border border-yellow-500/20" : "bg-white/[0.03]"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                    isFemale ? "bg-pink-500/20 text-pink-400" : "bg-blue-500/20 text-blue-400"
                  }`}>
                    {isFemale ? "F" : "M"}
                  </span>
                  <span className="text-white font-medium">{tee.teeName ?? "—"}</span>
                  {warn && (
                    <span className="text-yellow-400 text-[10px]">⚠ {warn.issues[0]}</span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-slate-400">
                  <span>Par {tee.parTotal}</span>
                  <span>{tee.totalYards.toLocaleString()}y</span>
                  <span>CR {tee.courseRating}</span>
                  <span>Slope {tee.slopeRating}</span>
                  <span className={tee.holes.length === 18 ? "text-emerald-400" : "text-red-400"}>
                    {tee.holes.length} holes
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Warnings */}
      {warnings.length > 0 && (
        <div className="px-5 pb-3">
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl px-4 py-3 text-xs text-yellow-300 space-y-1">
            <div className="font-semibold text-yellow-400 mb-1">⚠ Data issues found — review before seeding</div>
            {warnings.map((w) =>
              w.issues.map((issue, i) => (
                <div key={`${w.teeName}-${i}`}>{w.teeName}: {issue}</div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Action */}
      <div className="px-5 pb-5 pt-2">
        {status === "success" ? (
          <div className="w-full py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-semibold text-center">
            Seeded successfully
          </div>
        ) : status === "error" ? (
          <div className="w-full py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-semibold text-center">
            Upsert failed — check console
          </div>
        ) : (
          <button
            onClick={onSeed}
            disabled={status === "loading"}
            className="w-full py-3 rounded-xl font-bold text-sm transition active:scale-[0.98] bg-emerald-500 text-black hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {status === "loading" ? "Seeding…" : `Seed to Supabase →`}
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

interface CourseEntry {
  raw: RawAPICourse;
  normalized: APICourse;
  warnings: TeeWarning[];
  status: "idle" | "loading" | "success" | "error";
}

export default function SeedPage() {
  const [input, setInput] = useState("");
  const [entries, setEntries] = useState<CourseEntry[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);

  function handleParse() {
    setParseError(null);
    setEntries([]);

    const { courses, error } = extractRawCourses(input);
    if (error) {
      setParseError(error);
      return;
    }
    if (courses.length === 0) {
      setParseError("No courses found in the pasted JSON.");
      return;
    }

    const parsed: CourseEntry[] = courses.map((raw) => {
      const normalized = normalizeRawCourse(raw);
      const warnings = validateCourse(normalized);
      return { raw, normalized, warnings, status: "idle" };
    });

    setEntries(parsed);
  }

  async function handleSeed(index: number) {
    setEntries((prev) =>
      prev.map((e, i) => (i === index ? { ...e, status: "loading" } : e))
    );
    try {
      await dbUpsert(entries[index].normalized);
      setEntries((prev) =>
        prev.map((e, i) => (i === index ? { ...e, status: "success" } : e))
      );
    } catch (err) {
      console.error("Seed failed:", err);
      setEntries((prev) =>
        prev.map((e, i) => (i === index ? { ...e, status: "error" } : e))
      );
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 text-slate-100">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold tracking-tight">Course Seeder</h1>
        <p className="text-slate-500 text-sm mt-1">
          Paste a raw Golf Course API response. Supports both the detail endpoint{" "}
          <code className="text-slate-400 text-xs bg-white/[0.06] px-1.5 py-0.5 rounded">
            {"{ \"course\": {...} }"}
          </code>{" "}
          and search endpoint{" "}
          <code className="text-slate-400 text-xs bg-white/[0.06] px-1.5 py-0.5 rounded">
            {"{ \"courses\": [...] }"}
          </code>{" "}
          formats.
        </p>
      </div>

      {/* Input */}
      <div className="mb-4">
        <textarea
          value={input}
          onChange={(e) => { setInput(e.target.value); setEntries([]); setParseError(null); }}
          placeholder='Paste API response JSON here…'
          className="w-full h-40 bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-slate-300 font-mono placeholder-slate-700 focus:outline-none focus:border-emerald-500/50 resize-none transition"
        />
      </div>

      <button
        onClick={handleParse}
        disabled={!input.trim()}
        className="w-full py-3 rounded-xl font-bold text-sm bg-white/[0.06] text-white hover:bg-white/[0.1] border border-white/[0.08] transition active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed mb-6"
      >
        Parse JSON →
      </button>

      {/* Parse error */}
      {parseError && (
        <div className="mb-6 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">
          {parseError}
        </div>
      )}

      {/* Course previews */}
      {entries.length > 0 && (
        <div className="space-y-4">
          <div className="text-sm text-slate-500">
            Found {entries.length} course{entries.length !== 1 ? "s" : ""} — review and seed individually.
          </div>
          {entries.map((entry, i) => (
            <CoursePreview
              key={entry.normalized.id}
              raw={entry.raw}
              normalized={entry.normalized}
              warnings={entry.warnings}
              status={entry.status}
              onSeed={() => handleSeed(i)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
