import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import {
  SUPABASE_ANON_KEY,
  SUPABASE_URL,
  isSupabaseConfigured,
} from "@/lib/supabase/config";

/**
 * middleware から呼び出し、Supabase 認証セッションの更新と
 * 「ログイン必須化（スタッフ限定公開）」を行う。
 *
 * - Supabase 未構成時: 認証を要求せず素通し（ゲストモード / お試し用）。
 * - Supabase 構成時: 未ログインのユーザーはログイン画面へリダイレクトする。
 *   これにより、アカウントを持つスタッフだけがアプリを利用できる。
 */
export async function updateSession(request: NextRequest): Promise<NextResponse> {
  const response = NextResponse.next({ request });

  // Supabase 未構成ならゲストモード（誰でも利用可）
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

  // getUser() でセッションを検証・更新する
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  // 認証不要で通すパス（ログイン画面・API・認証コールバック）
  const isPublic =
    path.startsWith("/login") ||
    path.startsWith("/api") ||
    path.startsWith("/auth");

  // 未ログインならログイン画面へ
  if (!user && !isPublic) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return response;
}
