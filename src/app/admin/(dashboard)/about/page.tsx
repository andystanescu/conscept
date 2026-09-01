import { getAllSections } from "@/lib/about";
import { ReorderableList } from "@/components/admin/ReorderableList/ReorderableList";
import { AdminTabs } from "@/components/admin/AdminTabs/AdminTabs";
import { InlineSectionCard } from "@/components/admin/InlineSectionCard/InlineSectionCard";
import { ABOUT_TABS } from "../adminTabs";
import styles from "../admin.module.css";

export const dynamic = "force-dynamic";

const LABELS: Record<string, string> = {
  hero: "Hero",
  drives_me: "What Drives Me",
  philosophy: "Philosophy",
  highlights: "Highlights",
  latest_insights: "Latest Insights",
  before_conscept: "Before ConScept",
};

export default function AdminAboutPage() {
  const sections = getAllSections();
  const fixedSections = sections.filter((s) => s.fixed);
  const reorderable = sections.filter((s) => !s.fixed);

  return (
    <>
      <h1 className="heading-01">About</h1>
      <AdminTabs tabs={ABOUT_TABS} active="/admin/about" />
      <p className={`body-small ${styles.helper}`} style={{ maxWidth: 640 }}>
        Nav, Hero, and Footer are always in that position. The sections in
        between can be reordered — drag them, or use the arrows. Philosophy
        and Highlights each have their own item list, in the tabs above. Wrap
        a word in #like this# to color it orange.
      </p>

      <ul className={styles.list}>{fixedSections.map((section) => <li key={section.key} className={styles.listItem}><InlineSectionCard section={section} label={LABELS[section.key] ?? section.key} parent="about" fixed /></li>)}</ul>

      <ReorderableList
        className={styles.list}
        itemClassName={styles.listItem}
        reorderUrl="/api/admin/about/reorder"
        style={{ marginTop: "var(--space-200)" }}
        items={reorderable.map((section, index) => ({
          id: section.key,
          node: (
            <>
              <InlineSectionCard section={section} label={LABELS[section.key] ?? section.key} parent="about" reorder={<>
                <form action={`/api/admin/about/${section.key}/move`} method="POST">
                  <input type="hidden" name="direction" value="up" />
                  <button type="submit" disabled={index === 0} aria-label="Move up">
                    ↑
                  </button>
                </form>
                <form action={`/api/admin/about/${section.key}/move`} method="POST">
                  <input type="hidden" name="direction" value="down" />
                  <button
                    type="submit"
                    disabled={index === reorderable.length - 1}
                    aria-label="Move down"
                  >
                    ↓
                  </button>
                </form>
              </>}/>
            </>
          ),
        }))}
      />
    </>
  );
}
