"use client";

import { useState } from "react";
import { jobsMeta, type JobId } from "@/lib/copy";
import { useLang } from "@/lib/i18n";
import { Icon } from "../icons";
import { Panel } from "../Panel";

const DEFAULT_JOB: JobId = jobsMeta[3].id;

export function Experience() {
  const { t } = useLang();
  const [selected, setSelected] = useState<JobId>(DEFAULT_JOB);

  const index = Math.max(
    0,
    jobsMeta.findIndex((m) => m.id === selected),
  );
  const meta = jobsMeta[index];
  const copy = t.work.jobs[index];

  return (
    <section id="experience" className="section">
      <Panel title={t.work.label} led="var(--mint)">
        <div className="work">
          <div className="work__list" role="tablist" aria-label={t.work.label}>
            {jobsMeta.map((m, i) => (
              <button
                key={m.id}
                type="button"
                role="tab"
                id={`job-tab-${m.id}`}
                aria-selected={m.id === selected}
                aria-controls="job-panel"
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
                <Icon name={m.icon} size={16} />
              </button>
            ))}
          </div>

          <div
            className="work__detail"
            role="tabpanel"
            id="job-panel"
            aria-labelledby={`job-tab-${meta.id}`}
          >
            <div className="work__head">
              <h3 className="h3">{meta.name}</h3>
              <span className="work__term">{meta.term}</span>
            </div>
            <p className="muted">{copy.role}</p>
            <p className="work__blurb">{copy.blurb}</p>
            <div className="tags" style={{ paddingTop: 4 }}>
              {meta.stack.map((tag) => (
                <span key={tag} className="tag">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </Panel>
    </section>
  );
}
