import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLayoutPage } from "@/lib/layoutDraft";
import { getLayoutConfiguration } from "@/lib/layoutConfiguration";
import { PreviewCanvas } from "@/components/admin/LayoutEditor/PreviewCanvas";
import { Nav } from "@/components/Nav/Nav";
import { Footer } from "@/components/Footer/Footer";
import { Hero } from "@/components/home/Hero/Hero";
import { Services } from "@/components/home/Services/Services";
import { Approach } from "@/components/home/Approach/Approach";
import { SelectedImpact } from "@/components/home/SelectedImpact/SelectedImpact";
import { LatestInsights } from "@/components/home/LatestInsights/LatestInsights";
import { AboutHero } from "@/components/about/AboutHero/AboutHero";
import { AboutDrivesMe } from "@/components/about/AboutDrivesMe/AboutDrivesMe";
import { AboutPhilosophy } from "@/components/about/AboutPhilosophy/AboutPhilosophy";
import { AboutHighlights } from "@/components/about/AboutHighlights/AboutHighlights";
import { AboutLatestInsights } from "@/components/about/AboutLatestInsights/AboutLatestInsights";
import { AboutBeforeConScept } from "@/components/about/AboutBeforeConScept/AboutBeforeConScept";
import { AboutHowIWork } from "@/components/about/AboutHowIWork/AboutHowIWork";
import homeStyles from "@/app/page.module.css";
import { getCaseStudies } from "@/data/caseStudies";
import { getInsights } from "@/data/insights";
import { getPublishedPage } from "@/lib/pages";
import { getSettings } from "@/lib/settings";
import { RichContent } from "@/components/RichContent/RichContent";
import { FeaturedCaseStudyCard } from "@/components/work/FeaturedCaseStudyCard/FeaturedCaseStudyCard";
import { MoreWorkGrid } from "@/components/work/MoreWorkGrid/MoreWorkGrid";
import { InsightsListing } from "@/components/insights/InsightsListing/InsightsListing";
import workStyles from "@/app/work/work.module.css";
import insightsStyles from "@/app/insights/insights.module.css";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Layout preview", robots: { index: false, follow: false } };

export default async function LayoutPreview({ params }: { params: Promise<{ page: string }> }) {
  const { page } = await params;
  if (!isLayoutPage(page)) notFound();
  const { sections } = getLayoutConfiguration(page);
  if (page === "work" || page === "insights") {
    const publicPage = getPublishedPage(page);
    if (!publicPage) notFound();
    const settings = getSettings();
    const studies = getCaseStudies();
    const [featured, ...moreStudies] = studies;
    const insights = getInsights();
    const workSlots = [
      { key: "featured_case_study", content: featured ? <FeaturedCaseStudyCard slug={featured.slug} title={featured.title} description={featured.description} thumbnail={featured.thumbnail_image} passwordRequired={Boolean(featured.password_required)} category={featured.category} year={featured.year} /> : null },
      { key: "more_case_studies", content: <MoreWorkGrid totalStudies={studies.length} personal={settings.logo_identity === "personal"} studies={moreStudies.map((study) => ({ slug: study.slug, eyebrow: study.eyebrow, title: study.title, description: study.description, thumbnail_image: study.thumbnail_image, password_required: Boolean(study.password_required) }))} /> },
      { key: "outcome", content: <section className={`${workStyles.outcome} section-dark`}><div className="container"><p className="label-eyebrow" style={{ color: "var(--text-accent)" }}>THE OUTCOME</p><div className={workStyles.outcomeGrid}><h2 className="heading-02">{settings.work_outcome_title}</h2><p className="body-default" style={{ color: "var(--text-secondary)" }}>{settings.work_outcome_body}</p></div></div></section> },
      { key: "latest_insights", content: <LatestInsights /> },
    ];
    const insightSlots = [{ key: "insight_list", content: <div className="container"><InsightsListing insights={insights} /></div> }];
    const slots = page === "work" ? workSlots : insightSlots;
    const hero = <section className={`container ${page === "work" ? workStyles.main : insightsStyles.hero}`}><p className="label-eyebrow" style={{ color: "var(--text-accent)" }}>{publicPage.eyebrow}</p><h1 className="display-small">{publicPage.title}</h1><div className={page === "work" ? workStyles.heroDescription : insightsStyles.heroDescription}><RichContent html={publicPage.body} /></div></section>;
    return <PreviewCanvas page={page} initial={sections} slots={slots.filter((slot) => sections.some((section) => section.key === slot.key))} hero={hero} navigation={<Nav />} footer={<Footer />} />;
  }
  const slots = page === "homepage" ? [
    { key: "services", content: <Services /> }, { key: "approach", content: <Approach /> },
    { key: "selected_impact", content: <SelectedImpact /> }, { key: "latest_insights", content: <LatestInsights /> },
  ] : [
    { key: "drives_me", content: <AboutDrivesMe /> }, { key: "philosophy", content: <AboutPhilosophy /> },
    { key: "highlights", content: <AboutHighlights /> }, { key: "latest_insights", content: <AboutLatestInsights /> },
    { key: "before_conscept", content: <AboutBeforeConScept preview /> },
  ];
  return <PreviewCanvas page={page} initial={sections} slots={slots.filter((slot) => sections.some((section) => section.key === slot.key))}
    hero={page === "homepage" ? <div className={homeStyles.heroWrap}><Hero /></div> : <AboutHero />}
    closing={page === "about" ? <AboutHowIWork /> : undefined} navigation={<Nav />} footer={<Footer />} />;
}
