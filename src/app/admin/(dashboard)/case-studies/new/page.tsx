import { CaseStudyEditor } from "@/components/admin/CaseStudyEditor/CaseStudyEditor";
import { getAllServiceItemsAdmin } from "@/lib/serviceItems";
import { parseCaseStudyAssessment } from "@/data/caseStudyAssessment";
import type { CaseStudy } from "@/data/caseStudies";
import { todayInputValue } from "@/lib/dateUtils";

const blankCaseStudy: CaseStudy = {
  id: 0, slug: "", eyebrow: "", category: "", year: String(new Date().getFullYear()),
  title: "", description: "", tags: "", body: "", cover_image: "", thumbnail_image: "",
  position: 0, published: 1, outcome_eyebrow: "OUTCOMES", outcome_title: "", metrics: "[]",
  assessment: "", password_required: 0, password_hashes: "[]", author: "",
  published_at: todayInputValue(), meta_title: "", meta_description: "", meta_keywords: "",
  canonical_url: "", og_image: "", no_index: 0,
};

export default async function NewCaseStudyPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const services = getAllServiceItemsAdmin().map((service) => ({ slug: service.slug, title: service.title }));
  return <><h1 className="heading-01">New case study</h1>{error && <p style={{ color: "var(--border-error)" }}>{error}</p>}<CaseStudyEditor study={blankCaseStudy} metrics={[]} assessment={parseCaseStudyAssessment("")} services={services} passwordRequired={false} passwordEntries={[]} action="/api/admin/case-studies" /></>;
}
