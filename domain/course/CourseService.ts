import { Course } from "../models/Course";
import { Hole } from "../models/Hole";
import { APICourse, APITee, APICourseSearchResult, RawAPICourse, RawAPITee, getTeeName } from "./types";
import { supabase } from "@/lib/supabase";

const API_KEY = process.env.NEXT_PUBLIC_GOLF_COURSE_API_KEY ?? "";
const BASE_URL = "https://api.golfcourseapi.com/v1";

// ─── Raw API normalization ────────────────────────────────────────────────────

function normalizeRawTee(raw: RawAPITee): APITee {
  return {
    teeName: raw.tee_name ?? raw.name,
    courseRating: raw.course_rating,
    slopeRating: raw.slope_rating,
    bogeyRating: raw.bogey_rating ?? 0,
    totalYards: raw.total_yards,
    totalMeters: raw.total_meters ?? 0,
    numberOfHoles: raw.number_of_holes ?? raw.holes.length,
    parTotal: raw.par_total,
    frontCourseRating: raw.front_course_rating ?? 0,
    frontSlopeRating: raw.front_slope_rating ?? 0,
    frontBogeyRating: raw.front_bogey_rating ?? 0,
    backCourseRating: raw.back_course_rating ?? 0,
    backSlopeRating: raw.back_slope_rating ?? 0,
    backBogeyRating: raw.back_bogey_rating ?? 0,
    holes: raw.holes.map((h, i) => ({
      holeNumber: i + 1,
      par: h.par,
      yardage: h.yardage,
      handicap: h.handicap,
    })),
  };
}

function normalizeRawCourse(raw: RawAPICourse): APICourse {
  const maleTees = (raw.tees.male ?? []).map(normalizeRawTee);
  const femaleTees = (raw.tees.female ?? []).map(normalizeRawTee);

  return {
    id: raw.id,
    name: raw.course_name,
    clubName: raw.club_name,
    location: {
      address: raw.location.address ?? "",
      city: raw.location.city ?? "",
      state: raw.location.state ?? "",
      country: raw.location.country ?? "",
      latitude: raw.location.latitude ?? 0,
      longitude: raw.location.longitude ?? 0,
    },
    tees: [...maleTees, ...femaleTees],
  };
}

// ─── Supabase helpers ──────────────────────────────────────────────────────────

/**
 * Look up a course in Supabase by id.
 * Returns null if not found.
 */
async function dbGetById(id: number): Promise<APICourse | null> {
  const { data, error } = await supabase
    .from("courses")
    .select("data")
    .eq("id", id)
    .single();

  if (error || !data) return null;
  return data.data as APICourse;
}

/**
 * Search Supabase courses by name (case-insensitive partial match).
 * Returns lightweight results matching APICourseSearchResult.
 */
async function dbSearch(query: string): Promise<APICourseSearchResult[]> {
  const { data, error } = await supabase
    .from("courses")
    .select("id, name, city, state")
    .ilike("name", `%${query}%`)
    .limit(20);

  if (error || !data) return [];
  return data.map((row) => ({
    id: row.id,
    name: row.name,
    city: row.city ?? undefined,
    state: row.state ?? undefined,
  }));
}

/**
 * Write a full APICourse object to Supabase.
 * Uses upsert so re-fetching a known course just refreshes it.
 */
async function dbUpsert(course: APICourse): Promise<void> {
  await supabase.from("courses").upsert({
    id: course.id,
    name: course.name,
    city: course.location.city,
    state: course.location.state,
    data: course,
    cached_at: new Date().toISOString(),
  });
}

// ─── localStorage fallback (fast client-side layer) ───────────────────────────

const LOCAL_TTL_MS = 90 * 24 * 60 * 60 * 1000; // 90 days

interface CachedEntry<T> {
  data: T;
  cachedAt: number;
}

function localSet<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify({ data, cachedAt: Date.now() }));
  } catch {}
}

function localGet<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const entry: CachedEntry<T> = JSON.parse(raw);
    if (Date.now() - entry.cachedAt > LOCAL_TTL_MS) {
      localStorage.removeItem(key);
      return null;
    }
    return entry.data;
  } catch {
    return null;
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Search courses by name.
 * Checks Supabase first (zero API cost). Falls back to the external API
 * only when Supabase returns no results for this query.
 */
export async function searchCourses(
  query: string
): Promise<APICourseSearchResult[]> {
  if (!query.trim()) return [];

  // 1. Try Supabase
  const dbResults = await dbSearch(query);
  if (dbResults.length > 0) return dbResults;

  // 2. Fall back to external API
  const url = `${BASE_URL}/courses/search?search_query=${encodeURIComponent(query.trim())}`;
  const res = await fetch(url, {
    headers: { Authorization: `Key ${API_KEY}` },
  });

  if (!res.ok) throw new Error(`Course search failed: ${res.status}`);
  const data = await res.json();
  return Array.isArray(data) ? data : (data.courses ?? []);
}

/**
 * Fetch a full course by ID including all tees and hole data.
 * Priority: localStorage → Supabase → external API.
 * API results are written to both Supabase and localStorage automatically.
 */
export async function getCourseById(id: number): Promise<APICourse> {
  // 1. localStorage (fastest — avoids any network round-trip)
  const localKey = `course-v2-${id}`;
  const local = localGet<APICourse>(localKey);
  if (local) return local;

  // 2. Supabase (shared DB — free, no API quota)
  const dbCourse = await dbGetById(id);
  if (dbCourse) {
    localSet(localKey, dbCourse);
    return dbCourse;
  }

  // 3. External API (last resort — burns quota)
  const url = `${BASE_URL}/courses/${id}`;
  const res = await fetch(url, {
    headers: { Authorization: `Key ${API_KEY}` },
  });

  if (!res.ok) throw new Error(`Course fetch failed: ${res.status}`);
  const raw: RawAPICourse = await res.json();
  const data = normalizeRawCourse(raw);

  // Write to Supabase so future lookups are free
  await dbUpsert(data);
  localSet(localKey, data);

  return data;
}

// ─── Adapter ──────────────────────────────────────────────────────────────────

/**
 * Convert an API course + selected tee into the internal Course type
 * used by the scoring engine.
 */
export function adaptCourseForRound(apiCourse: APICourse, tee: APITee): Course {
  const teeName = getTeeName(tee);

  const holes: Hole[] = tee.holes.map((h) => ({
    number: h.holeNumber,
    par: h.par,
    strokeIndex: h.handicap,
  }));

  return {
    id: String(apiCourse.id),
    name: `${apiCourse.name} — ${teeName}`,
    par: tee.parTotal,
    slopeRating: tee.slopeRating,
    courseRating: tee.courseRating,
    holes,
  };
}
