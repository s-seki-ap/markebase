"""AI & 自動化カテゴリ（7-1〜7-50）のレッスンJSONを一括生成するスクリプト"""
import json
import os

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), '..', 'data', 'lessons')

# モジュール定義: (id_num, title, difficulty, minutes)
# categories.jsonから抽出した情報
MODULES = [
    (1, "人工知能の歴史と変遷", "beginner", 15),
    (2, "機械学習の基礎と学習方式", "beginner", 20),
    (3, "ニューラルネットワークと深層学習", "beginner", 20),
    (4, "NLP・画像認識・マルチモーダルAI", "beginner", 20),
    (5, "生成AI（Generative AI）の登場と衝撃", "beginner", 20),
    (6, "LLM（大規模言語モデル）の仕組み", "beginner", 20),
    (7, "トークンとコンテキストウィンドウ", "beginner", 15),
    (8, "主要LLMモデル比較（GPT/Claude/Gemini/Llama）", "beginner", 20),
    (9, "LLM APIコスト比較と最適化", "beginner", 20),
    (10, "マルチモーダルLLMの活用", "beginner", 20),
    (11, "ファインチューニングとRAGの概念", "beginner", 20),
    (12, "プロンプトの構造と設計原則", "beginner", 20),
    (13, "System / User / Assistantロールの使い方", "beginner", 15),
    (14, "Zero-shot / Few-shotプロンプティング", "beginner", 20),
    (15, "Chain of Thoughtプロンプティング", "beginner", 20),
    (16, "ロールプレイング・ペルソナプロンプト設計", "beginner", 15),
    (17, "Output Format指定とJSON出力", "beginner", 20),
    (18, "Temperature・Top-P・トークン最適化", "beginner", 20),
    (19, "プロンプトチェーンとパイプライン設計", "beginner", 20),
    (20, "プロンプトの評価メトリクスとイテレーション", "beginner", 20),
    (21, "プロンプトテンプレートの管理と評価", "beginner", 20),
    (22, "SEO記事のAI生成ワークフロー", "intermediate", 30),
    (23, "広告コピー・LPコピーのAI大量生成", "intermediate", 25),
    (24, "メール・SNS投稿のAI量産テクニック", "intermediate", 25),
    (25, "AIコンテンツの品質管理とファクトチェック", "intermediate", 25),
    (26, "ブランドボイス維持とSEOリスク対策", "intermediate", 25),
    (27, "コンテンツカレンダーのAI自動生成", "intermediate", 25),
    (28, "Google Apps Script（GAS）入門", "intermediate", 30),
    (29, "GASでスプレッドシート・Gmail自動化", "intermediate", 30),
    (30, "GASフォーム連携とトリガー設定", "intermediate", 25),
    (31, "GASからAPI・Webhook・Slack連携", "intermediate", 30),
    (32, "GASでWebスクレイピング基礎", "intermediate", 30),
    (33, "GASのデバッグとエラーハンドリング", "intermediate", 25),
    (34, "GASとBigQuery連携・Webアプリ公開", "intermediate", 30),
    (35, "Python環境構築（venv・pip）", "intermediate", 25),
    (36, "Python基本文法（変数・型・制御構文）", "intermediate", 25),
    (37, "Python関数・辞書・モジュール分割", "intermediate", 25),
    (38, "Pythonでファイル操作と正規表現", "intermediate", 25),
    (39, "pandasでデータ分析・前処理", "intermediate", 30),
    (40, "データクレンジングの自動化", "intermediate", 30),
    (41, "matplotlib・seabornでデータ可視化", "intermediate", 30),
    (42, "Jupyter Notebookの活用術", "intermediate", 25),
    (43, "REST APIの呼び出しと認証基礎", "intermediate", 30),
    (44, "OpenAI / Anthropic APIの実装入門", "intermediate", 30),
    (45, "Google API認証とOAuth2実装", "intermediate", 30),
    (46, "Webhook・ノーコード自動化（Zapier/Make）", "intermediate", 25),
    (47, "n8nでセルフホスト自動化パイプライン", "intermediate", 35),
    (48, "cronと定期バッチ実行の設計", "intermediate", 25),
    (49, "Cloud Functionsでサーバーレス実行", "intermediate", 35),
    (50, "Claude Codeとは何か", "intermediate", 20),
]


def get_next_module_title(num: int) -> str:
    """次のモジュールのタイトルを返す"""
    for n, title, _, _ in MODULES:
        if n == num + 1:
            return f"7-{num+1}: {title}"
    return "次のモジュール"


