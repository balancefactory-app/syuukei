"use client";

import { useState } from "react";
import AppFrame from "@/components/AppFrame";
import { useAppStore } from "@/lib/store";
import { CATEGORIES } from "@/data/categories";
import { PHRASES } from "@/data/phrases";
import { speak } from "@/lib/speak";
import type { Phrase } from "@/lib/types";

export default function PhrasesPage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const savedPhrases = useAppStore((s) => s.progress.savedPhrases);
  const toggleSavePhrase = useAppStore((s) => s.toggleSavePhrase);

  const chips = [{ id: "all", ja: "すべて" }, ...CATEGORIES];
  const activeCats =
    activeCategory === "all"
      ? CATEGORIES
      : CATEGORIES.filter((c) => c.id === activeCategory);

  return (
    <AppFrame title="フレーズカード" showBack>
      <div className="no-scrollbar mb-3 flex gap-2 overflow-x-auto pb-1.5">
        {chips.map((c) => (
          <button
            key={c.id}
            className={`chip ${activeCategory === c.id ? "chip-active" : ""}`}
            onClick={() => setActiveCategory(c.id)}
          >
            {c.ja}
          </button>
        ))}
      </div>

      {activeCats.map((cat) => (
        <div key={cat.id}>
          <div className="section-title">{cat.ja}</div>
          {(PHRASES[cat.id] ?? []).map((p: Phrase, i: number) => {
            const key = `${cat.id}-${i}`;
            const saved = Boolean(savedPhrases[key]);
            return (
              <div key={key} className="phrase-card">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 text-[15px] font-bold text-ink">{p.ja}</div>
                  <div className="flex gap-1.5">
                    <button
                      className="icon-btn"
                      aria-label="発音を聞く"
                      onClick={() => speak(p.natural)}
                    >
                      🔊
                    </button>
                    <button
                      className={`icon-btn ${saved ? "icon-btn-saved" : ""}`}
                      aria-label="保存"
                      onClick={() =>
                        void toggleSavePhrase({
                          key,
                          ja: p.ja,
                          simple: p.simple,
                          natural: p.natural,
                          kana: p.kana,
                        })
                      }
                    >
                      {saved ? "★" : "☆"}
                    </button>
                  </div>
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
                <div className="meta-row">
                  <b className="text-ink">使う場面：</b>
                  {p.useCase}
                </div>
                {p.note && (
                  <div className="meta-row">
                    <b className="text-ink">注意点：</b>
                    {p.note}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </AppFrame>
  );
}
