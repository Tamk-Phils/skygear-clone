export function SiteFooter() {
  return (
    <footer id="contact" className="mt-16 bg-navy text-navy-foreground">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-14 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="grid size-10 place-items-center rounded-full bg-primary text-primary-foreground font-bold">S</div>
            <span className="font-display text-lg font-bold">SkyGear<span className="text-primary">®</span></span>
          </div>
          <p className="mt-4 text-sm opacity-80">Professional drones, gimbals, and accessories for pilots who take the shot seriously.</p>
        </div>
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wide text-primary">Shop</h4>
          <ul className="mt-4 space-y-2 text-sm opacity-80">
            <li>Drones</li><li>Accessories</li><li>Batteries</li><li>Gimbals</li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wide text-primary">Company</h4>
          <ul className="mt-4 space-y-2 text-sm opacity-80">
            <li><a href="/about" className="hover:text-primary">About</a></li>
            <li><a href="/contact" className="hover:text-primary">Contact</a></li>
            <li><a href="/shop" className="hover:text-primary">Shop</a></li>
            <li><a href="#" className="hover:text-primary">Warranty & returns</a></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wide text-primary">Newsletter</h4>
          <p className="mt-4 text-sm opacity-80">Get the latest gear news in your inbox.</p>
          <form className="mt-3 flex overflow-hidden rounded-full bg-white text-foreground">
            <input placeholder="your@email.com" className="flex-1 bg-transparent px-4 py-2 text-sm outline-none" />
            <button className="bg-primary px-4 text-sm font-semibold text-primary-foreground">Join</button>
          </form>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-4 py-5 text-center text-xs opacity-70">
          © {new Date().getFullYear()} SkyGear. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
