import { getExperiences, getVisibleSection } from "@/lib/about";
import { getSettings } from "@/lib/settings";
import styles from "./AboutBeforeConScept.module.css";

function formatExperienceDate(value: string) {
  if (!value) return "Present";
  const date = new Date(`${value.slice(0, 10)}T00:00:00`);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString("en-GB", { month: "short", year: "numeric" });
}

export function AboutBeforeConScept() {
  if (getSettings().logo_identity !== "personal") return null;
  const section = getVisibleSection("before_conscept");
  if (!section) return null;
  const experiences = getExperiences();

  return (
    <section id="before-conscept" className={`container ${styles.section}`}>
      <p className="label-eyebrow" style={{ color: "var(--text-accent)" }}>{section.eyebrow}</p>
      <h2 className="heading-01">{section.headline}</h2>
      {section.description && <p className={`body-large ${styles.intro}`}>{section.description}</p>}
      <div className={styles.timeline}>
        {experiences.map((experience) => (
          <article key={experience.id} className={styles.card}>
            <p className={styles.dates}>
              {formatExperienceDate(experience.start_date)} — {formatExperienceDate(experience.end_date)}
            </p>
            <div className={styles.identity}>
              <h3>{experience.job_title}</h3>
              <p className={styles.company}>{experience.company_name}{experience.business_profile ? ` · ${experience.business_profile}` : ""}</p>
            </div>
            <p className={styles.description}>{experience.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
