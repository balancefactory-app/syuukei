"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import AppFrame from "@/components/AppFrame";
import { useAppStore } from "@/lib/store";
import { getScenario } from "@/data/scenarios";

export default function ResultsPage() {
  const router = useRouter();
  const result = useAppStore((s) => s.lastResult);
  const startScenario = useAppStore((s) => s.startScenario);

  useEffect(() => {
    if (!result) router.replace("/");
  }, [result, router]);

  if (!result) {
    return (
      <AppFrame title="学習結果" showBack>
        <div className="empty">
          <div className="mb-2.5 text-4xl">📖</div>
          まだ結果がありません。
        </div>
      </AppFrame>
    );
  }

  const metrics = [
    { num: result.clarity, lbl: "通じやすさ" },
    { num: result.politeness, lbl: "丁寧さ" },
    { num: result.safety, lbl: "安全性" },
    { num: result.naturalness, lbl: "自然さ" },
  ];

  function retry() {
    const sc = getScenario(result!.scenarioId);
    if (sc) {
      startScenario(sc);
      router.push(`/roleplay/${sc.id}`);
    }
  }

  return (
    <AppFrame title="学習結果" showBack>
      <div className="tec-card">
        <div className="flex flex-col items-center pb-2 pt-5">
          <div className="font-serif text-[50px] font-bold leading-none text-sage-dark">
            {result.overall}
          </div>
          <div className="mt-1 text-[13px] text-ink-soft">
            総合スコア（{result.scenarioJa}）
          </div>
          {result.source === "ai" && (
            <div className="mt-1 text-[10px] font-bold tracking-wide text-wood-dark">
              ✨ AIによる採点・添削
            </div>
          )}
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          {metrics.map((m) => (
            <div key={m.lbl} className="metric">
              <div className="metric-num">{m.num}</div>
              <div className="metric-lbl">{m.lbl}</div>
            </div>
          ))}
        </div>
      </div>

      {result.aiComment && (
        <div className="ok-box mb-3.5">{result.aiComment}</div>
      )}

      {result.riskyHit && (
        <div className="warn-box mb-3.5">
          ⚠
          治療効果を断定する表現が含まれていました。下の改善ポイントで安全な言い換えを確認しましょう。
        </div>
      )}

      <div className="section-title section-title-first">改善ポイント（上位3つ）</div>
      {result.points.map((p, i) => (
        <div key={i} className="improve-card">
          <div className="text-[13px] font-bold text-wood-dark">
            <span className="improve-num">{i + 1}</span>
            {p.label}
          </div>
          <div className="my-2 flex flex-wrap items-center gap-2">
            <span className="arrow-from">{p.from}</span>
            <span>→</span>
            <span className="arrow-to">{p.to}</span>
          </div>
          {p.kana && <div className="kana !pl-0">{p.kana}</div>}
          {p.note && <div className="meta-row">{p.note}</div>}
        </div>
      ))}

      <div className="section-title">次に覚えるべき1文</div>
      <div className="tec-card border-2 border-sage-mid">
        <div className="text-[15px] font-bold text-sage-dark">
          {result.nextPhrase.natural}
        </div>
        <div className="mt-1 text-[13px] text-ink-soft">{result.nextPhrase.ja}</div>
        <div className="kana mt-1.5 !pl-0">{result.nextPhrase.kana}</div>
      </div>

      <div className="mt-[18px] flex flex-col gap-3">
        <button className="btn btn-primary" onClick={retry}>
          🔁　もう一度練習する
        </button>
        <button className="btn btn-secondary" onClick={() => router.push("/scenarios")}>
          🎭　別のシナリオへ
        </button>
        <button className="btn btn-ghost" onClick={() => router.push("/")}>
          🏡　ホームに戻る
        </button>
      </div>
    </AppFrame>
  );
}