def build_lesson(num: int, title: str, difficulty: str, minutes: int) -> dict:
    """各モジュールのレッスンJSONを生成"""
    # モジュールごとの教材を辞書で管理
    lessons = {}

    # ===== 7-1: 人工知能の歴史と変遷 =====
    lessons[1] = {
        "intro": {
            "content": "# AIの歴史を知ることがマーケターに必要な理由\n\n「AI」という言葉は今や日常的に使われますが、その歴史を知らずに活用しようとすると、技術の限界や強みを見誤ります。\n\nマーケターとして重要なのは、**なぜ今このタイミングでAIが「使える」ようになったのか**を理解することです。\n\n## AIブームは今回が初めてではない\n\nAIには過去に2度の「冬の時代」がありました。期待が膨らみ、失望が訪れ、研究が停滞するサイクルが繰り返されてきました。\n\n今起きていることが過去のブームと違う理由を、歴史の流れから理解しましょう。\n\n**あなたへの問い**: 「AIを使ったマーケティング施策」と聞いて、何を思い浮かべますか？それは本当にAIである必要がありますか？",
            "diagram": False
        },
        "concept": {
            "content": "# AI発展の5つの時代\n\n## 第1期: 黎明期（1950年代〜1960年代）\n\nアラン・チューリングが「機械は考えられるか？」という問いを提起（1950年）。記号処理による推論プログラムが登場。\n\n**限界**: 現実の複雑さに対応できず。計算資源が圧倒的に不足。\n\n## 第2期: 第1次AIブーム〜冬の時代（1970年代〜1980年代前半）\n\nエキスパートシステム（専門家の知識をルール化したAI）が実用化。しかし知識の記述コストが膨大で破綻。\n\n## 第3期: 第2次AIブーム〜冬の時代（1980年代後半〜2000年代前半）\n\nニューラルネットワークの研究が進むも、計算能力の限界から商用化には至らず。\n\n## 第4期: 機械学習の実用化（2000年代〜2010年代前半）\n\nビッグデータの蓄積とクラウド計算の普及により、機械学習が実用化。スパムフィルタ、レコメンド、広告最適化に活用。\n\n**マーケティングへの影響**: Google広告のスマート入札、Amazonのレコメンドエンジン。\n\n## 第5期: 深層学習革命〜生成AI（2012年〜現在）\n\n2012年のImageNetコンテストでディープラーニングが圧勝。以降、画像認識・音声認識・自然言語処理が急速に発展。\n\n2022年のChatGPT登場で一般ユーザーへの普及が爆発的に加速。\n\n**マーケティングへの影響**: コンテンツ生成、広告クリエイティブ自動化、チャットボット、SEO対策の変革。\n\n## なぜ今AIが「使える」のか\n\n```\n3つの要因が揃った\n├── データ量: SNS・ECの普及でビッグデータが蓄積\n├── 計算能力: GPU・TPUの進化とクラウドの低コスト化\n└── アルゴリズム: Transformer（2017年）による革命的な精度向上\n```",
            "diagram": True
        },
        "exercise": {
            "type": "interactive",
            "data": {
                "content": "# 演習: AI技術の発展を時系列に並べ替えよう\n\nAIの主要なマイルストーンを正しい時系列順にドラッグ&ドロップで並べ替えてください。歴史的な出来事とマーケティングへの影響を結びつけて理解しましょう。",
                "htmlContent": "<!DOCTYPE html><html><head><meta charset=\"UTF-8\"><style>*{margin:0;padding:0;box-sizing:border-box}body{background:#0f172a;color:#e2e8f0;font-family:system-ui,sans-serif;padding:24px;min-height:100vh}.title{font-size:1.3rem;font-weight:700;margin-bottom:8px;color:#f1f5f9}.subtitle{color:#94a3b8;margin-bottom:20px;font-size:.9rem}.container{display:flex;gap:24px;flex-wrap:wrap}.source{flex:1;min-width:280px}.target{flex:1;min-width:280px}.label{font-size:.85rem;color:#8b5cf6;font-weight:600;margin-bottom:10px;text-transform:uppercase;letter-spacing:.05em}.card{background:#1e293b;border:2px solid #334155;border-radius:10px;padding:14px 16px;margin-bottom:10px;cursor:grab;transition:all .2s;user-select:none}.card:hover{border-color:#3b82f6;box-shadow:0 0 12px rgba(59,130,246,.25)}.card.dragging{opacity:.4;border-color:#8b5cf6}.card .era{font-size:.75rem;color:#8b5cf6;margin-bottom:4px}.card .event{font-weight:600;font-size:.95rem;margin-bottom:4px}.card .impact{font-size:.8rem;color:#94a3b8}.drop-zone{background:#1e293b;border:2px dashed #334155;border-radius:10px;padding:14px 16px;margin-bottom:10px;min-height:56px;transition:all .2s;display:flex;align-items:center;justify-content:center}.drop-zone.over{border-color:#10b981;background:#0f2a1e}.drop-zone .num{color:#475569;font-size:1.2rem;font-weight:700;margin-right:12px;min-width:24px}.drop-zone.filled{border-style:solid;border-color:#10b981;background:#0f2a1e}.btn{background:#3b82f6;color:#fff;border:none;border-radius:8px;padding:12px 28px;font-size:1rem;font-weight:600;cursor:pointer;margin-top:16px;transition:all .2s}.btn:hover{background:#2563eb}.result{margin-top:16px;padding:16px;border-radius:10px;font-weight:600;display:none}.result.correct{background:#052e16;border:2px solid #10b981;color:#10b981;display:block}.result.wrong{background:#2a0f0f;border:2px solid #ef4444;color:#ef4444;display:block}</style></head><body><div class=\"title\">AI技術の発展タイムライン並べ替え</div><div class=\"subtitle\">左のカードを右のスロットにドラッグして、古い順（上から下）に並べましょう</div><div class=\"container\"><div class=\"source\" id=\"source\"><div class=\"label\">カード（ドラッグしてね）</div></div><div class=\"target\" id=\"target\"><div class=\"label\">タイムライン（古い順）</div><div class=\"drop-zone\" data-slot=\"0\"><span class=\"num\">1</span><span class=\"placeholder\">ここにドロップ</span></div><div class=\"drop-zone\" data-slot=\"1\"><span class=\"num\">2</span><span class=\"placeholder\">ここにドロップ</span></div><div class=\"drop-zone\" data-slot=\"2\"><span class=\"num\">3</span><span class=\"placeholder\">ここにドロップ</span></div><div class=\"drop-zone\" data-slot=\"3\"><span class=\"num\">4</span><span class=\"placeholder\">ここにドロップ</span></div><div class=\"drop-zone\" data-slot=\"4\"><span class=\"num\">5</span><span class=\"placeholder\">ここにドロップ</span></div></div></div><button class=\"btn\" onclick=\"checkAnswer()\">回答を確認</button><div class=\"result\" id=\"result\"></div><script>const items=[{id:0,era:\"1950年代\",event:\"チューリングテスト提唱\",impact:\"「機械は考えられるか？」という問いの始まり\"},{id:1,era:\"1980年代\",event:\"エキスパートシステム実用化\",impact:\"ルールベースAIの限界を露呈\"},{id:2,era:\"2006年\",event:\"ディープラーニングの再発見\",impact:\"ヒントン教授の研究で深層学習が復活\"},{id:3,era:\"2012年\",event:\"ImageNetでのCNN圧勝\",impact:\"画像認識精度が人間を超え始める\"},{id:4,era:\"2022年\",event:\"ChatGPT一般公開\",impact:\"生成AIがマーケティングを根本変革\"}];const shuffled=[...items].sort(()=>Math.random()-.5);const sourceEl=document.getElementById(\"source\");const slots=new Array(5).fill(null);let draggedId=null;shuffled.forEach(item=>{const card=document.createElement(\"div\");card.className=\"card\";card.draggable=true;card.dataset.id=item.id;card.innerHTML=`<div class=\"era\">${item.era}</div><div class=\"event\">${item.event}</div><div class=\"impact\">${item.impact}</div>`;card.addEventListener(\"dragstart\",e=>{draggedId=item.id;card.classList.add(\"dragging\")});card.addEventListener(\"dragend\",()=>{card.classList.remove(\"dragging\")});sourceEl.appendChild(card)});document.querySelectorAll(\".drop-zone\").forEach(zone=>{zone.addEventListener(\"dragover\",e=>{e.preventDefault();zone.classList.add(\"over\")});zone.addEventListener(\"dragleave\",()=>zone.classList.remove(\"over\"));zone.addEventListener(\"drop\",e=>{e.preventDefault();zone.classList.remove(\"over\");const slotIdx=parseInt(zone.dataset.slot);if(slots[slotIdx]!==null){const oldCard=zone.querySelector(\".card\");if(oldCard){sourceEl.appendChild(oldCard);slots[slotIdx]=null}}const card=document.querySelector(`.card[data-id=\"${draggedId}\"]`);if(card){const prevSlot=slots.indexOf(draggedId);if(prevSlot!==-1){const prevZone=document.querySelector(`.drop-zone[data-slot=\"${prevSlot}\"]`);prevZone.classList.remove(\"filled\");prevZone.innerHTML=`<span class=\"num\">${prevSlot+1}</span><span class=\"placeholder\">ここにドロップ</span>`;slots[prevSlot]=null}zone.innerHTML=`<span class=\"num\">${slotIdx+1}</span>`;zone.appendChild(card);zone.classList.add(\"filled\");slots[slotIdx]=draggedId}})});function checkAnswer(){const correct=[0,1,2,3,4];const isCorrect=slots.every((s,i)=>s===correct[i]);const result=document.getElementById(\"result\");if(isCorrect){result.className=\"result correct\";result.textContent=\"正解！AIの発展は、理論の提唱→ルールベース→深層学習の再発見→画像認識の突破→生成AIの爆発的普及、という流れで進みました。\"}else{result.className=\"result wrong\";result.textContent=\"不正解です。ヒント: チューリング（1950s）→ エキスパートシステム（1980s）→ ディープラーニング再発見（2006）→ ImageNet（2012）→ ChatGPT（2022）の順番です。もう一度並べ替えてみましょう。\"}result.style.display=\"block\"}</script></body></html>",
                "checkpoints": [
                    "5つのAIマイルストーンを正しい時系列順に並べられた",
                    "各技術がマーケティングにどう影響したかを理解した",
                    "AIブームと冬の時代のサイクルを把握した"
                ]
            }
        },
        "quiz": [
            {
                "q": "AI研究が「冬の時代」を迎えた主な理由はどれですか？",
                "options": ["AI研究者が不足したため", "計算能力やデータ量が技術の要求水準に追いつかなかったため", "政府の規制によって研究が禁止されたため", "AIへの投資家の関心が最初からなかったため"],
                "correct": 1,
                "explanation": "AIの冬の時代は主に、理論・アルゴリズムの進歩に対して計算資源やデータ量が不足していたことが原因です。現在はGPUの進化とビッグデータ蓄積によりこの障壁が解消されました。"
            },
            {
                "q": "2022年以降の生成AIブームを引き起こした最も直接的なきっかけは何ですか？",
                "options": ["Googleの検索アルゴリズム更新", "ChatGPTの一般公開", "Meta社によるFacebook広告AIの刷新", "Appleによるプライバシー規制の強化"],
                "correct": 1,
                "explanation": "2022年11月にOpenAIが公開したChatGPTが一般ユーザーに爆発的に普及し、生成AIブームの直接的なきっかけとなりました。リリース5日で100万ユーザーを突破しました。"
            },
            {
                "q": "現在のAIブームが過去のブームと異なる理由として最も適切なのはどれですか？",
                "options": ["AIアルゴリズムが初めて発明されたため", "データ量・計算能力・アルゴリズム（Transformer）の3要素が同時に揃ったため", "政府がAI研究に巨額の補助金を出したため", "量子コンピュータが実用化されたため"],
                "correct": 1,
                "explanation": "現在のAIブームが持続している理由は、ビッグデータの蓄積・GPU/TPUの進化・Transformerアーキテクチャの発明という3要素が同時に揃ったことです。過去のブームではこの条件が欠けていました。"
            }
        ],
        "summary": "# モジュール7-1 完了！\n\nAIの歴史とマーケティングへの影響を理解しました。\n\n## 習得したポイント\n\n✅ AIには過去に2度の「冬の時代」があり、現在が3度目のブームであることを説明できる\n✅ 現在のAIブームが過去と異なる理由（データ・計算能力・Transformer）を理解した\n✅ 各AI時代のマーケティング活用事例を時系列で整理できた\n✅ 「AI」という言葉が指す技術の幅広さを認識した\n\n## 次のステップ\n\n次のモジュール **「7-2: 機械学習の基礎と学習方式」** では、AIを支える中核技術「機械学習」の仕組みをマーケティング視点で解説します。\n\n> 実務チャレンジ: 自社または競合他社のWebサイトで「AI活用」と記載されている機能を1つ探し、それが上記のどの時代の技術に相当するか考えてみましょう。"
    }

    # ===== 7-2: 機械学習の基礎と学習方式 =====
    lessons[2] = {
        "intro": {
            "content": "# 「ルールを書かずに学習する」とはどういうことか\n\n従来のプログラムは人間がルールを書きます。「IF 購入金額が1万円以上 THEN ゴールド会員」というように。\n\n**機械学習**は違います。大量のデータを見せると、機械が自分でルールを発見します。\n\n## なぜマーケターが機械学習を理解する必要があるか\n\n- Google広告の「スマート入札」は機械学習\n- Meta広告の「類似オーディエンス」は機械学習\n- メールの最適な送信時間予測は機械学習\n- ECサイトの離脱予測は機械学習\n\n**あなたが毎日使っているツールの大半がすでに機械学習で動いています。** 仕組みを知ることで、ツールを正しく設定し、結果を正しく解釈できるようになります。\n\n**あなたへの問い**: 最近使った広告プラットフォームで「自動最適化」という機能を見かけましたか？それはどんな目標に向けて最適化しているでしょうか？",
            "diagram": False
        },
        "concept": {
            "content": "# 機械学習の3つの学習方式\n\n## 全体像\n\n```\n機械学習の学習方式\n├── 教師あり学習（Supervised Learning）\n│   ├── 分類: スパム判定、離脱予測\n│   └── 回帰: 売上予測、CPA予測\n├── 教師なし学習（Unsupervised Learning）\n│   ├── クラスタリング: 顧客セグメント\n│   └── 次元削減: データの可視化\n└── 強化学習（Reinforcement Learning）\n    └── 広告入札の自動最適化\n```\n\n## 教師あり学習\n\n正解データ（ラベル）付きのデータセットで学習する方式です。\n\n| 例 | 入力 | 正解ラベル |\n|----|------|------------|\n| スパム判定 | メール本文 | スパム / 非スパム |\n| CVR予測 | ユーザー行動データ | 購入した / しなかった |\n| LTV予測 | 顧客属性・購買履歴 | 6ヶ月後の累計購入金額 |\n\n**マーケでの活用**: Google広告スマート入札は「過去のCVデータ」を正解として学習し、将来のCV確率を予測しています。\n\n## 教師なし学習\n\n正解ラベルなしで、データ自体の構造・パターンを発見する方式です。\n\n**マーケでの活用**: GA4の「予測オーディエンス」、類似セグメント作成、商品のレコメンドクラスタリング。\n\n## 強化学習\n\n試行錯誤を繰り返しながら「報酬を最大化する行動」を学習する方式です。\n\n**マーケでの活用**: リアルタイムビッディング（RTB）、ダイナミックプライシング、チャットボットの応答最適化。\n\n## 機械学習が苦手なこと\n\n- 学習データにないパターンへの対応\n- データの偏りによるバイアス\n- 「なぜその判断をしたか」の説明（ブラックボックス問題）",
            "diagram": True
        },
        "exercise": {
            "type": "interactive",
            "data": {
                "content": "# 演習: マーケティング課題を機械学習の学習方式に分類しよう\n\n各マーケティング課題カードを「教師あり学習」「教師なし学習」「強化学習」の適切なカテゴリにドラッグ&ドロップで分類してください。",
                "htmlContent": "<!DOCTYPE html><html><head><meta charset=\"UTF-8\"><style>*{margin:0;padding:0;box-sizing:border-box}body{background:#0f172a;color:#e2e8f0;font-family:system-ui,sans-serif;padding:24px;min-height:100vh}.title{font-size:1.3rem;font-weight:700;margin-bottom:16px;color:#f1f5f9}.cards{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:20px;min-height:60px;padding:8px;background:#1e293b;border-radius:10px}.card{background:#334155;border:2px solid #475569;border-radius:8px;padding:10px 14px;cursor:grab;transition:all .2s;font-size:.85rem;user-select:none}.card:hover{border-color:#3b82f6;transform:translateY(-2px)}.card.dragging{opacity:.4}.categories{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:20px}.cat{background:#1e293b;border:2px solid #334155;border-radius:12px;padding:16px;min-height:200px}.cat-title{font-weight:700;font-size:.95rem;margin-bottom:4px}.cat-desc{font-size:.75rem;color:#94a3b8;margin-bottom:12px}.cat-drop{min-height:120px;border:2px dashed #334155;border-radius:8px;padding:8px;display:flex;flex-direction:column;gap:6px;transition:all .2s}.cat-drop.over{border-color:#10b981;background:rgba(16,185,129,.08)}.cat-drop .card{font-size:.8rem;padding:8px 10px}.supervised .cat-title{color:#3b82f6}.unsupervised .cat-title{color:#8b5cf6}.reinforcement .cat-title{color:#f59e0b}.btn{background:#3b82f6;color:#fff;border:none;border-radius:8px;padding:12px 28px;font-size:1rem;font-weight:600;cursor:pointer;transition:all .2s}.btn:hover{background:#2563eb}.result{margin-top:16px;padding:14px;border-radius:10px;font-weight:600;display:none}.result.correct{background:#052e16;border:2px solid #10b981;color:#10b981;display:block}.result.wrong{background:#2a0f0f;border:2px solid #ef4444;color:#ef4444;display:block}.score{margin-top:8px;font-size:.9rem;color:#94a3b8;font-weight:400}</style></head><body><div class=\"title\">マーケティング課題を学習方式に分類しよう</div><div class=\"cards\" id=\"source\"></div><div class=\"categories\"><div class=\"cat supervised\"><div class=\"cat-title\">教師あり学習</div><div class=\"cat-desc\">正解ラベル付きデータで学習</div><div class=\"cat-drop\" data-cat=\"supervised\" id=\"drop-supervised\"></div></div><div class=\"cat unsupervised\"><div class=\"cat-title\">教師なし学習</div><div class=\"cat-desc\">ラベルなしでパターン発見</div><div class=\"cat-drop\" data-cat=\"unsupervised\" id=\"drop-unsupervised\"></div></div><div class=\"cat reinforcement\"><div class=\"cat-title\">強化学習</div><div class=\"cat-desc\">試行錯誤で報酬最大化</div><div class=\"cat-drop\" data-cat=\"reinforcement\" id=\"drop-reinforcement\"></div></div></div><button class=\"btn\" onclick=\"check()\">回答を確認</button><div class=\"result\" id=\"result\"></div><script>const tasks=[{id:\"t1\",text:\"メールの開封率からCVR予測\",cat:\"supervised\"},{id:\"t2\",text:\"顧客を購買パターンでグループ分け\",cat:\"unsupervised\"},{id:\"t3\",text:\"広告入札単価のリアルタイム最適化\",cat:\"reinforcement\"},{id:\"t4\",text:\"離脱しそうなユーザーの予測\",cat:\"supervised\"},{id:\"t5\",text:\"類似コンテンツの自動クラスタリング\",cat:\"unsupervised\"},{id:\"t6\",text:\"チャットボットの応答改善\",cat:\"reinforcement\"}];const shuffled=[...tasks].sort(()=>Math.random()-.5);const src=document.getElementById(\"source\");let dragId=null;shuffled.forEach(t=>{const c=document.createElement(\"div\");c.className=\"card\";c.draggable=true;c.dataset.id=t.id;c.textContent=t.text;c.addEventListener(\"dragstart\",()=>{dragId=t.id;c.classList.add(\"dragging\")});c.addEventListener(\"dragend\",()=>c.classList.remove(\"dragging\"));src.appendChild(c)});document.querySelectorAll(\".cat-drop\").forEach(drop=>{drop.addEventListener(\"dragover\",e=>{e.preventDefault();drop.classList.add(\"over\")});drop.addEventListener(\"dragleave\",()=>drop.classList.remove(\"over\"));drop.addEventListener(\"drop\",e=>{e.preventDefault();drop.classList.remove(\"over\");const card=document.querySelector(`.card[data-id=\"${dragId}\"]`);if(card)drop.appendChild(card)})});src.addEventListener(\"dragover\",e=>e.preventDefault());src.addEventListener(\"drop\",e=>{e.preventDefault();const card=document.querySelector(`.card[data-id=\"${dragId}\"]`);if(card)src.appendChild(card)});function check(){let score=0;tasks.forEach(t=>{const card=document.querySelector(`.card[data-id=\"${t.id}\"]`);if(card&&card.parentElement){const parent=card.parentElement.dataset.cat;if(parent===t.cat){score++;card.style.borderColor=\"#10b981\"}else{card.style.borderColor=\"#ef4444\"}}});const r=document.getElementById(\"result\");if(score===6){r.className=\"result correct\";r.innerHTML=\"全問正解！教師あり学習は「正解データがある予測」、教師なし学習は「パターン発見」、強化学習は「試行錯誤の最適化」という区別が完璧です。\"}else{r.className=\"result wrong\";r.innerHTML=`${score}/6問正解です。<div class='score'>ヒント: 「予測」→教師あり、「グループ分け」→教師なし、「リアルタイム最適化」→強化学習 と考えましょう。</div>`}r.style.display=\"block\"}</script></body></html>",
                "checkpoints": [
                    "6つのマーケティング課題を3つの学習方式に正しく分類できた",
                    "教師あり・教師なし・強化学習の違いを実務例で説明できる",
                    "自社のマーケツールがどの学習方式を使っているか推測できる"
                ]
            }
        },
        "quiz": [
            {
                "q": "Google広告のスマート入札が主に使っている機械学習の方式はどれですか？",
                "options": ["教師なし学習", "教師あり学習と強化学習の組み合わせ", "クラスタリングのみ", "ルールベースAI"],
                "correct": 1,
                "explanation": "スマート入札は過去のCVデータ（正解ラベル）から学習する教師あり学習と、入札の試行錯誤で最適化する強化学習を組み合わせています。"
            },
            {
                "q": "顧客を購買行動パターンで自動的にグループ分けするのはどの学習方式ですか？",
                "options": ["教師あり学習", "強化学習", "教師なし学習（クラスタリング）", "深層学習"],
                "correct": 2,
                "explanation": "事前に「このグループ」という正解ラベルを与えず、データ自体のパターンからグループを発見するのがクラスタリング（教師なし学習）です。"
            },
            {
                "q": "機械学習モデルの精度が低い場合、最初に確認すべきことはどれですか？",
                "options": ["コンピュータのスペックを上げる", "より高価なAIサービスに乗り換える", "学習データの量と質（偏りがないか等）を確認する", "アルゴリズムを最新のものに変更する"],
                "correct": 2,
                "explanation": "機械学習の精度はアルゴリズムよりもデータの質・量に依存します。「ゴミを入れればゴミが出る（GIGO）」という原則があり、まずデータを見直すのが鉄則です。"
            }
        ],
        "summary": "# モジュール7-2 完了！\n\n機械学習の3つの学習方式とマーケティングへの適用を理解しました。\n\n## 習得したポイント\n\n✅ 教師あり学習・教師なし学習・強化学習の違いを実務例で説明できる\n✅ Google広告やGA4が内部でどの学習方式を使っているか理解した\n✅ 機械学習の精度はデータ品質に大きく依存することを認識した\n✅ マーケティング課題を適切な学習方式に分類できるようになった\n\n## 次のステップ\n\n次のモジュール **「7-3: ニューラルネットワークと深層学習」** では、機械学習の精度を飛躍的に高めた深層学習の仕組みを学びます。\n\n> 実務チャレンジ: 自社のマーケティングツールに「自動最適化」「スマート○○」「AI予測」という機能があれば、それが教師あり・教師なし・強化学習のどれに該当するか推測してみましょう。"
    }

    # ===== 7-3: ニューラルネットワークと深層学習 =====
    lessons[3] = {
        "intro": {
            "content": "# 人間の脳を模倣した「学習する仕組み」\n\nニューラルネットワークは、人間の脳の神経細胞（ニューロン）の接続を模倣した数学的モデルです。\n\nこれを多層に積み重ねたものが**深層学習（ディープラーニング）**。画像認識、音声認識、自然言語処理を飛躍的に進化させた技術です。\n\n## マーケターにとっての意味\n\n- Google広告の「自動入札」はニューラルネットワーク\n- Instagram・TikTokの「おすすめフィード」も深層学習\n- 画像生成AI（DALL-E、Midjourney）の基盤技術\n\n仕組みを知ることで、AIツールの設定を正しく行い、結果を的確に解釈できるようになります。\n\n**あなたへの問い**: 「ディープラーニング」と「機械学習」の違いを聞かれたら、どう答えますか？",
            "diagram": False
        },
        "concept": {
            "content": "# ニューラルネットワークの基本構造\n\n## 3つの層\n\n```\nニューラルネットワークの構造\n├── 入力層（Input Layer）\n│   └── データを受け取る（画像のピクセル、テキストのトークン等）\n├── 隠れ層（Hidden Layers）×N層\n│   ├── 浅い学習: 1〜2層 → 単純なパターン認識\n│   └── 深層学習: 数十〜数百層 → 複雑な特徴の抽出\n└── 出力層（Output Layer）\n    └── 予測結果を出す（分類確率、数値予測等）\n```\n\n## 深層学習が「深い」理由\n\n隠れ層を増やすほど、より複雑な特徴を段階的に学習できます。\n\n例: 画像認識の場合\n- 第1層: エッジ（線の方向）を検出\n- 第2層: テクスチャ（模様）を認識\n- 第3層: パーツ（目・鼻）を認識\n- 第4層以降: 顔全体→人物の識別\n\n## マーケティングでの具体的な活用\n\n### 広告最適化\nGoogle広告のスマート入札は、数百万パラメータのニューラルネットワークで「このユーザーがCVする確率」をリアルタイム予測しています。\n\n### 画像・動画広告の自動審査\nMeta広告のポリシー違反検出は、CNNベースの画像分類ニューラルネットワークで自動化されています。\n\n### 需要予測\nECサイトの在庫最適化に、RNN（再帰型ニューラルネットワーク）やTransformerベースの時系列予測が使われています。\n\n## 深層学習の限界\n\n- **ブラックボックス**: なぜその判断をしたか説明が難しい\n- **大量データが必要**: 少量データではうまく学習できない\n- **計算コストが高い**: 学習に高価なGPUが必要",
            "diagram": True
        },
        "exercise": {
            "type": "interactive",
            "data": {
                "content": "# 演習: ニューラルネットワークの構造を組み立てよう\n\nニューラルネットワークの各層の役割を正しい順序に並べ替え、マーケティングでの活用例とマッチングさせましょう。",
                "htmlContent": "<!DOCTYPE html><html><head><meta charset=\"UTF-8\"><style>*{margin:0;padding:0;box-sizing:border-box}body{background:#0f172a;color:#e2e8f0;font-family:system-ui,sans-serif;padding:24px;min-height:100vh}.title{font-size:1.3rem;font-weight:700;margin-bottom:6px}.desc{color:#94a3b8;font-size:.9rem;margin-bottom:20px}.section{margin-bottom:24px}.section-title{font-size:.85rem;color:#8b5cf6;font-weight:600;margin-bottom:10px;text-transform:uppercase;letter-spacing:.05em}.match-row{display:flex;gap:12px;margin-bottom:10px;align-items:center}.match-left{background:#1e293b;border:2px solid #334155;border-radius:8px;padding:12px;flex:1;font-size:.9rem}.match-right{flex:1}.match-select{width:100%;background:#1e293b;border:2px solid #334155;border-radius:8px;padding:12px;color:#e2e8f0;font-size:.9rem;cursor:pointer}.match-select:focus{border-color:#3b82f6;outline:none}.arrow{color:#475569;font-size:1.2rem;min-width:30px;text-align:center}.btn{background:#3b82f6;color:#fff;border:none;border-radius:8px;padding:12px 28px;font-size:1rem;font-weight:600;cursor:pointer;transition:all .2s}.btn:hover{background:#2563eb}.result{margin-top:16px;padding:14px;border-radius:10px;font-weight:600;display:none}.result.correct{background:#052e16;border:2px solid #10b981;color:#10b981;display:block}.result.wrong{background:#2a0f0f;border:2px solid #ef4444;color:#ef4444;display:block}</style></head><body><div class=\"title\">ニューラルネットワークの層と活用例マッチング</div><div class=\"desc\">左の説明に対して、右のドロップダウンから正しい選択肢を選んでください</div><div class=\"section\"><div class=\"section-title\">各層の役割</div><div class=\"match-row\"><div class=\"match-left\">データ（画像・テキスト等）を受け取る最初の層</div><div class=\"arrow\">→</div><div class=\"match-right\"><select class=\"match-select\" id=\"q1\"><option value=\"\">選択してください</option><option value=\"input\">入力層</option><option value=\"hidden\">隠れ層</option><option value=\"output\">出力層</option></select></div></div><div class=\"match-row\"><div class=\"match-left\">データの特徴を段階的に抽出する中間層</div><div class=\"arrow\">→</div><div class=\"match-right\"><select class=\"match-select\" id=\"q2\"><option value=\"\">選択してください</option><option value=\"input\">入力層</option><option value=\"hidden\">隠れ層</option><option value=\"output\">出力層</option></select></div></div><div class=\"match-row\"><div class=\"match-left\">予測結果（分類確率や数値）を出す最後の層</div><div class=\"arrow\">→</div><div class=\"match-right\"><select class=\"match-select\" id=\"q3\"><option value=\"\">選択してください</option><option value=\"input\">入力層</option><option value=\"hidden\">隠れ層</option><option value=\"output\">出力層</option></select></div></div></div><div class=\"section\"><div class=\"section-title\">マーケティング活用</div><div class=\"match-row\"><div class=\"match-left\">「この広告画像はポリシー違反か？」を自動判定</div><div class=\"arrow\">→</div><div class=\"match-right\"><select class=\"match-select\" id=\"q4\"><option value=\"\">選択してください</option><option value=\"cnn\">CNN（画像認識）</option><option value=\"rnn\">RNN（時系列予測）</option><option value=\"transformer\">Transformer（言語処理）</option></select></div></div><div class=\"match-row\"><div class=\"match-left\">「来月のEC売上はいくらか？」を時系列データから予測</div><div class=\"arrow\">→</div><div class=\"match-right\"><select class=\"match-select\" id=\"q5\"><option value=\"\">選択してください</option><option value=\"cnn\">CNN（画像認識）</option><option value=\"rnn\">RNN（時系列予測）</option><option value=\"transformer\">Transformer（言語処理）</option></select></div></div><div class=\"match-row\"><div class=\"match-left\">「自然言語からSQL文を自動生成する」LLMの基盤技術</div><div class=\"arrow\">→</div><div class=\"match-right\"><select class=\"match-select\" id=\"q6\"><option value=\"\">選択してください</option><option value=\"cnn\">CNN（画像認識）</option><option value=\"rnn\">RNN（時系列予測）</option><option value=\"transformer\">Transformer（言語処理）</option></select></div></div></div><button class=\"btn\" onclick=\"check()\">回答を確認</button><div class=\"result\" id=\"result\"></div><script>function check(){const answers={q1:\"input\",q2:\"hidden\",q3:\"output\",q4:\"cnn\",q5:\"rnn\",q6:\"transformer\"};let score=0;const total=6;Object.entries(answers).forEach(([id,correct])=>{const sel=document.getElementById(id);if(sel.value===correct){score++;sel.style.borderColor=\"#10b981\"}else{sel.style.borderColor=\"#ef4444\"}});const r=document.getElementById(\"result\");if(score===total){r.className=\"result correct\";r.textContent=\"全問正解！ニューラルネットワークの構造と、CNN・RNN・Transformerの使い分けを正しく理解しています。\"}else{r.className=\"result wrong\";r.textContent=`${score}/${total}問正解です。入力→隠れ→出力の流れと、画像=CNN、時系列=RNN、言語=Transformerという対応を覚えましょう。`}r.style.display=\"block\"}</script></body></html>",
                "checkpoints": [
                    "入力層・隠れ層・出力層の役割を正しくマッチングできた",
                    "CNN・RNN・Transformerの用途を区別できた",
                    "マーケティング課題に適したネットワーク構造を選択できる"
                ]
            }
        },
        "quiz": [
            {
                "q": "深層学習が「深い」とされる理由はどれですか？",
                "options": ["データ量が多いから", "隠れ層が多層に積み重なっているから", "計算速度が速いから", "プログラムのコードが長いから"],
                "correct": 1,
                "explanation": "深層学習（ディープラーニング）の「ディープ」は隠れ層が深く（多層に）積み重なっていることを指します。層が深いほど複雑な特徴を段階的に学習できます。"
            },
            {
                "q": "広告画像のポリシー違反自動検出に最も適したニューラルネットワークはどれですか？",
                "options": ["RNN（再帰型ニューラルネットワーク）", "CNN（畳み込みニューラルネットワーク）", "全結合ニューラルネットワーク", "GAN（敵対的生成ネットワーク）"],
                "correct": 1,
                "explanation": "CNN（Convolutional Neural Network）は画像の特徴を階層的に抽出することに特化しており、画像分類・物体検出のタスクで圧倒的な性能を発揮します。"
            },
            {
                "q": "深層学習の主な課題として適切でないものはどれですか？",
                "options": ["大量のデータが必要", "計算コストが高い", "日本語に対応できない", "判断理由の説明が難しい（ブラックボックス）"],
                "correct": 2,
                "explanation": "深層学習は言語に依存しません。日本語でも英語でも学習可能です。主な課題はデータ量の必要性、計算コスト、ブラックボックス性の3つです。"
            }
        ],
        "summary": "# モジュール7-3 完了！\n\nニューラルネットワークと深層学習の基本を理解しました。\n\n## 習得したポイント\n\n✅ ニューラルネットワークの3層構造（入力・隠れ・出力）を説明できる\n✅ CNN・RNN・Transformerの用途の違いを理解した\n✅ 深層学習がマーケティングツールの内部でどう使われているか把握した\n✅ 深層学習の限界（データ量・コスト・ブラックボックス）を認識した\n\n## 次のステップ\n\n次のモジュール **「7-4: NLP・画像認識・マルチモーダルAI」** では、テキスト・画像・音声を横断するAI技術の実務活用を学びます。\n\n> 実務チャレンジ: 自社で使っている画像関連ツール（Canva AI、Adobe Firefly等）がCNNベースの技術を使っていることを意識して、次に画像を生成する際にその仕組みを思い出してみましょう。"
    }

    # ===== 7-4 〜 7-50 は以下に定義 =====

    lessons[4] = {
        "intro": {
            "content": "# テキスト・画像・音声を横断するAI技術\n\nAIが扱える「入力」は年々広がっています。テキストだけでなく、画像、音声、動画、さらにはこれらを組み合わせた**マルチモーダルAI**が実用化されています。\n\n## マーケターの日常にあるNLP・画像認識\n\n- **NLP（自然言語処理）**: チャットボット、感情分析、SEOツール\n- **画像認識**: 広告クリエイティブの自動審査、商品画像検索\n- **音声認識**: 音声検索最適化、コールセンター分析\n\nこれらの技術がどう動いているかを知ることで、ツール選定と活用の精度が上がります。\n\n**あなたへの問い**: Google検索で画像をアップロードして検索したことはありますか？あれはどんなAI技術が動いているでしょうか？",
            "diagram": False
        },
        "concept": {
            "content": "# NLP・画像認識・マルチモーダルAI\n\n## NLP（自然言語処理）\n\n```\nNLPの主要タスク\n├── テキスト分類: スパム判定、感情分析\n├── 固有表現抽出: 人名・企業名・日付の検出\n├── 要約: 長文の自動要約\n├── 翻訳: 多言語対応\n├── 質問応答: FAQ自動回答\n└── テキスト生成: コンテンツ作成（LLMの中核）\n```\n\n**マーケ活用例**: SNS投稿の感情分析でブランド評判をリアルタイム監視。否定的な投稿を自動検出してアラート。\n\n## 画像認識\n\n- **画像分類**: 「この写真は食品/衣料品/家電」\n- **物体検出**: 画像内の特定アイテムの位置特定\n- **画像生成**: テキストから画像を生成（DALL-E, Midjourney）\n\n**マーケ活用例**: ECサイトで「この商品に似た商品」をビジュアル類似度で推薦。広告クリエイティブの自動A/Bテスト。\n\n## マルチモーダルAI\n\n複数の入力形式（テキスト+画像、テキスト+音声等）を同時に処理できるAI。\n\n**代表モデル**: GPT-4o、Claude 3.5（Vision）、Gemini\n\n**マーケ活用例**:\n- 競合サイトのスクリーンショットをAIに読み込ませてUI分析\n- 商品画像+説明文を同時に入力して広告コピーを自動生成\n- 会議録音+ホワイトボード写真から議事録を自動作成\n\n## 使い分けのポイント\n\n| 入力データ | 技術 | マーケ活用 |\n|-----------|------|----------|\n| テキストのみ | NLP | 感情分析、SEO、チャットボット |\n| 画像のみ | 画像認識 | 広告審査、商品検索 |\n| テキスト+画像 | マルチモーダル | クリエイティブ分析、レポート生成 |",
            "diagram": True
        },
        "exercise": {
            "type": "interactive",
            "data": {
                "content": "# 演習: マーケティング課題に最適なAI技術を選択しよう\n\n各マーケティング課題に対して、NLP・画像認識・マルチモーダルAIのどれが最適かを選択してください。",
                "htmlContent": "<!DOCTYPE html><html><head><meta charset=\"UTF-8\"><style>*{margin:0;padding:0;box-sizing:border-box}body{background:#0f172a;color:#e2e8f0;font-family:system-ui,sans-serif;padding:24px;min-height:100vh}.title{font-size:1.3rem;font-weight:700;margin-bottom:16px}.quiz-item{background:#1e293b;border:2px solid #334155;border-radius:10px;padding:16px;margin-bottom:12px;transition:border-color .3s}.quiz-item .q{font-weight:600;margin-bottom:12px;font-size:.95rem}.options{display:flex;gap:8px;flex-wrap:wrap}.opt{background:#334155;border:2px solid #475569;border-radius:8px;padding:10px 16px;cursor:pointer;transition:all .2s;font-size:.85rem}.opt:hover{border-color:#3b82f6}.opt.selected{border-color:#3b82f6;background:#1e3a5f}.opt.correct{border-color:#10b981;background:#052e16}.opt.wrong{border-color:#ef4444;background:#2a0f0f}.btn{background:#3b82f6;color:#fff;border:none;border-radius:8px;padding:12px 28px;font-size:1rem;font-weight:600;cursor:pointer;margin-top:8px}.btn:hover{background:#2563eb}.result{margin-top:16px;padding:14px;border-radius:10px;font-weight:600;display:none}.feedback{margin-top:8px;font-size:.8rem;color:#94a3b8;display:none}</style></head><body><div class=\"title\">マーケティング課題 × AI技術マッチング</div><div id=\"questions\"></div><button class=\"btn\" onclick=\"check()\">回答を確認</button><div class=\"result\" id=\"result\"></div><script>const qs=[{q:\"SNS上の自社ブランドへの言及を自動で肯定/否定/中立に分類したい\",opts:[\"NLP（自然言語処理）\",\"画像認識\",\"マルチモーダルAI\"],ans:0,exp:\"テキストの感情分析はNLPの代表的タスクです\"},{q:\"ECサイトで商品写真から類似商品を自動レコメンドしたい\",opts:[\"NLP（自然言語処理）\",\"画像認識\",\"マルチモーダルAI\"],ans:1,exp:\"画像の類似度計算は画像認識（CNN）の得意分野です\"},{q:\"競合サイトのスクリーンショット+URLを入力してUI/UXの改善点を分析したい\",opts:[\"NLP（自然言語処理）\",\"画像認識\",\"マルチモーダルAI\"],ans:2,exp:\"画像とテキストを同時に分析するにはマルチモーダルAIが必要です\"},{q:\"カスタマーレビューから頻出キーワードと評価傾向を抽出したい\",opts:[\"NLP（自然言語処理）\",\"画像認識\",\"マルチモーダルAI\"],ans:0,exp:\"テキストからのキーワード抽出・感情分析はNLPの基本タスクです\"},{q:\"Instagram投稿の画像+キャプションを分析してトレンドを発見したい\",opts:[\"NLP（自然言語処理）\",\"画像認識\",\"マルチモーダルAI\"],ans:2,exp:\"画像とテキスト両方の分析が必要なためマルチモーダルAIが最適です\"}];const container=document.getElementById(\"questions\");const selections=new Array(qs.length).fill(-1);qs.forEach((q,i)=>{const div=document.createElement(\"div\");div.className=\"quiz-item\";div.id=\"qi-\"+i;div.innerHTML=`<div class=\"q\">${i+1}. ${q.q}</div><div class=\"options\">${q.opts.map((o,j)=>`<div class=\"opt\" data-q=\"${i}\" data-o=\"${j}\" onclick=\"sel(${i},${j})\">${o}</div>`).join(\"\")}</div><div class=\"feedback\" id=\"fb-${i}\"></div>`;container.appendChild(div)});function sel(qi,oi){selections[qi]=oi;document.querySelectorAll(`[data-q=\"${qi}\"]`).forEach(el=>{el.className=el.dataset.o==oi?\"opt selected\":\"opt\"})}function check(){let score=0;qs.forEach((q,i)=>{const fb=document.getElementById(\"fb-\"+i);document.querySelectorAll(`[data-q=\"${i}\"]`).forEach(el=>{const oi=parseInt(el.dataset.o);if(oi===q.ans)el.className=\"opt correct\";else if(oi===selections[i])el.className=\"opt wrong\";else el.className=\"opt\"});fb.textContent=q.exp;fb.style.display=\"block\";if(selections[i]===q.ans)score++});const r=document.getElementById(\"result\");r.style.display=\"block\";r.style.background=score>=4?\"#052e16\":\"#2a0f0f\";r.style.border=score>=4?\"2px solid #10b981\":\"2px solid #ef4444\";r.style.color=score>=4?\"#10b981\":\"#ef4444\";r.textContent=`${score}/${qs.length}問正解！${score>=4?\"AI技術の使い分けを正しく理解しています。\":\"テキスト=NLP、画像=画像認識、複合入力=マルチモーダルという基準で考えましょう。\"}`}</script></body></html>",
                "checkpoints": [
                    "NLP・画像認識・マルチモーダルAIの適用場面を区別できた",
                    "マーケティング課題に対して最適なAI技術を選択できた",
                    "マルチモーダルAIが必要なケースを判断できる"
                ]
            }
        },
        "quiz": [
            {
                "q": "SNS投稿の感情分析（ポジティブ/ネガティブ判定）に最も適した技術はどれですか？",
                "options": ["画像認識", "NLP（自然言語処理）", "音声合成", "マルチモーダルAI"],
                "correct": 1,
                "explanation": "テキストの感情分析はNLP（自然言語処理）の代表的なタスクです。BERT等の事前学習モデルにより高精度な感情分類が可能になっています。"
            },
            {
                "q": "マルチモーダルAIの特徴として最も正確なものはどれですか？",
                "options": ["テキストのみを超高速に処理する", "複数の入力形式（テキスト+画像等）を同時に理解・処理できる", "画像のみを3D変換できる", "音声のみを多言語翻訳できる"],
                "correct": 1,
                "explanation": "マルチモーダルAIは複数のモダリティ（テキスト、画像、音声等）を同時に入力として受け取り、横断的に理解・処理できることが特徴です。"
            },
            {
                "q": "ECサイトで「この商品に似た商品」を画像ベースでレコメンドする場合に使う技術は？",
                "options": ["NLPによるテキスト類似度", "CNNによる画像特徴量の類似度計算", "RNNによる時系列予測", "強化学習による最適化"],
                "correct": 1,
                "explanation": "画像の類似度計算にはCNN（畳み込みニューラルネットワーク）で画像の特徴量ベクトルを抽出し、ベクトル間の距離（コサイン類似度等）を計算します。"
            }
        ],
        "summary": "# モジュール7-4 完了！\n\nNLP・画像認識・マルチモーダルAIの概要と使い分けを理解しました。\n\n## 習得したポイント\n\n✅ NLPの主要タスク（感情分析・要約・翻訳等）をマーケ実務に結びつけられる\n✅ 画像認識がEC・広告審査でどう活用されているか把握した\n✅ マルチモーダルAIが「複数入力の同時処理」であることを理解した\n✅ 課題に応じてNLP/画像認識/マルチモーダルを使い分けられる\n\n## 次のステップ\n\n次のモジュール **「7-5: 生成AI（Generative AI）の登場と衝撃」** では、テキスト・画像・動画を生成するAI技術のインパクトを学びます。\n\n> 実務チャレンジ: GPT-4oやClaudeに競合サイトのスクリーンショットをアップロードして、UI/UXの改善点を分析させてみましょう。マルチモーダルAIの実力を体感できます。"
    }

    # 7-5〜7-50: 残りのモジュールを定義
    # 以降は generate_lesson_content 関数で動的生成

    return lessons.get(num)


