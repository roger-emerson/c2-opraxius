'use client';

import Link from 'next/link';
import { SacredGeometryBackground } from '@/components/SacredGeometryBackground';

export default function Home() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center p-24 bg-background">
      <SacredGeometryBackground />
      <div className="relative z-10 text-center">
        <h1 className="font-display text-5xl font-medium tracking-tight text-foreground mb-4">
          OPRAXIUS C2
        </h1>
        <p className="text-xl text-muted-foreground mb-8">
          Festival Management Dashboard for Insomniac Events
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-6 py-3 bg-foreground text-background font-medium text-sm tracking-wide border border-foreground transition-all hover:bg-transparent hover:text-foreground"
        >
          Enter Dashboard
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </Link>
      </div>
    </main>
  );
}
