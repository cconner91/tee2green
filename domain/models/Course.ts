import { Hole } from "./Hole";

export interface Course {
  id: string;
  name: string;
  par: number;
  slopeRating: number;
  courseRating: number;
  holes: Hole[];
}