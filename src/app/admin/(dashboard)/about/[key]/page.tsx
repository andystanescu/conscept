import { notFound } from "next/navigation";
import { getSection } from "@/lib/about";
import styles from "../../admin.module.css";

export const dynamic = "force-dynamic";

const LABELS: Record<string, string> = {
  hero: "Hero",
  drives_me: "What Drives Me",
  philosophy: "Philosophy",
  highlights: "Highlights",
  latest_insights: "Latest Insights",
};

export default async function EditAboutSectionPage({
  params,
  searchParams,
}: {
  params: Promise<{ key: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { key } = await params;
  const { error } = await searchParams;
  const section = getSection(key);

  if (!section) {
    notFound();
  }

  return (
    <>
      <h1 className="heading-01">Edit about page: {LABELS[key] ?? key}</h1>
      {error && <p style={{ color: "var(--border-error)" }}>{error}</p>}
      <form
        className={styles.form}
        action={`/api/admin/about/${section.key}`}
        method="POST"
      >
        <label className={styles.field}>
          <span className="label-small" style={{ color: "var(--text-secondary)" }}>
            Eyebrow
          </span>
          <input
            type="text"
            name="eyebrow"
            defaultValue={section.eyebrow}
            className={styles.input}
          />
        </label>

        <label className={styles.field}>
          <span className="label-small" style={{ color: "var(--text-secondary)" }}>
            Headline (wrap a word in #like this# for orange)
          </span>
          <input
            type="text"
            name="headline"
            defaultValue={section.headline}
            required
            className={styles.input}
          />
        </label>

        <label className={styles.field}>
          <span className="label-small" style={{ color: "var(--text-secondary)" }}>
            Description
          </span>
          <textarea
            name="description"
            defaultValue={section.description}
            className={styles.textarea}
          />
        </label>

        <div className={styles.formActions}>
          <button type="submit" className={styles.submit}>
            <span className="label-button">Save changes</span>
          </button>
        </div>
      </form>
    </>
  );
}
