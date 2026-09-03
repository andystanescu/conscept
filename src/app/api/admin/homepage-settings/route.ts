import { NextRequest } from "next/server";
import { relativeRedirect } from "@/lib/relativeRedirect";
import { updateSettings } from "@/lib/settings";

export async function POST(request: NextRequest) {
  const form = await request.formData();
  updateSettings({
    homepage_cta_band_label: String(form.get("homepage_cta_band_label") ?? "").trim() || "Start a conversation",
    homepage_case_study_link_label: String(form.get("homepage_case_study_link_label") ?? "").trim() || "View case study",
    homepage_article_link_label: String(form.get("homepage_article_link_label") ?? "").trim() || "Read article",
    homepage_insights_all_label: String(form.get("homepage_insights_all_label") ?? "").trim() || "See all insights",
    homepage_meta_title: String(form.get("meta_title") ?? "").trim(),
    homepage_meta_description: String(form.get("meta_description") ?? "").trim(),
    homepage_meta_keywords: String(form.get("meta_keywords") ?? "").trim(),
    homepage_canonical_url: String(form.get("canonical_url") ?? "").trim(),
    homepage_og_image: String(form.get("og_image") ?? "").trim(),
    homepage_no_index: form.get("no_index") === "on" ? "1" : "0",
  });
  return relativeRedirect("/admin/homepage");
}
