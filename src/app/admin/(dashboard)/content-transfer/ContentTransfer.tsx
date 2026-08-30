"use client";

import { useRef, useState } from "react";
import styles from "../admin.module.css";

export default function ContentTransfer() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function importContent() {
    const file = inputRef.current?.files?.[0];
    if (!file) {
      setMessage("Choose a ConScept content export first.");
      return;
    }
    setBusy(true);
    setMessage("");
    try {
      const form = new FormData();
      form.append("file", file);
      const response = await fetch("/api/admin/content-import", { method: "POST", body: form });
      const result = (await response.json()) as { error?: string; imported?: { caseStudies: number; insights: number } };
      if (!response.ok) throw new Error(result.error ?? "Import failed.");
      setMessage(`Imported ${result.imported?.caseStudies ?? 0} case studies and ${result.imported?.insights ?? 0} insights.`);
      if (inputRef.current) inputRef.current.value = "";
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Import failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <p className="label-eyebrow">CONTENT TRANSFER</p>
      <h1 className="heading-01">Move your content</h1>
      <p className={`body-small ${styles.helper}`} style={{ maxWidth: 680 }}>
        Export case studies and insights from this app, then import the JSON into another ConScept deployment. Existing records are matched by slug and updated; other admin data is left alone.
      </p>
      <div className={styles.form} style={{ maxWidth: 680, marginTop: "var(--space-500)" }}>
        <a className={styles.submit} href="/api/admin/content-export" download>
          Export case studies and insights
        </a>
        <label className={styles.field}>
          <span className="label-small" style={{ color: "var(--text-secondary)" }}>Import a ConScept content export</span>
          <input ref={inputRef} className={styles.input} type="file" accept="application/json,.json" />
        </label>
        <button className={styles.submit} type="button" onClick={importContent} disabled={busy}>
          {busy ? "Importing…" : "Import content"}
        </button>
        {message && <p className="body-small" role="status">{message}</p>}
      </div>
    </>
  );
}
