import { getServiceItems } from "@/lib/serviceItems";
import { getSettings } from "@/lib/settings";
import { InsightEditor } from "@/components/admin/InsightEditor/InsightEditor";

export default async function NewInsightPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return <><h1 className="heading-01">New article</h1>{error && <p style={{ color: "var(--border-error)" }}>{error}</p>}<InsightEditor action="/api/admin/insights" categories={getServiceItems()} settingsAuthor={getSettings().author_name} /></>;
}
