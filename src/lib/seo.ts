import type { Metadata } from "next";

export const SITE_URL = (process.env.PUBLIC_SITE_URL || "https://andreistanescu.design").replace(/\/$/, "");

export function absoluteUrl(path = "/") {
  return new URL(path.startsWith("/") ? path : `/${path}`, SITE_URL).toString();
}

export function plainText(value: string) {
  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

export function seoDescription(value: string, fallback: string) {
  const text = plainText(value) || fallback;
  return text.length > 160 ? `${text.slice(0, 157).trimEnd()}…` : text;
}

export function contentMetadata(input: { title: string; description: string; path: string; image?: string; noIndex?: boolean }): Metadata {
  const url = absoluteUrl(input.path);
  const description = seoDescription(input.description, input.title);
  const image = input.image ? absoluteUrl(input.image) : undefined;
  return {
    title: input.title,
    description,
    alternates: { canonical: url },
    robots: input.noIndex ? { index: false, follow: false } : undefined,
    openGraph: { type: "website", url, title: input.title, description, images: image ? [{ url: image }] : [] },
    twitter: { card: image ? "summary_large_image" : "summary", title: input.title, description, images: image ? [image] : [] },
  };
}
