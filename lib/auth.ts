import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const ALLOWED_DOMAIN = "appirits.com";

const providers = [];

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          hd: ALLOWED_DOMAIN,
          prompt: "select_account",
        },
      },
    })
  );
}

export const authOptions: NextAuthOptions = {
  providers,
  secret: process.env.NEXTAUTH_SECRET ?? "dev-secret-do-not-use-in-production",
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/signin",
  },
  callbacks: {
    async signIn({ user }) {
      // appirits.com ドメインのみ許可
      const email = user.email;
      if (!email) return false;
      if (!email.endsWith(`@${ALLOWED_DOMAIN}`)) {
        return false;
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.email = user.email;
        token.name = user.name;
        token.picture = user.image;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.image = token.picture as string;
      }
      return session;
    },
  },
};
