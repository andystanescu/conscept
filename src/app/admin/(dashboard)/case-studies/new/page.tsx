import { CaseStudyEditor } from "@/components/admin/CaseStudyEditor/CaseStudyEditor";
import { getServiceItems } from "@/lib/serviceItems";
import { getSettings } from "@/lib/settings";
import type { CaseStudy } from "@/data/caseStudies";

export default async function NewCaseStudyPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const settings = getSettings();
  const blankStudy = {
    id: 0, slug: "", eyebrow: "", category: "", year: "", title: "", description: "", tags: "", body: "",
    cover_image: "", thumbnail_image: "", position: 0, published: 0, outcome_eyebrow: "OUTCOMES", outcome_title: "",
    metrics: "[]", assessment: "{}", password_required: 0, password_hashes: "[]", author: settings.author_name,
    published_at: "", meta_title: "", meta_description: "", meta_keywords: "", canonical_url: "", og_image: "", no_index: 0,
  } satisfies CaseStudy;
  const assessment = { scores: {}, likelyEngagement: [], conducted: [], overall: "", overallDescription: "", primaryDrivers: [] };
  const services = getServiceItems().map((service) => ({ slug: service.slug, title: service.title }));

<<<<<<< HEAD
  return (
    <>
      {error && <p style={{ color: "var(--border-error)" }}>{error}</p>}
      <form
        className={styles.form}
        action="/api/admin/case-studies"
        method="POST"
        encType="multipart/form-data"
      >
        <AdminContentTabs tabs={[
          { id: "details", label: "Details", content: <>
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
          </> },
          { id: "metadata", label: "Metadata and SEO", content: <div className={styles.field}><span className="label-eyebrow">Metadata and SEO</span><MetadataFields /></div> },
        ]} />

        <div className={styles.formActions}>
          <button type="submit" className={styles.submit}>
            <span className="label-button">Create case study</span>
          </button>
        </div>
      </form>
    </>
  );
=======
  return <>
    {error && <p style={{ color: "var(--border-error)" }}>{error}</p>}
    <CaseStudyEditor
      study={blankStudy}
      metrics={[]}
      assessment={assessment}
      services={services}
      passwordRequired={false}
      passwordEntries={[]}
      authorAvatarUrl={settings.about_hero_image}
      action="/api/admin/case-studies"
    />
  </>;
>>>>>>> c59f3eb (Update admin editor shell and content forms)
}
