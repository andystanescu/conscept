import { db } from "@/lib/db";

export type AnalyticsContentType = "case_study" | "article" | "cv";

export function recordAnalyticsEvent(eventType: "view" | "share" | "download", contentType: AnalyticsContentType, contentId = "") {
  db.prepare("INSERT INTO analytics_events (event_type, content_type, content_id) VALUES (?, ?, ?)").run(eventType, contentType, contentId);
}

export function getAnalyticsCount(contentType: AnalyticsContentType, eventTypes: string[] = ["view", "share"], contentId?: string) {
  const placeholders = eventTypes.map(() => "?").join(", ");
  const suffix = contentId === undefined ? "" : " AND content_id = ?";
  const values = contentId === undefined ? [contentType, ...eventTypes] : [contentType, ...eventTypes, contentId];
  const row = db.prepare(`SELECT COUNT(*) AS count FROM analytics_events WHERE content_type = ? AND event_type IN (${placeholders})${suffix}`).get(...values) as { count: number };
  return row.count;
}
