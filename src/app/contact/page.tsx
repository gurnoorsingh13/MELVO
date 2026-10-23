import type { Metadata } from "next";
import { ContactForm } from "@/components/ContactForm";
import { Lines, Reveal } from "@/components/motion";
import { FAQ, SITE } from "@/lib/content";

export const metadata: Metadata = {
  title: "Start a project",
  description: "Tell MELVO about your idea: a course, a brand, a store or a product.",
};

export default function Contact() {
  return (
    <>
      <section className="contact" data-theme-section="white">
        <div className="page">
          <Lines as="h1" className="t-giant" trigger="ready">
            Let&apos;s talk<span className="dot" />
          </Lines>
          <div className="contact-wrap">
            <Reveal trigger="ready" delay={0.3} className="contact-side">
              <p className="t-h3">A few questions, two minutes. The more you share, the better our first reply.</p>
              <div>
                <span className="t-small muted">Prefer email?</span>
                <a href={`mailto:${SITE.email}`} className="arrow-link t-h3">
                  {SITE.email} <span className="arr">→</span>
                </a>
              </div>
              <div>
                <span className="t-small muted">Here to learn?</span>
                <a href={SITE.funUrl} target="_blank" rel="noopener" className="arrow-link t-h3">
                  melvo.fun <span className="arr">↗</span>
                </a>
              </div>
            </Reveal>
            <ContactForm />
          </div>
        </div>
      </section>
      <section className="faq" data-theme-section="white" aria-label="Questions">
        <div className="page">
          <Lines as="h2" className="t-display-xl">
            Good to know.
          </Lines>
          <Reveal className="faq-list" stagger={0.06}>
            {FAQ.map((f) => (
              <details key={f.q}>
                <summary>
                  <span className="t-h3">{f.q}</span>
                  <span className="plus" aria-hidden="true" />
                </summary>
                <p className="t-h4 muted">{f.a}</p>
              </details>
            ))}
          </Reveal>
        </div>
      </section>
    </>
  );
}
