import { notFound } from "next/navigation";
import { getPage } from "@/lib/pages";
import { AdminTabs } from "@/components/admin/AdminTabs/AdminTabs";
import { PageSettingsForm } from "@/components/admin/PageSettingsForm/PageSettingsForm";
import { ABOUT_TABS } from "../../adminTabs";

export const dynamic = "force-dynamic";

export default async function AboutPageSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const page = getPage("about");

  if (!page) {
    notFound();
  }

  return (
    <>
      <h1 className="heading-01">About</h1>
      <AdminTabs tabs={ABOUT_TABS} active="/admin/about/settings" />
      <PageSettingsForm
        page={page}
        error={error}
        redirect="/admin/about/settings"
        note="The About page itself is built from the Sections/Philosophy/Highlights tabs above — eyebrow, title, and body here aren't shown anywhere. Only the nav label and “show in main nav” actually affect the site (the About link in the header)."
      />
    </>
  );
}
