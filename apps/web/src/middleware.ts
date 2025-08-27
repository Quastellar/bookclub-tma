import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  // Лёгкое логирование навигации (только путь)
  console.log('[NEXT]', req.nextUrl.pathname);
  return;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};


