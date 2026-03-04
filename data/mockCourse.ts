import { Course } from "../domain/models/Course";
import { Hole } from "../domain/models/Hole";

function generateHoles(): Hole[] {
  const holes: Hole[] = [];

  for (let i = 1; i <= 18; i++) {
    holes.push({
      number: i,
      par: i % 5 === 0 ? 5 : 4, // simple variation
      strokeIndex: i, // 1–18 difficulty ranking
    });
  }

  return holes;
}

export const mockCourse: Course = {
  id: "mock-course-1",
  name: "Tee2Green Test Course",
  par: 72,
  slopeRating: 130,
  courseRating: 72,
  holes: generateHoles(),
};