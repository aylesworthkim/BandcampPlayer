import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Referenced as full literals so Next.js can inline them into the client bundle
// at build time (see the environment-variables guide).
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(url && anonKey);

// When the env vars are absent (e.g. local dev without a Supabase project) the
// client is null and the app runs in local-only mode — accounts/cloud UI hide
// themselves and nothing throws.
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url as string, anonKey as string, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        // OAuth returns to the app URL; the client finishes the login by
        // reading the redirect params from the URL.
        detectSessionInUrl: true,
      },
    })
  : null;