def generate_lesson_content(num: int, title: str, difficulty: str) -> dict:
    """モジュール7-5〜7-50のコンテンツを動的生成"""

    # 各モジュールの教材データ
    content_map = {
        5: {
            "intro": "# テキスト・画像・動画を「作る」AIの登場\n\n2022年は「生成AI元年」と呼ばれます。ChatGPTが5日で100万ユーザーを突破し、Midjourneyが絵を描き、AIが動画を生成する時代が始まりました。\n\n## マーケターへの直接的なインパクト\n\n- **コンテンツ制作コストが1/10に**: ブログ記事、広告コピー、SNS投稿の下書き\n- **クリエイティブの民主化**: デザイナーでなくても高品質な画像生成が可能\n- **パーソナライゼーションの加速**: 個別最適化されたメッセージの大量生成\n\n生成AIは「便利なツール」ではなく、マーケティングの仕事の仕方そのものを変える技術です。\n\n**あなたへの問い**: 生成AIにコンテンツを作らせるとき、最も気をつけるべきリスクは何だと思いますか？",
            "concept": "# 生成AIの全体像\n\n## 生成AIの種類と代表モデル\n\n```\n生成AIの分類\n├── テキスト生成\n│   ├── ChatGPT（OpenAI）\n│   ├── Claude（Anthropic）\n│   └── Gemini（Google）\n├── 画像生成\n│   ├── DALL-E 3（OpenAI）\n│   ├── Midjourney\n│   └── Stable Diffusion（オープンソース）\n├── 動画生成\n│   ├── Sora（OpenAI）\n│   └── Runway\n├── 音声生成\n│   ├── ElevenLabs\n│   └── VALL-E（Microsoft）\n└── コード生成\n    ├── GitHub Copilot\n    └── Claude Code\n```\n\n## マーケティングへの衝撃\n\n### コンテンツ制作の変革\n従来: 企画→取材→執筆→校正 = 2週間\n生成AI活用: 企画→AI下書き→人間が編集・校正 = 2日\n\n### 広告クリエイティブの革命\n- 1つのコンセプトから数十パターンのコピーを瞬時に生成\n- ターゲット別にトーン・表現を自動最適化\n- A/Bテストのバリエーションを大量作成\n\n### パーソナライゼーション\n- 顧客セグメントごとにカスタマイズされたメール文面\n- 個別の閲覧履歴に基づくレコメンド文言の生成\n\n## 生成AIの限界とリスク\n\n| リスク | 内容 | 対策 |\n|-------|------|------|\n| ハルシネーション | 事実と異なる情報を生成 | ファクトチェック必須 |\n| 著作権問題 | 学習データの権利関係 | 商用利用の確認 |\n| ブランドリスク | トーンの不一致 | ブランドガイドライン指定 |\n| 均質化 | 似たようなコンテンツの氾濫 | 人間の視点・経験を付加 |",
            "concept_diagram": True,
            "exercise_type": "interactive",
            "exercise_content": "# 演習: 生成AIの活用シーンとリスクを整理しよう\n\n各生成AI活用シーンに対して、最も注意すべきリスクをマッチングさせてください。",
            "exercise_html": "<!DOCTYPE html><html><head><meta charset=\"UTF-8\"><style>*{margin:0;padding:0;box-sizing:border-box}body{background:#0f172a;color:#e2e8f0;font-family:system-ui,sans-serif;padding:24px;min-height:100vh}.title{font-size:1.3rem;font-weight:700;margin-bottom:16px}.item{background:#1e293b;border:2px solid #334155;border-radius:10px;padding:14px;margin-bottom:10px;display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap}.item .scene{flex:1;min-width:200px;font-size:.9rem}.item select{background:#334155;border:2px solid #475569;border-radius:8px;padding:10px;color:#e2e8f0;font-size:.85rem;min-width:180px}.item select:focus{border-color:#3b82f6;outline:none}.btn{background:#3b82f6;color:#fff;border:none;border-radius:8px;padding:12px 28px;font-size:1rem;font-weight:600;cursor:pointer;margin-top:12px}.btn:hover{background:#2563eb}.result{margin-top:16px;padding:14px;border-radius:10px;font-weight:600;display:none}</style></head><body><div class=\"title\">生成AI活用シーン × リスクマッチング</div><div id=\"items\"></div><button class=\"btn\" onclick=\"check()\">回答を確認</button><div class=\"result\" id=\"result\"></div><script>const data=[{scene:\"AIでSEO記事を大量生成してブログに公開\",risk:\"quality\",label:\"品質低下・均質化リスク\"},{scene:\"AIで医療・金融の専門記事を生成\",risk:\"hallucination\",label:\"ハルシネーション（事実誤認）\"},{scene:\"AIで生成した画像を商用広告に使用\",risk:\"copyright\",label:\"著作権・肖像権リスク\"},{scene:\"AIでブランドのSNS投稿を自動生成\",risk:\"brand\",label:\"ブランドトーン不一致\"}];const risks=[{v:\"hallucination\",l:\"ハルシネーション（事実誤認）\"},{v:\"copyright\",l:\"著作権・肖像権リスク\"},{v:\"brand\",l:\"ブランドトーン不一致\"},{v:\"quality\",l:\"品質低下・均質化リスク\"}];const container=document.getElementById(\"items\");data.forEach((d,i)=>{const div=document.createElement(\"div\");div.className=\"item\";div.innerHTML=`<div class=\"scene\">${d.scene}</div><select id=\"s${i}\"><option value=\"\">リスクを選択</option>${risks.map(r=>`<option value=\"${r.v}\">${r.l}</option>`).join(\"\")}</select>`;container.appendChild(div)});function check(){let score=0;data.forEach((d,i)=>{const sel=document.getElementById(\"s\"+i);if(sel.value===d.risk){score++;sel.style.borderColor=\"#10b981\"}else sel.style.borderColor=\"#ef4444\"});const r=document.getElementById(\"result\");r.style.display=\"block\";const ok=score===data.length;r.style.background=ok?\"#052e16\":\"#2a0f0f\";r.style.border=ok?\"2px solid #10b981\":\"2px solid #ef4444\";r.style.color=ok?\"#10b981\":\"#ef4444\";r.textContent=ok?\"全問正解！生成AIの活用には常にリスク管理が伴うことを理解しています。\":`${score}/${data.length}問正解。専門記事=ハルシネーション、画像=著作権、SNS=ブランドトーン、大量生成=均質化と覚えましょう。`}</script></body></html>",
            "exercise_checkpoints": ["生成AIの4つの主要リスクを特定できた", "活用シーンごとの注意点を理解した", "リスク軽減策を説明できる"],
            "quiz": [
                {"q": "生成AIの「ハルシネーション」とは何ですか？", "options": ["画像がぼやけること", "事実と異なる情報をもっともらしく生成すること", "処理速度が遅くなること", "著作権のある画像を生成すること"], "correct": 1, "explanation": "ハルシネーション（幻覚）とは、AIが実在しない事実や誤った情報をもっともらしく生成する現象です。特にファクトチェックなしで公開すると重大な問題になります。"},
                {"q": "生成AIがマーケティングのコンテンツ制作を変えた最大のポイントは？", "options": ["コンテンツの質が人間を完全に超えた", "制作のスピードとコストが劇的に改善された", "人間のライターが不要になった", "SEOランキングが自動的に上がるようになった"], "correct": 1, "explanation": "生成AIの最大の価値は制作スピードとコストの改善です。ただし人間による編集・校正・ファクトチェックは引き続き必要であり、人間のライターが不要になったわけではありません。"},
                {"q": "生成AI活用で「均質化リスク」が指摘される理由はどれですか？", "options": ["AIの計算速度が遅いため", "多くの企業が同じAIで同じようなコンテンツを生成するため", "AIが古い情報しか持っていないため", "生成AIが1つのモデルしかないため"], "correct": 1, "explanation": "多くの企業が同じLLMを使って同じような指示でコンテンツを作ると、似たような表現・構成のコンテンツが大量に生まれます。差別化には人間の独自視点や経験の付加が必要です。"}
            ],
            "summary": "# モジュール7-5 完了！\n\n生成AIの種類・インパクト・リスクを包括的に理解しました。\n\n## 習得したポイント\n\n✅ テキスト・画像・動画・音声の各生成AI技術と代表モデルを把握した\n✅ マーケティングのコンテンツ制作がどう変わったかを具体的に説明できる\n✅ ハルシネーション・著作権・ブランドリスク・均質化の4大リスクを理解した\n✅ リスクを軽減しながら生成AIを活用する方針を立てられる\n\n## 次のステップ\n\n次のモジュール **「7-6: LLM（大規模言語モデル）の仕組み」** では、生成AIの中核技術であるLLMのTransformerアーキテクチャを学びます。\n\n> 実務チャレンジ: 自社のブログ記事1本を、ChatGPTまたはClaudeで下書き生成してみましょう。かかった時間と通常の制作時間を比較してください。"
        },
        6: {
            "intro": "# マーケターが知るべきLLMの「中身」\n\nLLM（Large Language Model = 大規模言語モデル）は、ChatGPTやClaudeの基盤技術です。数千億のパラメータで「次に来る単語を予測する」ことで、人間のような文章を生成します。\n\n## なぜ仕組みを知る必要があるか\n\n- **プロンプトの書き方が変わる**: LLMの仕組みを知ると、なぜ特定の書き方が効果的かがわかる\n- **コスト最適化ができる**: トークンの仕組みを理解すればAPI費用を削減できる\n- **限界を正しく理解できる**: LLMが「嘘をつく」理由がわかればリスク管理ができる\n\n**あなたへの問い**: ChatGPTに「日本で2番目に高い山は？」と聞くと正しく答えますが、これはChatGPTが「知識を持っている」のでしょうか、それとも別の仕組みでしょうか？",
            "concept": "# LLMの仕組み: Transformerアーキテクチャ\n\n## LLMの基本原理: 「次の単語予測」\n\nLLMの本質は驚くほどシンプルです。\n\n```\n入力: 「東京の人口は約」\n予測: 「1400」→「万」→「人」→「です」→「。」\n\nLLMは膨大なテキストから\n「この文脈の次に来る確率が最も高い単語」\nを繰り返し予測しているだけ\n```\n\n## Transformerの革命（2017年）\n\nGoogleが発表した論文「Attention is All You Need」で提案されたアーキテクチャ。\n\n### Self-Attention（自己注意機構）\n文章中の各単語が他の全単語との関連性を計算します。\n\n例: 「銀行の**口座**を開設した」\n→ 「口座」は「銀行」と強い関連、「開設」とも関連\n→ 文脈に応じて「bank（銀行）」と「bank（土手）」を区別\n\n### なぜ革命的か\n- **並列処理が可能**: 従来のRNNは逐次処理だったが、Transformerは全単語を同時処理\n- **長い文脈を記憶**: Self-Attentionで遠くの単語との関係も把握\n- **スケーラビリティ**: パラメータを増やすほど性能が向上する（スケーリング則）\n\n## LLMの学習プロセス\n\n| フェーズ | 内容 | コスト |\n|---------|------|--------|\n| 事前学習 | インターネット上の大量テキストで次の単語予測 | 数億〜数十億円 |\n| 微調整（Fine-tuning） | 特定タスク向けにデータで追加学習 | 数万〜数百万円 |\n| RLHF | 人間のフィードバックで出力品質を向上 | 数千万円 |\n\n## マーケターへの示唆\n\n- LLMは「知識を持っている」のではなく「統計的に最もあり得る続きを生成する」\n- だからハルシネーション（もっともらしい嘘）が発生する\n- プロンプトに文脈を与えるほど、予測精度が向上する",
            "concept_diagram": True,
            "exercise_type": "interactive",
            "exercise_content": "# 演習: LLMの仕組みを穴埋めで確認しよう\n\nLLMの動作原理に関する文章の空欄を、ドロップダウンから正しい選択肢を選んで埋めてください。",
            "exercise_html": "<!DOCTYPE html><html><head><meta charset=\"UTF-8\"><style>*{margin:0;padding:0;box-sizing:border-box}body{background:#0f172a;color:#e2e8f0;font-family:system-ui,sans-serif;padding:24px;min-height:100vh}.title{font-size:1.3rem;font-weight:700;margin-bottom:16px}.passage{background:#1e293b;border-radius:12px;padding:20px;line-height:2;font-size:.95rem;margin-bottom:16px}.blank{display:inline-block;min-width:140px;vertical-align:middle}.blank select{background:#334155;border:2px solid #475569;border-radius:6px;padding:6px 10px;color:#e2e8f0;font-size:.85rem}.blank select:focus{border-color:#3b82f6;outline:none}.btn{background:#3b82f6;color:#fff;border:none;border-radius:8px;padding:12px 28px;font-size:1rem;font-weight:600;cursor:pointer}.btn:hover{background:#2563eb}.result{margin-top:16px;padding:14px;border-radius:10px;font-weight:600;display:none}</style></head><body><div class=\"title\">LLMの仕組み穴埋めクイズ</div><div class=\"passage\"><p>LLMの基本原理は、文脈から<span class=\"blank\"><select id=\"b1\"><option value=\"\">---</option><option value=\"next\">次に来る単語を予測する</option><option value=\"all\">全ての単語を暗記する</option><option value=\"search\">データベースを検索する</option></select></span>ことです。</p><br><p>2017年にGoogleが発表した<span class=\"blank\"><select id=\"b2\"><option value=\"\">---</option><option value=\"transformer\">Transformer</option><option value=\"cnn\">CNN</option><option value=\"rnn\">RNN</option></select></span>アーキテクチャが、現在のLLMの基盤になっています。</p><br><p>その中核技術である<span class=\"blank\"><select id=\"b3\"><option value=\"\">---</option><option value=\"attention\">Self-Attention</option><option value=\"backprop\">バックプロパゲーション</option><option value=\"pooling\">プーリング</option></select></span>は、文章中の各単語が他の全単語との関連性を計算する仕組みです。</p><br><p>LLMが事実と異なる情報をもっともらしく生成する現象を<span class=\"blank\"><select id=\"b4\"><option value=\"\">---</option><option value=\"hallucination\">ハルシネーション</option><option value=\"overfitting\">過学習</option><option value=\"underfitting\">未学習</option></select></span>と呼びます。</p><br><p>LLMの性能を人間の好みに合わせて向上させるプロセスを<span class=\"blank\"><select id=\"b5\"><option value=\"\">---</option><option value=\"rlhf\">RLHF</option><option value=\"etl\">ETL</option><option value=\"cicd\">CI/CD</option></select></span>と呼びます。</p></div><button class=\"btn\" onclick=\"check()\">回答を確認</button><div class=\"result\" id=\"result\"></div><script>function check(){const ans={b1:\"next\",b2:\"transformer\",b3:\"attention\",b4:\"hallucination\",b5:\"rlhf\"};let s=0;Object.entries(ans).forEach(([id,v])=>{const el=document.getElementById(id);if(el.value===v){s++;el.style.borderColor=\"#10b981\"}else el.style.borderColor=\"#ef4444\"});const r=document.getElementById(\"result\");r.style.display=\"block\";const ok=s===5;r.style.background=ok?\"#052e16\":\"#2a0f0f\";r.style.border=ok?\"2px solid #10b981\":\"2px solid #ef4444\";r.style.color=ok?\"#10b981\":\"#ef4444\";r.textContent=ok?\"全問正解！LLMの仕組みを正しく理解しています。\":`${s}/5問正解。LLMは「次の単語予測」が本質で、TransformerのSelf-Attentionが中核技術です。`}</script></body></html>",
            "exercise_checkpoints": ["LLMの基本原理（次の単語予測）を理解した", "Transformerとself-Attentionの役割を把握した", "ハルシネーションが起きる理由を説明できる"],
            "quiz": [
                {"q": "LLMの基本的な動作原理はどれですか？", "options": ["インターネットをリアルタイムで検索する", "文脈から次に来る確率が最も高い単語を予測する", "事前にプログラムされたルールに従う", "データベースからキーワードで検索する"], "correct": 1, "explanation": "LLMの本質は「次の単語予測」です。膨大なテキストデータから学習した統計的パターンに基づき、与えられた文脈の次に来る確率が最も高い単語を繰り返し生成します。"},
                {"q": "Transformerアーキテクチャの中核技術「Self-Attention」の役割は？", "options": ["画像のピクセルを分析する", "文章中の各単語が他の全単語との関連性を計算する", "音声をテキストに変換する", "データを圧縮して保存する"], "correct": 1, "explanation": "Self-Attention（自己注意機構）は、文章中の各単語が他の全ての単語との関連度を計算し、文脈に応じた意味を理解する仕組みです。これにより長い文脈の把握が可能になりました。"},
                {"q": "LLMの学習プロセスで最もコストがかかるフェーズはどれですか？", "options": ["プロンプト設計", "事前学習（Pre-training）", "ユーザーからの質問応答", "APIキーの発行"], "correct": 1, "explanation": "事前学習はインターネット上の膨大なテキストデータで行われ、数千台のGPUを数ヶ月稼働させるため、コストは数億〜数十億円に達します。"}
            ],
            "summary": "# モジュール7-6 完了！\n\nLLMの仕組みとTransformerアーキテクチャの概要を理解しました。\n\n## 習得したポイント\n\n✅ LLMが「次の単語予測」の繰り返しで文章を生成していることを理解した\n✅ TransformerのSelf-Attentionが文脈理解の鍵であることを把握した\n✅ ハルシネーションがなぜ起きるかを仕組みから説明できる\n✅ 事前学習→微調整→RLHFの学習プロセスを理解した\n\n## 次のステップ\n\n次のモジュール **「7-7: トークンとコンテキストウィンドウ」** では、LLMのコスト計算とプロンプト設計に直結する基礎知識を学びます。\n\n> 実務チャレンジ: ChatGPTやClaudeに長い文脈を与えた場合と短い文脈を与えた場合で、回答の質がどう変わるか実験してみましょう。"
        },
    }

    # 7-7〜7-50のコンテンツ定義（簡潔に）
    if num not in content_map:
        return _generate_generic_lesson(num, title, difficulty)

    data = content_map[num]
    return data


