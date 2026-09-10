"use client";

import { useState } from "react";
import { useLang } from "@/lib/i18n";
import { Icon } from "../icons";
import { Panel } from "../Panel";
import { PhotoFrame } from "./PhotoFrame";

/** Drop a file at one of these paths and the frame picks it up. */
const SCHOOL_PHOTOS: Record<string, string> = {
  hcmc: "/journey/hcmc-gifted.jpg",
  gettysburg: "/journey/gettysburg.jpg",
};

export function Journey() {
  const { t } = useLang();
  const schools = t.journey.schools;
  // The two schools share one panel: pick which is on show.
  const [selected, setSelected] = useState(schools[schools.length - 1].id);

  const index = Math.max(
    0,
    schools.findIndex((s) => s.id === selected),
  );
  const school = schools[index];

  return (
    <section id="journey" className="section">
      <Panel title={t.journey.label}>
        <div className="journey">
          <div className="journey__tabs" role="tablist" aria-label={t.journey.label}>
            {schools.map((s, i) => (
              <button
                key={s.id}
                type="button"
                role="tab"
                id={`school-tab-${s.id}`}
                aria-selected={s.id === school.id}
                aria-controls="school-panel"
                tabIndex={s.id === school.id ? 0 : -1}
                className="journey__tab"
                onClick={() => setSelected(s.id)}
                onKeyDown={(e) => {
                  if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
                  e.preventDefault();
                  const step = e.key === "ArrowRight" ? 1 : -1;
                  const next = schools[(i + step + schools.length) % schools.length];
                  setSelected(next.id);
                  document.getElementById(`school-tab-${next.id}`)?.focus();
                }}
              >
                {s.tab}
              </button>
            ))}
          </div>

          <div
            className="journey__intro"
            role="tabpanel"
            id="school-panel"
            aria-labelledby={`school-tab-${school.id}`}
          >
            <div className="journey__text">
              <h2 className="h3">{school.title}</h2>
              <p className="journey__school">{school.name}</p>
              <p className="journey__blurb">{school.blurb}</p>
            </div>
            <div className="journey__photo">
              <PhotoFrame
                // Re-key so switching schools never shows the previous photo.
                key={school.id}
                src={SCHOOL_PHOTOS[school.id]}
                label={school.photo}
              />
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
