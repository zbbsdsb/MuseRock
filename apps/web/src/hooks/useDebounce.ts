import { useEffect, useRef } from 'react';

export function useDebounce<T>(value: T, delay: number): T {
  const debouncedRef = useRef<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      debouncedRef.current = value;
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedRef.current;
}
