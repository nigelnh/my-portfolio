"use client";

import { useLang } from "@/lib/i18n";
import { BlobStage } from "../blob/BlobStage";
import { BlobToggles, useBlobSettings } from "../blob/BlobSettings";
import { MacScreen } from "../mac/MacScreen";
import { Icon } from "../icons";
import { LangSwitcher } from "../LangSwitcher";
import { Panel } from "../Panel";
import { scrollToSection } from "../Nav";

export function About() {
  const { t } = useLang();
  const { pet } = useBlobSettings();

  return (
    <section id="about" className="section section--first">
      <Panel
        title={t.nav.about}
        barExtra={
          <span className="bar-langs">
            <LangSwitcher variant="bar" />
            <BlobToggles variant="bar" />
          </span>
        }
        bodyClassName=""
      >
        <div className="hero">
          <div className="hero__col">
            <div className="hero__names">
              {/* The greeting is decoration; the name is the page's one h1. */}
              <p className="h1">{t.hero.hi}</p>
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
                <MacScreen />
                <div className="mac__chin">
                  <Icon name="apple-chin" size={24} />
                </div>
              </div>

              <BlobStage pet={pet} />
            </div>
          </div>
        </div>

      </Panel>
    </section>
  );
}
