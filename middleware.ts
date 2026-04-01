import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

const isDevBypass = !process.env.GOOGLE_CLIENT_ID;

export default withAuth(
  function middleware() {
    return NextResponse.next();
  },
  {
    secret: process.env.NEXTAUTH_SECRET ?? "dev-secret-do-not-use-in-production",
    callbacks: {
      authorized: ({ token }) => isDevBypass || !!token,
    },
    pages: {
      signIn: "/auth/signin",
    },
  }
);

export const config = {
  matcher: ["/((?!api/auth|api/onboarding|auth|onboarding|_next/static|_next/image|favicon.ico).*)"],
};
