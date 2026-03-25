# MarkeBase

デジタルマーケター向けインタラクティブ学習プラットフォーム。
ブラウザ上でコードを書いて即実行できる「動く教材」。

## 技術スタック
- Next.js 14 (App Router) + TypeScript + Tailwind CSS
- コードエディタ: @monaco-editor/react
- DB: なし（JSONファイルから直接読み込み。Firestore接続はPhase 1）
- 認証: NextAuth.js + Google OAuth
- ホスティング: Cloud Run（手動デプロイ）
- GCPプロジェクト: appirits-sseki-test

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

## 現在のスコープ（ミニマムデモ）
- 教材は2モジュールのみ: 1-1（HTML基礎）と 5-1（GA4データモデル）
- DBなし。JSONから読み込み
- AI質問チャットはUIのみ（バックエンド接続なし）
- XP/レベルはハードコード表示
- デプロイは手動（gcloud run deploy）
