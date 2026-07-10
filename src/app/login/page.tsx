"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AppFrame from "@/components/AppFrame";
import { getBrowserSupabase } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { useAppStore } from "@/lib/store";

export default function LoginPage() {
  const router = useRouter();
  const reloadProgress = useAppStore((s) => s.reloadProgress);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const configured = isSupabaseConfigured();
  // 既定ではスタッフの自己登録を無効化（アカウントは管理者が発行）。
  // NEXT_PUBLIC_ALLOW_SIGNUP=true を設定すると新規登録ボタンを表示する。
  const allowSignup = process.env.NEXT_PUBLIC_ALLOW_SIGNUP === "true";

  async function signIn() {
    const supabase = getBrowserSupabase();
    if (!supabase) return;
    setBusy(true);
    setError(null);
    setMessage(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) {
      setError(error.message);
      return;
    }
    await reloadProgress();
    router.push("/");
  }

  async function signUp() {
    const supabase = getBrowserSupabase();
    if (!supabase) return;
    setBusy(true);
    setError(null);
    setMessage(null);
    const { data, error } = await supabase.auth.signUp({ email, password });
    setBusy(false);
    if (error) {
      setError(error.message);
      return;
    }
    if (data.session) {
      await reloadProgress();
      router.push("/");
    } else {
      setMessage("確認メールを送信しました。メール内のリンクから登録を完了してください。");
    }
  }

  return (
    <AppFrame title="ログイン" showBack>
      {!configured ? (
        <div className="ok-box">
          現在はゲストモードで動作しています。学習データはこの端末に保存されます。
          <br />
          複数のスタッフでアカウントごとに進捗を管理するには、環境変数に Supabase
          を設定してください。
        </div>
      ) : (
        <>
          <div className="tec-card">
            <p className="mb-3 text-[13px] leading-relaxed text-ink-soft">
              スタッフごとにアカウントを作成すると、練習履歴・保存フレーズ・復習リストを
              端末を問わず引き継げます。
            </p>

            <label className="mb-1 block text-xs font-bold text-wood-dark">
              メールアドレス
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              className="mb-3 w-full rounded-xl border border-beige-dark bg-white px-3 py-2.5 text-[15px] text-ink outline-none focus:border-sage-mid"
              placeholder="staff@example.com"
            />

            <label className="mb-1 block text-xs font-bold text-wood-dark">
              パスワード
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              className="w-full rounded-xl border border-beige-dark bg-white px-3 py-2.5 text-[15px] text-ink outline-none focus:border-sage-mid"
              placeholder="6文字以上"
            />
          </div>

          {error && <div className="warn-box mb-3">{error}</div>}
          {message && <div className="ok-box mb-3">{message}</div>}

          <div className="flex flex-col gap-3">
            <button
              className="btn btn-primary disabled:opacity-60"
              disabled={busy || !email || !password}
              onClick={() => void signIn()}
            >
              ログイン
            </button>
            {allowSignup && (
              <button
                className="btn btn-secondary disabled:opacity-60"
                disabled={busy || !email || !password}
                onClick={() => void signUp()}
              >
                新規登録
              </button>
            )}
          </div>

          {!allowSignup && (
            <p className="mt-3 text-center text-[12px] leading-relaxed text-ink-soft">
              アカウントは管理者が発行します。ログインできない場合は
              店舗の管理者にお問い合わせください。
            </p>
          )}
        </>
      )}
    </AppFrame>
  );
}
