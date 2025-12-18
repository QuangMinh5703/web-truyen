import { useRef, useCallback } from 'react';

type DebounceFunction<T extends (...args: any[]) => any> = (
  func: T,
  delay: number
) => (...args: Parameters<T>) => void;

/**
 * Custom hook for debouncing functions.
 * It returns a debounced version of the provided function.
 *
 * @param func The function to debounce.
 * @param delay The debounce delay in milliseconds.
 * @returns A debounced function.
 */
export const useDebounce: DebounceFunction<any> = (func, delay) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const debouncedFunction = useCallback(
    (...args: any[]) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        func(...args);
      }, delay);
    },
    [func, delay]
  );

  return debouncedFunction;
};
