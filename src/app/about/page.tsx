import type { Metadata } from "next";
import { CapabilityRail, CtaCards, Process, StackCards } from "@/components/home";
import { Mark3D } from "@/components/Mark3D";
import { Lines, Reveal, ScrubText } from "@/components/motion";
import { PRINCIPLES } from "@/lib/content";

export const metadata: Metadata = {
  title: "About",
  description: "MELVO is one team for learning, brand, commerce and technology.",
};

export default function About() {
  return (
    <>
      <section className="hero hero--about" data-theme-section="dark">
        <div className="hero-object">
          <Mark3D shape="m" tone="paper" />
        </div>
        <div className="hero-copy page">
          <Lines as="h1" className="t-giant" trigger="ready" delay={0.15}>
            This is MELVO<span className="dot" />
          </Lines>
          <Reveal trigger="ready" delay={0.5}>
            <p className="t-h4 hero-sub">A multidisciplinary company that helps people and businesses learn, build, launch, sell and grow.</p>
          </Reveal>
        </div>
      </section>

      <section className="cap-intro" data-theme-section="white">
        <div className="page">
          <ScrubText className="t-statement">
            A student with a skill can become a founder. A founder with a product can become a brand. A brand with the right systems can become a company that lasts. We built MELVO to be there for every one of those steps.
          </ScrubText>
        </div>
      </section>

      <CapabilityRail title="One loop." />
      <StackCards heading="What we believe." intro="Five rules we work by, on every project and in every classroom." items={PRINCIPLES} />
      <Process />
      <CtaCards />
    </>
  );
}
