import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;

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

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        ...messages,
      ],
      max_tokens: 1000,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    return NextResponse.json({ error: "AI応答エラー" }, { status: 500 });
  }

  const data = await response.json();
  return NextResponse.json({
    message: data.choices[0].message.content,
  });
}
