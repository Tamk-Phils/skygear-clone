import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Mail, Phone, MapPin, Clock } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { buildMeta } from "@/lib/seo";
import { createServerFn } from "@tanstack/react-start";
import { sendContactEmail } from "@/lib/email";

const submitContactForm = createServerFn({ method: "POST" })
  .validator((d: { name: string; email: string; subject: string; message: string }) => d)
  .handler(async ({ data }) => {
    await sendContactEmail(data);
    return { success: true };
  });

export const Route = createFileRoute("/contact")({
  head: () => {
    const seo = buildMeta({
      title: "Contact SkyGear — Drone Support & Sales",
      description:
        "Contact SkyGear drone support, sales, warranty and bulk order teams. Real pilots answer within one business day. Portland HQ. hello@skygear.com",
      path: "/contact",
    });
    return { meta: seo.meta, links: seo.links };
  },
  component: Contact,
});

function Contact() {
  const [busy, setBusy] = useState(false);
  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const data = {
      name: (form.elements.namedItem("name") as HTMLInputElement).value,
      email: (form.elements.namedItem("email") as HTMLInputElement).value,
      subject: (form.elements.namedItem("subject") as HTMLSelectElement).value,
      message: (form.elements.namedItem("message") as HTMLTextAreaElement).value,
    };
    
    setBusy(true);
    try {
      await submitContactForm({ data });
      toast.success("Thanks! We'll be in touch within one business day.");
      form.reset();
    } catch (err) {
      toast.error("Failed to send message. Please try again later.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="mx-auto max-w-7xl px-4 py-14">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">Contact</p>
        <h1 className="mt-2 font-display text-4xl font-extrabold md:text-5xl">Talk to a pilot.</h1>
        <p className="mt-3 max-w-xl text-muted-foreground">
          Questions about a build, a bulk order, or need warranty help? Send us a message — real people reply, usually within a business day.
        </p>

        <div className="mt-12 grid gap-10 md:grid-cols-[1fr_360px]">
          <form onSubmit={submit} className="space-y-4 rounded-lg border border-border bg-card p-6">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="text-xs font-semibold uppercase text-muted-foreground">Name</span>
                <input name="name" required className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-primary" />
              </label>
              <label className="block">
                <span className="text-xs font-semibold uppercase text-muted-foreground">Email</span>
                <input name="email" required type="email" className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-primary" />
              </label>
            </div>
            <label className="block">
              <span className="text-xs font-semibold uppercase text-muted-foreground">Subject</span>
              <select name="subject" className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-primary">
                <option>Sales enquiry</option>
                <option>Warranty / Repair</option>
                <option>Bulk order</option>
                <option>Press</option>
                <option>Other</option>
              </select>
            </label>
            <label className="block">
              <span className="text-xs font-semibold uppercase text-muted-foreground">Message</span>
              <textarea name="message" required rows={6} className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-primary" />
            </label>
            <button disabled={busy} className="rounded-full bg-primary px-8 py-3 text-sm font-bold uppercase text-primary-foreground disabled:opacity-60">
              {busy ? "Sending…" : "Send message"}
            </button>
          </form>

          <aside className="space-y-5 text-sm">
            {[
              { i: Mail, t: "Email", d: "hello@skygear.com" },
              { i: Phone, t: "Phone", d: "+1 (503) 555-0142" },
              { i: MapPin, t: "HQ", d: "220 SE Alder St, Portland, OR 97214" },
              { i: Clock, t: "Hours", d: "Mon–Fri · 9am–6pm PST" },
            ].map(({ i: Icon, t, d }) => (
              <div key={t} className="flex items-start gap-3 rounded-lg border border-border bg-card p-4">
                <div className="grid size-10 shrink-0 place-items-center rounded-full bg-primary/15 text-primary">
                  <Icon className="size-5" />
                </div>
                <div>
                  <div className="font-semibold">{t}</div>
                  <div className="text-muted-foreground">{d}</div>
                </div>
              </div>
            ))}
          </aside>
        </div>
      </div>
      <SiteFooter />
    </div>
  );
}
