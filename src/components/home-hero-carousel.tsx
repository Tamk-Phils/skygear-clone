import { useEffect, useRef, useState } from "react";
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

type Slide = {
  eyebrow: string;
  title: string;
  subtitle: string;
  cta: string;
  to: "/shop" | "/contact";
} & (
  | { type: "image"; image: string }
  | { type: "video"; video: string }
);

const SLIDES: Slide[] = [
  {
    type: "video",
    eyebrow: "Best value",
    title: "Premium Gear at Pilot-Direct Pricing",
    subtitle: "Fast, insured delivery. 2-year warranty on every SkyGear drone.",
    cta: "View deals",
    to: "/shop",
    video: "/drone2.mp4",
  },
  {
    type: "video",
    eyebrow: "Enterprise",
    title: "Comprehensive Drone Solutions",
    subtitle:
      "UAV fleets and support for public safety, construction, energy, and agriculture teams.",
    cta: "Contact us",
    to: "/contact",
    video: "/drone3.mp4",
  },
  {
    type: "image",
    eyebrow: "Experience now",
    title: "Soar Higher, Capture Better",
    subtitle:
      "Professional camera drones, FPV racers, and cinema UAVs — built by pilots, for pilots.",
    cta: "Shop now",
    to: "/shop",
    image: IMAGES.hero,
  },
];

/** Muted autoplay video background for a carousel slide */
function VideoBackground({ src, active }: { src: string; active: boolean }) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (active) {
      el.currentTime = 0;
      el.play().catch(() => {/* autoplay policy — silently ignore */});
    } else {
      el.pause();
    }
  }, [active]);

  return (
    <video
      ref={ref}
      src={src}
      muted
      loop
      playsInline
      preload="metadata"
      className="absolute inset-0 size-full object-cover"
    />
  );
}

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
          {SLIDES.map((slide, i) => (
            <CarouselItem key={slide.title} className="basis-full pl-0">
              <div className="relative min-h-[420px] sm:min-h-[480px] md:min-h-[560px]">
                {/* Background media */}
                {slide.type === "video" ? (
                  <VideoBackground src={slide.video} active={current === i} />
                ) : (
                  <img
                    src={slide.image}
                    alt=""
                    className="absolute inset-0 size-full object-cover brightness-[1.06] contrast-[1.04] saturate-[1.05]"
                    width={1920}
                    height={900}
                  />
                )}

                {/*
                  Image slide: full white-gradient overlay for readable text.
                  Video slides: bottom-only dark scrim so text is legible but
                  the video stays crystal-clear with zero haze.
                */}
                {slide.type === "image" ? (
                  <div className="absolute inset-0 bg-gradient-to-r from-white/85 via-white/55 to-white/10" />
                ) : (
                  <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                )}

                <div className="relative mx-auto flex h-full max-w-7xl flex-col justify-end px-4 pb-20 sm:pb-24 md:pb-28">
                  <p
                    className={cn(
                      "text-xs font-bold uppercase tracking-[0.35em] sm:text-sm",
                      slide.type === "video" ? "text-white/90" : "text-primary",
                    )}
                  >
                    {slide.eyebrow}
                  </p>
                  <h1
                    className={cn(
                      "mt-3 max-w-2xl font-display text-3xl font-extrabold leading-tight sm:text-5xl md:text-6xl",
                      slide.type === "video" ? "text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.5)]" : "text-foreground",
                    )}
                  >
                    {slide.title}
                  </h1>
                  <p
                    className={cn(
                      "mt-4 max-w-xl text-sm sm:text-base",
                      slide.type === "video" ? "text-white/85" : "text-foreground/75",
                    )}
                  >
                    {slide.subtitle}
                  </p>
                  <Link
                    to={slide.to}
                    className={cn(
                      "mt-8 inline-flex w-fit rounded-full px-8 py-3 text-sm font-bold uppercase tracking-wide transition",
                      slide.type === "video"
                        ? "bg-primary text-primary-foreground hover:bg-primary/90"
                        : "bg-primary text-primary-foreground hover:bg-primary/90",
                    )}
                  >
                    {slide.cta}
                  </Link>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-3 top-1/2 border-white/20 bg-white/20 text-white backdrop-blur-sm hover:bg-white/30 sm:left-5" />
        <CarouselNext className="right-3 top-1/2 border-white/20 bg-white/20 text-white backdrop-blur-sm hover:bg-white/30 sm:right-5" />
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
              current === i ? "w-8 bg-primary" : "w-2 bg-white/40 hover:bg-white/60",
            )}
          />
        ))}
      </div>
    </section>
  );
}
