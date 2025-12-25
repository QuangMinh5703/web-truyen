import { useEffect, useRef, useCallback } from 'react';

/**
 * Creates a debounced version of a callback function that delays its execution.
 *
 * @template A The type of the arguments for the callback function.
 * @param {(...args: A) => void} callback The function to debounce.
 * @param {number} delay The debounce delay in milliseconds.
 * @returns {(...args: A) => void} A debounced version of the callback function.
 */
export function useDebouncedCallback<A extends any[]>(
  callback: (...args: A) => void,
  delay: number
): (...args: A) => void {
  const callbackRef = useRef(callback);
  const timeoutRef = useRef<NodeJS.Timeout>();

  // Update the callback reference whenever it changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // Cleanup the timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return useCallback(
    (...args: A) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args);
      }, delay);
    },
    [delay]
  );
}
