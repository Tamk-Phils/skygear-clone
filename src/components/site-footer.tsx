import { Link } from "@tanstack/react-router";
import { Facebook, Twitter, Youtube, Instagram } from "lucide-react";

const SHOP_LINKS = [
  { label: "All drones", to: "/shop" as const, search: { category: "drones" } },
  { label: "Batteries", to: "/shop" as const, search: { category: "batteries" } },
  { label: "Gimbals & cameras", to: "/shop" as const, search: { category: "gimbals" } },
  { label: "Accessories", to: "/shop" as const, search: { category: "accessories" } },
];

const COMPANY_LINKS = [
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
  { label: "Buying guides", href: "/guides" },
  { label: "FAQ", href: "/faq" },
  { label: "Shipping", href: "/shipping" },
  { label: "Warranty & returns", href: "/warranty" },
];

const LEGAL_LINKS = [
  { label: "Privacy policy", href: "/privacy" },
  { label: "Terms of service", href: "/terms" },
];

export function SiteFooter() {
  return (
    <footer id="contact" className="mt-16 bg-navy text-navy-foreground">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-14 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="grid size-10 place-items-center rounded-full bg-primary text-primary-foreground font-bold">S</div>
            <span className="font-display text-lg font-bold">SkyGear<span className="text-primary">®</span></span>
          </div>
          <p className="mt-4 text-sm opacity-80">
            Professional camera drones, FPV racing quadcopters, cinema UAVs, intelligent flight
            batteries, gimbals and drone accessories for pilots who take the shot seriously.
          </p>
          <div className="mt-4 flex gap-3 opacity-80">
            <a href="https://facebook.com/skygeardrones" aria-label="SkyGear on Facebook" className="hover:text-primary"><Facebook className="size-4" /></a>
            <a href="https://twitter.com/skygeardrones" aria-label="SkyGear on Twitter" className="hover:text-primary"><Twitter className="size-4" /></a>
            <a href="https://youtube.com/skygeardrones" aria-label="SkyGear on YouTube" className="hover:text-primary"><Youtube className="size-4" /></a>
            <a href="https://instagram.com/skygeardrones" aria-label="SkyGear on Instagram" className="hover:text-primary"><Instagram className="size-4" /></a>
          </div>
        </div>
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wide text-primary">Shop drones</h4>
          <ul className="mt-4 space-y-2 text-sm opacity-80">
            {SHOP_LINKS.map(l => (
              <li key={l.label}>
                <Link to={l.to} search={l.search} className="hover:text-primary">{l.label}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wide text-primary">Company</h4>
          <ul className="mt-4 space-y-2 text-sm opacity-80">
            {COMPANY_LINKS.map(l => (
              <li key={l.label}><a href={l.href} className="hover:text-primary">{l.label}</a></li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wide text-primary">Newsletter</h4>
          <p className="mt-4 text-sm opacity-80">Drone news, new product launches, and pilot tips — straight to your inbox.</p>
          <form className="mt-3 flex flex-col gap-2 overflow-hidden rounded-full bg-white text-foreground sm:flex-row" onSubmit={e => e.preventDefault()}>
            <input type="email" placeholder="your@email.com" aria-label="Email for newsletter" className="min-w-0 flex-1 bg-transparent px-4 py-2 text-sm outline-none" />
            <button type="submit" className="shrink-0 bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground sm:py-0">Join</button>
          </form>
          <ul className="mt-4 space-y-2 text-sm opacity-80">
            {LEGAL_LINKS.map(l => (
              <li key={l.label}><a href={l.href} className="hover:text-primary">{l.label}</a></li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-4 py-5 text-center text-xs opacity-70">
          © {new Date().getFullYear()} SkyGear Drones. All rights reserved. Professional drones, quadcopters, UAVs, gimbals &amp; accessories.
        </div>
      </div>
    </footer>
  );
}
