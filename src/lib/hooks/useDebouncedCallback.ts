import { useRef, useCallback, useEffect } from 'react';

/**
 * A custom hook that returns a debounced version of the provided callback.
 * @param callback The function to debounce
 * @param delay The delay in milliseconds
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): (...args: Parameters<T>) => void {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const latestCallback = useRef<T>(callback);

  // Always point to the latest callback to avoid stale closures
  useEffect(() => {
    latestCallback.current = callback;
  }, [callback]);

  // Clean up the timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        latestCallback.current(...args);
      }, delay);
    },
    [delay]
  );
}