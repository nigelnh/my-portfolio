"use client";

import { useLang } from "@/lib/i18n";
import { BlobStage } from "../blob/BlobStage";
import { Icon } from "../icons";
import { LangSwitcher } from "../LangSwitcher";
import { SoundToggle } from "../SoundToggle";
import { Panel } from "../Panel";
import { scrollToSection } from "../Nav";

export function About() {
  const { t } = useLang();

  return (
    <section id="about" className="section section--first">
      <Panel
        title={t.nav.about}
        barExtra={
          <>
            <SoundToggle label={t.hero.blob.sound} />
            <span className="bar-langs">
              <LangSwitcher variant="bar" />
            </span>
          </>
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

              {/* The band under the laptop: a fixed cup, the blob's roaming
                  stage, and (on wide screens) the spec caption on the right. */}
              <Icon name="coffee-cup" size={44} className="cup" />
              <BlobStage />
            </div>
            <p className="mac__caption">{t.hero.mac}</p>
          </div>
        </div>

      </Panel>
    </section>
  );
}
