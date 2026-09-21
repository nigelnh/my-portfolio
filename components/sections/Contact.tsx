"use client";

import { useState, type FormEvent } from "react";
import { useLang } from "@/lib/i18n";
import { WaveBlob } from "../blob/BlobStage";
import { Panel } from "../Panel";

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

/** Set NEXT_PUBLIC_CONTACT_WEBHOOK to the n8n endpoint; without it the form
 *  falls back to opening the visitor's mail client. */
const WEBHOOK = process.env.NEXT_PUBLIC_CONTACT_WEBHOOK;
const FALLBACK_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "hello@example.com";

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

  const mailto = () => {
    const subject = encodeURIComponent(`Portfolio — ${form.name}`);
    const body = encodeURIComponent(`${form.msg}\n\n— ${form.name} <${form.email}>`);
    window.location.href = `mailto:${FALLBACK_EMAIL}?subject=${subject}&body=${body}`;
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.msg) return setError(t.contact.errAll);
    if (!EMAIL_RE.test(form.email)) return setError(t.contact.errEmail);

    setError("");
    if (!WEBHOOK) {
      mailto();
      setSent(true);
      return;
    }

    setBusy(true);
    try {
      const res = await fetch(WEBHOOK, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error(String(res.status));
      setSent(true);
    } catch {
      mailto();
      setSent(true);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section id="contact" className="section">
      <Panel title={t.contact.label}>
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

            <label className="field">
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

            <p className="contact__note">{t.contact.note}</p>
          </form>

          <div className="contact__aside">
            <div className="contact__reply">
              <WaveBlob size={72} label={t.contact.reply} />
              <p>{t.contact.reply}</p>
            </div>
          </div>
        </div>
      </Panel>
    </section>
  );
}
