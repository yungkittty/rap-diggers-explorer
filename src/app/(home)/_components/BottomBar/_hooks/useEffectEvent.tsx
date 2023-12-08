import { useCallback, useInsertionEffect, useRef } from "react";

// @TODO - This should use the official version once released!
// https://stackoverflow.com/a/76514983
export function useEffectEvent(fn: any) {
  const ref = useRef(null);
  useInsertionEffect(() => {
    ref.current = fn;
  }, [fn]);
  return useCallback((...args: any[]) => {
    const f = ref.current as any;
    return f(...args);
  }, []);
}
