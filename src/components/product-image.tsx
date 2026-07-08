import { useEffect, useState } from "react";
import { resolveImageUrl, IMAGES } from "@/lib/images";

type ProductImageProps = {
  src?: string | null;
  slug?: string;
  alt: string;
  className?: string;
  loading?: "lazy" | "eager";
};

export function ProductImage({ src, slug, alt, className, loading }: ProductImageProps) {
  const resolved = resolveImageUrl(src ?? undefined, slug);
  const [current, setCurrent] = useState(resolved);

  useEffect(() => {
    setCurrent(resolved);
  }, [resolved]);

  return (
    <img
      src={current}
      alt={alt}
      loading={loading}
      className={className}
      onError={() => {
        if (current !== IMAGES.placeholder) setCurrent(IMAGES.placeholder);
      }}
    />
  );
}
