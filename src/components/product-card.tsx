import { Link } from "@tanstack/react-router";
import { useCart } from "@/lib/cart-context";
import { resolveImageUrl } from "@/lib/images";
import { ProductImage } from "@/components/product-image";
import { ProductRating, salePercent } from "@/components/product-rating";
import { ShoppingBag } from "lucide-react";

export type ProductCardData = {
  id: string;
  name: string;
  slug: string;
  price: number;
  compare_at_price: number | null;
  images: string[];
  is_featured?: boolean;
};

export function ProductCard({ p, showRating = true }: { p: ProductCardData; showRating?: boolean }) {
  const { addItem } = useCart();
  const img = resolveImageUrl(p.images?.[0], p.slug);
  const onSale = p.compare_at_price && Number(p.compare_at_price) > Number(p.price);
  const discount = onSale ? salePercent(Number(p.price), Number(p.compare_at_price)) : 0;

  return (
    <div className="group flex flex-col overflow-hidden rounded-lg border border-border bg-card transition hover:border-primary/30 hover:shadow-lg">
      <Link to="/product/$slug" params={{ slug: p.slug }} className="relative aspect-square overflow-hidden bg-muted">
        <ProductImage src={img} slug={p.slug} alt={p.name} loading="lazy" className="size-full object-cover transition duration-500 group-hover:scale-105" />
        {onSale && (
          <span className="absolute left-3 top-3 rounded-sm bg-destructive px-2 py-1 text-[10px] font-bold uppercase text-white">
            -{discount}%
          </span>
        )}
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-3 sm:p-4">
        {showRating && <ProductRating rating={5} compact />}
        <Link to="/product/$slug" params={{ slug: p.slug }} className="line-clamp-2 text-sm font-semibold leading-snug hover:text-primary">
          {p.name}
        </Link>
        <div className="mt-auto flex items-end justify-between gap-2">
          <div className="min-w-0">
            <div className="flex flex-wrap items-baseline gap-2">
              <span className="font-display text-base font-bold text-primary sm:text-lg">
                ${Number(p.price).toFixed(2)}
              </span>
              {onSale && (
                <span className="text-xs text-muted-foreground line-through">
                  ${Number(p.compare_at_price).toFixed(2)}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={() => addItem(p.id)}
            className="grid size-9 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground transition hover:bg-primary/90"
            aria-label="Add to cart"
          >
            <ShoppingBag className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
