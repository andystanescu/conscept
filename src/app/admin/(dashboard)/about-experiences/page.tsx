import Link from "next/link";
import { getAllExperiencesAdmin, getSection } from "@/lib/about";
import { AdminTabs } from "@/components/admin/AdminTabs/AdminTabs";
import { ABOUT_TABS } from "../adminTabs";
import styles from "../admin.module.css";

export const dynamic = "force-dynamic";

export default function AdminAboutExperiencesPage() {
  const experiences = getAllExperiencesAdmin();
  const section = getSection("before_conscept");
  return (
    <>
      <h1 className="heading-01">About</h1>
      <AdminTabs tabs={ABOUT_TABS} active="/admin/about-experiences" />
      <div className={styles.toolbar}>
        <p className="heading-02">Before ConScept</p>
        <Link href="/admin/about-experiences/new" className={styles.newLink}>New experience</Link>
      </div>
      <p className={`body-small ${styles.helper}`} style={{ maxWidth: 640 }}>
        Edit the eyebrow and title through the section card, then add the experience cards shown in Personal mode.
      </p>
      {section && (
        <p className={styles.listItemMeta}>
          <Link href="/admin/about/before_conscept" className={styles.editLink}>Edit section title and eyebrow</Link>
        </p>
      )}
      {experiences.length === 0 ? <p className={`body-default ${styles.empty}`}>No experiences yet.</p> : (
        <ul className={styles.list}>
          {experiences.map((item) => (
            <li key={item.id} className={styles.listItem}>
              <div className={styles.listItemMeta}>
                <p className="body-default">{item.job_title} — {item.company_name}{!item.published && <span className={styles.unpublished}> — unpublished</span>}</p>
                <p className="body-small">{item.start_date} — {item.end_date || "Present"}</p>
              </div>
              <div className={styles.listItemActions}>
                <Link href={`/admin/about-experiences/${item.id}`} className={styles.editLink} aria-label="Edit experience" title="Edit experience"><span aria-hidden="true">✎</span></Link>
                <form action={`/api/admin/about-experiences/${item.id}/delete`} method="POST" className={styles.deleteForm}>
                  <button type="submit" className={styles.deleteButton} aria-label="Delete experience" title="Delete experience"><span aria-hidden="true">×</span></button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
