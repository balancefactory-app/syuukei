/**
 * アプリ全体で共有する型定義。
 * プロトタイプ (therapy-english-coach.html) のデータ構造を TypeScript 化したもの。
 */

export interface Category {
  id: string;
  ja: string;
}

export interface Phrase {
  ja: string;
  simple: string;
  natural: string;
  kana: string;
  useCase: string;
  note: string;
}

/** カテゴリID → フレーズ配列 */
export type PhraseBank = Record<string, Phrase[]>;

export interface Persona {
  name: string;
  emoji: string;
  trait: string;
}

export interface ScenarioTurn {
  /** お客様（AI役）の発話 */
  customer: string;
  /** 的確な返信に含まれると良いキーワード（フォールバック採点・ヒント用）*/
  keywords: string[];
  /** その場面の日本語ヒント */
  hintJa: string;
}

export interface Scenario {
  id: string;
  ja: string;
  en: string;
  icon: string;
  /** PHRASES のキーに対応（ヒント表示・スコアリングに使用）*/
  category: string;
  persona: Persona;
  desc: string;
  turns: ScenarioTurn[];
}

export interface RiskyWord {
  w: string;
  safe: string;
}

/** ロールプレイ中の1メッセージ */
export interface ChatMessage {
  role: "ai" | "user" | "tip";
  text: string;
  hint?: string;
}

/** 結果画面の改善ポイント1件 */
export interface ImprovementPoint {
  key: string;
  label: string;
  score: number;
  from: string;
  to: string;
  kana: string;
  note: string;
}

/** 採点結果 */
export interface ScoreResult {
  scenarioId: string;
  scenarioJa: string;
  overall: number;
  clarity: number;
  politeness: number;
  safety: number;
  naturalness: number;
  /** 断定表現が検出された場合の危険ワードと安全な言い換え */
  riskyHit: RiskyWord | null;
  points: ImprovementPoint[];
  nextPhrase: { natural: string; ja: string; kana: string };
  /** AI採点時のみ付与される総評コメント（日本語）。ルールベース時は undefined */
  aiComment?: string;
  /** "ai" | "rule" — 採点方式 */
  source: "ai" | "rule";
}

/** 保存フレーズ（復習リスト用）*/
export interface SavedPhrase {
  key: string;
  ja: string;
  simple: string;
  natural: string;
  kana: string;
}

/** 間違えた表現（要復習）*/
export interface Mistake {
  id: string;
  scenarioJa: string;
  label: string;
  from: string;
  to: string;
  kana: string;
  note: string;
  date: string;
  mastered: boolean;
}

/** 永続化される学習進捗のスナップショット */
export interface ProgressSnapshot {
  sessionsDone: number;
  scoreHistory: number[];
  savedPhrases: Record<string, SavedPhrase>;
  mistakeBank: Mistake[];
}
