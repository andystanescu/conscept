import Link from "next/link";
import { db } from "@/lib/db";
import { listSubmissions } from "@/lib/submissions";
import { DashboardGreeting } from "@/components/admin/DashboardGreeting/DashboardGreeting";
import styles from "./dashboard-home.module.css";

export const dynamic = "force-dynamic";

export default function AdminHomePage() {
  const caseStudies = db.prepare("SELECT id, title, description, tags, thumbnail_image, published FROM case_studies ORDER BY id DESC").all() as Array<{ id: number; title: string; description: string; tags: string; thumbnail_image: string; published: number }>;
  const insights = db.prepare("SELECT id, title, excerpt, tags, thumbnail_image, published FROM insights ORDER BY id DESC").all() as Array<{ id: number; title: string; excerpt: string; tags: string; thumbnail_image: string; published: number }>;
  const services = db.prepare("SELECT title, description, published FROM service_items ORDER BY id DESC").all() as Array<{ title: string; description: string; published: number }>;
  const submissions = listSubmissions();
  const publishedCount = caseStudies.filter((item) => item.published).length + insights.filter((item) => item.published).length + services.filter((item) => item.published).length;
  const draftCount = caseStudies.filter((item) => !item.published).length + insights.filter((item) => !item.published).length + services.filter((item) => !item.published).length;
  const attention = [...caseStudies.filter((item) => !item.thumbnail_image).map((item) => ({ label: `${item.title} is missing a thumbnail`, href: `/admin/case-studies/${item.id}` })), ...insights.filter((item) => !item.tags.trim()).map((item) => ({ label: `${item.title} has no tags`, href: `/admin/insights/${item.id}` }))].slice(0, 5);

  return (
    <>
      <div className={styles.header}><div><p className="label-eyebrow" style={{ color: "var(--text-accent)" }}>Content control centre</p><DashboardGreeting /></div></div>
      <div className={styles.stats}><Stat href="/admin/case-studies" value={publishedCount} label="Published" icon="✓" /><Stat href="/admin/case-studies" value={draftCount} label="Drafts" icon="✎" /><Stat href="/admin/case-studies" value={caseStudies.length} label="Case studies" icon="▣" /><Stat href="/admin/insights" value={insights.length} label="Articles" icon="▤" /></div>
      <div className={styles.columns}>
        <section className={styles.panel}><div className={styles.panelHeader}><h2 className="heading-03">Needs attention</h2><span className="label-small">{attention.length}</span></div>{attention.length ? attention.map((item) => <Link key={item.href} href={item.href} className={styles.attentionRow}><span className={styles.alert}>!</span><span>{item.label}</span><span aria-hidden="true">›</span></Link>) : <p className="body-small" style={{ color: "var(--text-tertiary)" }}>Everything looks complete.</p>}</section>
        <section className={styles.panel}><div className={styles.panelHeader}><h2 className="heading-03">Quick actions</h2></div><div className={styles.quick}><Link href="/admin/insights/new"><span aria-hidden="true">＋</span>New article</Link><Link href="/admin/case-studies/new"><span aria-hidden="true">＋</span>New case study</Link><Link href="/admin/homepage"><span aria-hidden="true">⌂</span>Edit homepage</Link><Link href="/admin/submissions"><span aria-hidden="true">✉</span>View {submissions.length} submissions</Link></div></section>
      </div>
      <section className={styles.health}><div><h2 className="heading-03">Content health</h2><p className="body-small">Completeness across the content that powers the site.</p></div><div className={styles.healthRows}><HealthRow label="Articles" value={insights.length ? Math.round((insights.filter((item) => item.title && item.excerpt && item.tags).length / insights.length) * 100) : 0} /><HealthRow label="Case studies" value={caseStudies.length ? Math.round((caseStudies.filter((item) => item.title && item.description && item.thumbnail_image).length / caseStudies.length) * 100) : 0} /><HealthRow label="Services" value={services.length ? Math.round((services.filter((item) => item.title && item.description).length / services.length) * 100) : 0} /></div></section>
      <section className={styles.system}><span className={styles.check}>✓</span><div><strong>All systems operational</strong><p>Database and admin tools are available.</p></div></section>
    </>
  );
}

function Stat({ href, value, label, icon }: { href: string; value: number; label: string; icon: string }) { return <Link href={href} className={styles.stat}><span className={styles.statIcon} aria-hidden="true">{icon}</span><span className={styles.statValue}>{value}</span><span className="body-small">{label}</span></Link>; }
function HealthRow({ label, value }: { label: string; value: number }) { return <div className={styles.healthRow}><span>{label}</span><i><b style={{ width: `${value}%` }} /></i><strong>{value}%</strong></div>; }
