# MarkeBase

デジタルマーケター向けインタラクティブ学習プラットフォーム。
ブラウザ上でコードを書いて即実行できる「動く教材」。
GA4・GTM・HTML・CSS・BigQueryなど、マーケターに必要なスキルを体系的に学べる。

## ローカル開発

```bash
# 1. 依存パッケージをインストール
npm install

# 2. 環境変数を設定（Google OAuthを使う場合のみ必須）
cp .env.example .env.local
# .env.local を編集して各値を設定

# 3. 開発サーバーを起動
npm run dev
```

> **注意**: `.env.local` に `GOOGLE_CLIENT_ID` を設定しない場合、開発環境では認証がスキップされゲストとしてアプリを閲覧できます。

## 環境変数

| 変数名 | 説明 |
|--------|------|
| `GOOGLE_CLIENT_ID` | Google OAuth クライアントID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth クライアントシークレット |
| `NEXTAUTH_SECRET` | NextAuth.js の署名用シークレット（任意の文字列） |
| `NEXTAUTH_URL` | アプリのベースURL（例: `http://localhost:3000`） |

## Google OAuth 認証情報の取得

1. [Google Cloud Console](https://console.cloud.google.com/) → **APIとサービス** → **認証情報**
2. **認証情報を作成** → **OAuth 2.0 クライアントID** を選択
3. アプリケーションの種類: **ウェブアプリケーション**
4. 承認済みリダイレクトURIに以下を追加:
   ```
   http://localhost:3000/api/auth/callback/google
   ```
5. 発行された `クライアントID` と `クライアントシークレット` を `.env.local` に設定

## Cloud Run へのデプロイ

```bash
# 1. GCP 認証
gcloud auth login

# 2. Cloud Run にデプロイ（ソースから自動ビルド）
gcloud run deploy markebase \
  --source . \
  --region asia-northeast1 \
  --project appirits-sseki-test \
  --allow-unauthenticated

# 3. 環境変数を設定
gcloud run services update markebase \
  --region asia-northeast1 \
  --set-env-vars \
    GOOGLE_CLIENT_ID=your_client_id,\
    GOOGLE_CLIENT_SECRET=your_client_secret,\
    NEXTAUTH_SECRET=your_secret,\
    NEXTAUTH_URL=https://your-cloud-run-url
```

> `NEXTAUTH_URL` は Cloud Run のデプロイ後に発行されるURLに変更してください。

## 教材の追加方法

`data/lessons/{categoryId}--{moduleId}.json` を作成するだけで自動的に認識されます。

### JSONテンプレート

```json
{
  "id": "{categoryId}--{moduleId}",
  "moduleId": "{moduleId}",
  "categoryId": "{categoryId}",
  "title": "モジュールタイトル",
  "sections": [
    {
      "type": "intro",
      "data": {
        "content": "# 見出し\n\n本文テキスト（Markdown形式）",
        "diagram": false
      }
    },
    {
      "type": "concept",
      "data": {
        "content": "# 概念説明\n\n```js\nコードブロックも使えます\n```",
        "diagram": true
      }
    },
    {
      "type": "exercise",
      "data": {
        "content": "# 課題説明\n\n1. 手順1\n2. 手順2",
        "starterCode": "<!-- スターターコード -->",
        "hints": ["ヒント1", "ヒント2", "ヒント3"],
        "answer": "<!-- 模範解答 -->"
      }
    },
    {
      "type": "quiz",
      "data": {
        "questions": [
          {
            "q": "問題文",
            "options": ["選択肢A", "選択肢B", "選択肢C", "選択肢D"],
            "correct": 0,
            "explanation": "解説文"
          }
        ]
      }
    },
    {
      "type": "summary",
      "data": {
        "content": "# まとめ\n\n✅ 学んだこと1\n✅ 学んだこと2",
        "diagram": false
      }
    }
  ]
}
```

カテゴリIDとモジュールIDは `data/categories.json` の定義と一致させてください。

## 技術スタック

- **Next.js 14** (App Router) + TypeScript + Tailwind CSS
- **Monaco Editor** (@monaco-editor/react) — コードエディタ
- **NextAuth.js** — Google OAuth 認証
- **Cloud Run** — ホスティング（GCP: appirits-sseki-test）
