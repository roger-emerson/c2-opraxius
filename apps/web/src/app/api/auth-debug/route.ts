export const runtime = 'edge';

export async function GET() {
  const auth0Domain = process.env.AUTH0_ISSUER_BASE_URL?.replace(/\/$/, '') || '';
  
  const config = {
    auth0Domain,
    clientIdSet: !!process.env.AUTH0_CLIENT_ID,
    clientSecretSet: !!process.env.AUTH0_CLIENT_SECRET,
    authSecretSet: !!process.env.AUTH_SECRET,
    authSecretLength: process.env.AUTH_SECRET?.length || 0,
    authorizationUrl: `${auth0Domain}/authorize`,
    tokenUrl: `${auth0Domain}/oauth/token`,
    userinfoUrl: `${auth0Domain}/userinfo`,
  };
  
  // Test if authorization URL is reachable
  try {
    const testUrl = `${auth0Domain}/.well-known/openid-configuration`;
    const resp = await fetch(testUrl);
    const data = await resp.json();
    return Response.json({
      ...config,
      oidcDiscoveryStatus: resp.status,
      oidcIssuer: data.issuer,
    });
  } catch (error) {
    return Response.json({
      ...config,
      error: String(error),
    });
  }
}

