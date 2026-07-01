import { Link } from "@tanstack/react-router";
import { Search, ShoppingBag, User, Facebook, Twitter, Menu, X, LayoutGrid, Phone } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useCart } from "@/lib/cart-context";
import { useState } from "react";

const NAV = [
  { to: "/" as const, label: "Home" },
  { to: "/shop" as const, label: "Shop" },
  { to: "/guides" as const, label: "Guides" },
  { to: "/about" as const, label: "About" },
  { to: "/faq" as const, label: "FAQ" },
  { to: "/contact" as const, label: "Contact" },
  { to: "/cart" as const, label: "Cart" },
];

const CATEGORIES = [
  { slug: "drones", label: "Drones" },
  { slug: "batteries", label: "Batteries" },
  { slug: "gimbals", label: "Gimbals" },
  { slug: "accessories", label: "Accessories" },
];

export function SiteHeader() {
  const { user, isAdmin, signOut } = useAuth();
  const { count } = useCart();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [catsOpen, setCatsOpen] = useState(false);

  return (
    <header className="w-full">
      {/* Top bar */}
      <div className="bg-navy text-navy-foreground text-[11px] sm:text-xs">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-2">
          <span className="truncate font-medium tracking-wide">
            <span className="hidden sm:inline opacity-80 mr-3">ENGLISH |</span>
            FREE SHIPPING ON DRONE ORDERS OVER $300
          </span>
          <div className="flex shrink-0 items-center gap-3 opacity-90">
            <a href="tel:+15035550142" className="hidden items-center gap-1 hover:text-primary sm:flex">
              <Phone className="size-3.5" />
              +1 (503) 555-0142
            </a>
            <a href="https://facebook.com/skygeardrones" aria-label="Facebook"><Facebook className="size-4" /></a>
            <a href="https://twitter.com/skygeardrones" aria-label="Twitter"><Twitter className="size-4" /></a>
            <a href="#contact" className="hidden md:inline hover:text-primary">NEWSLETTER</a>
          </div>
        </div>
      </div>

      {/* Main bar */}
      <div className="bg-navy text-navy-foreground">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 md:gap-4 md:py-4">
          <button
            onClick={() => setOpen(v => !v)}
            className="grid size-9 shrink-0 place-items-center rounded-md hover:bg-white/10 md:hidden"
            aria-label="Menu"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>

          <Link to="/" className="flex shrink-0 items-center gap-2" aria-label="SkyGear Drones home">
            <div className="grid size-9 place-items-center rounded-full bg-primary text-primary-foreground font-bold md:size-10">S</div>
            <span className="font-display text-base font-bold tracking-tight md:text-lg">SkyGear<span className="text-primary">®</span></span>
          </Link>

          <form
            onSubmit={(e) => { e.preventDefault(); window.location.href = `/shop?q=${encodeURIComponent(q)}`; }}
            className="hidden flex-1 items-center overflow-hidden rounded-full bg-white text-foreground md:flex"
            role="search"
          >
            <input
              value={q}
              onChange={e => setQ(e.target.value)}
              placeholder="Search drones, batteries, gimbals..."
              aria-label="Search products"
              className="min-w-0 flex-1 bg-transparent px-5 py-3 text-sm outline-none placeholder:text-muted-foreground"
            />
            <button type="submit" aria-label="Search" className="grid size-11 shrink-0 place-items-center bg-primary text-primary-foreground">
              <Search className="size-5" />
            </button>
          </form>

          <div className="ml-auto flex items-center gap-4">
            {user ? (
              <div className="hidden md:flex items-center gap-3 text-sm">
                {isAdmin && <Link to="/admin" className="hover:text-primary">Admin</Link>}
                <button onClick={signOut} className="hover:text-primary">Sign out</button>
              </div>
            ) : (
              <Link to="/auth" className="flex items-center gap-1.5 text-sm hover:text-primary">
                <User className="size-5" />
                <span className="hidden sm:inline">Login</span>
              </Link>
            )}
            <Link to="/cart" className="relative flex items-center hover:text-primary" aria-label={`Cart${count > 0 ? `, ${count} items` : ""}`}>
              <ShoppingBag className="size-5" />
              {count > 0 && (
                <span className="absolute -right-2 -top-2 grid size-4 place-items-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                  {count}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Mobile search */}
        <div className="border-t border-white/10 px-4 pb-3 md:hidden">
          <form
            onSubmit={(e) => { e.preventDefault(); window.location.href = `/shop?q=${encodeURIComponent(q)}`; }}
            className="mt-3 flex items-center overflow-hidden rounded-full bg-white text-foreground"
            role="search"
          >
            <input
              value={q}
              onChange={e => setQ(e.target.value)}
              placeholder="Search drones..."
              aria-label="Search products"
              className="min-w-0 flex-1 bg-transparent px-4 py-2.5 text-sm outline-none placeholder:text-muted-foreground"
            />
            <button type="submit" aria-label="Search" className="grid size-10 shrink-0 place-items-center bg-primary text-primary-foreground">
              <Search className="size-4" />
            </button>
          </form>
        </div>
      </div>

      {/* Desktop nav */}
      <div className="hidden border-b border-border bg-card md:block">
        <div className="mx-auto flex max-w-7xl items-center gap-6 px-4">
          <div className="relative border-r border-border py-4 pr-6">
            <button
              onClick={() => setCatsOpen(v => !v)}
              onBlur={() => setTimeout(() => setCatsOpen(false), 150)}
              className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide hover:text-primary"
            >
              <LayoutGrid className="size-4" /> Shop by categories
            </button>
            {catsOpen && (
              <div className="absolute left-0 top-full z-50 mt-1 w-48 rounded-md border border-border bg-card py-2 shadow-lg">
                {CATEGORIES.map(c => (
                  <Link
                    key={c.slug}
                    to="/shop"
                    search={{ category: c.slug }}
                    className="block px-4 py-2 text-sm hover:bg-muted hover:text-primary"
                  >
                    {c.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
          <nav className="flex flex-1 items-center gap-6 py-4 text-sm font-semibold uppercase tracking-wide" aria-label="Main navigation">
            {NAV.map(n => (
              <Link key={n.to} to={n.to} className="hover:text-primary [&.active]:text-primary">{n.label}</Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Mobile nav drawer */}
      {open && (
        <div className="border-b border-border bg-card md:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col px-4 py-2 text-sm font-semibold uppercase tracking-wide" aria-label="Mobile navigation">
            <p className="py-2 text-xs text-muted-foreground">Categories</p>
            {CATEGORIES.map(c => (
              <Link key={c.slug} to="/shop" search={{ category: c.slug }} onClick={() => setOpen(false)} className="border-b border-border py-3 pl-4 hover:text-primary">
                {c.label}
              </Link>
            ))}
            {NAV.map(n => (
              <Link key={n.to} to={n.to} onClick={() => setOpen(false)} className="border-b border-border py-3 hover:text-primary [&.active]:text-primary">
                {n.label}
              </Link>
            ))}
            {user ? (
              <>
                {isAdmin && <Link to="/admin" onClick={() => setOpen(false)} className="border-b border-border py-3 hover:text-primary">Admin</Link>}
                <button onClick={() => { setOpen(false); signOut(); }} className="py-3 text-left hover:text-primary">Sign out</button>
              </>
            ) : (
              <Link to="/auth" onClick={() => setOpen(false)} className="py-3 hover:text-primary">Login / Register</Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
