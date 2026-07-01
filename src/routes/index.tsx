import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ProductCard, type ProductCardData } from "@/components/product-card";
import heroImg from "@/assets/hero-drone.jpg";
import { Truck, ShieldCheck, Headphones, RefreshCw, Camera, MapPin, Zap, Star } from "lucide-react";
import { buildMeta } from "@/lib/seo";
import { resolveImageUrl } from "@/lib/images";
import { ProductImage } from "@/components/product-image";

export const Route = createFileRoute("/")({
  head: () => {
    const seo = buildMeta({
      title: "Pro Drones, Gimbals & Accessories — Shop SkyGear",
      description:
        "Buy professional camera drones, FPV racing quadcopters, cinema UAVs, intelligent flight batteries, 3-axis gimbals and drone accessories. Free shipping over $300. Trusted by 60,000+ pilots worldwide.",
      path: "/",
    });
    return { meta: seo.meta, links: seo.links };
  },
  component: Home,
});

const TESTIMONIALS = [
  {
    quote:
      "The SkyGear Pro X1 replaced our entire ENG helicopter budget for location scouts. 46-minute flight time is no marketing fluff — we timed it at altitude in Montana.",
    author: "Sarah Chen",
    role: "Director of Photography, Cascade Films",
  },
  {
    quote:
      "We mapped 400 acres in two days with the Pro X1. RTK accuracy beat our previous fixed-wing setup and the repairable arms saved us after a tree strike.",
    author: "Marcus Webb",
    role: "GIS Surveyor, TerraScan LLC",
  },
  {
    quote:
      "Best FPV platform I've flown in five years of racing. The carbon frame takes crashes that would total other rigs. Spare parts shipped next day.",
    author: "Jake Ortiz",
    role: "FPV Freestyle Pilot",
  },
];

