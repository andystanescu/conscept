import { notFound } from "next/navigation";
import Link from "next/link";
import { cookies } from "next/headers";
import { Nav } from "@/components/Nav/Nav";
import { Footer } from "@/components/Footer/Footer";
import { RichContent } from "@/components/RichContent/RichContent";
import { ArticleCard } from "@/components/ArticleCard/ArticleCard";
import { getCaseStudies, getCaseStudyBySlug, getCaseStudyMetrics, getCaseStudyAssessment } from "@/data/caseStudies";
import { assessmentCriteriaList, generateActivityRecommendations, getPrimaryComplexityDrivers } from "@/data/caseStudyAssessment";
import { addHeadingIds } from "@/lib/tableOfContents";
import { TableOfContents } from "@/components/TableOfContents/TableOfContents";
import { BackButton } from "@/components/BackButton/BackButton";
import styles from "./case-study.module.css";
import { CaseStudyPasswordGate } from "@/components/CaseStudyPasswordGate/CaseStudyPasswordGate";
import { caseStudyAccessCookieName, verifyCaseStudyAccessToken } from "@/lib/caseStudyAccess";

export const dynamic = "force-dynamic";

export default async function CaseStudyDetailPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams?: Promise<{ accessError?: string }> }) {
  const { slug } = await params;
  const study = getCaseStudyBySlug(slug);
  if (!study) notFound();
  let passwordHashes: string[] = [];
  try { const parsed = JSON.parse(study.password_hashes || "[]"); passwordHashes = Array.isArray(parsed) ? parsed.map((value) => typeof value === "string" ? value : value && typeof value === "object" && typeof value.hash === "string" ? value.hash : null).filter((value): value is string => Boolean(value)) : []; } catch { passwordHashes = []; }
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(caseStudyAccessCookieName(study.slug))?.value;
  const accessGranted = !study.password_required || verifyCaseStudyAccessToken(accessToken, study.slug, passwordHashes);
  if (!accessGranted) {
    const query = searchParams ? await searchParams : {};
    return <><Nav /><CaseStudyPasswordGate slug={study.slug} error={query.accessError ? "That password was not recognised." : undefined} /><Footer /></>;
  }
  const { html: bodyHtml, toc } = addHeadingIds(study.body);
  const studies = getCaseStudies();
  const index = studies.findIndex((item) => item.slug === study.slug);
  const previous = index > 0 ? studies[index - 1] : undefined;
  const next = index >= 0 && index < studies.length - 1 ? studies[index + 1] : undefined;
  const related = studies.filter((item) => item.slug !== study.slug).sort(() => Math.random() - 0.5).slice(0, 3);
  const metrics = getCaseStudyMetrics(study);
  const assessment = getCaseStudyAssessment(study);
  const hasAssessment = assessment.overall || assessment.likelyEngagement.length > 0 || Object.values(assessment.scores).some(Boolean);
  const activityRecommendations = generateActivityRecommendations(assessment.scores);
  const maxDisplayedActivities = 6;
  const likelyRecommendations = assessment.likelyEngagement.map((item) => ({ item, recommendation: activityRecommendations.find((activity) => activity.name === item) }));
  const selectedRequirements = new Set<string>();
  const diverseActivities = likelyRecommendations.filter(({ recommendation }) => {
    const requirement = recommendation?.triggeredBy.find((trigger) => !selectedRequirements.has(trigger.criterion));
    if (!requirement) return false;
    selectedRequirements.add(requirement.criterion);
    return true;
  }).map(({ item }) => item).slice(0, maxDisplayedActivities);
  const likelyDisplayed = [...diverseActivities, ...assessment.likelyEngagement.filter((item) => !diverseActivities.includes(item))].slice(0, maxDisplayedActivities);
  const likelyHiddenCount = Math.max(0, assessment.likelyEngagement.length - maxDisplayedActivities);
  const primaryDrivers = getPrimaryComplexityDrivers(assessment.scores);
  const assessmentToc = hasAssessment ? [{ id: "assessment-overview", text: "Assessment" }, { id: "complexity-profile", text: "Complexity profile" }, { id: "likely-engagement", text: "Likely engagement" }] : [];

  return <>
    <Nav />
    <main className={styles.main}>
      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <BackButton label="Back to work" fallbackHref="/work" />
          <p className={styles.breadcrumb}><Link href="/work">Work</Link><span>/</span>{study.slug}</p>
          <p className="label-eyebrow" style={{ color: "var(--text-accent)" }}>{study.category || study.eyebrow || "CASE STUDY"}</p>
          <h1 className="display-small">{study.title}</h1>
          <p className="body-large" style={{ color: "var(--text-secondary)" }}>{study.description}</p>
          {(study.category || study.year) && <p className={styles.meta}>{study.category}{study.category && study.year ? "  ·  " : ""}{study.year}</p>}
        </div>
        {study.cover_image && <div className={styles.heroImage}><img src={study.cover_image} alt="" /></div>}
      </section>
      {metrics.length > 0 && <section className={`${styles.outcomes} section-dark`}><div className={`container ${styles.outcomesGrid}`}><div className={styles.outcomeIntro}><p className="label-eyebrow" style={{ color: "var(--text-accent)" }}>{study.outcome_eyebrow || "OUTCOMES"}</p><h2 className={styles.outcomeTitle}>{study.outcome_title}</h2></div><div className={styles.metrics}>{metrics.map((metric) => <div key={`${metric.value}-${metric.label}`} className={styles.metric}><strong>{metric.value}</strong><span>{metric.label}</span></div>)}</div></div></section>}
      <div className={`container ${styles.layout}`}>
        {(toc.length > 0 || assessmentToc.length > 0) && <aside className={styles.toc}><TableOfContents items={[...assessmentToc, ...toc]} /><p className="label-small">ON THIS PAGE</p><nav aria-label="On this page"><ul>{[...assessmentToc, ...toc].map((item) => <li key={item.id}><a href={`#${item.id}`}>{item.text}</a></li>)}</ul></nav></aside>}
        <article className={styles.articleBody}>{hasAssessment && <section id="engagement-assessment" className={styles.assessment}><div className={styles.assessmentHeader}><div><p className="label-eyebrow" style={{ color: "var(--text-accent)" }}>CONSCEPT ENGAGEMENT ASSESSMENT</p><h2 id="assessment-overview" className="heading-02">A clearer view of the work ahead.</h2><p className="body-default">A practical record of the complexity observed, the activities likely to help, and the work that was actually conducted.</p></div></div><div className={styles.assessmentGrid}><div className={styles.assessmentScores}><h3 id="complexity-profile" className="heading-03">Complexity profile</h3>{assessmentCriteriaList.map((criterion) => { const score=assessment.scores[criterion.key] || 0; return <div className={styles.assessmentScore} key={criterion.key}><div><span>{criterion.label}{primaryDrivers.includes(criterion.key) && <em className={styles.primaryDriver}>Primary driver</em>}</span><strong>{score ? `${score} / 5` : "—"}</strong></div><div className={styles.scoreTrack}><i style={{ width: `${Math.min(100, score / 5 * 100)}%` }} /></div></div>; })}</div><div className={styles.assessmentAside}>{assessment.overall && <div className={styles.assessmentSummary}><span>OVERALL COMPLEXITY</span><strong>{assessment.overall}</strong><p>{assessment.overallDescription}</p></div>}<div className={styles.assessmentLists}><div><h3 id="likely-engagement" className="heading-03">Likely engagement</h3><div className={styles.activityCards}>{likelyDisplayed.map((item) => { const recommendation = activityRecommendations.find((activity) => activity.name === item); const drivers = recommendation?.triggeredBy.map((trigger) => assessmentCriteriaList.find((criterion) => criterion.key === trigger.criterion)?.label).filter(Boolean).join(" · ") || "Complexity profile"; const completed = assessment.conducted.includes(item); return <article className={styles.activityCard} key={item}><div className={styles.activityCardHeader}><h4>{item}</h4><span className={completed ? styles.statusComplete : styles.statusIncomplete}>{completed ? "Complete" : "Not completed"}</span></div><p><strong>Driving requirement</strong>{drivers}</p><p>{getActivityDescription(item)}</p></article>; })}</div>{likelyHiddenCount > 0 && <p className={styles.assessmentMore}>(+ {likelyHiddenCount} activities were included in this project)</p>}</div></div></div></div></section>}
        <RichContent html={bodyHtml} />
      </article>
      </div>
      {(previous || next) && <nav className={`container ${styles.caseNav}`} aria-label="Case study navigation">{previous ? <Link href={`/work/${previous.slug}`}><span>Previous case study</span><strong>{previous.title}</strong></Link> : <span />}{next ? <Link href={`/work/${next.slug}`} className={styles.next}><span>Next case study</span><strong>{next.title}</strong></Link> : <span />}</nav>}
      {related.length > 0 && <section className={`container ${styles.related}`}><p className="label-eyebrow" style={{ color: "var(--text-accent)" }}>RELATED WORK</p><h2 className="heading-01">More case studies</h2><div className={styles.relatedGrid}>{related.map((item) => <ArticleCard key={item.slug} slug={item.slug} title={item.title} excerpt={item.description} thumbnail={item.thumbnail_image} variant="caseStudy" />)}</div><Link className={styles.allWork} href="/work">All case studies <span>→</span></Link></section>}
    </main>
    <Footer />
  </>;
}

function getActivityDescription(name: string) {
  const activity = name.toLowerCase();
  if (activity.includes("interview")) return "Spoke with the people closest to the problem to uncover needs, constraints, and decision context.";
  if (activity.includes("workshop")) return "A facilitated working session to align perspectives, make decisions, and agree the next action.";
  if (activity.includes("mapping") || activity.includes("map")) return "Made relationships, dependencies, and gaps visible so the team could prioritise the right intervention.";
  if (activity.includes("audit") || activity.includes("assessment") || activity.includes("review")) return "Examined the current experience and evidence to identify risks, duplication, and opportunities for improvement.";
  if (activity.includes("validation") || activity.includes("testing") || activity.includes("checkpoint")) return "Checked the proposed direction against user, stakeholder, accessibility, or delivery needs before moving forward.";
  if (activity.includes("governance") || activity.includes("ownership") || activity.includes("accountability")) return "Clarified who makes decisions, how contributions are managed, and how the work stays consistent over time.";
  return "A focused activity to reduce uncertainty, support better decisions, and move the engagement forward.";
}
