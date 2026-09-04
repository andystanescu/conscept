import { NextRequest } from "next/server";
import { relativeRedirect } from "@/lib/relativeRedirect";
import { updateSettings } from "@/lib/settings";

function formText(form: FormData, name: string, fallback = "") {
  const value = form.get(name);
  return typeof value === "string" ? value.trim() : fallback;
}

export async function POST(request: NextRequest) {
  const form = await request.formData();
  updateSettings({
    homepage_cta_band_label: formText(form, "homepage_cta_band_label") || "Start a conversation",
    homepage_case_study_link_label: formText(form, "homepage_case_study_link_label") || "View case study",
    homepage_article_link_label: formText(form, "homepage_article_link_label") || "Read article",
    homepage_insights_all_label: formText(form, "homepage_insights_all_label") || "See all insights",
    homepage_meta_title: formText(form, "meta_title"),
    homepage_meta_description: formText(form, "meta_description"),
    homepage_meta_keywords: formText(form, "meta_keywords"),
    homepage_canonical_url: formText(form, "canonical_url"),
    homepage_og_image: formText(form, "og_image"),
    homepage_no_index: form.get("no_index") === "on" ? "1" : "0",
  });
  const returnTab = form.get("return_tab") === "ctas" ? "ctas" : "metadata";
  return relativeRedirect(`/admin/homepage?tab=${returnTab}`);
}
