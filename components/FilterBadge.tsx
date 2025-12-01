
import React from 'react';
import { Icon, IconName } from './Icon';

interface FilterBadgeProps {
  label: string;
  count?: number;
  isSelected: boolean;
  onClick: () => void;
  colorClass?: string;
  special?: boolean; // For "MENSAJES"
  icon?: IconName; // New Prop for specific icon
}

export const FilterBadge: React.FC<FilterBadgeProps> = ({ 
  label, 
  count, 
  isSelected, 
  onClick,
  colorClass,
  special = false,
  icon
}) => {
  return (
    <button
      onClick={onClick}
      className={`
        flex flex-col items-center justify-between p-4 rounded-[2rem] transition-all duration-300 ease-out active:scale-95
        w-full h-32 relative group border-2
        ${isSelected 
          ? 'bg-white border-primary/20 shadow-xl ring-2 ring-primary ring-offset-2 ring-offset-slate-50 dark:ring-offset-dark z-10 scale-105' 
          : 'bg-white dark:bg-slate-800 border-transparent hover:border-slate-200 dark:hover:border-slate-700 shadow-sm hover:shadow-md'
        }
        ${special ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-900' : ''}
      `}
    >
      <div className={`
         p-2 rounded-full mb-1 transition-colors
         ${isSelected 
            ? (special ? 'bg-emerald-100 text-emerald-600' : 'bg-indigo-50 text-primary') 
            : (special ? 'bg-emerald-50 text-emerald-400' : 'bg-slate-50 dark:bg-slate-700 text-slate-400 dark:text-slate-500 group-hover:text-primary')}
      `}>
         <Icon name={icon || (special ? 'message' : 'filter')} size={24} />
      </div>
      
      <span className={`text-3xl font-black tracking-tight ${
        special 
          ? 'text-emerald-600 dark:text-emerald-400' 
          : isSelected 
            ? 'text-primary dark:text-white' 
            : 'text-slate-600 dark:text-slate-300'
      }`}>
        {count !== undefined ? count : '-'}
      </span>
      
      <span className={`text-[10px] font-bold uppercase tracking-widest text-center leading-tight ${
        isSelected ? 'text-slate-800 dark:text-slate-200' : 'text-slate-400 dark:text-slate-500'
      }`}>
        {label}
      </span>
    </button>
  );
};
