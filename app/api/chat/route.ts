import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "APIキーが設定されていません。管理者に連絡してください。" },
      { status: 503 }
    );
  }

  const { messages, lessonContext } = await req.json();

  const systemPrompt = `あなたはMarkeBaseのAI学習アシスタントです。デジタルマーケター向けに、Web技術・GA4・GTM・HTML・CSS・JavaScriptについて分かりやすく教えてください。

以下のルールに従ってください：
- 日本語で回答する
- 専門用語には必ず簡単な説明を添える
- マーケターの実務に結びつけて説明する
- コード例を示すときは、マーケティング業務で使える実用的な例にする
- 回答は簡潔に。長くても300文字程度

${lessonContext ? `\n現在学習中のレッスン:\n${lessonContext}` : ""}`;

  try {
    const client = new Anthropic({ apiKey });

    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      system: systemPrompt,
      messages: messages.map((m: { role: string; content: string }) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    });

    const textBlock = response.content.find((b) => b.type === "text");
    return NextResponse.json({
      message: textBlock?.text ?? "回答を生成できませんでした。",
    });
  } catch (error) {
    console.error("Anthropic API error:", error);
    return NextResponse.json({ error: "AI応答エラー" }, { status: 500 });
  }
}
