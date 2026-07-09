"use client";

import { useEffect } from "react";
import { useAppStore } from "@/lib/store";

/**
 * アプリ起動時に一度だけ認証状態と学習進捗を読み込む。
 * ルートレイアウトに配置する（表示要素は持たない）。
 */
export default function AppBootstrap() {
  const init = useAppStore((s) => s.init);
  useEffect(() => {
    void init();
  }, [init]);
  return null;
}
