import { NextResponse } from "next/server";
import { getScenario } from "@/data/scenarios";
import { scoreWithAI } from "@/lib/anthropic";
import { computeRuleBasedResult } from "@/lib/scoring";

export const runtime = "nodejs";

/**
 * POST /api/score
 * body: { scenarioId: string, userAnswers: string[] }
 *
 * Claude API が利用可能なら AI 採点、そうでなければ / 失敗時はルールベース採点で
 * ScoreResult を返す。シナリオ情報はサーバー側の定義を正とする（クライアントの
 * 改ざんを受け付けない）。
 */
export async function POST(request: Request) {
  let body: { scenarioId?: string; userAnswers?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON" }, { status: 400 });
  }

  const { scenarioId } = body;
  if (typeof scenarioId !== "string") {
    return NextResponse.json({ error: "scenarioId is required" }, { status: 400 });
  }

  const scenario = getScenario(scenarioId);
  if (!scenario) {
    return NextResponse.json({ error: "unknown scenario" }, { status: 404 });
  }

  // 回答を検証・正規化（各ターンにつき1件、文字列のみ）
  const rawAnswers = Array.isArray(body.userAnswers) ? body.userAnswers : [];
  const userAnswers = scenario.turns.map((_, i) => {
    const a = rawAnswers[i];
    return typeof a === "string" ? a.slice(0, 2000) : "";
  });

  // まず AI 採点を試み、失敗時はルールベースにフォールバック
  const aiResult = await scoreWithAI(scenario, userAnswers);
  const result = aiResult ?? computeRuleBasedResult(scenario, userAnswers);

  return NextResponse.json(result);
}
