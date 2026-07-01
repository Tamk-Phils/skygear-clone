import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ProductCard, type ProductCardData } from "@/components/product-card";

const search = z.object({
  q: z.string().optional(),
  category: z.string().optional(),
});

export const Route = createFileRoute("/shop")({
  validateSearch: search,
  head: () => ({ meta: [{ title: "Shop — SkyGear Drones" }, { name: "description", content: "Browse the SkyGear catalog: drones, batteries, gimbals and accessories." }] }),
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
      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Catalog</p>
            <h1 className="mt-1 font-display text-3xl font-extrabold">Shop{category ? ` — ${category}` : ""}{q ? ` — "${q}"` : ""}</h1>
          </div>
          <div className="text-sm text-muted-foreground">{products?.length ?? 0} products</div>
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
          <div>
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
