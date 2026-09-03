import type { ComponentType } from "react";
import type { Metadata } from "next";
import { Nav } from "@/components/Nav/Nav";
import { Hero } from "@/components/home/Hero/Hero";
import { Services } from "@/components/home/Services/Services";
import { Approach } from "@/components/home/Approach/Approach";
import { SelectedImpact } from "@/components/home/SelectedImpact/SelectedImpact";
import { LatestInsights } from "@/components/home/LatestInsights/LatestInsights";
import { Footer } from "@/components/Footer/Footer";
import { getSectionOrder } from "@/lib/homepage";
import { getSettings } from "@/lib/settings";
import { pageMetadata } from "@/lib/seo";
import styles from "./page.module.css";

// Case studies and insights now come from the database (editable via
// /admin), so this can't be statically generated at build time.
export const dynamic = "force-dynamic";

export function generateMetadata(): Metadata {
  const settings = getSettings();
  return pageMetadata({
    title: settings.homepage_meta_title || "ConScept — Design systems, product architecture, AI-enabled design operations",
    body: settings.homepage_meta_description || "ConScept helps growing technology companies build the systems behind their products: design system architecture, product architecture, and AI-enabled design operations.",
    meta_title: settings.homepage_meta_title,
    meta_description: settings.homepage_meta_description,
    meta_keywords: settings.homepage_meta_keywords,
    canonical_url: settings.homepage_canonical_url,
    og_image: settings.homepage_og_image,
    no_index: settings.homepage_no_index === "1" ? 1 : 0,
  }, "/");
}

const SECTION_COMPONENTS: Record<string, ComponentType> = {
  services: Services,
  approach: Approach,
  selected_impact: SelectedImpact,
  latest_insights: LatestInsights,
};

export default function Home() {
  const order = getSectionOrder();

  return (
    <>
      <Nav />
      <div className={styles.heroWrap}>
        <Hero />
      </div>
      <main>
        {order.map((key) => {
          const Section = SECTION_COMPONENTS[key];
          return Section ? <Section key={key} /> : null;
        })}
      </main>
      <Footer />
    </>
  );
}
