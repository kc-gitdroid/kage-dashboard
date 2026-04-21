"use client";

import { Panel } from "@/components/panel";
import { useDashboardData } from "@/components/providers/dashboard-data-provider";
import { BrandDetailPage } from "@/components/pages/brand-detail-page";

export function BrandDetailRoutePage({ slug }: { slug: string }) {
  const { getBrandSpaceById, hydrated } = useDashboardData();
  const brand = hydrated ? getBrandSpaceById(slug) : undefined;

  if (!hydrated) {
    return null;
  }

  if (!brand) {
    return (
      <Panel eyebrow="Brands / Missing" title="Brand space unavailable">
        <p className="text-sm text-mute">This brand record is not available in the local store yet.</p>
      </Panel>
    );
  }

  return <BrandDetailPage brand={brand} />;
}
