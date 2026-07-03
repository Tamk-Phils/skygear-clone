import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { IMAGES } from "@/lib/images";
import { cn } from "@/lib/utils";

const SLIDES = [
  {
    eyebrow: "Experience now",
    title: "Soar Higher, Capture Better",
    subtitle: "Professional camera drones, FPV racers, and cinema UAVs — built by pilots, for pilots.",
    cta: "Shop now",
    to: "/shop" as const,
    image: IMAGES.hero,
  },
  {
    eyebrow: "Best value",
    title: "Premium Gear at Pilot-Direct Pricing",
    subtitle: "Fast, insured delivery. 2-year warranty on every SkyGear drone.",
    cta: "View deals",
    to: "/shop" as const,
    image: IMAGES.categories.drones,
  },
  {
    eyebrow: "Enterprise",
    title: "Comprehensive Drone Solutions",
    subtitle: "UAV fleets and support for public safety, construction, energy, and agriculture teams.",
    cta: "Contact us",
    to: "/contact" as const,
    image: IMAGES.categories.gimbals,
  },
];

export function HomeHeroCarousel() {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!api) return;
    const onSelect = () => setCurrent(api.selectedScrollSnap());
    api.on("select", onSelect);
    onSelect();
    return () => { api.off("select", onSelect); };
  }, [api]);

  useEffect(() => {
    if (!api) return;
    const timer = setInterval(() => api.scrollNext(), 6500);
    return () => clearInterval(timer);
  }, [api]);

  return (
    <section className="relative overflow-hidden bg-background">
      <Carousel setApi={setApi} opts={{ loop: true }} className="w-full">
        <CarouselContent className="ml-0">
          {SLIDES.map((slide) => (
            <CarouselItem key={slide.title} className="basis-full pl-0">
              <div className="relative min-h-[420px] sm:min-h-[480px] md:min-h-[560px]">
                <img
                  src={slide.image}
                  alt=""
                  className="absolute inset-0 size-full object-cover brightness-[1.06] contrast-[1.04] saturate-[1.05]"
                  width={1920}
                  height={900}
                />
                {/* Light, crisp overlay (no haze/blur) to keep the hero bright while ensuring readable text. */}
                <div className="absolute inset-0 bg-gradient-to-r from-white/85 via-white/55 to-white/10" />
                <div className="relative mx-auto flex h-full max-w-7xl flex-col justify-center px-4 py-20 sm:py-28 md:py-32">
                  <p className="text-xs font-bold uppercase tracking-[0.35em] text-primary sm:text-sm">
                    {slide.eyebrow}
                  </p>
                  <h1 className="mt-3 max-w-2xl font-display text-3xl font-extrabold leading-tight text-foreground sm:text-5xl md:text-6xl">
                    {slide.title}
                  </h1>
                  <p className="mt-4 max-w-xl text-sm text-foreground/75 sm:text-base">{slide.subtitle}</p>
                  <Link
                    to={slide.to}
                    className="mt-8 inline-flex w-fit rounded-full bg-primary px-8 py-3 text-sm font-bold uppercase tracking-wide text-primary-foreground transition hover:bg-primary/90"
                  >
                    {slide.cta}
                  </Link>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-3 top-1/2 border-border bg-white/80 text-foreground hover:bg-white sm:left-5" />
        <CarouselNext className="right-3 top-1/2 border-border bg-white/80 text-foreground hover:bg-white sm:right-5" />
      </Carousel>
      <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 gap-2">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Go to slide ${i + 1}`}
            onClick={() => api?.scrollTo(i)}
            className={cn(
              "h-2 rounded-full transition-all",
              current === i ? "w-8 bg-primary" : "w-2 bg-foreground/25 hover:bg-foreground/40",
            )}
          />
        ))}
      </div>
    </section>
  );
}
