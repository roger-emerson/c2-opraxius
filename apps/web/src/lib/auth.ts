import NextAuth from 'next-auth';
import type { UserRole } from '@c2/shared';

// Extend Auth.js types for custom session data
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      image?: string;
      role: UserRole;
      workcenters: string[];
      permissions: any[];
    };
  }

  interface User {
    role?: UserRole;
    workcenters?: string[];
    permissions?: any[];
  }
}

declare module '@auth/core/jwt' {
  interface JWT {
    id: string;
    role: UserRole;
    workcenters: string[];
    permissions: any[];
  }
}

// Get Auth0 issuer URL (without trailing slash for endpoint construction)
const auth0Domain = process.env.AUTH0_ISSUER_BASE_URL?.replace(/\/$/, '') || '';

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    {
      id: 'auth0',
      name: 'Auth0',
      type: 'oidc',
      issuer: `${auth0Domain}/`,
      clientId: process.env.AUTH0_CLIENT_ID!,
      clientSecret: process.env.AUTH0_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: 'openid email profile',
        },
      },
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name || profile.nickname,
          email: profile.email,
          image: profile.picture,
        };
      },
    },
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      // Initial sign in
      if (account && user) {
        // TODO: Fetch user from database by email or auth0_user_id
        // For now, use mock data for development
        token.id = user.id || 'mock-user-id';
        token.role = 'admin' as UserRole; // Mock: should come from database
        token.workcenters = ['operations', 'production', 'security', 'workforce', 'vendors', 'sponsors', 'marketing', 'finance'];
        token.permissions = []; // Mock: should come from database based on role
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
        session.user.workcenters = token.workcenters as string[];
        session.user.permissions = token.permissions as any[];
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  secret: process.env.AUTH_SECRET,
  trustHost: true, // Required for Cloudflare Pages
});
