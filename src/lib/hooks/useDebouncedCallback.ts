import { useRef, useEffect, useCallback } from 'react';

type DebouncedCallback<T extends (...args: any[]) => any> = (...args: Parameters<T>) => void;

function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): DebouncedCallback<T> {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const latestCallback = useRef<T>(callback);

  useEffect(() => {
    latestCallback.current = callback;
  }, [callback]);

  const debouncedFunction = useCallback(
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

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return debouncedFunction;
}

export { useDebouncedCallback };