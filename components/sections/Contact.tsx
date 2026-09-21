"use client";

import { useState, type FormEvent } from "react";
import { CONTACT_EMAIL, links, RESUME_HREF } from "@/lib/copy";
import { useLang } from "@/lib/i18n";
import { FeedGame } from "../game/FeedGame";
import { Panel } from "../Panel";

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export function Contact() {
  const { t } = useLang();
  const [form, setForm] = useState({ name: "", email: "", msg: "" });
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  const field = (key: keyof typeof form) => (value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
    setSent(false);
    setError("");
  };

  /**
   * Posts to our own route, which holds the provider key server-side. The
   * button only ever says "sent" when the server actually accepted it — the
   * previous version claimed success while merely opening a mail client.
   */
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.msg) return setError(t.contact.errAll);
    if (!EMAIL_RE.test(form.email)) return setError(t.contact.errEmail);

    setError("");
    setBusy(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error(String(res.status));
      setSent(true);
    } catch {
      setError(t.contact.errSend);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section id="contact" className="section">
      <Panel
        title={t.contact.label}
        barExtra={
          <span className="bar-links">
            {links.map((l) => (
              <a key={l.label} className="bar-link" href={l.href} target="_blank" rel="noreferrer">
                {l.label}
              </a>
            ))}
            <a className="bar-link" href={RESUME_HREF} target="_blank" rel="noreferrer">
              {t.contact.resume}
            </a>
          </span>
        }
      >
        <div className="contact">
          <form className="contact__form" onSubmit={submit} noValidate>
            <div className="contact__head">
              <h3 className="h3">{t.contact.title}</h3>
              <p className="muted">{t.contact.sub}</p>
            </div>

            <div className="contact__row">
              <label className="field">
                <span className="field__label">{t.contact.name}</span>
                <input
                  name="name"
                  value={form.name}
                  onChange={(e) => field("name")(e.target.value)}
                  placeholder={t.contact.namePh}
                  autoComplete="name"
                />
              </label>
              <label className="field">
                <span className="field__label">{t.contact.email}</span>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => field("email")(e.target.value)}
                  placeholder={t.contact.emailPh}
                  autoComplete="email"
                />
              </label>
            </div>

            <label className="field field--grow">
              <span className="field__label">{t.contact.msg}</span>
              <textarea
                name="msg"
                rows={5}
                value={form.msg}
                onChange={(e) => field("msg")(e.target.value)}
                placeholder={t.contact.msgPh}
              />
            </label>

            {error ? (
              <p className="contact__error" role="alert">
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              className="contact__submit"
              data-sent={sent}
              disabled={busy}
            >
              {sent ? t.contact.sent : t.contact.btn}
            </button>

            <p className="contact__note">
              {t.contact.note}{" "}
              <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
            </p>
          </form>

          <div className="contact__aside">
            <FeedGame />
          </div>
        </div>
      </Panel>
    </section>
  );
}
