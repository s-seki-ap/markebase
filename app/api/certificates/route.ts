import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getUser } from "@/lib/progress";
import { getUserBadges } from "@/lib/badges";

const isDevBypass =
  process.env.NODE_ENV !== "production" && !process.env.GOOGLE_CLIENT_ID;

function getUserId(session: { user?: { email?: string | null } } | null): string | null {
  if (isDevBypass) return "dev-user";
  return session?.user?.email ?? null;
}

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = getUserId(session);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const badgeId = request.nextUrl.searchParams.get("badgeId");
  if (!badgeId) {
    return NextResponse.json({ error: "Missing badgeId" }, { status: 400 });
  }

  const [user, badges] = await Promise.all([
    getUser(userId),
    getUserBadges(userId),
  ]);

  if (!user || !badges.includes(badgeId)) {
    return NextResponse.json({ error: "Badge not earned" }, { status: 403 });
  }

  const badgeDefs = (await import("@/data/badges.json")).default;
  const badge = badgeDefs.find((b: { id: string }) => b.id === badgeId);
  if (!badge) {
    return NextResponse.json({ error: "Badge not found" }, { status: 404 });
  }

  const userName = user.name;
  const issueDate = new Date().toLocaleDateString("ja-JP", { year: "numeric", month: "long", day: "numeric" });
  const certId = `MB-${Date.now().toString(36).toUpperCase()}`;

  const html = generateCertificateHTML({
    userName,
    badgeName: badge.name,
    badgeDescription: badge.description,
    badgeIcon: badge.icon,
    issueDate,
    certId,
  });

  return new NextResponse(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

function generateCertificateHTML(params: {
  userName: string;
  badgeName: string;
  badgeDescription: string;
  badgeIcon: string;
  issueDate: string;
  certId: string;
}): string {
  return `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <title>修了証 - ${params.badgeName}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@300;400;700;900&display=swap');
    @page { size: A4 landscape; margin: 0; }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Noto Sans JP', sans-serif;
      width: 297mm; height: 210mm;
      display: flex; align-items: center; justify-content: center;
      background: #f5f5f5;
    }
    .cert {
      width: 280mm; height: 194mm;
      background: white;
      border: 3px solid #0D2240;
      position: relative;
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      text-align: center;
      padding: 30mm 40mm;
    }
    .cert::before {
      content: '';
      position: absolute; top: 8px; left: 8px; right: 8px; bottom: 8px;
      border: 1px solid #E07830;
    }
    .header { font-size: 14px; color: #888; letter-spacing: 8px; margin-bottom: 8mm; }
    .icon { font-size: 48px; margin-bottom: 6mm; }
    .title { font-size: 28px; font-weight: 900; color: #0D2240; margin-bottom: 4mm; }
    .desc { font-size: 14px; color: #666; margin-bottom: 10mm; }
    .name {
      font-size: 36px; font-weight: 900; color: #0D2240;
      border-bottom: 3px solid #E07830;
      padding: 0 20mm 4mm; margin-bottom: 10mm;
    }
    .body { font-size: 14px; color: #444; line-height: 2; margin-bottom: 10mm; }
    .footer {
      display: flex; justify-content: space-between;
      width: 100%; font-size: 11px; color: #888;
      position: absolute; bottom: 15mm; left: 40mm; right: 40mm;
    }
    .footer div { text-align: center; }
    .org { font-weight: 700; color: #0D2240; font-size: 13px; }
    @media print {
      body { background: white; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="cert">
    <div class="header">CERTIFICATE OF COMPLETION</div>
    <div class="icon">${params.badgeIcon}</div>
    <div class="title">${params.badgeName}</div>
    <div class="desc">${params.badgeDescription}</div>
    <div class="name">${params.userName}</div>
    <div class="body">
      上記の者は、MarkeBase学習プラットフォームにおいて<br>
      所定のカリキュラムを修了したことを証します。
    </div>
    <div class="footer" style="width:calc(100% - 80mm);">
      <div>
        <p>発行日: ${params.issueDate}</p>
        <p>証明書番号: ${params.certId}</p>
      </div>
      <div>
        <p class="org">株式会社アピリッツ</p>
        <p>データマネジメントサービス</p>
      </div>
    </div>
  </div>
  <script>window.onload = () => window.print();</script>
</body>
</html>`;
}
