// src/components/formations/FormationSearchInput.tsx
import React, { useState, useCallback } from 'react';
import { Search, AlertCircle } from 'lucide-react';

interface FormationSearchInputProps {
  value: string;
  onChange: (searchTerm: string) => void;
  placeholder?: string;
  minCharsWarning?: boolean;
}

export const FormationSearchInput: React.FC<FormationSearchInputProps> = ({
  value,
  onChange,
  placeholder = "Ex: Web design...",
  minCharsWarning = false,
}) => {
  const [localInput, setLocalInput] = useState(value);

  const handleChange = useCallback((newValue: string) => {
    setLocalInput(newValue);
    // Call parent onChange with the new value
    onChange(newValue);
  }, [onChange]);

  return (
    <div className="flex-1 min-w-[200px]">
      <label className="block text-xs font-semibold text-gray-700 mb-1">Formation</label>
      <div className="relative">
        <Search className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
        <input
          type="text"
          placeholder={placeholder}
          value={localInput}
          onChange={(e) => handleChange(e.target.value)}
          className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm"
        />
      </div>
      {minCharsWarning && localInput.length > 0 && localInput.length < 3 && (
        <div className="flex items-center gap-1 mt-1 text-xs text-amber-600">
          <AlertCircle className="w-3 h-3" />
          <span>Saisissez au moins 3 caractères</span>
        </div>
      )}
    </div>
  );
};
