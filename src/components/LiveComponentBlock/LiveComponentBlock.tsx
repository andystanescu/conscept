"use client";

import * as React from "react";
import { LiveContext, LiveProvider, LivePreview, LiveError } from "react-live";
import styles from "./LiveComponentBlock.module.css";

type LiveComponentBlockProps = {
  code: string;
};

// The available identifiers inside a "⚡ Live" code block — no bundler or
// import resolution runs here (react-live transpiles in the browser via
// Sucrase and evaluates the result directly), so anything the snippet
// wants to use has to be handed in through this scope explicitly.
const scope = {
  React,
  useState: React.useState,
  useEffect: React.useEffect,
  useRef: React.useRef,
  useMemo: React.useMemo,
  useCallback: React.useCallback,
};

function prepareLiveCode(source: string): string {
  let code = source
    // Live blocks already receive React through the execution scope.
    .replace(/^\s*import[^;]+;\s*$/gm, "")
    // Inline evaluation cannot contain module exports.
    .replace(/export\s+default\s+function\s+/g, "function ")
    .replace(/export\s+default\s+/g, "");

  if (!/\brender\s*\(/.test(code)) {
    const component = code.match(/function\s+([A-Z][A-Za-z0-9_]*)\s*\(/)?.[1];
    if (component) code += `\nrender(<${component} />);`;
  }
  return code;
}

// Renders a case-study code block as a real, running React component
// instead of static highlighted text. The code must end with a call to
// render(<YourComponent />) — react-live's convention for this mode
// (noInline), which keeps definitions above it in normal function/const
// syntax rather than requiring a single trailing JSX expression.
export function LiveComponentBlock({ code }: LiveComponentBlockProps) {
  const preparedCode = prepareLiveCode(code);
  return (
    <LiveProvider
      code={preparedCode}
      scope={scope}
      noInline
      language="tsx"
      enableTypeScript
    >
      <LiveComponentSurface code={preparedCode} />
    </LiveProvider>
  );
}

function LiveComponentSurface({ code }: { code: string }) {
  const { error, element } = React.useContext(LiveContext);
  const [view, setView] = React.useState<"preview" | "code">("preview");
  const [copied, setCopied] = React.useState(false);
  const canRender = Boolean(element) && !error;

  React.useEffect(() => {
    if (error) setView("code");
  }, [error]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  return (
    <>
      <div className={styles.header}>
        <span className={styles.language}>tsx</span>
        <div className={styles.headerActions}>
          {canRender && (
            <div className={styles.switcher} role="tablist" aria-label="Live component view">
              <button type="button" role="tab" aria-selected={view === "preview"} className={view === "preview" ? styles.switcherActive : ""} onClick={() => setView("preview")}>Preview</button>
              <button type="button" role="tab" aria-selected={view === "code"} className={view === "code" ? styles.switcherActive : ""} onClick={() => setView("code")}>Code</button>
            </div>
          )}
          <button type="button" className={styles.copyButton} onClick={handleCopy}>{copied ? "Copied" : "Copy"}</button>
        </div>
      </div>
      {view === "preview" && canRender ? (
        <div className={styles.preview}><LivePreview /></div>
      ) : (
        <pre className={styles.code}><code>{code}</code></pre>
      )}
      {error && <LiveError className={styles.error} />}
    </>
  );
}
