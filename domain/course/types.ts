// ─── Raw API response types (snake_case — as returned by api.golfcourseapi.com) ─

export interface RawAPIHole {
  par: number;
  yardage: number;
  handicap: number; // stroke index
  // Note: no holeNumber field — derived from array index
}

export interface RawAPITee {
  tee_name?: string;
  name?: string;
  course_rating: number;
  slope_rating: number;
  bogey_rating?: number;
  total_yards: number;
  total_meters?: number;
  number_of_holes?: number;
  par_total: number;
  front_course_rating?: number;
  front_slope_rating?: number;
  front_bogey_rating?: number;
  back_course_rating?: number;
  back_slope_rating?: number;
  back_bogey_rating?: number;
  holes: RawAPIHole[];
}

export interface RawAPICourse {
  id: number;
  course_name: string;
  club_name?: string;
  location: {
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    latitude?: number;
    longitude?: number;
  };
  tees: {
    male?: RawAPITee[];
    female?: RawAPITee[];
  };
}

// ─── Normalized API response types (camelCase — used internally) ──────────────
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
