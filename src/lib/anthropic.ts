import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import type { ImprovementPoint, Scenario, ScoreResult } from "@/lib/types";
import { PHRASES } from "@/data/phrases";
import { detectRisky } from "@/lib/scoring";

/**
 * Claude API による英文採点・添削。
 * HANDOFF §6 の最優先項目「採点ロジックの高度化」を実装する。
 * ANTHROPIC_API_KEY が未設定の場合は null を返し、呼び出し側でルールベースに
 * フォールバックする。
 */

const MODEL = process.env.ANTHROPIC_MODEL || "claude-opus-4-8";

export function isAiScoringAvailable(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

/** Claude に返させる JSON の構造（structured outputs で強制）*/
const SCORE_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    clarity: { type: "integer", description: "通じやすさ 0-100" },
    politeness: { type: "integer", description: "丁寧さ 0-100" },
    safety: { type: "integer", description: "安全性 0-100（治療効果の断定がないか）" },
    naturalness: { type: "integer", description: "自然さ 0-100" },
    comment: {
      type: "string",
      description: "スタッフを励ます日本語の総評（2〜3文、優しい口調）",
    },
    points: {
      type: "array",
      description: "改善ポイント（重要な順に3件）",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          label: {
            type: "string",
            description: "通じやすさ / 丁寧さ / 安全性 / 自然さ のいずれか",
          },
          from: { type: "string", description: "学習者の実際の（または惜しい）英語表現" },
          to: { type: "string", description: "より自然で安全な英語の言い換え" },
          kana: { type: "string", description: "to のカタカナ読み（無ければ空文字）" },
          note: { type: "string", description: "日本語の短いアドバイス" },
        },
        required: ["label", "from", "to", "kana", "note"],
      },
    },
    nextPhrase: {
      type: "object",
      additionalProperties: false,
      properties: {
        natural: { type: "string", description: "次に覚えるべき自然な英語1文" },
        ja: { type: "string", description: "その日本語訳" },
        kana: { type: "string", description: "カタカナ読み" },
      },
      required: ["natural", "ja", "kana"],
    },
  },
  required: [
    "clarity",
    "politeness",
    "safety",
    "naturalness",
    "comment",
    "points",
    "nextPhrase",
  ],
} as const;

interface AiScoreJson {
  clarity: number;
  politeness: number;
  naturalness: number;
  safety: number;
  comment: string;
  points: ImprovementPoint[];
  nextPhrase: { natural: string; ja: string; kana: string };
}

const SYSTEM_PROMPT = `あなたは、神奈川県藤沢市片瀬山の古民家サロン「バランスファクトリー」で働く日本人スタッフの接客英会話コーチです。
スタッフは英語が得意ではありません。江ノ島・鎌倉観光の外国人ゲストに、安全で丁寧な英語で接客できるよう指導します。

# 採点方針
- スコアではなく「次に何を覚えるべきか」に焦点を当て、常に励ますトーンで。
- 4指標を各0〜100で評価する:
  - clarity（通じやすさ）: 意味が正しく伝わるか。文法が多少崩れていても伝われば高評価。
  - politeness（丁寧さ）: please / could you / thank you など接客にふさわしい丁寧さ。
  - safety（安全性）: 【最重要】施術効果を断定していないか。cure / heal / diagnose / guarantee / "fix your ~" のように「治る・治療する・診断する」と受け取れる表現は重大な減点。医師相談を勧める・"relax / support / body care" という言い方は加点。
  - naturalness（自然さ）: ネイティブに自然に響く言い回しか。
- 改善ポイントは重要な順にちょうど3件。from はスタッフの実際の英文（または惜しい箇所）、to はより自然で安全な言い換え。
- nextPhrase は、このシナリオのカテゴリで次に覚えると良い実用的な1文。
- コメント・note・ja は日本語。from / to / natural は英語。kana はカタカナ読み。

出力は指定された JSON スキーマに厳密に従うこと。`;

