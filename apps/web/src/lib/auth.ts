import { NextAuthOptions } from 'next-auth';
import Auth0Provider from 'next-auth/providers/auth0';
import type { User, UserRole } from '@c2/shared';

// Extend NextAuth types
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
    role: UserRole;
    workcenters: string[];
    permissions: any[];
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: UserRole;
    workcenters: string[];
    permissions: any[];
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    Auth0Provider({
      clientId: process.env.AUTH0_CLIENT_ID || '',
      clientSecret: process.env.AUTH0_CLIENT_SECRET || '',
      issuer: process.env.AUTH0_ISSUER_BASE_URL || '',
    }),
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
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.workcenters = token.workcenters;
        session.user.permissions = token.permissions;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
};
