import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { useCart } from "@/lib/cart-context";
import { useAuth } from "@/lib/auth-context";
import { ProductImage } from "@/components/product-image";
import { Minus, Plus, Trash2 } from "lucide-react";

import { buildMeta } from "@/lib/seo";

export const Route = createFileRoute("/cart")({
  head: () => {
    const seo = buildMeta({
      title: "Shopping Cart",
      description: "Your SkyGear drone shopping cart.",
      path: "/cart",
      noindex: true,
    });
    return { meta: seo.meta, links: seo.links };
  },
  component: CartPage,
});

function CartPage() {
  const { items, subtotal, updateItem, removeItem } = useCart();
  const { user } = useAuth();
  const shipping = 25;

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="mx-auto max-w-6xl px-4 py-10">
        <h1 className="font-display text-3xl font-extrabold">Your cart</h1>

        {!user ? (
          <div className="mt-10 rounded-lg border border-border bg-card p-10 text-center">
            <p className="text-muted-foreground">Please sign in to view your cart.</p>
            <Link to="/auth" className="mt-4 inline-block rounded-full bg-primary px-6 py-2 text-sm font-bold uppercase text-primary-foreground">Sign in</Link>
          </div>
        ) : items.length === 0 ? (
          <div className="mt-10 rounded-lg border border-border bg-card p-10 text-center">
            <p className="text-muted-foreground">Your cart is empty.</p>
            <Link to="/shop" className="mt-4 inline-block rounded-full bg-primary px-6 py-2 text-sm font-bold uppercase text-primary-foreground">Continue shopping</Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-8 md:grid-cols-[1fr_320px]">
            <div className="divide-y divide-border rounded-lg border border-border bg-card">
              {items.map(it => (
                <div key={it.id} className="flex gap-3 p-4 sm:gap-4">
                  <div className="size-20 shrink-0 overflow-hidden rounded bg-muted sm:size-24">
                    <ProductImage
                      src={it.product.images?.[0]}
                      slug={it.product.slug}
                      alt={it.product.name}
                      className="size-full object-cover"
                    />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <Link to="/product/$slug" params={{ slug: it.product.slug }} className="line-clamp-2 font-semibold hover:text-primary">{it.product.name}</Link>
                    <div className="mt-1 text-sm font-semibold text-primary">${Number(it.product.price).toFixed(2)}</div>
                    <div className="mt-auto flex items-center justify-between gap-2 pt-3">
                      <div className="flex items-center overflow-hidden rounded-full border border-border">
                        <button onClick={() => updateItem(it.id, it.quantity - 1)} className="grid size-8 place-items-center"><Minus className="size-3" /></button>
                        <span className="w-8 text-center text-sm">{it.quantity}</span>
                        <button onClick={() => updateItem(it.id, it.quantity + 1)} className="grid size-8 place-items-center"><Plus className="size-3" /></button>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold sm:hidden">${(Number(it.product.price) * it.quantity).toFixed(2)}</span>
                        <button onClick={() => removeItem(it.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="size-4" /></button>
                      </div>
                    </div>
                  </div>
                  <div className="hidden shrink-0 text-right font-semibold sm:block">
                    ${(Number(it.product.price) * it.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
            <aside className="h-fit rounded-lg border border-border bg-card p-6">
              <h3 className="font-display text-lg font-bold">Order summary</h3>
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span>${shipping.toFixed(2)}</span></div>
                <div className="mt-2 flex justify-between border-t border-border pt-3 text-base font-bold">
                  <span>Total</span><span className="text-primary">${(subtotal + shipping).toFixed(2)}</span>
                </div>
              </div>
              <Link
                to="/checkout"
                className="mt-6 block w-full rounded-full bg-primary py-3 text-center text-sm font-bold uppercase text-primary-foreground hover:bg-primary/90"
              >
                Proceed to checkout
              </Link>
              <p className="mt-3 text-center text-xs text-muted-foreground">
                Secure card payment — support will contact you to confirm your order.
              </p>
            </aside>
          </div>
        )}
      </div>
      <SiteFooter />
    </div>
  );
}
