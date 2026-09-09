"use client";

import { useLang } from "@/lib/i18n";
import { Icon } from "../icons";
import { Panel } from "../Panel";

export function Journey() {
  const { t } = useLang();

  return (
    <section id="journey" className="section">
      <Panel title={t.journey.label} led="var(--amber)">
        <div className="journey">
          <div className="journey__intro">
            <div className="journey__text">
              <h2 className="h3">{t.journey.title}</h2>
              <p className="journey__school">{t.journey.school}</p>
              <p className="journey__blurb">{t.journey.blurb}</p>
            </div>
            <div className="journey__photo">
              <div className="frame">
                <span>{t.journey.photo}</span>
              </div>
              <p className="journey__drop">{t.journey.drop}</p>
            </div>
          </div>

          <div className="milestones">
            <h3 className="label label--icon">
              <Icon name="diploma-scroll" size={24} />
              {t.journey.milestones}
            </h3>
            <div className="milestones__grid">
              {t.journey.ms.map((m) => (
                <div key={m.year} className="milestone">
                  <span className="milestone__year">{m.year}</span>
                  <p className="milestone__text">{m.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Panel>
    </section>
  );
}
