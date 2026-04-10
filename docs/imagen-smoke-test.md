# Imagen 4 疎通確認手順

Vertex AI Imagen 4 (`imagen-4.0-generate-001`) が `ap-hp-bq-test` プロジェクトから呼べるかを確認するための手順。モンスター育成コンテンツ（`/monster`）の前提セットアップの検証用。

## 前提

以下のセットアップが完了していること。

- `gcloud services enable aiplatform.googleapis.com --project=ap-hp-bq-test` 実行済み
- Cloud Run のサービスアカウント（`238415407415-compute@developer.gserviceaccount.com`）に以下のロールが付与済み
  - `roles/aiplatform.user`
  - `roles/storage.objectAdmin`（`roles/storage.admin` があれば不要）
- Firebase Storage バケット `ap-hp-bq-test.firebasestorage.app` が `asia-northeast1` で作成済み
- Cloud Run 環境変数 `FIREBASE_STORAGE_BUCKET`, `GCP_LOCATION` 設定済み
- ローカルで `gcloud auth application-default login` 済み

## PowerShell スクリプト

PowerShell（Windows）で以下のブロックをそのまま貼り付けて実行する。

```powershell
$token = gcloud auth print-access-token
$body = @{
  instances = @(@{ prompt = "a cute chibi creature mascot in Pokemon-inspired style, pastel colors, claymorphism aesthetic, rounded puffy shapes, friendly big eyes, front-facing full body, plain white background, high quality digital illustration" })
  parameters = @{ sampleCount = 1; aspectRatio = "1:1" }
} | ConvertTo-Json -Depth 5

$response = Invoke-RestMethod -Uri "https://asia-northeast1-aiplatform.googleapis.com/v1/projects/ap-hp-bq-test/locations/asia-northeast1/publishers/google/models/imagen-4.0-generate-001:predict" -Method Post -Headers @{"Authorization"="Bearer $token"} -ContentType "application/json" -Body $body

$base64 = $response.predictions[0].bytesBase64Encoded
$outPath = "$env:USERPROFILE\Desktop\monster_test.png"
[System.IO.File]::WriteAllBytes($outPath, [Convert]::FromBase64String($base64))
Write-Host "Saved to $outPath"
```

## 処理内容

1. `gcloud auth print-access-token` でアクセストークンを取得
2. Imagen 4 向けリクエストボディをJSONで組み立て（`sampleCount=1`, `aspectRatio=1:1`）
3. Vertex AI REST エンドポイントへ POST
4. レスポンスの `predictions[0].bytesBase64Encoded` を base64 デコード
5. `Desktop\monster_test.png` として保存

## 期待する結果

成功時：

```
Saved to C:\Users\sseki\Desktop\monster_test.png
```

5〜15秒程度で完了し、デスクトップに PNG 画像が生成される。内容は「かわいいチビキャラ」的なイラスト1枚。

## エラーパターンと対処

| エラー | 原因 | 対処 |
|--------|------|------|
| `PERMISSION_DENIED` | IAM 権限反映待ち or 付与漏れ | 2〜3分待って再試行。それでもダメなら `roles/aiplatform.user` が付与されているか確認 |
| `NOT_FOUND` | リージョン名またはモデル名の誤り | URL の `asia-northeast1` と `imagen-4.0-generate-001` を再確認 |
| `FAILED_PRECONDITION` | Vertex AI API 未有効化 or 反映待ち | `gcloud services list --enabled --project=ap-hp-bq-test` で確認 |
| `Invoke-RestMethod : ...` | ネットワーク系（VPN/プロキシ） | 社内ネットワーク設定を確認 |
| `bytesBase64Encoded` が空 | セーフティフィルターでブロック | プロンプト文言を調整 |

## エンドポイント仕様メモ

- **URL**: `https://{REGION}-aiplatform.googleapis.com/v1/projects/{PROJECT}/locations/{REGION}/publishers/google/models/{MODEL}:predict`
- **REGION**: `asia-northeast1`
- **PROJECT**: `ap-hp-bq-test`
- **MODEL**: `imagen-4.0-generate-001`
- **認証**: Bearer token（`gcloud auth print-access-token` または ADC）
- **レスポンス形式**:
  ```json
  {
    "predictions": [
      {
        "bytesBase64Encoded": "...",
        "mimeType": "image/png"
      }
    ]
  }
  ```

## 参考リンク

- [Imagen on Vertex AI 総合ガイド](https://cloud.google.com/vertex-ai/generative-ai/docs/image/overview)
- [画像生成 API リファレンス](https://cloud.google.com/vertex-ai/generative-ai/docs/image/generate-images)
- [プロンプトガイド](https://cloud.google.com/vertex-ai/generative-ai/docs/image/img-gen-prompt-guide)
- [料金](https://cloud.google.com/vertex-ai/generative-ai/pricing#imagen-models)
- [Model Garden（プロジェクト指定）](https://console.cloud.google.com/vertex-ai/publishers/google/model-garden/imagen-4.0-generate-001?project=ap-hp-bq-test)
