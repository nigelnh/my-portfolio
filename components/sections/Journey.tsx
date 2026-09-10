"use client";

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

  return (
    <section id="journey" className="section">
      <Panel title={t.journey.label}>
        <div className="journey">
          {/* Both schools share one box: the second fills the space the first
              leaves beside its photo. */}
          <div className="journey__intro">
            {t.journey.schools.map((school) => (
              <div key={school.id} className="journey__school-row">
                <div className="journey__text">
                  <h2 className="h3">{school.title}</h2>
                  <p className="journey__school">{school.name}</p>
                  <p className="journey__blurb">{school.blurb}</p>
                </div>
                <div className="journey__photo">
                  <PhotoFrame src={SCHOOL_PHOTOS[school.id]} label={school.photo} />
                </div>
              </div>
            ))}
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
