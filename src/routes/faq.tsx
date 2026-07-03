import { createFileRoute } from "@tanstack/react-router";
import { ContentPage, ContentSection } from "@/components/content-page";
import { buildMeta, faqJsonLd } from "@/lib/seo";

const FAQS = [
  {
    question: "What types of drones does SkyGear sell?",
    answer:
      "SkyGear offers professional camera drones, foldable travel drones, FPV racing quadcopters, and cinema-grade UAV platforms. We also stock intelligent flight batteries, gimbals, controllers, propellers, ND filters, and hardshell travel cases.",
  },
  {
    question: "How much does shipping cost?",
    answer:
      "Shipping is calculated at checkout based on your destination, item type, and carrier service level. Drone batteries may require compliant ground shipping. For bulk or enterprise orders, contact support for a tailored quote.",
  },
  {
    question: "What is SkyGear's drone warranty policy?",
    answer:
      "Every SkyGear drone and accessory includes a 2-year manufacturer warranty covering defects in materials and workmanship. Batteries carry a 1-year warranty. See our Warranty page for full details and repair process.",
  },
  {
    question: "Can I return a drone if I'm not satisfied?",
    answer:
      "Absolutely. SkyGear offers a 30-day hassle-free return policy on all drones and accessories. Items must be in original condition with all packaging. Contact our support team to initiate a return.",
  },
  {
    question: "Do I need a license to fly a SkyGear drone?",
    answer:
      "In the United States, recreational pilots flying drones over 250g must register with the FAA and follow Part 107 or recreational rules. Our sub-250g SkyGear Mini Fold does not require FAA registration for recreational use. Always check local regulations before flying.",
  },
  {
    question: "How long is the flight time on SkyGear drones?",
    answer:
      "Flight time varies by model. The SkyGear Pro X1 delivers up to 46 minutes with a standard battery. The Cinema 8K offers 55 minutes with dual-battery redundancy. The Mini Fold achieves 28 minutes in real-world conditions.",
  },
  {
    question: "Does SkyGear sell replacement parts and spare batteries?",
    answer:
      "Yes. We stock intelligent flight batteries, low-noise propellers, ND filter sets, and modular replacement components for all current SkyGear platforms. Spare parts are available for at least 5 years after purchase.",
  },
  {
    question: "Can SkyGear drones be used for aerial surveying and mapping?",
    answer:
      "Yes. The SkyGear Pro X1 and Cinema 8K support photogrammetry workflows with RTK-ready positioning options. Many surveyors and GIS professionals use SkyGear platforms for mapping, inspection, and asset monitoring.",
  },
  {
    question: "What payment methods does SkyGear accept?",
    answer:
      "We accept all major credit cards, PayPal, and Apple Pay. Enterprise and bulk orders can be invoiced on NET-30 terms — contact our sales team for details.",
  },
  {
    question: "How do I contact SkyGear pilot support?",
    answer:
      "Reach us at hello@skygear.com or +1 (503) 555-0142, Monday through Friday 9am–6pm PST. Our support team includes certified drone pilots and engineers who can help with setup, troubleshooting, and warranty claims.",
  },
];

export const Route = createFileRoute("/faq")({
  head: () => {
    const seo = buildMeta({
      title: "Drone FAQ — Shipping, Warranty & Flying Tips",
      description:
        "Frequently asked questions about SkyGear professional drones, FPV quadcopters, camera UAVs, shipping, warranty, returns, FAA registration, flight times and pilot support.",
      path: "/faq",
    });
    return {
      meta: seo.meta,
      links: seo.links,
      scripts: [{ type: "application/ld+json", children: JSON.stringify(faqJsonLd(FAQS)) }],
    };
  },
  component: FAQ,
});

function FAQ() {
  return (
    <ContentPage
      eyebrow="Support"
      title="Frequently asked questions"
      subtitle="Everything you need to know about buying, flying, and maintaining SkyGear professional drones and accessories."
    >
      {FAQS.map((faq) => (
        <ContentSection key={faq.question} title={faq.question}>
          <p>{faq.answer}</p>
        </ContentSection>
      ))}
    </ContentPage>
  );
}
