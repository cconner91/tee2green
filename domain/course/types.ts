// ─── API response types ───────────────────────────────────────────────────────
// These match the shape returned by api.golfcourseapi.com

export interface APIHole {
  holeNumber: number;
  par: number;
  yardage: number;
  handicap: number; // stroke index (1 = hardest)
}

export interface APITee {
  teeName?: string;  // used by some courses
  name?: string;     // used by other courses
  courseRating: number;
  slopeRating: number;
  bogeyRating: number;
  totalYards: number;
  totalMeters: number;
  numberOfHoles: number;
  parTotal: number;
  frontCourseRating: number;
  frontSlopeRating: number;
  frontBogeyRating: number;
  backCourseRating: number;
  backSlopeRating: number;
  backBogeyRating: number;
  holes: APIHole[];
}

export interface APICourse {
  id: number;
  name: string;
  clubName?: string;
  location: {
    address: string;
    city: string;
    state: string;
    country: string;
    latitude: number;
    longitude: number;
  };
  tees: APITee[];
}

// API search result (lightweight — no tees/holes)
export interface APICourseSearchResult {
  id: number;
  name: string;
  city?: string;
  state?: string;
  country?: string;
}

// ─── Helper ───────────────────────────────────────────────────────────────────

/** Normalize tee name — API uses both `teeName` and `name` inconsistently */
export function getTeeName(tee: APITee): string {
  return tee.teeName ?? tee.name ?? "Unknown";
}
