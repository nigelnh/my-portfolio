"use client";

import { useState } from "react";
import { jobsMeta, type JobId } from "@/lib/copy";
import { useLang } from "@/lib/i18n";
import { Icon } from "../icons";
import { Panel } from "../Panel";

/** The list runs newest first, so open on the current role. */
const DEFAULT_JOB: JobId = jobsMeta[0].id;

export function Experience() {
  const { t } = useLang();
  const [selected, setSelected] = useState<JobId>(DEFAULT_JOB);

  return (
    <section id="experience" className="section">
      <Panel title={t.work.label}>
        <div className="work">
          <div className="work__list" role="tablist" aria-label={t.work.label}>
            {jobsMeta.map((m, i) => (
              <button
                key={m.id}
                type="button"
                role="tab"
                id={`job-tab-${m.id}`}
                aria-selected={m.id === selected}
                aria-controls={`job-panel-${m.id}`}
                tabIndex={m.id === selected ? 0 : -1}
                className="work__item"
                onClick={() => setSelected(m.id)}
                onKeyDown={(e) => {
                  if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
                  e.preventDefault();
                  const step = e.key === "ArrowDown" ? 1 : -1;
                  const next = jobsMeta[(i + step + jobsMeta.length) % jobsMeta.length];
                  setSelected(next.id);
                  document.getElementById(`job-tab-${next.id}`)?.focus();
                }}
              >
                <span className="work__item-text">
                  <span className="work__item-name">{m.name}</span>
                  <span className="work__item-place">{m.place}</span>
                </span>
                <Icon name={m.icon} size={24} />
              </button>
            ))}
          </div>

          {/* All four panels share one grid cell, so the cell is always as tall
              as the longest of them and switching employers never resizes the
              section. The inactive ones stay laid out but are hidden from both
              the screen and the accessibility tree. */}
          <div className="work__panels">
            {jobsMeta.map((m, i) => {
              const copy = t.work.jobs[i];
              const active = m.id === selected;
              return (
                <div
                  key={m.id}
                  className="work__detail"
                  data-active={active}
                  role="tabpanel"
                  id={`job-panel-${m.id}`}
                  aria-labelledby={`job-tab-${m.id}`}
                  aria-hidden={!active}
                >
                  <div className="work__head">
                    <h3 className="h3">{m.name}</h3>
                    <span className="work__term">{m.term}</span>
                  </div>
                  <p className="muted">{copy.role}</p>
                  <p className="work__blurb">{copy.blurb}</p>
                  <ul className="work__points">
                    {copy.bullets.map((b) => (
                      <li key={b}>{b}</li>
                    ))}
                  </ul>
                  <div className="tags work__tags">
                    {m.stack.map((tag) => (
                      <span key={tag} className="tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Panel>
    </section>
  );
}
