"use client";

import { projectsMeta } from "@/lib/copy";
import { useLang } from "@/lib/i18n";
import { Panel } from "../Panel";

export function Projects() {
  const { t } = useLang();

  return (
    <section id="projects" className="section">
      <Panel title={t.projects.label} led="var(--rose)">
        <div className="projects">
          {t.projects.items.map((p, i) => (
            <article key={projectsMeta[i].id} className="project">
              <div className="project__thumb">
                <span>{p.thumb}</span>
              </div>
              <div className="project__body">
                <span className="project__kicker">{p.kicker}</span>
                <h3 className="h3">{p.title}</h3>
                <p className="project__blurb">{p.blurb}</p>
                <ul className="project__bullets">
                  {p.bullets.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
                <div className="tags project__tags">
                  {projectsMeta[i].stack.map((tag) => (
                    <span key={tag} className="tag">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      </Panel>
    </section>
  );
}
