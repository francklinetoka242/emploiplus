// src/hooks/useJobSearch.ts
import { useState, useEffect, useCallback, useRef } from 'react';

interface UseJobSearchProps {
  initialSearch?: string;
  debounceMs?: number;
  minChars?: number;
}

export const useJobSearch = ({
  initialSearch = '',
  debounceMs = 500,
  minChars = 3,
}: UseJobSearchProps) => {
  const [localInput, setLocalInput] = useState(initialSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // Update debounced value after delay
  useEffect(() => {
    // Clear previous timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Only debounce if we have enough characters or the input is empty
    if (localInput.length === 0 || localInput.length >= minChars) {
      debounceTimer.current = setTimeout(() => {
        setDebouncedSearch(localInput);
      }, debounceMs);
    } else if (localInput.length > 0 && localInput.length < minChars) {
      // Clear the debounced search if input is too short
      setDebouncedSearch('');
    }

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [localInput, debounceMs, minChars]);

  const handleInputChange = useCallback((newValue: string) => {
    setLocalInput(newValue);
  }, []);

  const showMinCharsWarning = localInput.length > 0 && localInput.length < minChars;

  return {
    localInput,
    debouncedSearch,
    handleInputChange,
    showMinCharsWarning,
  };
};
