# DESIGN.md — MarkeBase

> デジタルマーケター向けインタラクティブ学習プラットフォーム。
> ライト/ダーク切替対応。デフォルトはダークモード。

---

## 1. Visual Theme & Atmosphere

- **テーマ**: ライト/ダーク切替（`next-themes` + CSS Variables）
- **デフォルト**: ダークモード（`defaultTheme="dark"`）
- **トーン**: プロフェッショナル・落ち着き・集中できる学習環境
- **印象**: 機能ごとの鮮やかなアクセントカラーで視覚的ヒエラルキーを作る
- **アイコン**: システム絵文字（🤖📝💡✏️🎮🧠✅ 等）。アイコンライブラリは未使用
- **装飾**: ウィンドウクローム風ドット（🔴🟡🟢）をプレビューヘッダーに配置

---

## 2. Color Palette & Roles

### テーマシステム

全カラーは CSS Variables で定義。`:root`（ライト）と `.dark`（ダーク）で切替。
コンポーネントでは `var(--color-xxx)` を使用する。hex 値のハードコードは禁止。

### Base (背景・テキスト)

| Token | Light | Dark | Role |
|---|---|---|---|
| `--color-page` | `#f8fafc` | `#0f172a` | ページ背景 |
| `--color-card` | `#ffffff` | `#1e293b` | カード・セクション背景 |
| `--color-card-alt` | `#f1f5f9` | `#1e1e1e` | エディタ・代替パネル背景 |
| `--color-border` | `#e2e8f0` | `#334155` | 枠線・区切り線 |
| `--color-border-strong` | `#cbd5e1` | `#475569` | 強調枠線 |
| `--color-text-heading` | `#0f172a` | `#ffffff` | 見出し |
| `--color-text-primary` | `#1e293b` | `#f1f5f9` | 主テキスト |
| `--color-text-secondary` | `#475569` | `#cbd5e1` | 補足テキスト |
| `--color-text-muted` | `#64748b` | `#94a3b8` | プレースホルダー |
| `--color-text-disabled` | `#94a3b8` | `#64748b` | 無効テキスト |
| `--color-overlay` | `rgba(0,0,0,0.3)` | `rgba(0,0,0,0.6)` | モーダル背景 |
| `--color-card-shadow` | `0 1px 3px rgba(0,0,0,0.08)` | `none` | カード影 |

### Accent (機能別カラー — 両モード共通)

| Token | Hex | Role |
|---|---|---|
| `--color-blue` | `#3b82f6` | ナビゲーション・プライマリボタン |
| `--color-green` | `#10b981` | 進捗・正解・完了 |
| `--color-purple` | `#8b5cf6` | AI チャット |
| `--color-yellow` | `#fbbf24` | XP・報酬・スター評価 |
| `--color-red` | `#ef4444` | エラー・不正解 |
| `--color-orange` | `#f59e0b` | 警告・中間難易度 |

### 半透過アクセント背景

| Token | Light | Dark |
|---|---|---|
| `--color-blue-bg` | `#3b82f615` | `#3b82f622` |
| `--color-green-bg` | `#10b98115` | `#10b98122` |
| `--color-purple-bg` | `#8b5cf615` | `#8b5cf622` |
| `--color-yellow-bg` | `#fbbf2415` | `#fbbf2422` |
| `--color-red-bg` | `#ef444415` | `#ef444422` |
| `--color-orange-bg` | `#f59e0b15` | `#f59e0b22` |

---

## 3. Typography Rules

### Font Families

| Role | Font | Fallback |
|---|---|---|
| 本文 | `Noto Sans JP` | `-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif` |
| コード | `JetBrains Mono` | `'Fira Code', 'Cascadia Code', monospace` |

### Font Weights

| Weight | Usage |
|---|---|
| 400 (`font-normal`) | 本文テキスト |
| 500 (`font-medium`) | ボタンラベル・軽い強調 |
| 600 (`font-semibold`) | サブ見出し |
| 700 (`font-bold`) | メイン見出し |

### Font Sizes

| Class | Usage |
|---|---|
| `text-xs` (12px) | ラベル・バッジ |
| `text-sm` (14px) | 本文・説明文 |
| `text-base` (16px) | 標準段落 |
| `text-lg` (18px) | h3 |
| `text-xl` → `lg:text-2xl` | セクション見出し |
| `text-2xl` → `lg:text-3xl` | スライド h1 |

