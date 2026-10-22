"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, ScrollTrigger, prefersReducedMotion } from "@/lib/gsap";
import { CAPABILITIES, FAQ, INTRO_STATEMENT, PROCESS, SITE, WAYS_TO_START, type Capability } from "@/lib/content";
import type { ShapeName } from "@/lib/shapes";
import { Mark } from "./Mark";
import { Magnetic, Reveal, ScrubText } from "./motion";
import { useSite } from "./providers";
import { TransitionLink } from "./TransitionLink";

/* ---------------- Hero ---------------- */

const HERO_CYCLE: ShapeName[] = ["learn", "brand", "sell", "scale", "m"];

export function Hero() {
  const { ready } = useSite();
  const [shape, setShape] = useState<ShapeName>("m");
  const [key, setKey] = useState("Learn · Brand · Sell · Scale");
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!ready || prefersReducedMotion()) return;
    let i = 0;
    const names = ["01 / Learn", "02 / Brand", "03 / Sell", "04 / Scale", "Learn · Brand · Sell · Scale"];
    const id = window.setInterval(() => {
      setShape(HERO_CYCLE[i % HERO_CYCLE.length]);
      setKey(names[i % names.length]);
      i++;
    }, 2200);
    return () => window.clearInterval(id);
  }, [ready]);

  useEffect(() => {
    const el = root.current;
    if (!el || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.to(".headline", { yPercent: -18, ease: "none", scrollTrigger: { trigger: el, start: "top top", end: "bottom top", scrub: true } });
    }, el);
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    const el = root.current;
    if (!el || !ready || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(".fade-in", { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 1.2, stagger: 0.08, ease: "expo.out", delay: 0.6 });
    }, el);
    return () => ctx.revert();
  }, [ready]);

  return (
    <section className="hero container" ref={root}>
      <div className="meta">
        <span className="label muted fade-in">Education × Commerce × Creativity × Technology</span>
        <span className="label muted fade-in">melvo.in</span>
      </div>
      <div className="headline">
        <Reveal as="h1" className="t-hero" trigger="ready" delay={0.1}>
          {SITE.hero.line1}
          <br />
          {SITE.hero.line2a} <span className="em">{SITE.hero.line2em}</span> {SITE.hero.line2b}
          <span className="dot" />
        </Reveal>
      </div>
      <div className="bottom">
        <div className="fade-in">
          <p className="sub">{SITE.heroSub}</p>
          <div className="actions">
            <Magnetic>
              <TransitionLink href="/contact" className="btn">
                Start a project <span className="arrow">→</span>
              </TransitionLink>
            </Magnetic>
            <Magnetic>
              <a href={SITE.funUrl} target="_blank" rel="noopener" className="btn btn--ghost">
                Learn on melvo.fun <span className="arrow">↗</span>
              </a>
            </Magnetic>
          </div>
        </div>
        <a href="#intro" className="scroll fade-in" onClick={(e) => { e.preventDefault(); document.getElementById("intro")?.scrollIntoView({ behavior: "smooth" }); }}>
          <span className="track" />
          <span className="label muted">Scroll</span>
        </a>
        <div className="mark-wrap fade-in">
          <Mark shape={shape} title="MELVO mark" />
          <span className="label muted">{key}</span>
        </div>
      </div>
    </section>
  );
}

/* ---------------- Intro ---------------- */

export function Intro() {
  return (
    <section className="section intro container" id="intro">
      <div className="meta">
        <span className="dot" style={{ fontSize: 48, margin: 0 }} />
        <span className="label muted">Why MELVO</span>
      </div>
      <ScrubText className="t-statement">{INTRO_STATEMENT}</ScrubText>
    </section>
  );
}

/* ---------------- Vignettes ---------------- */

