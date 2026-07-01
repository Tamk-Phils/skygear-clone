import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { useCart } from "@/lib/cart-context";
import { useState } from "react";
import { Minus, Plus } from "lucide-react";

export const Route = createFileRoute("/product/$slug")({
  head: () => ({ meta: [{ title: "Product — SkyGear" }] }),
  component: ProductPage,
  notFoundComponent: () => (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="font-display text-3xl font-bold">Product not found</h1>
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
  const [activeImg, setActiveImg] = useState(0);

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

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="mx-auto max-w-7xl px-4 py-10">
        {isLoading ? <div className="py-20 text-center text-sm text-muted-foreground">Loading…</div> : product && (
          <div className="grid gap-10 md:grid-cols-2">
            <div>
              <div className="aspect-square overflow-hidden rounded-lg border border-border bg-muted">
                {product.images?.[activeImg] ? (
                  <img src={product.images[activeImg]} alt={product.name} className="size-full object-cover" />
                ) : <div className="grid size-full place-items-center text-sm text-muted-foreground">No image</div>}
              </div>
              {product.images && product.images.length > 1 && (
                <div className="mt-3 flex gap-2">
                  {product.images.map((im: string, i: number) => (
                    <button key={i} onClick={() => setActiveImg(i)} className={`size-16 overflow-hidden rounded border-2 ${i === activeImg ? "border-primary" : "border-border"}`}>
                      <img src={im} alt="" className="size-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div>
              {product.category && (
                <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">{product.category.name}</p>
              )}
              <h1 className="mt-2 font-display text-3xl font-extrabold">{product.name}</h1>
              <div className="mt-3 flex items-baseline gap-3">
                <span className="font-display text-3xl font-bold text-primary">${Number(product.price).toFixed(2)}</span>
                {product.compare_at_price && Number(product.compare_at_price) > Number(product.price) && (
                  <span className="text-lg text-muted-foreground line-through">${Number(product.compare_at_price).toFixed(2)}</span>
                )}
              </div>
              {product.short_description && <p className="mt-4 text-muted-foreground">{product.short_description}</p>}

              <div className="mt-6 flex items-center gap-4">
                <div className="flex items-center overflow-hidden rounded-full border border-border">
                  <button onClick={() => setQty(Math.max(1, qty - 1))} className="grid size-10 place-items-center"><Minus className="size-4" /></button>
                  <span className="w-10 text-center text-sm font-semibold">{qty}</span>
                  <button onClick={() => setQty(qty + 1)} className="grid size-10 place-items-center"><Plus className="size-4" /></button>
                </div>
                <button
                  onClick={() => addItem(product.id, qty)}
                  disabled={product.stock < 1}
                  className="flex-1 rounded-full bg-primary px-8 py-3 text-sm font-bold uppercase tracking-wide text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50"
                >
                  {product.stock < 1 ? "Out of stock" : "Add to cart"}
                </button>
              </div>

              {product.description && (
                <div className="prose prose-sm mt-10 max-w-none whitespace-pre-line text-foreground">
                  <h3 className="font-display text-lg font-bold">Description</h3>
                  <p className="text-muted-foreground">{product.description}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      <SiteFooter />
    </div>
  );
}
