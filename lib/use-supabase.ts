'use client';

import { useEffect, useState } from 'react';
import { supabase } from './supabase';

export function useSupabase<T>(table: string, options?: {
  columns?: string;
  filter?: { column: string; value: string | number };
  orderBy?: { column: string; ascending?: boolean };
  limit?: number;
}) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);

      let query = supabase.from(table).select(options?.columns ?? '*');

      if (options?.filter) {
        query = query.eq(options.filter.column, options.filter.value);
      }

      if (options?.orderBy) {
        query = query.order(options.orderBy.column, {
          ascending: options.orderBy.ascending ?? true,
        });
      }

      if (options?.limit) {
        query = query.limit(options.limit);
      }

      const { data, error } = await query;

      if (error) {
        setError(error.message);
      } else {
        setData((data as T[]) ?? []);
      }

      setLoading(false);
    }

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table]);

  return { data, loading, error };
}
