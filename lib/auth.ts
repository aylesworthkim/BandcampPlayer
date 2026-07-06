import { useSyncExternalStore } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { closeCloudSession } from "@/lib/cloudSession";

// Small external store mirroring the Supabase auth user. Backed by Supabase's
// own onAuthStateChange subscription, so there's no effect calling setState.
let user: User | null = null;
const listeners = new Set<() => void>();

function emit(): void {
  for (const listener of listeners) listener();
}

export function subscribeUser(listener: () => void): () => void {
  listeners.add(listener);

  if (!supabase) return () => listeners.delete(listener);

  // Fires immediately with the current session (INITIAL_SESSION) and on every
  // sign-in / sign-out / token refresh afterwards.
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    const next = session?.user ?? null;
    if (next?.id !== user?.id) {
      user = next;
      // Returning to a signed-out state drops back to the local session.
      if (!next) closeCloudSession();
      emit();
    }
  });

  return () => {
    listeners.delete(listener);
    data.subscription.unsubscribe();
  };
}

export function getUserSnapshot(): User | null {
  return user;
}

export function getServerUserSnapshot(): User | null {
  return null;
}

export function useUser(): User | null {
  return useSyncExternalStore(
    subscribeUser,
    getUserSnapshot,
    getServerUserSnapshot,
  );
}

export async function signInWithGoogle(): Promise<void> {
  if (!supabase) return;
  await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: window.location.origin },
  });
}

export async function signOut(): Promise<void> {
  if (!supabase) return;
  await supabase.auth.signOut();
}
