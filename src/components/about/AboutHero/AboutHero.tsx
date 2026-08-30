import { AccentText } from "@/components/AccentText/AccentText";
import { LatticeDiagram } from "@/components/home/Hero/LatticeDiagram";
import { LatticeInteractive } from "@/components/home/Hero/LatticeInteractive";
import { getVisibleSection } from "@/lib/about";
import styles from "./AboutHero.module.css";

export function AboutHero() {
  const section = getVisibleSection("hero")!;

  return (
    <section className={`container ${styles.hero}`}>
      <div className={styles.copy}>
        <p className="label-eyebrow" style={{ color: "var(--text-accent)" }}>
          {section.eyebrow}
        </p>
        <h1 className={`display-large ${styles.headline}`}>
          <AccentText text={section.headline} />
        </h1>
        <p className="body-large" style={{ color: "var(--text-secondary)" }}>
          {section.description}
        </p>
      </div>
      <div className={styles.lattice}>
        <LatticeInteractive>
          <LatticeDiagram />
        </LatticeInteractive>
      </div>
    </section>
  );
}
