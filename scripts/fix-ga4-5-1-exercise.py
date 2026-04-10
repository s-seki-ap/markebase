#!/usr/bin/env python3
"""Fix ga4--5-1.json exercise to be code-editor compatible (not worksheet)."""
import json
import sys

sys.stdout.reconfigure(encoding="utf-8")

with open("data/lessons/ga4--5-1.json", encoding="utf-8") as f:
    data = json.load(f)

# New exercise: code-based data model exercise
# User fills in GA4 event objects as JavaScript - tests data model understanding
data["sections"][2]["data"]["content"] = (
    "# 練習: ユーザー行動をGA4イベントモデルで表現する\n\n"
    "以下のユーザー行動シナリオを、GA4のイベントベースモデルで表現してください。\n\n"
    "## シナリオ\n\n"
    "あるECサイトで、ユーザーが以下の行動を取りました。\n\n"
    "1. トップページを閲覧した\n"
    "2. 検索バーで「ワイヤレスイヤホン」と検索した\n"
    "3. 「カートに追加」ボタンを押した（商品名: WH-1000XM5、価格: 44,000円）\n\n"
    "## 課題\n\n"
    "各行動のGA4イベントオブジェクトを完成させてください。\n"
    "`event_name`と`event_params`を正しく設定し、`classify`にイベント分類を記入してください。\n\n"
    "[▶ 実行] を押すと判定結果が表示されます。"
)

data["sections"][2]["data"]["starterCode"] = """<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <title>GA4 イベントモデル練習</title>
  <style>
    body { font-family: sans-serif; padding: 20px; background: #f8fafc; }
    .card { background: white; border-radius: 12px; padding: 16px; margin: 12px 0; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    .label { font-size: 12px; color: #64748b; font-weight: bold; }
    .event-name { font-size: 18px; font-weight: bold; color: #0f172a; font-family: monospace; }
    .classify { display: inline-block; padding: 2px 8px; border-radius: 8px; font-size: 12px; font-weight: bold; }
    .auto { background: #dbeafe; color: #1d4ed8; }
    .enhanced { background: #d1fae5; color: #065f46; }
    .recommended { background: #fef3c7; color: #92400e; }
    .custom { background: #ede9fe; color: #5b21b6; }
    pre { background: #1e293b; color: #e2e8f0; padding: 12px; border-radius: 8px; overflow-x: auto; font-size: 13px; }
    #result { margin-top: 20px; padding: 16px; border-radius: 12px; font-weight: bold; }
    .ok { background: #d1fae5; color: #065f46; }
    .ng { background: #fee2e2; color: #991b1b; }
  </style>
</head>
<body>
  <h2>GA4 イベントモデル練習</h2>
  <p>各行動のイベントオブジェクトを完成させてください。</p>
  <div id="events"></div>
  <div id="result"></div>

  <script>
    // === ここを編集してください ===

    // 行動1: トップページを閲覧した
    const event1 = {
      event_name: "",        // GA4のイベント名を入力
      classify: "",          // 自動収集 / 拡張計測 / 推奨 / カスタム
      event_params: {
        // 主要パラメータを追加
      }
    };

    // 行動2: 検索バーで「ワイヤレスイヤホン」と検索した
    const event2 = {
      event_name: "",
      classify: "",
      event_params: {
        // 主要パラメータを追加
      }
    };

    // 行動3: カートに追加（WH-1000XM5、44,000円）
    const event3 = {
      event_name: "",
      classify: "",
      event_params: {
        // 主要パラメータを追加
      }
    };

    // === ここから下は変更不要 ===
    const events = [
      { label: "行動1: トップページ閲覧", data: event1 },
      { label: "行動2: サイト内検索", data: event2 },
      { label: "行動3: カートに追加", data: event3 },
    ];

    const classMap = { "自動収集": "auto", "拡張計測": "enhanced", "推奨": "recommended", "カスタム": "custom" };

    let html = "";
    events.forEach(e => {
      const cls = classMap[e.data.classify] || "";
      html += '<div class="card">';
      html += '<div class="label">' + e.label + '</div>';
      html += '<div class="event-name">' + (e.data.event_name || "（未入力）") + '</div>';
      if (e.data.classify) html += ' <span class="classify ' + cls + '">' + e.data.classify + '</span>';
      html += '<pre>' + JSON.stringify(e.data.event_params, null, 2) + '</pre>';
      html += '</div>';
    });
    document.getElementById("events").innerHTML = html;

    // 判定
    let score = 0;
    let total = 6;
    let feedback = [];

    if (event1.event_name === "page_view") { score++; } else { feedback.push("行動1: event_nameは page_view です"); }
    if (event1.classify === "拡張計測") { score++; } else { feedback.push("行動1: page_viewは「拡張計測」に分類されます（デフォルトONで自動送信）"); }

    if (event2.event_name === "view_search_results") { score++; } else { feedback.push("行動2: event_nameは view_search_results です"); }
    if (event2.classify === "拡張計測") { score++; } else { feedback.push("行動2: view_search_resultsは「拡張計測」です"); }

    if (event3.event_name === "add_to_cart") { score++; } else { feedback.push("行動3: event_nameは add_to_cart です"); }
    if (event3.classify === "推奨") { score++; } else { feedback.push("行動3: add_to_cartは「推奨」イベントです（手動実装が必要）"); }

    const pct = Math.round(score / total * 100);
    const resultEl = document.getElementById("result");
    if (pct === 100) {
      resultEl.className = "ok";
      resultEl.textContent = "🎉 全問正解！GA4のイベント分類を正しく理解しています。";
    } else if (pct >= 50) {
      resultEl.className = "ng";
      resultEl.innerHTML = "💡 " + score + "/" + total + " 正解（" + pct + "%）<br><br>" + feedback.join("<br>");
    } else {
      resultEl.className = "ng";
      resultEl.innerHTML = "💪 " + score + "/" + total + " 正解<br><br>" + feedback.join("<br>");
    }
  </script>
</body>
</html>"""

