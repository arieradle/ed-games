import { useState, useCallback } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [stored, setStored] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    try {
      setStored(prev => {
        const next = typeof value === 'function' ? (value as (p: T) => T)(prev) : value;
        localStorage.setItem(key, JSON.stringify(next));
        return next;
      });
    } catch { /* ignore */ }
  }, [key]);

  return [stored, setValue] as const;
}
