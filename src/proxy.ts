import { NextRequest, NextResponse } from 'next/server';

// Only redirect already-authenticated users away from the login page.
// Unauthenticated access to protected routes is handled client-side
// via SessionExpiredModal so the user sees a proper dialog instead of
// a hard redirect.
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = request.cookies.has('refreshToken');

  if (pathname.startsWith('/login') && hasSession) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)'],
};
