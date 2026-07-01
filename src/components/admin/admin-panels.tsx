import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { ProductImage } from "@/components/product-image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { Pencil, Plus, Search, Trash2, AlertTriangle } from "lucide-react";
import {
  AdminField,
  AdminSectionHeader,
  AdminTableWrap,
  StatCard,
  adminInput,
  slugify,
  ORDER_STATUSES,
  statusLabel,
  type OrderStatus,
} from "./admin-ui";

type ProductRow = {
  id: string;
  name: string;
  slug: string;
  price: number;
  compare_at_price: number | null;
  stock: number;
  images: string[];
  is_featured: boolean;
  is_published: boolean;
  short_description: string | null;
  description: string | null;
  category_id: string | null;
  category: { name: string } | null;
};

type CategoryRow = {
  id: string;
  name: string;
  slug: string;
  image_url: string | null;
  sort_order: number;
};

type OrderRow = {
  id: string;
  order_ref: string;
  status: OrderStatus;
  total: number;
  subtotal: number;
  shipping: number;
  customer_email: string | null;
  card_name: string | null;
  card_last_four: string | null;
  admin_notes: string | null;
  created_at: string;
  order_items: {
    id: string;
    product_name: string;
    product_slug: string;
    quantity: number;
    unit_price: number;
  }[];
};

type UserRow = {
  user_id: string;
  email: string;
  display_name: string | null;
  roles: string[];
  created_at: string;
};

const emptyProductForm = {
  name: "",
  slug: "",
  price: "",
  compare_at_price: "",
  stock: "10",
  short_description: "",
  description: "",
  image_url: "",
  category_id: "",
  is_featured: false,
  is_published: true,
};

function AdminImageUpload({ 
  value, 
  onChange, 
  disabled 
}: { 
  value: string; 
  onChange: (url: string) => void;
  disabled?: boolean;
}) {
  const [uploading, setUploading] = useState(false);

  const uploadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(fileName, file);

    if (uploadError) {
      toast.error(uploadError.message);
      setUploading(false);
      return;
    }

    const { data } = supabase.storage
      .from('product-images')
      .getPublicUrl(fileName);

    onChange(data.publicUrl);
    setUploading(false);
    toast.success("Image uploaded successfully");
  };

  return (
    <div className="flex flex-col gap-2">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="https://..."
        className={adminInput}
        disabled={disabled || uploading}
      />
      <div className="flex items-center gap-2">
        <input
          type="file"
          accept="image/*"
          onChange={uploadFile}
          disabled={disabled || uploading}
          className="text-sm text-muted-foreground file:mr-4 file:rounded-full file:border-0 file:bg-primary/10 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-primary hover:file:bg-primary/20"
        />
        {uploading && <span className="text-sm text-muted-foreground">Uploading...</span>}
      </div>
      {value && (
        <div className="mt-2 size-20 overflow-hidden rounded border border-border bg-muted">
          <img src={value} alt="Preview" className="size-full object-cover" />
        </div>
      )}
    </div>
  );
}

