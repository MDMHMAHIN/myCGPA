// Developed by MHMAHIN
import React, { useState, useEffect } from 'react';
import { AcademicRecord, Semester } from './types';
import { loadRecord, saveRecord, exportData, importData } from './services/storage';
import { calculateCGPA, formatGPA } from './utils/calculations';
import { generateAcademicInsights } from './services/geminiService';
import Layout from './components/Layout';
import SummaryCard from './components/SummaryCard';
import SemesterList from './components/SemesterList';
import TargetCalculator from './components/TargetCalculator';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { Plus, Download, Upload, Trash, Loader2, BrainCircuit, Facebook, Linkedin } from 'lucide-react';

const App: React.FC = () => {
  const [record, setRecord] = useState<AcademicRecord>({ semesters: [], lastUpdated: '' });
  const [activeTab, setActiveTab] = useState<'dashboard' | 'courses' | 'target' | 'insights' | 'settings'>('dashboard');
  const [insightText, setInsightText] = useState<string>('');
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [importText, setImportText] = useState('');

  // Initial Load
  useEffect(() => {
    const data = loadRecord();
    setRecord(data);
  }, []);

  // Save on change
  useEffect(() => {
    if (record.lastUpdated) { // Only save if initialized
      saveRecord(record);
    }
  }, [record]);

  const stats = calculateCGPA(record.semesters);

  const handleAddSemester = () => {
    const count = record.semesters.length + 1;
    const newSemester: Semester = {
      id: crypto.randomUUID(),
      name: `Semester ${count}`,
      courses: []
    };
    setRecord(prev => ({
      ...prev,
      semesters: [...prev.semesters, newSemester],
      lastUpdated: new Date().toISOString()
    }));
    setActiveTab('courses');
  };

  const handleUpdateSemester = (updated: Semester) => {
    setRecord(prev => ({
      ...prev,
      semesters: prev.semesters.map(s => s.id === updated.id ? updated : s),
      lastUpdated: new Date().toISOString()
    }));
  };

  const handleDeleteSemester = (id: string) => {
    setRecord(prev => ({
      ...prev,
      semesters: prev.semesters.filter(s => s.id !== id),
      lastUpdated: new Date().toISOString()
    }));
  };

  const handleGetInsights = async () => {
    setLoadingInsights(true);
    const result = await generateAcademicInsights(record);
    setInsightText(result);
    setLoadingInsights(false);
  };

  const handleImport = () => {
    if (!importText) return;
    const success = importData(importText);
    if (success) {
      setRecord(loadRecord());
      setImportText('');
      alert('Data imported successfully!');
    } else {
      alert('Invalid data format.');
    }
  };

  const handleClearData = () => {
    if (window.confirm("This will permanently delete all your data. Are you sure?")) {
      const empty: AcademicRecord = { semesters: [], lastUpdated: new Date().toISOString() };
      setRecord(empty);
      localStorage.removeItem('honours_gpa_data_v1'); // Helper clean
    }
  }

  // Chart Data Preparation
  const chartData = record.semesters.map(s => {
     const semStats = s.courses.length > 0 
        ? s.courses.reduce((acc, c) => acc + (c.credits * c.grade), 0) / s.courses.reduce((acc, c) => acc + c.credits, 0)
        : 0;
     return {
       name: s.name,
       gpa: parseFloat(semStats.toFixed(2))
     };
  });

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      
      {/* DASHBOARD VIEW */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SummaryCard 
              title="Cumulative GPA" 
              value={formatGPA(stats.gpa)} 
              subtitle="Overall Performance"
              color={stats.gpa >= 3.5 ? 'green' : stats.gpa >= 3.0 ? 'indigo' : 'orange'}
            />
            <SummaryCard 
              title="Total Credits" 
              value={stats.totalCredits.toString()} 
              subtitle="Credits Earned"
              color="purple"
            />
          </div>

          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Performance Trend</h2>
            {chartData.length > 0 ? (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fontSize: 12, fill: '#9ca3af'}} 
                      dy={10}
                    />
                    <YAxis 
                      domain={[0, 4]} 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fontSize: 12, fill: '#9ca3af'}} 
                    />
                    <Tooltip 
                      contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="gpa" 
                      stroke="#4f46e5" 
                      strokeWidth={3} 
                      dot={{fill: '#4f46e5', strokeWidth: 2}} 
                      activeDot={{r: 6}} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-40 flex flex-col items-center justify-center text-gray-400">
                <p>No data available to show trends.</p>
                <button 
                  onClick={handleAddSemester}
                  className="mt-2 text-indigo-600 font-medium text-sm hover:underline"
                >
                  Add your first semester
                </button>
              </div>
            )}
          </div>
          
           {/* Quick Action */}
           <button 
            onClick={handleAddSemester}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md font-medium flex items-center justify-center gap-2 transition-transform active:scale-95"
          >
            <Plus className="w-5 h-5" />
            Add New Semester
          </button>
        </div>
      )}

      {/* SEMESTERS VIEW */}
      {activeTab === 'courses' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-xl font-bold text-gray-900">Academic History</h2>
            <button 
              onClick={handleAddSemester}
              className="p-2 bg-indigo-100 text-indigo-700 rounded-full hover:bg-indigo-200 transition-colors"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
          
          {record.semesters.length === 0 ? (
             <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
               <p className="text-gray-500 mb-4">No semesters recorded yet.</p>
               <button 
                onClick={handleAddSemester}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700"
               >
                 Get Started
               </button>
             </div>
          ) : (
            <SemesterList 
              semesters={record.semesters} 
              onUpdateSemester={handleUpdateSemester}
              onDeleteSemester={handleDeleteSemester}
            />
          )}
        </div>
      )}

      {/* TARGET PLANNER VIEW */}
      {activeTab === 'target' && (
        <TargetCalculator currentStats={stats} />
      )}

      {/* AI INSIGHTS VIEW */}
      {activeTab === 'insights' && (
        <div className="space-y-6">
           <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 text-white shadow-lg">
             <h2 className="text-2xl font-bold mb-2">AI Academic Advisor</h2>
             <p className="opacity-90 mb-6">Get personalized analysis of your grades, identify strong subjects, and receive tips to improve your CGPA.</p>
             
             <button
              onClick={handleGetInsights}
              disabled={loadingInsights || record.semesters.length === 0}
              className="px-6 py-2 bg-white text-indigo-700 font-semibold rounded-lg shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all"
             >
               {loadingInsights ? <Loader2 className="w-4 h-4 animate-spin"/> : <BrainCircuit className="w-4 h-4"/>}
               {loadingInsights ? 'Analyzing...' : 'Generate Analysis'}
             </button>
             {record.semesters.length === 0 && (
                <p className="mt-2 text-xs text-white/70">Add some course data first!</p>
             )}
           </div>

           {insightText && (
             <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 animate-fade-in">
               <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                 <BrainCircuit className="w-5 h-5 text-purple-600" />
                 Analysis Report
               </h3>
               <div className="prose prose-sm prose-indigo max-w-none text-gray-600 whitespace-pre-wrap leading-relaxed">
                 {insightText}
               </div>
             </div>
           )}
        </div>
      )}

      {/* SETTINGS VIEW */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h3 className="font-bold text-gray-800 mb-4">Data Management</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Backup Data</label>
                <button 
                  onClick={() => {
                     const data = exportData();
                     // Copy to clipboard or download file
                     const blob = new Blob([data], { type: 'application/json' });
                     const url = URL.createObjectURL(blob);
                     const a = document.createElement('a');
                     a.href = url;
                     a.download = `gpa-backup-${new Date().toISOString().split('T')[0]}.json`;
                     a.click();
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <Download className="w-4 h-4" />
                  Download Backup (JSON)
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Restore Data</label>
                <textarea 
                  className="w-full p-2 border border-gray-300 rounded-md text-xs font-mono mb-2"
                  rows={3}
                  placeholder="Paste JSON content here..."
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                />
                <button 
                  onClick={handleImport}
                  disabled={!importText}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md shadow-sm text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
                >
                  <Upload className="w-4 h-4" />
                  Restore from JSON
                </button>
              </div>

               <div className="pt-4 border-t border-gray-100">
                <button 
                  onClick={handleClearData}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-md text-sm font-medium hover:bg-red-100"
                >
                  <Trash className="w-4 h-4" />
                  Clear All Data
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h3 className="font-bold text-gray-800 mb-2">About</h3>
            <p className="text-sm text-gray-600">
              All data is stored locally on your device. This app works offline and never sends your grade data to any server (except when you explicitly request AI analysis).
            </p>
            <p className="text-sm text-gray-800 font-medium mt-4">Developed by MHMAHIN</p>
            
            <div className="flex gap-4 mt-3">
              <a 
                href="https://www.facebook.com/MhMahin23" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-blue-600 transition-colors"
                title="Facebook Profile"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a 
                href="https://www.linkedin.com/in/mdmhmahin" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-blue-700 transition-colors"
                title="LinkedIn Profile"
              >
                <Linkedin className="w-5 h-5" />
              </a>
            </div>

            <p className="text-xs text-gray-400 mt-2">Version 1.0.0</p>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default App;