"""GA4カリキュラムJSON一括修正スクリプト

修正対象:
1. ga4--5-10.json: 内部トラフィック除外の実装手順追加
2. ga4--5-3.json: Eコマースイベント重複の整理
3. ga4--5-6.json: _TABLE_SUFFIX説明追加
4. ga4--5-7.json: APIクォータ制限追記
5. ga4--5-8.json: 予測指標の利用条件修正
6. ga4--5-11.json: page_viewの位置づけ明確化
7. ga4--5-15.json: video_startのNG例コメント修正
8. ga4--5-16.json: ユニークイベント名上限追記
"""

import json
import os
import sys

BASE_DIR = os.path.join(os.path.dirname(__file__), "..", "data", "lessons")


def load_json(filename: str) -> dict:
    path = os.path.join(BASE_DIR, filename)
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def save_json(filename: str, data: dict) -> None:
    path = os.path.join(BASE_DIR, filename)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        f.write("\n")


def validate_json(filename: str) -> bool:
    path = os.path.join(BASE_DIR, filename)
    try:
        with open(path, "r", encoding="utf-8") as f:
            json.load(f)
        return True
    except json.JSONDecodeError as e:
        print(f"  [ERROR] {filename}: {e}")
        return False


def get_section(data: dict, section_type: str) -> dict | None:
    for section in data.get("sections", []):
        if section.get("type") == section_type:
            return section
    return None


# =============================================================================
# 修正1: ga4--5-10.json - 内部トラフィック除外の実装手順追加
# =============================================================================
def fix_5_10():
    filename = "ga4--5-10.json"
    print(f"[1/8] {filename}: 内部トラフィック除外の実装手順追加")
    data = load_json(filename)

    concept = get_section(data, "concept")
    if concept is None:
        print("  [SKIP] conceptセクションが見つかりません")
        return

    content = concept["data"]["content"]

    # 内部トラフィック除外の設定手順が不足しているか確認
    if "内部トラフィックの除外設定" in content or "内部トラフィックの定義" in content:
        print("  [SKIP] 内部トラフィック除外の設定手順は既に含まれています")
        return

    # クロスドメイン計測の解説の後に追加
    addition = """

## 内部トラフィックの除外設定

社内からのアクセスをGA4データから除外するには、以下の手順で設定します。

### ステップ1: 内部トラフィックの定義
管理 → データストリーム → （対象ストリーム）→ タグ設定を行う → 内部トラフィックの定義
- ルール名を入力（例: 「本社オフィス」）
- IPアドレスのマッチタイプを選択（等しい / 先頭が一致 / 範囲内）
- 除外するIPアドレスを入力

### ステップ2: データフィルタの作成
管理 → データの収集と修正 → データフィルタ
- フィルタを「テスト」状態で作成（いきなり有効にしない）
- リアルタイムレポートで除外対象のトラフィックが正しくフィルタされるか確認
- 確認できたらフィルタを「有効」に変更

### 注意点
- テスト状態のフィルタでは、リアルタイムレポートの「比較」機能で除外前/除外後を並べて確認できます
- 一度除外されたデータは復元できないため、必ずテスト状態で検証してからフィルタを有効にしてください"""

    concept["data"]["content"] = content + addition
    save_json(filename, data)
    print("  [OK] 内部トラフィック除外の設定手順を追加しました")