export function Vignette({ cap }: { cap: Capability }) {
  return (
    <div className="scene" aria-hidden="true">
      <div className="grid-bg" />
      <span className="tag label">{cap.index} / {cap.verb}</span>
      <Mark shape={cap.shape} tone="dark" className="shape" />
      {cap.vignette === "course" && (
        <div className="vcard">
          <span className="label">melvo.fun · Robotics 101</span>
          <b>Module 4 of 6: Sensors</b>
          <div className="steps">{[1, 1, 1, 1, 0, 0].map((on, i) => <i key={i} className={on ? "on" : ""} />)}</div>
          <div className="meter"><i /></div>
          <span className="label">Next: build the line follower</span>
        </div>
      )}
      {cap.vignette === "identity" && (
        <div className="vcard">
          <span className="label">Identity system · v1</span>
          <span className="brandword">YOUR BRAND</span>
          <div className="chips"><i style={{ background: "#E9AE36" }} /><i style={{ background: "#1E2A38" }} /><i style={{ background: "#F7F3EA", outline: "1px solid rgba(0,0,0,.1)" }} /></div>
          <span className="label">Logo · Colour · Type · Voice</span>
        </div>
      )}
      {cap.vignette === "listing" && (
        <div className="vcard">
          <span className="label">Marketplace listing · A+ content</span>
          <b>Your product, photographed and listed</b>
          <span className="stars">★★★★★</span>
          <span className="price">₹1,499</span>
          <span className="buy">Add to cart</span>
        </div>
      )}
      {cap.vignette === "dashboard" && (
        <div className="vcard">
          <span className="label">Operations · this week</span>
          <b>Orders <span className="up">▲ live</span></b>
          <div className="bars">{[30, 44, 38, 56, 52, 70, 76, 100].map((h, i) => <i key={i} style={{ height: `${h}%` }} />)}</div>
          <span className="label">Stock synced · automated</span>
        </div>
      )}
    </div>
  );
}

/* ---------------- Pinned capabilities ---------------- */

