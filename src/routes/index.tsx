import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ProductCard, type ProductCardData } from "@/components/product-card";
import { HomeHeroCarousel } from "@/components/home-hero-carousel";
import { ProductRating } from "@/components/product-rating";
import {
  Truck,
  ShieldCheck,
  Headphones,
  RefreshCw,
  Building2,
  Shield,
  Zap,
  Sprout,
  BadgeCheck,
  CreditCard,
  Package,
} from "lucide-react";
import { buildMeta } from "@/lib/seo";
import { IMAGES, resolveImageUrl } from "@/lib/images";
import { ProductImage } from "@/components/product-image";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => {
    const seo = buildMeta({
      title: "Pro Drones, Gimbals & Accessories — Shop SkyGear",
      description:
        "Buy professional camera drones, FPV racing quadcopters, cinema UAVs, intelligent flight batteries, 3-axis gimbals and drone accessories. Fast, insured delivery. Trusted by 60,000+ pilots worldwide.",
      path: "/",
    });
    return { meta: seo.meta, links: seo.links };
  },
  component: Home,
});

// Use distinct local assets to avoid repeated imagery on mobile cards.
const CATEGORY_SPOTLIGHTS = [
  { slug: "drones", badge: "Best trending", title: "Drones", cta: "Shop now", image: IMAGES.products["skygear-fpv-racer"] },
  { slug: "gimbals", badge: "Top rated", title: "Gimbals & cameras", cta: "View collection", image: IMAGES.products["smart-controller"] },
  { slug: "accessories", badge: "Trending", title: "Accessories", cta: "Buy now", image: IMAGES.products["nd-filter-set"] },
] as const;

const INDUSTRIES = [
  {
    icon: Shield,
    title: "Public safety",
    desc: "Extend your vision and ensure new levels of safety for first responders and search teams.",
    image: IMAGES.hero,
  },
  {
    icon: Building2,
    title: "Construction",
    desc: "Manage your projects with higher precision, progress tracking, and site efficiency.",
    image: IMAGES.products["skygear-mini-fold"],
  },
  {
    icon: Zap,
    title: "Energy",
    desc: "Advance your operations with increased accuracy for line inspection and asset monitoring.",
    image: IMAGES.products["intelligent-flight-battery"],
  },
  {
    icon: Sprout,
    title: "Agriculture",
    desc: "Make your farming smart and profitable with crop mapping and precision spraying workflows.",
    image: IMAGES.products["skygear-cinema-8k"],
  },
];

const TRUST_POINTS = [
  { icon: BadgeCheck, text: "Authorized SkyGear equipment — genuine products with manufacturer warranty" },
  { icon: ShieldCheck, text: "8+ years of trust — voted a top online drone shop by pilots worldwide" },
  { icon: Package, text: "Best prices & exclusive deals — save more on professional UAV gear" },
  { icon: Truck, text: "Free & fast shipping — secure delivery on qualifying drone orders" },
  { icon: CreditCard, text: "Flexible checkout — secure card payment with pilot support confirmation" },
];

const TESTIMONIALS = [
  {
    quote: "The camera quality on SkyGear drones is exceptional. 4K HDR footage looks stunning for both amateur and professional aerial work.",
    author: "Serena K.",
    handle: "@sera",
    role: "Aerial photographer",
  },
  {
    quote: "Stabilization holds up even in windy conditions — a reliable choice for filmmakers and content creators on location.",
    author: "John D.",
    handle: "@john",
    role: "Commercial videographer",
  },
  {
    quote: "The accessory selection complements the drone experience perfectly — batteries, cases, and ND filters all in one place.",
    author: "Steven M.",
    handle: "@steev",
    role: "FPV pilot",
  },
  {
    quote: "ND filters give much better exposure control in bright conditions — a serious advantage for outdoor shoots.",
    author: "David L.",
    handle: "@david",
    role: "Documentary DP",
  },
  {
    quote: "Customer service is top-notch. The team helped me pick the right drone and answered every spec question promptly.",
    author: "Godwill A.",
    handle: "@will",
    role: "Survey contractor",
  },
  {
    quote: "Comprehensive guides on the site made setup easy. I felt supported from purchase through first flight.",
    author: "Ashley R.",
    handle: "@ash",
    role: "Hobbyist pilot",
  },
];

type ProductTab = "featured" | "bestsellers" | "onsale";