# =============================================================================
# 修正2: ga4--5-3.json - Eコマースイベント重複の整理
# =============================================================================
def fix_5_3():
    filename = "ga4--5-3.json"
    print(f"[2/8] {filename}: Eコマースイベント重複の整理")
    data = load_json(filename)

    # --- concept の整理 ---
    concept = get_section(data, "concept")
    if concept is None:
        print("  [SKIP] conceptセクションが見つかりません")
        return

    content = concept["data"]["content"]

    # 推奨イベントセクションにview_item/add_to_cart/purchaseの詳細実装コードが含まれているか確認
    has_detailed_code = "item_id: 'SKU-001'" in content or "transaction_id: 'T-12345'" in content

    if has_detailed_code:
        # 推奨イベントセクションを簡素化し、モジュール5-13/5-14への導線を追加
        # 既存の③セクションを差し替え
        old_section = """## ③ 推奨イベント（実装必要・GA4公式の標準名）

GA4が標準レポートで自動集計する特別なイベントです。独自名を使わず、必ずこの名前を使いましょう。

```js
// リード獲得
gtag('event', 'generate_lead', {
  currency: 'JPY',
  value: 50000  // 見込み顧客の推定価値
});

// 商品詳細ページ表示
gtag('event', 'view_item', {
  currency: 'JPY',
  value: 9800,
  items: [{ item_id: 'SKU-001', item_name: 'Tシャツ', price: 9800 }]
});

// 購入完了
gtag('event', 'purchase', {
  transaction_id: 'T-12345',
  value: 29800,
  currency: 'JPY',
  tax: 2709,
  shipping: 0,
  items: [
    { item_id: 'SKU-001', item_name: 'Tシャツ', price: 9800, quantity: 2 },
    { item_id: 'SKU-002', item_name: 'パーカー', price: 10200, quantity: 1 }
  ]
});
```"""

        new_section = """## ③ 推奨イベント（実装必要・GA4公式の標準名）

GA4が標準レポートで自動集計する特別なイベントです。独自名を使わず、必ずGoogleが定めた名前を使いましょう。

推奨イベントは用途別にGoogleにより定義されています:
- **EC向け**: `view_item`, `add_to_cart`, `begin_checkout`, `purchase` など
- **リード獲得向け**: `generate_lead`, `sign_up`, `login` など
- **コンテンツ向け**: `search`, `share`, `select_content` など

```js
// リード獲得の例
gtag('event', 'generate_lead', {
  currency: 'JPY',
  value: 50000  // 見込み顧客の推定価値
});
```

各推奨イベントの詳細な実装方法はモジュール5-13（EC向け推奨イベント）、5-14（リード獲得向け推奨イベント）で学びます。"""

        if old_section in content:
            content = content.replace(old_section, new_section)
            concept["data"]["content"] = content
            print("  [OK] conceptの推奨イベント詳細を簡素化し、5-13/5-14への導線を追加しました")
        else:
            print("  [SKIP] concept内の推奨イベントセクションのテキストが想定と異なります")
    else:
        print("  [SKIP] conceptに詳細な実装コードが含まれていないため、変更不要です")

    # --- 演習の確認と変更 ---
    exercise = get_section(data, "exercise")
    if exercise is None:
        print("  [SKIP] exerciseセクションが見つかりません")
        return

    ex_content = exercise["data"]["content"]

    # view_item/add_to_cart/purchaseの完全な実装演習かどうか確認
    is_ec_exercise = ("view_item" in ex_content and "add_to_cart" in ex_content
                      and "purchase" in ex_content)

    if is_ec_exercise:
        # カスタムイベント設計演習に変更
        exercise["data"]["content"] = """# 練習: ブログサイトのカスタムイベントを設計・実装する

ブログサイトで「記事の読了」を計測するカスタムイベントを設計・実装してください。

## 課題

以下の仕様でカスタムイベントを `gtag()` で実装してください:

1. **イベント名**: `article_read_complete`（記事を最後まで読んだとき）
2. **パラメータ**:
   - `article_title`: 記事のタイトル（文字列）
   - `article_category`: 記事のカテゴリ（文字列）
   - `reading_time_sec`: 読了までの秒数（数値）

## 設計のポイント
- イベント名は `snake_case`、40文字以内
- パラメータ名も `snake_case`、40文字以内
- パラメータ値（文字列）は100文字以内

各ボタンをクリックしてConsoleで送信内容を確認してください。"""

        exercise["data"]["starterCode"] = """<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <title>ブログ記事 読了イベント実装</title>
  <style>
    body { font-family: sans-serif; padding: 20px; background: #f8f9fa; }
    .card { background: white; padding: 20px; border-radius: 8px; margin-bottom: 16px; max-width: 500px; }
    button { padding: 10px 20px; margin: 4px; border: none; border-radius: 6px; cursor: pointer; color: white; font-size: 14px; }
    .btn-blue { background: #2563eb; }
    pre { background: #1e293b; color: #e2e8f0; padding: 12px; border-radius: 6px; font-size: 12px; overflow-x: auto; margin-top: 8px; }
  </style>
</head>
<body>
  <div class="card">
    <h2>GA4入門ガイド</h2>
    <p>カテゴリ: analytics | 読了時間: 180秒</p>
    <button class="btn-blue" onclick="fireReadComplete()">記事を読了した（article_read_complete）</button>
    <pre id="output">ここにイベント送信内容が表示されます</pre>
  </div>

  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());

    function showOutput(label, data) {
      document.getElementById('output').textContent =
        label + ':\\n' + JSON.stringify(data, null, 2);
    }

    // article_read_complete イベントを実装してください
    function fireReadComplete() {
      const eventData = {
        // ここにパラメータを設定してください
        // article_title: 記事タイトル
        // article_category: 記事カテゴリ
        // reading_time_sec: 読了までの秒数
      };
      gtag('event', 'article_read_complete', eventData);
      showOutput('article_read_complete', eventData);
    }
  </script>
</body>
</html>"""

        exercise["data"]["hints"] = [
            "`gtag('event', 'article_read_complete', { article_title: 'GA4入門ガイド', ... })` が基本形です。パラメータ名は `snake_case` で記述します。",
            "`article_category` には記事のカテゴリ文字列を、`reading_time_sec` には秒数を数値で設定します。",
            "完成形: `{ article_title: 'GA4入門ガイド', article_category: 'analytics', reading_time_sec: 180 }` です。カスタムイベントの場合、GA4レポートで見るにはカスタムディメンションへの登録が別途必要です。"
        ]

        exercise["data"]["answer"] = """<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <title>ブログ記事 読了イベント実装</title>
  <style>
    body { font-family: sans-serif; padding: 20px; background: #f8f9fa; }
    .card { background: white; padding: 20px; border-radius: 8px; margin-bottom: 16px; max-width: 500px; }
    button { padding: 10px 20px; margin: 4px; border: none; border-radius: 6px; cursor: pointer; color: white; font-size: 14px; }
    .btn-blue { background: #2563eb; }
    pre { background: #1e293b; color: #e2e8f0; padding: 12px; border-radius: 6px; font-size: 12px; overflow-x: auto; margin-top: 8px; }
  </style>
</head>
<body>
  <div class="card">
    <h2>GA4入門ガイド</h2>
    <p>カテゴリ: analytics | 読了時間: 180秒</p>
    <button class="btn-blue" onclick="fireReadComplete()">記事を読了した（article_read_complete）</button>
    <pre id="output">ここにイベント送信内容が表示されます</pre>
  </div>

  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());

    function showOutput(label, data) {
      document.getElementById('output').textContent =
        label + ':\\n' + JSON.stringify(data, null, 2);
    }

    function fireReadComplete() {
      const eventData = {
        article_title: 'GA4入門ガイド',
        article_category: 'analytics',
        reading_time_sec: 180
      };
      gtag('event', 'article_read_complete', eventData);
      showOutput('article_read_complete', eventData);
    }
  </script>
</body>
</html>"""

        print("  [OK] 演習をカスタムイベント設計（article_read_complete）に変更しました")
    else:
        print("  [SKIP] 演習がEC実装演習ではないため、変更不要です")

    save_json(filename, data)