function buildUserPrompt(scenario: Scenario, userAnswers: string[]): string {
  const catPhrases = PHRASES[scenario.category] ?? [];
  const reference = catPhrases
    .slice(0, 6)
    .map((p) => `- ${p.ja} → ${p.natural}`)
    .join("\n");

  const turns = scenario.turns
    .map((t, i) => {
      const answer = userAnswers[i] ?? "(回答なし)";
      return `【ターン${i + 1}】
お客様(${scenario.persona.name}): ${t.customer}
狙い(日本語ヒント): ${t.hintJa}
スタッフの英語での返答: ${answer}`;
    })
    .join("\n\n");

  return `# シナリオ: ${scenario.ja}（${scenario.en}）
場面: ${scenario.desc}
お客様の人物像: ${scenario.persona.trait}

# このカテゴリの安全・自然な表現の参考例
${reference || "(なし)"}

# 会話の記録
${turns}

上記のスタッフの返答を4指標で採点し、改善ポイント3件と次に覚えるべき1文を、指定のJSONで返してください。`;
}

function clamp(n: number): number {
  if (!Number.isFinite(n)) return 50;
  return Math.max(0, Math.min(100, Math.round(n)));
}

/**
 * Claude API で採点する。利用不可 or 失敗時は null を返す。
 */
export async function scoreWithAI(
  scenario: Scenario,
  userAnswers: string[],
): Promise<ScoreResult | null> {
  if (!isAiScoringAvailable()) return null;

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  // structured outputs / adaptive thinking / effort は新しめの API 機能のため、
  // SDK のバージョン差による型のズレを避けて疎結合に呼び出す。
  const requestBody = {
    model: MODEL,
    max_tokens: 4000,
    thinking: { type: "adaptive" },
    output_config: {
      effort: "medium",
      format: { type: "json_schema", schema: SCORE_SCHEMA },
    },
    system: SYSTEM_PROMPT,
    messages: [
      { role: "user", content: buildUserPrompt(scenario, userAnswers) },
    ],
  };

  let parsed: AiScoreJson;
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response = (await client.messages.create(requestBody as any)) as unknown as {
      stop_reason: string | null;
      content: Array<{ type: string; text?: string }>;
    };

    if (response.stop_reason === "refusal") return null;

    const textBlock = response.content.find(
      (b) => b.type === "text" && typeof b.text === "string",
    );
    if (!textBlock || !textBlock.text) return null;
    parsed = JSON.parse(textBlock.text) as AiScoreJson;
  } catch (err) {
    console.error("AI採点に失敗しました。ルールベースにフォールバックします。", err);
    return null;
  }

  // 安全性は決定論的に併用（AIの見落とし防止）。断定表現があれば必ず低スコア。
  const allText = userAnswers.join(" ");
  const riskyHit = detectRisky(allText);
  let safety = clamp(parsed.safety);
  if (riskyHit && safety > 50) safety = 45;

  const clarity = clamp(parsed.clarity);
  const politeness = clamp(parsed.politeness);
  const naturalness = clamp(parsed.naturalness);
  const overall = Math.round((clarity + politeness + safety + naturalness) / 4);

  const points: ImprovementPoint[] = (parsed.points ?? [])
    .slice(0, 3)
    .map((p, i) => ({
      key: p.label || `point-${i}`,
      label: p.label ?? "",
      score: 0,
      from: p.from ?? "",
      to: p.to ?? "",
      kana: p.kana ?? "",
      note: p.note ?? "",
    }));

  return {
    scenarioId: scenario.id,
    scenarioJa: scenario.ja,
    overall,
    clarity,
    politeness,
    safety,
    naturalness,
    riskyHit,
    points,
    nextPhrase: {
      natural: parsed.nextPhrase?.natural ?? "",
      ja: parsed.nextPhrase?.ja ?? "",
      kana: parsed.nextPhrase?.kana ?? "",
    },
    aiComment: parsed.comment ?? "",
    source: "ai",
  };
}
