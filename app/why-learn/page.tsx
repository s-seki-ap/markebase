import Link from "next/link";

const SECTIONS = [
  {
    title: "「知らない」では済まされない時代",
    body: `デジタルマーケティングの現場では、HTMLの構造を理解していなければGTMのタグ設計ができません。Cookieの仕組みを知らなければ、ITPやGDPRの影響を説明できません。SQLが書けなければ、BigQueryに入ったGA4の生データを活用できません。

これらは「できたら強い」ではなく、「知らないと常識外れと見なされる」レベルの知識です。

クライアントとの会議で「それはサーバーサイドの話なので…」と言葉に詰まった経験はありませんか？エンジニアに依頼するとき「何をお願いすればいいかわからない」と感じたことは？

知識がないこと自体は問題ではありません。知識がないまま提案し、実装不可能な施策を出してしまうことが問題です。`,
  },
  {
    title: "なぜ「つまみ食い」では身につかないのか",
    body: `検索して出てきた記事を読む。YouTubeでGA4の設定動画を見る。それで「わかった気」になる。でも1週間後には忘れている。

これは学習が体系的でないことが原因です。

GA4のイベント設計を理解するには、まずHTMLの構造を知る必要があります。GTMのdataLayerを扱うにはJavaScriptが必要です。BigQueryでGA4データを分析するにはSQLが必要です。

1つの知識が別の知識の土台になっている。だから順番に、体系的に学ぶ必要があるのです。`,
  },
  {
    title: "マーケターが技術を学ぶ本当の理由",
    body: `コードを書けるようになることが目的ではありません。

目的は3つです。

1つ目は「実装可能性の判断」。提案した施策がエンジニアリングの観点で実現可能か、どれくらいの工数がかかるか、概算で判断できるようになること。

2つ目は「正確なコミュニケーション」。エンジニア・デザイナーと同じ言語で会話し、認識のズレなく要件を伝えられるようになること。

3つ目は「データの自力検証」。レポートの数字が正しいか、計測が意図通りに動いているか、自分で確認できるようになること。

この3つができるマーケターは、クライアントからもチームからも信頼されます。`,
  },
  {
    title: "MarkeBaseのカリキュラム設計",
    body: `MarkeBaseでは、12のカテゴリに分かれた1,200のモジュールで体系的な学習を提供します。

基礎から順番に進む設計ですが、自分のレベルに合わせてどこからでも始められます。

すべてのモジュールには実務との接続が示されています。「これを学ぶと仕事のどの場面で使えるか」が常に明確です。

演習は答えを見せずに考えさせる設計にしています。課題の指示を読み、自分で手を動かし、試行錯誤する。この過程が最も記憶に残るからです。`,
  },
];

const CATEGORY_FLOW = [
  { icon: "🌐", name: "Web基礎", desc: "知らないと恥をかく前提知識" },
  { icon: "📗", name: "HTML / CSS / JS", desc: "データ抽出・検証・実装判断" },
  { icon: "🔍", name: "SEO / 広告 / 戦略", desc: "集客・CVの設計力" },
  { icon: "🔥", name: "GA4 / BigQuery", desc: "計測・分析の実行力" },
  { icon: "🤖", name: "AI / 自動化", desc: "生産性の飛躍的向上" },
  { icon: "📱", name: "アプリ / PM", desc: "領域拡張・プロジェクト推進" },
];

export default function WhyLearnPage() {
  return (
    <main className="min-h-screen" style={{ backgroundColor: "var(--color-page)" }}>
      {/* Hero */}
      <div className="relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            background: "radial-gradient(ellipse at 50% 0%, var(--color-blue) 0%, transparent 70%)",
          }}
        />
        <div className="relative max-w-3xl mx-auto px-8 pt-16 pb-12">
          <Link
            href="/curriculum"
            className="inline-flex items-center gap-1 text-sm mb-10 transition-opacity hover:opacity-80"
            style={{ color: "var(--color-text-muted)" }}
          >
            ← カリキュラムマップ
          </Link>
          <h1 className="text-3xl sm:text-4xl font-bold mb-4 leading-tight" style={{ color: "var(--color-text-heading)" }}>
            なぜデジタルマーケターは
            <br />
            体系的に学ぶ必要があるのか
          </h1>
          <p className="text-lg leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
            断片的な知識の寄せ集めでは、現場で通用しません。
            <br />
            知識がつながって初めて「使える」ようになります。
          </p>
        </div>
      </div>

      {/* Content sections */}
      <div className="max-w-3xl mx-auto px-8 pb-8">
        {SECTIONS.map((section, i) => (
          <section key={i} className="mb-12">
            <h2 className="text-xl font-bold mb-4 flex items-start gap-3" style={{ color: "var(--color-text-heading)" }}>
              <span
                className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold mt-0.5"
                style={{ backgroundColor: "var(--color-blue-bg)", color: "var(--color-blue)" }}
              >
                {i + 1}
              </span>
              {section.title}
            </h2>
            <div className="pl-11 space-y-4">
              {section.body.split("\n\n").map((paragraph, j) => (
                <p
                  key={j}
                  className="text-sm leading-relaxed"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </section>
        ))}

        {/* Learning flow */}
        <section className="mb-16">
          <h2 className="text-xl font-bold mb-6 flex items-start gap-3" style={{ color: "var(--color-text-heading)" }}>
            <span
              className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold mt-0.5"
              style={{ backgroundColor: "var(--color-blue-bg)", color: "var(--color-blue)" }}
            >
              5
            </span>
            学習の全体像
          </h2>
          <div className="pl-11">
            <div className="space-y-3">
              {CATEGORY_FLOW.map((item, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div
                    className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                    style={{ backgroundColor: "var(--color-card)" }}
                  >
                    {item.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium" style={{ color: "var(--color-text-heading)" }}>{item.name}</p>
                    <p className="text-xs" style={{ color: "var(--color-text-disabled)" }}>{item.desc}</p>
                  </div>
                  {i < CATEGORY_FLOW.length - 1 && (
                    <span className="text-xs shrink-0" style={{ color: "var(--color-text-disabled)" }}>→</span>
                  )}
                </div>
              ))}
            </div>
            <p className="text-xs mt-4" style={{ color: "var(--color-text-muted)" }}>
              各カテゴリ100モジュール。基礎から順に進む設計ですが、経験に応じてどこからでも始められます。
            </p>
          </div>
        </section>

        {/* CTA */}
        <div
          className="rounded-2xl p-8 text-center"
          style={{ backgroundColor: "var(--color-card)", boxShadow: "var(--color-card-shadow)" }}
        >
          <p className="font-semibold text-lg mb-2" style={{ color: "var(--color-text-heading)" }}>
            まずは1モジュールから始めてみませんか？
          </p>
          <p className="text-sm mb-6" style={{ color: "var(--color-text-muted)" }}>
            1,200モジュールすべてを終える必要はありません。今日の1つが明日の武器になります。
          </p>
          <Link
            href="/curriculum"
            className="inline-flex items-center gap-2 px-8 py-3 rounded-xl font-semibold transition-opacity hover:opacity-90"
            style={{ backgroundColor: "var(--color-blue)", color: "#ffffff" }}
          >
            カリキュラムマップを見る →
          </Link>
        </div>
      </div>
    </main>
  );
}
