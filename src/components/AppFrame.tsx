"use client";

import { useRouter, usePathname } from "next/navigation";
import type { ReactNode } from "react";

type NavKey = "home" | "phrases" | "review";

const NAV_ITEMS: { key: NavKey; ic: string; label: string; href: string }[] = [
  { key: "home", ic: "🏡", label: "ホーム", href: "/" },
  { key: "phrases", ic: "🗂", label: "フレーズ", href: "/phrases" },
  { key: "review", ic: "📖", label: "復習", href: "/review" },
];

interface Props {
  title?: string;
  showBack?: boolean;
  children: ReactNode;
}

/**
 * プロトタイプの #shell 相当。のれん・トップバー・コンテンツ・ボトムナビを描画。
 * モバイル想定の 430px 中央寄せ1カラムレイアウト。
 */
export default function AppFrame({ title = "", showBack = false, children }: Props) {
  const router = useRouter();
  const pathname = usePathname();

  const activeKey: NavKey | null =
    pathname === "/"
      ? "home"
      : pathname.startsWith("/phrases")
        ? "phrases"
        : pathname.startsWith("/review")
          ? "review"
          : null;

  return (
    <div className="relative mx-auto flex min-h-screen w-full max-w-shell flex-col bg-cream">
      <div className="noren" />

      {/* トップバー */}
      <div className="flex items-center gap-2.5 px-[18px] pb-2.5 pt-4">
        {showBack ? (
          <button
            aria-label="戻る"
            onClick={() => router.push("/")}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-beige-dark bg-white text-lg text-sage-dark press"
          >
            ←
          </button>
        ) : (
          <div className="w-9" />
        )}
        <div className="font-serif text-lg font-bold text-sage-dark">{title}</div>
      </div>

      {/* コンテンツ */}
      <div className="flex-1 p-[18px] pb-[100px]">{children}</div>

      {/* ボトムナビ */}
      <div
        className="sticky bottom-0 left-0 right-0 flex border-t border-beige-dark bg-white px-1.5 pt-2"
        style={{ paddingBottom: "calc(8px + env(safe-area-inset-bottom))" }}
      >
        {NAV_ITEMS.map((it) => (
          <button
            key={it.key}
            onClick={() => router.push(it.href)}
            className={`navbtn ${activeKey === it.key ? "navbtn-active" : ""}`}
          >
            <span className="text-xl">{it.ic}</span>
            <span>{it.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
