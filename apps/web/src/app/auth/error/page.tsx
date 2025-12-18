'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';

function ErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-destructive">Authentication Error</h1>
          <p className="mt-2 text-gray-600">Something went wrong</p>
        </div>

        <div className="bg-white p-8 shadow-md rounded-lg">
          <p className="text-sm text-gray-700 mb-4">
            Error: {error || 'Unknown error'}
          </p>

          <Link
            href="/auth/signin"
            className="block w-full bg-primary text-primary-foreground text-center px-4 py-3 rounded-md font-medium hover:opacity-90 transition"
          >
            Try Again
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function AuthError() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">Loading...</div>
      </div>
    }>
      <ErrorContent />
    </Suspense>
  );
}
