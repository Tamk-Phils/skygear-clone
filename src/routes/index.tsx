import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ProductCard, type ProductCardData } from "@/components/product-card";
import heroImg from "@/assets/hero-drone.jpg";
import { Truck, ShieldCheck, Headphones, RefreshCw } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SkyGear Drones — Pro drones, gimbals & accessories" },
      { name: "description", content: "Shop professional drones, cameras, batteries, and accessories. Free shipping on orders above $300." },
      { property: "og:title", content: "SkyGear Drones" },
      { property: "og:description", content: "Pro drones and accessories for serious pilots." },
    ],
  }),
  component: Home,
});

function Home() {
  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase.from("categories").select("*").order("sort_order").limit(8);
      if (error) throw error;
      return data;
    },
  });

  const { data: featured } = useQuery({
    queryKey: ["featured-products"],
    queryFn: async () => {
      const { data, error } = await supabase.from("products")
        .select("id,name,slug,price,compare_at_price,images")
        .eq("is_published", true)
        .order("is_featured", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(8);
      if (error) throw error;
      return data as ProductCardData[];
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <img src={heroImg} alt="Drone at sunset" width={1920} height={900} className="absolute inset-0 size-full object-cover" />
        <div className="absolute inset-0 bg-navy/40" />
        <div className="relative mx-auto flex max-w-7xl flex-col items-center px-4 py-32 text-center text-white md:py-44">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">Welcome to</p>
          <h1 className="mt-3 font-display text-5xl font-extrabold tracking-tight md:text-7xl">
            SkyGear Drones<span className="text-primary">®</span>
          </h1>
          <p className="mt-4 max-w-xl text-white/85">
            Pro drones, gimbals, batteries and accessories. Trusted by aerial creators worldwide.
          </p>
          <Link to="/shop" className="mt-8 rounded-full bg-primary px-8 py-3 text-sm font-bold uppercase tracking-wide text-primary-foreground transition hover:bg-primary/90">
            Shop Now
          </Link>
        </div>
      </section>

      {/* Feature strip */}
      <section className="border-b border-border bg-card">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:grid-cols-2 md:grid-cols-4">
          {[
            { i: Truck, t: "Free shipping", d: "On orders over $300" },
            { i: ShieldCheck, t: "2-year warranty", d: "Manufacturer backed" },
            { i: RefreshCw, t: "30-day returns", d: "No hassle" },
            { i: Headphones, t: "Expert support", d: "Real pilots on call" },
          ].map(({ i: Icon, t, d }) => (
            <div key={t} className="flex items-center gap-3">
              <div className="grid size-11 shrink-0 place-items-center rounded-full bg-primary/15 text-primary">
                <Icon className="size-5" />
              </div>
              <div>
                <div className="text-sm font-semibold">{t}</div>
                <div className="text-xs text-muted-foreground">{d}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-4 py-16">
        <SectionHeading title="Top Categories" />
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          {(categories ?? []).map(c => (
            <Link key={c.id} to="/shop" search={{ category: c.slug }} className="group flex flex-col overflow-hidden rounded-lg border border-border bg-card">
              <div className="aspect-square overflow-hidden bg-muted">
                {c.image_url ? (
                  <img src={c.image_url} alt={c.name} loading="lazy" className="size-full object-cover transition duration-500 group-hover:scale-105" />
                ) : <div className="grid size-full place-items-center text-xs text-muted-foreground">No image</div>}
              </div>
              <div className="p-4 text-center text-sm font-semibold group-hover:text-primary">{c.name}</div>
            </Link>
          ))}
          {categories && categories.length === 0 && (
            <div className="col-span-full rounded-lg border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
              No categories yet. Add some in the admin panel.
            </div>
          )}
        </div>
      </section>

      {/* Featured products */}
      <section className="mx-auto max-w-7xl px-4 pb-16">
        <SectionHeading title="Featured Products" />
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {(featured ?? []).map(p => <ProductCard key={p.id} p={p} />)}
          {featured && featured.length === 0 && (
            <div className="col-span-full rounded-lg border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
              No products yet. Add products in the admin panel.
            </div>
          )}
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

function SectionHeading({ title }: { title: string }) {
  return (
    <div className="flex items-end justify-between border-b-2 border-border pb-3">
      <h2 className="font-display text-2xl font-extrabold uppercase tracking-tight md:text-3xl">
        <span className="border-b-4 border-primary pb-3">{title}</span>
      </h2>
    </div>
  );
}
