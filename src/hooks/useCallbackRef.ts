import { useEffect, useRef } from 'react';

export function useCallbackRef<T extends (...args: never[]) => void>(fn: T) {
  const ref = useRef(fn);
  useEffect(() => {
    ref.current = fn;
  });
  return ref;
}