# =============================================================================
# 修正3: ga4--5-6.json - _TABLE_SUFFIX説明追加
# =============================================================================
def fix_5_6():
    filename = "ga4--5-6.json"
    print(f"[3/8] {filename}: _TABLE_SUFFIX説明追加")
    data = load_json(filename)

    concept = get_section(data, "concept")
    if concept is None:
        print("  [SKIP] conceptセクションが見つかりません")
        return

    content = concept["data"]["content"]

    if "ワイルドカードテーブル" in content and "TABLE_SUFFIX" in content:
        print("  [SKIP] ワイルドカードテーブルとTABLE_SUFFIXの説明は既に含まれています")
        save_json(filename, data)
        return

    # 「日次エクスポート vs ストリーミングエクスポート」セクションの前に挿入
    marker = "## 日次エクスポート vs ストリーミングエクスポート"

    addition = """## ワイルドカードテーブルとTABLE_SUFFIX

GA4のBigQueryテーブルは日付別（events_20260408等）に分割されています。複数日のデータをまとめて分析するにはワイルドカードテーブルを使います。

`FROM \`project.dataset.events_*\`` でワイルドカードを指定し、`_TABLE_SUFFIX` で日付をフィルタします。

例: 直近7日間のpage_viewイベントを取得
```sql
SELECT event_name, COUNT(*) as cnt
FROM `project.dataset.events_*`
WHERE _TABLE_SUFFIX BETWEEN '20260401' AND '20260407'
  AND event_name = 'page_view'
GROUP BY event_name
```

"""

    if marker in content:
        content = content.replace(marker, addition + marker)
        concept["data"]["content"] = content
        print("  [OK] ワイルドカードテーブルとTABLE_SUFFIXの説明を追加しました")
    else:
        # マーカーが見つからない場合は末尾に追加
        concept["data"]["content"] = content + "\n\n" + addition.strip()
        print("  [OK] ワイルドカードテーブルとTABLE_SUFFIXの説明を末尾に追加しました")

    save_json(filename, data)


