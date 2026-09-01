import { RichTextEditor } from "@/components/admin/RichTextEditor/RichTextEditor";
import { ImageField } from "@/components/admin/ImageField/ImageField";
import { AdminContentTabs } from "@/components/admin/AdminContentTabs/AdminContentTabs";
import { MetadataFields } from "@/components/admin/MetadataFields/MetadataFields";
import type { Insight } from "@/data/insights";
import styles from "@/app/admin/(dashboard)/admin.module.css";
import { dateInputValue, todayInputValue } from "@/lib/dateUtils";

type Props = { action: string; categories: Array<{ id: number; title: string }>; settingsAuthor: string; insight?: Insight };

export function InsightEditor({ action, categories, settingsAuthor, insight }: Props) {
  const editing = Boolean(insight);
  const value = (key: keyof Insight) => insight?.[key] ?? "";
  return <form className={styles.form} action={action} method="POST" encType="multipart/form-data">
    <AdminContentTabs tabs={[
      { id: "details", label: "Details", content: <>
        <Field label="Slug (used in the URL: /insights/…)" name="slug" value={value("slug")} required />
        <Field label="Title" name="title" value={value("title")} required />
        <Field label="Excerpt (shown on cards and listings)" name="excerpt" value={value("excerpt")} textarea required />
        <label className={styles.field}><span className="label-small">Category (shown in the breadcrumb and hero eyebrow)</span><select name="category" defaultValue={String(value("category"))} className={styles.input}><option value="">— None —</option>{categories.map((service) => <option key={service.id} value={service.title}>{service.title}</option>)}</select></label>
        <Field label="Tags (separate with *)" name="tags" value={value("tags")} placeholder="Design Systems * Strategy" />
        <label className={styles.field}><span className="label-small">Author (from Settings)</span><input type="text" name="author" value={settingsAuthor} readOnly className={styles.input} /></label>
        <label className={styles.field}><span className="label-small">Published date</span><input type="date" name="published_at" defaultValue={dateInputValue(String(value("published_at")) || todayInputValue())} className={styles.input} /></label>
        <label className={styles.checkboxField}><input type="checkbox" name="published" defaultChecked={editing ? Boolean(insight?.published) : true} /><span className={styles.switch} aria-hidden="true" /><span className="body-default">Published</span></label>
      </> },
      { id: "body", label: "Body", content: <>
        <label className={`${styles.field} ${styles.fieldWide}`}><span className="label-small">Cover image (shown at the top of the article)</span><ImageField name="cover_image" currentUrl={String(value("cover_image"))} /></label>
        <label className={`${styles.field} ${styles.fieldWide}`}><span className="label-small">Thumbnail image (shown on cards and listings)</span><ImageField name="thumbnail_image" currentUrl={String(value("thumbnail_image"))} /></label>
        <label className={`${styles.field} ${styles.fieldWide}`}><span className="label-small">Body</span><RichTextEditor name="body" defaultValue={String(value("body"))} /></label>
      </> },
      { id: "metadata", label: "Metadata and SEO", content: <><div className={styles.helper}><span className="body-default">Search appearance</span><p className="body-small">Set the title, description, canonical URL, and social image used for this article.</p></div><MetadataFields values={insight} /></> },
    ]} />
    <div className={styles.formActions}><button type="submit" className={styles.submit}><span className="label-button">{editing ? "Save changes" : "Create article"}</span></button></div>
  </form>;
}

function Field({ label, name, value, textarea = false, required = false, placeholder }: { label: string; name: string; value: string | number; textarea?: boolean; required?: boolean; placeholder?: string }) {
  return <label className={styles.field}><span className="label-small">{label}</span>{textarea ? <textarea name={name} defaultValue={String(value)} required={required} placeholder={placeholder} className={styles.textarea} /> : <input type="text" name={name} defaultValue={String(value)} required={required} placeholder={placeholder} className={styles.input} />}</label>;
}
