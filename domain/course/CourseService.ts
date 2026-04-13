import { Course } from "../models/Course";
import { Hole } from "../models/Hole";
import { APICourse, APITee, APICourseSearchResult, getTeeName } from "./types";

const API_KEY = process.env.NEXT_PUBLIC_GOLF_COURSE_API_KEY ?? "";
const BASE_URL = "https://api.golfcourseapi.com/v1";

// ─── Cache helpers ─────────────────────────────────────────────────────────────
// We cache full course objects in localStorage so we don't burn API quota
// on repeat lookups for the same course during a session.

const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 1 week

interface CachedEntry<T> {
  data: T;
  cachedAt: number;
}

function cacheSet<T>(key: string, data: T): void {
  try {
    const entry: CachedEntry<T> = { data, cachedAt: Date.now() };
    localStorage.setItem(key, JSON.stringify(entry));
  } catch {
    // localStorage may be unavailable (SSR, private mode quota exceeded)
  }
}

function cacheGet<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const entry: CachedEntry<T> = JSON.parse(raw);
    if (Date.now() - entry.cachedAt > CACHE_TTL_MS) {
      localStorage.removeItem(key);
      return null;
    }
    return entry.data;
  } catch {
    return null;
  }
}

// ─── API calls ────────────────────────────────────────────────────────────────

/**
 * Search courses by name. Returns lightweight results (no tee/hole data).
 * Results are NOT cached — search queries are cheap and vary too much.
 */
export async function searchCourses(
  query: string
): Promise<APICourseSearchResult[]> {
  if (!query.trim()) return [];

  const url = `${BASE_URL}/courses/search?search_query=${encodeURIComponent(query.trim())}`;
  const res = await fetch(url, {
    headers: { Authorization: `Key ${API_KEY}` },
  });

  if (!res.ok) {
    throw new Error(`Course search failed: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  // API returns { courses: [...] } or just [...]
  return Array.isArray(data) ? data : (data.courses ?? []);
}

/**
 * Fetch a single course by ID including all tees and hole data.
 * Cached in localStorage for 1 week.
 */
export async function getCourseById(id: number): Promise<APICourse> {
  const cacheKey = `course-v1-${id}`;
  const cached = cacheGet<APICourse>(cacheKey);
  if (cached) return cached;

  const url = `${BASE_URL}/courses/${id}`;
  const res = await fetch(url, {
    headers: { Authorization: `Key ${API_KEY}` },
  });

  if (!res.ok) {
    throw new Error(`Course fetch failed: ${res.status} ${res.statusText}`);
  }

  const data: APICourse = await res.json();
  cacheSet(cacheKey, data);
  return data;
}

// ─── Adapter ──────────────────────────────────────────────────────────────────

/**
 * Convert an API course + selected tee into the internal Course type
 * used by the scoring engine. All scoring logic reads from this shape.
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
