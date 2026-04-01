# MarkeBase

デジタルマーケター向けインタラクティブ学習プラットフォーム。
ブラウザ上でコードを書いて即実行できる「動く教材」。

## 技術スタック
- Next.js 14 (App Router) + TypeScript + Tailwind CSS
- コードエディタ: @monaco-editor/react
- DB: Firestore（firebase-admin SDK。ユーザー進捗・XP・学習ログを永続化）
- 認証: NextAuth.js + Google OAuth
- チャート: Recharts（レーダーチャート等）
- CI/CD: GitHub Actions → Cloud Run
- ホスティング: Cloud Run (asia-northeast1)
- GCPプロジェクト: ap-hp-bq-test

## ディレクトリ構成
```
markebase/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                    # ダッシュボード
│   ├── api/auth/[...nextauth]/route.ts
│   ├── auth/signin/page.tsx
│   └── curriculum/
│       ├── page.tsx                # カリキュラムマップ
│       ├── [categoryId]/page.tsx   # カテゴリ詳細
│       └── [categoryId]/[moduleId]/page.tsx  # レッスン画面
├── components/
│   ├── CodeEditor.tsx
│   ├── CodePreview.tsx
│   ├── LessonContent.tsx
│   ├── QuizSection.tsx
│   └── AIChatPanel.tsx            # ガワのみ（AI接続なし）
├── lib/
│   ├── auth.ts
│   └── curriculum.ts              # JSONデータ読込ヘルパー
├── types/
│   └── curriculum.ts
├── data/
│   ├── categories.json            # 8カテゴリのメタ情報
│   └── lessons/
│       ├── html--1-1.json         # モジュール1-1の教材
│       └── ga4--5-1.json          # モジュール5-1の教材
├── Dockerfile
├── .env.example
├── .env.local                     # gitignore対象
└── package.json
```

## デザイン方針
- ダークテーマ: 背景 #0f172a
- カラー: グリーン #10b981（進捗）、ブルー #3b82f6（ナビ）、パープル #8b5cf6（AI）、イエロー #fbbf24（XP）
- フォント: Noto Sans JP（本文）、JetBrains Mono（コード）
- レッスン画面は3ペイン: 教材 | エディタ | プレビュー

## コーディングルール
- TypeScript strict mode
- Server Componentデフォルト、"use client"は必要箇所のみ
- Tailwind CSSのみ（CSS Modules不可）
- 日本語テキスト直書きOK
- コミット: feat:/fix:/docs: プレフィクス

## 現在のスコープ（Phase 2 完了）
- 教材: 47モジュール（Web基礎30, HTML1, JS8, GA4 8）
- DB: Firestore（ユーザー進捗・XP・レベル・フィードバック永続化）
- 認証: NextAuth.js + Google OAuth（デモモード対応）
- Markdown: react-markdown + remark-gfm
- オンボーディング: 役割→経験→学習パス推薦
- 管理者ページ: チーム学習状況一覧
- ストリーク表示・ウィークリーゴール・チームランキング
- スキルマップ（Rechartsレーダーチャート）
- 検索機能（カリキュラムマップ）
- モジュール末5段階フィードバック
- 演習の自動判定
- CI/CD: GitHub Actions → Cloud Run 自動デプロイ
- AI質問チャット: OpenAI API接続済み
