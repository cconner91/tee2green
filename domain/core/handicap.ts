export function calculateCourseHandicap(
  handicapIndex: number,
  slopeRating: number,
  courseRating: number,
  par: number
): number {
  const raw = handicapIndex * (slopeRating / 113) + (courseRating - par);
  return Math.round(raw);
}
export function calculatePlayingHandicap(
  courseHandicap: number,
  allowancePercent: number = 1
): number {
  return Math.round(courseHandicap * allowancePercent);
}