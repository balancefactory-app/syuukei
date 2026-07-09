"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import AppFrame from "@/components/AppFrame";
import { useAppStore } from "@/lib/store";
import { getScenario } from "@/data/scenarios";

export default function RoleplayPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params.id;
  const scenario = getScenario(id);

  const session = useAppStore((s) => s.session);
  const scoring = useAppStore((s) => s.scoring);
  const scoringError = useAppStore((s) => s.scoringError);
  const startScenario = useAppStore((s) => s.startScenario);
  const sendAnswer = useAppStore((s) => s.sendAnswer);

  const [text, setText] = useState("");
  const chatRef = useRef<HTMLDivElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);

  // 直接遷移・リロード時、このシナリオのセッションが無ければ開始する
  useEffect(() => {
    if (!scenario) return;
    if (!session || session.scenarioId !== scenario.id) {
      startScenario(scenario);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scenario?.id]);

  // 新しいメッセージが来たら一番下までスクロール
  useEffect(() => {
    const el = chatRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [session?.messages.length, scoring]);

  if (!scenario) {
    return (
      <AppFrame title="" showBack>
        <div className="empty">
          <div className="mb-2.5 text-4xl">🤔</div>
          シナリオが見つかりませんでした。
        </div>
      </AppFrame>
    );
  }

  const activeSession =
    session && session.scenarioId === scenario.id ? session : null;
  const turnIndex = activeSession?.turnIndex ?? 0;
  const progressPct = Math.round((turnIndex / scenario.turns.length) * 100);

  async function handleSend() {
    const value = text.trim();
    if (!value || scoring) return;
    setText("");
    if (taRef.current) taRef.current.style.height = "auto";
    const outcome = await sendAnswer(value);
    if (outcome === "finished" && !useAppStore.getState().scoringError) {
      router.push("/results");
    }
  }

  return (
    <AppFrame title={scenario.ja} showBack>
      <div className="persona-card">
        <div className="text-3xl">{scenario.persona.emoji}</div>
        <div>
          <div className="text-sm font-bold text-ink">
            {scenario.persona.name}さん
          </div>
          <div className="text-xs text-ink-soft">{scenario.persona.trait}</div>
        </div>
      </div>

      <div className="tec-card mb-2 !py-2.5">
        <div className="flex justify-between text-xs text-ink-soft">
          <span>{scenario.desc}</span>
          <span>
            {turnIndex + 1} / {scenario.turns.length}
          </span>
        </div>
        <div className="bar-bg">
          <div className="bar-fill" style={{ width: `${progressPct}%` }} />
        </div>
      </div>

      <div className="pb-3 text-center text-[11px] text-ink-soft">
        文法が多少違っても大丈夫です。会話は止まりません。
      </div>

      <div
        ref={chatRef}
        className="mb-3.5 flex max-h-[48vh] flex-col gap-3 overflow-y-auto pr-0.5"
      >
        {activeSession?.messages.map((m, i) => (
          <div
            key={i}
            className={`bubble ${
              m.role === "ai" ? "bubble-ai" : m.role === "tip" ? "bubble-tip" : "bubble-user"
            }`}
          >
            {m.text}
            {m.role === "ai" && m.hint && (
              <div className="mt-1.5 border-t border-dashed border-sage-mid pt-1.5 text-[12px] text-ink-soft">
                💡 {m.hint}
              </div>
            )}
          </div>
        ))}

        {scoring && (
          <div className="bubble bubble-ai animate-pulse">
            採点中です… 少々お待ちください 🍵
          </div>
        )}
      </div>

      {scoringError && (
        <div className="warn-box mb-3">{scoringError}</div>
      )}

      <div className="composer">
        <textarea
          ref={taRef}
          rows={1}
          value={text}
          disabled={scoring}
          placeholder="ここに英語で返信を入力してください..."
          onChange={(e) => {
            setText(e.target.value);
            e.target.style.height = "auto";
            e.target.style.height = `${Math.min(90, e.target.scrollHeight)}px`;
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void handleSend();
            }
          }}
          className="max-h-[90px] min-h-[22px] flex-1 resize-none border-0 bg-transparent p-2 text-[15px] text-ink outline-none"
        />
        <button
          onClick={() => void handleSend()}
          disabled={scoring}
          aria-label="送信"
          className="h-11 w-11 shrink-0 cursor-pointer rounded-xl border-0 bg-sage-dark text-lg text-white disabled:opacity-50"
        >
          ➤
        </button>
      </div>

      <div className="mt-3.5">
        <button
          className="btn btn-ghost"
          onClick={() => {
            if (confirm("ロールプレイを終了しますか?")) router.push("/");
          }}
        >
          ✕　途中でやめる
        </button>
      </div>
    </AppFrame>
  );
}
