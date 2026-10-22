"use client";

import { useState, type FormEvent } from "react";
import { SITE } from "@/lib/content";

const WHO = ["Business or founder", "Startup", "School or college", "Student or learner", "Something else"];
const NEEDS = [
  "Courses or workshops",
  "Mentorship",
  "Training for a team",
  "Brand strategy and identity",
  "Social and campaigns",
  "Amazon or marketplace",
  "E-commerce website",
  "Product photography",
  "Website or web app",
  "Mobile app",
  "Automation or AI",
  "Not sure yet",
];
const TIMES = ["As soon as possible", "In the next 3 months", "Just exploring"];

type Status = "idle" | "sending" | "done" | "error";

export function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const body = {
      who: fd.get("who"),
      needs: fd.getAll("needs"),
      timing: fd.get("timing"),
      name: fd.get("name"),
      email: fd.get("email"),
      phone: fd.get("phone"),
      org: fd.get("org"),
      message: fd.get("message"),
      website: fd.get("website"),
    };
    setStatus("sending");
    setError("");
    try {
      const res = await fetch("/api/contact", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      setStatus("done");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  if (status === "done") {
    return (
      <div className="form-done" role="status">
        <h2 className="t-h2">
          Got it. <span className="em" style={{ color: "var(--green)" }}>Thank you.</span>
        </h2>
        <p className="t-lead muted">We read every message and will reply by email soon.</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate={false}>
      <div className="form-step">
        <fieldset>
          <legend className="label">01 / Who are you?</legend>
          <div className="choices">
            {WHO.map((w, i) => (
              <label className="choice" key={w}>
                <input type="radio" name="who" value={w} id={`who-${i}`} required />
                <span>{w}</span>
              </label>
            ))}
          </div>
        </fieldset>
      </div>
      <div className="form-step">
        <fieldset>
          <legend className="label">02 / What do you need? Pick any.</legend>
          <div className="choices">
            {NEEDS.map((n, i) => (
              <label className="choice" key={n}>
                <input type="checkbox" name="needs" value={n} id={`need-${i}`} />
                <span>{n}</span>
              </label>
            ))}
          </div>
        </fieldset>
      </div>
      <div className="form-step">
        <fieldset>
          <legend className="label">03 / When?</legend>
          <div className="choices">
            {TIMES.map((t, i) => (
              <label className="choice" key={t}>
                <input type="radio" name="timing" value={t} id={`time-${i}`} />
                <span>{t}</span>
              </label>
            ))}
          </div>
        </fieldset>
      </div>
      <div className="form-step">
        <fieldset>
          <legend className="label">04 / About you</legend>
          <div className="fields two">
            <div className="field">
              <label htmlFor="f-name">Name</label>
              <input id="f-name" name="name" autoComplete="name" required />
            </div>
            <div className="field">
              <label htmlFor="f-email">Email</label>
              <input id="f-email" name="email" type="email" autoComplete="email" required />
            </div>
            <div className="field">
              <label htmlFor="f-phone">Phone (optional)</label>
              <input id="f-phone" name="phone" type="tel" autoComplete="tel" />
            </div>
            <div className="field">
              <label htmlFor="f-org">Company or school (optional)</label>
              <input id="f-org" name="org" autoComplete="organization" />
            </div>
          </div>
          <div className="field">
            <label htmlFor="f-message">Tell us about the idea</label>
            <textarea id="f-message" name="message" required />
          </div>
          <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ position: "absolute", left: "-9999px" }} />
        </fieldset>
      </div>
      <div className="form-step" style={{ borderTop: 0 }}>
        {status === "error" && (
          <p className="form-error" role="alert">
            {error} You can also email us at {SITE.email}.
          </p>
        )}
        <div>
          <button type="submit" className="btn" disabled={status === "sending"}>
            {status === "sending" ? "Sending…" : "Send"} <span className="arrow">→</span>
          </button>
        </div>
      </div>
    </form>
  );
}
