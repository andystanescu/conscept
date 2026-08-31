import { RichTextEditor } from "@/components/admin/RichTextEditor/RichTextEditor";
import { ImageField } from "@/components/admin/ImageField/ImageField";
import styles from "../../admin.module.css";
import { todayInputValue } from "@/lib/dateUtils";

export default async function NewCaseStudyPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <>
      <h1 className="heading-01">New case study</h1>
      {error && <p style={{ color: "var(--border-error)" }}>{error}</p>}
      <form
        className={styles.form}
        action="/api/admin/case-studies"
        method="POST"
        encType="multipart/form-data"
      >
        <label className={styles.field}>
          <span className="label-small" style={{ color: "var(--text-secondary)" }}>Published date</span>
          <input type="date" name="published_at" defaultValue={todayInputValue()} className={styles.input} />
        </label>

        <label className={styles.field}>
          <span className="label-small" style={{ color: "var(--text-secondary)" }}>
            Slug (used in the URL: /work/…)
          </span>
          <input type="text" name="slug" required className={styles.input} />
        </label>

        <label className={styles.field}>
          <span className="label-small" style={{ color: "var(--text-secondary)" }}>
            Eyebrow (e.g. &ldquo;Featured case study&rdquo; or a category)
          </span>
          <input type="text" name="eyebrow" className={styles.input} />
        </label>

        <label className={styles.field}>
          <span className="label-small" style={{ color: "var(--text-secondary)" }}>
            Title
          </span>
          <input type="text" name="title" required className={styles.input} />
        </label>

        <label className={styles.field}>
          <span className="label-small" style={{ color: "var(--text-secondary)" }}>
            Description (shown on cards and listings)
          </span>
          <textarea name="description" required className={styles.textarea} />
        </label>

        <label className={styles.field}>
          <span className="label-small" style={{ color: "var(--text-secondary)" }}>
            Tags (optional, e.g. &ldquo;Strategy · Design Systems · Governance&rdquo;)
          </span>
          <input type="text" name="tags" className={styles.input} />
        </label>

        <label className={styles.field}>
          <span className="label-small" style={{ color: "var(--text-secondary)" }}>
            Cover image (shown at the top of the case study)
          </span>
          <ImageField name="cover_image" />
        </label>

        <label className={styles.field}>
          <span className="label-small" style={{ color: "var(--text-secondary)" }}>
            Thumbnail image (shown on cards and listings)
          </span>
          <ImageField name="thumbnail_image" />
        </label>

        <label className={`${styles.field} ${styles.fieldWide}`}>
          <span className="label-small" style={{ color: "var(--text-secondary)" }}>
            Full write-up
          </span>
          <RichTextEditor name="body" />
        </label>

        <label className={styles.checkboxField}>
          <input type="checkbox" name="published" defaultChecked />
          <span className="body-default">Published</span>
        </label>

        <div className={styles.formActions}>
          <button type="submit" className={styles.submit}>
            <span className="label-button">Create case study</span>
          </button>
        </div>
      </form>
    </>
  );
}
