import { cookies } from "next/headers";
import { decode } from "next-auth/jwt";
import { NextResponse } from "next/server";

export interface Session {
  user: {
    id: string;
    name?: string;
    email?: string;
    organizationId: string;
  };
}

export async function auth(): Promise<Session | null> {
  const cookieStore = await cookies();
  
  const cookieName = process.env.NODE_ENV === "production" 
    ? `__Secure-authjs.session-token` 
    : `authjs.session-token`;
    
  const sessionToken = cookieStore.get(cookieName)?.value;

  if (!sessionToken) {
    return null;
  }

  try {
    const decoded = await decode({
      token: sessionToken,
      secret: process.env.NEXTAUTH_SECRET!,
      salt: cookieName,
    });

    if (!decoded || !decoded.sub) {
      return null;
    }

    return {
      user: {
        id: decoded.sub as string,
        name: decoded.name as string,
        email: decoded.email as string,
        organizationId: decoded.organizationId as string,
      },
    };
  } catch (error) {
    console.error("Erro ao validar sessão:", error);
    return null;
  }
}

// Handler para suportar o useSession no cliente sem precisar do NextAuth completo
export const handlers = {
  GET: async (req: Request) => {
    const url = new URL(req.url);
    if (url.pathname.endsWith("/session")) {
      const session = await auth();
      return NextResponse.json(session || {});
    }
    return NextResponse.json({});
  },
  POST: async () => {
    return NextResponse.json({});
  }
};

export const signIn = () => {};
export const signOut = () => {};
