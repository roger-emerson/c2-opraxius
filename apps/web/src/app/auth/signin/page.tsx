'use client';

import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function SignInContent() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold">ESG Command Center</h1>
          <p className="mt-2 text-gray-600">Festival Management Dashboard</p>
        </div>

        <div className="bg-white p-8 shadow-md rounded-lg">
          <button
            onClick={() => signIn('auth0', { callbackUrl })}
            className="w-full bg-primary text-primary-foreground px-4 py-3 rounded-md font-medium hover:opacity-90 transition"
          >
            Sign in with SSO
          </button>

          <p className="mt-4 text-sm text-gray-500 text-center">
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
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">Loading...</div>
      </div>
    }>
      <SignInContent />
    </Suspense>
  );
}
