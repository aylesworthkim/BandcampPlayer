"use client";

import { isSupabaseConfigured } from "@/lib/supabase";
import { signInWithGoogle, signOut, useUser } from "@/lib/auth";

export default function AccountBar() {
  const user = useUser();

  // No Supabase configured → stay a purely local app, no account UI.
  if (!isSupabaseConfigured) return null;

  if (user) {
    return (
      <div className="flex items-center gap-3 text-sm">
        <span className="max-w-[16rem] truncate text-zinc-400">
          {user.email}
        </span>
        <button
          onClick={() => void signOut()}
          className="rounded-lg border border-zinc-700 px-3 py-1.5 text-zinc-300 transition hover:border-zinc-500 hover:text-white"
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => void signInWithGoogle()}
      className="rounded-lg border border-zinc-700 px-3 py-1.5 text-sm text-zinc-200 transition hover:border-zinc-500 hover:text-white"
    >
      Continue with Google
    </button>
  );
}
