"use server";

import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

/**
 * RSC varijanta — može SAMO čitati cookie (get).
 * Koristi u layoutovima, page server komponentama i helperima koji se pozivaju iz RSC-a.
 */
export async function createSupabaseRSCClient() {
  const c = await cookies(); // ReadonlyRequestCookies

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: async (name: string) => c.get(name)?.value,
      },
    }
  );
}
