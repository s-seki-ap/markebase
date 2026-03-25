import SignInClient from "./SignInClient";

export default function SignInPage() {
  const isOAuthConfigured = !!(
    process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
  );

  return <SignInClient isOAuthConfigured={isOAuthConfigured} />;
}
