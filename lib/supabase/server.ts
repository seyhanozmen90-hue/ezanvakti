import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Supabase yapılandırması mevcut mu? (Env değişkenleri tanımlı mı)
 */
export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

/**
 * Server-side Supabase client with service role key.
 * Env yoksa null döner (uygulama cache olmadan provider ile çalışır).
 * 
 * IMPORTANT: This client has full database access.
 * Only use in server-side code (API routes, server components, server actions).
 * NEVER import this in client components or expose to browser.
 */
export function getSupabaseServerClient(): SupabaseClient {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    throw new Error(
      'NEXT_PUBLIC_SUPABASE_URL is not set. ' +
      'Add it to .env.local or skip Supabase to use provider-only mode.'
    );
  }

  if (!supabaseServiceKey) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY is not set. ' +
      'Add it to .env.local or skip Supabase to use provider-only mode.'
    );
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
