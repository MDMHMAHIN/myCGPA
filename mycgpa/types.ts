export interface Course {
  id: string;
  name: string;
  credits: number;
  grade: number; // Grade Point (e.g., 4.0, 3.7)
}

export interface Semester {
  id: string;
  name: string;
  courses: Course[];
  isLocked?: boolean; // Optional: to prevent accidental edits
}

export interface AcademicRecord {
  semesters: Semester[];
  lastUpdated: string;
}

export interface CalculationResult {
  totalCredits: number;
  totalPoints: number;
  gpa: number;
}