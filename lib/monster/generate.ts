import { GoogleAuth } from "google-auth-library";
import { storage } from "@/lib/firebase";
import type { Attribute, MonsterStage } from "./attributes";
import { buildImagenPrompt } from "./prompt";

const LOCATION = process.env.GCP_LOCATION ?? "asia-northeast1";
const PROJECT_ID = process.env.FIREBASE_PROJECT_ID ?? "ap-hp-bq-test";
const MODEL = "imagen-4.0-generate-001";

const auth = new GoogleAuth({
  scopes: "https://www.googleapis.com/auth/cloud-platform",
});

interface ImagenResponse {
  predictions?: Array<{
    bytesBase64Encoded?: string;
    mimeType?: string;
  }>;
  error?: { code: number; message: string; status: string };
}

async function callImagen(prompt: string): Promise<Buffer> {
  const client = await auth.getClient();
  const tokenResponse = await client.getAccessToken();
  const token = tokenResponse.token;
  if (!token) {
    throw new Error("Failed to obtain access token for Vertex AI");
  }

  const url = `https://${LOCATION}-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/${LOCATION}/publishers/google/models/${MODEL}:predict`;

  const body = {
    instances: [{ prompt }],
    parameters: {
      sampleCount: 1,
      aspectRatio: "1:1",
      personGeneration: "dont_allow",
      addWatermark: false,
    },
  };

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "X-Goog-User-Project": PROJECT_ID,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Imagen API error (${res.status}): ${text.slice(0, 500)}`);
  }

  const json = (await res.json()) as ImagenResponse;
  if (json.error) {
    throw new Error(`Imagen API returned error: ${json.error.message}`);
  }
  const base64 = json.predictions?.[0]?.bytesBase64Encoded;
  if (!base64) {
    throw new Error("Imagen API returned no image data (likely blocked by safety filter)");
  }

  return Buffer.from(base64, "base64");
}

async function uploadToStorage(
  userId: string,
  stage: MonsterStage,
  primary: Attribute | null,
  secondary: Attribute | null,
  image: Buffer
): Promise<string> {
  const safeUserId = userId.replace(/[^a-zA-Z0-9._-]/g, "_");
  const parts = [stage, primary ?? "none", secondary ?? "none", Date.now()].join("_");
  const filePath = `monsters/${safeUserId}/${parts}.png`;

  const bucket = storage.bucket();
  const file = bucket.file(filePath);

  await file.save(image, {
    contentType: "image/png",
    resumable: false,
    metadata: {
      cacheControl: "public, max-age=31536000, immutable",
    },
  });

  // 公開URLを返す（Storageルールでmonsters/配下は公開読み取り許可済み）
  return `https://storage.googleapis.com/${bucket.name}/${encodeURI(filePath)}`;
}

export interface GenerateParams {
  userId: string;
  stage: MonsterStage;
  primary: Attribute | null;
  secondary: Attribute | null;
}

export interface GenerateResult {
  imageUrl: string;
  promptUsed: string;
}

export async function generateMonsterImage(
  params: GenerateParams
): Promise<GenerateResult> {
  const prompt = buildImagenPrompt({
    stage: params.stage,
    primary: params.primary,
    secondary: params.secondary,
  });

  const image = await callImagen(prompt);
  const imageUrl = await uploadToStorage(
    params.userId,
    params.stage,
    params.primary,
    params.secondary,
    image
  );

  return { imageUrl, promptUsed: prompt };
}
