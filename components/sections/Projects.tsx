"use client";

import Image from "next/image";
import { useState } from "react";
import { projectsMeta } from "@/lib/copy";
import { useLang } from "@/lib/i18n";
import { Panel } from "../Panel";

/** Falls back to the hatched label card if the screenshot ever goes missing. */
function Thumb({
  src,
  pos,
  label,
  alt,
}: {
  src: string;
  pos: string;
  label: string;
  alt: string;
}) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className="project__thumb">
        <span>{label}</span>
      </div>
    );
  }

  return (
    <div className="project__thumb project__thumb--shot">
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 880px) 92vw, 34vw"
        style={{ objectFit: "cover", objectPosition: pos }}
        onError={() => setFailed(true)}
      />
    </div>
  );
}

export function Projects() {
  const { t } = useLang();

  return (
    <section id="projects" className="section">
      <Panel title={t.projects.label}>
        <div className="projects">
          {t.projects.items.map((p, i) => (
            <article key={projectsMeta[i].id} className="project">
              <Thumb
                src={projectsMeta[i].shot}
                pos={projectsMeta[i].shotPos}
                label={p.thumb}
                alt={p.title}
              />
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
