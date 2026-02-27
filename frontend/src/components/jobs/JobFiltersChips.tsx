import React from 'react';
import { Badge } from '@/components/ui/badge';

interface JobFilterChipsProps {
  selectedType?: string;
  onTypeChange?: (type: string) => void;
}

const JOB_TYPE_CHIPS = [
  { id: 'all', label: 'Tous', color: 'bg-slate-100 text-slate-700 hover:bg-slate-200' },
  { id: 'CDI', label: 'CDI', color: 'bg-blue-100 text-blue-700 hover:bg-blue-200' },
  { id: 'CDD', label: 'CDD', color: 'bg-green-100 text-green-700 hover:bg-green-200' },
  { id: 'remote', label: 'Télétravail', color: 'bg-purple-100 text-purple-700 hover:bg-purple-200' },
  { id: 'full-time', label: 'Temps plein', color: 'bg-orange-100 text-orange-700 hover:bg-orange-200' },
];

export function JobFiltersChips({ selectedType = 'all', onTypeChange }: JobFilterChipsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 px-4 md:px-0 -mx-4 md:mx-0 scrollbar-hide">
      {JOB_TYPE_CHIPS.map((chip) => (
        <button
          key={chip.id}
          onClick={() => onTypeChange?.(chip.id)}
          className={`flex-shrink-0 px-4 py-2 rounded-full border-0 transition-all duration-200 font-medium text-sm whitespace-nowrap ${
            selectedType === chip.id
              ? `${chip.color} ring-2 ring-offset-2 ring-current`
              : `${chip.color}`
          }`}
        >
          {chip.label}
        </button>
      ))}
    </div>
  );
}

interface ServiceFilterChipsProps {
  selectedType?: string;
  onTypeChange?: (type: string) => void;
}

const SERVICE_TYPE_CHIPS = [
  { id: 'all', label: 'Tous', color: 'bg-slate-100 text-slate-700 hover:bg-slate-200' },
  { id: 'formation', label: 'Formation', color: 'bg-blue-100 text-blue-700 hover:bg-blue-200' },
  { id: 'conseil', label: 'Conseil', color: 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200' },
  { id: 'gratuit', label: 'Gratuit', color: 'bg-green-100 text-green-700 hover:bg-green-200' },
  { id: 'certifiant', label: 'Certifiant', color: 'bg-amber-100 text-amber-700 hover:bg-amber-200' },
];

export function ServiceFiltersChips({ selectedType = 'all', onTypeChange }: ServiceFilterChipsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 px-4 md:px-0 -mx-4 md:mx-0 scrollbar-hide">
      {SERVICE_TYPE_CHIPS.map((chip) => (
        <button
          key={chip.id}
          onClick={() => onTypeChange?.(chip.id)}
          className={`flex-shrink-0 px-4 py-2 rounded-full border-0 transition-all duration-200 font-medium text-sm whitespace-nowrap ${
            selectedType === chip.id
              ? `${chip.color} ring-2 ring-offset-2 ring-current`
              : `${chip.color}`
          }`}
        >
          {chip.label}
        </button>
      ))}
    </div>
  );
}
