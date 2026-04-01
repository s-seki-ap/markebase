import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/progress";
import OnboardingClient from "./OnboardingClient";

const isDevBypass = !process.env.GOOGLE_CLIENT_ID;

export default async function OnboardingPage() {
  const session = await getServerSession(authOptions);
  if (!session && !isDevBypass) {
    redirect("/auth/signin");
  }

  const userId = isDevBypass ? "dev-user" : session?.user?.email;

  // 既にオンボーディング済みならダッシュボードへ
  if (userId) {
    const user = await getUser(userId);
    if (user?.role) {
      redirect("/");
    }
  }

  const userName = session?.user?.name ?? "ゲスト";

  return <OnboardingClient userName={userName} />;
}