const USE_CASES = [
  {
    icon: Camera,
    title: "Aerial filmmaking & photography",
    desc: "4K and 8K camera drones with cinema-grade sensors, ND filters, and rock-steady 3-axis gimbals for wedding films, documentaries, and commercial shoots.",
  },
  {
    icon: MapPin,
    title: "Surveying & inspection",
    desc: "Professional UAV platforms for photogrammetry, orthomosaic mapping, construction monitoring, and infrastructure inspection with centimeter-level accuracy.",
  },
  {
    icon: Zap,
    title: "FPV racing & freestyle",
    desc: "Carbon-frame FPV racing drones built for 140 km/h top speeds, low-latency HD video, and modular repairs after the inevitable crash landing.",
  },
];

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
        <img src={heroImg} alt="Professional camera drone flying at sunset for aerial photography" width={1920} height={900} className="absolute inset-0 size-full object-cover" />
        <div className="absolute inset-0 bg-navy/40" />
        <div className="relative mx-auto flex max-w-7xl flex-col items-center px-4 py-20 text-center text-white sm:py-32 md:py-44">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">Welcome to</p>
          <h1 className="mt-3 font-display text-3xl font-extrabold tracking-tight sm:text-5xl md:text-7xl">
            SkyGear Drones<span className="text-primary">®</span>
          </h1>
          <p className="mt-4 max-w-xl text-sm text-white/85 sm:text-base">
            Professional camera drones, FPV racing quadcopters, cinema UAVs, intelligent flight
            batteries, gimbals and accessories — gear built by pilots, for pilots.
          </p>
          <div className="mt-8 flex w-full max-w-md flex-col justify-center gap-3 sm:max-w-none sm:flex-row sm:flex-wrap sm:gap-4">
            <Link to="/shop" className="rounded-full bg-primary px-8 py-3 text-center text-sm font-bold uppercase tracking-wide text-primary-foreground transition hover:bg-primary/90">
              Shop Drones
            </Link>
            <Link to="/guides" className="rounded-full border border-white/40 px-8 py-3 text-center text-sm font-bold uppercase tracking-wide text-white transition hover:border-primary hover:text-primary">
              Buying Guides
            </Link>
          </div>
        </div>
      </section>

      {/* Feature strip */}
      <section className="border-b border-border bg-card">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:grid-cols-2 md:grid-cols-4">
          {[
            { i: Truck, t: "Free shipping", d: "On drone orders over $300" },
            { i: ShieldCheck, t: "2-year warranty", d: "On all SkyGear drones" },
            { i: RefreshCw, t: "30-day returns", d: "Hassle-free policy" },
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

      {/* Use cases */}
      <section className="mx-auto max-w-7xl px-4 py-16">
        <SectionHeading title="Drones for every mission" />
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {USE_CASES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="rounded-lg border border-border bg-card p-6">
              <Icon className="size-8 text-primary" />
              <h3 className="mt-4 font-display text-lg font-bold">{title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="bg-card">
        <div className="mx-auto max-w-7xl px-4 py-16">
          <SectionHeading title="Shop by category" />
          <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
            {(categories ?? []).map(c => (
              <Link key={c.id} to="/shop" search={{ category: c.slug }} className="group flex flex-col overflow-hidden rounded-lg border border-border bg-background">
                <div className="aspect-square overflow-hidden bg-muted">
                  <ProductImage
                    src={resolveImageUrl(c.image_url, c.slug)}
                    slug={c.slug}
                    alt={`${c.name} — SkyGear drone category`}
                    loading="lazy"
                    className="size-full object-cover transition duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-4 text-center text-sm font-semibold group-hover:text-primary">{c.name}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured products */}
      <section className="mx-auto max-w-7xl px-4 py-16">
        <SectionHeading title="Featured drones & accessories" />
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {(featured ?? []).map(p => <ProductCard key={p.id} p={p} />)}
        </div>
        <div className="mt-8 text-center">
          <Link to="/shop" className="inline-block rounded-full border border-border px-8 py-3 text-sm font-bold uppercase tracking-wide hover:border-primary hover:text-primary">
            View all products
          </Link>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-navy text-navy-foreground">
        <div className="mx-auto max-w-7xl px-4 py-16">
          <SectionHeading title="Trusted by pilots worldwide" light />
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {TESTIMONIALS.map(t => (
              <blockquote key={t.author} className="rounded-lg border border-white/10 bg-white/5 p-6">
                <div className="flex gap-1 text-primary">
                  {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="size-4 fill-current" />)}
                </div>
                <p className="mt-4 text-sm leading-relaxed opacity-90">&ldquo;{t.quote}&rdquo;</p>
                <footer className="mt-4">
                  <div className="text-sm font-semibold">{t.author}</div>
                  <div className="text-xs opacity-70">{t.role}</div>
                </footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      {/* SEO content block */}
      <section className="mx-auto max-w-7xl px-4 py-16">
        <h2 className="font-display text-2xl font-extrabold md:text-3xl">
          Your source for professional drone equipment
        </h2>
        <div className="mt-6 grid gap-8 text-sm text-muted-foreground md:grid-cols-2">
          <p>
            SkyGear is a Portland-based drone manufacturer and online shop specializing in professional
            camera drones, FPV racing quadcopters, cinema-grade UAV platforms, intelligent flight
            batteries, 3-axis gimbals, smart controllers, ND filter sets, and drone accessories.
            Since 2018, we have shipped aerial imaging gear to pilots in more than 60 countries.
          </p>
          <p>
            Whether you need a 4K HDR camera drone for wedding filmmaking, a sub-250g foldable travel
            drone for international shoots, an 8K cinema drone with ProRes RAW, or a carbon-frame FPV
            racer for freestyle flying — SkyGear builds repairable, pilot-tested equipment with
            direct-to-pilot pricing. Browse our <Link to="/shop" className="text-primary hover:underline">drone shop</Link>,
            read our <Link to="/guides" className="text-primary hover:underline">buying guides</Link>, or
            <Link to="/contact" className="text-primary hover:underline"> contact our pilot support team</Link>.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border bg-card">
        <div className="mx-auto flex max-w-7xl flex-col items-center px-4 py-16 text-center">
          <h2 className="font-display text-3xl font-extrabold">Ready to take flight?</h2>
          <p className="mt-3 max-w-lg text-muted-foreground">
            Join 60,000+ pilots who trust SkyGear for professional drones, batteries, gimbals and
            accessories. Free shipping on orders over $300.
          </p>
          <Link to="/shop" className="mt-6 rounded-full bg-primary px-10 py-3 text-sm font-bold uppercase text-primary-foreground hover:bg-primary/90">
            Shop now
          </Link>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

function SectionHeading({ title, light }: { title: string; light?: boolean }) {
  return (
    <div className={`flex items-end justify-between border-b-2 pb-3 ${light ? "border-white/20" : "border-border"}`}>
      <h2 className="font-display text-2xl font-extrabold uppercase tracking-tight md:text-3xl">
        <span className="border-b-4 border-primary pb-3">{title}</span>
      </h2>
    </div>
  );
}
