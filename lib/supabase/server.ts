import { createClient } from '@supabase/supabase-js';

/**
 * Server-side Supabase client with service role key
 * 
 * IMPORTANT: This client has full database access.
 * Only use in server-side code (API routes, server components, server actions).
 * NEVER import this in client components or expose to browser.
 */
export function getSupabaseServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    throw new Error(
      'NEXT_PUBLIC_SUPABASE_URL is not set. ' +
      'Please add it to your .env.local file.'
    );
  }

  if (!supabaseServiceKey) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY is not set. ' +
      'Please add it to your .env.local file. ' +
      'This key is required for server-side database operations.'
    );
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
