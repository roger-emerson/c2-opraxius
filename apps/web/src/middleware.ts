import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';

  // List of allowed domains
  const allowedDomains = [
    'staging.opraxius.com',
    'dashboard.opraxius.com',
    'localhost', // for local development
  ];

  // Check if hostname is allowed
  const isAllowed = allowedDomains.some(domain =>
    hostname === domain || hostname.startsWith(`${domain}:`)
  );

  if (!isAllowed) {
    return new NextResponse('Not Found', { status: 404 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/:path*',
};
