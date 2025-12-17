'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-900">ESG Command Center</h1>
          <p className="text-sm text-gray-600 mt-1">Festival Management</p>
        </div>

        <nav className="mt-6">
          <Link
            href="/dashboard"
            className="block px-6 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition"
          >
            📊 Dashboard
          </Link>
          <Link
            href="/dashboard/map"
            className="block px-6 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition"
          >
            🗺️ 3D Map
          </Link>

          {/* Workcenters */}
          <div className="mt-6 px-6">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Workcenters
            </div>
            {session.user.workcenters.map((wc) => (
              <Link
                key={wc}
                href={`/dashboard/${wc}`}
                className="block py-2 text-gray-700 hover:text-blue-600 transition capitalize"
              >
                {wc}
              </Link>
            ))}
          </div>
        </nav>

        {/* User Info */}
        <div className="absolute bottom-0 w-64 p-6 border-t">
          <div className="text-sm text-gray-900 font-medium">{session.user.name}</div>
          <div className="text-xs text-gray-600">{session.user.role}</div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        {children}
      </main>
    </div>
  );
}
