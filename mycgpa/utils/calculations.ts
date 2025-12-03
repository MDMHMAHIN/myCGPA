import { Semester, Course, CalculationResult } from '../types';

export const calculateSemesterStats = (semester: Semester): CalculationResult => {
  const totalCredits = semester.courses.reduce((sum, course) => sum + course.credits, 0);
  const totalPoints = semester.courses.reduce((sum, course) => sum + (course.credits * course.grade), 0);
  
  return {
    totalCredits,
    totalPoints,
    gpa: totalCredits > 0 ? totalPoints / totalCredits : 0
  };
};

export const calculateCGPA = (semesters: Semester[]): CalculationResult => {
  let totalCredits = 0;
  let totalPoints = 0;

  semesters.forEach(sem => {
    const stats = calculateSemesterStats(sem);
    totalCredits += stats.totalCredits;
    totalPoints += stats.totalPoints;
  });

  return {
    totalCredits,
    totalPoints,
    gpa: totalCredits > 0 ? totalPoints / totalCredits : 0
  };
};

export const formatGPA = (num: number): string => {
  return num.toFixed(2);
};