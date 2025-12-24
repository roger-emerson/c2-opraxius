'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const isActive = (path: string) => pathname === path;

  return (
    <div className="flex min-h-screen bg-background-alt">
      {/* Sidebar */}
      <aside className="w-64 bg-background border-r border-border flex flex-col">
        <div className="p-6 border-b border-border">
          <h1 className="font-display text-lg font-medium tracking-[0.15em] text-foreground uppercase">
            Opraxius C2
          </h1>
          <p className="text-xs text-muted-foreground mt-1 tracking-wide">
            Event Management
          </p>
        </div>

        <nav className="flex-1 py-4">
          <Link
            href="/dashboard"
            className={`flex items-center gap-3 px-6 py-3 text-sm transition-colors ${
              isActive('/dashboard')
                ? 'text-foreground bg-background-subtle border-r-2 border-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-background-subtle'
            }`}
          >
            <span className="text-base">📊</span>
            <span>Dashboard</span>
          </Link>
          <Link
            href="/dashboard/map"
            className={`flex items-center gap-3 px-6 py-3 text-sm transition-colors ${
              isActive('/dashboard/map')
                ? 'text-foreground bg-background-subtle border-r-2 border-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-background-subtle'
            }`}
          >
            <span className="text-base">🗺️</span>
            <span>3D Map</span>
          </Link>
          <Link
            href="/dashboard/gaia"
            className={`flex items-center gap-3 px-6 py-3 text-sm transition-colors ${
              isActive('/dashboard/gaia')
                ? 'text-foreground bg-background-subtle border-r-2 border-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-background-subtle'
            }`}
          >
            <span className="text-base">🛡️</span>
            <span>GAIA™</span>
          </Link>

          {/* Workcenters */}
          <div className="mt-6 px-6">
            <div className="text-[10px] font-medium text-subtle uppercase tracking-[0.15em] mb-3">
              Workcenters
            </div>
            {['operations', 'production', 'security', 'workforce', 'vendors', 'marketing', 'finance'].map((wc) => (
              <Link
                key={wc}
                href={`/dashboard/${wc}`}
                className={`block py-2 text-sm transition-colors capitalize ${
                  pathname === `/dashboard/${wc}`
                    ? 'text-foreground font-medium'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {wc}
              </Link>
            ))}
          </div>
        </nav>

        {/* User Info */}
        <div className="p-6 border-t border-border">
          <div className="text-sm text-foreground font-medium">{session.user.name}</div>
          <div className="text-xs text-muted-foreground capitalize">{session.user.role}</div>
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="mt-3 text-xs text-subtle hover:text-foreground transition-colors"
          >
            Sign out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        {children}
      </main>
    </div>
  );
}
