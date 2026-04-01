import { headers } from "next/headers";
import SignInClient from "./SignInClient";

export default function SignInPage() {
  // headers()を呼ぶことで動的レンダリングを強制（環境変数をランタイムで読む）
  headers();

  const isOAuthConfigured = !!(
    process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
  );

  return <SignInClient isOAuthConfigured={isOAuthConfigured} />;
}
