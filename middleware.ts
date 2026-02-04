import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { decode } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rotas que não precisam de validação
  if (
    pathname.startsWith('/_next') || 
    pathname.startsWith('/api/auth') || 
    pathname.startsWith('/unauthorized') ||
    pathname.includes('.') // arquivos estáticos
  ) {
    return NextResponse.next();
  }

  // Nome do cookie usado pelo NextAuth/Auth.js
  const cookieName = process.env.NODE_ENV === "production" 
    ? `__Secure-authjs.session-token` 
    : `authjs.session-token`;
    
  const sessionToken = request.cookies.get(cookieName)?.value;

  if (!sessionToken) {
    return NextResponse.redirect(new URL('/unauthorized', request.url));
  }

  try {
    // Tenta decodificar o token para validar se é legítimo
    const decoded = await decode({
      token: sessionToken,
      secret: process.env.NEXTAUTH_SECRET!,
      salt: cookieName,
    });

    if (!decoded || !decoded.sub) {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }

    return NextResponse.next();
  } catch (error) {
    console.error("Middleware Auth Error:", error);
    return NextResponse.redirect(new URL('/unauthorized', request.url));
  }
}

// Configura quais rotas o middleware deve rodar
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (auth endpoints)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - unauthorized (our error page)
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|unauthorized).*)',
  ],
};
