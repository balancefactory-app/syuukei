"use client";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Mistake, ProgressSnapshot, SavedPhrase } from "@/lib/types";

/**
 * 学習進捗の永続化レイヤー。
 * - ログイン時: Supabase（RLS付きテーブル）
 * - 未ログイン / Supabase未構成: localStorage（ゲストモード）
 * どちらも同じ ProgressRepo インターフェースを実装する。
 */

export interface AddSessionInput {
  overall: number;
  scenarioId: string;
  scenarioJa: string;
  mistakes: Mistake[];
}

export interface ProgressRepo {
  load(): Promise<ProgressSnapshot>;
  addSession(input: AddSessionInput): Promise<void>;
  addSavedPhrase(phrase: SavedPhrase): Promise<void>;
  removeSavedPhrase(key: string): Promise<void>;
  setMastered(id: string, mastered: boolean): Promise<void>;
  reset(): Promise<void>;
}

const EMPTY: ProgressSnapshot = {
  sessionsDone: 0,
  scoreHistory: [],
  savedPhrases: {},
  mistakeBank: [],
};

// --- localStorage 実装（ゲストモード）-------------------------------------

const STORAGE_KEY = "tec_progress_v2";

class LocalRepo implements ProgressRepo {
  private read(): ProgressSnapshot {
    if (typeof window === "undefined") return { ...EMPTY };
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return { ...EMPTY };
      const parsed = JSON.parse(raw) as Partial<ProgressSnapshot>;
      return {
        sessionsDone: parsed.sessionsDone ?? 0,
        scoreHistory: parsed.scoreHistory ?? [],
        savedPhrases: parsed.savedPhrases ?? {},
        mistakeBank: parsed.mistakeBank ?? [],
      };
    } catch (e) {
      console.warn("学習データの読み込みに失敗しました。", e);
      return { ...EMPTY };
    }
  }

  private write(data: ProgressSnapshot): void {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn("学習データの保存に失敗しました。", e);
    }
  }

  async load(): Promise<ProgressSnapshot> {
    return this.read();
  }

  async addSession(input: AddSessionInput): Promise<void> {
    const data = this.read();
    data.sessionsDone += 1;
    data.scoreHistory.push(input.overall);
    // 新しい間違いを先頭に追加（プロトタイプ踏襲）
    data.mistakeBank = [...input.mistakes, ...data.mistakeBank];
    this.write(data);
  }

  async addSavedPhrase(phrase: SavedPhrase): Promise<void> {
    const data = this.read();
    data.savedPhrases[phrase.key] = phrase;
    this.write(data);
  }

  async removeSavedPhrase(key: string): Promise<void> {
    const data = this.read();
    delete data.savedPhrases[key];
    this.write(data);
  }

  async setMastered(id: string, mastered: boolean): Promise<void> {
    const data = this.read();
    data.mistakeBank = data.mistakeBank.map((m) =>
      m.id === id ? { ...m, mastered } : m,
    );
    this.write(data);
  }

  async reset(): Promise<void> {
    this.write({ ...EMPTY });
  }
}

// --- Supabase 実装（ログイン時）-------------------------------------------

class SupabaseRepo implements ProgressRepo {
  constructor(
    private readonly supabase: SupabaseClient,
    private readonly userId: string,
  ) {}

  async load(): Promise<ProgressSnapshot> {
    const [sessionsRes, phrasesRes, mistakesRes] = await Promise.all([
      this.supabase
        .from("sessions")
        .select("overall, created_at")
        .eq("user_id", this.userId)
        .order("created_at", { ascending: true }),
      this.supabase
        .from("saved_phrases")
        .select("key, ja, simple, natural, kana")
        .eq("user_id", this.userId),
      this.supabase
        .from("mistakes")
        .select("id, scenario_ja, label, from_text, to_text, kana, note, mastered, created_at")
        .eq("user_id", this.userId)
        .order("created_at", { ascending: false }),
    ]);

    const sessions = sessionsRes.data ?? [];
    const savedPhrases: Record<string, SavedPhrase> = {};
    for (const p of phrasesRes.data ?? []) {
      savedPhrases[p.key] = {
        key: p.key,
        ja: p.ja,
        simple: p.simple,
        natural: p.natural,
        kana: p.kana,
      };
    }

    const mistakeBank: Mistake[] = (mistakesRes.data ?? []).map((m) => ({
      id: m.id,
      scenarioJa: m.scenario_ja,
      label: m.label,
      from: m.from_text,
      to: m.to_text,
      kana: m.kana ?? "",
      note: m.note ?? "",
      date: new Date(m.created_at).toLocaleDateString("ja-JP"),
      mastered: m.mastered,
    }));

    return {
      sessionsDone: sessions.length,
      scoreHistory: sessions.map((s) => s.overall),
      savedPhrases,
      mistakeBank,
    };
  }

  async addSession(input: AddSessionInput): Promise<void> {
    await this.supabase.from("sessions").insert({
      user_id: this.userId,
      overall: input.overall,
      scenario_id: input.scenarioId,
      scenario_ja: input.scenarioJa,
    });

    if (input.mistakes.length > 0) {
      await this.supabase.from("mistakes").insert(
        input.mistakes.map((m) => ({
          id: m.id,
          user_id: this.userId,
          scenario_ja: m.scenarioJa,
          label: m.label,
          from_text: m.from,
          to_text: m.to,
          kana: m.kana,
          note: m.note,
          mastered: m.mastered,
        })),
      );
    }
  }

  async addSavedPhrase(phrase: SavedPhrase): Promise<void> {
    await this.supabase.from("saved_phrases").upsert(
      {
        user_id: this.userId,
        key: phrase.key,
        ja: phrase.ja,
        simple: phrase.simple,
        natural: phrase.natural,
        kana: phrase.kana,
      },
      { onConflict: "user_id,key" },
    );
  }

  async removeSavedPhrase(key: string): Promise<void> {
    await this.supabase
      .from("saved_phrases")
      .delete()
      .eq("user_id", this.userId)
      .eq("key", key);
  }

  async setMastered(id: string, mastered: boolean): Promise<void> {
    await this.supabase
      .from("mistakes")
      .update({ mastered })
      .eq("user_id", this.userId)
      .eq("id", id);
  }

  async reset(): Promise<void> {
    await Promise.all([
      this.supabase.from("sessions").delete().eq("user_id", this.userId),
      this.supabase.from("saved_phrases").delete().eq("user_id", this.userId),
      this.supabase.from("mistakes").delete().eq("user_id", this.userId),
    ]);
  }
}

/** 現在の認証状態に応じて適切なリポジトリを返す。 */
export function createProgressRepo(
  supabase: SupabaseClient | null,
  userId: string | null,
): ProgressRepo {
  if (supabase && userId) return new SupabaseRepo(supabase, userId);
  return new LocalRepo();
}
