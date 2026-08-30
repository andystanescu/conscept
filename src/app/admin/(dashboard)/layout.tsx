import type { ReactNode } from "react";
import { Logo } from "@/components/Logo/Logo";
import { AdminNav } from "@/components/admin/AdminNav/AdminNav";
import { ViewSiteLink } from "@/components/admin/ViewSiteLink/ViewSiteLink";
import styles from "./dashboard.module.css";

export default function AdminDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <Logo variant="compact" />
          <p className="label-eyebrow" style={{ color: "var(--text-accent)" }}>
            admin
          </p>
        </div>
        <ViewSiteLink />
        <AdminNav />
        <form action="/api/admin/logout" method="POST">
          <button type="submit" className={styles.logout}>
            Sign out
          </button>
        </form>
      </aside>
      <main className={styles.content} data-scroll-region>{children}</main>
    </div>
  );
}
