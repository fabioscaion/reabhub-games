import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "./prisma";

const NEXTAUTH_URL = process.env.NEXTAUTH_URL;

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        
        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string }
        });

        if (user && user.password === credentials.password) {
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            organizationId: user.organizationId,
          };
        }
        
        return null;
      }
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).id = token.sub;
        (session.user as any).organizationId = token.organizationId;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        token.organizationId = (user as any).organizationId;
      } else if (token.sub && !token.organizationId) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.sub as string },
          select: { organizationId: true }
        });
        if (dbUser) {
          token.organizationId = dbUser.organizationId;
        }
      }
      return token;
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 dias
  },
  cookies: {
    sessionToken: {
      name: `__Secure-authjs.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: NEXTAUTH_URL?.startsWith('https://') || process.env.NODE_ENV === "production",
        domain: process.env.NEXT_PUBLIC_COOKIE_DOMAIN === 'localhost' 
          ? undefined 
          : (process.env.NEXT_PUBLIC_COOKIE_DOMAIN || undefined)
      }
    }
  },
  pages: {
    // signIn: process.env.NEXT_PUBLIC_MAIN_APP_LOGIN_URL || '/login', 
  }
});
