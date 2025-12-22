'use client';

import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { SacredGeometryBackground } from '@/components/SacredGeometryBackground';

function SignInContent() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background">
      <SacredGeometryBackground />
      <div className="relative z-10 w-full max-w-md space-y-8 px-4">
        <div className="text-center">
          <h1 className="font-display text-3xl font-medium tracking-[0.2em] text-foreground uppercase">
            Opraxius C2
          </h1>
          <p className="mt-3 text-muted-foreground">
            Festival Management Dashboard
          </p>
        </div>

        <div className="bg-background p-8 border border-border">
          <button
            onClick={() => signIn('auth0', { callbackUrl })}
            className="w-full bg-foreground text-background px-4 py-3 font-medium text-sm tracking-wide border border-foreground transition-all hover:bg-transparent hover:text-foreground"
          >
            Sign in with SSO
          </button>

          <p className="mt-6 text-sm text-subtle text-center">
            For development, Auth0 credentials are required in .env
          </p>
        </div>
      </div>
    </div>
  );
}

export default function SignIn() {
  return (
    <Suspense fallback={
      <div className="relative flex min-h-screen items-center justify-center bg-background">
        <SacredGeometryBackground />
        <div className="relative z-10 text-center text-muted-foreground">Loading...</div>
      </div>
    }>
      <SignInContent />
    </Suspense>
  );
}
