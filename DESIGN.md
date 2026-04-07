# DESIGN.md — MarkeBase

> Duolingo風ポップデザインの学習プラットフォーム。
> 楽しさ・達成感・継続モチベーションを最優先。
> ライト/ダーク切替対応。デフォルトはダークモード。

---

## 1. Visual Theme & Atmosphere

- **テーマ**: Duolingo風ポップ & ゲーミフィケーション
- **切替**: ライト/ダーク (`next-themes` + CSS Variables)
- **デフォルト**: ダークモード (`defaultTheme="dark"`)
- **トーン**: 明るい・楽しい・達成感のある学習体験
- **印象**: 鮮やかなアクセントカラー + 3Dボタン + バウンスアニメーション
- **アイコン**: システム絵文字（大きめ表示。🎉🔥⭐💪🎯🏆 等）
- **装飾**: ウィンドウクローム風ドット（赤黄緑）をプレビューヘッダーに配置
- **マイクロコピー**: 励まし・褒める口調（「すごい！」「その調子！」）

---

## 2. Color Palette & Roles

### テーマシステム

全カラーは CSS Variables で定義。`:root`（ライト）と `.dark`（ダーク）で切替。
コンポーネントでは `var(--color-xxx)` を使用する。hex 値のハードコードは禁止。

### Base (背景・テキスト)

| Token | Light | Dark | Role |
|---|---|---|---|
| `--color-page` | `#f7f7f7` | `#131f24` | ページ背景（暖かいグレー / ティール系ダーク） |
| `--color-card` | `#ffffff` | `#1a2b32` | カード・セクション背景 |
| `--color-card-alt` | `#f0f0f0` | `#1e2e36` | エディタ・代替パネル背景 |
| `--color-border` | `#e5e5e5` | `#2d4048` | 枠線・区切り線 |
| `--color-border-strong` | `#d4d4d4` | `#3d5058` | 強調枠線 |
| `--color-text-heading` | `#3c3c3c` | `#ffffff` | 見出し（ソフトブラック） |
| `--color-text-primary` | `#4b4b4b` | `#e5e5e5` | 主テキスト |
| `--color-text-secondary` | `#777777` | `#b0b0b0` | 補足テキスト |
| `--color-text-muted` | `#afafaf` | `#808080` | プレースホルダー |
| `--color-text-disabled` | `#d4d4d4` | `#505050` | 無効テキスト |
| `--color-overlay` | `rgba(0,0,0,0.3)` | `rgba(0,0,0,0.6)` | モーダル背景 |
| `--color-card-shadow` | `0 2px 12px rgba(0,0,0,0.06)` | `0 2px 12px rgba(0,0,0,0.3)` | カード影（両モードで存在） |

### Accent (機能別カラー — Duolingo風鮮やかパレット)

| Token | Hex | Role |
|---|---|---|
| `--color-green` | `#58CC02` | プライマリアクション・正解・完了（Duolingoグリーン） |
| `--color-blue` | `#1CB0F6` | ナビゲーション・情報（スカイブルー） |
| `--color-purple` | `#CE82FF` | AI チャット・プレミアム機能 |
| `--color-yellow` | `#FFC800` | XP・報酬・スター評価（ゴールド） |
| `--color-red` | `#FF4B4B` | エラー・不正解 |
| `--color-orange` | `#FF9600` | 警告・ストリーク・中間難易度 |

### 3Dボタン用シャドウカラー

| Token | Hex | Role |
|---|---|---|
| `--color-green-shadow` | `#46a302` | グリーンボタンの底辺影 |
| `--color-blue-shadow` | `#1899d6` | ブルーボタンの底辺影 |
| `--color-purple-shadow` | `#a855c6` | パープルボタンの底辺影 |
| `--color-red-shadow` | `#e53535` | レッドボタンの底辺影 |
| `--color-orange-shadow` | `#e08600` | オレンジボタンの底辺影 |

### 半透過アクセント背景

| Token | Light | Dark |
|---|---|---|
| `--color-green-bg` | `#58CC0218` | `#58CC0225` |
| `--color-blue-bg` | `#1CB0F618` | `#1CB0F625` |
| `--color-purple-bg` | `#CE82FF18` | `#CE82FF25` |
| `--color-yellow-bg` | `#FFC80018` | `#FFC80025` |
| `--color-red-bg` | `#FF4B4B18` | `#FF4B4B25` |
| `--color-orange-bg` | `#FF960018` | `#FF960025` |

---

## 3. Typography Rules

### Font Families

| Role | Font | Fallback |
|---|---|---|
| 本文 | `Nunito` | `'Noto Sans JP', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif` |
| コード | `JetBrains Mono` | `'Fira Code', 'Cascadia Code', monospace` |

> Nunito は丸みのあるフレンドリーな書体でDuolingo風。日本語フォールバックにNoto Sans JP。

### Font Weights

| Weight | Usage |
|---|---|
| 400 (`font-normal`) | 本文テキスト |
| 600 (`font-semibold`) | ボタンラベル・軽い強調 |
| 700 (`font-bold`) | サブ見出し |
| 800 (`font-extrabold`) | メイン見出し・数字強調 |

### Font Sizes

| Class | Usage |
|---|---|
| `text-xs` (12px) | ラベル・バッジ |
| `text-sm` (14px) | 本文・説明文 |
| `text-base` (16px) | 標準段落 |
| `text-lg` (18px) | h3・セクションラベル |
| `text-xl` -> `lg:text-2xl` | セクション見出し |
| `text-2xl` -> `lg:text-4xl` | ヒーロー h1（大きくインパクト） |

---

## 4. Component Styles

### Card

