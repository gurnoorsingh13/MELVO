"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { CAPABILITIES, SELL_FLOW, type Capability } from "@/lib/content";
import type { ShapeName } from "@/lib/shapes";
import { Mark } from "./Mark";
import { Reveal, Rise, ScrubText } from "./motion";
import { useSite } from "./providers";
import { TransitionLink } from "./TransitionLink";

export function CapHero({ cap }: { cap: Capability }) {
  const { ready } = useSite();
  const [shape, setShape] = useState<ShapeName>("m");
  useEffect(() => {
    if (!ready) return;
    const t = window.setTimeout(() => setShape(cap.shape), 900);
    return () => window.clearTimeout(t);
  }, [ready, cap.shape]);
  return (
    <section className="cap-hero container">
      <div className="meta">
        <span className="label muted">
          {cap.index} / {cap.name}
        </span>
        <span className="label muted">Capability</span>
      </div>
      <Reveal as="h1" className="verb" trigger="ready">
        {cap.verb}
        <span className="dot" />
      </Reveal>
      <div className="bottom">
        <Reveal as="h2" className="t-h2" trigger="ready" delay={0.25}>
          {cap.headline} <span className="em">{cap.headlineEm}</span>
        </Reveal>
        <p className="t-lead muted">{cap.summary}</p>
        <Mark shape={shape} title={`${cap.verb} shape`} />
      </div>
    </section>
  );
}

export function CapIntro({ cap }: { cap: Capability }) {
  return (
    <section className="section container intro">
      <div className="meta">
        <span className="label muted">What it means</span>
      </div>
      <ScrubText className="t-statement">{cap.intro}</ScrubText>
    </section>
  );
}

export function ServiceList({ cap }: { cap: Capability }) {
  const follow = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = follow.current;
    if (!el || prefersReducedMotion() || !window.matchMedia("(pointer: fine)").matches) return;
    const xTo = gsap.quickTo(el, "left", { duration: 0.6, ease: "power3.out" });
    const yTo = gsap.quickTo(el, "top", { duration: 0.6, ease: "power3.out" });
    const move = (e: PointerEvent) => {
      xTo(e.clientX + 150);
      yTo(e.clientY);
    };
    window.addEventListener("pointermove", move);
    return () => window.removeEventListener("pointermove", move);
  }, []);
  const on = (v: boolean) => follow.current?.classList.toggle("on", v);
  return (
    <section className="section container" style={{ paddingTop: 0 }} aria-label="Services">
      <div className="sec-head">
        <span className="label muted">Services</span>
        <Reveal as="h2" className="t-display">
          What we <span className="em" style={{ color: "var(--green)" }}>do.</span>
        </Reveal>
      </div>
      <div className="svc" onPointerLeave={() => on(false)}>
        <ul>
          {cap.services.map((s, i) => (
            <li key={s.title}>
              <Rise className="row">
                <span className="label muted" onPointerEnter={() => on(true)}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="t-h3" onPointerEnter={() => on(true)}>
                  {s.title}
                </h3>
                <p onPointerEnter={() => on(true)}>{s.text}</p>
              </Rise>
            </li>
          ))}
        </ul>
      </div>
      <div className="svc-follow" ref={follow} aria-hidden="true">
        <Mark shape={cap.shape} tone="dark" />
      </div>
    </section>
  );
}

export function Facts({ cap }: { cap: Capability }) {
  return (
    <section className="section is-dark" data-header="dark" aria-label="Who it is for">
      <div className="container">
        <div className="sec-head">
          <span className="label muted">At a glance</span>
          <Reveal as="h2" className="t-display">
            Made for people who want to <span className="em" style={{ color: "var(--firozi)" }}>move.</span>
          </Reveal>
        </div>
        <div className="facts">
          <div>
            <span className="label muted">Who it is for</span>
            <ul>{cap.audience.map((a) => <li key={a}>{a}</li>)}</ul>
          </div>
          <div>
            <span className="label muted">What you get</span>
            <ul>{cap.outcomes.map((a) => <li key={a}>{a}</li>)}</ul>
          </div>
        </div>
      </div>
    </section>
  );
}

export function SellFlow() {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = root.current;
    if (!el || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.from(".step", { y: 50, autoAlpha: 0, stagger: 0.12, duration: 1.1, ease: "expo.out", scrollTrigger: { trigger: el, start: "top 80%", once: true } });
    }, el);
    return () => ctx.revert();
  }, []);
  return (
    <section className="section container" aria-label="How a product moves">
      <div className="sec-head">
        <span className="label muted">How a product moves</span>
        <Reveal as="h2" className="t-display">
          Six steps from shelf to <span className="em" style={{ color: "var(--green)" }}>sold.</span>
        </Reveal>
      </div>
      <div className="flow" ref={root}>
        {SELL_FLOW.map((s, i) => (
          <div className="step" key={s.t}>
            <span className="label">
              {String(i + 1).padStart(2, "0")} <i>{i === SELL_FLOW.length - 1 ? "■" : "→"}</i>
            </span>
            <div>
              <b>{s.t}</b>
              <span>{s.d}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function NextCap({ cap }: { cap: Capability }) {
  const i = CAPABILITIES.findIndex((c) => c.slug === cap.slug);
  const next = CAPABILITIES[(i + 1) % CAPABILITIES.length];
  return (
    <TransitionLink href={`/${next.slug}`} className="next-cap container" data-cursor="Next">
      <span className="label muted">
        Next capability · {next.index} / {next.name}
      </span>
      <span className="big">
        {next.verb}
        <span className="arrow">→</span>
      </span>
    </TransitionLink>
  );
}
