"use client";

import { create } from "zustand";
import type {
  ChatMessage,
  Mistake,
  ProgressSnapshot,
  SavedPhrase,
  Scenario,
  ScoreResult,
} from "@/lib/types";
import { getBrowserSupabase } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createProgressRepo, type ProgressRepo } from "@/lib/progress";
import { getScenario } from "@/data/scenarios";
import { PHRASES } from "@/data/phrases";
import { ACKS } from "@/data/scoring-constants";

interface RoleplaySession {
  scenarioId: string;
  turnIndex: number;
  messages: ChatMessage[];
  userAnswers: string[];
}

interface AppState {
  authReady: boolean;
  usingSupabase: boolean;
  userId: string | null;
  userEmail: string | null;

  progress: ProgressSnapshot;
  progressLoaded: boolean;

  session: RoleplaySession | null;
  lastResult: ScoreResult | null;
  scoring: boolean;
  scoringError: string | null;

  init: () => Promise<void>;
  reloadProgress: () => Promise<void>;
  startScenario: (scenario: Scenario) => void;
  sendAnswer: (text: string) => Promise<"next" | "finished">;
  finishSession: (scenario: Scenario, userAnswers: string[]) => Promise<void>;
  clearSession: () => void;
  toggleSavePhrase: (phrase: SavedPhrase) => Promise<void>;
  toggleMastered: (id: string) => Promise<void>;
  resetProgress: () => Promise<void>;
  signOut: () => Promise<void>;
}

const EMPTY_PROGRESS: ProgressSnapshot = {
  sessionsDone: 0,
  scoreHistory: [],
  savedPhrases: {},
  mistakeBank: [],
};

function currentRepo(state: AppState): ProgressRepo {
  return createProgressRepo(getBrowserSupabase(), state.userId);
}

function countMatches(text: string, list: string[]): number {
  const low = text.toLowerCase();
  return list.reduce((c, w) => (low.includes(w) ? c + 1 : c), 0);
}

