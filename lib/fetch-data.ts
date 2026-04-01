import { supabase } from './supabase';

export async function fetchData<T>(table: string, options?: {
  columns?: string;
  filter?: { column: string; value: string | number };
  orderBy?: { column: string; ascending?: boolean };
  limit?: number;
}): Promise<T[]> {
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
    throw new Error(`Veri çekme hatası (${table}): ${error.message}`);
  }

  return (data as T[]) ?? [];
}
