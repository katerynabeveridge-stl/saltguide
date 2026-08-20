"use client";

import { useEffect, useState } from "react";
import { getBrowserSupabase } from "../supabase/browser";
import {
  EMPTY_GUIDE_DATA,
  fallbackGuideData,
  fetchGuideData,
} from "./queries";
import type { GuideData } from "./types";

let cached: GuideData | null = null;

/**
 * Client fetch of venues + events. Shows cache immediately on client
 * navigations; always refetches on mount so new Supabase rows appear
 * without a rebuild.
 */
export function useGuideData(initial: GuideData = EMPTY_GUIDE_DATA): {
  data: GuideData;
  loading: boolean;
} {
  const [data, setData] = useState<GuideData>(cached ?? initial);
  const [loading, setLoading] = useState(cached == null);

  useEffect(() => {
    let cancelled = false;

    let supabase = null;
    try {
      supabase = getBrowserSupabase();
    } catch {
      supabase = null;
    }

    void fetchGuideData(supabase)
      .then((result) => {
        if (cancelled) return;
        cached = result;
        setData(result);
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        const fallback = fallbackGuideData();
        cached = fallback;
        setData(fallback);
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { data, loading };
}