data["sections"][2]["data"]["answer"] = """<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <title>GA4 イベントモデル練習 - 解答</title>
  <style>
    body { font-family: sans-serif; padding: 20px; background: #f8fafc; }
    .card { background: white; border-radius: 12px; padding: 16px; margin: 12px 0; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    .label { font-size: 12px; color: #64748b; font-weight: bold; }
    .event-name { font-size: 18px; font-weight: bold; color: #0f172a; font-family: monospace; }
    .classify { display: inline-block; padding: 2px 8px; border-radius: 8px; font-size: 12px; font-weight: bold; }
    .enhanced { background: #d1fae5; color: #065f46; }
    .recommended { background: #fef3c7; color: #92400e; }
    pre { background: #1e293b; color: #e2e8f0; padding: 12px; border-radius: 8px; overflow-x: auto; font-size: 13px; }
    #result { margin-top: 20px; padding: 16px; border-radius: 12px; font-weight: bold; background: #d1fae5; color: #065f46; }
  </style>
</head>
<body>
  <h2>GA4 イベントモデル練習 - 模範解答</h2>
  <div id="events"></div>
  <div id="result"></div>

  <script>
    const event1 = {
      event_name: "page_view",
      classify: "拡張計測",
      event_params: {
        page_title: "トップページ",
        page_location: "https://example.com/"
      }
    };

    const event2 = {
      event_name: "view_search_results",
      classify: "拡張計測",
      event_params: {
        search_term: "ワイヤレスイヤホン"
      }
    };

    const event3 = {
      event_name: "add_to_cart",
      classify: "推奨",
      event_params: {
        currency: "JPY",
        value: 44000,
        items: [{ item_name: "WH-1000XM5", price: 44000 }]
      }
    };

    const events = [
      { label: "行動1: トップページ閲覧", data: event1 },
      { label: "行動2: サイト内検索", data: event2 },
      { label: "行動3: カートに追加", data: event3 },
    ];

    const classMap = { "拡張計測": "enhanced", "推奨": "recommended" };
    let html = "";
    events.forEach(e => {
      const cls = classMap[e.data.classify] || "";
      html += '<div class="card">';
      html += '<div class="label">' + e.label + '</div>';
      html += '<div class="event-name">' + e.data.event_name + '</div>';
      html += ' <span class="classify ' + cls + '">' + e.data.classify + '</span>';
      html += '<pre>' + JSON.stringify(e.data.event_params, null, 2) + '</pre>';
      html += '</div>';
    });
    document.getElementById("events").innerHTML = html;

    let score = 6, total = 6;
    document.getElementById("result").textContent = "🎉 全問正解！GA4のイベント分類を正しく理解しています。";
  </script>
</body>
</html>"""

data["sections"][2]["data"]["hints"] = [
    "ページ閲覧は page_view イベントです。拡張計測としてデフォルトONで自動送信されます。page_title と page_location が自動付与されます。",
    "サイト内検索は view_search_results（拡張計測）です。search_term パラメータに検索キーワードが入ります。コード不要で自動取得されます。",
    "カートに追加は add_to_cart（推奨イベント）です。手動実装が必要で、items 配列内に item_name, price を含めます。"
]

with open("data/lessons/ga4--5-1.json", "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)
    f.write("\n")

print("Updated ga4--5-1.json exercise with code-editor compatible content")
