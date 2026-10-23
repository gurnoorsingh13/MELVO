"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, ScrollTrigger, prefersReducedMotion } from "@/lib/gsap";
import { AUDIENCE, CAPABILITIES, PROCESS, SITE, STATEMENT, WAYS_TO_START, type Capability } from "@/lib/content";
import type { ShapeName } from "@/lib/shapes";
import { Mark } from "./Mark";
import { Mark3D } from "./Mark3D";
import { Lines, Reveal, RotatingWords, ScrubText, ShapeTrail } from "./motion";
import { useSite } from "./providers";
import { TransitionLink } from "./TransitionLink";

/* ---------------- Hero ---------------- */

const HERO_SHAPES: ShapeName[] = ["m", "learn", "brand", "sell", "scale"];

export function Hero() {
  const root = useRef<HTMLElement>(null);
  const { ready } = useSite();
  const [shape, setShape] = useState<ShapeName>("m");

  useEffect(() => {
    if (!ready || prefersReducedMotion()) return;
    let i = 0;
    const id = window.setInterval(() => {
      i = (i + 1) % HERO_SHAPES.length;
      setShape(HERO_SHAPES[i]);
    }, 2600);
    return () => window.clearInterval(id);
  }, [ready]);

  useEffect(() => {
    const el = root.current;
    if (!el || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.from(".hero-object", { scale: 0.6, autoAlpha: 0, duration: 1.6, ease: "melvo", delay: 0.1 });
      const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: "top top", end: "bottom top", scrub: true } });
      tl.to(".hero-object", { yPercent: -18, scale: 1.12, ease: "none" }, 0).to(".hero-copy", { yPercent: -40, autoAlpha: 0.2, ease: "none" }, 0);
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section className="hero" ref={root} data-theme-section="dark">
      <div className="hero-object">
        <Mark3D shape={shape} tone="paper" />
      </div>
      <div className="hero-copy page">
        <Lines as="h1" className="t-giant" trigger="ready" delay={0.25}>
          Hello<span className="dot" />
        </Lines>
        <Reveal trigger="ready" delay={0.6}>
          <p className="t-h4 hero-sub">
            Thought of it? Let&apos;s build it. We teach the skills, shape the brand, open the store and write the software.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------------- Statement ---------------- */

const STATEMENT_LINKS = [
  { href: "#capabilities", label: "See what we do." },
  { href: "#process", label: "Check our approach." },
  { href: SITE.funUrl, label: "Learn on melvo.fun.", ext: true },
  { href: "/about", label: "This is MELVO." },
  { href: "/contact", label: "Start a project." },
];

export function Statement() {
  const { lenis } = useSite();
  const jump = (id: string) => {
    const t = document.querySelector<HTMLElement>(id);
    if (!t) return;
    lenis.current ? lenis.current.scrollTo(t, { offset: -40, duration: 1.6 }) : t.scrollIntoView({ behavior: "smooth" });
  };
  return (
    <section className="statement" data-theme-section="white">
      <ShapeTrail className="page">
        <Reveal>
          <h2 className="t-display statement-title">
            {STATEMENT.lead} <RotatingWords words={STATEMENT.words} className="accent" />
          </h2>
        </Reveal>
        <div className="statement-body">
          <ScrubText className="t-h3">{STATEMENT.body}</ScrubText>
          <Reveal as="ul" className="arrow-links" stagger={0.06}>
            {STATEMENT_LINKS.map((l) => (
              <li key={l.label}>
                {l.ext ? (
                  <a href={l.href} target="_blank" rel="noopener" className="arrow-link">
                    {l.label} <span className="arr">↗</span>
                  </a>
                ) : l.href.startsWith("#") ? (
                  <a
                    href={l.href}
                    className="arrow-link"
                    onClick={(e) => {
                      e.preventDefault();
                      jump(l.href);
                    }}
                  >
                    {l.label} <span className="arr">→</span>
                  </a>
                ) : (
                  <TransitionLink href={l.href} className="arrow-link">
                    {l.label} <span className="arr">→</span>
                  </TransitionLink>
                )}
              </li>
            ))}
          </Reveal>
        </div>
      </ShapeTrail>
    </section>
  );
}

/* ---------------- Audience wall ---------------- */

export function AudienceWall() {
  const cells = 8;
  const [shown, setShown] = useState(() => AUDIENCE.slice(0, cells));
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el || prefersReducedMotion()) return;
    let pool = AUDIENCE.slice(cells);
    let last = -1;
    let visible = false;
    const st = ScrollTrigger.create({ trigger: el, start: "top bottom", end: "bottom top", onToggle: (s) => (visible = s.isActive) });
    const id = window.setInterval(() => {
      if (!visible || document.hidden) return;
      let slot = Math.floor(Math.random() * cells);
      if (slot === last) slot = (slot + 1) % cells;
      last = slot;
      const word = el.querySelectorAll<HTMLElement>(".aw-word")[slot];
      if (!word) return;
      gsap.to(word, {
        yPercent: -60,
        autoAlpha: 0,
        filter: "blur(6px)",
        duration: 0.45,
        ease: "power3.in",
        onComplete: () => {
          setShown((prev) => {
            const next = [...prev];
            const incoming = pool[0];
            pool = [...pool.slice(1), prev[slot]];
            next[slot] = incoming;
            return next;
          });
          gsap.fromTo(word, { yPercent: 60, autoAlpha: 0, filter: "blur(6px)" }, { yPercent: 0, autoAlpha: 1, filter: "blur(0px)", duration: 0.7, ease: "power3.out" });
        },
      });
    }, 1400);
    return () => {
      window.clearInterval(id);
      st.kill();
    };
  }, []);

  return (
    <section className="audience" data-theme-section="white" aria-label="Who we work with">
      <div className="page">
        <Reveal className="aw-head">
          <span className="t-small muted">Built for</span>
          <span className="t-small muted">Students to enterprises</span>
        </Reveal>
        <div ref={root}>
          <Reveal className="aw-grid" stagger={0.05}>
            {shown.map((w, i) => (
              <div className="aw-cell" key={i}>
                <span className="aw-word">{w}</span>
              </div>
            ))}
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ---------------- Capability rail (pinned, horizontal) ---------------- */

function CapScene({ cap }: { cap: Capability }) {
  return (
    <div className={`scene scene--${cap.slug}`} aria-hidden="true">
      <div className="scene-grid" />
      <div className="scene-object">
        <Mark3D shape={cap.shape} tone={cap.slug === "brand" || cap.slug === "scale" ? "green" : "paper"} layers={16} follow={false} />
      </div>
      {cap.vignette === "course" && (
        <div className="vcard">
          <span className="t-small">melvo.fun · Robotics 101</span>
          <b>Module 4 of 6: Sensors</b>
          <div className="steps">{[1, 1, 1, 1, 0, 0].map((on, i) => <i key={i} className={on ? "on" : ""} />)}</div>
          <span className="t-small muted">Next: build the line follower</span>
        </div>
      )}
      {cap.vignette === "identity" && (
        <div className="vcard">
          <span className="t-small">Identity system · v1</span>
          <b className="brandword">Your brand.</b>
          <div className="chips">
            <i style={{ background: "#E9AE36" }} />
            <i style={{ background: "#1E2A38" }} />
            <i style={{ background: "#F7F3EA" }} />
          </div>
          <span className="t-small muted">Logo · Colour · Type · Voice</span>
        </div>
      )}
      {cap.vignette === "listing" && (
        <div className="vcard">
          <span className="t-small">Marketplace listing</span>
          <b>Your product, shot and listed</b>
          <span className="price">₹1,499</span>
          <span className="buy">Add to cart</span>
        </div>
      )}
      {cap.vignette === "dashboard" && (
        <div className="vcard">
          <span className="t-small">Operations · this week</span>
          <b>Orders</b>
          <div className="bars">{[30, 44, 38, 56, 52, 70, 76, 100].map((h, i) => <i key={i} style={{ height: `${h}%` }} />)}</div>
          <span className="t-small muted">Stock synced · automated</span>
        </div>
      )}
    </div>
  );
}

export function CapabilityRail({ title = "What we do." }: { title?: string }) {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = root.current!;
    const mm = gsap.matchMedia();
    mm.add("(min-width: 1000px) and (prefers-reduced-motion: no-preference)", () => {
      const track = el.querySelector<HTMLElement>(".rail-track")!;
      const pin = el.querySelector<HTMLElement>(".rail-pin")!;
      const dist = () => track.scrollWidth - window.innerWidth;
      const tween = gsap.to(track, {
        x: () => -dist(),
        ease: "none",
        scrollTrigger: { trigger: pin, start: "top top", end: () => `+=${dist()}`, pin, scrub: 0.6, invalidateOnRefresh: true },
      });
      // Each card's copy drifts slightly slower than the card for depth.
      gsap.utils.toArray<HTMLElement>(".rail-card", el).forEach((card) => {
        gsap.fromTo(
          card.querySelector(".scene-object"),
          { xPercent: 18 },
          { xPercent: -18, ease: "none", scrollTrigger: { trigger: card, containerAnimation: tween, start: "left right", end: "right left", scrub: true } },
        );
      });
    });
    return () => mm.revert();
  }, []);

  return (
    <section className="rail" id="capabilities" ref={root} data-theme-section="dark" aria-label="Capabilities">
      <div className="rail-pin">
        <Lines as="h2" className="t-display-xl page rail-title">
          {title}
        </Lines>
        <div className="rail-track">
          {CAPABILITIES.map((c) => (
            <TransitionLink href={`/${c.slug}`} className={`rail-card rail-card--${c.slug}`} key={c.slug}>
              <CapScene cap={c} />
              <div className="rail-copy">
                <span className="t-small">{c.index} · {c.name}</span>
                <h3 className="t-h2">{c.verb}.</h3>
                <p className="t-h3 dim">{c.summary}</p>
              </div>
            </TransitionLink>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- Ways to start (radial arc) ---------------- */

export function WaysArc() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = root.current!;
    const list = el.querySelector<HTMLElement>(".arc-list")!;
    const items = gsap.utils.toArray<HTMLElement>(".arc-item", el);
    const layout = () => {
      const r = parseFloat(getComputedStyle(list).getPropertyValue("--radius")) || 1400;
      const w = items[0].offsetWidth;
      const step = (((w + 28) / r) * 180) / Math.PI;
      list.style.setProperty("--step", `${step}deg`);
      return step;
    };
    let step = layout();
    const mm = gsap.matchMedia();
    mm.add("(min-width: 1000px) and (prefers-reduced-motion: no-preference)", () => {
      gsap.fromTo(
        list,
        { rotate: step * 0.5 },
        {
          rotate: () => -step * (items.length - 1.5),
          ease: "none",
          scrollTrigger: {
            trigger: el,
            pin: true,
            start: "top top",
            end: () => `+=${window.innerHeight * (items.length - 1) * 0.55}`,
            scrub: 0.6,
            invalidateOnRefresh: true,
            onRefresh: () => {
              step = layout();
            },
          },
        },
      );
    });
    return () => mm.revert();
  }, []);

  return (
    <section className="arc" ref={root} data-theme-section="dark" aria-label="Ways to start">
      <div className="page arc-intro">
        <Lines as="h2" className="t-display-xl">
          Start small.
        </Lines>
        <Reveal>
          <p className="t-h3">Pick one way in. Everything else connects when you need it, without starting over.</p>
        </Reveal>
      </div>
      <div className="arc-stage">
        <ul className="arc-list">
          {WAYS_TO_START.map((w, i) => (
            <li className="arc-item" key={w.title} style={{ ["--i" as string]: i }}>
              <TransitionLink href="/contact" className={`arc-card arc-card--${i % 4}`}>
                <div className="arc-top">
                  <span className="tag">{w.verb}</span>
                  <span className="tag tag--ghost">{w.time}</span>
                </div>
                <Mark shape={(["learn", "learn", "brand", "sell", "scale", "m"] as ShapeName[])[i]} tone={i % 4 === 1 || i % 4 === 2 ? "light" : "dark"} className="arc-mark" />
                <div>
                  <h3 className="t-h3">{w.title}.</h3>
                  <p>{w.text}</p>
                </div>
              </TransitionLink>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ---------------- Stacking cards ---------------- */

type StackItem = { title: string; text: string };

export function StackCards({ id, heading, intro, items }: { id?: string; heading: string; intro: string; items: StackItem[] }) {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = root.current!;
    if (prefersReducedMotion()) return;
    const cards = gsap.utils.toArray<HTMLElement>(".stack-item", el);
    const triggers = cards.map((li, i) => {
      const card = li.querySelector<HTMLElement>(".stack-card")!;
      return ScrollTrigger.create({
        trigger: li,
        start: () => `top ${(parseFloat(getComputedStyle(li).top) || 0) + 1}px`,
        invalidateOnRefresh: true,
        onEnter: () => {
          if (i === 0) return;
          const w = card.offsetWidth;
          const h = card.offsetHeight;
          gsap
            .timeline()
            .to(card, { scaleX: (w + 24) / w, scaleY: (h - 8) / h, duration: 0.1, ease: "power1.out" })
            .to(card, { scaleX: 1, scaleY: 1, duration: 1, ease: "elastic.out(1, 0.4)" });
        },
      });
    });
    return () => triggers.forEach((t) => t.kill());
  }, []);

  return (
    <section className="stack" id={id} ref={root} data-theme-section="dark" aria-label={heading}>
      <div className="page stack-flow" style={{ ["--count" as string]: items.length }}>
        <div className="stack-intro">
          <Lines as="h2" className="t-display-xl">
            {heading}
          </Lines>
          <Reveal>
            <p className="t-h3">{intro}</p>
          </Reveal>
        </div>
        <ul className="stack-list">
          {items.map((it, i) => (
            <li className="stack-item" key={it.title} style={{ ["--i" as string]: i }}>
              <article className="stack-card">
                <span className="stack-num">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="t-display">{it.title}.</h3>
                <p className="t-h3">{it.text}</p>
              </article>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function Process() {
  return <StackCards id="process" heading="How we work." intro="One team from the first conversation to the hundredth order. Four steps, every time." items={PROCESS} />;
}

/* ---------------- melvo.fun feature ---------------- */

export function FunFeature() {
  return (
    <section className="feature" data-theme-section="dark" aria-label="melvo.fun">
      <div className="page">
        <Lines as="h2" className="t-display-xl">
          Learn by building.
        </Lines>
        <Reveal>
          <a href={SITE.funUrl} target="_blank" rel="noopener" className="feature-card">
            <div className="feature-art" aria-hidden="true">
              <Mark3D shape="learn" tone="paper" layers={18} follow={false} />
            </div>
            <span className="tag tag--haldi">melvo.fun</span>
            <span className="tag tag--ghost feature-tr">Courses · Workshops · Mentorship</span>
          </a>
          <div className="feature-copy">
            <span className="t-small accent">The learning platform</span>
            <p className="t-h3">
              Learn something. Build something. <span className="dim">Robotics, AI, coding and design, taught by making real projects with mentors from industry.</span>
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------------- CTA cards ---------------- */

export function CtaCards() {
  return (
    <section className="cta-cards" data-theme-section="dark" aria-label="Next steps">
      <Reveal className="page cta-grid" stagger={0.12}>
        <TransitionLink href="/about" className="cta-card cta-card--white">
          <span className="t-h4 accent">About.</span>
          <span className="t-display">Meet the team behind it.</span>
          <span className="circle" aria-hidden="true">
            →
          </span>
        </TransitionLink>
        <TransitionLink href="/contact" className="cta-card cta-card--paper">
          <span className="t-h4 accent">Contact.</span>
          <span className="t-display">Ready to talk?</span>
          <span className="circle" aria-hidden="true">
            →
          </span>
        </TransitionLink>
      </Reveal>
    </section>
  );
}
