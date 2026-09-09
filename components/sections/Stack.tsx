"use client";

import { skillTags } from "@/lib/copy";
import { useLang } from "@/lib/i18n";
import { Panel } from "../Panel";

export function Stack() {
  const { t } = useLang();

  const groups = [
    { title: t.skills.languages, tags: skillTags.languages },
    { title: t.skills.infra, tags: skillTags.infra },
    { title: t.skills.quant, tags: skillTags.quant },
  ];

  return (
    <section id="skills" className="section">
      <Panel title={t.skills.label} led="var(--sky)">
        <div className="stack">
          {groups.map((g) => (
            <div key={g.title} className="stack__card">
              <h3 className="label">{g.title}</h3>
              <div className="tags">
                {g.tags.map((tag) => (
                  <span key={tag} className="tag">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
          <div className="stack__card">
            <h3 className="label">{t.skills.setup}</h3>
            <p className="stack__setup">{t.skills.setupText}</p>
          </div>
        </div>
      </Panel>
    </section>
  );
}
