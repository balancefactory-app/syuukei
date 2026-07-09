"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import AppFrame from "@/components/AppFrame";
import { useAppStore } from "@/lib/store";
import { SALON_MENU } from "@/data/categories";

export default function HomePage() {
  const router = useRouter();
  const progress = useAppStore((s) => s.progress);
  const usingSupabase = useAppStore((s) => s.usingSupabase);
  const userEmail = useAppStore((s) => s.userEmail);
  const signOut = useAppStore((s) => s.signOut);

  const avg =
    progress.scoreHistory.length > 0
      ? Math.round(
          progress.scoreHistory.reduce((a, b) => a + b, 0) /
            progress.scoreHistory.length,
        )
      : "–";

  return (
    <AppFrame>
      <div className="home-hero">
        <div className="mb-1.5 text-xs font-bold text-wood-dark">
          BALANCE FACTORY ・ 神奈川県藤沢市片瀬山
        </div>
        <h1 className="mb-1.5 text-[21px] text-sage-dark">
          古民家サロンの
          <br />
          英会話を、ひとつずつ
        </h1>
        <p className="m-0 text-[13px] leading-relaxed text-ink-soft">
          江ノ島・鎌倉観光の外国人ゲストをお迎えする、片瀬山の古民家サロン「バランスファクトリー」スタッフのための英会話練習アプリです。国家資格者の施術を、安全な英語で伝える練習ができます。
        </p>
        <div className="mt-3.5 flex gap-2.5">
          <div className="stat">
            <div className="font-serif text-xl font-bold text-sage-dark">
              {progress.sessionsDone}
            </div>
            <div className="text-[10px] text-ink-soft">練習回数</div>
          </div>
          <div className="stat">
            <div className="font-serif text-xl font-bold text-sage-dark">{avg}</div>
            <div className="text-[10px] text-ink-soft">平均スコア</div>
          </div>
          <div className="stat">
            <div className="font-serif text-xl font-bold text-sage-dark">
              {progress.mistakeBank.length}
            </div>
            <div className="text-[10px] text-ink-soft">復習アイテム</div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <button className="btn btn-primary" onClick={() => router.push("/scenarios")}>
          🎭　ロールプレイを始める
        </button>
        <button className="btn btn-secondary" onClick={() => router.push("/phrases")}>
          🗂　フレーズカードを見る
        </button>
        <button className="btn btn-secondary" onClick={() => router.push("/review")}>
          📖　復習リストを見る
        </button>
      </div>

      <div className="section-title">当店のメニュー</div>
      <div className="tec-card flex flex-wrap gap-2">
        {SALON_MENU.map((m) => (
          <span key={m} className="tag mb-0">
            {m}
          </span>
        ))}
      </div>

      <div className="section-title">こんな場面で使えます</div>
      <div className="tec-card text-[13px] leading-loose text-ink-soft">
        受付・古民家の案内・靴を脱ぐ案内・問診・施術前の同意確認・施術中の声かけ・会計・高価格メニューの説明・撮影/SNS対応・観光ついでの接客・トラブル対応・英語対応/翻訳アプリ・医療的な質問への安全な返答など、19種類の場面を用意しています。それぞれ違う性格のお客様が登場するので、実際の接客に近い形で練習できます。
      </div>

      <div className="ok-box mt-3">
        英語が得意でなくても大丈夫です。&ldquo;My English is limited, but I will do my
        best to help you.&rdquo;
        と伝えたり、翻訳アプリを使ったりしながら、少しずつ慣れていきましょう。
      </div>

      {/* アカウント状態（Supabase構成時のみ）*/}
      {usingSupabase && (
        <div className="mt-4 text-center text-[12px] text-ink-soft">
          {userEmail ? (
            <>
              <span>{userEmail} でログイン中</span>
              <button
                onClick={() => void signOut()}
                className="ml-2 underline decoration-beige-dark"
              >
                ログアウト
              </button>
            </>
          ) : (
            <Link href="/login" className="underline decoration-beige-dark">
              ログインして進捗を端末間で共有する
            </Link>
          )}
        </div>
      )}
    </AppFrame>
  );
}
