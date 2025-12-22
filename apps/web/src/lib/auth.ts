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

// Normalize issuer URL (ensure trailing slash to match Auth0's discovery response)
const issuerUrl = process.env.AUTH0_ISSUER_BASE_URL?.endsWith('/')
  ? process.env.AUTH0_ISSUER_BASE_URL
  : `${process.env.AUTH0_ISSUER_BASE_URL}/`;

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    {
      id: 'auth0',
      name: 'Auth0',
      type: 'oidc',
      issuer: issuerUrl,
      clientId: process.env.AUTH0_CLIENT_ID!,
      clientSecret: process.env.AUTH0_CLIENT_SECRET!,
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
