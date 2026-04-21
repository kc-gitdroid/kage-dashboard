import { DashboardShell } from "@/components/dashboard-shell";
import { BrandDetailRoutePage } from "@/components/pages/brand-detail-route-page";
import { brandSpaces, getBrandSpaceById } from "@/data";

export function generateStaticParams() {
  return brandSpaces.map((brand) => ({
    slug: brand.id,
  }));
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const brand = getBrandSpaceById(slug as (typeof brandSpaces)[number]["id"]);

  return (
    <DashboardShell currentPath="/brands">
      <BrandDetailRoutePage slug={brand?.id ?? slug} />
    </DashboardShell>
  );
}
