import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — SkyGear" }] }),
  component: AdminPage,
});

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function AdminPage() {
  const { user, isAdmin, loading } = useAuth();
  const nav = useNavigate();
  const qc = useQueryClient();

  useEffect(() => {
    if (!loading && !user) nav({ to: "/auth" });
  }, [user, loading, nav]);

  const [tab, setTab] = useState<"products" | "categories">("products");

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Admin</p>
            <h1 className="font-display text-3xl font-extrabold">Catalog</h1>
          </div>
        </div>

        {!loading && user && !isAdmin && (
          <NotAdmin userId={user.id} onGranted={() => qc.invalidateQueries()} />
        )}

        {isAdmin && (
          <>
            <div className="mt-6 flex gap-2 border-b border-border">
              {(["products", "categories"] as const).map(t => (
                <button key={t} onClick={() => setTab(t)}
                  className={`px-4 py-2 text-sm font-semibold uppercase ${tab === t ? "border-b-2 border-primary text-primary" : "text-muted-foreground"}`}>
                  {t}
                </button>
              ))}
            </div>
            {tab === "products" ? <ProductsAdmin /> : <CategoriesAdmin />}
          </>
        )}
      </div>
      <SiteFooter />
    </div>
  );
}

function NotAdmin({ userId, onGranted }: { userId: string; onGranted: () => void }) {
  const { data: anyAdmin, isLoading } = useQuery({
    queryKey: ["any-admin"],
    queryFn: async () => {
      const { count } = await supabase.from("user_roles").select("*", { count: "exact", head: true }).eq("role", "admin");
      return (count ?? 0) > 0;
    },
  });

  const claim = async () => {
    const { error } = await supabase.from("user_roles").insert({ user_id: userId, role: "admin" });
    if (error) return toast.error(error.message);
    toast.success("You're now an admin");
    onGranted();
    window.location.reload();
  };

  return (
    <div className="mt-10 rounded-lg border border-border bg-card p-8 text-center">
      <h2 className="font-display text-xl font-bold">Admin access required</h2>
      {isLoading ? <p className="mt-2 text-muted-foreground">Checking…</p> : anyAdmin ? (
        <p className="mt-2 text-muted-foreground">Ask an existing admin to grant you access.</p>
      ) : (
        <>
          <p className="mt-2 text-muted-foreground">No admins yet. Claim admin access for your account:</p>
          <button onClick={claim} className="mt-4 rounded-full bg-primary px-6 py-2 text-sm font-bold uppercase text-primary-foreground">
            Make me admin
          </button>
        </>
      )}
    </div>
  );
}

