import { useState, useEffect } from 'react';

/**
 * A custom hook that debounces a value.
 *
 * This hook is useful for delaying an action until a certain amount of time
 * has passed without the value changing. A common use case is to wait for
 * a user to stop typing in a search bar before fetching results.
 *
 * @template T The type of the value to be debounced.
 * @param {T} value The value to debounce.
 * @param {number} delay The debounce delay in milliseconds.
 * @returns {T} The debounced value, which will only update after the specified delay has passed.
 *
 * @example
 * const [searchTerm, setSearchTerm] = useState('');
 * const debouncedSearchTerm = useDebounce(searchTerm, 500);
 *
 * useEffect(() => {
 *   if (debouncedSearchTerm) {
 *     // Fetch API results with the debounced term
 *   }
 * }, [debouncedSearchTerm]);
 *
 * return <input onChange={(e) => setSearchTerm(e.target.value)} />;
 */
export function useDebounce<T>(value: T, delay: number): T {
  // State and setters for debounced value
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(
    () => {
      // Update debounced value after the specified delay
      const handler = setTimeout(() => {
        setDebouncedValue(value);
      }, delay);

      // Cleanup function to cancel the timeout if the value changes
      // This is how we prevent the debounced value from updating prematurely
      return () => {
        clearTimeout(handler);
      };
    },
    [value, delay] // Only re-call effect if value or delay changes
  );

  return debouncedValue;
}
