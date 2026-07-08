/** Local product & category images served from /public/images */
export const IMAGES = {
  hero: "/images/hero-drone.jpg",
  placeholder: "/images/placeholder.jpg",
  categories: {
    drones: "/images/categories/drones.jpg",
    batteries: "/images/categories/batteries.jpg",
    gimbals: "/images/categories/gimbals.jpg",
    accessories: "/images/categories/accessories.jpg",
  },
  products: {
    "skygear-pro-x1": "/images/products/skygear-pro-x1.jpg",
    "skygear-mini-fold": "/images/products/skygear-mini-fold.jpg",
    "skygear-fpv-racer": "/images/products/skygear-fpv-racer.jpg",
    "skygear-cinema-8k": "/images/products/skygear-cinema-8k.jpg",
    "intelligent-flight-battery": "/images/products/intelligent-flight-battery.jpg",
    "low-noise-propellers": "/images/products/low-noise-propellers.jpg",
    "handheld-gimbal": "/images/products/handheld-gimbal.jpg",
    "smart-controller": "/images/products/smart-controller.jpg",
    "hardshell-case": "/images/products/hardshell-case.jpg",
    "nd-filter-set": "/images/products/nd-filter-set.jpg",
  },
} as const;

const LEGACY_CATEGORY_MAP: Record<string, string> = {
  drones: IMAGES.categories.drones,
  batteries: IMAGES.categories.batteries,
  gimbals: IMAGES.categories.gimbals,
  accessories: IMAGES.categories.accessories,
};

function productImage(slug: string): string | undefined {
  return IMAGES.products[slug as keyof typeof IMAGES.products];
}

function categoryImage(slug: string): string | undefined {
  return IMAGES.categories[slug as keyof typeof IMAGES.categories];
}

export function resolveImageUrl(url: string | null | undefined, slug?: string): string {
  if (url?.startsWith("http")) return url;
  if (url?.startsWith("/images/")) return url;

  if (slug) {
    const product = productImage(slug);
    if (product) return product;
    const category = categoryImage(slug);
    if (category) return category;
  }

  if (url?.startsWith("/__l5e/") || url?.includes("__l5e")) {
    if (slug) return productImage(slug) ?? categoryImage(slug) ?? IMAGES.hero;
    for (const [cat, img] of Object.entries(LEGACY_CATEGORY_MAP)) {
      if (url.includes(cat)) return img;
    }
    return IMAGES.hero;
  }

  return IMAGES.placeholder;
}

/** Returns true for URLs pointing to a video file. */
export function isVideoUrl(url: string): boolean {
  return /\.(mp4|webm|ogg|mov|avi|mkv)(\?.*)?$/i.test(url);
}

export function resolveProductImages(images: string[] | null | undefined, slug: string): string[] {
  // Prefer uploaded (Supabase / http) images — they're the admin's intent.
  const uploaded = images?.filter((img) => img.startsWith("http") || img.startsWith("/images/"));
  if (uploaded?.length) return uploaded;

  // Fall back to local slug-keyed images bundled with the app.
  const primary = productImage(slug);
  if (primary) return [primary];

  // Last resort: resolve whatever URL strings exist.
  if (!images?.length) return [IMAGES.placeholder];
  return images.map((img) => resolveImageUrl(img, slug));
}
