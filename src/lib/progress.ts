"use client";

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  setDoc,
  updateDoc,
  writeBatch,
  type Firestore,
} from "firebase/firestore";
import type { Mistake, ProgressSnapshot, SavedPhrase } from "@/lib/types";

/**
 * 学習進捗の永続化レイヤー。
 * - ログイン時: Firestore（`users/{uid}/...` サブコレクション）
 * - 未ログイン / Firebase未構成: localStorage（ゲストモード）
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

// --- Firestore 実装（ログイン時）------------------------------------------

class FirestoreRepo implements ProgressRepo {
  constructor(
    private readonly db: Firestore,
    private readonly uid: string,
  ) {}

  private col(name: string) {
    return collection(this.db, "users", this.uid, name);
  }

  async load(): Promise<ProgressSnapshot> {
    const [sessionsSnap, phrasesSnap, mistakesSnap] = await Promise.all([
      getDocs(query(this.col("sessions"), orderBy("createdAt", "asc"))),
      getDocs(this.col("savedPhrases")),
      getDocs(query(this.col("mistakes"), orderBy("createdAt", "desc"))),
    ]);

    const savedPhrases: Record<string, SavedPhrase> = {};
    phrasesSnap.forEach((d) => {
      const p = d.data() as SavedPhrase;
      savedPhrases[p.key] = {
        key: p.key,
        ja: p.ja,
        simple: p.simple,
        natural: p.natural,
        kana: p.kana,
      };
    });

    const mistakeBank: Mistake[] = mistakesSnap.docs.map((d) => {
      const m = d.data() as {
        scenarioJa: string;
        label: string;
        from: string;
        to: string;
        kana?: string;
        note?: string;
        mastered: boolean;
        createdAt: number;
      };
      return {
        id: d.id,
        scenarioJa: m.scenarioJa,
        label: m.label,
        from: m.from,
        to: m.to,
        kana: m.kana ?? "",
        note: m.note ?? "",
        date: new Date(m.createdAt).toLocaleDateString("ja-JP"),
        mastered: m.mastered,
      };
    });

    const scoreHistory = sessionsSnap.docs.map(
      (d) => (d.data() as { overall: number }).overall,
    );

    return {
      sessionsDone: sessionsSnap.size,
      scoreHistory,
      savedPhrases,
      mistakeBank,
    };
  }

  async addSession(input: AddSessionInput): Promise<void> {
    const now = Date.now();
    await addDoc(this.col("sessions"), {
      overall: input.overall,
      scenarioId: input.scenarioId,
      scenarioJa: input.scenarioJa,
      createdAt: now,
    });

    await Promise.all(
      input.mistakes.map((m, i) =>
        setDoc(doc(this.col("mistakes"), m.id), {
          scenarioJa: m.scenarioJa,
          label: m.label,
          from: m.from,
          to: m.to,
          kana: m.kana,
          note: m.note,
          mastered: m.mastered,
          // 同一セッション内の並び順を保つため i をわずかに加算
          createdAt: now + i,
        }),
      ),
    );
  }

  async addSavedPhrase(phrase: SavedPhrase): Promise<void> {
    await setDoc(doc(this.col("savedPhrases"), phrase.key), {
      key: phrase.key,
      ja: phrase.ja,
      simple: phrase.simple,
      natural: phrase.natural,
      kana: phrase.kana,
    });
  }

  async removeSavedPhrase(key: string): Promise<void> {
    await deleteDoc(doc(this.col("savedPhrases"), key));
  }

  async setMastered(id: string, mastered: boolean): Promise<void> {
    await updateDoc(doc(this.col("mistakes"), id), { mastered });
  }

  async reset(): Promise<void> {
    for (const name of ["sessions", "savedPhrases", "mistakes"]) {
      const snap = await getDocs(this.col(name));
      // 500件ずつバッチ削除
      let batch = writeBatch(this.db);
      let count = 0;
      for (const d of snap.docs) {
        batch.delete(d.ref);
        count += 1;
        if (count >= 450) {
          await batch.commit();
          batch = writeBatch(this.db);
          count = 0;
        }
      }
      if (count > 0) await batch.commit();
    }
  }
}

/** 現在の認証状態に応じて適切なリポジトリを返す。 */
export function createProgressRepo(
  db: Firestore | null,
  userId: string | null,
): ProgressRepo {
  if (db && userId) return new FirestoreRepo(db, userId);
  return new LocalRepo();
}