# =============================================================================
# 修正4: ga4--5-7.json - APIクォータ制限追記
# =============================================================================
def fix_5_7():
    filename = "ga4--5-7.json"
    print(f"[4/8] {filename}: APIクォータ制限追記")
    data = load_json(filename)

    concept = get_section(data, "concept")
    if concept is None:
        print("  [SKIP] conceptセクションが見つかりません")
        return

    content = concept["data"]["content"]

    if "APIクォータ制限" in content or "トークン/プロパティ/日" in content:
        print("  [SKIP] APIクォータ制限の説明は既に含まれています")
        save_json(filename, data)
        return

    addition = """

## APIクォータ制限

GA4 Data APIにはプロパティごとの1日あたりのトークン制限があります。

| 項目 | 標準GA4 | GA4 360 |
|------|---------|---------|
| トークン/プロパティ/日 | 200,000 | 2,000,000 |
| トークン/プロパティ/時 | 40,000 | 400,000 |
| 同時リクエスト/プロパティ | 10 | 50 |

クエリの複雑さ（ディメンション数・指標数・日付範囲）によって消費トークン数が変わります。定期実行ジョブを組む場合はクォータの監視が重要です。"""

    concept["data"]["content"] = content + addition
    save_json(filename, data)
    print("  [OK] APIクォータ制限を追記しました")


# =============================================================================
# 修正5: ga4--5-8.json - 予測指標の利用条件修正
# =============================================================================
def fix_5_8():
    filename = "ga4--5-8.json"
    print(f"[5/8] {filename}: 予測指標の利用条件修正")
    data = load_json(filename)

    concept = get_section(data, "concept")
    if concept is None:
        print("  [SKIP] conceptセクションが見つかりません")
        return

    content = concept["data"]["content"]

    # 既存の条件記述を探して修正
    old_condition = "**利用条件**: 過去28日間に1,000人以上のpurchaseユーザーがいる場合のみ機能します。"
    new_condition = "**利用条件**: 過去28日間に購入ユーザー1,000人以上 **かつ** 非購入ユーザー1,000人以上が必要です。"

    if old_condition in content:
        content = content.replace(old_condition, new_condition)
        concept["data"]["content"] = content
        print("  [OK] 予測指標の利用条件を修正しました")
    elif "非購入ユーザー" in content:
        print("  [SKIP] 予測指標の利用条件は既に正確です")
    else:
        print("  [WARN] 想定する利用条件のテキストが見つかりません。手動確認が必要です")

    save_json(filename, data)


# =============================================================================
# 修正6: ga4--5-11.json - page_viewの位置づけ明確化
# =============================================================================
def fix_5_11():
    filename = "ga4--5-11.json"
    print(f"[6/8] {filename}: page_viewの位置づけ明確化")
    data = load_json(filename)

    intro = get_section(data, "intro")
    if intro is None:
        print("  [SKIP] introセクションが見つかりません")
        return

    content = intro["data"]["content"]

    # page_viewの位置づけについての注記が既にあるか確認
    if "page_viewは技術的には拡張計測イベント" in content:
        print("  [SKIP] page_viewの位置づけに関する注記は既に含まれています")
        save_json(filename, data)
        return

    # 3分類のコードブロック終了後に注記を追加
    # 「このモジュールでは **1. 自動収集イベント** を詳しく学びます。」の前に追加
    marker = "このモジュールでは **1. 自動収集イベント** を詳しく学びます。"

    note = """> **注意**: page_viewは技術的には拡張計測イベントです。GA4タグ設置時にデフォルトONとなるため自動的に収集されますが、管理画面の拡張計測設定でOFFにすることも可能です。

"""

    if marker in content:
        content = content.replace(marker, note + marker)
        intro["data"]["content"] = content
        print("  [OK] page_viewの位置づけに関する注記を追加しました")
    else:
        # マーカーが見つからない場合は末尾に追加
        intro["data"]["content"] = content + "\n\n" + note.strip()
        print("  [OK] page_viewの位置づけに関する注記を末尾に追加しました")

    save_json(filename, data)


