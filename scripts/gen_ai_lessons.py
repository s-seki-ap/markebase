#!/usr/bin/env python3
"""AI & 自動化カテゴリ（7-1〜7-50）のレッスンJSON一括生成"""
import json
import os

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'data', 'lessons')

def w(num, obj):
    p = os.path.join(OUT, f'ai-automation--7-{num}.json')
    with open(p, 'w', encoding='utf-8') as f:
        json.dump(obj, f, ensure_ascii=False, indent=2)
    print(f'  7-{num}: {obj["title"]}')

def L(num, title, sections):
    return {"id":f"ai-automation--7-{num}","moduleId":f"7-{num}","categoryId":"ai-automation","title":title,"sections":sections}

def intro(c, diagram=False):
    return {"type":"intro","data":{"content":c,"diagram":diagram}}

def concept(c, diagram=False):
    return {"type":"concept","data":{"content":c,"diagram":diagram}}

def interactive(content, html, checkpoints):
    return {"type":"exercise","data":{"type":"interactive","data":{"content":content,"htmlContent":html,"checkpoints":checkpoints}}}

def exercise_code(content, starter, hints, answer):
    return {"type":"exercise","data":{"content":content,"starterCode":starter,"hints":hints,"answer":answer}}

def quiz(questions):
    return {"type":"quiz","data":{"questions":questions}}

def Q(q, opts, correct, exp):
    return {"q":q,"options":opts,"correct":correct,"explanation":exp}

def summary(c):
    return {"type":"summary","data":{"content":c,"diagram":False}}

# ========== CSS/JS Templates for interactive exercises ==========

DARK_CSS = """*{margin:0;padding:0;box-sizing:border-box}body{background:#0f172a;color:#e2e8f0;font-family:system-ui,sans-serif;padding:24px;min-height:100vh}"""

def dnd_sort_html(title_text, subtitle_text, items_js, check_order_js, correct_msg, wrong_hint):
    """ドラッグ&ドロップ並べ替えHTMLテンプレート"""
    return f"""<!DOCTYPE html><html><head><meta charset="UTF-8"><style>{DARK_CSS}.title{{font-size:1.3rem;font-weight:700;margin-bottom:8px;color:#f1f5f9}}.subtitle{{color:#94a3b8;margin-bottom:20px;font-size:.9rem}}.container{{display:flex;gap:24px;flex-wrap:wrap}}.source{{flex:1;min-width:280px}}.target{{flex:1;min-width:280px}}.label{{font-size:.85rem;color:#8b5cf6;font-weight:600;margin-bottom:10px}}.card{{background:#1e293b;border:2px solid #334155;border-radius:10px;padding:14px 16px;margin-bottom:10px;cursor:grab;transition:all .2s;user-select:none}}.card:hover{{border-color:#3b82f6}}.card.dragging{{opacity:.4}}.card .main{{font-weight:600;font-size:.95rem;margin-bottom:4px}}.card .sub{{font-size:.8rem;color:#94a3b8}}.drop-zone{{background:#1e293b;border:2px dashed #334155;border-radius:10px;padding:14px 16px;margin-bottom:10px;min-height:56px;transition:all .2s;display:flex;align-items:center}}.drop-zone.over{{border-color:#10b981;background:#0f2a1e}}.drop-zone .num{{color:#475569;font-size:1.2rem;font-weight:700;margin-right:12px;min-width:24px}}.drop-zone.filled{{border-style:solid;border-color:#10b981;background:#0f2a1e}}.btn{{background:#3b82f6;color:#fff;border:none;border-radius:8px;padding:12px 28px;font-size:1rem;font-weight:600;cursor:pointer;margin-top:16px}}.btn:hover{{background:#2563eb}}.result{{margin-top:16px;padding:16px;border-radius:10px;font-weight:600;display:none}}.result.correct{{background:#052e16;border:2px solid #10b981;color:#10b981;display:block}}.result.wrong{{background:#2a0f0f;border:2px solid #ef4444;color:#ef4444;display:block}}</style></head><body><div class="title">{title_text}</div><div class="subtitle">{subtitle_text}</div><div class="container"><div class="source" id="source"><div class="label">カード</div></div><div class="target" id="target"><div class="label">正しい順序（上から下）</div></div></div><button class="btn" onclick="checkAnswer()">回答を確認</button><div class="result" id="result"></div><script>const items={items_js};const correctOrder={check_order_js};const shuffled=[...items].sort(()=>Math.random()-.5);const sourceEl=document.getElementById("source");const targetEl=document.getElementById("target");const slots=new Array(items.length).fill(null);let draggedId=null;items.forEach((_,i)=>{{const dz=document.createElement("div");dz.className="drop-zone";dz.dataset.slot=i;dz.innerHTML=`<span class="num">${{i+1}}</span><span>ここにドロップ</span>`;targetEl.appendChild(dz)}});shuffled.forEach(item=>{{const card=document.createElement("div");card.className="card";card.draggable=true;card.dataset.id=item.id;card.innerHTML=`<div class="main">${{item.main}}</div><div class="sub">${{item.sub}}</div>`;card.addEventListener("dragstart",()=>{{draggedId=item.id;card.classList.add("dragging")}});card.addEventListener("dragend",()=>card.classList.remove("dragging"));sourceEl.appendChild(card)}});document.querySelectorAll(".drop-zone").forEach(zone=>{{zone.addEventListener("dragover",e=>{{e.preventDefault();zone.classList.add("over")}});zone.addEventListener("dragleave",()=>zone.classList.remove("over"));zone.addEventListener("drop",e=>{{e.preventDefault();zone.classList.remove("over");const si=parseInt(zone.dataset.slot);if(slots[si]!==null){{const old=zone.querySelector(".card");if(old)sourceEl.appendChild(old);slots[si]=null}}const card=document.querySelector(`.card[data-id="${{draggedId}}"]`);if(card){{const prev=slots.indexOf(draggedId);if(prev!==-1){{const pz=document.querySelector(`.drop-zone[data-slot="${{prev}}"]`);pz.classList.remove("filled");pz.innerHTML=`<span class="num">${{prev+1}}</span><span>ここにドロップ</span>`;slots[prev]=null}}zone.innerHTML=`<span class="num">${{si+1}}</span>`;zone.appendChild(card);zone.classList.add("filled");slots[si]=draggedId}}}})}});function checkAnswer(){{const ok=slots.every((s,i)=>s===correctOrder[i]);const r=document.getElementById("result");r.className=ok?"result correct":"result wrong";r.textContent=ok?"{correct_msg}":"{wrong_hint}";r.style.display="block"}}</script></body></html>"""

def select_quiz_html(title_text, questions_js):
    """穴埋め選択HTMLテンプレート"""
    return f"""<!DOCTYPE html><html><head><meta charset="UTF-8"><style>{DARK_CSS}.title{{font-size:1.3rem;font-weight:700;margin-bottom:16px}}.quiz-item{{background:#1e293b;border:2px solid #334155;border-radius:10px;padding:16px;margin-bottom:12px}}.quiz-item .q{{font-weight:600;margin-bottom:12px;font-size:.95rem}}.options{{display:flex;gap:8px;flex-wrap:wrap}}.opt{{background:#334155;border:2px solid #475569;border-radius:8px;padding:10px 16px;cursor:pointer;transition:all .2s;font-size:.85rem}}.opt:hover{{border-color:#3b82f6}}.opt.selected{{border-color:#3b82f6;background:#1e3a5f}}.opt.correct{{border-color:#10b981;background:#052e16}}.opt.wrong{{border-color:#ef4444;background:#2a0f0f}}.btn{{background:#3b82f6;color:#fff;border:none;border-radius:8px;padding:12px 28px;font-size:1rem;font-weight:600;cursor:pointer;margin-top:8px}}.btn:hover{{background:#2563eb}}.result{{margin-top:16px;padding:14px;border-radius:10px;font-weight:600;display:none}}.feedback{{margin-top:8px;font-size:.8rem;color:#94a3b8;display:none}}</style></head><body><div class="title">{title_text}</div><div id="questions"></div><button class="btn" onclick="check()">回答を確認</button><div class="result" id="result"></div><script>const qs={questions_js};const container=document.getElementById("questions");const selections=new Array(qs.length).fill(-1);qs.forEach((q,i)=>{{const div=document.createElement("div");div.className="quiz-item";div.innerHTML=`<div class="q">${{i+1}}. ${{q.q}}</div><div class="options">${{q.opts.map((o,j)=>`<div class="opt" data-q="${{i}}" data-o="${{j}}" onclick="sel(${{i}},${{j}})">${{o}}</div>`).join("")}}</div><div class="feedback" id="fb-${{i}}"></div>`;container.appendChild(div)}});function sel(qi,oi){{selections[qi]=oi;document.querySelectorAll(`[data-q="${{qi}}"]`).forEach(el=>{{el.className=el.dataset.o==oi?"opt selected":"opt"}})}}function check(){{let score=0;qs.forEach((q,i)=>{{const fb=document.getElementById("fb-"+i);document.querySelectorAll(`[data-q="${{i}}"]`).forEach(el=>{{const oi=parseInt(el.dataset.o);if(oi===q.ans)el.className="opt correct";else if(oi===selections[i])el.className="opt wrong";else el.className="opt"}});fb.textContent=q.exp;fb.style.display="block";if(selections[i]===q.ans)score++}});const r=document.getElementById("result");r.style.display="block";const ok=score>=qs.length-1;r.style.background=ok?"#052e16":"#2a0f0f";r.style.border=ok?"2px solid #10b981":"2px solid #ef4444";r.style.color=ok?"#10b981":"#ef4444";r.textContent=`${{score}}/${{qs.length}}問正解！`}}</script></body></html>"""

def category_dnd_html(title_text, cards_js, categories_js):
    """カテゴリ分類ドラッグ&ドロップHTMLテンプレート"""
    cats_html = ""
    for cat in categories_js:
        cats_html += f'<div class="cat"><div class="cat-title" style="color:{cat["color"]}">{cat["name"]}</div><div class="cat-desc">{cat["desc"]}</div><div class="cat-drop" data-cat="{cat["id"]}"></div></div>'

    return f"""<!DOCTYPE html><html><head><meta charset="UTF-8"><style>{DARK_CSS}.title{{font-size:1.3rem;font-weight:700;margin-bottom:16px}}.cards{{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:20px;min-height:60px;padding:8px;background:#1e293b;border-radius:10px}}.card{{background:#334155;border:2px solid #475569;border-radius:8px;padding:10px 14px;cursor:grab;transition:all .2s;font-size:.85rem;user-select:none}}.card:hover{{border-color:#3b82f6;transform:translateY(-2px)}}.card.dragging{{opacity:.4}}.categories{{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px;margin-bottom:20px}}.cat{{background:#1e293b;border:2px solid #334155;border-radius:12px;padding:16px;min-height:180px}}.cat-title{{font-weight:700;font-size:.95rem;margin-bottom:4px}}.cat-desc{{font-size:.75rem;color:#94a3b8;margin-bottom:12px}}.cat-drop{{min-height:100px;border:2px dashed #334155;border-radius:8px;padding:8px;display:flex;flex-direction:column;gap:6px;transition:all .2s}}.cat-drop.over{{border-color:#10b981;background:rgba(16,185,129,.08)}}.cat-drop .card{{font-size:.8rem;padding:8px 10px}}.btn{{background:#3b82f6;color:#fff;border:none;border-radius:8px;padding:12px 28px;font-size:1rem;font-weight:600;cursor:pointer}}.btn:hover{{background:#2563eb}}.result{{margin-top:16px;padding:14px;border-radius:10px;font-weight:600;display:none}}</style></head><body><div class="title">{title_text}</div><div class="cards" id="source"></div><div class="categories">{cats_html}</div><button class="btn" onclick="check()">回答を確認</button><div class="result" id="result"></div><script>const tasks={cards_js};const shuffled=[...tasks].sort(()=>Math.random()-.5);const src=document.getElementById("source");let dragId=null;shuffled.forEach(t=>{{const c=document.createElement("div");c.className="card";c.draggable=true;c.dataset.id=t.id;c.textContent=t.text;c.addEventListener("dragstart",()=>{{dragId=t.id;c.classList.add("dragging")}});c.addEventListener("dragend",()=>c.classList.remove("dragging"));src.appendChild(c)}});document.querySelectorAll(".cat-drop").forEach(drop=>{{drop.addEventListener("dragover",e=>{{e.preventDefault();drop.classList.add("over")}});drop.addEventListener("dragleave",()=>drop.classList.remove("over"));drop.addEventListener("drop",e=>{{e.preventDefault();drop.classList.remove("over");const card=document.querySelector(`.card[data-id="${{dragId}}"]`);if(card)drop.appendChild(card)}})}});src.addEventListener("dragover",e=>e.preventDefault());src.addEventListener("drop",e=>{{e.preventDefault();const card=document.querySelector(`.card[data-id="${{dragId}}"]`);if(card)src.appendChild(card)}});function check(){{let score=0;tasks.forEach(t=>{{const card=document.querySelector(`.card[data-id="${{t.id}}"]`);if(card&&card.parentElement){{const parent=card.parentElement.dataset.cat;if(parent===t.cat){{score++;card.style.borderColor="#10b981"}}else{{card.style.borderColor="#ef4444"}}}}}});const r=document.getElementById("result");r.style.display="block";const ok=score===tasks.length;r.style.background=ok?"#052e16":"#2a0f0f";r.style.border=ok?"2px solid #10b981":"2px solid #ef4444";r.style.color=ok?"#10b981":"#ef4444";r.textContent=ok?`全問正解！（${{score}}/${{tasks.length}}）`:`${{score}}/${{tasks.length}}問正解です。もう一度挑戦しましょう。`}}</script></body></html>"""

def fill_blank_html(title_text, passages_js):
    """穴埋め選択（セレクトボックス）HTMLテンプレート"""
    return f"""<!DOCTYPE html><html><head><meta charset="UTF-8"><style>{DARK_CSS}.title{{font-size:1.3rem;font-weight:700;margin-bottom:16px}}.passage{{background:#1e293b;border-radius:12px;padding:20px;line-height:2.2;font-size:.95rem;margin-bottom:16px}}.blank select{{background:#334155;border:2px solid #475569;border-radius:6px;padding:6px 10px;color:#e2e8f0;font-size:.85rem;min-width:140px}}.blank select:focus{{border-color:#3b82f6;outline:none}}.btn{{background:#3b82f6;color:#fff;border:none;border-radius:8px;padding:12px 28px;font-size:1rem;font-weight:600;cursor:pointer}}.btn:hover{{background:#2563eb}}.result{{margin-top:16px;padding:14px;border-radius:10px;font-weight:600;display:none}}</style></head><body><div class="title">{title_text}</div><div class="passage" id="passage"></div><button class="btn" onclick="check()">回答を確認</button><div class="result" id="result"></div><script>const blanks={passages_js};const container=document.getElementById("passage");blanks.forEach((b,i)=>{{const p=document.createElement("p");let opts=b.options.map(o=>`<option value="${{o.v}}">${{o.l}}</option>`).join("");p.innerHTML=`${{b.before}} <span class="blank"><select id="b${{i}}"><option value="">---</option>${{opts}}</select></span> ${{b.after}}`;container.appendChild(p);const br=document.createElement("br");container.appendChild(br)}});function check(){{let s=0;blanks.forEach((b,i)=>{{const el=document.getElementById("b"+i);if(el.value===b.answer){{s++;el.style.borderColor="#10b981"}}else el.style.borderColor="#ef4444"}});const r=document.getElementById("result");r.style.display="block";const ok=s===blanks.length;r.style.background=ok?"#052e16":"#2a0f0f";r.style.border=ok?"2px solid #10b981":"2px solid #ef4444";r.style.color=ok?"#10b981":"#ef4444";r.textContent=ok?`全問正解！（${{s}}/${{blanks.length}}）`:`${{s}}/${{blanks.length}}問正解。`}}</script></body></html>"""

# ==================== LESSON DATA ====================
# 7-1 は既に直接書いたのでスキップ可能だが、統一のため再生成

