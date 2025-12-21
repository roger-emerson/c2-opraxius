import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Middleware removed - hostname blocking handled by Cloudflare custom domain configuration
  // Custom domains (dev.web.opraxius.com, staging.web.opraxius.com, dashboard.opraxius.com) are configured in Cloudflare Dashboard
  // Direct *.pages.dev access is controlled via Cloudflare settings, not middleware

  return NextResponse.next();
}

export const config = {
  matcher: '/:path*',
};
