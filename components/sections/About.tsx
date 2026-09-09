"use client";

import { useLang } from "@/lib/i18n";
import { Blob, useBlob } from "../Blob";
import { Icon } from "../icons";
import { LangSwitcher } from "../LangSwitcher";
import { Panel } from "../Panel";
import { scrollToSection } from "../Nav";

export function About() {
  const { t } = useLang();
  const { poke } = useBlob();
  const line = t.hero.lines[poke % t.hero.lines.length];

  return (
    <section id="about" className="section section--first">
      <Panel
        title={t.nav.about}
        barExtra={
          <span className="bar-langs">
            <LangSwitcher variant="bar" />
          </span>
        }
        bodyClassName=""
      >
        <div className="hero">
          <div className="hero__col">
            <div className="hero__names">
              <h1 className="h1">{t.hero.hi}</h1>
              <h1 className="h2">{t.hero.name}</h1>
            </div>
            <p className="hero__pron">{t.hero.pron}</p>
            <ul className="hero__titles">
              {t.hero.roles.map((role, i) => (
                <li key={role} className={i === 0 ? "hero__title--current" : undefined}>
                  {role}
                </li>
              ))}
            </ul>
            <div className="hero__ctas">
              <a
                href="#projects"
                className="cta cta--primary"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection("projects");
                }}
              >
                {t.hero.ctaA}
              </a>
              <a
                href="#contact"
                className="cta cta--secondary"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection("contact");
                }}
              >
                {t.hero.ctaB}
              </a>
            </div>
          </div>

          <div className="hero__aside">
            <div className="mac-wrap">
              <div className="mac">
                <div className="mac__screen">
                  <span>M1 PRO</span>
                </div>
                <div className="mac__base" />
              </div>

              {/* Blob and cup perch at the laptop's bottom-left corner. */}
              <div className="hero__mascots">
                <Blob label={t.hero.lines[0]} bubble={line} />
                <Icon name="coffee-cup" size={72} className="cup" />
              </div>
            </div>
            <p className="mac__caption">{t.hero.mac}</p>
          </div>
        </div>

      </Panel>
    </section>
  );
}
