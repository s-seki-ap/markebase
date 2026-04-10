import { initializeApp, getApps, cert, type ServiceAccount } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

function getFirebaseApp() {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  const storageBucket = process.env.FIREBASE_STORAGE_BUCKET;

  // サービスアカウントキーが環境変数にある場合
  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    const serviceAccount = JSON.parse(
      process.env.FIREBASE_SERVICE_ACCOUNT_KEY
    ) as ServiceAccount;
    return initializeApp({
      credential: cert(serviceAccount),
      projectId: process.env.FIREBASE_PROJECT_ID,
      storageBucket,
    });
  }

  // 個別の環境変数から構築（ローカル開発用）
  if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL) {
    return initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      }),
      projectId: process.env.FIREBASE_PROJECT_ID,
      storageBucket,
    });
  }

  // Cloud Run等：ADC + FIREBASE_PROJECT_IDで初期化
  if (process.env.FIREBASE_PROJECT_ID) {
    return initializeApp({
      projectId: process.env.FIREBASE_PROJECT_ID,
      storageBucket,
    });
  }

  // ローカル開発フォールバック
  return initializeApp({ projectId: "markebase-dev", storageBucket });
}

const app = getFirebaseApp();
export const db = getFirestore(app);
export const storage = getStorage(app);
