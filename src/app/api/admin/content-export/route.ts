import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const caseStudies = db
    .prepare(
      `SELECT slug, eyebrow, title, description, tags, position, published,
              body, cover_image, thumbnail_image, category, year,
              outcome_eyebrow, outcome_title, metrics, assessment,
              password_required, password_hashes
       FROM case_studies ORDER BY position, id`
    )
    .all();
  const insights = db
    .prepare(
      `SELECT slug, title, excerpt, body, published_at, position, published,
              cover_image, thumbnail_image, category, author, tags
       FROM insights ORDER BY position, id`
    )
    .all();

  return new Response(
    JSON.stringify(
      {
        format: "conscept-content",
        version: 1,
        exportedAt: new Date().toISOString(),
        caseStudies,
        insights,
      },
      null,
      2
    ),
    {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="conscept-content-${new Date()
          .toISOString()
          .slice(0, 10)}.json"`,
        "Cache-Control": "no-store",
      },
    }
  );
}
