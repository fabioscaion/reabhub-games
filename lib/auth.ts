import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        // Este provider pode ser usado para depuração ou fallback
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // Implementação básica de autorização se necessário
        return null;
      }
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).id = token.sub;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    }
  },
  // Configuração para compartilhamento de sessão via cookie
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        // Aqui é onde definimos o domínio para compartilhar o cookie entre subdomínios
        // Exemplo: .reabhub.com.br
        domain: process.env.NEXT_PUBLIC_COOKIE_DOMAIN || undefined
      }
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/login', // Você pode ajustar para a URL da outra aplicação se preferir
  }
};
