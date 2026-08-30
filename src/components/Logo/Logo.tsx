import styles from "./Logo.module.css";

type LogoProps = {
  /** compact = nav/header strips under 48px tall. primary = everywhere else (min width 160px). */
  variant?: "compact" | "primary";
  /** inverted = sitting on a dark section background. */
  theme?: "default" | "inverted";
  identity?: "business" | "personal";
};

const SIZES = {
  compact: { icon: 34.759, text: 27.31 },
  primary: { icon: 44, text: 36 },
};

export function Logo({ variant = "compact", theme = "default", identity = "business" }: LogoProps) {
  const { icon, text } = SIZES[variant];
  const canSwapNavIcon = variant === "compact" && theme === "default" && identity === "business";

  if (identity === "personal") {
    return (
      theme === "inverted" ? (
        <img className={styles.fullLogo} src="/assets/logo-footer.svg" alt="AndreiStanescu" height={icon} />
      ) : (
        <span className={`${styles.logo} ${styles.personal}`}>
          <img src="/assets/logo-icon-personal-nav.svg" alt="" width={icon} height={icon} />
          <span className={styles.wordmark} style={{ fontSize: text, letterSpacing: -text * 0.02 }}>AndreiStanescu</span>
        </span>
      )
    );
  }

  const iconSrc = theme === "inverted"
      ? "/assets/logo-icon-footer.svg"
      : "/assets/logo-icon-nav.svg";
  return (
    <span className={styles.logo}>
      {canSwapNavIcon ? (
        <span className={styles.iconSwap} style={{ width: icon, height: icon }}>
          <img
            className={styles.icon}
            src={iconSrc}
            alt=""
            width={icon}
            height={icon}
          />
          <img
            className={`${styles.icon} ${styles.iconHover}`}
            src="/assets/logo-icon-nav-hover.svg"
            alt=""
            width={icon}
            height={icon}
          />
        </span>
      ) : (
        <img
          src={iconSrc}
          alt=""
          width={icon}
          height={icon}
          style={{ width: icon, height: icon }}
        />
      )}
      <span
        className={styles.wordmark}
        style={{ fontSize: text, letterSpacing: -text * 0.02 }}
      >
            ConScept
      </span>
    </span>
  );
}
