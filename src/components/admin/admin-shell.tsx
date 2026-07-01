import { Link } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingCart,
  Users,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type AdminTab = "overview" | "products" | "categories" | "orders" | "users";

const NAV: { id: AdminTab; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "products", label: "Products", icon: Package },
  { id: "categories", label: "Categories", icon: FolderTree },
  { id: "orders", label: "Orders", icon: ShoppingCart },
  { id: "users", label: "Users", icon: Users },
];

export function AdminShell({
  tab,
  onTab,
  children,
}: {
  tab: AdminTab;
  onTab: (t: AdminTab) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen overflow-x-clip bg-muted/30">
      <header className="border-b border-border bg-navy text-navy-foreground">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-3 py-3 sm:gap-4 sm:px-4 sm:py-4">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <div className="grid size-8 shrink-0 place-items-center rounded-full bg-primary text-sm font-bold text-primary-foreground sm:size-9">
              S
            </div>
            <div className="min-w-0">
              <div className="truncate font-display text-base font-bold sm:text-lg">SkyGear Admin</div>
              <div className="hidden text-xs opacity-70 sm:block">Store management dashboard</div>
            </div>
          </div>
          <Link
            to="/"
            className="flex shrink-0 items-center gap-1.5 text-xs opacity-80 transition hover:text-primary sm:text-sm"
          >
            <span className="hidden sm:inline">View store</span>
            <span className="sm:hidden">Store</span>
            <ExternalLink className="size-3.5" />
          </Link>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-4 px-3 py-4 sm:gap-6 sm:px-4 sm:py-6 lg:grid-cols-[220px_1fr]">
        <aside className="h-fit rounded-lg border border-border bg-card p-2 lg:sticky lg:top-6">
          <nav className="flex gap-1 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0">
            {NAV.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => onTab(id)}
                className={cn(
                  "flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-left text-sm font-medium transition sm:py-2.5",
                  tab === id
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <Icon className="size-4 shrink-0" />
                {label}
              </button>
            ))}
          </nav>
        </aside>

        <main className="min-w-0 overflow-hidden rounded-lg border border-border bg-card p-3 sm:p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
