import type { Metadata } from "next";
import { ContactForm } from "@/components/ContactForm";
import { Reveal } from "@/components/motion";
import { SITE } from "@/lib/content";

export const metadata: Metadata = {
  title: "Start a project",
  description: "Tell MELVO about your idea: a course, a brand, a store or a product.",
};

export default function Contact() {
  return (
    <section className="container" style={{ paddingTop: "calc(var(--header-h) + 8vh)", paddingBottom: "clamp(96px, 12vw, 180px)" }}>
      <div className="contact-wrap">
        <div className="contact-side">
          <span className="label muted">Start a project</span>
          <Reveal as="h1" className="t-display" trigger="ready">
            Thought of it? <span className="em" style={{ color: "var(--green)" }}>Tell us.</span>
          </Reveal>
          <p className="t-lead muted">A few questions, two minutes. The more you share, the better our first reply.</p>
          <div style={{ display: "grid", gap: 8 }}>
            <span className="label muted">Prefer email?</span>
            <a href={`mailto:${SITE.email}`} className="t-h3 link-u" style={{ justifySelf: "start" }}>
              {SITE.email}
            </a>
          </div>
          <div style={{ display: "grid", gap: 8 }}>
            <span className="label muted">Here to learn?</span>
            <a href={SITE.funUrl} target="_blank" rel="noopener" className="t-h3 link-u" style={{ justifySelf: "start" }}>
              melvo.fun ↗
            </a>
          </div>
        </div>
        <ContactForm />
      </div>
    </section>
  );
}
