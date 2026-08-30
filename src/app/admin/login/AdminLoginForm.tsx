"use client";

import { useState } from "react";
import { Logo } from "@/components/Logo/Logo";
import styles from "./login.module.css";

type Props = {
  initialMode: "sign-in" | "setup" | "recovery";
  error?: string;
  success?: string;
  from?: string;
  hasCredentials: boolean;
};

export function AdminLoginForm({ initialMode, error, success, from, hasCredentials }: Props) {
  const [mode, setMode] = useState(initialMode);
  const isSetup = mode === "setup";
  const isRecovery = mode === "recovery";

  const toggleAccountFlow = () => {
    setMode((current) => {
      if (!hasCredentials) return current === "setup" ? "sign-in" : "setup";
      return current === "recovery" ? "sign-in" : "recovery";
    });
  };

  return (
    <main className={styles.main}>
      <form
        className={styles.form}
        action={isSetup ? "/api/admin/setup" : isRecovery ? "/api/admin/recover" : "/api/admin/login"}
        method="POST"
      >
        <button type="button" className={styles.logoButton} onClick={toggleAccountFlow} aria-label={isSetup ? "Return to sign in" : isRecovery ? "Return to sign in" : hasCredentials ? "Recover admin password" : "Set up admin password"}>
          <Logo variant="compact" />
        </button>
        <p className="label-eyebrow" style={{ color: "var(--text-accent)" }}>admin</p>
        <h1 className="heading-01">
          {isSetup ? "Set up password" : isRecovery ? "Recover password" : "Sign in"}
        </h1>
        {isSetup && <p className={styles.helper}>Create the first admin credentials for this site.</p>}
        {isRecovery && <p className={styles.helper}>Verify your current password, then choose a replacement.</p>}
        {error && <p className={styles.error}>{error}</p>}
        {success && <p className={styles.success}>{success}</p>}
        {!isSetup && <input type="hidden" name="from" value={from ?? "/admin"} />}

        <label className={styles.field}>
          <span className="label-small" style={{ color: "var(--text-secondary)" }}>Username</span>
          <input type="text" name="username" required autoComplete="username" className={styles.input} />
        </label>

        {isRecovery && (
          <label className={styles.field}>
            <span className="label-small" style={{ color: "var(--text-secondary)" }}>Current password</span>
            <input type="password" name="currentPassword" required autoComplete="current-password" className={styles.input} />
          </label>
        )}

        <label className={styles.field}>
          <span className="label-small" style={{ color: "var(--text-secondary)" }}>{isRecovery ? "New password" : "Password"}</span>
          <input type="password" name={isRecovery ? "newPassword" : "password"} required autoComplete={isRecovery ? "new-password" : isSetup ? "new-password" : "current-password"} className={styles.input} />
        </label>

        {(isSetup || isRecovery) && (
          <label className={styles.field}>
            <span className="label-small" style={{ color: "var(--text-secondary)" }}>Confirm password</span>
            <input type="password" name="confirmation" required autoComplete="new-password" className={styles.input} />
          </label>
        )}

        <button type="submit" className={styles.submit}><span className="label-button">{isSetup ? "Create password" : isRecovery ? "Update password" : "Sign in"}</span></button>
        <button type="button" className={styles.flowLink} onClick={toggleAccountFlow}>
          {isSetup ? "Back to sign in" : isRecovery ? "Back to sign in" : hasCredentials ? "Forgot or need to change your password?" : "First time here? Set up admin password"}
        </button>
      </form>
    </main>
  );
}
