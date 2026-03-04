import { Course } from "../models/Course";

export interface CourseProvider {
  getCourseById(id: string): Promise<Course>;
  searchCourses(query: string): Promise<Course[]>;
}

/**
 * This is the abstraction layer.
 * You can plug your API in here later.
 */
export class MockCourseProvider implements CourseProvider {
  async getCourseById(id: string): Promise<Course> {
    return {
      id: "mock-1",
      name: "Mock Country Club",
      par: 72,
      slopeRating: 130,
      courseRating: 71.8,
      holes: [],
    };
  }

  async searchCourses(query: string): Promise<Course[]> {
    return [];
  }
}