"use client";

import { useEffect, useRef } from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { CAPABILITIES, SELL_FLOW, type Capability } from "@/lib/content";
import { Mark } from "./Mark";
import { Mark3D } from "./Mark3D";
import { Lines, Reveal, ScrubText } from "./motion";
import { TransitionLink } from "./TransitionLink";

export function CapHero({ cap }: { cap: Capability }) {
  const root = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = root.current;
    if (!el || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.from(".cap-object", { scale: 0.6, autoAlpha: 0, duration: 1.6, ease: "melvo", delay: 0.1 });
      gsap.to(".cap-object", { yPercent: -16, ease: "none", scrollTrigger: { trigger: el, start: "top top", end: "bottom top", scrub: true } });
    }, el);
    return () => ctx.revert();
  }, []);
  return (
    <section className="cap-hero" ref={root} data-theme-section="white">
      <div className="cap-object">
        <Mark3D shape={cap.shape} tone="green" />
      </div>
      <div className="page cap-hero-copy">
        <Reveal trigger="ready" className="cap-meta">
          <span className="tag tag--light">{cap.index}</span>
          <span className="t-small muted">{cap.name}</span>
        </Reveal>
        <Lines as="h1" className="t-giant" trigger="ready" delay={0.15}>
          {cap.verb}
          <span className="dot" />
        </Lines>
        <Reveal trigger="ready" delay={0.45}>
          <p className="t-h2 cap-headline">
            {cap.headline} <span className="accent">{cap.headlineEm}</span>
          </p>
        </Reveal>
      </div>
    </section>
  );
}

export function CapIntro({ cap }: { cap: Capability }) {
  return (
    <section className="cap-intro" data-theme-section="white">
      <div className="page">
        <ScrubText className="t-statement">{cap.intro}</ScrubText>
      </div>
    </section>
  );
}

export function SellFlow() {
  return (
    <section className="flow" data-theme-section="white" aria-label="How a product moves">
      <div className="page">
        <Lines as="h2" className="t-display-xl">
          Shelf to sold.
        </Lines>
        <Reveal className="flow-grid" stagger={0.08}>
          {SELL_FLOW.map((s, i) => (
            <div className="flow-step" key={s.t}>
              <span className="stack-num">{String(i + 1).padStart(2, "0")}</span>
              <b className="t-h3">{s.t}.</b>
              <span className="muted">{s.d}</span>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}

export function Facts({ cap }: { cap: Capability }) {
  return (
    <section className="facts" data-theme-section="white" aria-label="Who it is for">
      <div className="page">
        <Lines as="h2" className="t-display-xl">
          Made for movers.
        </Lines>
        <Reveal className="facts-grid" stagger={0.12}>
          <div className="facts-card">
            <span className="t-h4 accent">Who it is for.</span>
            <ul>
              {cap.audience.map((a) => (
                <li key={a} className="t-h3">
                  {a}
                </li>
              ))}
            </ul>
          </div>
          <div className="facts-card">
            <span className="t-h4 accent">What you get.</span>
            <ul>
              {cap.outcomes.map((a) => (
                <li key={a} className="t-h3">
                  {a}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export function NextCap({ cap }: { cap: Capability }) {
  const i = CAPABILITIES.findIndex((c) => c.slug === cap.slug);
  const next = CAPABILITIES[(i + 1) % CAPABILITIES.length];
  return (
    <section className="next-cap" data-theme-section="dark" aria-label="Next capability">
      <div className="page">
        <TransitionLink href={`/${next.slug}`} className="next-card">
          <span className="t-small">Next · {next.index} · {next.name}</span>
          <span className="t-giant">
            {next.verb}
            <span className="dot" />
          </span>
          <Mark shape={next.shape} tone="dark" className="next-mark" />
          <span className="circle" aria-hidden="true">
            →
          </span>
        </TransitionLink>
      </div>
    </section>
  );
}
