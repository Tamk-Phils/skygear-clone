import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { useCart } from "@/lib/cart-context";
import { useEffect, useState } from "react";
import { Minus, Plus } from "lucide-react";
import { ProductImage } from "@/components/product-image";
import { ProductRating } from "@/components/product-rating";
import { buildMeta, productJsonLd, breadcrumbJsonLd } from "@/lib/seo";
import { resolveProductImages, isVideoUrl } from "@/lib/images";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/product/$slug")({
  loader: async ({ params }) => {
    const { data, error } = await supabase.from("products")
      .select("*, category:categories(name,slug)")
      .eq("slug", params.slug)
      .maybeSingle();
    if (error) throw error;
    if (!data) throw notFound();
    return data;
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Product — SkyGear Drones" }] };
    const images = resolveProductImages(loaderData.images, loaderData.slug);
    const desc = loaderData.short_description ?? loaderData.description?.slice(0, 160) ?? `Buy ${loaderData.name} at SkyGear Drones.`;
    const seo = buildMeta({
      title: `${loaderData.name} — Buy Professional Drone`,
      description: `${desc} Fast, insured delivery. 2-year warranty.`,
      path: `/product/${loaderData.slug}`,
      ogImage: images[0],
      ogType: "product",
    });
    return {
      meta: seo.meta,
      links: seo.links,
      scripts: [
        { type: "application/ld+json", children: JSON.stringify(productJsonLd({ ...loaderData, images })) },
        {
          type: "application/ld+json",
          children: JSON.stringify(
            breadcrumbJsonLd([
              { name: "Home", path: "/" },
              { name: "Shop", path: "/shop" },
              { name: loaderData.name, path: `/product/${loaderData.slug}` },
            ]),
          ),
        },
      ],
    };
  },
  component: ProductPage,
  notFoundComponent: () => (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="font-display text-3xl font-bold">Product not found</h1>
        <p className="mt-2 text-muted-foreground">This drone or accessory may have been discontinued.</p>
        <Link to="/shop" className="mt-4 inline-block text-primary hover:underline">Back to shop</Link>
      </div>
      <SiteFooter />
    </div>
  ),
});

