import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import type { Insight } from "@/data/insights";
import { RichTextEditor } from "@/components/admin/RichTextEditor/RichTextEditor";
import { ImageField } from "@/components/admin/ImageField/ImageField";
import { getServiceItems } from "@/lib/serviceItems";
import styles from "../../admin.module.css";
import { dateInputValue } from "@/lib/dateUtils";

export const dynamic = "force-dynamic";

export default async function EditInsightPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;

  const insight = db
    .prepare("SELECT * FROM insights WHERE id = ?")
    .get(id) as Insight | undefined;

  if (!insight) {
    notFound();
  }

  const categories = getServiceItems();

  return (
    <>
      <h1 className="heading-01">Edit article</h1>
      {error && <p style={{ color: "var(--border-error)" }}>{error}</p>}
      <form
        className={styles.form}
        action={`/api/admin/insights/${insight.id}`}
        method="POST"
        encType="multipart/form-data"
      >
        <label className={styles.field}>
          <span className="label-small" style={{ color: "var(--text-secondary)" }}>
            Slug (used in the URL: /insights/…)
          </span>
          <input
            type="text"
            name="slug"
            defaultValue={insight.slug}
            required
            className={styles.input}
          />
        </label>

        <label className={styles.field}>
          <span className="label-small" style={{ color: "var(--text-secondary)" }}>
            Title
          </span>
          <input
            type="text"
            name="title"
            defaultValue={insight.title}
            required
            className={styles.input}
          />
        </label>

        <label className={styles.field}>
          <span className="label-small" style={{ color: "var(--text-secondary)" }}>
            Excerpt
          </span>
          <textarea
            name="excerpt"
            defaultValue={insight.excerpt}
            required
            className={styles.textarea}
          />
        </label>

        <label className={styles.field}>
          <span className="label-small" style={{ color: "var(--text-secondary)" }}>
            Category (shown in the breadcrumb and hero eyebrow)
          </span>
          <select
            name="category"
            defaultValue={insight.category}
            className={styles.input}
          >
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
          <input type="text" name="tags" defaultValue={insight.tags} placeholder="Design Systems * Strategy" className={styles.input} />
        </label>

        <label className={styles.field}>
          <span className="label-small" style={{ color: "var(--text-secondary)" }}>
            Author (from Settings)
          </span>
          <input
            type="text"
            name="author"
            value={insight.author}
            readOnly
            className={styles.input}
          />
        </label>

        <label className={styles.field}>
          <span className="label-small" style={{ color: "var(--text-secondary)" }}>
            Cover image (shown at the top of the article)
          </span>
          <ImageField name="cover_image" currentUrl={insight.cover_image} />
        </label>

        <label className={styles.field}>
          <span className="label-small" style={{ color: "var(--text-secondary)" }}>
            Thumbnail image (shown on cards and listings)
          </span>
          <ImageField name="thumbnail_image" currentUrl={insight.thumbnail_image} />
        </label>

        <label className={styles.checkboxField}>
          <input type="checkbox" name="published" defaultChecked={!!insight.published} />
          <span className={styles.switch} aria-hidden="true" />
          <span className="body-default">Published</span>
        </label>

        <label className={`${styles.field} ${styles.fieldWide}`}>
          <span className="label-small" style={{ color: "var(--text-secondary)" }}>
            Body
          </span>
          <RichTextEditor name="body" defaultValue={insight.body} />
        </label>

        <label className={styles.field}>
          <span className="label-small" style={{ color: "var(--text-secondary)" }}>
            Published date
          </span>
          <input
            type="date"
            name="published_at"
            defaultValue={dateInputValue(insight.published_at)}
            className={styles.input}
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