function Home() {
  const [productTab, setProductTab] = useState<ProductTab>("featured");

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase.from("categories").select("*").order("sort_order").limit(8);
      if (error) throw error;
      return data;
    },
  });

  const { data: products } = useQuery({
    queryKey: ["home-products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id,name,slug,price,compare_at_price,images,is_featured")
        .eq("is_published", true)
        .order("is_featured", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(12);
      if (error) throw error;
      return data as ProductCardData[];
    },
  });

  const tabProducts = useMemo(() => {
    const rows = products ?? [];
    if (productTab === "bestsellers") return rows.slice(0, 8);
    if (productTab === "onsale") {
      return rows.filter((p) => p.compare_at_price && Number(p.compare_at_price) > Number(p.price)).slice(0, 8);
    }
    return rows.filter((p) => p.is_featured).slice(0, 8).length
      ? rows.filter((p) => p.is_featured).slice(0, 8)
      : rows.slice(0, 8);
  }, [products, productTab]);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <HomeHeroCarousel />

      {/* Trust strip */}
      <section className="border-b border-border bg-card">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:grid-cols-2 md:grid-cols-4">
          {[
            { i: Truck, t: "Fast delivery", d: "Insured shipping options" },
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

      {/* Category spotlights — buydjidrone-style large promo blocks */}
      <section className="mx-auto max-w-7xl px-4 py-14">
        <SectionHeading title="Shop by collection" />
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {CATEGORY_SPOTLIGHTS.map((c) => (
            <Link
              key={c.slug}
              to="/shop"
              search={{ category: c.slug }}
              className="group relative min-h-[220px] overflow-hidden rounded-xl sm:min-h-[280px]"
            >
              <img
                src={c.image}
                alt={c.title}
                className="absolute inset-0 size-full object-cover transition duration-700 group-hover:scale-105"
              />
              {/* No blur/haze overlays — just a light, readable scrim. */}
              <div className="absolute inset-0 bg-black/35" />
              <div className="relative flex h-full flex-col justify-end p-6 text-white">
                <p className="inline-flex w-fit rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.25em] text-primary">
                  {c.badge}
                </p>
                <h3 className="mt-3 font-display text-2xl font-extrabold drop-shadow-[0_2px_10px_rgba(0,0,0,0.35)] sm:text-3xl">
                  {c.title}
                </h3>
                <span className="mt-4 inline-flex w-fit rounded-full bg-white/10 px-5 py-2 text-xs font-bold uppercase tracking-wide transition hover:bg-white/15">
                  {c.cta}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Enterprise industries */}
      <section className="bg-navy text-navy-foreground">
        <div className="mx-auto max-w-7xl px-4 py-14">
          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary">Enterprise solutions</p>
            <h2 className="mt-2 font-display text-2xl font-extrabold sm:text-3xl md:text-4xl">
              Specializing in drone technology for diverse industries
            </h2>
            <p className="mt-4 text-sm opacity-85 sm:text-base">
              Our team of drone experts develops and supports comprehensive UAV solutions for organizations
              across public safety, construction, energy, and agriculture. Contact us for fleet recommendations.
            </p>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {INDUSTRIES.map(({ icon: Icon, title, desc, image }) => (
              <div key={title} className="group overflow-hidden rounded-lg border border-white/10 bg-white/5">
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={image}
                    alt={title}
                    className="size-full object-cover transition duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
                <div className="p-5">
                  <Icon className="size-6 text-primary" />
                  <h3 className="mt-3 font-display text-lg font-bold">{title}</h3>
                  <p className="mt-2 text-sm opacity-80">{desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link
              to="/contact"
              className="inline-flex rounded-full bg-primary px-8 py-3 text-sm font-bold uppercase tracking-wide text-primary-foreground hover:bg-primary/90"
            >
              Contact enterprise sales
            </Link>
          </div>
        </div>
      </section>

      {/* Product tabs */}
      <section className="mx-auto max-w-7xl px-4 py-14">
        <SectionHeading title="Featured products" />
        <div className="mt-6 flex flex-wrap gap-2 border-b border-border pb-4">
          {(
            [
              { id: "featured", label: "Featured" },
              { id: "bestsellers", label: "Best sellers" },
              { id: "onsale", label: "On sale" },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setProductTab(tab.id)}
              className={cn(
                "rounded-full px-5 py-2 text-sm font-semibold uppercase tracking-wide transition",
                productTab === tab.id
                  ? "bg-primary text-primary-foreground"
                  : "border border-border text-muted-foreground hover:border-primary hover:text-primary",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {tabProducts.length > 0 ? (
            tabProducts.map((p) => <ProductCard key={p.id} p={p} />)
          ) : (
            <p className="col-span-full py-12 text-center text-sm text-muted-foreground">
              No products in this collection yet.{" "}
              <Link to="/shop" className="text-primary hover:underline">
                Browse the full shop
              </Link>
            </p>
          )}
        </div>
        <div className="mt-8 text-center">
          <Link
            to="/shop"
            className="inline-block rounded-full border border-border px-8 py-3 text-sm font-bold uppercase tracking-wide hover:border-primary hover:text-primary"
          >
            View all products
          </Link>
        </div>
      </section>

      {/* All categories grid */}
      <section className="bg-card">
        <div className="mx-auto max-w-7xl px-4 py-14">
          <SectionHeading title="Top trending categories" />
          <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
            {(categories ?? []).map((c) => (
              <Link
                key={c.id}
                to="/shop"
                search={{ category: c.slug }}
                className="group flex flex-col overflow-hidden rounded-lg border border-border bg-background transition hover:border-primary/40 hover:shadow-md"
              >
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

      {/* About / trust */}
      <section className="mx-auto max-w-7xl px-4 py-14">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary">About us</p>
            <h2 className="mt-2 font-display text-2xl font-extrabold sm:text-3xl md:text-4xl">
              SkyGear Drones — built for pilots who take the shot seriously
            </h2>
            <p className="mt-4 text-sm text-muted-foreground sm:text-base">
              Whether you&apos;re a professional filmmaker, aerial photographer, FPV racer, or hobbyist, we offer
              the latest SkyGear drones at competitive prices — with expert pilot support on every purchase.
            </p>
            <ul className="mt-6 space-y-3">
              {TRUST_POINTS.map(({ icon: Icon, text }) => (
                <li key={text} className="flex gap-3 text-sm text-muted-foreground">
                  <Icon className="mt-0.5 size-5 shrink-0 text-primary" />
                  <span>{text}</span>
                </li>
              ))}
            </ul>
            <Link
              to="/about"
              className="mt-8 inline-flex rounded-full bg-primary px-8 py-3 text-sm font-bold uppercase tracking-wide text-primary-foreground hover:bg-primary/90"
            >
              Learn more
            </Link>
          </div>
          <div className="overflow-hidden rounded-xl border border-border">
            <img
              src={IMAGES.products["skygear-cinema-8k"]}
              alt="SkyGear cinema drone"
              className="aspect-[4/3] size-full object-cover"
              loading="lazy"
            />
          </div>
        </div>
      </section>

      {/* Testimonials carousel-style grid */}
      <section className="border-y border-border bg-muted/40">
        <div className="mx-auto max-w-7xl px-4 py-14">
          <SectionHeading title="What pilots are saying" />
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <blockquote
                key={t.author}
                className="rounded-lg border border-border bg-card p-5 shadow-sm"
              >
                <ProductRating rating={5} compact />
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">&ldquo;{t.quote}&rdquo;</p>
                <footer className="mt-4 border-t border-border pt-4">
                  <div className="text-sm font-semibold">{t.author}</div>
                  <div className="text-xs text-primary">{t.handle}</div>
                  <div className="text-xs text-muted-foreground">{t.role}</div>
                </footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      {/* SEO content block */}
      <section className="mx-auto max-w-7xl px-4 py-14">
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
            direct-to-pilot pricing. Browse our{" "}
            <Link to="/shop" className="text-primary hover:underline">
              drone shop
            </Link>
            , read our{" "}
            <Link to="/guides" className="text-primary hover:underline">
              buying guides
            </Link>
            , or{" "}
            <Link to="/contact" className="text-primary hover:underline">
              contact our pilot support team
            </Link>
            .
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border bg-card">
        <div className="mx-auto flex max-w-7xl flex-col items-center px-4 py-14 text-center">
          <h2 className="font-display text-2xl font-extrabold sm:text-3xl">Order now &amp; experience the future of flight</h2>
          <p className="mt-3 max-w-lg text-muted-foreground">
            Don&apos;t miss out on the best SkyGear drone deals. Shop today for fast shipping, premium
            customer support, and unbeatable pilot-direct pricing.
          </p>
          <Link
            to="/shop"
            className="mt-6 rounded-full bg-primary px-10 py-3 text-sm font-bold uppercase text-primary-foreground hover:bg-primary/90"
          >
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
      <h2 className="font-display text-xl font-extrabold uppercase tracking-tight sm:text-2xl md:text-3xl">
        <span className="border-b-4 border-primary pb-3">{title}</span>
      </h2>
    </div>
  );
}
