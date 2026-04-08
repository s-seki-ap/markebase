import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "APIキーが設定されていません。" },
      { status: 503 }
    );
  }

  const { task, userAnswer, modelAnswer } = await req.json();

  if (!task || !userAnswer) {
    return NextResponse.json(
      { error: "課題内容と回答を送信してください。" },
      { status: 400 }
    );
  }

  const systemPrompt = `あなたはMarkeBaseの学習メンター（添削AI）です。受講者のワークシート回答を評価・添削してください。

## 評価ルール
- 日本語で回答する
- まず **総合評価（A〜D）** を1行で示す
  - A: 優れた理解。ほぼ模範解答レベル
  - B: 良好な理解。一部補足があるとさらに良い
  - C: 基本は押さえているが重要な抜けがある
  - D: 再挑戦を推奨。基本的な理解が不足
- 次に **良い点**（1〜2個）を箇条書きで褒める
- 次に **改善ポイント**（1〜3個）を具体的に示す
- 最後に **添削例**として、回答の一部を改善した短い例を示す（必要な場合のみ）

## 出力フォーマット
- 全体で300〜500文字に収める
- 見出しは **太字** で書く（## は使わない）
- 箇条書きを活用してコンパクトに
- 受講者を「あなた」と呼ぶ
- 励ましの言葉を添える`;

  const userMessage = `【課題】
${task}

【受講者の回答】
${userAnswer}

${modelAnswer ? `【模範解答（参考）】\n${modelAnswer}` : ""}

上記の回答を評価・添削してください。`;

  try {
    const client = new Anthropic({ apiKey });
    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }],
    });

    const textBlock = response.content.find((b) => b.type === "text");
    return NextResponse.json({
      review: textBlock?.text ?? "評価を生成できませんでした。",
    });
  } catch (error) {
    console.error("Worksheet review API error:", error);
    return NextResponse.json({ error: "AI評価エラー" }, { status: 500 });
  }
}
