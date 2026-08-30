import { RichTextEditor } from "@/components/admin/RichTextEditor/RichTextEditor";
import { ImageField } from "@/components/admin/ImageField/ImageField";
import { getServiceItems } from "@/lib/serviceItems";
import styles from "../../admin.module.css";

export default async function NewInsightPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const categories = getServiceItems();

  return (
    <>
      <h1 className="heading-01">New article</h1>
      {error && <p style={{ color: "var(--border-error)" }}>{error}</p>}
      <form
        className={styles.form}
        action="/api/admin/insights"
        method="POST"
        encType="multipart/form-data"
      >
        <label className={styles.field}>
          <span className="label-small" style={{ color: "var(--text-secondary)" }}>
            Slug (used in the URL: /insights/…)
          </span>
          <input type="text" name="slug" required className={styles.input} />
        </label>

        <label className={styles.field}>
          <span className="label-small" style={{ color: "var(--text-secondary)" }}>
            Title
          </span>
          <input type="text" name="title" required className={styles.input} />
        </label>

        <label className={styles.field}>
          <span className="label-small" style={{ color: "var(--text-secondary)" }}>
            Excerpt (shown on cards and listings)
          </span>
          <textarea name="excerpt" required className={styles.textarea} />
        </label>

        <label className={styles.field}>
          <span className="label-small" style={{ color: "var(--text-secondary)" }}>
            Category (shown in the breadcrumb and hero eyebrow)
          </span>
          <select name="category" defaultValue="" className={styles.input}>
            <option value="">— None —</option>
            {categories.map((service) => (
              <option key={service.id} value={service.title}>
                {service.title}
              </option>
            ))}
          </select>
        </label>

        <label className={styles.field}>
          <span className="label-small" style={{ color: "var(--text-secondary)" }}>
            Tags (separate with *)
          </span>
          <input type="text" name="tags" placeholder="Design Systems * Strategy" className={styles.input} />
        </label>

        <label className={styles.field}>
          <span className="label-small" style={{ color: "var(--text-secondary)" }}>
            Author
          </span>
          <input
            type="text"
            name="author"
            defaultValue="Andrei Stanescu"
            className={styles.input}
          />
        </label>

        <label className={styles.field}>
          <span className="label-small" style={{ color: "var(--text-secondary)" }}>
            Cover image (shown at the top of the article)
          </span>
          <ImageField name="cover_image" />
        </label>

        <label className={styles.field}>
          <span className="label-small" style={{ color: "var(--text-secondary)" }}>
            Thumbnail image (shown on cards and listings)
          </span>
          <ImageField name="thumbnail_image" />
        </label>

        <label className={styles.checkboxField}>
          <input type="checkbox" name="published" defaultChecked />
          <span className={styles.switch} aria-hidden="true" />
          <span className="body-default">Published</span>
        </label>

        <label className={`${styles.field} ${styles.fieldWide}`}>
          <span className="label-small" style={{ color: "var(--text-secondary)" }}>
            Body
          </span>
          <RichTextEditor name="body" />
        </label>

        <label className={styles.field}>
          <span className="label-small" style={{ color: "var(--text-secondary)" }}>
            Published date (shown as text, e.g. &ldquo;August 2026&rdquo;)
          </span>
          <input type="text" name="published_at" className={styles.input} />
        </label>

        <div className={styles.formActions}>
          <button type="submit" className={styles.submit}>
            <span className="label-button">Create article</span>
          </button>
        </div>
      </form>
    </>
  );
}
