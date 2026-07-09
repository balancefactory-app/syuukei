"use client";

import AppFrame from "@/components/AppFrame";
import { useAppStore } from "@/lib/store";

export default function ReviewPage() {
  const savedPhrases = useAppStore((s) => s.progress.savedPhrases);
  const mistakeBank = useAppStore((s) => s.progress.mistakeBank);
  const toggleSavePhrase = useAppStore((s) => s.toggleSavePhrase);
  const toggleMastered = useAppStore((s) => s.toggleMastered);
  const resetProgress = useAppStore((s) => s.resetProgress);

  const savedList = Object.entries(savedPhrases);

  return (
    <AppFrame title="復習リスト" showBack>
      <div className="section-title section-title-first">保存したフレーズ</div>
      {savedList.length === 0 ? (
        <div className="empty">
          <div className="mb-2.5 text-4xl">☆</div>
          フレーズカードで★を押すと、ここに保存されます。
        </div>
      ) : (
        savedList.map(([key, p]) => (
          <div key={key} className="phrase-card">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 text-[15px] font-bold text-ink">{p.ja}</div>
              <button
                className="icon-btn icon-btn-saved"
                aria-label="削除"
                onClick={() => void toggleSavePhrase(p)}
              >
                ★
              </button>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <span className="eng-badge eng-badge-simple">かんたん</span>
              <span className="flex-1 text-sm text-ink-soft">{p.simple}</span>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <span className="eng-badge eng-badge-natural">自然</span>
              <span className="flex-1 text-sm text-ink">{p.natural}</span>
            </div>
            <div className="kana pl-[52px]">{p.kana}</div>
          </div>
        ))
      )}

      <div className="section-title">間違えた表現（要復習）</div>
      {mistakeBank.length === 0 ? (
        <div className="empty">
          <div className="mb-2.5 text-4xl">📖</div>
          ロールプレイを終えると、改善ポイントがここに記録されます。
        </div>
      ) : (
        mistakeBank.map((m) => (
          <div
            key={m.id}
            className={`mistake-card ${m.mastered ? "opacity-45" : ""}`}
          >
            <div className="mb-1.5 flex items-center justify-between">
              <span className="tag mb-0">
                {m.scenarioJa} ・ {m.label}
              </span>
              <span className="text-[11px] text-ink-soft">{m.date}</span>
            </div>
            <div className="my-2 flex flex-wrap items-center gap-2">
              <span className="arrow-from">{m.from}</span>
              <span>→</span>
              <span className={`arrow-to ${m.mastered ? "line-through" : ""}`}>
                {m.to}
              </span>
            </div>
            {m.kana && <div className="kana !pl-0">{m.kana}</div>}
            {m.note && <div className="meta-row">{m.note}</div>}
            <div className="mt-2.5 text-right">
              <button
                className={`master-btn ${m.mastered ? "master-btn-on" : ""}`}
                onClick={() => void toggleMastered(m.id)}
              >
                {m.mastered ? "✓ 覚えた" : "覚えた にする"}
              </button>
            </div>
          </div>
        ))
      )}

      <div className="mt-5">
        <button
          className="btn btn-ghost"
          onClick={() => {
            if (
              confirm(
                "練習回数・スコア履歴・保存フレーズ・復習リストをすべて削除します。よろしいですか?",
              )
            ) {
              void resetProgress();
            }
          }}
        >
          🗑　学習データをリセット
        </button>
      </div>
    </AppFrame>
  );
}
