import React from 'react';

interface Props {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}

export default function SearchBar({ value, onChange, placeholder = 'Rechercher...', className = '' }: Props) {
  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-12 pr-10 py-2 bg-white border border-gray-200 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <svg className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35" />
          <circle cx="11" cy="11" r="6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {value && (
          <button onClick={() => onChange('')} aria-label="clear" className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground hover:text-primary">
            ✕
          </button>
        )}
      </div>
    </div>
  );
}