function ProductsAdmin() {
  const qc = useQueryClient();
  const { data: products } = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => (await supabase.from("products").select("*, category:categories(name)").order("created_at", { ascending: false })).data ?? [],
  });
  const { data: cats } = useQuery({
    queryKey: ["admin-cats"],
    queryFn: async () => (await supabase.from("categories").select("*").order("name")).data ?? [],
  });

  const [form, setForm] = useState({
    name: "", price: "", stock: "10", short_description: "", description: "",
    image_url: "", category_id: "", is_featured: false, compare_at_price: "",
  });
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const payload = {
      name: form.name,
      slug: slugify(form.name) + "-" + Math.random().toString(36).slice(2, 6),
      price: Number(form.price),
      compare_at_price: form.compare_at_price ? Number(form.compare_at_price) : null,
      stock: Number(form.stock),
      short_description: form.short_description || null,
      description: form.description || null,
      images: form.image_url ? [form.image_url] : [],
      category_id: form.category_id || null,
      is_featured: form.is_featured,
      is_published: true,
    };
    const { error } = await supabase.from("products").insert(payload);
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Product added");
    setForm({ name: "", price: "", stock: "10", short_description: "", description: "", image_url: "", category_id: "", is_featured: false, compare_at_price: "" });
    qc.invalidateQueries({ queryKey: ["admin-products"] });
    qc.invalidateQueries({ queryKey: ["featured-products"] });
  };

  const del = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["admin-products"] });
  };

  return (
    <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_400px]">
      <div>
        <h3 className="mb-3 font-display text-lg font-bold">All products ({products?.length ?? 0})</h3>
        <div className="divide-y divide-border rounded-lg border border-border bg-card">
          {products?.map((p: any) => (
            <div key={p.id} className="flex items-center gap-3 p-3">
              <div className="size-14 overflow-hidden rounded bg-muted">
                {p.images?.[0] && <img src={p.images[0]} alt="" className="size-full object-cover" />}
              </div>
              <div className="flex-1">
                <div className="font-semibold text-sm">{p.name}</div>
                <div className="text-xs text-muted-foreground">${Number(p.price).toFixed(2)} · stock {p.stock} · {p.category?.name ?? "no category"}</div>
              </div>
              <button onClick={() => del(p.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="size-4" /></button>
            </div>
          ))}
          {(!products || products.length === 0) && <div className="p-8 text-center text-sm text-muted-foreground">No products yet.</div>}
        </div>
      </div>

      <form onSubmit={submit} className="h-fit space-y-3 rounded-lg border border-border bg-card p-5">
        <h3 className="font-display text-lg font-bold">Add product</h3>
        <Field label="Name"><input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className={inp} /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Price ($)"><input required type="number" step="0.01" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} className={inp} /></Field>
          <Field label="Compare at"><input type="number" step="0.01" value={form.compare_at_price} onChange={e => setForm({ ...form, compare_at_price: e.target.value })} className={inp} /></Field>
        </div>
        <Field label="Stock"><input required type="number" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} className={inp} /></Field>
        <Field label="Category">
          <select value={form.category_id} onChange={e => setForm({ ...form, category_id: e.target.value })} className={inp}>
            <option value="">— none —</option>
            {cats?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </Field>
        <Field label="Image URL"><input value={form.image_url} onChange={e => setForm({ ...form, image_url: e.target.value })} placeholder="https://…" className={inp} /></Field>
        <Field label="Short description"><input value={form.short_description} onChange={e => setForm({ ...form, short_description: e.target.value })} className={inp} /></Field>
        <Field label="Description"><textarea rows={4} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className={inp} /></Field>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.is_featured} onChange={e => setForm({ ...form, is_featured: e.target.checked })} /> Featured on home page</label>
        <button disabled={busy} className="w-full rounded-full bg-primary py-2.5 text-sm font-bold uppercase text-primary-foreground disabled:opacity-60">{busy ? "Saving…" : "Add product"}</button>
      </form>
    </div>
  );
}

function CategoriesAdmin() {
  const qc = useQueryClient();
  const { data: cats } = useQuery({
    queryKey: ["admin-cats-full"],
    queryFn: async () => (await supabase.from("categories").select("*").order("sort_order")).data ?? [],
  });
  const [form, setForm] = useState({ name: "", image_url: "" });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from("categories").insert({
      name: form.name, slug: slugify(form.name), image_url: form.image_url || null,
    });
    if (error) return toast.error(error.message);
    toast.success("Category added");
    setForm({ name: "", image_url: "" });
    qc.invalidateQueries({ queryKey: ["admin-cats-full"] });
    qc.invalidateQueries({ queryKey: ["categories"] });
  };
  const del = async (id: string) => {
    if (!confirm("Delete category?")) return;
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["admin-cats-full"] });
  };

  return (
    <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_400px]">
      <div>
        <h3 className="mb-3 font-display text-lg font-bold">Categories ({cats?.length ?? 0})</h3>
        <div className="divide-y divide-border rounded-lg border border-border bg-card">
          {cats?.map(c => (
            <div key={c.id} className="flex items-center gap-3 p-3">
              <div className="size-14 overflow-hidden rounded bg-muted">
                {c.image_url && <img src={c.image_url} alt="" className="size-full object-cover" />}
              </div>
              <div className="flex-1">
                <div className="font-semibold text-sm">{c.name}</div>
                <div className="text-xs text-muted-foreground">/{c.slug}</div>
              </div>
              <button onClick={() => del(c.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="size-4" /></button>
            </div>
          ))}
          {(!cats || cats.length === 0) && <div className="p-8 text-center text-sm text-muted-foreground">No categories yet.</div>}
        </div>
      </div>
      <form onSubmit={submit} className="h-fit space-y-3 rounded-lg border border-border bg-card p-5">
        <h3 className="font-display text-lg font-bold">Add category</h3>
        <Field label="Name"><input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className={inp} /></Field>
        <Field label="Image URL"><input value={form.image_url} onChange={e => setForm({ ...form, image_url: e.target.value })} placeholder="https://…" className={inp} /></Field>
        <button className="w-full rounded-full bg-primary py-2.5 text-sm font-bold uppercase text-primary-foreground">Add category</button>
      </form>
    </div>
  );
}

const inp = "mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary";
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</label>
      {children}
    </div>
  );
}
