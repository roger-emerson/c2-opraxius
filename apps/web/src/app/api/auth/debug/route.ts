// Debug endpoint - REMOVE AFTER DEBUGGING
export const runtime = 'edge';

export async function GET() {
  const debug = {
    AUTH0_CLIENT_ID: process.env.AUTH0_CLIENT_ID ? `${process.env.AUTH0_CLIENT_ID.slice(0, 8)}...` : 'NOT SET',
    AUTH0_CLIENT_SECRET: process.env.AUTH0_CLIENT_SECRET ? 'SET (hidden)' : 'NOT SET',
    AUTH0_ISSUER_BASE_URL: process.env.AUTH0_ISSUER_BASE_URL || 'NOT SET',
    AUTH_SECRET: process.env.AUTH_SECRET ? 'SET (hidden)' : 'NOT SET',
    // Also check old naming convention
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? 'SET (hidden)' : 'NOT SET',
  };

  return Response.json(debug);
}

