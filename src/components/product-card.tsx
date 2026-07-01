import { Link } from "@tanstack/react-router";
import { useCart } from "@/lib/cart-context";
import { resolveImageUrl } from "@/lib/images";
import { ProductImage } from "@/components/product-image";
import { ShoppingBag } from "lucide-react";

export type ProductCardData = {
  id: string;
  name: string;
  slug: string;
  price: number;
  compare_at_price: number | null;
  images: string[];
};

export function ProductCard({ p }: { p: ProductCardData }) {
  const { addItem } = useCart();
  const img = resolveImageUrl(p.images?.[0], p.slug);
  return (
    <div className="group flex flex-col overflow-hidden rounded-lg border border-border bg-card transition hover:shadow-lg">
      <Link to="/product/$slug" params={{ slug: p.slug }} className="relative aspect-square overflow-hidden bg-muted">
        <ProductImage src={img} slug={p.slug} alt={p.name} loading="lazy" className="size-full object-cover transition duration-500 group-hover:scale-105" />
        {p.compare_at_price && Number(p.compare_at_price) > Number(p.price) && (
          <span className="absolute left-3 top-3 rounded-full bg-primary px-2.5 py-1 text-[10px] font-bold uppercase text-primary-foreground">Sale</span>
        )}
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-3 sm:p-4">
        <Link to="/product/$slug" params={{ slug: p.slug }} className="line-clamp-2 text-sm font-semibold hover:text-primary">
          {p.name}
        </Link>
        <div className="mt-auto flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="font-display text-base font-bold text-primary sm:text-lg">${Number(p.price).toFixed(2)}</span>
            {p.compare_at_price && Number(p.compare_at_price) > Number(p.price) && (
              <span className="text-xs text-muted-foreground line-through">${Number(p.compare_at_price).toFixed(2)}</span>
            )}
          </div>
          <button
            onClick={() => addItem(p.id)}
            className="grid size-9 place-items-center rounded-full bg-primary text-primary-foreground transition hover:bg-primary/90"
            aria-label="Add to cart"
          >
            <ShoppingBag className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
