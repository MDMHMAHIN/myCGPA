// Developed by MHMAHIN
import React, { useState } from 'react';
import { Plus, Trash2, Target, Calculator, RefreshCw, Lock, Unlock } from 'lucide-react';
import { CalculationResult } from '../types';

interface TargetCalculatorProps {
  currentStats: CalculationResult;
}

interface PlannedCourse {
  id: string;
  name: string;
  credits: string; // Using string for easier input handling
}

const TargetCalculator: React.FC<TargetCalculatorProps> = ({ currentStats }) => {
  const [targetCGPA, setTargetCGPA] = useState<string>('');
  const [courses, setCourses] = useState<PlannedCourse[]>([
    { id: '1', name: '', credits: '3' },
    { id: '2', name: '', credits: '3' }
  ]);
  const [result, setResult] = useState<{ gpa: number, impossible: boolean } | null>(null);
  const [gradeBreakdown, setGradeBreakdown] = useState<Record<string, string>>({});
  const [lockedCourseIds, setLockedCourseIds] = useState<Set<string>>(new Set());

  const addCourse = () => {
    setCourses([...courses, { id: crypto.randomUUID(), name: '', credits: '3' }]);
    setResult(null); // Reset result on course change
    setLockedCourseIds(new Set());
  };

  const removeCourse = (id: string) => {
    setCourses(courses.filter(c => c.id !== id));
    setResult(null);
    setLockedCourseIds(new Set());
  };

  const updateCourse = (id: string, field: keyof PlannedCourse, value: string) => {
    setCourses(courses.map(c => c.id === id ? { ...c, [field]: value } : c));
    setResult(null);
    setLockedCourseIds(new Set());
  };

  const calculate = () => {
    const target = parseFloat(targetCGPA);
    if (isNaN(target)) return;

    const nextCredits = courses.reduce((sum, c) => sum + (parseFloat(c.credits) || 0), 0);
    
    // If no courses added for next semester
    if (nextCredits === 0) {
        setResult(null);
        return;
    }

    const totalFutureCredits = currentStats.totalCredits + nextCredits;
    const totalRequiredPoints = target * totalFutureCredits;
    const pointsNeeded = totalRequiredPoints - currentStats.totalPoints;
    
    let requiredGPA = pointsNeeded / nextCredits;
    
    // Check possibility (Assuming 4.0 scale)
    const impossible = requiredGPA > 4.0;
    
    setResult({
      gpa: requiredGPA,
      impossible: impossible
    });

    // Reset locks on new calculation
    setLockedCourseIds(new Set());

    // Initial breakdown: Distribute evenly
    const initialBreakdown: Record<string, string> = {};
    courses.forEach(c => {
        initialBreakdown[c.id] = requiredGPA.toFixed(2);
    });
    setGradeBreakdown(initialBreakdown);
  };

  // Helper to calculate distribution based on current locks
  const recalculateDistribution = (
    currentLocks: Set<string>, 
    currentBreakdown: Record<string, string>
  ) => {
    const target = parseFloat(targetCGPA);
    if (isNaN(target)) return currentBreakdown;

    const nextCredits = courses.reduce((sum, c) => sum + (parseFloat(c.credits) || 0), 0);
    const totalFutureCredits = currentStats.totalCredits + nextCredits;
    const totalRequiredPoints = target * totalFutureCredits;
    const totalPointsNeededForSemester = totalRequiredPoints - currentStats.totalPoints;

    // Sum up points from locked courses
    let lockedPoints = 0;
    let lockedCredits = 0;

    courses.forEach(c => {
        if (currentLocks.has(c.id)) {
            const valStr = currentBreakdown[c.id];
            const val = parseFloat(valStr);
            const grade = isNaN(val) ? 0 : val;
            const cr = parseFloat(c.credits) || 0;
            
            lockedPoints += grade * cr;
            lockedCredits += cr;
        }
    });

    // Calculate remaining stats for unlocked courses
    const remainingPointsNeeded = totalPointsNeededForSemester - lockedPoints;
    const remainingCredits = nextCredits - lockedCredits;

    let averageForOthers = 0;
    if (remainingCredits > 0) {
        averageForOthers = remainingPointsNeeded / remainingCredits;
    }

    // Create new breakdown
    const newBreakdown = { ...currentBreakdown };
    courses.forEach(c => {
        if (!currentLocks.has(c.id)) {
             if (averageForOthers < 0) {
                 newBreakdown[c.id] = "0.00"; 
            } else {
                 newBreakdown[c.id] = averageForOthers.toFixed(2);
            }
        }
    });

    return newBreakdown;
  };

  const handleGradeAdjustment = (changedCourseId: string, newValue: string) => {
    // 1. Lock the changed course
    const newLocks = new Set<string>(lockedCourseIds);
    newLocks.add(changedCourseId);
    setLockedCourseIds(newLocks);

    // 2. Update the specific value in breakdown
    const tempBreakdown = { ...gradeBreakdown, [changedCourseId]: newValue };

    // 3. Recalculate others
    const newBreakdown = recalculateDistribution(newLocks, tempBreakdown);
    
    setGradeBreakdown(newBreakdown);
  };

  const toggleLock = (courseId: string) => {
    const newLocks = new Set<string>(lockedCourseIds);
    if (newLocks.has(courseId)) {
        newLocks.delete(courseId);
        // When unlocking, we want to re-distribute cleanly across all unlocked (including this one)
        // We trigger recalculation using current breakdown but with one less lock
        const newBreakdown = recalculateDistribution(newLocks, gradeBreakdown);
        setGradeBreakdown(newBreakdown);
    } else {
        newLocks.add(courseId);
    }
    setLockedCourseIds(newLocks);
  };

  return (
     <div className="space-y-6 animate-fade-in pb-10">
        {/* Header Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
           <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-4">
             <Target className="w-6 h-6 text-indigo-600" />
             Target Planner
           </h2>
           <p className="text-sm text-gray-500 mb-6">
             Enter your desired CGPA and upcoming courses to calculate the grades you need.
           </p>
           
           <div className="mb-6">
             <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Target CGPA
             </label>
             <input 
               type="number" 
               step="0.01" 
               placeholder="e.g. 3.50"
               value={targetCGPA}
               onChange={(e) => setTargetCGPA(e.target.value)}
               className="w-full p-3 border border-gray-300 rounded-lg text-lg font-medium text-gray-900 focus:ring-2 focus:ring-indigo-500 outline-none transition-all bg-white"
             />
           </div>

           <div className="flex items-center justify-between text-sm bg-gray-50 p-4 rounded-lg border border-gray-100">
             <span className="text-gray-600">Current CGPA:</span>
             <span className="font-bold text-gray-900 text-lg">{currentStats.gpa.toFixed(2)}</span>
           </div>
        </div>

        {/* Courses Input */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
           <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-gray-900">Next Semester Courses</h3>
              <button 
                onClick={addCourse}
                className="text-sm text-indigo-600 font-medium hover:text-indigo-700 flex items-center gap-1 bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" /> Add Course
              </button>
           </div>
           
           <div className="space-y-3">
             {courses.map((course, index) => (
               <div key={course.id} className="flex gap-2 items-start">
                 <div className="flex-1">
                   <label className="block text-xs text-gray-400 mb-1">Course Name</label>
                   <input
                     placeholder={`Course ${index + 1}`}
                     value={course.name}
                     onChange={(e) => updateCourse(course.id, 'name', e.target.value)}
                     className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-indigo-500 outline-none text-gray-900"
                   />
                 </div>
                 <div className="w-24">
                    <label className="block text-xs text-gray-400 mb-1">Credits</label>
                    <input
                     type="number"
                     placeholder="3"
                     value={course.credits}
                     onChange={(e) => updateCourse(course.id, 'credits', e.target.value)}
                     className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-center focus:ring-1 focus:ring-indigo-500 outline-none text-gray-900"
                   />
                 </div>
                 <div className="pt-6">
                    <button 
                    onClick={() => removeCourse(course.id)}
                    className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                    <Trash2 className="w-5 h-5" />
                    </button>
                 </div>
               </div>
             ))}
           </div>
        </div>
        
        {/* Action */}
        <button 
          onClick={calculate}
          disabled={!targetCGPA || courses.length === 0}
          className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-95"
        >
          <Calculator className="w-5 h-5" />
          Calculate Required Grades
        </button>

        {/* Result */}
        {result && (
          <div className={`rounded-xl p-6 border shadow-sm animate-fade-in ${
            result.impossible 
                ? 'bg-red-50 border-red-100' 
                : result.gpa <= 0 
                    ? 'bg-emerald-50 border-emerald-100'
                    : 'bg-indigo-50 border-indigo-100'
          }`}>
             <div className="flex justify-between items-start mb-4">
                 <h3 className={`font-bold text-lg flex items-center gap-2 ${
                    result.impossible ? 'text-red-800' : 'text-gray-900'
                 }`}>
                   {result.impossible ? 'Goal Unreachable' : 'Analysis Result'}
                 </h3>
                 <button 
                   onClick={calculate} 
                   title="Reset distribution"
                   className="p-1.5 text-gray-500 hover:text-indigo-600 bg-white rounded-md shadow-sm"
                 >
                   <RefreshCw className="w-4 h-4" />
                 </button>
             </div>
             
             {result.impossible ? (
               <div>
                  <p className="text-red-700 text-sm leading-relaxed mb-4">
                    To reach a CGPA of <strong>{targetCGPA}</strong>, you would need an average GPA of <strong>{result.gpa.toFixed(2)}</strong>. Since this is higher than 4.00, it is not possible.
                  </p>
               </div>
             ) : (
               <div>
                  {/* Average Display */}
                  <div className="flex flex-col items-center justify-center mb-6 py-4 bg-white/50 rounded-xl border border-indigo-100/50">
                    <p className="text-gray-600 text-sm font-medium uppercase tracking-wide mb-1">
                      Required Average GPA
                    </p>
                    <div className={`text-5xl font-extrabold ${result.gpa <= 0 ? 'text-emerald-600' : 'text-indigo-600'}`}>
                      {result.gpa <= 0 ? 'Pass' : result.gpa.toFixed(2)}
                    </div>
                  </div>

                  {/* Course List */}
                  <div className="space-y-3">
                     <div className="flex justify-between items-end mb-2">
                        <h4 className="font-semibold text-gray-800 text-sm">Course Breakdown</h4>
                        <span className="text-[10px] text-gray-500 italic">Edit a grade to lock it</span>
                     </div>
                     
                     {courses.map((course, idx) => {
                        const rawVal = gradeBreakdown[course.id] || "0";
                        const valNum = parseFloat(rawVal);
                        
                        const isHigh = !isNaN(valNum) && valNum > 4.0;
                        const isLow = !isNaN(valNum) && valNum <= 0;
                        const isLocked = lockedCourseIds.has(course.id);

                        return (
                        <div key={course.id} className={`flex justify-between items-center bg-white p-3 rounded-lg border shadow-sm transition-colors ${
                            isLocked ? 'border-indigo-200 bg-indigo-50/30' : 'border-gray-100'
                        }`}>
                           <div className="flex flex-col flex-1">
                              <span className="text-gray-900 font-medium text-sm truncate pr-2">
                                {course.name || `Course ${idx + 1}`}
                              </span>
                              <span className="text-xs text-gray-500">
                                {course.credits} Credits
                              </span>
                           </div>
                           
                           <div className="flex items-start gap-2">
                              {/* Lock Toggle */}
                              <button 
                                onClick={() => toggleLock(course.id)}
                                className={`mt-2 p-1 rounded-full hover:bg-gray-100 transition-colors ${
                                    isLocked ? 'text-indigo-500' : 'text-gray-300'
                                }`}
                                title={isLocked ? "Unlock course to auto-adjust" : "Course is auto-adjusting"}
                              >
                                  {isLocked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                              </button>

                              <div className="text-right w-32">
                                  <input 
                                    type="text"
                                    inputMode="decimal"
                                    className={`w-full text-right font-bold bg-transparent border-b border-gray-300 focus:border-indigo-500 outline-none transition-colors ${
                                        isHigh ? 'text-red-600' : 
                                        isLow ? 'text-emerald-600' : 
                                        'text-indigo-600'
                                    }`}
                                    value={rawVal}
                                    onChange={(e) => handleGradeAdjustment(course.id, e.target.value)}
                                  />
                                  {isHigh ? (
                                    <p className="text-[10px] text-red-500 font-bold mt-1">Not Possible</p>
                                  ) : (
                                    <p className="text-[10px] text-gray-400 uppercase mt-1">
                                        {isLocked ? 'Fixed' : 'Auto'}
                                    </p>
                                  )}
                              </div>
                           </div>
                        </div>
                     )})}
                  </div>

                  {result.gpa > 0 && (
                      <p className="text-xs text-gray-500 mt-4 text-center">
                          Manually editing a grade locks it. Click the lock icon to unlock and auto-adjust.
                      </p>
                  )}
               </div>
             )}
          </div>
        )}
     </div>
  );
};

export default TargetCalculator;