export function calculateNetScore(
  grossScore: number,
  strokesReceived: number
): number {
  return grossScore - strokesReceived;
}