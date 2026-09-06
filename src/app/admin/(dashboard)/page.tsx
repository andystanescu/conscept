import Link from "next/link";
import { db } from "@/lib/db";
import { listSubmissions } from "@/lib/submissions";
import { DashboardGreeting } from "@/components/admin/DashboardGreeting/DashboardGreeting";
import { getAnalyticsCount } from "@/lib/analytics";
import styles from "./dashboard-home.module.css";

export const dynamic = "force-dynamic";

export default function AdminHomePage() {
  const caseStudies = db.prepare("SELECT id, title, description, tags, thumbnail_image, published FROM case_studies ORDER BY id DESC").all() as Array<{ id: number; title: string; description: string; tags: string; thumbnail_image: string; published: number }>;
  const insights = db.prepare("SELECT id, title, excerpt, tags, thumbnail_image, published FROM insights ORDER BY id DESC").all() as Array<{ id: number; title: string; excerpt: string; tags: string; thumbnail_image: string; published: number }>;
  const services = db.prepare("SELECT title, description, published FROM service_items ORDER BY id DESC").all() as Array<{ title: string; description: string; published: number }>;
  const submissions = listSubmissions();
  const publishedCaseStudies = caseStudies.filter((item) => item.published).length;
  const publishedArticles = insights.filter((item) => item.published).length;
  const draftCount = caseStudies.filter((item) => !item.published).length + insights.filter((item) => !item.published).length;
  const caseStudyViews = getAnalyticsCount("case_study", ["view"]);
  const caseStudyShares = getAnalyticsCount("case_study", ["share"]);
  const articleViews = getAnalyticsCount("article", ["view"]);
  const articleShares = getAnalyticsCount("article", ["share"]);
  const cvDownloads = getAnalyticsCount("cv", ["download"]);
  const attention = [...caseStudies.filter((item) => !item.thumbnail_image).map((item) => ({ label: `${item.title} is missing a thumbnail`, href: `/admin/case-studies/${item.id}` })), ...insights.filter((item) => !item.tags.trim()).map((item) => ({ label: `${item.title} has no tags`, href: `/admin/insights/${item.id}` }))].slice(0, 5);

  return (
    <>
      <div className={styles.header}><div><p className="label-eyebrow" style={{ color: "var(--text-accent)" }}>Content control centre</p><DashboardGreeting /></div></div>
      <div className={styles.stats}><Stat href="/admin/case-studies" value={publishedCaseStudies} secondaryValue={caseStudyViews} tertiaryValue={caseStudyShares} label="Case studies" secondaryLabel="Views" tertiaryLabel="Shares" icon="▣" /><Stat href="/admin/insights" value={publishedArticles} secondaryValue={articleViews} tertiaryValue={articleShares} label="Articles" secondaryLabel="Views" tertiaryLabel="Shares" icon="▤" /><Stat href="/admin/case-studies" value={draftCount} label="Drafts" secondaryLabel="Articles + case studies" icon="✎" /><Stat href="/admin/about" value={cvDownloads} label="Engagements" secondaryLabel="CV downloads" icon="↗" /></div>
      <div className={styles.columns}>
        <section className={styles.panel}><div className={styles.panelHeader}><h2 className="heading-03">Needs attention</h2><span className="label-small">{attention.length}</span></div>{attention.length ? attention.map((item) => <Link key={item.href} href={item.href} className={styles.attentionRow}><span className={styles.alert}>!</span><span>{item.label}</span><span aria-hidden="true">›</span></Link>) : <p className="body-small" style={{ color: "var(--text-tertiary)" }}>Everything looks complete.</p>}</section>
      </div>
      <section className={styles.quickPanel}><div className={styles.panelHeader}><h2 className="heading-03">Quick actions</h2></div><div className={styles.quick}><Link href="/admin/insights/new"><span aria-hidden="true">＋</span>New article</Link><Link href="/admin/case-studies/new"><span aria-hidden="true">＋</span>New case study</Link><Link href="/admin/homepage"><span aria-hidden="true">⌂</span>Edit homepage</Link><Link href="/admin/submissions"><span aria-hidden="true">✉</span>View {submissions.length} submissions</Link></div></section>
      <section className={styles.system}><span className={styles.check}>✓</span><div><strong>All systems operational</strong><p>Database and admin tools are available.</p></div></section>
    </>
  );
}

function Stat({ href, value, secondaryValue, tertiaryValue, label, secondaryLabel, tertiaryLabel, icon }: { href: string; value: number; secondaryValue?: number; tertiaryValue?: number; label: string; secondaryLabel?: string; tertiaryLabel?: string; icon: string }) { return <Link href={href} className={styles.stat}><span className={styles.statIcon} aria-hidden="true">{icon}</span><span className={styles.statValue}>{value}</span><span className="body-small">{label}</span>{secondaryValue !== undefined && <><span className={styles.statSecondaryValue}>{secondaryValue}</span><span className="body-small">{secondaryLabel}</span></>}{tertiaryValue !== undefined && <><span className={styles.statSecondaryValue}>{tertiaryValue}</span><span className="body-small">{tertiaryLabel}</span></>}</Link>; }
