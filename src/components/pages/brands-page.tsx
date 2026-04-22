"use client";

import Link from "next/link";
import { BrandPill } from "@/components/brand-pill";
import { Panel } from "@/components/panel";
import { useDashboardData } from "@/components/providers/dashboard-data-provider";
import { brandWorkspaceOrder } from "@/data";

export function BrandsPage() {
  const { brands, brandSpaces } = useDashboardData();
  const orderedBrands = [...brands].sort(
    (a, b) => brandWorkspaceOrder.indexOf(a.id) - brandWorkspaceOrder.indexOf(b.id),
  );
  const brandSpaceById = new Map(brandSpaces.map((brandSpace) => [brandSpace.id, brandSpace]));

  return (
    <div className="space-y-5 md:space-y-6">
      <Panel
        eyebrow="Brands / Overview"
        title="Workspace Directory"
        subtitle="Every brand and working space opens into the same structured workspace system so strategy, prompts, projects, notes, and tasks stay organized without fragmenting the app."
      >
        <div className="grid gap-4 md:grid-cols-2">
          {orderedBrands.map((brand) => {
            const brandSpace = brandSpaceById.get(brand.id);
            const summary = brandSpace?.summary ?? brand.description;
            const focus = brandSpace?.focus ?? "Workspace structure available after restore.";
            const currentPriority = brandSpace?.nextAction ?? "Open this workspace to continue organizing strategy and working materials.";
            const modules = brandSpace?.modules ?? ["Overview", "Strategy", "Content", "Projects", "Prompts", "Notes", "Tasks"];

            return (
              <Link
                key={brand.id}
                href={`/brands/${brand.id}`}
                className="group rounded-2xl border border-white/6 bg-white/[0.02] p-5 transition hover:border-white/12"
              >
                <article className="h-full">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="ui-micro-label">Workspace</p>
                      <h3 className="mt-3 text-2xl font-semibold text-ink">{brand.shortName}</h3>
                      <p className="mt-1 text-sm text-mute">{brand.description}</p>
                    </div>
                    <BrandPill color={brand.color}>{brand.shortName}</BrandPill>
                  </div>

                  <p className="mt-5 text-sm leading-6 text-mute">{summary}</p>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-white/6 bg-panelStrong p-4">
                      <p className="ui-micro-label">Focus</p>
                      <p className="mt-3 text-sm leading-6 text-mute">{focus}</p>
                    </div>
                    <div className="rounded-2xl border border-white/6 bg-panelStrong p-4">
                      <p className="ui-micro-label">Current Priority</p>
                      <p className="mt-3 text-sm leading-6 text-mute">{currentPriority}</p>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2">
                    {modules.map((module) => (
                      <span key={module} className="rounded-full border border-white/8 px-2.5 py-1 font-display text-[10px] uppercase tracking-[0.18em] text-mute">
                        {module}
                      </span>
                    ))}
                  </div>

                  <div className="mt-6 flex items-center justify-between border-t border-white/6 pt-4">
                    <p className="text-sm text-mute">Open the {brand.name} workspace</p>
                    <span className="font-display text-sm uppercase tracking-[0.18em] text-yellow group-hover:text-ink">Enter</span>
                  </div>
                </article>
              </Link>
            );
          })}
        </div>
      </Panel>
    </div>
  );
}