export function Capabilities() {
  const root = useRef<HTMLElement>(null);
  const st = useRef<ScrollTrigger | null>(null);
  const [active, setActive] = useState(0);
  const { lenis } = useSite();

  useEffect(() => {
    const el = root.current!;
    const mm = gsap.matchMedia();
    mm.add("(min-width: 1000px) and (prefers-reduced-motion: no-preference)", () => {
      el.classList.add("is-pinned");
      const caps = gsap.utils.toArray<HTMLElement>(".cap", el);
      const bars = gsap.utils.toArray<HTMLElement>(".progress .bar i", el);
      gsap.set(caps.slice(1), { autoAlpha: 0 });
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: el,
          start: "top top",
          end: () => `+=${window.innerHeight * 3.2}`,
          pin: ".pin",
          scrub: 0.6,
          onUpdate: (self) => setActive(Math.min(3, Math.floor(self.progress * 4))),
        },
      });
      st.current = tl.scrollTrigger ?? null;
      caps.forEach((c, i) => {
        tl.to(bars[i], { scaleX: 1, duration: 1 }, i);
        if (i === 0) return;
        const prev = caps[i - 1];
        tl.to(prev.querySelectorAll(".text > *"), { y: -60, autoAlpha: 0, stagger: 0.03, duration: 0.3 }, i - 0.15)
          .to(prev.querySelector(".scene"), { clipPath: "inset(0 0 100% 0)", duration: 0.35 }, i - 0.15)
          .set(prev, { autoAlpha: 0 }, i + 0.2)
          .set(c, { autoAlpha: 1 }, i - 0.15)
          .fromTo(c.querySelectorAll(".text > *"), { y: 80, autoAlpha: 0 }, { y: 0, autoAlpha: 1, stagger: 0.03, duration: 0.3 }, i)
          .fromTo(c.querySelector(".scene"), { clipPath: "inset(100% 0 0 0)" }, { clipPath: "inset(0% 0 0 0)", duration: 0.35 }, i - 0.05);
      });
      return () => {
        el.classList.remove("is-pinned");
        st.current = null;
      };
    });
    return () => mm.revert();
  }, []);

  const jump = (i: number) => {
    const s = st.current;
    if (!s) return;
    const y = s.start + (s.end - s.start) * (i / 4) + 2;
    lenis.current ? lenis.current.scrollTo(y, { duration: 1.4 }) : window.scrollTo({ top: y, behavior: "smooth" });
  };

  return (
    <section className="caps is-dark" ref={root} data-header="dark" aria-label="Capabilities">
      <div className="pin container">
        <div className="top">
          <div>
            <span className="label muted">What we do</span>
            <Reveal as="h2" className="t-h2">
              Four capabilities. <span className="em" style={{ color: "var(--firozi)" }}>One system.</span>
            </Reveal>
          </div>
          <div className="progress" role="tablist" aria-label="Capabilities">
            {CAPABILITIES.map((c, i) => (
              <button key={c.slug} type="button" role="tab" aria-selected={active === i} className={active === i ? "on" : ""} onClick={() => jump(i)}>
                <span className="bar"><i /></span>
                <span className="label">{c.verb}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="stage">
          {CAPABILITIES.map((c) => (
            <article className="cap" key={c.slug}>
              <div className="text">
                <span className="label muted">{c.index} / {c.name}</span>
                <h3 className="verb">{c.verb}</h3>
                <p className="name">{c.headline} {c.headlineEm}</p>
                <p>{c.summary}</p>
                <div className="services">{c.services.slice(0, 5).map((s) => <span key={s.title}>{s.title}</span>)}</div>
                <TransitionLink href={`/${c.slug}`} className="btn btn--light go" data-cursor="Explore">
                  Explore {c.verb} <span className="arrow">→</span>
                </TransitionLink>
              </div>
              <Vignette cap={c} />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- Ways to start (horizontal) ---------------- */

export function Ways() {
  const root = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = root.current!;
    const mm = gsap.matchMedia();
    mm.add("(min-width: 1000px) and (prefers-reduced-motion: no-preference)", () => {
      const track = el.querySelector<HTMLElement>(".track")!;
      const pin = el.querySelector<HTMLElement>(".ways-pin")!;
      const dist = () => track.scrollWidth - track.clientWidth;
      gsap.to(track, {
        x: () => -dist(),
        ease: "none",
        scrollTrigger: { trigger: pin, start: "top top", end: () => `+=${dist()}`, pin, scrub: 0.8, invalidateOnRefresh: true },
      });
    });
    return () => mm.revert();
  }, []);
  return (
    <section className="ways" ref={root} aria-label="Ways to start">
      <div className="container ways-pin">
        <div className="head">
          <div>
            <span className="label muted">Ways to start</span>
            <Reveal as="h2" className="t-display">
              Start <span className="em" style={{ color: "var(--green)" }}>small.</span> Grow from there.
            </Reveal>
          </div>
          <p className="t-lead muted" style={{ maxWidth: "30ch" }}>Pick one way in. Everything else connects when you need it.</p>
        </div>
        <div className="track">
          {WAYS_TO_START.map((w, i) => (
            <TransitionLink href="/contact" className="way" key={w.title} data-cursor="Start">
              <div className="row">
                <span className="label muted">{w.verb}</span>
                <span className="label muted">{w.time}</span>
              </div>
              <span className="num">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="t-h3">{w.title}</h3>
              <p className="muted">{w.text}</p>
            </TransitionLink>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- Process (stacking) ---------------- */

export function Process({ title = true }: { title?: boolean }) {
  const root = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = root.current!;
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const cards = gsap.utils.toArray<HTMLElement>(".pcard", el);
      cards.slice(0, -1).forEach((c, i) => {
        gsap.to(c, {
          scale: 0.94,
          filter: "brightness(.9)",
          ease: "none",
          scrollTrigger: { trigger: cards[i + 1], start: "top bottom", end: "top 20%", scrub: true },
        });
      });
    });
    return () => mm.revert();
  }, []);
  return (
    <section className="section process container" ref={root} aria-label="How we work">
      {title && (
        <div className="sec-head">
          <span className="label muted">How we work</span>
          <Reveal as="h2" className="t-display">
            One team. <span className="em" style={{ color: "var(--green)" }}>Four</span> steps.
          </Reveal>
        </div>
      )}
      <div className="stack">
        {PROCESS.map((p, i) => (
          <article className="pcard" key={p.title} style={{ zIndex: i + 1 }}>
            <span className="idx">{String(i + 1).padStart(2, "0")} / {String(PROCESS.length).padStart(2, "0")}</span>
            <h3>{p.title}</h3>
            <p>{p.text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

/* ---------------- Paths ---------------- */

export function Paths() {
  return (
    <section className="section paths container" aria-label="Where to start">
      <div className="sec-head">
        <span className="label muted">Two ways in</span>
        <Reveal as="h2" className="t-display">
          Where do you <span className="em" style={{ color: "var(--green)" }}>start?</span>
        </Reveal>
      </div>
      <div className="grid">
        <TransitionLink href="/contact" className="path" data-cursor="Let's talk">
          <div className="top">
            <span className="label">melvo.in</span>
            <span className="label muted">Businesses · Founders · Institutions</span>
          </div>
          <h3>
            Build the brand, the store and the <span className="em">software.</span>
          </h3>
          <ul>
            <li><span>Brand strategy and identity</span><span className="label muted">Brand</span></li>
            <li><span>Amazon and storefront setup</span><span className="label muted">Sell</span></li>
            <li><span>Apps, dashboards and automation</span><span className="label muted">Scale</span></li>
            <li><span>Training for your team</span><span className="label muted">Learn</span></li>
          </ul>
          <span className="go">Start a project <span className="arrow">→</span></span>
        </TransitionLink>
        <a href={SITE.funUrl} target="_blank" rel="noopener" className="path" data-cursor="Open ↗">
          <div className="top">
            <span className="fun">melvo<i />fun</span>
            <span className="label muted">Students · Learners · Schools</span>
          </div>
          <h3>
            Learn something. Build <span className="em">something.</span>
          </h3>
          <ul>
            <li><span>Robotics and electronics</span><span className="label muted">Workshop</span></li>
            <li><span>AI and machine learning</span><span className="label muted">Course</span></li>
            <li><span>One-to-one mentorship</span><span className="label muted">Program</span></li>
            <li><span>Programs for schools and colleges</span><span className="label muted">Institutional</span></li>
          </ul>
          <span className="go">Explore melvo.fun <span className="arrow">↗</span></span>
        </a>
      </div>
    </section>
  );
}

/* ---------------- FAQ ---------------- */

export function Faq() {
  return (
    <section className="section faq container" style={{ paddingTop: 0 }} aria-label="Questions">
      <div className="sec-head">
        <span className="label muted">Questions</span>
        <Reveal as="h2" className="t-h2">Good to know.</Reveal>
      </div>
      <div className="list">
        {FAQ.map((f) => (
          <details key={f.q}>
            <summary>
              <h3 className="t-h3">{f.q}</h3>
              <span className="plus" aria-hidden="true" />
            </summary>
            <p className="answer">{f.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

/* ---------------- CTA ---------------- */

export function CtaBand({ title, em }: { title?: string; em?: string }) {
  return (
    <section className="cta-band is-dark" data-header="dark" aria-label="Get in touch">
      <div className="container">
        <span className="label muted">Next step</span>
        <Reveal as="h2" className="t-hero">
          {title ?? "Bring the idea."}
          <br />
          <span className="em">{em ?? "We'll bring the rest."}</span>
        </Reveal>
        <div className="actions">
          <Magnetic>
            <TransitionLink href="/contact" className="btn btn--light">
              Start a project <span className="arrow">→</span>
            </TransitionLink>
          </Magnetic>
          <Magnetic>
            <a href={`mailto:${SITE.email}`} className="btn btn--ghost">
              {SITE.email}
            </a>
          </Magnetic>
        </div>
      </div>
    </section>
  );
}
