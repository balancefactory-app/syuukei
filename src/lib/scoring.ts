import type { ImprovementPoint, RiskyWord, Scenario, ScoreResult } from "@/lib/types";
import { PHRASES } from "@/data/phrases";
import {
  NATURAL_CONNECTORS,
  POLITE_WORDS,
  RISKY_WORDS,
} from "@/data/scoring-constants";

/**
 * ルールベース採点。プロトタイプの computeScores / buildImprovementPoints /
 * finishSession のロジックを移植したもの。
 * Claude API が未設定 or 失敗した場合のフォールバックとして使用する。
 */

function countMatches(text: string, list: string[]): number {
  const low = text.toLowerCase();
  let c = 0;
  for (const w of list) if (low.includes(w)) c++;
  return c;
}

/** 断定表現（cure/heal/diagnose 等）の検出。AI採点でも安全確認に併用する。 */
export function detectRisky(allText: string): RiskyWord | null {
  const low = allText.toLowerCase();
  for (const r of RISKY_WORDS) {
    if (low.includes(r.w)) return r;
  }
  return null;
}

interface RawScores {
  politeness: number;
  safety: number;
  clarity: number;
  naturalness: number;
  riskyHit: RiskyWord | null;
  weakestIdx: number;
}

function computeScores(scenario: Scenario, userAnswers: string[]): RawScores {
  const allText = userAnswers.join(" ");

  const politeCount = countMatches(allText, POLITE_WORDS);
  const politeness = Math.max(30, Math.min(100, 45 + politeCount * 18));

  const riskyHit = detectRisky(allText);
  const safety = riskyHit ? 45 : 100;

  let clarityTotal = 0;
  userAnswers.forEach((ans, i) => {
    const turn = scenario.turns[i];
    const words = ans.split(/\s+/).filter(Boolean);
    let lenScore = 100;
    if (words.length < 2) lenScore = 35;
    else if (words.length < 4) lenScore = 65;
    else if (words.length > 30) lenScore = 70;
    const kwHits = turn ? countMatches(ans, turn.keywords) : 0;
    const kwScore = Math.min(
      100,
      (kwHits / Math.max(1, turn ? turn.keywords.length : 1)) * 100 + 30,
    );
    clarityTotal += lenScore * 0.5 + kwScore * 0.5;
  });
  const clarity = Math.round(clarityTotal / Math.max(1, userAnswers.length));

  const naturalCount = countMatches(allText, NATURAL_CONNECTORS);
  const naturalness = Math.max(30, Math.min(100, 50 + naturalCount * 15));

  let weakestIdx = 0;
  let weakestScore = 999;
  userAnswers.forEach((ans, i) => {
    const turn = scenario.turns[i];
    const kwHits = turn ? countMatches(ans, turn.keywords) : 0;
    if (kwHits < weakestScore) {
      weakestScore = kwHits;
      weakestIdx = i;
    }
  });

  return { politeness, safety, clarity, naturalness, riskyHit, weakestIdx };
}

function buildImprovementPoints(
  scenario: Scenario,
  scores: RawScores,
): ImprovementPoint[] {
  const catPhrases = PHRASES[scenario.category] ?? [];
  const n = Math.max(1, catPhrases.length);
  const refPhrase = catPhrases[scores.weakestIdx % n];
  const politePhrase = catPhrases[(scores.weakestIdx + 1) % n];

  const candidates: ImprovementPoint[] = [
    {
      key: "safety",
      label: "安全性",
      score: scores.safety,
      from: scores.riskyHit ? scores.riskyHit.w : "(断定表現なし)",
      to: scores.riskyHit
        ? scores.riskyHit.safe
        : "I can help you relax and support your comfort",
      kana: "",
      note: scores.riskyHit
        ? "治療効果を断定する表現は避けましょう。"
        : "診断・治療を断定する表現には引き続き注意しましょう。",
    },
    {
      key: "clarity",
      label: "通じやすさ",
      score: scores.clarity,
      from: refPhrase?.simple ?? "",
      to: refPhrase?.natural ?? "",
      kana: refPhrase?.kana ?? "",
      note: refPhrase?.note || "より具体的な単語を使うと伝わりやすくなります。",
    },
    {
      key: "politeness",
      label: "丁寧さ",
      score: scores.politeness,
      from: politePhrase?.simple ?? "",
      to: politePhrase?.natural ?? "",
      kana: politePhrase?.kana ?? "",
      note: '"please"や"could you"を加えると、より丁寧な印象になります。',
    },
    {
      key: "naturalness",
      label: "自然さ",
      score: scores.naturalness,
      from: refPhrase?.simple ?? "",
      to: refPhrase?.natural ?? "",
      kana: refPhrase?.kana ?? "",
      note: "簡単な英語も伝わりますが、自然な言い方も覚えてみましょう。",
    },
  ];

  candidates.sort((a, b) => a.score - b.score);
  return candidates.slice(0, 3);
}

/** ルールベースで採点結果を組み立てる */
export function computeRuleBasedResult(
  scenario: Scenario,
  userAnswers: string[],
): ScoreResult {
  const scores = computeScores(scenario, userAnswers);
  const overall = Math.round(
    (scores.politeness + scores.safety + scores.clarity + scores.naturalness) / 4,
  );
  const points = buildImprovementPoints(scenario, scores);

  const catPhrases = PHRASES[scenario.category] ?? [];
  const nextPhrase =
    catPhrases[(scores.weakestIdx + 2) % Math.max(1, catPhrases.length)];

  return {
    scenarioId: scenario.id,
    scenarioJa: scenario.ja,
    overall,
    clarity: scores.clarity,
    politeness: scores.politeness,
    safety: scores.safety,
    naturalness: scores.naturalness,
    riskyHit: scores.riskyHit,
    points,
    nextPhrase: {
      natural: nextPhrase?.natural ?? "",
      ja: nextPhrase?.ja ?? "",
      kana: nextPhrase?.kana ?? "",
    },
    source: "rule",
  };
}
