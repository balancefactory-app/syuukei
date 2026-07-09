import type { RiskyWord } from "@/lib/types";

/** 治療効果を断定する危険ワードと安全な言い換え候補 */
export const RISKY_WORDS: RiskyWord[] = [
  { w: "cure", safe: "I can help you relax and support your comfort" },
  { w: "cures", safe: "can help support your comfort" },
  { w: "cured", safe: "felt more relaxed" },
  { w: "heal", safe: "help your body relax" },
  { w: "heals", safe: "helps you feel more comfortable" },
  { w: "healed", safe: "felt better" },
  { w: "diagnose", safe: "I'm not able to diagnose, but I can help you relax" },
  { w: "diagnosis", safe: "a doctor's opinion" },
  { w: "treat your", safe: "support your" },
  { w: "guarantee", safe: "I hope this helps, though results can vary" },
  { w: "fix your", safe: "support your" },
  { w: "prescribe", safe: "recommend seeing a doctor about" },
];

/** スコアリング用キーワード（丁寧さ）*/
export const POLITE_WORDS = [
  "please",
  "could you",
  "would you",
  "thank you",
  "thanks",
  "sorry",
  "excuse me",
  "may i",
  "shall we",
  "i appreciate",
];

/** スコアリング用キーワード（自然さのつなぎ表現）*/
export const NATURAL_CONNECTORS = [
  "let me",
  "i can",
  "i recommend",
  "i'd recommend",
  "if you",
  "just let me know",
  "a little",
  "a bit",
  "i hope",
  "i'll",
];

/** AI（お客様役）の相槌バリエーション */
export const ACKS = [
  "Oh, I see.",
  "Got it, thank you.",
  "Sure, no problem.",
  "Ah, okay.",
  "I understand.",
];
