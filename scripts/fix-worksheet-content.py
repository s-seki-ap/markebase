#!/usr/bin/env python3
"""
ワークシート演習のcontent文をAI添削フロー前提に変換する。
- 「HTMLを完成させ」「HTMLを作成」等のHTML編集指示を除去
- 「自分の考えを整理して書き出す」形式に変換
- [▶ 実行] 等の操作指示を除去
"""
import json
import glob
import os
import re
import sys

sys.stdout.reconfigure(encoding="utf-8")

PATTERNS = [
    "data/lessons/advertising--*.json",
    "data/lessons/project-management--*.json",
    "data/lessons/marketing-strategy--*.json",
]

# Replacement rules for content text
REPLACEMENTS = [
    # Remove HTML editing instructions (specific patterns first)
    (r"以下のHTMLテンプレートを完成させ、?", "以下のテンプレートに沿って、"),
    (r"以下のHTMLテンプレートを使い、?", "以下のテンプレートに沿って、"),
    (r"以下のHTMLテンプレートを使って、?", "以下のテンプレートに沿って、"),
    (r"以下のHTMLを完成させ、?", "以下の指示に沿って、"),
    (r"以下のHTMLに、?", "以下の指示に沿って、"),
    (r"以下のHTML.*?を完成させてください。?", "以下の項目を整理して記述してください。"),
    (r"HTMLテンプレートの各セクションを埋めて", "各セクションの内容を記述して"),
    (r"HTMLテンプレートに、?", "テンプレートに沿って、"),
    (r"HTMLドキュメントにまとめ(ます|てください)。?", r"内容を整理し\1。"),
    (r"をHTMLで作成します。?", "の内容を整理します。"),
    (r"のHTMLを作成します。", "の内容を整理します。"),
    (r"のHTML.*?を作成してください。?", "の内容を整理して書き出してください。"),
    (r"をHTMLで可視化してください。?", "を整理して書き出してください。"),
    (r"HTMLで作成してください。?", "整理して書き出してください。"),
    (r"HTMLを完成させます。?", "内容を整理します。"),
    (r"を表示するHTMLを完成させます。?", "の内容を整理します。"),
    (r"をHTMLドキュメントにまとめてください。?", "の内容を整理して書き出してください。"),
    (r"HTMLテーブルに入力してください。?", "一覧にまとめてください。"),
    (r"HTMLシートに、?", "以下に、"),
    (r"のHTMLを完成させてください。?", "の内容を整理して記述してください。"),
    (r"HTML(と|や)JavaScript.*?を作成してください。?", "内容を整理して書き出してください。"),
    (r"HTMLとJavaScriptを使って、", ""),
    (r"HTMLを使って", ""),
    (r"HTML形式で", ""),
    (r"対応するHTML要素に表示する", "書き出す"),
    # Remove preview/run instructions
    (r"完成したら\s*\*?\*?\[?▶\s*実行\]?\*?\*?.*?確認してください。?\s*", ""),
    (r"\[▶\s*実行\].*?確認.*?。\s*", ""),
    (r"完成したら.*?プレビュー.*?確認.*?。?\s*", ""),
    # Change "table" references to list/organize format
    (r"表を作成してください", "一覧を整理してください"),
    (r"の表を完成させ", "の一覧を整理し"),
    (r"ダッシュボードを作成してください", "ダッシュボードの内容を整理してください"),
    # Row/cell instructions to text format
    (r"の行を追加する", "について記述する"),
    (r"行を追加してください", "項目を書き出してください"),
    (r"カードを追加する", "項目を書き出す"),
]

def transform_content(content: str) -> str:
    """Transform exercise content to AI review format."""
    result = content
    for pattern, replacement in REPLACEMENTS:
        result = re.sub(pattern, replacement, result)

    # Add AI review instruction if not present
    if "AI添削" not in result and "AI" not in result:
        result = result.rstrip()
        result += "\n\n> 💡 回答を入力したら「AI添削」ボタンで評価を受けましょう。"

    return result


def main():
    files = []
    for pattern in PATTERNS:
        files.extend(sorted(glob.glob(pattern)))

    modified = 0
    for filepath in files:
        with open(filepath, encoding="utf-8") as f:
            data = json.load(f)

        changed = False
        for section in data.get("sections", []):
            if section["type"] == "exercise":
                old_content = section["data"]["content"]
                new_content = transform_content(old_content)
                if new_content != old_content:
                    section["data"]["content"] = new_content
                    changed = True
                    print(f"  Modified: {os.path.basename(filepath)}")

        if changed:
            with open(filepath, "w", encoding="utf-8") as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
                f.write("\n")
            modified += 1

    print(f"\nTotal: {len(files)} files checked, {modified} modified")


if __name__ == "__main__":
    main()
