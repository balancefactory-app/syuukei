import type { Category } from "@/lib/types";

/** フレーズ・シナリオの分類（14種）— プロトタイプの CATEGORIES を移植 */
export const CATEGORIES: Category[] = [
  { id: "reception", ja: "受付" },
  { id: "salon", ja: "古民家サロンの案内" },
  { id: "intake", ja: "問診" },
  { id: "pre", ja: "施術前" },
  { id: "during", ja: "施術中" },
  { id: "position", ja: "体勢変更" },
  { id: "post", ja: "施術後" },
  { id: "checkout", ja: "会計" },
  { id: "menu", ja: "メニュー・料金の説明" },
  { id: "photo", ja: "撮影・SNS対応" },
  { id: "sightseeing", ja: "観光ついでの接客" },
  { id: "trouble", ja: "トラブル対応" },
  { id: "language", ja: "英語対応・翻訳アプリ" },
  { id: "medical", ja: "医療的な質問への安全な返答" },
];

/** サロンのメニュー一覧（ホーム画面）*/
export const SALON_MENU = [
  "マッサージ",
  "整体",
  "鍼",
  "加圧トレーニング",
  "小顔",
  "パーソナルストレッチ",
];
