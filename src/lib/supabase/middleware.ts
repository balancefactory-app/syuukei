import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import {
  SUPABASE_ANON_KEY,
  SUPABASE_URL,
  isSupabaseConfigured,
} from "@/lib/supabase/config";

/**
 * middleware から呼び出し、Supabase の認証セッションを更新（トークンリフレッシュ）する。
 * Supabase 未構成時は素通し。
 */
export async function updateSession(request: NextRequest): Promise<NextResponse> {
  const response = NextResponse.next({ request });

  if (!isSupabaseConfigured()) return response;

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  // getUser() を呼ぶことでセッションが検証・更新される。
  await supabase.auth.getUser();

  return response;
}