def _generate_generic_lesson(num: int, title: str, difficulty: str) -> dict:
    """7-7以降のモジュールをパターンベースで生成"""
    # このヘルパー関数は呼び出し元のbuild_full_lessonで使う
    return None  # build_full_lessonでハンドリング


def build_full_lesson(num: int, title: str, difficulty: str, minutes: int) -> dict:
    """完全なレッスンJSONオブジェクトを構築"""

    # 7-1〜7-4は build_lesson で定義済み
    lesson_data = build_lesson(num, title, difficulty, minutes)
    if lesson_data is not None:
        data = lesson_data
        sections = []

        # intro
        sections.append({
            "type": "intro",
            "data": {
                "content": data["intro"]["content"],
                "diagram": data["intro"].get("diagram", False)
            }
        })

        # concept
        sections.append({
            "type": "concept",
            "data": {
                "content": data["concept"]["content"],
                "diagram": data["concept"].get("diagram", False)
            }
        })

        # exercise
        if data["exercise"]["type"] == "interactive":
            sections.append({
                "type": "exercise",
                "data": {
                    "type": "interactive",
                    "data": data["exercise"]["data"]
                }
            })
        else:
            sections.append({
                "type": "exercise",
                "data": data["exercise"]["data"]
            })

        # quiz
        sections.append({
            "type": "quiz",
            "data": {
                "questions": data["quiz"]
            }
        })

        # summary
        sections.append({
            "type": "summary",
            "data": {
                "content": data["summary"],
                "diagram": False
            }
        })

        return {
            "id": f"ai-automation--7-{num}",
            "moduleId": f"7-{num}",
            "categoryId": "ai-automation",
            "title": title,
            "sections": sections
        }

    # 7-5, 7-6はgenerate_lesson_contentで定義
    content = generate_lesson_content(num, title, difficulty)
    if content is not None and isinstance(content, dict) and "intro" in content:
        sections = []

        sections.append({
            "type": "intro",
            "data": {
                "content": content["intro"],
                "diagram": False
            }
        })

        sections.append({
            "type": "concept",
            "data": {
                "content": content["concept"],
                "diagram": content.get("concept_diagram", False)
            }
        })

        if content.get("exercise_type") == "interactive":
            sections.append({
                "type": "exercise",
                "data": {
                    "type": "interactive",
                    "data": {
                        "content": content["exercise_content"],
                        "htmlContent": content["exercise_html"],
                        "checkpoints": content.get("exercise_checkpoints", [])
                    }
                }
            })
        else:
            sections.append({
                "type": "exercise",
                "data": content.get("exercise_data", {})
            })

        sections.append({
            "type": "quiz",
            "data": {
                "questions": content["quiz"]
            }
        })

        sections.append({
            "type": "summary",
            "data": {
                "content": content["summary"],
                "diagram": False
            }
        })

        return {
            "id": f"ai-automation--7-{num}",
            "moduleId": f"7-{num}",
            "categoryId": "ai-automation",
            "title": title,
            "sections": sections
        }

    return None


def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    generated = 0
    skipped = 0

    for num, title, difficulty, minutes in MODULES:
        lesson = build_full_lesson(num, title, difficulty, minutes)
        if lesson is None:
            skipped += 1
            print(f"  SKIP 7-{num}: {title} (content not defined)")
            continue

        filepath = os.path.join(OUTPUT_DIR, f"ai-automation--7-{num}.json")
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(lesson, f, ensure_ascii=False, indent=2)
        generated += 1
        print(f"  OK   7-{num}: {title}")

    print(f"\nGenerated: {generated}, Skipped: {skipped}")


if __name__ == "__main__":
    main()