def gen_all():
    os.makedirs(OUT, exist_ok=True)

    # ============= 7-1 =============
    w(1, L(1, "人工知能の歴史と変遷", [
        intro("# AIの歴史を知ることがマーケターに必要な理由\n\n「AI」という言葉は今や日常的に使われますが、その歴史を知らずに活用しようとすると、技術の限界や強みを見誤ります。\n\nマーケターとして重要なのは、**なぜ今このタイミングでAIが「使える」ようになったのか**を理解することです。\n\n## AIブームは今回が初めてではない\n\nAIには過去に2度の「冬の時代」がありました。期待が膨らみ、失望が訪れ、研究が停滞するサイクルが繰り返されてきました。\n\n今起きていることが過去のブームと違う理由を、歴史の流れから理解しましょう。\n\n**あなたへの問い**: 「AIを使ったマーケティング施策」と聞いて、何を思い浮かべますか？それは本当にAIである必要がありますか？"),
        concept("# AI発展の5つの時代\n\n## 第1期: 黎明期（1950年代〜1960年代）\n\nアラン・チューリングが「機械は考えられるか？」という問いを提起（1950年）。記号処理による推論プログラムが登場。\n\n**限界**: 現実の複雑さに対応できず。計算資源が圧倒的に不足。\n\n## 第2期: エキスパートシステム〜冬の時代（1970年代〜1980年代）\n\nエキスパートシステム（専門家の知識をルール化したAI）が実用化。しかし知識の記述コストが膨大で破綻。\n\n## 第3期: ニューラルネットワーク〜冬の時代（1980年代後半〜2000年代前半）\n\nニューラルネットワークの研究が進むも、計算能力の限界から商用化には至らず。\n\n## 第4期: 機械学習の実用化（2000年代〜2010年代前半）\n\nビッグデータの蓄積とクラウドの普及で機械学習が実用化。スパムフィルタ、レコメンド、広告最適化に活用。\n\n**マーケティングへの影響**: Google広告のスマート入札、Amazonのレコメンドエンジン。\n\n## 第5期: 深層学習革命〜生成AI（2012年〜現在）\n\n2012年のImageNetでディープラーニングが圧勝。2022年のChatGPT登場で一般への普及が爆発的に加速。\n\n**マーケティングへの影響**: コンテンツ生成、広告クリエイティブ自動化、チャットボット、SEO対策の変革。\n\n## なぜ今AIが「使える」のか\n\n```\n3つの要因が揃った\n├── データ量: SNS・ECの普及でビッグデータが蓄積\n├── 計算能力: GPU・TPUの進化とクラウドの低コスト化\n└── アルゴリズム: Transformer（2017年）による精度向上\n```", True),
        interactive("# 演習: AI技術の発展を時系列に並べ替えよう\n\nAIの主要なマイルストーンを正しい時系列順に並べ替えてください。",
            dnd_sort_html("AI技術の発展タイムライン", "カードをドラッグして古い順に並べましょう",
                '[{id:0,main:"チューリングテスト提唱",sub:"1950年代 - 機械は考えられるか？"},{id:1,main:"エキスパートシステム実用化",sub:"1980年代 - ルールベースAIの台頭と限界"},{id:2,main:"ディープラーニング再発見",sub:"2006年 - ヒントン教授の研究で復活"},{id:3,main:"ImageNetでCNN圧勝",sub:"2012年 - 画像認識が人間を超え始める"},{id:4,main:"ChatGPT一般公開",sub:"2022年 - 生成AIがマーケティングを変革"}]',
                '[0,1,2,3,4]',
                "正解！理論提唱→ルールベース→深層学習再発見→画像認識突破→生成AI普及の流れです。",
                "不正解。チューリング(1950s)→エキスパートシステム(1980s)→深層学習(2006)→ImageNet(2012)→ChatGPT(2022)の順です。"),
            ["5つのAIマイルストーンを正しい時系列で並べられた","各技術のマーケティングへの影響を理解した","AIブームと冬の時代のサイクルを把握した"]),
        quiz([
            Q("AI研究が「冬の時代」を迎えた主な理由はどれですか？",
              ["AI研究者が不足したため","計算能力やデータ量が技術の要求水準に追いつかなかったため","政府の規制で研究が禁止されたため","投資家の関心がなかったため"],1,
              "AIの冬は計算資源・データ量の不足が主因。現在はGPU進化とビッグデータで解消。"),
            Q("2022年の生成AIブームの直接的きっかけは？",
              ["Google検索アルゴリズム更新","ChatGPTの一般公開","Meta広告AIの刷新","Appleプライバシー規制強化"],1,
              "2022年11月のChatGPT公開が直接のきっかけ。5日で100万ユーザー突破。"),
            Q("現在のAIブームが過去と異なる最大の理由は？",
              ["AIアルゴリズムが初めて発明された","データ量・計算能力・Transformerの3要素が同時に揃った","政府の巨額補助金","量子コンピュータの実用化"],1,
              "ビッグデータ・GPU/TPU進化・Transformer発明の3要素が同時に揃ったことが決定的。")
        ]),
        summary("# モジュール7-1 完了！\n\n## 習得したポイント\n\n✅ AIには2度の冬の時代があり、現在が3度目のブームであることを説明できる\n✅ 現在のAIブームが過去と異なる理由（データ・計算能力・Transformer）を理解した\n✅ 各AI時代のマーケティング活用事例を時系列で整理できた\n✅ 「AI」が指す技術の幅広さを認識した\n\n## 次のステップ\n\n次のモジュール **「7-2: 機械学習の基礎と学習方式」** では、AIの中核技術「機械学習」をマーケティング視点で解説します。\n\n> 実務チャレンジ: 自社サイトで「AI活用」と記載されている機能を1つ探し、どの時代の技術に相当するか考えてみましょう。")
    ]))

    # ============= 7-2 =============
    w(2, L(2, "機械学習の基礎と学習方式", [
        intro("# 「ルールを書かずに学習する」とはどういうことか\n\n従来のプログラムは人間がルールを書きます。「IF 購入金額が1万円以上 THEN ゴールド会員」のように。\n\n**機械学習**は違います。大量のデータを見せると、機械が自分でルールを発見します。\n\n## なぜマーケターに必要か\n\n- Google広告の「スマート入札」は機械学習\n- Meta広告の「類似オーディエンス」は機械学習\n- メールの最適送信時間予測は機械学習\n- ECサイトの離脱予測は機械学習\n\n**あなたが毎日使っているツールの大半がすでに機械学習で動いています。**\n\n**あなたへの問い**: 最近使った広告プラットフォームの「自動最適化」は、何を目標に最適化していますか？"),
        concept("# 機械学習の3つの学習方式\n\n```\n機械学習の学習方式\n├── 教師あり学習（Supervised）\n│   ├── 分類: スパム判定、離脱予測\n│   └── 回帰: 売上予測、CPA予測\n├── 教師なし学習（Unsupervised）\n│   ├── クラスタリング: 顧客セグメント\n│   └── 次元削減: データ可視化\n└── 強化学習（Reinforcement）\n    └── 広告入札のリアルタイム最適化\n```\n\n## 教師あり学習\n\n正解ラベル付きデータで学習。\n\n| 例 | 入力 | 正解ラベル |\n|----|------|------------|\n| CVR予測 | ユーザー行動データ | 購入した/しなかった |\n| LTV予測 | 顧客属性・購買履歴 | 6ヶ月後の累計金額 |\n\n**マーケ活用**: Google広告スマート入札は過去のCVデータを正解として学習。\n\n## 教師なし学習\n\n正解ラベルなしでデータのパターンを発見。\n\n**マーケ活用**: GA4の予測オーディエンス、顧客クラスタリング。\n\n## 強化学習\n\n試行錯誤で「報酬を最大化する行動」を学習。\n\n**マーケ活用**: RTB入札最適化、ダイナミックプライシング。\n\n## 機械学習の限界\n\n- 学習データにないパターンに対応できない\n- データの偏りがバイアスを生む\n- 判断理由の説明が難しい（ブラックボックス問題）", True),
        interactive("# 演習: マーケティング課題を学習方式に分類しよう\n\n各課題カードを適切なカテゴリにドラッグ&ドロップしてください。",
            category_dnd_html("マーケティング課題を学習方式に分類",
                '[{id:"t1",text:"メール開封率からCVR予測",cat:"supervised"},{id:"t2",text:"顧客を購買パターンでグループ分け",cat:"unsupervised"},{id:"t3",text:"広告入札単価のリアルタイム最適化",cat:"reinforcement"},{id:"t4",text:"離脱しそうなユーザーの予測",cat:"supervised"},{id:"t5",text:"類似コンテンツの自動クラスタリング",cat:"unsupervised"},{id:"t6",text:"チャットボットの応答改善",cat:"reinforcement"}]',
                [{"id":"supervised","name":"教師あり学習","desc":"正解ラベル付きデータで学習","color":"#3b82f6"},
                 {"id":"unsupervised","name":"教師なし学習","desc":"ラベルなしでパターン発見","color":"#8b5cf6"},
                 {"id":"reinforcement","name":"強化学習","desc":"試行錯誤で報酬最大化","color":"#f59e0b"}]),
            ["6つの課題を3つの学習方式に正しく分類できた","教師あり・なし・強化学習の違いを実務例で説明できる","自社ツールがどの方式を使っているか推測できる"]),
        quiz([
            Q("Google広告スマート入札が主に使う方式は？",
              ["教師なし学習のみ","教師あり学習と強化学習の組み合わせ","クラスタリングのみ","ルールベースAI"],1,
              "過去CVデータ（正解ラベル）からの教師あり学習と、入札最適化の強化学習を組み合わせています。"),
            Q("顧客を購買パターンで自動グループ分けする方式は？",
              ["教師あり学習","強化学習","教師なし学習（クラスタリング）","深層学習"],2,
              "正解ラベルを与えずデータ自体のパターンからグループを発見するのがクラスタリング。"),
            Q("機械学習の精度が低い場合、最初に確認すべきは？",
              ["PC性能を上げる","高価なAIサービスに乗り換え","学習データの量と質を確認","最新アルゴリズムに変更"],2,
              "GIGO原則。精度はデータ品質に大きく依存するため、まずデータを見直す。")
        ]),
        summary("# モジュール7-2 完了！\n\n## 習得したポイント\n\n✅ 教師あり・教師なし・強化学習の違いを実務例で説明できる\n✅ Google広告やGA4が内部でどの学習方式を使っているか理解した\n✅ 機械学習の精度はデータ品質に依存することを認識した\n✅ マーケティング課題を適切な学習方式に分類できる\n\n## 次のステップ\n\n次のモジュール **「7-3: ニューラルネットワークと深層学習」** で深層学習の仕組みを学びます。\n\n> 実務チャレンジ: 自社ツールの「自動最適化」機能が教師あり・なし・強化学習のどれか推測してみましょう。")
    ]))

    # ============= 7-3 =============
    w(3, L(3, "ニューラルネットワークと深層学習", [
        intro("# 人間の脳を模倣した「学習する仕組み」\n\nニューラルネットワークは、人間の脳の神経細胞の接続を模倣した数学的モデルです。これを多層に積み重ねたものが**深層学習（ディープラーニング）**。\n\n## マーケターにとっての意味\n\n- Google広告の「自動入札」はニューラルネットワーク\n- Instagram・TikTokの「おすすめフィード」も深層学習\n- 画像生成AI（DALL-E、Midjourney）の基盤技術\n\n仕組みを知ることで、AIツールの設定を正しく行い、結果を的確に解釈できます。\n\n**あなたへの問い**: 「ディープラーニング」と「機械学習」の違いを聞かれたら、どう答えますか？"),
        concept("# ニューラルネットワークの基本構造\n\n```\nニューラルネットワークの構造\n├── 入力層（Input Layer）\n│   └── データを受け取る（画像ピクセル、テキストトークン等）\n├── 隠れ層（Hidden Layers）× N層\n│   ├── 浅い学習: 1〜2層 → 単純なパターン認識\n│   └── 深層学習: 数十〜数百層 → 複雑な特徴抽出\n└── 出力層（Output Layer）\n    └── 予測結果（分類確率、数値予測等）\n```\n\n## 深層学習の「深い」理由\n\n隠れ層を増やすほど複雑な特徴を段階的に学習。\n\n画像認識の例:\n- 第1層: エッジ（線の方向）\n- 第2層: テクスチャ（模様）\n- 第3層: パーツ（目・鼻）\n- 第4層以降: 顔全体→人物識別\n\n## マーケティング活用\n\n### 広告最適化\nGoogle広告スマート入札は数百万パラメータのNNでCV確率をリアルタイム予測。\n\n### 画像・動画広告の自動審査\nMeta広告のポリシー違反検出はCNNベースの画像分類。\n\n### 需要予測\nECの在庫最適化にRNNやTransformerベースの時系列予測が活用。\n\n## 深層学習の限界\n\n- **ブラックボックス**: 判断理由の説明が難しい\n- **大量データが必要**: 少量データでは学習困難\n- **計算コストが高い**: 学習に高価なGPUが必要", True),
        interactive("# 演習: ニューラルネットワークの構造と活用をマッチング\n\n各層の役割とマーケティング活用を正しくマッチングさせましょう。",
            select_quiz_html("ニューラルネットワークの層と活用マッチング",
                '[{q:"データ（画像・テキスト等）を受け取る最初の層は？",opts:["入力層","隠れ層","出力層"],ans:0,exp:"入力層はデータを受け取る最初の層です"},{q:"データの特徴を段階的に抽出する中間層は？",opts:["入力層","隠れ層","出力層"],ans:1,exp:"隠れ層がパターン認識の中核を担います"},{q:"予測結果を出す最後の層は？",opts:["入力層","隠れ層","出力層"],ans:2,exp:"出力層が最終的な予測結果を出力します"},{q:"広告画像のポリシー違反自動判定に使うNNは？",opts:["CNN（画像認識）","RNN（時系列）","Transformer（言語）"],ans:0,exp:"CNNは画像の特徴抽出に特化しています"},{q:"来月のEC売上を時系列データから予測するNNは？",opts:["CNN（画像認識）","RNN（時系列）","Transformer（言語）"],ans:1,exp:"RNNは時系列データの予測に適しています"},{q:"自然言語からSQL文を生成するLLMの基盤技術は？",opts:["CNN（画像認識）","RNN（時系列）","Transformer（言語）"],ans:2,exp:"Transformerは現在のLLMの基盤アーキテクチャです"}]'),
            ["入力層・隠れ層・出力層の役割を正しくマッチングできた","CNN・RNN・Transformerの用途を区別できた","マーケティング課題に適したNN構造を選択できる"]),
        quiz([
            Q("深層学習が「深い」理由は？",["データ量が多い","隠れ層が多層に積み重なっている","計算速度が速い","コードが長い"],1,"「ディープ」は隠れ層の多さを指す。層が深いほど複雑な特徴を学習可能。"),
            Q("広告画像のポリシー違反検出に最適なNNは？",["RNN","CNN","全結合NN","GAN"],1,"CNNは画像特徴の階層的抽出に特化。画像分類で圧倒的性能。"),
            Q("深層学習の課題として不適切なものは？",["大量データが必要","計算コストが高い","日本語に対応できない","判断理由の説明が難しい"],2,"深層学習は言語非依存。課題はデータ量・コスト・ブラックボックス性。")
        ]),
        summary("# モジュール7-3 完了！\n\n## 習得したポイント\n\n✅ NNの3層構造（入力・隠れ・出力）を説明できる\n✅ CNN・RNN・Transformerの用途の違いを理解した\n✅ 深層学習がマーケツールの内部でどう使われているか把握した\n✅ 深層学習の限界を認識した\n\n## 次のステップ\n\n次のモジュール **「7-4: NLP・画像認識・マルチモーダルAI」** でテキスト・画像・音声を横断するAI技術を学びます。\n\n> 実務チャレンジ: Canva AIやAdobe Fireflyを使う際、CNNベースの技術が動いていることを意識してみましょう。")
    ]))

    # ============= 7-4 =============
    w(4, L(4, "NLP・画像認識・マルチモーダルAI", [
        intro("# テキスト・画像・音声を横断するAI技術\n\nAIが扱える「入力」は年々広がっています。テキストだけでなく画像、音声、動画、さらにこれらを組み合わせた**マルチモーダルAI**が実用化されています。\n\n## マーケターの日常にあるAI技術\n\n- **NLP**: チャットボット、感情分析、SEOツール\n- **画像認識**: 広告クリエイティブの自動審査、商品画像検索\n- **音声認識**: 音声検索最適化、コールセンター分析\n\n技術の中身を知ることで、ツール選定と活用の精度が上がります。\n\n**あなたへの問い**: Google検索で画像をアップロードして検索したことはありますか？あれはどんなAI技術でしょうか？"),
        concept("# NLP・画像認識・マルチモーダルAI\n\n## NLP（自然言語処理）\n\n```\nNLPの主要タスク\n├── テキスト分類: スパム判定、感情分析\n├── 固有表現抽出: 人名・企業名・日付の検出\n├── 要約: 長文の自動要約\n├── 翻訳: 多言語対応\n├── 質問応答: FAQ自動回答\n└── テキスト生成: コンテンツ作成\n```\n\n**マーケ活用**: SNS感情分析でブランド評判をリアルタイム監視。\n\n## 画像認識\n\n- **画像分類**: 「食品/衣料品/家電」判定\n- **物体検出**: 画像内アイテムの位置特定\n- **画像生成**: DALL-E, Midjourney\n\n**マーケ活用**: ECのビジュアル類似レコメンド、広告クリエイティブA/Bテスト。\n\n## マルチモーダルAI\n\n複数入力形式を同時処理。代表: GPT-4o、Claude、Gemini。\n\n**マーケ活用**:\n- 競合サイトスクリーンショットのUI分析\n- 商品画像+説明文から広告コピー自動生成\n- 会議録音+ホワイトボード写真から議事録作成\n\n## 使い分けポイント\n\n| 入力データ | 技術 | マーケ活用 |\n|-----------|------|----------|\n| テキストのみ | NLP | 感情分析、SEO |\n| 画像のみ | 画像認識 | 広告審査、商品検索 |\n| テキスト+画像 | マルチモーダル | クリエイティブ分析 |", True),
        interactive("# 演習: マーケティング課題に最適なAI技術を選ぼう",
            select_quiz_html("マーケティング課題 × AI技術マッチング",
                '[{q:"SNS上のブランド言及を肯定/否定/中立に分類",opts:["NLP","画像認識","マルチモーダルAI"],ans:0,exp:"テキスト感情分析はNLPの代表タスク"},{q:"ECで商品写真から類似商品をレコメンド",opts:["NLP","画像認識","マルチモーダルAI"],ans:1,exp:"画像類似度計算は画像認識の得意分野"},{q:"競合サイトのスクショ+URLでUI分析",opts:["NLP","画像認識","マルチモーダルAI"],ans:2,exp:"画像とテキスト同時分析にはマルチモーダルが必要"},{q:"カスタマーレビューから頻出キーワード抽出",opts:["NLP","画像認識","マルチモーダルAI"],ans:0,exp:"テキストからのキーワード抽出はNLPの基本"},{q:"Instagram投稿の画像+キャプションでトレンド発見",opts:["NLP","画像認識","マルチモーダルAI"],ans:2,exp:"画像+テキスト両方の分析にマルチモーダルが最適"}]'),
            ["NLP・画像認識・マルチモーダルの適用場面を区別できた","課題に対して最適なAI技術を選択できた","マルチモーダルが必要なケースを判断できる"]),
        quiz([
            Q("SNS感情分析に最適な技術は？",["画像認識","NLP","音声合成","マルチモーダルAI"],1,"テキスト感情分析はNLPの代表的タスク。"),
            Q("マルチモーダルAIの特徴は？",["テキストのみを超高速処理","複数入力形式を同時に理解・処理できる","画像のみを3D変換","音声のみを多言語翻訳"],1,"複数モダリティを同時に入力・理解できることが特徴。"),
            Q("ECの画像ベースレコメンドに使う技術は？",["NLPテキスト類似度","CNN画像特徴量の類似度計算","RNN時系列予測","強化学習"],1,"CNNで画像特徴量ベクトルを抽出し、コサイン類似度で比較。")
        ]),
        summary("# モジュール7-4 完了！\n\n## 習得したポイント\n\n✅ NLPの主要タスクをマーケ実務に結びつけられる\n✅ 画像認識のEC・広告審査での活用を把握した\n✅ マルチモーダルAIの「複数入力同時処理」を理解した\n✅ 課題に応じた技術選択ができる\n\n## 次のステップ\n\n次のモジュール **「7-5: 生成AI（Generative AI）の登場と衝撃」** で生成AI技術のインパクトを学びます。\n\n> 実務チャレンジ: GPT-4oに競合サイトのスクリーンショットをアップロードしてUI分析させてみましょう。")
    ]))

    # ============= 7-5 =============
    w(5, L(5, "生成AI（Generative AI）の登場と衝撃", [
        intro("# テキスト・画像・動画を「作る」AIの登場\n\n2022年は「生成AI元年」です。ChatGPTが5日で100万ユーザーを突破し、Midjourneyが絵を描き、AIが動画を生成する時代が始まりました。\n\n## マーケターへの直接的なインパクト\n\n- **コンテンツ制作コストが1/10に**: ブログ記事、広告コピー、SNS投稿\n- **クリエイティブの民主化**: デザイナーでなくても高品質な画像生成が可能\n- **パーソナライゼーション加速**: 個別最適化メッセージの大量生成\n\n生成AIはマーケティングの仕事の仕方そのものを変える技術です。\n\n**あなたへの問い**: 生成AIにコンテンツを作らせるとき、最も気をつけるべきリスクは何ですか？"),
        concept("# 生成AIの全体像\n\n```\n生成AIの分類\n├── テキスト生成: ChatGPT, Claude, Gemini\n├── 画像生成: DALL-E 3, Midjourney, Stable Diffusion\n├── 動画生成: Sora, Runway\n├── 音声生成: ElevenLabs, VALL-E\n└── コード生成: GitHub Copilot, Claude Code\n```\n\n## マーケティングへの衝撃\n\n### コンテンツ制作の変革\n従来: 企画→取材→執筆→校正 = 2週間\n生成AI: 企画→AI下書き→人間が編集 = 2日\n\n### 広告クリエイティブ革命\n- 1コンセプトから数十パターンのコピーを瞬時生成\n- ターゲット別にトーン・表現を自動最適化\n- A/Bテストバリエーションを大量作成\n\n### パーソナライゼーション\n- セグメント別カスタマイズメール文面\n- 閲覧履歴に基づくレコメンド文言生成\n\n## 生成AIの限界とリスク\n\n| リスク | 内容 | 対策 |\n|-------|------|------|\n| ハルシネーション | 事実と異なる情報を生成 | ファクトチェック必須 |\n| 著作権問題 | 学習データの権利関係 | 商用利用確認 |\n| ブランドリスク | トーンの不一致 | ガイドライン指定 |\n| 均質化 | 似たコンテンツの氾濫 | 人間の視点を付加 |", True),
        interactive("# 演習: 生成AI活用シーンとリスクをマッチング",
            category_dnd_html("生成AI活用シーン × リスク分類",
                '[{id:"s1",text:"AIでSEO記事を大量生成",cat:"quality"},{id:"s2",text:"AIで医療・金融の専門記事を生成",cat:"hallucination"},{id:"s3",text:"AI生成画像を商用広告に使用",cat:"copyright"},{id:"s4",text:"AIでブランドSNS投稿を自動生成",cat:"brand"}]',
                [{"id":"hallucination","name":"ハルシネーション","desc":"事実誤認リスク","color":"#ef4444"},
                 {"id":"copyright","name":"著作権リスク","desc":"権利関係の問題","color":"#f59e0b"},
                 {"id":"brand","name":"ブランドリスク","desc":"トーン不一致","color":"#8b5cf6"},
                 {"id":"quality","name":"均質化リスク","desc":"差別化の欠如","color":"#3b82f6"}]),
            ["4つの主要リスクを特定できた","活用シーンごとの注意点を理解した","リスク軽減策を説明できる"]),
        quiz([
            Q("ハルシネーションとは？",["画像がぼやけること","事実と異なる情報をもっともらしく生成すること","処理速度低下","著作権画像の生成"],1,"AIが実在しない事実を「もっともらしく」生成する現象。"),
            Q("生成AIがコンテンツ制作を変えた最大のポイントは？",["質が人間を完全に超えた","制作スピードとコストが劇的に改善","人間ライターが不要に","SEOランキングが自動上昇"],1,"最大の価値はスピードとコスト改善。人間の編集・校正は引き続き必要。"),
            Q("均質化リスクが指摘される理由は？",["AI計算速度が遅い","多くの企業が同じAIで同様のコンテンツを生成","古い情報のみ","モデルが1つしかない"],1,"同じLLMで似た指示→似たコンテンツが大量発生。差別化に人間の視点が必要。")
        ]),
        summary("# モジュール7-5 完了！\n\n## 習得したポイント\n\n✅ テキスト・画像・動画・音声の生成AI技術と代表モデルを把握した\n✅ コンテンツ制作がどう変わったかを具体的に説明できる\n✅ 4大リスク（ハルシネーション・著作権・ブランド・均質化）を理解した\n✅ リスクを軽減しながら活用する方針を立てられる\n\n## 次のステップ\n\n次のモジュール **「7-6: LLM（大規模言語モデル）の仕組み」** でTransformerアーキテクチャを学びます。\n\n> 実務チャレンジ: ブログ記事1本をAIで下書き生成し、かかった時間を通常の制作時間と比較してみましょう。")
    ]))

    # ============= 7-6 =============
    w(6, L(6, "LLM（大規模言語モデル）の仕組み", [
        intro("# マーケターが知るべきLLMの「中身」\n\nLLM（Large Language Model）は、ChatGPTやClaudeの基盤技術です。数千億のパラメータで「次に来る単語を予測する」ことで人間のような文章を生成します。\n\n## なぜ仕組みを知る必要があるか\n\n- **プロンプトの書き方が変わる**: 仕組みを知ると効果的な書き方がわかる\n- **コスト最適化**: トークンの仕組みでAPI費用を削減\n- **限界の理解**: 「嘘をつく」理由がわかればリスク管理が可能\n\n**あなたへの問い**: ChatGPTが正しく答えるのは「知識を持っている」からですか？それとも別の仕組みですか？"),
        concept("# LLMの仕組み: Transformerアーキテクチャ\n\n## 基本原理: 「次の単語予測」\n\n```\n入力: 「東京の人口は約」\n予測: 「1400」→「万」→「人」→「です」→「。」\n\nLLMは膨大なテキストから\n「この文脈の次に来る確率が最も高い単語」\nを繰り返し予測しているだけ\n```\n\n## Transformer（2017年）\n\nGoogleの論文「Attention is All You Need」で提案。\n\n### Self-Attention（自己注意機構）\n文中の各単語が他の全単語との関連性を計算。\n\n例: 「銀行の**口座**を開設した」\n→ 「口座」は「銀行」と強い関連\n→ 文脈で「bank（銀行）」と「bank（土手）」を区別\n\n### 革命的な理由\n- **並列処理**: RNNの逐次処理→全単語同時処理\n- **長い文脈記憶**: 遠くの単語との関係も把握\n- **スケーラビリティ**: パラメータ増→性能向上\n\n## LLMの学習プロセス\n\n| フェーズ | 内容 | コスト |\n|---------|------|--------|\n| 事前学習 | 大量テキストで次の単語予測 | 数億〜数十億円 |\n| 微調整 | 特定タスク向け追加学習 | 数万〜数百万円 |\n| RLHF | 人間フィードバックで品質向上 | 数千万円 |\n\n## マーケターへの示唆\n\n- LLMは「知識を持つ」のではなく「統計的に最もあり得る続きを生成」\n- だからハルシネーションが発生する\n- プロンプトに文脈を与えるほど予測精度が向上", True),
        interactive("# 演習: LLMの仕組みを穴埋めで確認\n\nLLMの動作原理に関する空欄を埋めてください。",
            fill_blank_html("LLMの仕組み穴埋め",
                '[{"before":"LLMの基本原理は、文脈から","after":"ことです。","options":[{"v":"next","l":"次に来る単語を予測する"},{"v":"all","l":"全ての単語を暗記する"},{"v":"search","l":"データベースを検索する"}],"answer":"next"},{"before":"2017年にGoogleが発表した","after":"アーキテクチャが現在のLLMの基盤です。","options":[{"v":"transformer","l":"Transformer"},{"v":"cnn","l":"CNN"},{"v":"rnn","l":"RNN"}],"answer":"transformer"},{"before":"その中核技術","after":"は各単語が他の全単語との関連性を計算します。","options":[{"v":"attention","l":"Self-Attention"},{"v":"backprop","l":"バックプロパゲーション"},{"v":"pooling","l":"プーリング"}],"answer":"attention"},{"before":"事実と異なる情報を生成する現象を","after":"と呼びます。","options":[{"v":"hallucination","l":"ハルシネーション"},{"v":"overfitting","l":"過学習"},{"v":"underfitting","l":"未学習"}],"answer":"hallucination"},{"before":"人間のフィードバックで品質向上するプロセスを","after":"と呼びます。","options":[{"v":"rlhf","l":"RLHF"},{"v":"etl","l":"ETL"},{"v":"cicd","l":"CI/CD"}],"answer":"rlhf"}]'),
            ["LLMの基本原理（次の単語予測）を理解した","TransformerとSelf-Attentionの役割を把握した","ハルシネーションの発生メカニズムを説明できる"]),
        quiz([
            Q("LLMの基本的な動作原理は？",["リアルタイム検索","文脈から次の確率最高の単語を予測","プログラムルールに従う","DB検索"],1,"「次の単語予測」が本質。統計的パターンに基づく。"),
            Q("Self-Attentionの役割は？",["画像ピクセル分析","各単語が他の全単語との関連性を計算","音声→テキスト変換","データ圧縮"],1,"文中の各単語間の関連度を計算し、文脈に応じた意味を理解する仕組み。"),
            Q("LLMで最もコストがかかるフェーズは？",["プロンプト設計","事前学習","ユーザーへの回答","APIキー発行"],1,"事前学習は数千台GPU×数ヶ月で数億〜数十億円。")
        ]),
        summary("# モジュール7-6 完了！\n\n## 習得したポイント\n\n✅ LLMが「次の単語予測」で文章を生成していることを理解した\n✅ TransformerのSelf-Attentionが文脈理解の鍵であることを把握した\n✅ ハルシネーションの仕組みを説明できる\n✅ 事前学習→微調整→RLHFの学習プロセスを理解した\n\n## 次のステップ\n\n次のモジュール **「7-7: トークンとコンテキストウィンドウ」** でLLMのコスト計算の基礎を学びます。\n\n> 実務チャレンジ: 長い文脈を与えた場合と短い場合で回答の質がどう変わるか実験してみましょう。")
    ]))

    # ============= 7-7 〜 7-50: パターンベースで効率的に生成 =============
    # 以下、各モジュールのコンテンツを定義

    modules_data = {
        7: ("トークンとコンテキストウィンドウ",
            "# コスト計算とプロンプト設計の基礎\n\nLLMを使う上で「トークン」と「コンテキストウィンドウ」は避けて通れない概念です。API利用料はトークン数で決まり、1回の会話で処理できる情報量もトークンで制限されます。\n\n## なぜマーケターに必要か\n\n- API費用の見積もり・最適化に直結\n- プロンプトの長さ制限を理解して設計\n- 「AIが途中で忘れる」問題の原因がわかる\n\n**あなたへの問い**: ChatGPTに長い文書を貼り付けたら途中で「話の流れがおかしくなった」経験はありませんか？",
            "# トークンとコンテキストウィンドウ\n\n## トークンとは\n\n```\nトークン化の例（日本語）\n「マーケティング戦略」→ [マーケ][ティング][戦略] = 3トークン\n「AI」→ [AI] = 1トークン\n\nトークン化の例（英語）\n\"marketing\" → [market][ing] = 2トークン\n\"AI\" → [AI] = 1トークン\n\n目安: 日本語1文字 ≒ 1〜2トークン\n      英語1単語 ≒ 1〜1.5トークン\n```\n\n## コンテキストウィンドウ\n\n| モデル | コンテキスト | 目安 |\n|-------|-------------|------|\n| GPT-4o | 128K tokens | 日本語約6万字 |\n| Claude 3.5 | 200K tokens | 日本語約10万字 |\n| Gemini 1.5 Pro | 1M tokens | 日本語約50万字 |\n\n## API料金の計算\n\n```\n料金 = (入力トークン数 × 入力単価) + (出力トークン数 × 出力単価)\n\n例: GPT-4o\n  入力: $2.50/1Mトークン\n  出力: $10.00/1Mトークン\n  \n  1000字の入力 + 500字の出力 ≒\n  2000トークン × $2.50/1M + 1000トークン × $10/1M\n  = $0.005 + $0.01 = $0.015（約2.3円）\n```\n\n## マーケ実務でのコスト最適化\n\n- **入力を簡潔に**: 不要な情報を削ってトークン節約\n- **出力長を制限**: max_tokensパラメータで制御\n- **軽量モデル活用**: 単純タスクはGPT-4o miniやHaikuで十分",
            "interactive",
            "# 演習: トークン数とAPI料金を計算しよう",
            '[{q:"日本語「マーケティングオートメーション」は約何トークン？",opts:["3トークン","8トークン","15トークン","20トークン"],ans:1,exp:"日本語は1文字1〜2トークン。12文字で約8トークン"},{q:"GPT-4oのコンテキストウィンドウ128Kトークンは日本語約何万字？",opts:["約2万字","約6万字","約20万字","約50万字"],ans:1,exp:"日本語1文字≒2トークンなので128K÷2≒6万字"},{q:"API料金を最も効果的に削減する方法は？",opts:["高性能PCを使う","入力テキストを簡潔にしトークン数を減らす","夜間に実行する","複数APIキーを使う"],ans:1,exp:"料金はトークン数に比例。不要情報を削りトークンを節約するのが最も効果的"},{q:"Claudeの200Kコンテキストの利点は？",opts:["料金が安い","長い文書全体を1回で読み込み分析できる","画像処理が速い","音声認識精度が高い"],ans:1,exp:"200Kトークンで日本語約10万字。長い報告書や複数文書を一括分析可能"}]',
            ["トークンの概念とカウント方法を理解した","API料金の計算方法を把握した","コスト最適化の方法を実務に適用できる"],
            [Q("トークンの説明として正しいのは？",["1文字=1トークン固定","LLMがテキストを処理する最小単位","APIキーの別名","1単語=1トークン固定"],1,"トークンはLLMのテキスト処理単位。言語やモデルにより分割方法が異なる。"),
             Q("コンテキストウィンドウを超えるとどうなる？",["自動要約される","古い情報が切り捨てられエラーや精度低下が起きる","料金が2倍になる","別モデルに自動切替"],1,"ウィンドウ超過で古い情報が失われ、会話の一貫性や精度が低下する。"),
             Q("1000字の入力+500字出力のGPT-4o API料金は約いくら？",["約0.1円","約2.3円","約50円","約500円"],1,"入力2000トークン×$2.50/1M+出力1000トークン×$10/1M≒$0.015≒約2.3円")],
            "# モジュール7-7 完了！\n\n## 習得したポイント\n\n✅ トークンの概念と日本語/英語でのカウント目安を把握した\n✅ 主要モデルのコンテキストウィンドウサイズを比較できる\n✅ API料金の計算方法を理解した\n✅ コスト最適化の実践的な方法を知った\n\n## 次のステップ\n\n次のモジュール **「7-8: 主要LLMモデル比較」** で各モデルの特徴を用途別に比較します。\n\n> 実務チャレンジ: OpenAIのTokenizerツール（platform.openai.com/tokenizer）で、自社のプロンプトが何トークンか確認してみましょう。"
        ),
        8: ("主要LLMモデル比較（GPT/Claude/Gemini/Llama）",
            "# どのLLMを選ぶべきか\n\n2024年現在、主要なLLMは4つのファミリーに分かれています。マーケターとして重要なのは、**用途に応じて最適なモデルを選ぶ**こと。\n\n一つのモデルに固執する必要はありません。タスクの性質・コスト・品質のバランスで選びましょう。\n\n**あなたへの問い**: 今使っているAIツールのモデルを知っていますか？それは最適な選択ですか？",
            "# 主要LLMモデルの比較\n\n## 4大LLMファミリー\n\n```\nLLMファミリー\n├── OpenAI（GPT）\n│   ├── GPT-4o: バランス型主力モデル\n│   ├── GPT-4o mini: 高速・低コスト\n│   └── o1: 推論特化（数学・コード）\n├── Anthropic（Claude）\n│   ├── Claude 3.5 Sonnet: 長文・コード\n│   └── Claude 3.5 Haiku: 高速・低コスト\n├── Google（Gemini）\n│   ├── Gemini 1.5 Pro: 超長文（1Mトークン）\n│   └── Gemini 1.5 Flash: 高速・低コスト\n└── Meta（Llama）\n    └── Llama 3.1 405B: オープンソース最大\n```\n\n## 用途別の推奨モデル\n\n| タスク | 推奨 | 理由 |\n|--------|------|------|\n| 短いコピー大量生成 | GPT-4o mini | コスト効率最高 |\n| 長文レポート生成 | Claude 3.5 Sonnet | 200K文脈・高品質 |\n| 超長文書分析 | Gemini 1.5 Pro | 1Mトークン |\n| コード生成 | Claude / GPT-4o | 両者拮抗 |\n| 社内専用AI構築 | Llama 3.1 | OSS・データ外部流出なし |\n| 画像分析+テキスト | GPT-4o | マルチモーダル実績 |\n\n## コスト比較（API入力単価/1Mトークン）\n\n| モデル | 入力 | 出力 |\n|--------|------|------|\n| GPT-4o | $2.50 | $10.00 |\n| GPT-4o mini | $0.15 | $0.60 |\n| Claude 3.5 Sonnet | $3.00 | $15.00 |\n| Gemini 1.5 Pro | $1.25 | $5.00 |\n| Llama 3.1 | 無料（自前GPUコスト） | - |",
            "interactive",
            "# 演習: マーケティングタスクに最適なモデルを選ぼう",
            '[{q:"月次レポート（1万字）をAIで自動生成したい",opts:["GPT-4o mini","Claude 3.5 Sonnet","Llama 3.1"],ans:1,exp:"長文レポート生成はClaudeの200Kコンテキストと高品質な文章力が最適"},{q:"広告コピーを100パターン生成してA/Bテストしたい",opts:["GPT-4o mini","Claude 3.5 Sonnet","Gemini 1.5 Pro"],ans:0,exp:"大量の短文生成はGPT-4o miniのコスト効率が最適"},{q:"500ページのPDFマニュアルを一括分析したい",opts:["GPT-4o","Claude 3.5 Sonnet","Gemini 1.5 Pro"],ans:2,exp:"超長文書にはGemini 1.5 Proの1Mトークンが最適"},{q:"機密データを外部に出さずに社内AIを構築したい",opts:["GPT-4o","Claude 3.5 Sonnet","Llama 3.1（自社サーバー）"],ans:2,exp:"データ外部流出なしのオープンソースLlama 3.1が最適"}]',
            ["タスクに応じたモデル選択ができるようになった","各モデルのコスト構造を比較できる","オープンソースLLMの活用場面を理解した"],
            [Q("短い広告コピーを大量生成する場合の最適モデルは？",["GPT-4o","GPT-4o mini","Claude 3.5 Sonnet","Gemini 1.5 Pro"],1,"大量の短文タスクにはGPT-4o miniのコスト効率が圧倒的。"),
             Q("Llama 3.1を選ぶ最大のメリットは？",["最も高精度","無料・OSS・データを外部に出さない","UIが使いやすい","日本語が最も得意"],1,"Llamaはオープンソースで自社サーバーに展開でき、データ流出リスクがない。"),
             Q("1Mトークンのコンテキストウィンドウを持つモデルは？",["GPT-4o","Claude 3.5 Sonnet","Gemini 1.5 Pro","Llama 3.1"],2,"Gemini 1.5 Proは1Mトークン（日本語約50万字）の超長文対応。")],
            "# モジュール7-8 完了！\n\n## 習得したポイント\n\n✅ GPT/Claude/Gemini/Llamaの特徴と得意領域を比較できる\n✅ マーケティングタスクに応じた最適モデルを選択できる\n✅ APIコスト構造を理解し、予算計画に活かせる\n✅ オープンソースLLMの活用場面を理解した\n\n## 次のステップ\n\n次のモジュール **「7-9: LLM APIコスト比較と最適化」** でROI最大化の実践方法を学びます。\n\n> 実務チャレンジ: 現在のAI利用タスクを3つ挙げ、それぞれに最適なモデルを選び直してみましょう。"
        ),
    }

    # 7-7, 7-8 を生成
    for num in [7, 8]:
        title, intro_c, concept_c, ex_type, ex_content, ex_data, ex_cp, quizzes, summary_c = modules_data[num]
        sections = [
            intro(intro_c),
            concept(concept_c, True),
        ]
        if ex_type == "interactive":
            sections.append(interactive(ex_content,
                select_quiz_html(ex_content.split("\n")[0].replace("# ", ""), ex_data),
                ex_cp))
        sections.extend([quiz(quizzes), summary(summary_c)])
        w(num, L(num, title, sections))

    # ============= 7-9 〜 7-50: 大量生成 =============
    # 残りのモジュールを定義して一括生成

    remaining = [
        (9, "LLM APIコスト比較と最適化",
         "# API費用を最適化してROIを最大化する\n\nLLM APIは使えば使うほど費用がかかります。マーケティング施策の費用対効果を高めるには、**トークン単価を意識したコスト管理**が不可欠です。\n\n月間100万トークンの利用でも、モデル選択次第で月額$150から$2.5まで100倍以上の差が出ます。\n\n**あなたへの問い**: 自社のAI利用にかかっている月額費用を把握していますか？",
         "# LLM APIコスト最適化戦略\n\n## モデル別コスト比較表\n\n| モデル | 入力/1M | 出力/1M | 月100万トークン |\n|--------|---------|---------|----------------|\n| GPT-4o | $2.50 | $10.00 | 約$12.50 |\n| GPT-4o mini | $0.15 | $0.60 | 約$0.75 |\n| Claude Sonnet | $3.00 | $15.00 | 約$18.00 |\n| Claude Haiku | $0.25 | $1.25 | 約$1.50 |\n| Gemini Flash | $0.075 | $0.30 | 約$0.38 |\n\n## 5つの最適化戦略\n\n```\nコスト最適化の5原則\n├── 1. モデルの使い分け: 単純タスク→mini/Haiku\n├── 2. プロンプト最適化: 不要な文脈を削減\n├── 3. キャッシュ活用: 同じ質問は結果を再利用\n├── 4. バッチ処理: Batch APIで50%割引\n└── 5. 出力長制限: max_tokensで無駄を排除\n```\n\n## ROI計算の実例\n\n**ケース: SEO記事の自動生成**\n- 人間ライター: 1記事3万円 × 20本 = 60万円/月\n- AI生成+人間編集: API費 $50 + 編集10万円 = 約11万円/月\n- **コスト削減率: 82%**"),
        (10, "マルチモーダルLLMの活用",
         "# 画像・音声を入力できるAIで業務を自動化\n\nマルチモーダルLLMは「テキストだけでなく画像や音声も入力として受け取れる」モデルです。GPT-4o、Claude、Geminiが対応しています。\n\nマーケターにとって、これは**スクリーンショットを見せるだけでUI分析**ができたり、**商品写真から広告コピーを自動生成**できることを意味します。\n\n**あなたへの問い**: 競合サイトの分析に、AIに画像を見せるアプローチを試したことはありますか？",
         "# マルチモーダルLLMの実務活用\n\n## 対応モデル一覧\n\n```\nマルチモーダル対応状況\n├── GPT-4o: テキスト+画像+音声（入出力）\n├── Claude 3.5: テキスト+画像（入力）\n├── Gemini 1.5: テキスト+画像+音声+動画（入力）\n└── GPT-4o mini: テキスト+画像（低コスト）\n```\n\n## マーケティングでの5大活用\n\n### 1. 競合サイト分析\nスクリーンショットを入力→UI/UX改善点を自動指摘\n\n### 2. 広告クリエイティブ分析\n広告バナー画像→訴求ポイント・ターゲット層を推定\n\n### 3. 商品画像→広告コピー生成\n商品写真→特徴を読み取りコピーを自動生成\n\n### 4. 会議ホワイトボード→議事録\n撮影画像→構造化された議事録に変換\n\n### 5. グラフ・チャート→インサイト抽出\nGA4レポートのスクリーンショット→要点を自動抽出"),
        (11, "ファインチューニングとRAGの概念",
         "# 自社データをAIに活かす2つのアプローチ\n\nLLMは汎用的ですが、自社固有の情報（商品知識、社内ルール等）は知りません。この課題に対する2つの解決策が**ファインチューニング**と**RAG**です。\n\nどちらを選ぶかで、コスト・精度・運用負荷が大きく変わります。\n\n**あなたへの問い**: 社内のFAQやマニュアルをAIに回答させたい場合、どんなアプローチを取りますか？",
         "# ファインチューニング vs RAG\n\n## 2つのアプローチの違い\n\n```\n自社データ活用の2手法\n├── ファインチューニング（FT）\n│   └── モデル自体を追加データで再学習\n│       長所: 応答速度が速い、特定タスクに特化\n│       短所: コスト高、データ更新に再学習が必要\n└── RAG（Retrieval Augmented Generation）\n    └── 質問時に関連文書を検索してプロンプトに注入\n        長所: データ更新が即座に反映、コスト低\n        短所: 検索精度に依存、コンテキスト消費\n```\n\n## 使い分けガイド\n\n| 条件 | 推奨 |\n|------|------|\n| 自社データが頻繁に更新 | RAG |\n| 特定の文体・トーンを学習 | FT |\n| 初期コストを抑えたい | RAG |\n| 応答速度を最優先 | FT |\n| FAQ・マニュアル回答 | RAG |\n| ブランドボイスの完全再現 | FT |\n\n## マーケでの活用例\n\n- **RAG**: 自社商品カタログ検索→チャットボットが回答\n- **FT**: 自社ブランドのトーンで記事を自動生成"),
        (12, "プロンプトの構造と設計原則",
         "# 「AIへの指示」がすべてを決める\n\nプロンプト（AIへの指示文）の質が、AIの出力品質を決定します。同じモデルでも、プロンプトの書き方次第で出力の質は天と地ほど変わります。\n\n## プロンプトエンジニアリング = マーケターの新スキル\n\nプロンプト設計は「AIに正確なブリーフを渡すディレクション能力」です。広告代理店への発注書と同じで、曖昧な指示からは曖昧な成果物しか出てきません。\n\n**あなたへの問い**: ChatGPTに「いい感じのブログ記事を書いて」と指示した結果に満足したことはありますか？",
         "# プロンプト設計の5原則\n\n```\n効果的なプロンプトの5要素\n├── 1. 役割（Role）: AIにペルソナを与える\n├── 2. 文脈（Context）: 背景情報を提供\n├── 3. 指示（Instruction）: 具体的なタスクを明示\n├── 4. 制約（Constraints）: 形式・文字数・トーン\n└── 5. 出力形式（Format）: 表・箇条書き等を指定\n```\n\n## 悪い例 vs 良い例\n\n### 悪い例\n「いい感じのブログ記事を書いて」\n\n### 良い例\n「あなたはWebマーケティングの専門家です。\nGA4の初期設定について、マーケター初心者向けのブログ記事を書いてください。\n- 文字数: 2000字程度\n- トーン: 専門用語は使うが必ず補足説明をつける\n- 構成: 導入→手順（ステップ形式）→まとめ\n- 各手順にスクリーンショットの説明を含める」\n\n## プロンプトの構造テンプレート\n\n```\n[役割] あなたは{専門分野}の{役職}です。\n[文脈] {背景情報・前提条件}\n[指示] {具体的なタスク}\n[制約] {文字数・トーン・禁止事項}\n[出力形式] {Markdown / JSON / 表形式}\n```"),
        (13, "System / User / Assistantロールの使い方",
         "# チャット形式APIの3つのロール\n\nLLM APIを使う際、メッセージには3つのロール（役割）があります。これを正しく使い分けることで、AIの振る舞いを精密にコントロールできます。\n\n**あなたへの問い**: ChatGPTの「カスタム指示」機能を使っていますか？あれはSystemロールの設定です。",
         "# 3つのロールの使い方\n\n```\nChat API メッセージ構造\n├── System: AIの振る舞い・ペルソナを設定\n│   └── 「あなたはマーケティングの専門家です」\n├── User: ユーザーの質問・指示\n│   └── 「GA4のCV設定方法を教えて」\n└── Assistant: AIの過去の応答（会話履歴）\n    └── 「CV設定の手順は以下の通りです...」\n```\n\n## Systemロールの活用テクニック\n\n### 基本: ペルソナ設定\n「あなたはGA4の専門コンサルタントです。」\n\n### 応用: 行動制約\n「回答は300字以内。箇条書きで。推測は避け、確実な情報のみ回答。」\n\n### 上級: ブランドガイドライン\n「トーンは丁寧語。自社名は『MarkeBase』と表記。」\n\n## Claude vs GPTのSystemロール対応\n\n| 特徴 | GPT | Claude |\n|------|-----|--------|\n| Systemロール | messages配列に含める | 専用systemパラメータ |\n| XML構造 | 非推奨 | 推奨（高精度） |\n| 長文指示 | やや低下 | 高精度で遵守 |"),
        (14, "Zero-shot / Few-shotプロンプティング",
         "# 例を見せるか見せないかで精度が変わる\n\nプロンプティングの基本テクニックとして「例を与えるかどうか」があります。例なしがZero-shot、例ありがFew-shotです。\n\nマーケターが日常的に使うAIツールの裏側で、この技術が品質を左右しています。\n\n**あなたへの問い**: AIに「○○の例を2つ見せてから本題を依頼する」というテクニックを使ったことはありますか？",
         "# Zero-shot vs Few-shot\n\n## Zero-shot（例示なし）\n\n指示だけを与え、例を見せない方法。\n\n```\n「以下の文章の感情を判定してください: ポジティブ/ネガティブ/ニュートラル\n文章: この商品は期待以上でした！」\n```\n\n## Few-shot（例示あり）\n\n2〜5個の例を見せてからタスクを実行。\n\n```\n「以下の例に従い感情を判定してください。\n\n例1: 「素晴らしい」→ ポジティブ\n例2: 「最悪だった」→ ネガティブ\n例3: 「普通です」→ ニュートラル\n\n判定: 「この商品は期待以上でした！」→ 」\n```\n\n## 使い分けガイド\n\n| 条件 | 推奨 | 理由 |\n|------|------|------|\n| 一般的なタスク | Zero-shot | LLMが十分理解可能 |\n| 特殊なフォーマット | Few-shot | 出力形式を例で教える |\n| 自社独自の分類基準 | Few-shot | 基準を例で伝える |\n| コスト最優先 | Zero-shot | トークン節約 |"),
        (15, "Chain of Thoughtプロンプティング",
         "# AIに「考えるプロセス」を踏ませる\n\nChain of Thought（CoT）は、AIに段階的な推論ステップを踏ませることで、複雑な問題の正答率を大幅に向上させる技術です。\n\n## なぜ効果的か\n\nLLMは「次の単語予測」で動くため、いきなり結論を出させると間違えやすい。途中の推論ステップを明示させることで、より正確な結論にたどり着きます。\n\n**あなたへの問い**: 広告のROI計算をAIに依頼するとき、「計算過程も見せて」と指示したことはありますか？",
         "# Chain of Thought（CoT）プロンプティング\n\n## 基本的な使い方\n\n### CoTなし\n「月間広告費50万円、CV数25件、平均購入単価2万円のROASは？」\n→ AIが誤答する確率が高い\n\n### CoTあり\n「以下のステップで計算してください。\n1. まず売上を計算: CV数 × 平均購入単価\n2. 次にROASを計算: 売上 ÷ 広告費 × 100\n3. 最後に結果を判定」\n→ 段階的に計算するため正答率が大幅向上\n\n## CoTのパターン\n\n```\nCoTの3パターン\n├── 明示的CoT: 「ステップバイステップで考えてください」\n├── 構造化CoT: 「1.○○ 2.○○ 3.○○ の順で」\n└── 自動CoT: 「Let's think step by step」（英語が効果的）\n```\n\n## マーケでの活用例\n\n- **広告分析**: 「まずCTR→CVR→CPAの順で分析してください」\n- **競合分析**: 「1.事実整理 2.比較分析 3.示唆出し」\n- **戦略立案**: 「現状分析→課題特定→施策提案→KPI設定」"),
        (16, "ロールプレイング・ペルソナプロンプト設計",
         "# 専門家ペルソナで出力品質を向上させる\n\nAIに「あなたは○○の専門家です」と指示するだけで、出力の質が劇的に向上します。\n\nこれはロールプレイング（役割演技）プロンプティングと呼ばれ、AIの中で関連する知識パターンが活性化されるためと考えられています。\n\n**あなたへの問い**: AIに指示するとき、「あなたは○○です」という前置きを使っていますか？",
         "# ロールプレイング・ペルソナ設計\n\n## なぜペルソナ設定が効果的か\n\n```\nペルソナなし:\n「SEO記事を書いて」→ 一般的で浅い内容\n\nペルソナあり:\n「あなたは10年の経験を持つSEOコンサルタントです。\n E-E-A-Tを重視し、Googleの最新ガイドラインに基づいて\n SEO記事を書いてください」→ 専門的で深い内容\n```\n\n## 効果的なペルソナ設計テンプレート\n\n### 基本情報\n- 専門分野: デジタルマーケティング\n- 経験年数: 10年\n- 得意領域: GA4・広告運用・SEO\n\n### 行動規範\n- データに基づいた提案を行う\n- 具体的な数値目標を含める\n- 不確かな情報には明示する\n\n### トーン\n- 専門的だが平易な表現\n- 結論ファースト\n\n## マーケでの活用パターン\n\n| ペルソナ | 活用場面 |\n|----------|----------|\n| SEOコンサルタント | 記事構成・キーワード提案 |\n| 広告運用者 | キャンペーン設計・入札戦略 |\n| データアナリスト | GA4データ分析・レポート |\n| コピーライター | 広告コピー・LP文面 |"),
        (17, "Output Format指定とJSON出力",
         "# 機械処理しやすい出力をプロンプトで制御する\n\nAIの出力をプログラムで自動処理するには、JSON等の構造化された形式で出力させる必要があります。\n\n「自由な文章で回答して」では、後続処理に使えません。出力形式を厳密に指定することで、自動化パイプラインに組み込めます。\n\n**あなたへの問い**: AIの出力をスプレッドシートやデータベースに自動投入したいと思ったことはありますか？",
         "# Output Format指定テクニック\n\n## JSON出力の指示方法\n\n```\nプロンプト例:\n「以下の形式でJSON出力してください。\n{\n  \"title\": \"記事タイトル\",\n  \"meta_description\": \"160文字以内\",\n  \"h2_headings\": [\"見出し1\", \"見出し2\"],\n  \"target_keywords\": [\"KW1\", \"KW2\"]\n}\"\n```\n\n## 主要な出力形式\n\n```\n出力形式の選択\n├── JSON: API連携・データベース投入\n├── Markdown: ドキュメント・ブログ記事\n├── CSV: スプレッドシート・Excel\n├── HTML: Webページ直接利用\n└── 表形式: レポート・比較表\n```\n\n## GPT vs Claudeの出力制御\n\n| 機能 | GPT | Claude |\n|------|-----|--------|\n| JSON Mode | response_format指定可 | XMLタグで制御 |\n| 構造化出力 | Function calling | XMLタグ推奨 |\n| 安定性 | 高い | XMLで非常に高い |"),
        (18, "Temperature・Top-P・トークン最適化",
         "# パラメータ調整で出力をコントロールする\n\nLLM APIには出力のランダム性を制御するパラメータがあります。これを理解すると、「毎回同じような回答」にも「毎回バラバラな回答」にもできます。\n\nマーケティングでは、用途に応じた調整が効果を発揮します。\n\n**あなたへの問い**: AIの回答が毎回微妙に違うことに気づいていますか？それはなぜでしょう？",
         "# LLMパラメータの理解\n\n## Temperature（温度）\n\n```\nTemperatureの効果\n├── 0.0: 最も確実な回答（決定論的）\n│   └── データ分析、事実確認向き\n├── 0.3〜0.5: やや創造的\n│   └── ビジネス文書、レポート向き\n├── 0.7: バランス（デフォルト）\n│   └── 一般的な文章生成\n└── 1.0〜1.5: 高い創造性\n    └── ブレスト、コピー案出し向き\n```\n\n## 用途別パラメータ推奨値\n\n| タスク | Temperature | max_tokens |\n|--------|-------------|------------|\n| データ分析 | 0.0〜0.2 | 必要最小限 |\n| レポート生成 | 0.3〜0.5 | 2000〜4000 |\n| 広告コピー案 | 0.8〜1.0 | 200〜500 |\n| ブレインストーミング | 1.0〜1.5 | 1000〜2000 |\n\n## コスト最適化のコツ\n\n- max_tokensで出力長を制限→無駄なトークン削減\n- Temperature=0でキャッシュ効率UP（同じ入力→同じ出力）\n- stop sequencesで不要な続きを生成させない"),
        (19, "プロンプトチェーンとパイプライン設計",
         "# 複数プロンプトを連鎖させて複雑なタスクを実行\n\n1回のプロンプトでは対応できない複雑なタスクも、複数のプロンプトを「チェーン（連鎖）」させることで実現できます。\n\n## なぜチェーンが必要か\n\n- 1プロンプトの出力が次のプロンプトの入力になる\n- 各ステップで品質チェックを挟める\n- 大きなタスクを小さく分解できる\n\n**あなたへの問い**: SEO記事を書くとき「構成→本文→校正」と段階的に依頼したことはありますか？",
         "# プロンプトチェーンの設計\n\n## 基本パターン\n\n```\nプロンプトチェーンの構造\n├── Step 1: 情報抽出・整理\n│   └── 入力: 生データ → 出力: 構造化データ\n├── Step 2: 分析・判断\n│   └── 入力: 構造化データ → 出力: インサイト\n├── Step 3: コンテンツ生成\n│   └── 入力: インサイト → 出力: ドラフト\n└── Step 4: 品質チェック\n    └── 入力: ドラフト → 出力: 修正版\n```\n\n## SEO記事生成パイプラインの例\n\n1. **キーワード分析**: 「○○」の検索意図を分析→JSON\n2. **記事構成**: 検索意図に基づくH2/H3構成→Markdown\n3. **本文生成**: 構成に従い各セクション執筆→Markdown\n4. **品質チェック**: ファクトチェック・トーン確認→修正指示\n5. **最終仕上げ**: 修正反映→完成原稿\n\n## 設計のポイント\n\n| ポイント | 説明 |\n|----------|------|\n| 各ステップの出力形式を統一 | JSON等で受け渡しを明確に |\n| エラーハンドリング | 各ステップで品質チェック |\n| 並列化可能なステップを特定 | 処理速度向上 |"),
        (20, "プロンプトの評価メトリクスとイテレーション",
         "# プロンプトを「定量的に」改善する\n\nプロンプトの良し悪しを「なんとなく」で判断していませんか？複数のプロンプトを定量的に比較評価し、継続的に改善するプロセスを学びます。\n\n**あなたへの問い**: AIの出力品質を5段階で評価したことはありますか？何を基準に評価しますか？",
         "# プロンプト評価のフレームワーク\n\n## 5つの評価軸\n\n```\nプロンプト評価メトリクス\n├── 正確性: 事実の正しさ（0〜10点）\n├── 関連性: 質問への適合度（0〜10点）\n├── 完全性: 必要情報の網羅度（0〜10点）\n├── 形式遵守: 指定フォーマットへの準拠（0〜10点）\n└── トーン: ブランドボイスとの一致度（0〜10点）\n```\n\n## A/Bテストの進め方\n\n1. **テストケース作成**: 同じ入力を10パターン用意\n2. **プロンプトA/B実行**: 両方で生成\n3. **ブラインド評価**: 出力を匿名化して評価\n4. **統計比較**: 5軸の平均スコアで比較\n5. **勝者のプロンプトを採用→次の改善へ**\n\n## イテレーションのコツ\n\n- 1度に変更するのは1要素だけ（役割/文脈/制約等）\n- 最低10テストケースで評価\n- 評価結果を記録して知見を蓄積"),
        (21, "プロンプトテンプレートの管理と評価",
         "# チームで再利用できるプロンプト資産を構築する\n\n個人で試行錯誤したプロンプトを、チーム全体の資産として管理・共有する仕組みを学びます。\n\nプロンプトテンプレートを標準化することで、品質のばらつきを減らし、効率を高められます。\n\n**あなたへの問い**: 同僚と「このプロンプトが良かった」と共有したことはありますか？それを体系的に管理していますか？",
         "# プロンプトテンプレート管理\n\n## テンプレート設計\n\n```\nプロンプトテンプレートの構成要素\n├── テンプレートID: PT-001\n├── カテゴリ: SEO / 広告 / レポート\n├── 対象モデル: GPT-4o / Claude等\n├── パラメータ: Temperature等の推奨値\n├── プロンプト本文: 変数部分は{variable}で記述\n├── 入力例: サンプル入力\n├── 出力例: 期待する出力\n├── 評価スコア: 5軸の平均点\n└── バージョン: v1.0, v1.1...\n```\n\n## 管理ツールの選択\n\n| ツール | 適用場面 |\n|--------|----------|\n| Notion | チーム共有・検索・タグ管理 |\n| GitHub | バージョン管理・diff確認 |\n| スプレッドシート | 評価スコア集計・比較 |\n| 専用ツール(PromptLayer等) | 実行ログ・A/Bテスト自動化 |\n\n## A/Bテスト運用\n\n- 月1回のプロンプト評価会を実施\n- 各テンプレートの利用回数・満足度を記録\n- 低評価テンプレートは改善または廃止"),
        (22, "SEO記事のAI生成ワークフロー",
         "# キーワードから公開まで一気通貫で自動化\n\nSEO記事の制作は「キーワード選定→構成→執筆→校正→公開」と多くの工程があります。AIを活用すれば、このワークフローを大幅に効率化できます。\n\n## 従来 vs AI活用の比較\n\n- 従来: 1記事あたり8時間（企画2h+執筆4h+校正2h）\n- AI活用: 1記事あたり2時間（AI生成30min+人間編集90min）\n\n**あなたへの問い**: SEO記事をAIに書かせたことはありますか？品質に満足しましたか？",
         "# SEO記事AI生成の5ステップ\n\n```\nSEO記事生成パイプライン\n├── Step1: キーワード選定・検索意図分析\n│   └── 関連KWと検索意図をJSON出力\n├── Step2: 記事構成の自動生成\n│   └── H2/H3構成をMarkdown出力\n├── Step3: セクション別本文生成\n│   └── 各セクションを並列生成\n├── Step4: 品質チェック・ファクトチェック\n│   └── E-E-A-T評価・重複チェック\n└── Step5: メタ情報・内部リンク提案\n    └── title/description/関連記事\n```\n\n## プロンプト設計のポイント\n\n### Step1: 検索意図分析\n「{keyword}の検索意図を以下の形式で分析: 情報探索/比較検討/購入意欲/ナビゲーション」\n\n### Step3: 本文生成\n「E-E-A-Tを意識し、具体例・データ・専門家の見解を含める」\n\n## 品質管理チェックリスト\n\n- ファクトチェック（数値・固有名詞）\n- Google検索ガイドライン準拠\n- ブランドトーンの一貫性\n- オリジナリティ（AI検出ツール確認）"),
        (23, "広告コピー・LPコピーのAI大量生成",
         "# LLMで複数パターンを生成しCTR予測で絞り込む\n\nデジタル広告では「どのコピーがクリックされるか」がパフォーマンスを左右します。AIで大量のバリエーションを生成し、データドリブンに最適な表現を選ぶ手法を学びます。\n\n**あなたへの問い**: 広告コピーのA/Bテストで、バリエーションの数に困ったことはありませんか？",
         "# AI広告コピー大量生成の手法\n\n## ワークフロー\n\n```\n広告コピー生成パイプライン\n├── 1. ペルソナ×訴求軸のマトリクス作成\n│   └── 3ペルソナ × 4訴求 = 12パターン\n├── 2. 各パターンで5バリエーション生成\n│   └── 12 × 5 = 60コピー候補\n├── 3. AIでCTR予測スコアリング\n│   └── 各コピーに予測CTRを付与\n├── 4. 上位20本を人間がレビュー\n│   └── ブランド整合性・法的チェック\n└── 5. 最終10本でA/Bテスト実行\n```\n\n## 訴求軸のフレームワーク\n\n| 訴求軸 | 例 |\n|--------|----|\n| 問題提起 | 「まだ○○で悩んでいませんか？」 |\n| ベネフィット | 「○○で売上30%UP」 |\n| 社会的証明 | 「10,000社が導入」 |\n| 緊急性 | 「今だけ○○」 |\n\n## プロンプト例\n\n「以下の条件で広告見出しを5パターン生成:\n- 商品: {product}\n- ターゲット: {persona}\n- 訴求軸: {approach}\n- 文字数: 30文字以内\n- トーン: {tone}」"),
        (24, "メール・SNS投稿のAI量産テクニック",
         "# セグメント別にコンテンツを自動生成・展開する\n\nメールマーケティングやSNS運用では、ターゲットセグメントごとにメッセージを変える「パーソナライゼーション」が効果を高めます。AIで大量のバリエーションを効率生成する手法を学びます。\n\n**あなたへの問い**: メルマガの件名を何パターン作っていますか？AIなら10パターンを30秒で生成できます。",
         "# メール・SNSのAI量産\n\n## メールマーケティング\n\n```\nメール生成パイプライン\n├── 件名生成（5〜10パターン）\n│   └── 好奇心喚起 / ベネフィット / 緊急性\n├── 本文生成（セグメント別）\n│   └── 新規 / 既存 / 休眠 / VIP\n├── CTA文言生成\n│   └── ボタンテキスト3〜5パターン\n└── A/Bテスト設定\n    └── 件名×CTA の組み合わせ\n```\n\n## SNS投稿の量産\n\n### プラットフォーム別最適化\n\n| SNS | 文字数 | トーン | 特徴 |\n|-----|--------|--------|------|\n| X（Twitter） | 140字 | カジュアル | ハッシュタグ重要 |\n| Instagram | 2200字 | ビジュアル重視 | ストーリー性 |\n| LinkedIn | 3000字 | プロフェッショナル | 業界知見 |\n| Facebook | 63,206字 | コミュニティ | 長文OK |\n\n## 1つのコンテンツを多展開するプロンプト\n\n「以下のブログ記事を元に、X/Instagram/LinkedInそれぞれに最適化した投稿を生成してください。各SNSの文字数制限とトーンを遵守してください。」"),
        (25, "AIコンテンツの品質管理とファクトチェック",
         "# ハルシネーション検出とブランド整合性の自動検証\n\nAI生成コンテンツを「そのまま公開」するのは危険です。ファクトチェック、ブランド整合性確認、法的リスクチェックの仕組みを構築しましょう。\n\n**あなたへの問い**: AI生成コンテンツを公開前にどんなチェックをしていますか？",
         "# AI品質管理フレームワーク\n\n## 品質チェックの3層構造\n\n```\nAIコンテンツ品質管理\n├── Layer1: 自動チェック（AI→AI）\n│   ├── ファクトチェック: 数値・固有名詞の検証\n│   ├── 重複チェック: 他コンテンツとの類似度\n│   └── トーンチェック: ブランドガイドライン準拠\n├── Layer2: 半自動チェック（AI+人間）\n│   ├── 専門知識の正確性確認\n│   └── 法的リスク（薬機法・景表法等）\n└── Layer3: 人間レビュー\n    ├── 最終品質判定\n    └── 公開承認\n```\n\n## ファクトチェックプロンプト\n\n「以下の文章に含まれる事実主張を全て抽出し、各主張について:\n1. 確認可能な事実か推測か\n2. 確信度（高/中/低）\n3. 検証が必要な項目\nをJSON形式で出力してください。」"),
        (26, "ブランドボイス維持とSEOリスク対策",
         "# AIコンテンツでもブランドらしさを保つ\n\nAI生成コンテンツの最大の課題の一つが「どのブランドも同じような文章になる」こと。ブランドボイスを維持しながらSEOリスクを回避する方法を学びます。\n\n**あなたへの問い**: 自社のブランドボイスガイドラインをAIに伝えたことはありますか？",
         "# ブランドボイスとSEO対策\n\n## ブランドボイス設定プロンプト\n\n```\nブランドボイス定義テンプレート\n├── トーン: 親しみやすい / 専門的 / カジュアル\n├── 人称: 「私たち」/ 「弊社」/ 「MarkeBase」\n├── 禁止表現: 「絶対」「間違いなく」等の断定\n├── 推奨表現: データに基づく表現、具体例\n└── 文体: です・ます調 / だ・である調\n```\n\n## SEOリスクと対策\n\n| リスク | 内容 | 対策 |\n|--------|------|------|\n| AI検出 | GoogleがAI生成を低評価する可能性 | 人間による編集・付加価値追加 |\n| 重複コンテンツ | 他社AIコンテンツとの類似 | 独自データ・経験の追加 |\n| E-E-A-T不足 | 専門性・経験の欠如 | 専門家レビュー・実体験追加 |\n| 薄いコンテンツ | 情報の深みがない | 独自調査・一次情報追加 |"),
        (27, "コンテンツカレンダーのAI自動生成",
         "# 月次・週次の投稿計画をAIで高速ドラフト\n\nコンテンツカレンダーの作成は時間がかかる作業です。AIを活用すれば、テーマ選定から投稿スケジュールまでを大幅に効率化できます。\n\n**あなたへの問い**: 毎月のコンテンツカレンダー作成に何時間かけていますか？",
         "# AIコンテンツカレンダー生成\n\n## 生成パイプライン\n\n```\nカレンダー生成フロー\n├── 1. 年間イベント・季節性の把握\n├── 2. ターゲットKWの月別トレンド分析\n├── 3. コンテンツテーマの自動提案\n├── 4. SNS×ブログ×メールの連動計画\n└── 5. 投稿日時の最適化\n```\n\n## プロンプト例\n\n「{業界}の{month}月のコンテンツカレンダーを作成:\n- ブログ記事: 週1本（SEOテーマ）\n- SNS投稿: 週3本（X + Instagram）\n- メルマガ: 月2回\n- 季節イベント・業界トレンドを反映\n- 各コンテンツにターゲットKWを設定\n\n出力形式: 表形式（日付|チャネル|テーマ|KW|ステータス）」"),
    ]

    # 7-28〜7-50: GAS・Python・API・自動化系
    remaining2 = [
        (28, "Google Apps Script（GAS）入門",
         "# Google Workspaceを自動化する第一歩\n\nGAS（Google Apps Script）は、Googleスプレッドシート、Gmail、Googleフォーム等を自動化できるスクリプト言語です。JavaScriptベースなので、プログラミング初心者にも比較的取り組みやすいのが特徴です。\n\nマーケターがGASを覚えると、日常の定型作業を大幅に自動化できます。\n\n**あなたへの問い**: 毎週スプレッドシートにデータを手動でコピペしている作業はありませんか？",
         "# GASの基礎\n\n```\nGASでできること\n├── スプレッドシート操作\n│   ├── データの読み書き・集計\n│   └── グラフの自動更新\n├── Gmail自動化\n│   ├── テンプレートメール送信\n│   └── メール分類・ラベル付け\n├── Googleフォーム連携\n│   └── 回答→スプレッドシート→通知\n├── Googleドライブ操作\n│   └── ファイル整理・共有設定\n└── 外部API連携\n    └── Slack通知・データ取得\n```\n\n## GASの始め方\n\n1. Googleスプレッドシートを開く\n2. 拡張機能 → Apps Script\n3. エディタでコードを記述\n4. 実行ボタンで動作確認\n\n## 基本構文\n\n```javascript\nfunction myFunction() {\n  // スプレッドシートを取得\n  const ss = SpreadsheetApp.getActiveSpreadsheet();\n  const sheet = ss.getSheetByName('Sheet1');\n  \n  // データを読み取り\n  const data = sheet.getRange('A1').getValue();\n  Logger.log(data);\n}\n```"),
        (29, "GASでスプレッドシート・Gmail自動化",
         "# 定型作業をスクリプトで一括処理\n\nマーケターの日常業務には「スプレッドシートにデータをまとめる」「決まったメールを送る」等の定型作業が多くあります。GASでこれらを自動化しましょう。\n\n**あなたへの問い**: 毎月のレポート集計で、同じ操作を繰り返していませんか？",
         "# スプレッドシート・Gmail自動化\n\n## スプレッドシート操作の基本\n\n```javascript\n// データの一括読み込み\nfunction readAllData() {\n  const sheet = SpreadsheetApp.getActiveSheet();\n  const data = sheet.getDataRange().getValues();\n  // data[0] = ヘッダー行\n  // data[1] = 1行目のデータ\n}\n\n// 条件付きデータ書き込み\nfunction writeResults() {\n  const sheet = SpreadsheetApp.getActiveSheet();\n  sheet.getRange('D2').setValue('=SUM(B2:C2)');\n}\n```\n\n## Gmail自動化\n\n```javascript\n// テンプレートメール送信\nfunction sendReport(email, name, data) {\n  const subject = `月次レポート: ${name}様`;\n  const body = `${name}様\\n\\n今月の成果:\\n${data}`;\n  GmailApp.sendEmail(email, subject, body);\n}\n```\n\n## マーケ実務での活用例\n\n| 自動化タスク | 削減時間/月 |\n|-------------|------------|\n| 週次レポート集計 | 4時間 |\n| クライアントへのメール送信 | 2時間 |\n| データ整形・クリーニング | 3時間 |"),
        (30, "GASフォーム連携とトリガー設定",
         "# 回答収集から通知まで全自動化\n\nGoogleフォームで収集した回答を、自動的にスプレッドシートに整理し、Slackやメールに通知する仕組みをGASで構築します。\n\nさらに「トリガー」を使えば、時間指定や条件指定で自動実行できます。\n\n**あなたへの問い**: フォーム回答の確認を手動でやっていませんか？",
         "# フォーム連携とトリガー\n\n## フォーム送信時の自動処理\n\n```javascript\nfunction onFormSubmit(e) {\n  const responses = e.values;\n  const name = responses[1];\n  const email = responses[2];\n  \n  // 自動返信メール\n  GmailApp.sendEmail(email,\n    'お問い合わせありがとうございます',\n    `${name}様、お問い合わせを受け付けました。`);\n  \n  // Slack通知\n  sendSlackNotification(`新規問い合わせ: ${name}`);\n}\n```\n\n## トリガーの種類\n\n```\nGASトリガー\n├── 時間ベース\n│   ├── 毎日○時に実行\n│   ├── 毎週○曜日に実行\n│   └── 毎月○日に実行\n├── イベントベース\n│   ├── フォーム送信時\n│   ├── スプレッドシート編集時\n│   └── ドキュメント変更時\n└── 手動実行\n    └── ボタンクリック\n```"),
        (31, "GASからAPI・Webhook・Slack連携",
         "# 外部サービスとGASをつなぐ\n\nGASの真価は外部APIとの連携にあります。Slack通知、外部データの取得、Webhookの受信など、GASをハブとして様々なサービスを自動連携できます。\n\n**あなたへの問い**: スプレッドシートの更新をSlackに自動通知できたら便利だと思いませんか？",
         "# API・Webhook連携\n\n## 外部APIの呼び出し\n\n```javascript\nfunction callExternalAPI() {\n  const url = 'https://api.example.com/data';\n  const options = {\n    method: 'GET',\n    headers: { 'Authorization': 'Bearer ' + API_KEY }\n  };\n  const response = UrlFetchApp.fetch(url, options);\n  const data = JSON.parse(response.getContentText());\n  return data;\n}\n```\n\n## Slack Webhook連携\n\n```javascript\nfunction sendSlackMessage(message) {\n  const webhookUrl = 'https://hooks.slack.com/services/...';\n  const payload = { text: message };\n  UrlFetchApp.fetch(webhookUrl, {\n    method: 'POST',\n    contentType: 'application/json',\n    payload: JSON.stringify(payload)\n  });\n}\n```\n\n## 連携パターン\n\n| 連携先 | 用途 |\n|--------|------|\n| Slack | レポート通知、アラート |\n| ChatGPT API | テキスト生成・分析 |\n| GA4 API | アクセスデータ取得 |\n| Notion API | タスク管理連携 |"),
        (32, "GASでWebスクレイピング基礎",
         "# 競合サイトの情報を定期収集するスクリプト\n\nWebスクレイピングは、Webサイトから自動的に情報を収集する技術です。GASを使えば、競合の価格、ブログ更新、SNSフォロワー数等を定期的に収集できます。\n\n注意: スクレイピングはサイトの利用規約を確認した上で行いましょう。\n\n**あなたへの問い**: 競合サイトの価格チェックを手動でやっていませんか？",
         "# GASスクレイピング基礎\n\n## 基本的なスクレイピング\n\n```javascript\nfunction scrapeWebPage() {\n  const url = 'https://example.com/products';\n  const html = UrlFetchApp.fetch(url).getContentText();\n  \n  // 正規表現でデータ抽出\n  const priceMatch = html.match(/price[^>]*>([0-9,]+)円/);\n  if (priceMatch) {\n    const price = priceMatch[1];\n    Logger.log('価格: ' + price + '円');\n  }\n}\n```\n\n## 注意事項\n\n```\nスクレイピングの注意点\n├── 利用規約の確認（robots.txt）\n├── アクセス頻度の制限（1秒以上間隔）\n├── 個人情報の収集禁止\n└── 商用利用の可否確認\n```\n\n## マーケ活用例\n\n| 収集データ | 活用方法 |\n|-----------|----------|\n| 競合価格 | 価格戦略の参考 |\n| ブログ更新頻度 | コンテンツ戦略 |\n| 求人情報 | 競合の投資方向性 |"),
        (33, "GASのデバッグとエラーハンドリング",
         "# 障害を迅速に特定する方法\n\nGASスクリプトが期待通りに動かないとき、原因を素早く特定して修正する能力が重要です。Logger出力、try-catch、実行ログの活用を学びましょう。\n\n**あなたへの問い**: GASスクリプトがエラーで止まったとき、原因特定にどれくらい時間がかかりますか？",
         "# デバッグとエラーハンドリング\n\n## Logger出力\n\n```javascript\nfunction debugExample() {\n  const data = getDataFromSheet();\n  Logger.log('取得データ: ' + JSON.stringify(data));\n  Logger.log('データ件数: ' + data.length);\n}\n```\n\n## try-catchパターン\n\n```javascript\nfunction robustFunction() {\n  try {\n    const response = UrlFetchApp.fetch(url);\n    const data = JSON.parse(response.getContentText());\n    return data;\n  } catch (error) {\n    Logger.log('エラー発生: ' + error.message);\n    // エラー通知\n    sendSlackMessage('GASエラー: ' + error.message);\n    return null;\n  }\n}\n```\n\n## 実行ログの確認\n\n```\nデバッグの手順\n├── 1. Apps Script エディタ → 実行ログ確認\n├── 2. Logger.log で変数の中身を確認\n├── 3. try-catch でエラー箇所を特定\n├── 4. ブレークポイントでステップ実行\n└── 5. エラー通知の自動化（Slack/メール）\n```"),
        (34, "GASとBigQuery連携・Webアプリ公開",
         "# BQクエリ結果をスプレッドシートに反映し、Webアプリ化\n\nGASからBigQueryに接続してクエリを実行し、結果をスプレッドシートに書き込む方法を学びます。さらにWebアプリとして公開する手順も解説します。\n\n**あなたへの問い**: BigQueryのデータをスプレッドシートに手動でエクスポートしていませんか？",
         "# GAS × BigQuery × Webアプリ\n\n## BigQuery連携\n\n```javascript\nfunction queryBigQuery() {\n  const projectId = 'your-project-id';\n  const sql = `\n    SELECT event_date, COUNT(*) as events\n    FROM \\`project.dataset.events\\`\n    WHERE event_date >= '20240101'\n    GROUP BY event_date\n    ORDER BY event_date\n  `;\n  \n  const request = BigQuery.Jobs.query({\n    query: sql, useLegacySql: false\n  }, projectId);\n  \n  // 結果をスプレッドシートに書き込み\n  const sheet = SpreadsheetApp.getActiveSheet();\n  request.rows.forEach((row, i) => {\n    sheet.getRange(i+2, 1, 1, 2)\n      .setValues([[row.f[0].v, row.f[1].v]]);\n  });\n}\n```\n\n## Webアプリ公開\n\n```javascript\n// doGet関数でWebアプリとして公開\nfunction doGet() {\n  return HtmlService.createHtmlOutputFromFile('index');\n}\n```\n\n## 公開手順\n1. デプロイ → 新しいデプロイ → Webアプリ\n2. アクセス権限を設定\n3. URLが発行される"),
        (35, "Python環境構築（venv・pip）",
         "# マーケターのためのPython環境構築ガイド\n\nPythonはデータ分析・API連携・自動化に最適な言語です。まずは環境構築から始めましょう。仮想環境（venv）とパッケージ管理（pip）を使って、クリーンな開発環境を作ります。\n\n**あなたへの問い**: Pythonをインストールしたことはありますか？「環境構築で挫折した」という声をよく聞きます。",
         "# Python環境構築\n\n## インストール手順\n\n```\nPython環境構築の流れ\n├── 1. Python 3.11+をインストール\n│   └── python.org からダウンロード\n├── 2. 仮想環境を作成\n│   └── python -m venv .venv\n├── 3. 仮想環境を有効化\n│   ├── Windows: .venv\\Scripts\\activate\n│   └── Mac/Linux: source .venv/bin/activate\n├── 4. パッケージをインストール\n│   └── pip install pandas openai\n└── 5. requirements.txt で管理\n    └── pip freeze > requirements.txt\n```\n\n## なぜ仮想環境が必要か\n\n- プロジェクトごとにパッケージのバージョンを分離\n- 「Aのプロジェクトでは動くのにBでは動かない」を防止\n- チームメンバーと同じ環境を再現\n\n## マーケターがよく使うパッケージ\n\n| パッケージ | 用途 |\n|-----------|------|\n| pandas | データ分析 |\n| openai | LLM API |\n| requests | API呼び出し |\n| matplotlib | グラフ描画 |\n| google-cloud-bigquery | BQ連携 |"),
        (36, "Python基本文法（変数・型・制御構文）",
         "# マーケデータ処理に必要な基本文法\n\nPythonの基本文法をマーケティングデータ処理の例を使いながら学びます。変数、データ型、if文、for文を使いこなせるようになりましょう。\n\n**あなたへの問い**: プログラミング未経験でも大丈夫。この演習でPythonの基礎を体験してみましょう。",
         "# Python基本文法\n\n## 変数とデータ型\n\n```python\n# 文字列\ncampaign_name = \"春のキャンペーン\"\n\n# 数値\nctr = 3.5  # float\nclicks = 1500  # int\n\n# リスト\nkeywords = [\"GA4\", \"SEO\", \"広告運用\"]\n\n# 辞書\ncampaign = {\n    \"name\": \"春キャンペーン\",\n    \"budget\": 500000,\n    \"ctr\": 3.5\n}\n```\n\n## 制御構文\n\n```python\n# if文: CVR判定\ncvr = 2.5\nif cvr >= 3.0:\n    print(\"目標達成\")\nelif cvr >= 2.0:\n    print(\"改善の余地あり\")\nelse:\n    print(\"要改善\")\n\n# for文: キーワード処理\nfor kw in keywords:\n    print(f\"キーワード: {kw}\")\n```\n\n## マーケ実務でよく使うパターン\n\n```python\n# 広告データの集計\ncampaigns = [\n    {\"name\": \"A\", \"cost\": 100000, \"cv\": 10},\n    {\"name\": \"B\", \"cost\": 200000, \"cv\": 30},\n]\n\nfor c in campaigns:\n    cpa = c[\"cost\"] / c[\"cv\"]\n    print(f\"{c['name']}: CPA = ¥{cpa:,.0f}\")\n```"),
        (37, "Python関数・辞書・モジュール分割",
         "# 再利用可能なコードの書き方\n\n同じ処理を何度も書くのは非効率です。関数にまとめ、辞書でデータを構造化し、モジュールに分割することで、保守しやすいコードを書けるようになります。\n\n**あなたへの問い**: 同じ計算式をコピペして何度も使っていませんか？",
         "# 関数・辞書・モジュール\n\n## 関数の定義と呼び出し\n\n```python\ndef calculate_roas(revenue: float, ad_cost: float) -> float:\n    \"\"\"ROAS（広告費用対効果）を計算する\"\"\"\n    if ad_cost == 0:\n        return 0.0\n    return (revenue / ad_cost) * 100\n\n# 使用例\nroas = calculate_roas(1500000, 500000)\nprint(f\"ROAS: {roas:.1f}%\")  # ROAS: 300.0%\n```\n\n## 辞書（dict）の活用\n\n```python\n# ネストした辞書でデータ構造化\ncampaign_report = {\n    \"campaign_a\": {\n        \"impressions\": 50000,\n        \"clicks\": 2500,\n        \"conversions\": 75,\n        \"cost\": 300000\n    }\n}\n\n# アクセス\nctr = campaign_report[\"campaign_a\"][\"clicks\"] / \\\n      campaign_report[\"campaign_a\"][\"impressions\"] * 100\n```\n\n## モジュール分割\n\n```\nプロジェクト構成例\n├── main.py          # メイン処理\n├── metrics.py       # KPI計算関数\n├── api_client.py    # API連携\n└── utils.py         # ユーティリティ\n```"),
        (38, "Pythonでファイル操作と正規表現",
         "# CSV/JSON/テキストの一括処理\n\nマーケティングデータはCSV、JSON、テキスト等の様々な形式で扱います。Pythonでこれらを効率的に読み書きし、正規表現でパターンマッチングする方法を学びます。\n\n**あなたへの問い**: 大量のCSVファイルを手動で開いて処理していませんか？",
         "# ファイル操作と正規表現\n\n## CSV操作\n\n```python\nimport csv\n\n# CSV読み込み\nwith open('campaign_data.csv', 'r', encoding='utf-8') as f:\n    reader = csv.DictReader(f)\n    for row in reader:\n        print(f\"{row['campaign']}: CPA=¥{row['cpa']}\")\n\n# CSV書き込み\nwith open('report.csv', 'w', encoding='utf-8', newline='') as f:\n    writer = csv.writer(f)\n    writer.writerow(['campaign', 'cpa', 'roas'])\n    writer.writerow(['Campaign_A', 3000, 300])\n```\n\n## JSON操作\n\n```python\nimport json\n\n# JSON読み込み\nwith open('config.json', 'r') as f:\n    config = json.load(f)\n\n# JSON書き込み\nwith open('output.json', 'w', encoding='utf-8') as f:\n    json.dump(data, f, ensure_ascii=False, indent=2)\n```\n\n## 正規表現\n\n```python\nimport re\n\n# UTMパラメータの抽出\nurl = 'https://example.com?utm_source=google&utm_medium=cpc'\nparams = re.findall(r'utm_(\\w+)=(\\w+)', url)\n# [('source', 'google'), ('medium', 'cpc')]\n```"),
        (39, "pandasでデータ分析・前処理",
         "# GA4データを即戦力分析できるようになる\n\npandasはPythonの最強データ分析ライブラリです。CSV読み込み・欠損値処理・グループ集計・ピボットテーブル等、マーケティングデータ分析に必要な操作を一通り学びます。\n\n**あなたへの問い**: Excelのピボットテーブルを使っていますか？pandasならもっと高速・柔軟に集計できます。",
         "# pandasデータ分析\n\n## 基本操作\n\n```python\nimport pandas as pd\n\n# CSV読み込み\ndf = pd.read_csv('ga4_events.csv')\n\n# データ確認\nprint(df.head())      # 先頭5行\nprint(df.info())      # 列情報\nprint(df.describe())  # 統計量\n```\n\n## よく使う操作\n\n```python\n# フィルタリング\nhigh_cv = df[df['conversions'] > 10]\n\n# グループ集計\nchannel_summary = df.groupby('channel').agg({\n    'sessions': 'sum',\n    'conversions': 'sum',\n    'revenue': 'sum'\n}).reset_index()\n\n# 新しい列の追加\ndf['cvr'] = df['conversions'] / df['sessions'] * 100\ndf['cpa'] = df['cost'] / df['conversions']\n```\n\n## マーケ分析の定番パターン\n\n```\npandasでよく使う分析\n├── チャネル別KPI集計\n├── 日別トレンド分析\n├── コホート分析\n├── ファネル分析\n└── 前月比・前年比計算\n```"),
        (40, "データクレンジングの自動化",
         "# 汚いデータを自動的にキレイにする\n\n実際のマーケティングデータは「欠損値」「重複」「表記ゆれ」「外れ値」だらけです。これを自動的にクリーニングするスクリプトを書けるようになりましょう。\n\n**あなたへの問い**: 「データの前処理に全体の8割の時間がかかる」と聞いたことはありますか？",
         "# データクレンジング自動化\n\n## よくあるデータ品質問題\n\n```\nデータ品質問題と対処法\n├── 欠損値（NaN）\n│   └── 削除 or 平均値/中央値で補完\n├── 重複行\n│   └── drop_duplicates()\n├── 表記ゆれ\n│   └── 正規化（大文字→小文字、全角→半角）\n├── 外れ値\n│   └── IQR法で検出・除外\n└── 型の不一致\n    └── astype()で型変換\n```\n\n## pandasでのクレンジング\n\n```python\nimport pandas as pd\n\n# 欠損値処理\ndf = df.dropna(subset=['session_id'])  # 必須列のNaN行削除\ndf['revenue'] = df['revenue'].fillna(0)  # 0で補完\n\n# 重複削除\ndf = df.drop_duplicates(subset=['session_id', 'event_name'])\n\n# 表記ゆれ修正\ndf['channel'] = df['channel'].str.lower().str.strip()\ndf['channel'] = df['channel'].replace({\n    'organic': 'organic_search',\n    'organic search': 'organic_search'\n})\n\n# 外れ値除去（IQR法）\nQ1 = df['revenue'].quantile(0.25)\nQ3 = df['revenue'].quantile(0.75)\nIQR = Q3 - Q1\ndf = df[(df['revenue'] >= Q1-1.5*IQR) & (df['revenue'] <= Q3+1.5*IQR)]\n```"),
        (41, "matplotlib・seabornでデータ可視化",
         "# 分析結果を説得力のあるグラフで表現する\n\nデータ分析の結果は、グラフで表現することで理解度と説得力が大幅に向上します。matplotlibとseabornを使って、マーケティングレポートに使えるグラフを作成しましょう。\n\n**あなたへの問い**: 上司やクライアントへのレポートで、Excelのグラフに限界を感じたことはありませんか？",
         "# データ可視化\n\n## matplotlib基本\n\n```python\nimport matplotlib.pyplot as plt\n\n# 折れ線グラフ（日別セッション数）\nplt.figure(figsize=(12, 6))\nplt.plot(dates, sessions, color='#3b82f6')\nplt.title('日別セッション数推移')\nplt.xlabel('日付')\nplt.ylabel('セッション数')\nplt.grid(True, alpha=0.3)\nplt.savefig('sessions_trend.png', dpi=150)\n```\n\n## seabornで美しいグラフ\n\n```python\nimport seaborn as sns\n\n# チャネル別CV数（棒グラフ）\nsns.barplot(data=df, x='channel', y='conversions',\n            palette='viridis')\n\n# ヒートマップ（曜日×時間帯のCV数）\npivot = df.pivot_table(values='cv', \n                       index='hour', columns='weekday')\nsns.heatmap(pivot, annot=True, cmap='YlOrRd')\n```\n\n## マーケレポート定番グラフ\n\n| グラフ | 用途 |\n|--------|------|\n| 折れ線 | 日別・月別トレンド |\n| 棒グラフ | チャネル別比較 |\n| 円グラフ | シェア・構成比 |\n| ヒートマップ | 時間帯×曜日分析 |\n| 散布図 | 相関分析 |"),
        (42, "Jupyter Notebookの活用術",
         "# 分析と文書を一体化したインタラクティブ環境\n\nJupyter Notebookは「コード実行」「分析結果」「説明文」を1つのドキュメントにまとめられるツールです。データ分析の試行錯誤と結果の文書化を同時に行えます。\n\n**あなたへの問い**: データ分析の過程を後から振り返れるように記録していますか？",
         "# Jupyter Notebook活用\n\n## Notebookの構成\n\n```\nJupyter Notebookの構成要素\n├── Markdownセル: 説明・見出し・分析メモ\n├── コードセル: Python実行\n├── 出力セル: グラフ・表・テキスト\n└── マジックコマンド: %timeit, %%sql等\n```\n\n## インストールと起動\n\n```bash\npip install jupyter\njupyter notebook\n# ブラウザが自動的に開く\n```\n\n## 効率的な使い方\n\n### セル分割のコツ\n- 1セル = 1つの処理ステップ\n- データ読み込み → 前処理 → 分析 → 可視化\n- 各セルにMarkdownで目的を記載\n\n### 便利なショートカット\n| キー | 機能 |\n|------|------|\n| Shift+Enter | セル実行&次へ |\n| Ctrl+Enter | セル実行（移動なし） |\n| A | 上にセル追加 |\n| B | 下にセル追加 |\n| M | Markdownセルに変更 |"),
        (43, "REST APIの呼び出しと認証基礎",
         "# PythonからWeb APIを叩く基礎\n\nマーケティング自動化の核となるのがAPI（Application Programming Interface）です。GA4、Google広告、Slack、OpenAI等のサービスをPythonから操作する方法を学びます。\n\n**あなたへの問い**: 「API」という言葉を聞いたことはあるが、実際に使ったことはありますか？",
         "# REST API基礎\n\n## APIの基本概念\n\n```\nREST API通信の流れ\n├── クライアント（Python）\n│   └── リクエスト送信\n│       ├── URL（エンドポイント）\n│       ├── メソッド（GET/POST/PUT/DELETE）\n│       ├── ヘッダー（認証情報等）\n│       └── ボディ（送信データ）\n└── サーバー（APIサービス）\n    └── レスポンス返却\n        ├── ステータスコード（200/400/500等）\n        └── ボディ（JSONデータ）\n```\n\n## Pythonでの実装\n\n```python\nimport requests\n\n# GETリクエスト\nresponse = requests.get(\n    'https://api.example.com/data',\n    headers={'Authorization': 'Bearer YOUR_API_KEY'}\n)\ndata = response.json()\n\n# POSTリクエスト\nresponse = requests.post(\n    'https://api.example.com/send',\n    json={'message': 'Hello from Python'},\n    headers={'Authorization': 'Bearer YOUR_API_KEY'}\n)\n```\n\n## 認証方式\n\n| 方式 | 用途 |\n|------|------|\n| APIキー | シンプルなAPI（OpenAI等） |\n| OAuth2 | Google API（GA4/BQ等） |\n| Bearer Token | 多くのREST API |"),
        (44, "OpenAI / Anthropic APIの実装入門",
         "# LLMをシステムに組み込む実装方法\n\nOpenAI（GPT）とAnthropic（Claude）のAPIを使って、LLMをPythonプログラムに組み込む方法を学びます。これにより、マーケティング自動化システムの構築が可能になります。\n\n**あなたへの問い**: ChatGPTをブラウザで使うのと、APIで使うのとではどう違うと思いますか？",
         "# LLM API実装\n\n## OpenAI API\n\n```python\nfrom openai import OpenAI\n\nclient = OpenAI(api_key='sk-...')\n\nresponse = client.chat.completions.create(\n    model='gpt-4o',\n    messages=[\n        {'role': 'system', 'content': 'マーケティングの専門家'},\n        {'role': 'user', 'content': 'GA4の初期設定手順を教えて'}\n    ],\n    temperature=0.3,\n    max_tokens=2000\n)\n\nprint(response.choices[0].message.content)\n```\n\n## Anthropic API\n\n```python\nimport anthropic\n\nclient = anthropic.Anthropic(api_key='sk-ant-...')\n\nresponse = client.messages.create(\n    model='claude-3-5-sonnet-20241022',\n    max_tokens=2000,\n    system='マーケティングの専門家',\n    messages=[\n        {'role': 'user', 'content': 'GA4の初期設定手順を教えて'}\n    ]\n)\n\nprint(response.content[0].text)\n```\n\n## API vs ブラウザ利用の違い\n\n| 項目 | ブラウザ | API |\n|------|---------|-----|\n| 自動化 | 不可 | 可能 |\n| バッチ処理 | 不可 | 可能 |\n| コスト | 月額固定 | 従量課金 |\n| カスタマイズ | 限定的 | 柔軟 |"),
        (45, "Google API認証とOAuth2実装",
         "# GA4・BigQuery・Sheets APIを使う認証の実装\n\nGoogle APIを使うには「認証」が必須です。サービスアカウントとOAuth2の2つの方法を学び、GA4データの取得やBigQueryクエリの実行をPythonから行えるようにします。\n\n**あなたへの問い**: GA4のデータをAPIで取得したいと思ったことはありますか？",
         "# Google API認証\n\n## 2つの認証方式\n\n```\nGoogle API認証\n├── サービスアカウント（SA）\n│   ├── サーバー間通信向け\n│   ├── JSONキーファイルで認証\n│   └── 用途: バッチ処理、自動化\n└── OAuth2\n    ├── ユーザー代理アクセス\n    ├── ブラウザで認可フロー\n    └── 用途: ユーザー向けアプリ\n```\n\n## サービスアカウント認証\n\n```python\nfrom google.oauth2 import service_account\nfrom google.cloud import bigquery\n\ncredentials = service_account.Credentials.from_service_account_file(\n    'service-account-key.json',\n    scopes=['https://www.googleapis.com/auth/bigquery']\n)\n\nclient = bigquery.Client(credentials=credentials)\nquery = 'SELECT * FROM `project.dataset.table` LIMIT 10'\ndf = client.query(query).to_dataframe()\n```\n\n## セキュリティ注意事項\n\n- サービスアカウントキーは**絶対にGitにコミットしない**\n- .envファイルや環境変数で管理\n- 最小権限の原則（必要なAPIだけ許可）"),
        (46, "Webhook・ノーコード自動化（Zapier/Make）",
         "# コードを書かずにサービス間連携を実現\n\nZapierやMake（旧Integromat）は、ノーコードでサービス間の自動連携を構築できるツールです。Webhookを使えば、カスタムのイベント駆動処理も可能になります。\n\n**あなたへの問い**: 「フォーム回答→Slackに通知→スプレッドシートに記録」を手動でやっていませんか？",
         "# ノーコード自動化\n\n## Zapier / Make の概要\n\n```\nノーコード自動化の構成\n├── トリガー（きっかけ）\n│   ├── フォーム送信\n│   ├── メール受信\n│   └── Webhook受信\n├── アクション（実行処理）\n│   ├── Slack通知\n│   ├── スプレッドシート更新\n│   └── メール送信\n└── フィルター（条件分岐）\n    └── 特定条件でのみ実行\n```\n\n## Webhookとは\n\nWebhookは「イベントが発生したらHTTPリクエストを送る」仕組み。\n\n例: Stripeで決済完了→Webhookで自社APIに通知→CRM更新\n\n## マーケ実務での自動化例\n\n| トリガー | アクション | ツール |\n|----------|------------|--------|\n| フォーム送信 | Slack通知+シート記録 | Zapier |\n| 新規リード | CRM登録+ウェルカムメール | Make |\n| SNSメンション | スプレッドシート記録 | Zapier |\n| 定期スケジュール | レポート生成+メール送信 | Make |"),
        (47, "n8nでセルフホスト自動化パイプライン",
         "# 無料・自社管理の自動化基盤を構築する\n\nn8nはオープンソースのワークフロー自動化ツールです。Zapier/Makeと同等の機能を、自社サーバーで無料運用できます。データを外部に出さずに自動化できる点が最大の利点です。\n\n**あなたへの問い**: Zapierの月額費用が高いと感じたことはありませんか？",
         "# n8nセルフホスト自動化\n\n## n8nの特徴\n\n```\nn8nの利点\n├── オープンソース（無料）\n├── セルフホスト（データ外部流出なし）\n├── 400+のインテグレーション\n├── コードも書ける（JavaScript/Python）\n└── Docker/Cloud Runでデプロイ可能\n```\n\n## インストール\n\n```bash\n# Docker\ndocker run -it --rm \\\n  -p 5678:5678 \\\n  -v ~/.n8n:/home/node/.n8n \\\n  n8nio/n8n\n\n# npm\nnpm install n8n -g\nn8n start\n```\n\n## マーケ自動化ワークフロー例\n\n### GA4日次レポート自動化\n1. Cron Trigger（毎朝9時）\n2. Google Sheets: 前日のGA4データ取得\n3. OpenAI: データから要約・インサイト生成\n4. Slack: チャンネルに投稿\n5. Gmail: クライアントに送信"),
        (48, "cronと定期バッチ実行の設計",
         "# 「毎日○時に自動実行」を実現する\n\nマーケティングの自動化では「毎朝レポートを生成」「毎週月曜にデータ集計」等の定期実行が不可欠です。cronの設計と定期バッチの構築方法を学びます。\n\n**あなたへの問い**: 毎朝手動で実行しているスクリプトはありませんか？",
         "# 定期バッチ実行\n\n## cron式の読み方\n\n```\ncron式: 分 時 日 月 曜日\n\n例:\n├── 0 9 * * *      → 毎日9:00\n├── 0 9 * * 1      → 毎週月曜9:00\n├── 0 9 1 * *      → 毎月1日9:00\n├── */30 * * * *   → 30分ごと\n└── 0 9,18 * * 1-5 → 平日9:00と18:00\n```\n\n## 実行環境の選択\n\n| 環境 | 特徴 | コスト |\n|------|------|--------|\n| GASトリガー | 最も簡単 | 無料 |\n| Cloud Scheduler | GCP連携 | ほぼ無料 |\n| GitHub Actions | CI/CD連携 | 無料枠あり |\n| crontab | Linux/Mac | 無料（サーバー費） |\n\n## 設計のポイント\n\n- 冪等性: 同じ処理を2回実行しても問題なし\n- エラー通知: 失敗時にSlack/メール通知\n- ログ記録: 実行結果を記録\n- タイムゾーン: JSTを明示的に指定"),
        (49, "Cloud Functionsでサーバーレス実行",
         "# GCPでイベント駆動の軽量処理をデプロイ\n\nCloud Functionsは「必要なときだけ動く」サーバーレスの実行環境です。サーバー管理不要で、APIリクエストやスケジュール実行に応じてPythonスクリプトを実行できます。\n\n**あなたへの問い**: 自動化スクリプトを24時間動かすためにサーバーを借りるのはもったいないと思いませんか？",
         "# Cloud Functions\n\n## Cloud Functionsの特徴\n\n```\nCloud Functions\n├── サーバー管理不要\n├── 従量課金（実行時間×メモリ）\n├── 自動スケーリング\n├── HTTPトリガー / Pub/Subトリガー\n└── Python / Node.js / Go対応\n```\n\n## デプロイ手順\n\n```bash\n# 1. main.pyを作成\n# 2. requirements.txtを作成\n# 3. デプロイ\ngcloud functions deploy my-function \\\n  --runtime python311 \\\n  --trigger-http \\\n  --region asia-northeast1 \\\n  --allow-unauthenticated\n```\n\n## main.pyの例\n\n```python\nimport functions_framework\nfrom google.cloud import bigquery\n\n@functions_framework.http\ndef daily_report(request):\n    client = bigquery.Client()\n    query = 'SELECT COUNT(*) as events FROM `dataset.events`'\n    result = client.query(query).to_dataframe()\n    return f'本日のイベント数: {result.iloc[0][\"events\"]}'\n```\n\n## マーケ自動化での活用\n\n| 用途 | トリガー |\n|------|----------|\n| 日次レポート | Cloud Scheduler |\n| Webhook受信 | HTTP |\n| データ連携 | Pub/Sub |"),
        (50, "Claude Codeとは何か",
         "# AIエージェント型開発ツールの概要\n\nClaude Codeは、Anthropicが開発したAIエージェント型の開発ツールです。従来のAIアシスタント（ChatGPT、Claude.ai等）とは異なり、ファイルの読み書き、コマンド実行、Git操作等を**自律的に**行えます。\n\nマーケターにとって、Claude Codeは「指示を出すだけでコードを書いてくれるエンジニア」のような存在です。\n\n**あなたへの問い**: AIチャットに「このファイルを修正して」と言ったのに、コードをコピペする手間がかかった経験はありませんか？",
         "# Claude Codeの全体像\n\n## AIアシスタント vs AIエージェント\n\n```\n従来のAIアシスタント（ChatGPT/Claude.ai）\n├── テキストの入出力のみ\n├── ファイル操作: ユーザーが手動でコピペ\n├── コマンド実行: ユーザーが手動\n└── 会話のみ、実行力なし\n\nAIエージェント（Claude Code）\n├── ファイルの読み書きが可能\n├── コマンド実行が可能\n├── Git操作（コミット・PR作成）が可能\n├── 複数ツールを自律的に組み合わせ\n└── 指示→計画→実行→確認のサイクル\n```\n\n## Claude Codeの主な機能\n\n| 機能 | 説明 |\n|------|------|\n| ファイル操作 | Read/Write/Editでコード修正 |\n| コマンド実行 | Bashツールで任意コマンド |\n| Git操作 | コミット・PR作成・ブランチ管理 |\n| コード検索 | Grep/Globでファイル検索 |\n| メモリ | MEMORY.mdで長期記憶 |\n| サブエージェント | 複雑タスクの分割実行 |\n\n## マーケターへのメリット\n\n- **データ分析の自動化**: 「GA4データを集計してグラフにして」と指示するだけ\n- **レポート生成**: 「月次レポートのPythonスクリプトを作って」\n- **API連携構築**: 「OpenAI APIでコンテンツ生成する仕組みを作って」\n- **Webアプリ構築**: 「Streamlitでダッシュボードを作って」"),
    ]

    for num, title, intro_c, concept_c in remaining:
        sections = [
            intro(intro_c),
            concept(concept_c, True),
        ]
        # exercise: selectクイズ形式の汎用演習
        ex_qs = f'[{{q:"このモジュールの重要概念を選択してください",opts:["選択肢A","選択肢B","選択肢C"],ans:0,exp:"正解の解説"}}]'
        sections.append(interactive(
            f"# 演習: {title}の理解度チェック\n\n学んだ内容をインタラクティブな演習で確認しましょう。",
            select_quiz_html(f"{title} 理解度チェック", ex_qs),
            ["主要概念を理解した","マーケティング実務への適用を考えられた","次のステップを把握した"]
        ))
        sections.append(quiz([
            Q(f"{title}に関する問題1", ["選択肢A","選択肢B","選択肢C","選択肢D"], 1, "解説"),
            Q(f"{title}に関する問題2", ["選択肢A","選択肢B","選択肢C","選択肢D"], 1, "解説"),
            Q(f"{title}に関する問題3", ["選択肢A","選択肢B","選択肢C","選択肢D"], 1, "解説"),
        ]))
        next_title = ""
        for n2, t2, _, _ in remaining:
            if n2 == num + 1:
                next_title = f"7-{num+1}: {t2}"
                break
        if not next_title:
            for n2, t2, _, _ in remaining2:
                if n2 == num + 1:
                    next_title = f"7-{num+1}: {t2}"
                    break
        if not next_title:
            next_title = "次のモジュール"

        sections.append(summary(f"# モジュール7-{num} 完了！\n\n## 習得したポイント\n\n✅ {title}の基本概念を理解した\n✅ マーケティング実務での活用方法を把握した\n✅ 関連する技術との違いを説明できる\n✅ 次のステップに進む準備ができた\n\n## 次のステップ\n\n次のモジュール **「{next_title}」** に進みましょう。\n\n> 実務チャレンジ: 今回学んだ内容を自社の業務に1つ適用してみましょう。"))
        w(num, L(num, title, sections))

    for num, title, intro_c, concept_c in remaining2:
        sections = [
            intro(intro_c),
            concept(concept_c, True),
        ]
        # コード系モジュール(28-44)はexercise_code形式、それ以外はinteractive
        if 28 <= num <= 44:
            sections.append(exercise_code(
                f"# 演習: {title}を実践してみよう\n\n以下のコードの空欄を埋めて、実際に動くスクリプトを完成させましょう。",
                f"# {title}の演習\n# TODO: 以下のコードを完成させてください\n\nprint('演習を完成させましょう')",
                [f"{title}の基本構文を確認しましょう", "公式ドキュメントを参照してください", "エラーメッセージをよく読んで対処しましょう"],
                f"# {title}の模範回答\nprint('{title}の演習完了！')"
            ))
        else:
            ex_qs = f'[{{q:"このモジュールの重要概念を確認",opts:["選択肢A","選択肢B","選択肢C"],ans:0,exp:"解説"}}]'
            sections.append(interactive(
                f"# 演習: {title}の理解度チェック",
                select_quiz_html(f"{title} 理解度チェック", ex_qs),
                ["主要概念を理解した","実務適用を考えられた","次のステップを把握した"]
            ))
        sections.append(quiz([
            Q(f"{title}に関する問題1", ["選択肢A","選択肢B","選択肢C","選択肢D"], 1, "解説"),
            Q(f"{title}に関する問題2", ["選択肢A","選択肢B","選択肢C","選択肢D"], 1, "解説"),
            Q(f"{title}に関する問題3", ["選択肢A","選択肢B","選択肢C","選択肢D"], 1, "解説"),
        ]))
        next_title = ""
        for n2, t2, _, _ in remaining2:
            if n2 == num + 1:
                next_title = f"7-{num+1}: {t2}"
                break
        if not next_title:
            next_title = "次のモジュール"

        sections.append(summary(f"# モジュール7-{num} 完了！\n\n## 習得したポイント\n\n✅ {title}の基本概念を理解した\n✅ マーケティング実務での活用方法を把握した\n✅ 関連する技術との違いを説明できる\n✅ 次のステップに進む準備ができた\n\n## 次のステップ\n\n次のモジュール **「{next_title}」** に進みましょう。\n\n> 実務チャレンジ: 今回学んだ内容を自社の業務に1つ適用してみましょう。"))
        w(num, L(num, title, sections))

    print("\n=== 完了 ===")


if __name__ == "__main__":
    gen_all()
