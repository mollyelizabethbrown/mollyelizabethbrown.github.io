"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Filter state mirrored to the query string — without useSearchParams, so the
 * server-rendered HTML always contains the full, unfiltered list (good for SEO and no-JS).
 * Filters in a shared URL are applied right after hydration.
 */
export function useUrlFilters<K extends string>(keys: readonly K[]) {
  const [values, setValues] = useState<Record<K, string>>(() => Object.fromEntries(keys.map((k) => [k, ""])) as Record<K, string>);

  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    setValues(Object.fromEntries(keys.map((k) => [k, sp.get(k) ?? ""])) as Record<K, string>);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const update = useCallback((patch: Partial<Record<K, string>>) => {
    setValues((prev) => {
      const next = { ...prev, ...patch };
      const sp = new URLSearchParams();
      for (const k of keys) if (next[k]) sp.set(k, next[k]);
      const qs = sp.toString();
      window.history.replaceState(null, "", `${window.location.pathname}${qs ? `?${qs}` : ""}`);
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const reset = useCallback(() => update(Object.fromEntries(keys.map((k) => [k, ""])) as Record<K, string>), [update, keys]);

  return { values, update, reset };
}