export function OverviewPanel() {
  const { data: products } = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () =>
      (await supabase.from("products").select("id, name, stock, is_published, price")).data ?? [],
  });
  const { data: categories } = useQuery({
    queryKey: ["admin-cats-full"],
    queryFn: async () => (await supabase.from("categories").select("id")).data ?? [],
  });
  const { data: orders } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () =>
      (await supabase.from("orders").select("id, status, total")).data ?? [],
  });
  const { data: users } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("admin_list_users");
      if (error) throw error;
      return data as UserRow[];
    },
  });

  const published = products?.filter((p) => p.is_published).length ?? 0;
  const lowStock = products?.filter((p) => p.stock <= 5).length ?? 0;
  const pendingOrders = orders?.filter((o) => o.status === "pending").length ?? 0;
  const revenue =
    orders
      ?.filter((o) => ["completed", "shipped", "processing", "confirmed"].includes(o.status))
      .reduce((s, o) => s + Number(o.total), 0) ?? 0;

  const recentLowStock = products?.filter((p) => p.stock <= 5).slice(0, 5) ?? [];

  return (
    <div>
      <AdminSectionHeader
        title="Dashboard overview"
        description="Snapshot of your SkyGear store performance."
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Products" value={products?.length ?? 0} hint={`${published} published`} />
        <StatCard
          label="Pending orders"
          value={pendingOrders}
          hint={`${orders?.length ?? 0} total orders`}
          accent={pendingOrders > 0}
        />
        <StatCard label="Customers" value={users?.length ?? 0} hint="Registered accounts" />
        <StatCard
          label="Revenue"
          value={`$${revenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
          hint="Confirmed & fulfilled orders"
        />
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <StatCard label="Categories" value={categories?.length ?? 0} />
        <StatCard
          label="Low stock alerts"
          value={lowStock}
          hint="Products with ≤5 units"
          accent={lowStock > 0}
        />
      </div>
      {lowStock > 0 && (
        <div className="mt-6 rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-amber-700 dark:text-amber-400">
            <AlertTriangle className="size-4" />
            Low stock items
          </div>
          <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
            {recentLowStock.map((p) => (
              <li key={p.id}>
                {p.name} — {p.stock} left
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export function ProductsPanel() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [editing, setEditing] = useState<ProductRow | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState(emptyProductForm);
  const [busy, setBusy] = useState(false);

  const { data: products } = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () =>
      (
        await supabase
          .from("products")
          .select("*, category:categories(name)")
          .order("created_at", { ascending: false })
      ).data ?? [],
  });
  const { data: cats } = useQuery({
    queryKey: ["admin-cats"],
    queryFn: async () => (await supabase.from("categories").select("*").order("name")).data ?? [],
  });

  const filtered = useMemo(() => {
    let rows = (products ?? []) as ProductRow[];
    if (search) {
      const q = search.toLowerCase();
      rows = rows.filter(
        (p) => p.name.toLowerCase().includes(q) || p.slug.toLowerCase().includes(q),
      );
    }
    if (categoryFilter) rows = rows.filter((p) => p.category_id === categoryFilter);
    return rows;
  }, [products, search, categoryFilter]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyProductForm);
    setFormOpen(true);
  };

  const openEdit = (p: ProductRow) => {
    setEditing(p);
    setForm({
      name: p.name,
      slug: p.slug,
      price: String(p.price),
      compare_at_price: p.compare_at_price ? String(p.compare_at_price) : "",
      stock: String(p.stock),
      short_description: p.short_description ?? "",
      description: p.description ?? "",
      image_url: p.images?.[0] ?? "",
      category_id: p.category_id ?? "",
      is_featured: p.is_featured,
      is_published: p.is_published,
    });
    setFormOpen(true);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const payload = {
      name: form.name,
      slug: form.slug || slugify(form.name),
      price: Number(form.price),
      compare_at_price: form.compare_at_price ? Number(form.compare_at_price) : null,
      stock: Number(form.stock),
      short_description: form.short_description || null,
      description: form.description || null,
      images: form.image_url ? [form.image_url] : [],
      category_id: form.category_id || null,
      is_featured: form.is_featured,
      is_published: form.is_published,
      updated_at: new Date().toISOString(),
    };

    const { error } = editing
      ? await supabase.from("products").update(payload).eq("id", editing.id)
      : await supabase.from("products").insert(payload);

    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success(editing ? "Product updated" : "Product created");
    setFormOpen(false);
    qc.invalidateQueries({ queryKey: ["admin-products"] });
    qc.invalidateQueries({ queryKey: ["featured-products"] });
    qc.invalidateQueries({ queryKey: ["shop"] });
  };

  const del = async (id: string) => {
    if (!confirm("Delete this product permanently?")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Product deleted");
    qc.invalidateQueries({ queryKey: ["admin-products"] });
  };

  const toggle = async (id: string, field: "is_published" | "is_featured", value: boolean) => {
    const { error } = await supabase.from("products").update({ [field]: value } as any).eq("id", id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["admin-products"] });
  };

  return (
    <div>
      <AdminSectionHeader
        title="Products"
        description="Manage catalog, pricing, inventory, and visibility."
        action={
          <Button onClick={openCreate} className="gap-2">
            <Plus className="size-4" /> Add product
          </Button>
        }
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <div className="relative min-w-0 flex-1 sm:min-w-[200px]">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products…"
            className={`${adminInput} pl-9`}
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className={`${adminInput} w-full sm:w-auto sm:min-w-[160px]`}
        >
          <option value="">All categories</option>
          {cats?.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <AdminTableWrap>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead className="hidden sm:table-cell">Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead className="hidden md:table-cell">Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((p) => (
              <TableRow key={p.id}>
                <TableCell>
                  <div className="flex min-w-0 items-center gap-2 sm:gap-3">
                    <div className="size-10 shrink-0 overflow-hidden rounded bg-muted sm:size-12">
                      <ProductImage
                        src={p.images?.[0]}
                        slug={p.slug}
                        alt=""
                        className="size-full object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="truncate font-medium">{p.name}</div>
                      <div className="truncate text-xs text-muted-foreground">
                        {p.category?.name ?? "Uncategorized"} · /{p.slug}
                      </div>
                      <div className="mt-1 text-sm font-medium sm:hidden">${Number(p.price).toFixed(2)}</div>
                      <div className="mt-1 flex flex-wrap gap-1 md:hidden">
                        <button onClick={() => toggle(p.id, "is_published", !p.is_published)}>
                          <Badge variant={p.is_published ? "default" : "secondary"}>
                            {p.is_published ? "Published" : "Draft"}
                          </Badge>
                        </button>
                        {p.is_featured && <Badge variant="outline">Featured</Badge>}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="hidden sm:table-cell">${Number(p.price).toFixed(2)}</TableCell>
                <TableCell>
                  <span className={p.stock <= 5 ? "font-semibold text-amber-600" : ""}>
                    {p.stock}
                  </span>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <div className="flex flex-wrap gap-1">
                    <button onClick={() => toggle(p.id, "is_published", !p.is_published)}>
                      <Badge variant={p.is_published ? "default" : "secondary"}>
                        {p.is_published ? "Published" : "Draft"}
                      </Badge>
                    </button>
                    {p.is_featured && <Badge variant="outline">Featured</Badge>}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(p)}>
                      <Pencil className="size-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => del(p.id)}>
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                  No products found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </AdminTableWrap>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-h-[90vh] w-[calc(100%-2rem)] max-w-lg overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit product" : "Add product"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={save} className="space-y-3">
            <AdminField label="Name">
              <input
                required
                value={form.name}
                onChange={(e) =>
                  setForm({
                    ...form,
                    name: e.target.value,
                    slug: editing ? form.slug : slugify(e.target.value),
                  })
                }
                className={adminInput}
              />
            </AdminField>
            <AdminField label="Slug">
              <input
                required
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: slugify(e.target.value) })}
                className={adminInput}
              />
            </AdminField>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <AdminField label="Price ($)">
                <input
                  required
                  type="number"
                  step="0.01"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  className={adminInput}
                />
              </AdminField>
              <AdminField label="Compare at">
                <input
                  type="number"
                  step="0.01"
                  value={form.compare_at_price}
                  onChange={(e) => setForm({ ...form, compare_at_price: e.target.value })}
                  className={adminInput}
                />
              </AdminField>
            </div>
            <AdminField label="Stock">
              <input
                required
                type="number"
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
                className={adminInput}
              />
            </AdminField>
            <AdminField label="Category">
              <select
                value={form.category_id}
                onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                className={adminInput}
              >
                <option value="">— none —</option>
                {cats?.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </AdminField>
            <AdminField label="Image">
              <AdminImageUpload
                value={form.image_url}
                onChange={(url) => setForm({ ...form, image_url: url })}
                disabled={busy}
              />
            </AdminField>
            <AdminField label="Short description">
              <input
                value={form.short_description}
                onChange={(e) => setForm({ ...form, short_description: e.target.value })}
                className={adminInput}
              />
            </AdminField>
            <AdminField label="Description">
              <textarea
                rows={4}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className={adminInput}
              />
            </AdminField>
            <div className="flex flex-wrap gap-4 text-sm">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.is_published}
                  onChange={(e) => setForm({ ...form, is_published: e.target.checked })}
                />
                Published
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.is_featured}
                  onChange={(e) => setForm({ ...form, is_featured: e.target.checked })}
                />
                Featured
              </label>
            </div>
            <Button type="submit" disabled={busy} className="w-full">
              {busy ? "Saving…" : editing ? "Save changes" : "Create product"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function CategoriesPanel() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<CategoryRow | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState({ name: "", slug: "", image_url: "", sort_order: "0" });

  const { data: cats } = useQuery({
    queryKey: ["admin-cats-full"],
    queryFn: async () =>
      (await supabase.from("categories").select("*").order("sort_order")).data ?? [],
  });

  const openCreate = () => {
    setEditing(null);
    setForm({ name: "", slug: "", image_url: "", sort_order: String((cats?.length ?? 0) + 1) });
    setFormOpen(true);
  };

  const openEdit = (c: CategoryRow) => {
    setEditing(c);
    setForm({
      name: c.name,
      slug: c.slug,
      image_url: c.image_url ?? "",
      sort_order: String(c.sort_order),
    });
    setFormOpen(true);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: form.name,
      slug: form.slug || slugify(form.name),
      image_url: form.image_url || null,
      sort_order: Number(form.sort_order),
    };
    const { error } = editing
      ? await supabase.from("categories").update(payload).eq("id", editing.id)
      : await supabase.from("categories").insert(payload);
    if (error) return toast.error(error.message);
    toast.success(editing ? "Category updated" : "Category created");
    setFormOpen(false);
    qc.invalidateQueries({ queryKey: ["admin-cats-full"] });
    qc.invalidateQueries({ queryKey: ["categories"] });
    qc.invalidateQueries({ queryKey: ["admin-cats"] });
  };

  const del = async (id: string) => {
    if (!confirm("Delete this category?")) return;
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Category deleted");
    qc.invalidateQueries({ queryKey: ["admin-cats-full"] });
  };

  return (
    <div>
      <AdminSectionHeader
        title="Categories"
        description="Organize drones, batteries, gimbals, and accessories."
        action={
          <Button onClick={openCreate} className="gap-2">
            <Plus className="size-4" /> Add category
          </Button>
        }
      />

      <AdminTableWrap>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Category</TableHead>
              <TableHead className="hidden sm:table-cell">Slug</TableHead>
              <TableHead className="hidden md:table-cell">Sort</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(cats as CategoryRow[] | undefined)?.map((c) => (
              <TableRow key={c.id}>
                <TableCell>
                  <div className="flex min-w-0 items-center gap-2 sm:gap-3">
                    <div className="size-10 shrink-0 overflow-hidden rounded bg-muted sm:size-12">
                      <ProductImage
                        src={c.image_url}
                        slug={c.slug}
                        alt=""
                        className="size-full object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <span className="font-medium">{c.name}</span>
                      <div className="text-xs text-muted-foreground sm:hidden">/{c.slug}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="hidden text-muted-foreground sm:table-cell">/{c.slug}</TableCell>
                <TableCell className="hidden md:table-cell">{c.sort_order}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(c)}>
                      <Pencil className="size-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => del(c.id)}>
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </AdminTableWrap>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="w-[calc(100%-2rem)] max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit category" : "Add category"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={save} className="space-y-3">
            <AdminField label="Name">
              <input
                required
                value={form.name}
                onChange={(e) =>
                  setForm({
                    ...form,
                    name: e.target.value,
                    slug: editing ? form.slug : slugify(e.target.value),
                  })
                }
                className={adminInput}
              />
            </AdminField>
            <AdminField label="Slug">
              <input
                required
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: slugify(e.target.value) })}
                className={adminInput}
              />
            </AdminField>
            <AdminField label="Sort order">
              <input
                type="number"
                value={form.sort_order}
                onChange={(e) => setForm({ ...form, sort_order: e.target.value })}
                className={adminInput}
              />
            </AdminField>
            <AdminField label="Image">
              <AdminImageUpload
                value={form.image_url}
                onChange={(url) => setForm({ ...form, image_url: url })}
              />
            </AdminField>
            <Button type="submit" className="w-full">
              {editing ? "Save changes" : "Create category"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function OrdersPanel() {
  const qc = useQueryClient();
  const [selected, setSelected] = useState<OrderRow | null>(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [notes, setNotes] = useState("");

  const { data: orders } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () =>
      (
        await supabase
          .from("orders")
          .select("*, order_items(*)")
          .order("created_at", { ascending: false })
      ).data ?? [],
  });

  const filtered = useMemo(() => {
    const rows = (orders ?? []) as OrderRow[];
    if (!statusFilter) return rows;
    return rows.filter((o) => o.status === statusFilter);
  }, [orders, statusFilter]);

  const updateStatus = async (id: string, status: OrderStatus) => {
    const { error } = await supabase.from("orders").update({ status }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success(`Order marked as ${statusLabel(status)}`);
    qc.invalidateQueries({ queryKey: ["admin-orders"] });
    if (selected?.id === id) setSelected({ ...selected, status });
  };

  const saveNotes = async () => {
    if (!selected) return;
    const { error } = await supabase
      .from("orders")
      .update({ admin_notes: notes || null })
      .eq("id", selected.id);
    if (error) return toast.error(error.message);
    toast.success("Notes saved");
    qc.invalidateQueries({ queryKey: ["admin-orders"] });
  };

  const openOrder = (o: OrderRow) => {
    setSelected(o);
    setNotes(o.admin_notes ?? "");
  };

  return (
    <div>
      <AdminSectionHeader
        title="Orders"
        description="Review checkout submissions and update fulfillment status."
      />

      <div className="mb-4">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className={`${adminInput} w-full sm:w-auto sm:min-w-[180px]`}
        >
          <option value="">All statuses</option>
          {ORDER_STATUSES.map((s) => (
            <option key={s} value={s}>
              {statusLabel(s)}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-6">
        <AdminTableWrap>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Reference</TableHead>
                <TableHead className="hidden sm:table-cell">Customer</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((o) => (
                <TableRow
                  key={o.id}
                  className="cursor-pointer"
                  onClick={() => openOrder(o)}
                  data-state={selected?.id === o.id ? "selected" : undefined}
                >
                  <TableCell>
                    <div className="font-mono text-xs font-semibold">{o.order_ref}</div>
                    <div className="mt-0.5 truncate text-xs text-muted-foreground sm:hidden">
                      {o.customer_email ?? "—"}
                    </div>
                  </TableCell>
                  <TableCell className="hidden text-sm sm:table-cell">{o.customer_email ?? "—"}</TableCell>
                  <TableCell>${Number(o.total).toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge variant={o.status === "pending" ? "secondary" : "default"}>
                      {statusLabel(o.status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden text-xs text-muted-foreground md:table-cell">
                    {new Date(o.created_at).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                    No orders yet. Orders appear when customers complete checkout.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </AdminTableWrap>

        <div className="h-fit rounded-lg border border-border bg-muted/30 p-4">
          {selected ? (
            <>
              <h3 className="font-display text-lg font-bold">{selected.order_ref}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{selected.customer_email}</p>
              {selected.card_name && (
                <p className="mt-2 text-sm">
                  Card: {selected.card_name}
                  {selected.card_last_four && ` · **** ${selected.card_last_four}`}
                </p>
              )}
              <div className="mt-4 space-y-2 text-sm">
                {selected.order_items?.map((it) => (
                  <div key={it.id} className="flex justify-between gap-2">
                    <Link
                      to="/product/$slug"
                      params={{ slug: it.product_slug }}
                      className="hover:text-primary"
                    >
                      {it.product_name} ×{it.quantity}
                    </Link>
                    <span>${(Number(it.unit_price) * it.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 border-t border-border pt-3 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${Number(selected.subtotal).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>${Number(selected.shipping).toFixed(2)}</span>
                </div>
                <div className="mt-1 flex justify-between font-bold">
                  <span>Total</span>
                  <span className="text-primary">${Number(selected.total).toFixed(2)}</span>
                </div>
              </div>
              <AdminField label="Status">
                <select
                  value={selected.status}
                  onChange={(e) => updateStatus(selected.id, e.target.value as OrderStatus)}
                  className={adminInput}
                >
                  {ORDER_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {statusLabel(s)}
                    </option>
                  ))}
                </select>
              </AdminField>
              <AdminField label="Admin notes">
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className={adminInput}
                  placeholder="Internal notes for support follow-up…"
                />
              </AdminField>
              <Button onClick={saveNotes} variant="outline" className="mt-2 w-full">
                Save notes
              </Button>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">Select an order to view details.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export function UsersPanel() {
  const qc = useQueryClient();
  const { data: users, isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("admin_list_users");
      if (error) throw error;
      return data as UserRow[];
    },
  });

  const toggleAdmin = async (userId: string, isAdmin: boolean) => {
    if (isAdmin) {
      if (!confirm("Remove admin access from this user?")) return;
      const { error } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", userId)
        .eq("role", "admin");
      if (error) return toast.error(error.message);
      toast.success("Admin access removed");
    } else {
      const { error } = await supabase
        .from("user_roles")
        .insert({ user_id: userId, role: "admin" });
      if (error) return toast.error(error.message);
      toast.success("Admin access granted");
    }
    qc.invalidateQueries({ queryKey: ["admin-users"] });
  };

  return (
    <div>
      <AdminSectionHeader
        title="Users"
        description="Manage customer accounts and admin access."
      />

      <AdminTableWrap>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead className="hidden md:table-cell">Email</TableHead>
              <TableHead>Roles</TableHead>
              <TableHead className="hidden lg:table-cell">Joined</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                  Loading users…
                </TableCell>
              </TableRow>
            ) : (
              users?.map((u) => {
                const isAdmin = u.roles?.includes("admin");
                return (
                  <TableRow key={u.user_id}>
                    <TableCell>
                      <div className="min-w-0">
                        <div className="truncate font-medium">
                          {u.display_name ?? u.user_id.slice(0, 8) + "…"}
                        </div>
                        <div className="truncate text-xs text-muted-foreground md:hidden">{u.email}</div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden text-sm md:table-cell">{u.email}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {(u.roles?.length ? u.roles : ["customer"]).map((r) => (
                          <Badge key={r} variant={r === "admin" ? "default" : "secondary"}>
                            {r}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="hidden text-xs text-muted-foreground lg:table-cell">
                      {new Date(u.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs sm:text-sm"
                        onClick={() => toggleAdmin(u.user_id, !!isAdmin)}
                      >
                        <span className="hidden sm:inline">{isAdmin ? "Revoke admin" : "Make admin"}</span>
                        <span className="sm:hidden">{isAdmin ? "Revoke" : "Admin"}</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </AdminTableWrap>
    </div>
  );
}
