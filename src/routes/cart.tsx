import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { useCart } from "@/lib/cart-context";
import { useAuth } from "@/lib/auth-context";
import { Minus, Plus, Trash2 } from "lucide-react";

export const Route = createFileRoute("/cart")({
  head: () => ({ meta: [{ title: "Cart — SkyGear" }] }),
  component: CartPage,
});

function CartPage() {
  const { items, subtotal, updateItem, removeItem } = useCart();
  const { user } = useAuth();

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
                <div key={it.id} className="flex gap-4 p-4">
                  <div className="size-24 shrink-0 overflow-hidden rounded bg-muted">
                    {it.product.images?.[0] && <img src={it.product.images[0]} alt={it.product.name} className="size-full object-cover" />}
                  </div>
                  <div className="flex flex-1 flex-col">
                    <Link to="/product/$slug" params={{ slug: it.product.slug }} className="font-semibold hover:text-primary">{it.product.name}</Link>
                    <div className="mt-1 text-sm text-primary font-semibold">${Number(it.product.price).toFixed(2)}</div>
                    <div className="mt-auto flex items-center justify-between">
                      <div className="flex items-center overflow-hidden rounded-full border border-border">
                        <button onClick={() => updateItem(it.id, it.quantity - 1)} className="grid size-8 place-items-center"><Minus className="size-3" /></button>
                        <span className="w-8 text-center text-sm">{it.quantity}</span>
                        <button onClick={() => updateItem(it.id, it.quantity + 1)} className="grid size-8 place-items-center"><Plus className="size-3" /></button>
                      </div>
                      <button onClick={() => removeItem(it.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="size-4" /></button>
                    </div>
                  </div>
                  <div className="text-right font-semibold">${(Number(it.product.price) * it.quantity).toFixed(2)}</div>
                </div>
              ))}
            </div>
            <aside className="h-fit rounded-lg border border-border bg-card p-6">
              <h3 className="font-display text-lg font-bold">Order summary</h3>
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span>{subtotal >= 300 ? "Free" : "$25.00"}</span></div>
                <div className="mt-2 flex justify-between border-t border-border pt-3 text-base font-bold">
                  <span>Total</span><span className="text-primary">${(subtotal + (subtotal >= 300 ? 0 : 25)).toFixed(2)}</span>
                </div>
              </div>
              <button className="mt-6 w-full rounded-full bg-primary py-3 text-sm font-bold uppercase text-primary-foreground">Checkout</button>
              <p className="mt-3 text-center text-xs text-muted-foreground">Checkout is a demo — hook up a payment provider to enable it.</p>
            </aside>
          </div>
        )}
      </div>
      <SiteFooter />
    </div>
  );
}
