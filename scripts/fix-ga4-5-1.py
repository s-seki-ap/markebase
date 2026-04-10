#!/usr/bin/env python3
"""Fix ga4--5-1.json concept section code blocks that were lost during bash execution."""
import json
import sys

sys.stdout.reconfigure(encoding="utf-8")

with open("data/lessons/ga4--5-1.json", encoding="utf-8") as f:
    data = json.load(f)

concept = data["sections"][1]["data"]["content"]

# Fix: restore tree diagram after "### 3. イベント（Event）" section
old_after_event = "GA4では **すべてがイベント** です。\n\n\n\n## イベントの構造"
new_after_event = (
    "GA4では **すべてがイベント** です。\n\n"
    "```\n"
    'ユーザー（user_pseudo_id: "abc123"）\n'
    "├── セッション1（ga_session_id: 111）\n"
    '│   ├── session_start\n'
    '│   ├── page_view（page_title: "トップ"）\n'
    '│   ├── scroll（percent_scrolled: 90）\n'
    '│   └── page_view（page_title: "商品詳細"）\n'
    "└── セッション2（ga_session_id: 222）\n"
    '    ├── session_start\n'
    '    ├── page_view（page_title: "商品詳細"）\n'
    '    ├── add_to_cart（item_name: "Tシャツ", price: 3980）\n'
    '    └── purchase（transaction_id: "T-001", value: 3980）\n'
    "```\n\n"
    "## イベントの構造"
)
concept = concept.replace(old_after_event, new_after_event)

# Fix: restore event structure code block
old_after_structure = "各イベントは以下の要素で構成されます。\n\n\n\n## UAとGA4の比較"
new_after_structure = (
    "各イベントは以下の要素で構成されます。\n\n"
    "```\n"
    'イベント（event）\n'
    '├── event_name: "purchase"           # 何が起きたか\n'
    '├── event_timestamp: 1234567890      # いつ起きたか\n'
    '└── event_params: [                  # どんな内容か\n'
    '      { key: "transaction_id", value: "T-001" },\n'
    '      { key: "value", value: 29800 },\n'
    '      { key: "currency", value: "JPY" }\n'
    '    ]\n'
    "```\n\n"
    "## UAとGA4の比較"
)
concept = concept.replace(old_after_structure, new_after_structure)

# Fix: restore SQL code block
old_after_bq = "GA4のデータはBigQueryに以下の形で保存されます。\n\nproject.dataset.events_*\n\nBigQuery連携"
new_after_bq = (
    "GA4のデータはBigQueryに以下の形で保存されます。\n\n"
    "```sql\n"
    "-- テーブル名: events_YYYYMMDD\n"
    "SELECT\n"
    "  event_name,\n"
    "  event_date,\n"
    "  (SELECT value.string_value\n"
    "   FROM UNNEST(event_params)\n"
    "   WHERE key = 'page_title') AS page_title,\n"
    "  user_pseudo_id\n"
    "FROM `project.dataset.events_*`\n"
    "WHERE event_name = 'page_view'\n"
    "LIMIT 10\n"
    "```\n\n"
    "BigQuery連携"
)
concept = concept.replace(old_after_bq, new_after_bq)

data["sections"][1]["data"]["content"] = concept

with open("data/lessons/ga4--5-1.json", "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)
    f.write("\n")

print("Fixed code blocks in ga4--5-1.json concept section")
