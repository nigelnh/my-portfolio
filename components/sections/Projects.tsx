"use client";

import Image from "next/image";
import { useState } from "react";
import { projectsMeta } from "@/lib/copy";
import { useLang } from "@/lib/i18n";
import { Panel } from "../Panel";

/** Falls back to the hatched label card if the screenshot ever goes missing. */
/** The whole thumb is the link to the live project. */
function Thumb({
  src,
  pos,
  label,
  alt,
  href,
  cta,
}: {
  src: string;
  pos: string;
  label: string;
  alt: string;
  href: string;
  cta: string;
}) {
  const [failed, setFailed] = useState(false);

  return (
    <a
      className={`project__thumb${failed ? "" : " project__thumb--shot"}`}
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={`${alt} — ${cta}`}
    >
      {failed ? (
        <span>{label}</span>
      ) : (
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(max-width: 880px) 92vw, 40vw"
          style={{ objectFit: "cover", objectPosition: pos }}
          onError={() => setFailed(true)}
        />
      )}
      <span className="project__cta" aria-hidden="true">
        {cta} →
      </span>
    </a>
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
                href={projectsMeta[i].url}
                cta={t.projects.visit}
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
