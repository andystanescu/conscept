import { relativeRedirect } from "@/lib/relativeRedirect";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { updateSettings } from "@/lib/settings";
import { resolveImageField } from "@/lib/uploads";

export async function POST(request: NextRequest) {
  const form = await request.formData();

  // Raw (unfallback) values — getSettings() merges an unset footer logo
  // into the header logo, which would wrongly get "baked in" as a
  // permanent copy if used here instead of staying empty/dynamic.
  const rawLogoImage = db
    .prepare("SELECT value FROM settings WHERE key = 'logo_image'")
    .get() as { value: string } | undefined;
  const rawLogoImageFooter = db
    .prepare("SELECT value FROM settings WHERE key = 'logo_image_footer'")
    .get() as { value: string } | undefined;

  const logoImage = await resolveImageField(
    form,
    "logo_image",
    rawLogoImage?.value ?? ""
  );
  const logoImageFooter = await resolveImageField(
    form,
    "logo_image_footer",
    rawLogoImageFooter?.value ?? ""
  );

  updateSettings({
    logo_identity: form.get("logo_identity") === "personal" ? "personal" : "business",
    confirmation_title: String(form.get("confirmation_title") ?? "").trim(),
    confirmation_body: String(form.get("confirmation_body") ?? "").trim(),
    contact_email_to: String(form.get("contact_email_to") ?? "").trim(),
    logo_image: logoImage,
    logo_image_footer: logoImageFooter,
  });
  return relativeRedirect("/admin");
}
