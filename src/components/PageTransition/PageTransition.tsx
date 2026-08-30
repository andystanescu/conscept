"use client";

import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect, useState, type MouseEvent } from "react";
import styles from "./PageTransition.module.css";

export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    setExiting(false);
  }, [pathname]);

  function handleClick(event: MouseEvent<HTMLDivElement>) {
    if (exiting || event.defaultPrevented || event.button !== 0) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    const target = event.target as HTMLElement;
    const link = target.closest("a");
    if (!link || link.target === "_blank" || link.hasAttribute("download")) return;

    const href = link.getAttribute("href");
    if (!href || href.startsWith("#")) return;

    const destination = new URL(href, window.location.href);
    if (destination.origin !== window.location.origin) return;
    if (destination.pathname === window.location.pathname && destination.search === window.location.search) return;

    event.preventDefault();
    event.stopPropagation();
    setExiting(true);
    window.setTimeout(() => router.push(`${destination.pathname}${destination.search}${destination.hash}`), 500);
  }

  return <div key={pathname} className={`${styles.page} ${exiting ? styles.pageExit : ""}`} onClickCapture={handleClick}>{children}</div>;
}
