import { notFound } from 'next/navigation';
import { WORKCENTER_LIST } from '@c2/shared';
import type { VenueFeatureCategory } from '@c2/shared';
import { WorkcenterDashboard } from '@/components/dashboard/WorkcenterDashboard';

// Required for Cloudflare Pages deployment
export const runtime = 'edge';

interface Props {
  params: { workcenter: string };
}

export default function WorkcenterPage({ params }: Props) {
  const { workcenter } = params;

  // Validate workcenter
  if (!WORKCENTER_LIST.includes(workcenter as VenueFeatureCategory)) {
    notFound();
  }

  return <WorkcenterDashboard workcenter={workcenter} />;
}

// Generate static params for known workcenters
export function generateStaticParams() {
  return WORKCENTER_LIST.map((wc) => ({
    workcenter: wc,
  }));
}
