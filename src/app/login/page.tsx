"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { FirebaseError } from "firebase/app";
import AppFrame from "@/components/AppFrame";
import { getFirebase } from "@/lib/firebase/client";
import { isFirebaseConfigured } from "@/lib/firebase/config";
import { useAppStore } from "@/lib/store";

/** Firebase の認証エラーを日本語に変換 */
function toJaError(err: unknown): string {
  if (err instanceof FirebaseError) {
    switch (err.code) {
      case "auth/invalid-email":
        return "メールアドレスの形式が正しくありません。";
      case "auth/invalid-credential":
      case "auth/wrong-password":
      case "auth/user-not-found":
        return "メールアドレスまたはパスワードが違います。";
      case "auth/too-many-requests":
        return "試行回数が多すぎます。しばらく待ってからお試しください。";
      case "auth/email-already-in-use":
        return "このメールアドレスは既に登録されています。";
      case "auth/weak-password":
        return "パスワードは6文字以上にしてください。";
      default:
        return err.message;
    }
  }
  return "エラーが発生しました。もう一度お試しください。";
}

export default function LoginPage() {
  const router = useRouter();
  const reloadProgress = useAppStore((s) => s.reloadProgress);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const configured = isFirebaseConfigured();
  // 既定ではスタッフの自己登録を無効化（アカウントは管理者が発行）。
  const allowSignup = process.env.NEXT_PUBLIC_ALLOW_SIGNUP === "true";

  async function signIn() {
    const fb = getFirebase();
    if (!fb) return;
    setBusy(true);
    setError(null);
    try {
      await signInWithEmailAndPassword(fb.auth, email, password);
      await reloadProgress();
      router.push("/");
    } catch (err) {
      setError(toJaError(err));
    } finally {
      setBusy(false);
    }
  }

  async function signUp() {
    const fb = getFirebase();
    if (!fb) return;
    setBusy(true);
    setError(null);
    try {
      await createUserWithEmailAndPassword(fb.auth, email, password);
      await reloadProgress();
      router.push("/");
    } catch (err) {
      setError(toJaError(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <AppFrame title="ログイン" showBack>
      {!configured ? (
        <div className="ok-box">
          現在はゲストモードで動作しています。学習データはこの端末に保存されます。
          <br />
          複数のスタッフでアカウントごとに進捗を管理するには、環境変数に Firebase
          を設定してください。
        </div>
      ) : (
        <>
          <div className="tec-card">
            <p className="mb-3 text-[13px] leading-relaxed text-ink-soft">
              スタッフごとのアカウントでログインすると、練習履歴・保存フレーズ・
              復習リストを端末を問わず引き継げます。
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