function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `m${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

let authSubscribed = false;

export const useAppStore = create<AppState>((set, get) => ({
  authReady: false,
  usingSupabase: isSupabaseConfigured(),
  userId: null,
  userEmail: null,

  progress: EMPTY_PROGRESS,
  progressLoaded: false,

  session: null,
  lastResult: null,
  scoring: false,
  scoringError: null,

  async init() {
    const supabase = getBrowserSupabase();

    if (supabase && !authSubscribed) {
      authSubscribed = true;
      supabase.auth.onAuthStateChange((_event, sess) => {
        const user = sess?.user ?? null;
        set({ userId: user?.id ?? null, userEmail: user?.email ?? null });
        void get().reloadProgress();
      });
    }

    if (supabase) {
      const { data } = await supabase.auth.getUser();
      const user = data.user;
      set({
        userId: user?.id ?? null,
        userEmail: user?.email ?? null,
        authReady: true,
      });
    } else {
      set({ authReady: true });
    }

    await get().reloadProgress();
  },

  async reloadProgress() {
    const repo = currentRepo(get());
    try {
      const progress = await repo.load();
      set({ progress, progressLoaded: true });
    } catch (e) {
      console.warn("進捗の読み込みに失敗しました。", e);
      set({ progress: EMPTY_PROGRESS, progressLoaded: true });
    }
  },

  startScenario(scenario) {
    set({
      session: {
        scenarioId: scenario.id,
        turnIndex: 0,
        messages: [
          {
            role: "ai",
            text: scenario.turns[0].customer,
            hint: scenario.turns[0].hintJa,
          },
        ],
        userAnswers: [],
      },
      lastResult: null,
      scoringError: null,
    });
  },

  async sendAnswer(text) {
    const state = get();
    const session = state.session;
    if (!session) return "next";
    const scenario = getScenario(session.scenarioId);
    if (!scenario) return "next";

    const messages: ChatMessage[] = [
      ...session.messages,
      { role: "user", text },
    ];
    const userAnswers = [...session.userAnswers, text];

    // 的外れな返信には、こんな言い方もできますとヒントフレーズを提示（プロトタイプ踏襲）
    const currentTurn = scenario.turns[session.turnIndex];
    if (countMatches(text, currentTurn.keywords) === 0) {
      const catPhrases = PHRASES[scenario.category] ?? [];
      if (catPhrases.length > 0) {
        const tip = catPhrases[session.turnIndex % catPhrases.length];
        messages.push({
          role: "tip",
          text: `💬 こんな言い方もできます: "${tip.natural}"`,
        });
      }
    }

    if (session.turnIndex < scenario.turns.length - 1) {
      const nextIndex = session.turnIndex + 1;
      const nextTurn = scenario.turns[nextIndex];
      const ack = ACKS[Math.floor(Math.random() * ACKS.length)];
      messages.push({
        role: "ai",
        text: `${ack} ${nextTurn.customer}`,
        hint: nextTurn.hintJa,
      });
      set({
        session: { ...session, turnIndex: nextIndex, messages, userAnswers },
      });
      return "next";
    }

    // 最終ターン: 採点へ
    set({ session: { ...session, messages, userAnswers }, scoring: true, scoringError: null });
    await get().finishSession(scenario, userAnswers);
    return "finished";
  },

  async finishSession(scenario: Scenario, userAnswers: string[]) {
    let result: ScoreResult | null = null;
    try {
      const res = await fetch("/api/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenarioId: scenario.id, userAnswers }),
      });
      if (res.ok) {
        result = (await res.json()) as ScoreResult;
      }
    } catch (e) {
      console.error("採点リクエストに失敗しました。", e);
    }

    if (!result) {
      set({ scoring: false, scoringError: "採点に失敗しました。通信環境をご確認のうえ、もう一度お試しください。" });
      return;
    }

    // 改善ポイントを「間違えた表現（要復習）」として記録
    const date = new Date().toLocaleDateString("ja-JP");
    const mistakes: Mistake[] = result.points.map((p) => ({
      id: newId(),
      scenarioJa: scenario.ja,
      label: p.label,
      from: p.from,
      to: p.to,
      kana: p.kana,
      note: p.note,
      date,
      mastered: false,
    }));

    // 楽観的にローカル状態を更新
    set((s) => ({
      progress: {
        ...s.progress,
        sessionsDone: s.progress.sessionsDone + 1,
        scoreHistory: [...s.progress.scoreHistory, result!.overall],
        mistakeBank: [...mistakes, ...s.progress.mistakeBank],
      },
      lastResult: result,
      scoring: false,
    }));

    try {
      await currentRepo(get()).addSession({
        overall: result.overall,
        scenarioId: scenario.id,
        scenarioJa: scenario.ja,
        mistakes,
      });
    } catch (e) {
      console.warn("学習履歴の保存に失敗しました。", e);
    }
  },

  clearSession() {
    set({ session: null });
  },

  async toggleSavePhrase(phrase) {
    const state = get();
    const already = Boolean(state.progress.savedPhrases[phrase.key]);
    const repo = currentRepo(state);

    if (already) {
      const next = { ...state.progress.savedPhrases };
      delete next[phrase.key];
      set({ progress: { ...state.progress, savedPhrases: next } });
      await repo.removeSavedPhrase(phrase.key);
    } else {
      set({
        progress: {
          ...state.progress,
          savedPhrases: { ...state.progress.savedPhrases, [phrase.key]: phrase },
        },
      });
      await repo.addSavedPhrase(phrase);
    }
  },

  async toggleMastered(id) {
    const state = get();
    const target = state.progress.mistakeBank.find((m) => m.id === id);
    if (!target) return;
    const mastered = !target.mastered;
    set({
      progress: {
        ...state.progress,
        mistakeBank: state.progress.mistakeBank.map((m) =>
          m.id === id ? { ...m, mastered } : m,
        ),
      },
    });
    await currentRepo(state).setMastered(id, mastered);
  },

  async resetProgress() {
    const state = get();
    set({ progress: EMPTY_PROGRESS });
    await currentRepo(state).reset();
  },

  async signOut() {
    const supabase = getBrowserSupabase();
    if (supabase) await supabase.auth.signOut();
    set({ userId: null, userEmail: null });
    await get().reloadProgress();
  },
}));
