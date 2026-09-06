import { db } from "@/lib/db";
import { layoutSections, type LayoutPage } from "./layoutDraft";

export function getLayoutConfiguration(page: LayoutPage) {
  if (page === "work" || page === "insights") {
    const defaults = page === "work"
      ? [["hero", true, true], ["featured_case_study", true, false], ["more_case_studies", true, false], ["outcome", true, false], ["latest_insights", true, false]]
      : [["hero", true, true], ["insight_list", true, false]];
    const stored = db.prepare("SELECT value FROM settings WHERE key = ?").get(`layout_${page}`) as { value?: string } | undefined;
    try {
      const parsed = stored?.value ? JSON.parse(stored.value) : null;
      if (Array.isArray(parsed)) return { sections: parsed, revision: JSON.stringify(parsed) };
    } catch { /* use defaults when an older or invalid setting exists */ }
    const sections = layoutSections(page, defaults.map(([key, visible, fixed]) => ({ key: String(key), visible: Number(visible), fixed: Number(fixed) })));
    return { sections, revision: JSON.stringify(sections) };
  }
  const table = page === "homepage" ? "homepage_sections" : "about_sections";
  const rows = db.prepare(`SELECT key, visible, fixed FROM ${table} ORDER BY position ASC, key ASC`).all() as { key: string; visible: number; fixed: number }[];
  const sections = layoutSections(page, rows);
  return { sections, revision: JSON.stringify(sections) };
}
