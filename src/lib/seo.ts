export const SITE_NAME = "SkyGear Drones";
export const SITE_URL = import.meta.env.VITE_SITE_URL ?? "https://skygear.com";
export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.svg`;

export const SEO_KEYWORDS = [
  "professional drones",
  "camera drones",
  "aerial photography drones",
  "FPV racing drones",
  "cinema drones",
  "drone gimbals",
  "drone batteries",
  "drone accessories",
  "4K drone",
  "8K cinema drone",
  "foldable travel drone",
  "drone shop",
  "buy drones online",
  "SkyGear",
  "SkyGear Drones",
  "aerial surveying drones",
  "filmmaking drones",
  "drone pilot gear",
  "UAV equipment",
  "quadcopter",
  "drone controller",
  "ND filters for drones",
  "intelligent flight battery",
  "drone warranty",
].join(", ");

type MetaTag = Record<string, string>;

export function pageTitle(title: string) {
  return title.includes("SkyGear") ? title : `${title} — SkyGear Drones`;
}

export function buildMeta({
  title,
  description,
  path = "/",
  keywords,
  ogImage = DEFAULT_OG_IMAGE,
  ogType = "website",
  noindex = false,
}: {
  title: string;
  description: string;
  path?: string;
  keywords?: string;
  ogImage?: string;
  ogType?: string;
  noindex?: boolean;
}): { meta: MetaTag[]; links: MetaTag[] } {
  const fullTitle = pageTitle(title);
  const url = `${SITE_URL}${path}`;
  const kw = keywords ?? SEO_KEYWORDS;

  const meta: MetaTag[] = [
    { title: fullTitle },
    { name: "description", content: description },
    { name: "keywords", content: kw },
    { name: "robots", content: noindex ? "noindex, nofollow" : "index, follow" },
    { name: "author", content: "SkyGear" },
    { property: "og:site_name", content: SITE_NAME },
    { property: "og:title", content: fullTitle },
    { property: "og:description", content: description },
    { property: "og:url", content: url },
    { property: "og:type", content: ogType },
    { property: "og:image", content: ogImage },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: fullTitle },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: ogImage },
  ];

  const links: MetaTag[] = [{ rel: "canonical", href: url }];

  return { meta, links };
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/favicon.svg`,
    description:
      "Professional drones, gimbals, batteries and accessories for aerial photographers, filmmakers, surveyors and FPV pilots.",
    email: "hello@skygear.com",
    telephone: "+1-503-555-0142",
    address: {
      "@type": "PostalAddress",
      streetAddress: "220 SE Alder St",
      addressLocality: "Portland",
      addressRegion: "OR",
      postalCode: "97214",
      addressCountry: "US",
    },
    sameAs: [
      "https://www.facebook.com/skygeardrones",
      "https://twitter.com/skygeardrones",
      "https://www.youtube.com/skygeardrones",
    ],
  };
}

export function productJsonLd(product: {
  name: string;
  slug: string;
  description?: string | null;
  price: number;
  images?: string[] | null;
  stock: number;
}) {
  const image = product.images?.[0] ?? DEFAULT_OG_IMAGE;
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image,
    sku: product.slug,
    brand: { "@type": "Brand", name: "SkyGear" },
    offers: {
      "@type": "Offer",
      url: `${SITE_URL}/product/${product.slug}`,
      priceCurrency: "USD",
      price: product.price,
      availability:
        product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  };
}

export function faqJsonLd(faqs: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };
}
