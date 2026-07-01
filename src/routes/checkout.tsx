import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { useCart } from "@/lib/cart-context";
import { useAuth } from "@/lib/auth-context";
import { ProductImage } from "@/components/product-image";
import { buildMeta } from "@/lib/seo";
import { CreditCard, Lock, Mail, Phone, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/checkout")({
  head: () => {
    const seo = buildMeta({
      title: "Checkout — Secure Payment",
      description: "Complete your SkyGear drone order with secure card payment.",
      path: "/checkout",
      noindex: true,
    });
    return { meta: seo.meta, links: seo.links };
  },
  component: CheckoutPage,
});

function formatCardNumber(value: string) {
  return value.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
}

function formatExpiry(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

function CheckoutPage() {
  const { user } = useAuth();
  const { items, subtotal, clearCart } = useCart();
  const shipping = subtotal >= 300 ? 0 : 25;
  const total = subtotal + shipping;

  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [busy, setBusy] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [orderRef, setOrderRef] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setBusy(true);

    const ref = `SG-${Date.now().toString(36).toUpperCase()}`;
    const cardLastFour = cardNumber.replace(/\D/g, "").slice(-4);

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        order_ref: ref,
        user_id: user.id,
        status: "pending",
        subtotal,
        shipping,
        total,
        customer_email: user.email ?? null,
        card_name: cardName,
        card_last_four: cardLastFour || null,
      })
      .select("id")
      .single();

    if (orderError) {
      setBusy(false);
      toast.error(orderError.message);
      return;
    }

    const lineItems = items.map((it) => ({
      order_id: order.id,
      product_id: it.product_id,
      product_name: it.product.name,
      product_slug: it.product.slug,
      quantity: it.quantity,
      unit_price: it.product.price,
    }));

    const { error: itemsError } = await supabase.from("order_items").insert(lineItems);
    if (itemsError) {
      setBusy(false);
      toast.error(itemsError.message);
      return;
    }

    await clearCart();
    setOrderRef(ref);
    setBusy(false);
    setSubmitted(true);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <div className="mx-auto max-w-lg px-4 py-24 text-center">
          <h1 className="font-display text-3xl font-extrabold">Checkout</h1>
          <p className="mt-3 text-muted-foreground">Sign in to complete your order.</p>
          <Link to="/auth" className="mt-6 inline-block rounded-full bg-primary px-8 py-3 text-sm font-bold uppercase text-primary-foreground">
            Sign in
          </Link>
        </div>
        <SiteFooter />
      </div>
    );
  }

  if (items.length === 0 && !submitted) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <div className="mx-auto max-w-lg px-4 py-24 text-center">
          <h1 className="font-display text-3xl font-extrabold">Checkout</h1>
          <p className="mt-3 text-muted-foreground">Your cart is empty.</p>
          <Link to="/shop" className="mt-6 inline-block rounded-full bg-primary px-8 py-3 text-sm font-bold uppercase text-primary-foreground">
            Shop drones
          </Link>
        </div>
        <SiteFooter />
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <div className="mx-auto max-w-xl px-4 py-16">
          <div className="rounded-lg border border-border bg-card p-8 text-center">
            <div className="mx-auto grid size-14 place-items-center rounded-full bg-primary/15 text-primary">
              <ShieldCheck className="size-7" />
            </div>
            <h1 className="mt-4 font-display text-2xl font-extrabold">Payment details received</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Reference: <span className="font-mono font-semibold text-foreground">{orderRef}</span>
            </p>
            <p className="mt-4 text-muted-foreground">
              Thank you for your order. A SkyGear pilot will review your payment and contact you within
              one business day to confirm shipping, delivery timeline, and any order-specific details.
            </p>
            <div className="mt-6 rounded-lg border border-primary/30 bg-primary/5 p-5 text-left text-sm">
              <p className="font-semibold text-foreground">Contact support to finalize your order</p>
              <ul className="mt-3 space-y-2 text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Mail className="size-4 shrink-0 text-primary" />
                  <a href="mailto:hello@skygear.com" className="hover:text-primary">hello@skygear.com</a>
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="size-4 shrink-0 text-primary" />
                  <span>+1 (503) 555-0142</span>
                </li>
              </ul>
              <p className="mt-3 text-xs">
                Please include your reference number when contacting support. Do not share your full card
                number by email — our team will verify payment through our secure channel.
              </p>
            </div>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link to="/contact" className="rounded-full bg-primary px-6 py-2.5 text-sm font-bold uppercase text-primary-foreground">
                Contact support
              </Link>
              <Link to="/shop" className="rounded-full border border-border px-6 py-2.5 text-sm font-bold uppercase hover:border-primary hover:text-primary">
                Continue shopping
              </Link>
            </div>
          </div>
        </div>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="mx-auto max-w-6xl px-4 py-10">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">Secure checkout</p>
        <h1 className="mt-2 font-display text-3xl font-extrabold">Payment</h1>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px] lg:gap-8">
          <form onSubmit={submit} className="min-w-0 space-y-6">
            <section className="rounded-lg border border-border bg-card p-4 sm:p-6">
              <div className="flex items-center gap-2">
                <CreditCard className="size-5 text-primary" />
                <h2 className="font-display text-lg font-bold">Card details</h2>
                <Lock className="ml-auto size-4 text-muted-foreground" />
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Your card information is collected securely. A SkyGear support specialist will contact you
                to confirm payment and delivery details before your order ships.
              </p>

              <div className="mt-5 space-y-4">
                <label className="block">
                  <span className="text-xs font-semibold uppercase text-muted-foreground">Name on card</span>
                  <input
                    required
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    autoComplete="cc-name"
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-semibold uppercase text-muted-foreground">Card number</span>
                  <input
                    required
                    inputMode="numeric"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                    placeholder="1234 5678 9012 3456"
                    autoComplete="cc-number"
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2.5 font-mono text-sm outline-none focus:border-primary"
                  />
                </label>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="text-xs font-semibold uppercase text-muted-foreground">Expiry</span>
                    <input
                      required
                      inputMode="numeric"
                      value={expiry}
                      onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                      placeholder="MM/YY"
                      autoComplete="cc-exp"
                      className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2.5 font-mono text-sm outline-none focus:border-primary"
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs font-semibold uppercase text-muted-foreground">CVC</span>
                    <input
                      required
                      inputMode="numeric"
                      value={cvc}
                      onChange={(e) => setCvc(e.target.value.replace(/\D/g, "").slice(0, 4))}
                      placeholder="123"
                      autoComplete="cc-csc"
                      className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2.5 font-mono text-sm outline-none focus:border-primary"
                    />
                  </label>
                </div>
              </div>
            </section>

            <section className="rounded-lg border border-border bg-card p-4 sm:p-6">
              <h2 className="font-display text-lg font-bold">Billing contact</h2>
              <p className="mt-1 text-sm text-muted-foreground">{user.email}</p>
              <p className="mt-3 text-xs text-muted-foreground">
                Shipping address and delivery options will be confirmed by our support team after payment
                review. For bulk orders or international shipping, mention your requirements when contacted.
              </p>
            </section>

            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-full bg-primary py-3.5 text-sm font-bold uppercase tracking-wide text-primary-foreground transition hover:bg-primary/90 disabled:opacity-60"
            >
              {busy ? "Processing…" : `Pay $${total.toFixed(2)}`}
            </button>

            <p className="text-center text-xs text-muted-foreground">
              By placing this order you agree to our{" "}
              <Link to="/terms" className="text-primary hover:underline">terms</Link> and{" "}
              <Link to="/shipping" className="text-primary hover:underline">shipping policy</Link>.
              Online card payment requires support confirmation before dispatch.
            </p>
          </form>

          <aside className="h-fit rounded-lg border border-border bg-card p-4 sm:p-6">
            <h3 className="font-display text-lg font-bold">Order summary</h3>
            <ul className="mt-4 space-y-3">
              {items.map((it) => (
                <li key={it.id} className="flex gap-3 text-sm">
                  <div className="size-14 shrink-0 overflow-hidden rounded bg-muted">
                    <ProductImage
                      src={it.product.images?.[0]}
                      slug={it.product.slug}
                      alt={it.product.name}
                      className="size-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{it.product.name}</div>
                    <div className="text-muted-foreground">Qty {it.quantity}</div>
                  </div>
                  <div className="font-semibold">${(Number(it.product.price) * it.quantity).toFixed(2)}</div>
                </li>
              ))}
            </ul>
            <div className="mt-4 space-y-2 border-t border-border pt-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span>{shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between border-t border-border pt-3 text-base font-bold">
                <span>Total</span>
                <span className="text-primary">${total.toFixed(2)}</span>
              </div>
            </div>
          </aside>
        </div>
      </div>
      <SiteFooter />
    </div>
  );
}
