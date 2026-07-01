import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ProductCard, type ProductCardData } from "@/components/product-card";
import { buildMeta } from "@/lib/seo";

const search = z.object({
  q: z.string().optional(),
  category: z.string().optional(),
});

const CATEGORY_SEO: Record<string, { title: string; description: string }> = {
  drones: {
    title: "Buy Professional Camera Drones & FPV Quadcopters",
    description: "Shop SkyGear professional camera drones, foldable travel drones, FPV racing quadcopters and cinema UAVs. 4K, 8K sensors. Free shipping over $300.",
  },
  batteries: {
    title: "Intelligent Flight Batteries for Drones",
    description: "SkyGear intelligent flight batteries with onboard cell balancing, low-temp performance and up to 46-minute flight time. Compatible with Pro X1 and more.",
  },
  gimbals: {
    title: "Drone Gimbals & Aerial Camera Stabilizers",
    description: "3-axis handheld gimbals and aerial camera stabilizers for professional drone filmmaking. Brushless motors, 12-hour battery life.",
  },
  accessories: {
    title: "Drone Accessories — Controllers, Cases & Filters",
    description: "Smart controllers, hardshell travel cases, ND filter sets, low-noise propellers and drone accessories for professional pilots.",
  },
};

export const Route = createFileRoute("/shop")({
  validateSearch: search,
  head: ({ match }) => {
    const s = match.search || {};
    const cat = s.category ? CATEGORY_SEO[s.category] : undefined;
    const seo = buildMeta({
      title: cat?.title ?? (s.q ? `Search: ${s.q}` : "Shop Drones, Batteries & Accessories"),
      description: cat?.description ?? "Browse the SkyGear catalog: professional camera drones, FPV quadcopters, intelligent flight batteries, gimbals and drone accessories.",
      path: s.category ? `/shop?category=${s.category}` : s.q ? `/shop?q=${encodeURIComponent(s.q)}` : "/shop",
    });
    return { meta: seo.meta, links: seo.links };
  },
  component: Shop,
});

function Shop() {
  const { q, category } = Route.useSearch();

  const { data: cats } = useQuery({
    queryKey: ["categories-all"],
    queryFn: async () => (await supabase.from("categories").select("*").order("sort_order")).data ?? [],
  });

  const { data: products, isLoading } = useQuery({
    queryKey: ["shop", q, category],
    queryFn: async () => {
      let query = supabase.from("products")
        .select("id,name,slug,price,compare_at_price,images, category:categories(slug)")
        .eq("is_published", true);
      if (q) query = query.ilike("name", `%${q}%`);
      const { data, error } = await query.order("created_at", { ascending: false });
      if (error) throw error;
      let rows = data as any[];
      if (category) rows = rows.filter(r => r.category?.slug === category);
      return rows as ProductCardData[];
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:py-10">
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Catalog</p>
            <h1 className="mt-1 break-words font-display text-2xl font-extrabold sm:text-3xl">
              Shop{category ? ` — ${category}` : ""}{q ? ` — "${q}"` : ""}
            </h1>
          </div>
          <div className="shrink-0 text-sm text-muted-foreground">{products?.length ?? 0} products</div>
        </div>

        <div className="mb-6 flex gap-2 overflow-x-auto pb-1 md:hidden">
          <a
            href="/shop"
            className={`shrink-0 rounded-full border px-4 py-1.5 text-sm ${!category ? "border-primary bg-primary/10 font-semibold text-primary" : "border-border hover:border-primary hover:text-primary"}`}
          >
            All
          </a>
          {(cats ?? []).map((c) => (
            <a
              key={c.id}
              href={`/shop?category=${c.slug}`}
              className={`shrink-0 rounded-full border px-4 py-1.5 text-sm ${category === c.slug ? "border-primary bg-primary/10 font-semibold text-primary" : "border-border hover:border-primary hover:text-primary"}`}
            >
              {c.name}
            </a>
          ))}
        </div>

        <div className="grid gap-8 md:grid-cols-[220px_1fr]">
          <aside className="hidden md:block">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Categories</h3>
            <ul className="space-y-1 text-sm">
              <li><a href="/shop" className={!category ? "font-semibold text-primary" : "hover:text-primary"}>All products</a></li>
              {(cats ?? []).map(c => (
                <li key={c.id}>
                  <a href={`/shop?category=${c.slug}`} className={category === c.slug ? "font-semibold text-primary" : "hover:text-primary"}>{c.name}</a>
                </li>
              ))}
            </ul>
          </aside>
          <div className="min-w-0">
            {isLoading ? (
              <div className="py-20 text-center text-sm text-muted-foreground">Loading…</div>
            ) : products && products.length ? (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                {products.map(p => <ProductCard key={p.id} p={p} />)}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-border p-16 text-center text-sm text-muted-foreground">No products found.</div>
            )}
          </div>
        </div>
      </div>
      <SiteFooter />
    </div>
  );
}
