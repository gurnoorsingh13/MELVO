import type { Metadata } from "next";
import { CtaBand, Process } from "@/components/home";
import { Mark } from "@/components/Mark";
import { Reveal, ScrubText } from "@/components/motion";
import { CAPABILITIES, PRINCIPLES } from "@/lib/content";

export const metadata: Metadata = {
  title: "About",
  description: "MELVO is one team for learning, brand, commerce and technology.",
};

export default function About() {
  return (
    <>
      <section className="cap-hero container">
        <div className="meta">
          <span className="label muted">About MELVO</span>
          <span className="label muted">Education × Commerce × Creativity × Technology</span>
        </div>
        <Reveal as="h1" className="t-display" trigger="ready" id="about-title">
          We build skills, businesses, brands and <span className="em" style={{ color: "var(--green)" }}>technology.</span>
        </Reveal>
        <div className="bottom">
          <p className="t-lead muted">
            A multidisciplinary company that helps people and businesses learn, build, launch, sell and grow.
          </p>
          <span />
          <Mark shape="m" title="MELVO mark" />
        </div>
      </section>

      <section className="section container intro">
        <div className="meta">
          <span className="label muted">Why we exist</span>
        </div>
        <ScrubText className="t-statement">
          A student with a skill can become a founder. A founder with a product can become a brand. A brand with the right systems can become a company that lasts. We built MELVO to be there for every one of those steps.
        </ScrubText>
      </section>

      <section className="section is-dark" data-header="dark" aria-label="The system">
        <div className="container">
          <div className="sec-head">
            <span className="label muted">The system</span>
            <Reveal as="h2" className="t-display">
              Four capabilities. <span className="em" style={{ color: "var(--firozi)" }}>One loop.</span>
            </Reveal>
          </div>
          <div className="loop">
            {CAPABILITIES.map((c) => (
              <div className="node" key={c.slug}>
                <Mark shape={c.shape} tone="dark" />
                <b>{c.verb} →</b>
                <p>{c.summary}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section container" aria-label="Principles">
        <div className="sec-head">
          <span className="label muted">What we believe</span>
          <Reveal as="h2" className="t-display">
            Five <span className="em" style={{ color: "var(--green)" }}>rules</span> we work by.
          </Reveal>
        </div>
        <div className="principles">
          {PRINCIPLES.map((p, i) => (
            <div key={p.title}>
              <span className="label muted">{String(i + 1).padStart(2, "0")}</span>
              <div style={{ display: "grid", gap: 12 }}>
                <h3 className="t-h3">{p.title}</h3>
                <p>{p.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Process />
      <CtaBand />
    </>
  );
}