function ProductPage() {
  const { slug } = Route.useParams();
  const { addItem } = useCart();
  const [qty, setQty] = useState(1);
  const [api, setApi] = useState<CarouselApi>();
  const [active, setActive] = useState(0);

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", slug],
    queryFn: async () => {
      const { data, error } = await supabase.from("products")
        .select("*, category:categories(name,slug)")
        .eq("slug", slug).maybeSingle();
      if (error) throw error;
      if (!data) throw notFound();
      return data;
    },
  });

  const images = product ? resolveProductImages(product.images, product.slug) : [];

  useEffect(() => {
    if (!api) return;
    const onSelect = () => setActive(api.selectedScrollSnap());
    api.on("select", onSelect);
    onSelect();
    return () => api.off("select", onSelect);
  }, [api]);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="mx-auto max-w-7xl px-4 py-10">
        {isLoading ? <div className="py-20 text-center text-sm text-muted-foreground">Loading…</div> : product && (
          <>
            <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap gap-x-2 gap-y-1 text-sm text-muted-foreground">
              <Link to="/" className="hover:text-primary">Home</Link>
              <span>/</span>
              <Link to="/shop" className="hover:text-primary">Shop</Link>
              {product.category && (
                <>
                  <span>/</span>
                  <Link to="/shop" search={{ category: product.category.slug }} className="hover:text-primary">{product.category.name}</Link>
                </>
              )}
              <span>/</span>
              <span className="text-foreground">{product.name}</span>
            </nav>

            <div className="grid gap-10 md:grid-cols-2">
              <div>
                <Carousel setApi={setApi} opts={{ loop: false }} className="relative">
                  <div className="overflow-hidden rounded-lg border border-border bg-muted">
                    <CarouselContent>
                      {images.map((im, i) => (
                        <CarouselItem key={im + i} className="pl-0">
                          <div className="aspect-square">
                            {isVideoUrl(im) ? (
                              <video
                                key={im}
                                src={im}
                                controls
                                className="size-full object-cover"
                                aria-label={`${product.name} — product video`}
                              />
                            ) : (
                              <ProductImage
                                src={im}
                                slug={product.slug}
                                alt={`${product.name} — SkyGear professional drone`}
                                className="size-full object-cover"
                              />
                            )}
                          </div>
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                  </div>

                  {images.length > 1 && (
                    <>
                      <CarouselPrevious className="left-3 top-1/2 border-border bg-background/80 hover:bg-background" />
                      <CarouselNext className="right-3 top-1/2 border-border bg-background/80 hover:bg-background" />
                      <div className="mt-3 flex justify-center gap-2">
                        {images.map((_, i) => (
                          <button
                            key={i}
                            type="button"
                            aria-label={`Go to media ${i + 1}`}
                            onClick={() => api?.scrollTo(i)}
                            className={cn(
                              "h-2 rounded-full transition-all",
                              i === active ? "w-8 bg-primary" : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50",
                            )}
                          />
                        ))}
                      </div>
                      <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                        {images.map((im, i) => (
                          <button
                            key={im + i}
                            type="button"
                            onClick={() => api?.scrollTo(i)}
                            className={cn(
                              "relative size-16 shrink-0 overflow-hidden rounded border-2",
                              i === active ? "border-primary" : "border-border",
                            )}
                          >
                            {isVideoUrl(im) ? (
                              <>
                                <video src={im} className="size-full object-cover" muted />
                                <span className="pointer-events-none absolute left-0.5 top-0.5 rounded bg-black/70 px-1 py-px text-[8px] font-bold uppercase text-white">▶</span>
                              </>
                            ) : (
                              <ProductImage src={im} slug={product.slug} alt="" className="size-full object-cover" />
                            )}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </Carousel>
              </div>
              <div>
                {product.category && (
                  <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">{product.category.name}</p>
                )}
                <h1 className="mt-2 font-display text-2xl font-extrabold sm:text-3xl">{product.name}</h1>
                <ProductRating rating={5} className="mt-3" />
                <div className="mt-3 flex flex-wrap items-baseline gap-3">
                  <span className="font-display text-2xl font-bold text-primary sm:text-3xl">${Number(product.price).toFixed(2)}</span>
                  {product.compare_at_price && Number(product.compare_at_price) > Number(product.price) && (
                    <span className="text-lg text-muted-foreground line-through">${Number(product.compare_at_price).toFixed(2)}</span>
                  )}
                </div>
                {product.short_description && <p className="mt-4 text-muted-foreground">{product.short_description}</p>}

                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                  <div className="flex items-center self-start overflow-hidden rounded-full border border-border">
                    <button onClick={() => setQty(Math.max(1, qty - 1))} className="grid size-10 place-items-center" aria-label="Decrease quantity"><Minus className="size-4" /></button>
                    <span className="w-10 text-center text-sm font-semibold">{qty}</span>
                    <button onClick={() => setQty(qty + 1)} className="grid size-10 place-items-center" aria-label="Increase quantity"><Plus className="size-4" /></button>
                  </div>
                  <button
                    onClick={() => addItem(product.id, qty)}
                    disabled={product.stock < 1}
                    className="w-full rounded-full bg-primary px-8 py-3 text-sm font-bold uppercase tracking-wide text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50 sm:flex-1"
                  >
                    {product.stock < 1 ? "Out of stock" : "Add to cart"}
                  </button>
                </div>

                <ul className="mt-6 space-y-2 text-sm text-muted-foreground">
                  <li>✓ Fast, insured delivery</li>
                  <li>✓ 2-year manufacturer warranty</li>
                  <li>✓ 30-day hassle-free returns</li>
                  <li>✓ Expert pilot support included</li>
                </ul>

                {product.description && (
                  <div className="prose prose-sm mt-10 max-w-none whitespace-pre-line text-foreground">
                    <h2 className="font-display text-lg font-bold">Product description</h2>
                    <p className="text-muted-foreground">{product.description}</p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
      <SiteFooter />
    </div>
  );
}
