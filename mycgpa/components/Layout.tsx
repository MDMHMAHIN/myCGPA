import React from 'react';
import { BookOpen, BarChart2, Settings, BrainCircuit, Target } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: 'dashboard' | 'courses' | 'target' | 'insights' | 'settings';
  onTabChange: (tab: 'dashboard' | 'courses' | 'target' | 'insights' | 'settings') => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, onTabChange }) => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900">
      <header className="bg-indigo-600 text-white shadow-md sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-6 h-6" />
            <h1 className="text-xl font-bold tracking-tight">My CGPA</h1>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-4xl mx-auto p-4 pb-24">
        {children}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-pb z-50">
        <div className="max-w-4xl mx-auto flex justify-around items-center h-16">
          <button
            onClick={() => onTabChange('dashboard')}
            className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
              activeTab === 'dashboard' ? 'text-indigo-600' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <BarChart2 className="w-5 h-5" />
            <span className="text-[10px] font-medium">Dashboard</span>
          </button>
          
          <button
            onClick={() => onTabChange('courses')}
            className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
              activeTab === 'courses' ? 'text-indigo-600' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <BookOpen className="w-5 h-5" />
            <span className="text-[10px] font-medium">Semesters</span>
          </button>

          <button
            onClick={() => onTabChange('target')}
            className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
              activeTab === 'target' ? 'text-indigo-600' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <Target className="w-5 h-5" />
            <span className="text-[10px] font-medium">Planner</span>
          </button>

          <button
            onClick={() => onTabChange('insights')}
             className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
              activeTab === 'insights' ? 'text-indigo-600' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <BrainCircuit className="w-5 h-5" />
            <span className="text-[10px] font-medium">Insights</span>
          </button>

          <button
            onClick={() => onTabChange('settings')}
            className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
              activeTab === 'settings' ? 'text-indigo-600' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <Settings className="w-5 h-5" />
            <span className="text-[10px] font-medium">Data</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default Layout;