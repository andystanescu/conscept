import { readFile } from "fs/promises";
import { basename, join } from "path";
import { getUploadsDir } from "@/lib/uploads";

const MIME_TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
  svg: "image/svg+xml",
  pdf: "application/pdf",
};

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params;
  const safeFilename = basename(filename);
  if (safeFilename !== filename) return new Response("Not found", { status: 404 });

  try {
    const content = await readFile(join(getUploadsDir(), safeFilename));
    const extension = safeFilename.split(".").pop()?.toLowerCase() ?? "";
    const requestUrl = new URL(request.url);
    const requestedName = requestUrl.searchParams.get("filename");
    const downloadName = requestedName ? basename(requestedName).replace(/[\\/]/g, "_").replace(/[^a-zA-Z0-9._ -]/g, "_").trim() : "";
    const headers: Record<string, string> = {
      "Content-Type": MIME_TYPES[extension] ?? "application/octet-stream",
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    };
    if (requestUrl.searchParams.get("download") === "1" && downloadName) {
      headers["Content-Disposition"] = `attachment; filename="${downloadName.replace(/"/g, "_")}"`;
    }
    return new Response(content, {
      headers,
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