---

## 4. Component Styles

### Card

```
背景: var(--color-card)
枠線: 1px solid var(--color-border)
影: var(--color-card-shadow)
角丸: rounded-xl (12px)
ホバー: hover:scale-[1.02] or hover:opacity-90
```

### Button — Primary

```
背景: var(--color-blue)
テキスト: #ffffff
角丸: rounded-lg (8px)
ホバー: hover:opacity-90
```

### Button — AI / Purple

```
背景: var(--color-purple-bg)
テキスト: var(--color-purple)
角丸: rounded-lg
```

### Input / Textarea

```
背景: var(--color-page)
枠線: 1px solid var(--color-border)
テキスト: var(--color-text-primary)
```

### Alert / Status

```
背景: var(--color-{accent}-bg)
テキスト: var(--color-{accent})
```

---

## 5. Layout Principles

### Lesson 3-Pane Layout

```
方向: flex-col → lg:flex-row
左ペイン（教材）: lg:w-[28%]～lg:w-[30%]
中央ペイン（エディタ）: flex-1
右ペイン（プレビュー）: lg:w-[35%]
区切り: border var(--color-border)
```

### Responsive Breakpoints

| Breakpoint | Class | Behavior |
|---|---|---|
| < 768px | (default) | 1カラム、縦積み |
| 768px | `md:` | 2カラム、AI パネル幅固定 |
| 1024px | `lg:` | **主要**: 3ペインレッスン横並び |
| 1280px | `xl:` | 4カラムグリッド最大化 |

---

## 6. Depth & Elevation

| Layer | z-index |
|---|---|
| Dropdown | `z-10` |
| Backdrop | `z-20` |
| Sidebar | `z-30` |
| Overlay | `z-40` |
| AI Chat | `z-50` |

- **ライトモード**: カード影 `var(--color-card-shadow)` で深度表現
- **ダークモード**: 背景色の段階差で深度表現（影なし）

---

## 7. Do's and Don'ts

### Do's ✓

- **全カラーに `var(--color-xxx)` を使う**（hex ハードコード禁止）
- アクセントカラーは機能と1:1（Blue=ナビ、Green=進捗、Purple=AI、Yellow=XP）
- ボタンのホバーは `opacity` で統一
- `rounded-xl`（カード）と `rounded-lg`（ボタン・入力）を使い分ける
- テーマ切替は `next-themes` の `useTheme()` で取得

### Don'ts ✗

- CSS Modules を使わない（Tailwind CSS のみ）
- アイコンライブラリを導入しない（システム絵文字で統一）
- `font-weight: 800/900` を使わない（最大 700 まで）
- `text-white`、`text-slate-400` 等の Tailwind カラークラスでテーマ依存色を指定しない（`style={{ color: "var(...)" }}` を使う）

---

## 8. Theme Toggle

- **ライブラリ**: `next-themes`（`attribute="class"`, `defaultTheme="dark"`, `enableSystem`）
- **プロバイダー**: `app/providers.tsx` → `<ThemeProvider>`
- **トグルコンポーネント**: `components/ThemeToggle.tsx`
- **配置場所**: ダッシュボードヘッダー、レッスンサイドバー
- **3モード**: ダーク → ライト → システム のサイクル

---

## 9. Agent Prompt Guide

### 新しいコンポーネントを作るとき

1. **背景色**: `var(--color-page)`（ページ）、`var(--color-card)`（カード）
2. **テキスト色**: `var(--color-text-heading)` / `var(--color-text-primary)` / `var(--color-text-secondary)` / `var(--color-text-muted)`
3. **枠線**: `1px solid var(--color-border)`
4. **角丸**: カード → `rounded-xl`、ボタン → `rounded-lg`
5. **アクセント**: `var(--color-blue)` 等、機能に応じて選択
6. **ホバー**: `hover:opacity-90` + `transition-opacity`
7. **カード影**: `boxShadow: "var(--color-card-shadow)"`

### hex 値を使ってよい場合

- ウィンドウクロームドット（`#ef4444`, `#f59e0b`, `#10b981`）— 装飾用、テーマ非依存
- ブラウザプレビュー内のコンテンツ（`#ffffff` 背景の iframe）
- 3位表彰の銅メダル色（`#b45309`）— 特殊用途
- コードハイライト色（`#93c5fd`, `#a5f3fc`）— 両モードで同一
