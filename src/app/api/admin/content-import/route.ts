import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

type ContentRecord = Record<string, unknown>;

function text(record: ContentRecord, key: string, fallback = "") {
  return typeof record[key] === "string" ? record[key] : fallback;
}

function integer(record: ContentRecord, key: string, fallback = 0) {
  return typeof record[key] === "number" ? Math.round(record[key] as number) : fallback;
}

function list(value: unknown) {
  return Array.isArray(value) ? JSON.stringify(value) : typeof value === "string" ? value : "[]";
}

export async function POST(request: NextRequest) {
  try {
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Choose a content JSON file first." }, { status: 400 });
    }

    const payload = JSON.parse(await file.text()) as {
      format?: string;
      version?: number;
      caseStudies?: ContentRecord[];
      insights?: ContentRecord[];
    };
    if (payload.format !== "conscept-content" || payload.version !== 1) {
      return NextResponse.json({ error: "This is not a compatible ConScept content export." }, { status: 400 });
    }

    const caseStudies = Array.isArray(payload.caseStudies) ? payload.caseStudies : [];
    const insights = Array.isArray(payload.insights) ? payload.insights : [];

    db.exec("BEGIN");
    try {
      const upsertCaseStudy = db.prepare(
        `INSERT INTO case_studies
          (slug, eyebrow, title, description, tags, position, published, body,
           cover_image, thumbnail_image, category, year, outcome_eyebrow,
           outcome_title, metrics, assessment, password_required, password_hashes,
           author, published_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(slug) DO UPDATE SET
          eyebrow=excluded.eyebrow, title=excluded.title, description=excluded.description,
          tags=excluded.tags, position=excluded.position, published=excluded.published,
          body=excluded.body, cover_image=excluded.cover_image,
          thumbnail_image=excluded.thumbnail_image, category=excluded.category,
          year=excluded.year, outcome_eyebrow=excluded.outcome_eyebrow,
          outcome_title=excluded.outcome_title, metrics=excluded.metrics,
          assessment=excluded.assessment, password_required=excluded.password_required,
          password_hashes=excluded.password_hashes, author=excluded.author,
          published_at=excluded.published_at`
      );
      for (const record of caseStudies) {
        const slug = text(record, "slug").trim();
        const title = text(record, "title").trim();
        if (!slug || !title) continue;
        upsertCaseStudy.run(
          slug, text(record, "eyebrow"), title, text(record, "description"),
          text(record, "tags"), integer(record, "position"), integer(record, "published", 1),
          text(record, "body"), text(record, "cover_image"), text(record, "thumbnail_image"),
          text(record, "category"), text(record, "year"), text(record, "outcome_eyebrow", "OUTCOMES"),
          text(record, "outcome_title"), list(record.metrics), list(record.assessment),
          integer(record, "password_required"), list(record.password_hashes),
          text(record, "author", "Andrei Stanescu"), text(record, "published_at")
        );
      }

      const upsertInsight = db.prepare(
        `INSERT INTO insights
          (slug, title, excerpt, body, published_at, position, published,
           cover_image, thumbnail_image, category, author, tags)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(slug) DO UPDATE SET
          title=excluded.title, excerpt=excluded.excerpt, body=excluded.body,
          published_at=excluded.published_at, position=excluded.position,
          published=excluded.published, cover_image=excluded.cover_image,
          thumbnail_image=excluded.thumbnail_image, category=excluded.category,
          author=excluded.author, tags=excluded.tags`
      );
      for (const record of insights) {
        const slug = text(record, "slug").trim();
        const title = text(record, "title").trim();
        if (!slug || !title) continue;
        upsertInsight.run(
          slug, title, text(record, "excerpt"), text(record, "body"),
          text(record, "published_at"), integer(record, "position"), integer(record, "published", 1),
          text(record, "cover_image"), text(record, "thumbnail_image"), text(record, "category"),
          text(record, "author", "Andrei Stanescu"), text(record, "tags")
        );
      }
      db.exec("COMMIT");
    } catch (error) {
      db.exec("ROLLBACK");
      throw error;
    }

    return NextResponse.json({ imported: { caseStudies: caseStudies.length, insights: insights.length } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Import failed.";
    return NextResponse.json({ error: `Import failed: ${message}` }, { status: 400 });
  }
}