```
背景: var(--color-card)
枠線: 2px solid var(--color-border)
影: var(--color-card-shadow)
角丸: rounded-2xl (16px)
ホバー: hover:scale-[1.02] + shadow増加
トランジション: transition-all duration-200
```

### Button — Primary (3D Push-down)

Duolingo風3Dボタン。`box-shadow` で底辺に影を作り、押下時に沈む。

```
背景: var(--color-green)
テキスト: #ffffff
角丸: rounded-2xl (16px)
影: 0 4px 0 var(--color-green-shadow)
ホバー: hover:brightness-105
アクティブ: active:translate-y-[2px] active:shadow-[0_2px_0]
フォント: font-bold
```

### Button — Secondary (Blue)

```
背景: var(--color-blue)
テキスト: #ffffff
角丸: rounded-2xl (16px)
影: 0 4px 0 var(--color-blue-shadow)
```

### Button — AI / Purple

```
背景: var(--color-purple-bg)
テキスト: var(--color-purple)
枠線: 2px solid var(--color-purple)
角丸: rounded-2xl
ホバー: hover:bg-purple with hover:text-white
```

### Button — Ghost

```
背景: transparent
テキスト: var(--color-text-muted)
角丸: rounded-2xl
ホバー: hover:bg var(--color-card)
```

### Input / Textarea

```
背景: var(--color-card)
枠線: 2px solid var(--color-border)
角丸: rounded-2xl
フォーカス: border-color var(--color-blue)
```

### Badge / Tag

```
角丸: rounded-full (pill)
パディング: px-3 py-1
フォント: text-xs font-bold
```

### Progress Bar

```
高さ: h-3 (12px)（通常の2倍、存在感UP）
角丸: rounded-full
背景: var(--color-border)
バー: var(--color-green) + transition-all duration-500
アニメーション: ストライプ（オプション）
```

### Alert / Status

```
背景: var(--color-{accent}-bg)
テキスト: var(--color-{accent})
枠線: 2px solid var(--color-{accent})
角丸: rounded-2xl
```

---

## 5. Layout Principles

### Lesson 3-Pane Layout

```
方向: flex-col -> lg:flex-row
左ペイン（教材）: lg:w-[28%]~lg:w-[30%]
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

- **両モード**: カード影 `var(--color-card-shadow)` で深度表現
- **3Dボタン**: `box-shadow: 0 4px 0` で物理的な立体感

---

## 7. Animations

### bounce-in
```css
@keyframes bounce-in {
  0% { transform: scale(0); }
  50% { transform: scale(1.15); }
  100% { transform: scale(1); }
}
```

### wiggle
```css
@keyframes wiggle {
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(-5deg); }
  75% { transform: rotate(5deg); }
}
```

### progress-stripe
```css
@keyframes progress-stripe {
  0% { background-position: 0 0; }
  100% { background-position: 40px 0; }
}
```

---

## 8. Do's and Don'ts

### Do's

- **全カラーに `var(--color-xxx)` を使う**（hex ハードコード禁止）
- アクセントカラーは機能と1:1（Green=プライマリ、Blue=ナビ、Purple=AI、Yellow=XP）
- **ボタンは3D Push-down**スタイルを基本にする
- `rounded-2xl`（カード・ボタン・入力）を統一的に使う
- **font-extrabold (800)** を見出しに積極的に使う
- テーマ切替は `next-themes` の `useTheme()` で取得
- 達成時は**大きな絵文字 + bounce-in アニメ**で祝う
- マイクロコピーは前向き・励まし口調にする

### Don'ts

- CSS Modules を使わない（Tailwind CSS のみ）
- アイコンライブラリを導入しない（システム絵文字で統一）
- 細い枠線（1px）は使わない — 最低2pxでポップ感を出す
- `text-white`、`text-slate-400` 等の Tailwind カラークラスでテーマ依存色を指定しない
- 角丸を `rounded-lg` (8px) 以下にしない（最低 `rounded-xl` 12px）
- ネガティブな表現を使わない（「失敗」→「もう一回チャレンジ！」）

---

## 9. Theme Toggle

- **ライブラリ**: `next-themes`（`attribute="class"`, `defaultTheme="dark"`, `enableSystem`）
- **プロバイダー**: `app/providers.tsx` -> `<ThemeProvider>`
- **トグルコンポーネント**: `components/ThemeToggle.tsx`
- **配置場所**: ダッシュボードヘッダー、レッスンサイドバー
- **3モード**: ダーク -> ライト -> システム のサイクル

---

## 10. Agent Prompt Guide

### 新しいコンポーネントを作るとき

1. **背景色**: `var(--color-page)`（ページ）、`var(--color-card)`（カード）
2. **テキスト色**: heading / primary / secondary / muted / disabled から選択
3. **枠線**: `2px solid var(--color-border)`（最低2px）
4. **角丸**: カード・ボタン・入力 -> `rounded-2xl`、バッジ -> `rounded-full`
5. **アクセント**: `var(--color-green)` 等、機能に応じて選択
6. **ボタン**: 3D Push-down（`box-shadow: 0 4px 0`）を基本
7. **カード影**: `boxShadow: "var(--color-card-shadow)"`
8. **アニメ**: 達成・正解 -> `bounce-in`、ホバー -> `scale-[1.02]`
9. **進捗バー**: `h-3 rounded-full` + `transition-all duration-500`

### hex 値を使ってよい場合

- ウィンドウクロームドット（`#ef4444`, `#f59e0b`, `#10b981`）— 装飾用、テーマ非依存
- ブラウザプレビュー内のコンテンツ（`#ffffff` 背景の iframe）
- コードハイライト色（`#93c5fd`, `#a5f3fc`）— 両モードで同一
- ボタンテキスト `#ffffff` — 常に白
