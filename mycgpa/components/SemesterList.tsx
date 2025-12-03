// Developed by MHMAHIN
import React, { useState } from 'react';
import { Semester, Course } from '../types';
import { calculateSemesterStats, formatGPA } from '../utils/calculations';
import { ChevronDown, ChevronRight, Plus, Trash2, Edit2, Save } from 'lucide-react';

interface SemesterListProps {
  semesters: Semester[];
  onUpdateSemester: (updatedSemester: Semester) => void;
  onDeleteSemester: (id: string) => void;
}

const SemesterList: React.FC<SemesterListProps> = ({ semesters, onUpdateSemester, onDeleteSemester }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingCourse, setEditingCourse] = useState<{semId: string, course: Course} | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const addCourse = (semesterId: string) => {
    const semester = semesters.find(s => s.id === semesterId);
    if (!semester) return;

    const newCourse: Course = {
      id: crypto.randomUUID(),
      name: '',
      credits: 3,
      grade: 4.0
    };

    onUpdateSemester({
      ...semester,
      courses: [...semester.courses, newCourse]
    });
    setExpandedId(semesterId); // Ensure it's open
    setEditingCourse({ semId: semesterId, course: newCourse });
  };

  const updateCourse = (semesterId: string, course: Course) => {
    const semester = semesters.find(s => s.id === semesterId);
    if (!semester) return;
    
    // If name is empty, provide a default
    const courseToSave = { ...course, name: course.name.trim() || 'New Course' };

    const updatedCourses = semester.courses.map(c => c.id === course.id ? courseToSave : c);
    onUpdateSemester({ ...semester, courses: updatedCourses });
  };

  const removeCourse = (semesterId: string, courseId: string) => {
    const semester = semesters.find(s => s.id === semesterId);
    if (!semester) return;

    onUpdateSemester({
      ...semester,
      courses: semester.courses.filter(c => c.id !== courseId)
    });
  };

  const handleDeleteClick = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    // Directly call onDeleteSemester without setTimeout to ensure window.confirm works reliably
    onDeleteSemester(id);
  };

  return (
    <div className="space-y-4">
      {semesters.map((semester) => {
        const stats = calculateSemesterStats(semester);
        const isExpanded = expandedId === semester.id;

        return (
          <div key={semester.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div 
              className="p-4 flex items-center justify-between cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
              onClick={() => toggleExpand(semester.id)}
            >
              <div className="flex items-center gap-3">
                {isExpanded ? <ChevronDown className="w-5 h-5 text-gray-500"/> : <ChevronRight className="w-5 h-5 text-gray-500"/>}
                <div>
                  <h3 className="font-semibold text-gray-900">{semester.name}</h3>
                  <p className="text-xs text-gray-500">{semester.courses.length} courses</p>
                </div>
              </div>
              <div className="text-right">
                <span className={`text-lg font-bold ${stats.gpa >= 3.5 ? 'text-emerald-600' : 'text-indigo-600'}`}>
                  {formatGPA(stats.gpa)}
                </span>
                <p className="text-xs text-gray-500">GPA</p>
              </div>
            </div>

            {isExpanded && (
              <div className="p-4 border-t border-gray-200">
                <div className="space-y-4">
                  {semester.courses.length === 0 && (
                    <p className="text-center text-sm text-gray-400 py-2">No courses added yet.</p>
                  )}
                  
                  {semester.courses.map((course) => (
                    <div key={course.id} className="bg-white border border-gray-100 rounded-md shadow-sm p-3">
                       {editingCourse?.course.id === course.id ? (
                         <div className="flex flex-col gap-4 animate-fade-in">
                            {/* Course Name Field */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                                    Course Name
                                </label>
                                <input 
                                  className="w-full p-3 border border-gray-300 rounded-lg text-base bg-white text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                                  value={editingCourse.course.name}
                                  placeholder="e.g. Calculus I"
                                  autoFocus
                                  onChange={(e) => setEditingCourse({
                                    ...editingCourse, 
                                    course: { ...editingCourse.course, name: e.target.value }
                                  })}
                                />
                            </div>

                            {/* Credits Field */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                                    Credits
                                </label>
                                <input 
                                  type="number"
                                  className="w-full p-3 border border-gray-300 rounded-lg text-base bg-white text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                                  value={editingCourse.course.credits}
                                  placeholder="3"
                                  onChange={(e) => setEditingCourse({
                                    ...editingCourse, 
                                    course: { ...editingCourse.course, credits: parseFloat(e.target.value) || 0 }
                                  })}
                                />
                            </div>

                            {/* Grade Field */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                                    Grade
                                </label>
                                <input 
                                  type="number"
                                  step="0.01"
                                  className="w-full p-3 border border-gray-300 rounded-lg text-base bg-white text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                                  value={editingCourse.course.grade}
                                  placeholder="4.0"
                                  onChange={(e) => setEditingCourse({
                                    ...editingCourse, 
                                    course: { ...editingCourse.course, grade: parseFloat(e.target.value) || 0 }
                                  })}
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-2">
                              <button 
                                onClick={() => {
                                  updateCourse(semester.id, editingCourse.course);
                                  setEditingCourse(null);
                                }}
                                className="w-full sm:w-auto px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg shadow-sm hover:bg-indigo-700 flex items-center justify-center gap-2"
                              >
                                <Save className="w-4 h-4" />
                                Save Course
                              </button>
                            </div>
                         </div>
                       ) : (
                         <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <p className="font-semibold text-gray-900 text-base">{course.name || 'Untitled Course'}</p>
                              <div className="flex items-center gap-2 mt-1 flex-wrap">
                                  <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                                    {course.credits} Credits
                                  </span>
                                  <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                                    Grade: {course.grade.toFixed(2)}
                                  </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                               <button 
                                  onClick={() => setEditingCourse({ semId: semester.id, course })}
                                  className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"
                                >
                                  <Edit2 className="w-5 h-5" />
                                </button>
                               <button 
                                  onClick={() => removeCourse(semester.id, course.id)}
                                  className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                                >
                                  <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                         </div>
                       )}
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-3 pt-4 border-t border-gray-100">
                   <button 
                    type="button"
                    onClick={(e) => handleDeleteClick(e, semester.id)}
                    className="w-full sm:w-auto px-4 py-2 text-sm text-red-600 bg-red-50 border border-red-100 hover:bg-red-100 hover:border-red-200 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Semester
                  </button>

                  <button 
                    onClick={() => addCourse(semester.id)}
                    className="w-full sm:w-auto px-4 py-2 bg-indigo-50 text-indigo-700 border border-indigo-100 hover:bg-indigo-100 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Course
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default SemesterList;