import React from 'react';

interface SummaryCardProps {
  title: string;
  value: string;
  subtitle?: string;
  color?: 'indigo' | 'green' | 'purple' | 'orange';
}

const SummaryCard: React.FC<SummaryCardProps> = ({ title, value, subtitle, color = 'indigo' }) => {
  const colorClasses = {
    indigo: 'bg-indigo-600',
    green: 'bg-emerald-600',
    purple: 'bg-purple-600',
    orange: 'bg-orange-600',
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className={`h-2 w-full ${colorClasses[color]}`}></div>
      <div className="p-5">
        <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">{title}</p>
        <div className="mt-2 flex items-baseline">
          <span className="text-3xl font-extrabold text-gray-900">{value}</span>
          {subtitle && <span className="ml-2 text-sm text-gray-500">{subtitle}</span>}
        </div>
      </div>
    </div>
  );
};

export default SummaryCard;