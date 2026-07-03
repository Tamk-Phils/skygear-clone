import { createFileRoute } from "@tanstack/react-router";
import { ContentPage, ContentSection } from "@/components/content-page";
import { buildMeta } from "@/lib/seo";

export const Route = createFileRoute("/shipping")({
  head: () => {
    const seo = buildMeta({
      title: "Shipping Policy — Fast, Insured Delivery",
      description:
        "SkyGear shipping policy for professional drones, FPV quadcopters, batteries and accessories. Fast, insured delivery with domestic and international options.",
      path: "/shipping",
    });
    return { meta: seo.meta, links: seo.links };
  },
  component: Shipping,
});

function Shipping() {
  return (
    <ContentPage
      eyebrow="Shipping"
      title="Shipping policy"
      subtitle="Fast, insured delivery for drones, batteries, gimbals and accessories — because grounded pilots aren't happy pilots."
    >
      <ContentSection title="Shipping rates">
        <p>
          Shipping is calculated at checkout based on item type, destination, and carrier service level.
          Drone batteries ship via compliant ground services where required. For bulk orders or enterprise
          deployments, contact support for a tailored quote.
        </p>
      </ContentSection>

      <ContentSection title="Processing time">
        <p>
          Orders placed before 2pm PST on business days ship the same day. Most drone and accessory
          orders arrive within 3–5 business days via UPS or FedEx. Express 2-day and overnight options
          are available at checkout for time-sensitive shoots and deployments.
        </p>
      </ContentSection>

      <ContentSection title="International shipping">
        <p>
          SkyGear ships professional drones and accessories to more than 60 countries. International
          orders may be subject to import duties, taxes, and customs fees determined by the destination
          country. LiPo batteries ship via ground-only carriers per IATA regulations.
        </p>
      </ContentSection>

      <ContentSection title="Drone battery shipping">
        <p>
          Intelligent flight batteries and LiPo packs are classified as dangerous goods. We comply with
          all DOT and IATA shipping requirements. Batteries cannot be shipped via air to certain
          destinations. Contact support if you need battery-only orders to remote locations.
        </p>
      </ContentSection>

      <ContentSection title="Tracking and insurance">
        <p>
          Every SkyGear shipment includes full tracking and insurance up to the order value. Signature
          confirmation is required on all drone orders over $500. If your package arrives damaged,
          photograph the packaging and contact us within 48 hours.
        </p>
      </ContentSection>
    </ContentPage>
  );
}
