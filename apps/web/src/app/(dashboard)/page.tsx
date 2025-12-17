'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';

export default function DashboardPage() {
  const { data: session } = useSession();

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Welcome back, {session?.user.name}!</h1>
        <p className="text-gray-600 mt-2">Festival command center dashboard</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link
          href="/dashboard/map"
          className="block bg-white p-6 rounded-lg shadow hover:shadow-lg transition"
        >
          <div className="text-4xl mb-4">🗺️</div>
          <h3 className="text-xl font-semibold text-gray-900">3D Venue Map</h3>
          <p className="text-gray-600 mt-2">
            Explore the festival venue in interactive 3D
          </p>
        </Link>

        <div className="block bg-white p-6 rounded-lg shadow">
          <div className="text-4xl mb-4">📋</div>
          <h3 className="text-xl font-semibold text-gray-900">Tasks</h3>
          <p className="text-gray-600 mt-2">
            Manage tasks across all workcenters
          </p>
          <div className="mt-4 text-sm text-gray-500">Coming in Phase 3</div>
        </div>

        <div className="block bg-white p-6 rounded-lg shadow">
          <div className="text-4xl mb-4">📊</div>
          <h3 className="text-xl font-semibold text-gray-900">Status Dashboard</h3>
          <p className="text-gray-600 mt-2">
            View overall readiness and critical items
          </p>
          <div className="mt-4 text-sm text-gray-500">Coming in Phase 3</div>
        </div>
      </div>

      {/* Workcenters */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Workcenters</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {session?.user.workcenters.map((wc) => (
            <div
              key={wc}
              className="bg-white p-4 rounded-lg shadow text-center capitalize"
            >
              <div className="text-lg font-semibold text-gray-900">{wc}</div>
              <div className="text-sm text-gray-500 mt-1">Workcenter</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
