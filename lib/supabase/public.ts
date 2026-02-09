import { createClient } from '@supabase/supabase-js';

/**
 * Public Supabase client with anon key
 * 
 * Safe to use in client components for reads (if RLS policies allow).
 * For writes, use server client with service role key.
 */
export function getSupabasePublicClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl) {
    throw new Error(
      'NEXT_PUBLIC_SUPABASE_URL is not set. ' +
      'Please add it to your .env.local file.'
    );
  }

  if (!supabaseAnonKey) {
    throw new Error(
      'NEXT_PUBLIC_SUPABASE_ANON_KEY is not set. ' +
      'Please add it to your .env.local file.'
    );
  }

  return createClient(supabaseUrl, supabaseAnonKey);
}