# =============================================================================
# 修正7: ga4--5-15.json - video_startのNG例コメント修正
# =============================================================================
def fix_5_15():
    filename = "ga4--5-15.json"
    print(f"[7/8] {filename}: video_startのNG例コメント修正")
    data = load_json(filename)

    exercise = get_section(data, "exercise")
    if exercise is None:
        print("  [SKIP] exerciseセクションが見つかりません")
        return

    # starterCode内を確認
    starter = exercise["data"].get("starterCode", "")
    answer = exercise["data"].get("answer", "")

    # starterCode内のvideo_startコメント修正
    modified = False

    # 「予約済みイベント」というコメントを探す（video_start関連で）
    if "video_start" in starter:
        # starterCode内のコメントを修正
        if "予約済みイベント" in starter and "video_start" in starter:
            starter = starter.replace(
                "GA4予約済みイベント名と競合",
                "GA4の拡張計測イベントと競合するため使用を避けるべき"
            )
            # もし「予約済みイベント名」が単独で出ている場合も対応
            exercise["data"]["starterCode"] = starter
            modified = True

    if "video_start" in answer:
        if "予約済み" in answer and "video_start" in answer:
            answer = answer.replace(
                "GA4予約済みのvideo_startは使わない",
                "video_startはGA4の拡張計測イベントと競合するため使用を避けるべき"
            )
            exercise["data"]["answer"] = answer
            modified = True

    # hints内も確認
    hints = exercise["data"].get("hints", [])
    new_hints = []
    for hint in hints:
        if "video_start" in hint and "予約済み" in hint:
            hint = hint.replace(
                "`video_start` はGA4の予約済みイベント名",
                "`video_start` はGA4の拡張計測イベントと競合するため使用を避けるべき名前"
            ).replace(
                "GA4予約済みイベント名",
                "GA4の拡張計測イベントと競合するため使用を避けるべき名前"
            )
            modified = True
        new_hints.append(hint)
    exercise["data"]["hints"] = new_hints

    if modified:
        save_json(filename, data)
        print("  [OK] video_startのコメントを修正しました")
    else:
        # コメント内に「予約済みイベント」の表現が見つからない場合
        # starterCodeの内容をさらに詳しく確認
        if "video_start" in starter:
            # コメントが「予約済みイベント名と競合」ではなく別の表現かもしれない
            old_comment = "2. 動画を再生したとき（GA4予約済みイベント名と競合）"
            new_comment = "2. 動画を再生したとき（GA4の拡張計測イベントと競合するため使用を避けるべき）"
            if old_comment in starter:
                starter = starter.replace(old_comment, new_comment)
                exercise["data"]["starterCode"] = starter
                save_json(filename, data)
                print("  [OK] video_startのNG例コメントを修正しました")
            else:
                save_json(filename, data)
                print("  [INFO] video_startは存在しますが、コメント表現が想定と異なります")
        else:
            save_json(filename, data)
            print("  [SKIP] video_startのNG例が見つかりません")


# =============================================================================
# 修正8: ga4--5-16.json - ユニークイベント名上限追記
# =============================================================================
def fix_5_16():
    filename = "ga4--5-16.json"
    print(f"[8/8] {filename}: ユニークイベント名上限追記")
    data = load_json(filename)

    concept = get_section(data, "concept")
    if concept is None:
        print("  [SKIP] conceptセクションが見つかりません")
        return

    content = concept["data"]["content"]

    if "ユニークイベント名の数" in content or "アプリストリームでは500個" in content:
        print("  [SKIP] ユニークイベント名上限の説明は既に含まれています")
        save_json(filename, data)
        return

    addition = """

なお、1プロパティあたりのユニークイベント名の数は、アプリストリームでは500個が上限です。Webストリームには明示的な上限はありませんが、カスタムディメンション登録数（イベントスコープ50個）が実質的な制約になります。大規模サイトではイベント名の統合・設計が重要です。"""

    concept["data"]["content"] = content + addition
    save_json(filename, data)
    print("  [OK] ユニークイベント名上限を追記しました")


# =============================================================================
# メイン処理
# =============================================================================
def main():
    print("=" * 60)
    print("GA4カリキュラムJSON一括修正")
    print("=" * 60)

    target_files = [
        "ga4--5-10.json",
        "ga4--5-3.json",
        "ga4--5-6.json",
        "ga4--5-7.json",
        "ga4--5-8.json",
        "ga4--5-11.json",
        "ga4--5-15.json",
        "ga4--5-16.json",
    ]

    # 修正実行
    fix_5_10()
    fix_5_3()
    fix_5_6()
    fix_5_7()
    fix_5_8()
    fix_5_11()
    fix_5_15()
    fix_5_16()

    # バリデーション
    print()
    print("=" * 60)
    print("JSONバリデーション")
    print("=" * 60)
    all_valid = True
    for f in target_files:
        ok = validate_json(f)
        status = "OK" if ok else "NG"
        print(f"  [{status}] {f}")
        if not ok:
            all_valid = False

    print()
    if all_valid:
        print("全ファイルのJSONバリデーションに成功しました。")
    else:
        print("[ERROR] バリデーションに失敗したファイルがあります。")
        sys.exit(1)

    print()
    print("修正完了ファイル一覧:")
    for f in target_files:
        print(f"  - data/lessons/{f}")


if __name__ == "__main__":
    main()
