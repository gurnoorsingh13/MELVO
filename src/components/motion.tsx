"use client";

import { createElement, useEffect, useRef, type ElementType, type ReactNode } from "react";
import { gsap, ScrollTrigger, SplitText, prefersReducedMotion } from "@/lib/gsap";
import { useSite } from "./providers";

const fontsReady = () => (typeof document !== "undefined" && document.fonts ? document.fonts.ready : Promise.resolve());

type RevealProps = {
  as?: ElementType;
  className?: string;
  children: ReactNode;
  /** "ready" plays once the page is revealed (heroes); "scroll" plays when scrolled into view. */
  trigger?: "ready" | "scroll";
  delay?: number;
  id?: string;
};

/** Masked line-by-line reveal. Lines are re-joined after the animation so text reflows normally. */
export function Reveal({ as = "div", className, children, trigger = "scroll", delay = 0, id }: RevealProps) {
  const ref = useRef<HTMLElement>(null);
  const tl = useRef<gsap.core.Timeline | null>(null);
  const { ready } = useSite();
  const readyRef = useRef(ready);
  const mountedAfterLoad = useRef(ready);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    let cancelled = false;
    let ctx: gsap.Context | undefined;
    fontsReady().then(() => {
      if (cancelled) return;
      ctx = gsap.context(() => {
        const split = SplitText.create(el, { type: "lines", mask: "lines", linesClass: "line", maskClass: "line-mask" } as SplitText.Vars);
        const extra = trigger === "ready" && mountedAfterLoad.current ? 0.55 : 0;
        const t = gsap.timeline({ paused: true, onComplete: () => split.revert() });
        t.from(split.lines, { yPercent: 115, stagger: 0.085, duration: 1.3, ease: "expo.out", delay: delay + extra });
        tl.current = t;
        if (trigger === "scroll") {
          ScrollTrigger.create({ trigger: el, start: "top 88%", once: true, onEnter: () => t.play() });
        } else if (readyRef.current) {
          t.play();
        }
      }, el);
    });
    return () => {
      cancelled = true;
      ctx?.revert();
    };
  }, [trigger, delay]);

  useEffect(() => {
    readyRef.current = ready;
    if (ready && trigger === "ready") tl.current?.play();
  }, [ready, trigger]);

  return createElement(as, { ref, className, id }, children);
}

/** Fade/rise for non-text blocks. */
export function Rise({ children, className, delay = 0, as = "div" }: { children: ReactNode; className?: string; delay?: number; as?: ElementType }) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.from(el, { y: 60, autoAlpha: 0, duration: 1.4, delay, ease: "expo.out", scrollTrigger: { trigger: el, start: "top 90%", once: true } });
    }, el);
    return () => ctx.revert();
  }, [delay]);
  return createElement(as, { ref, className }, children);
}

/** Words light up as the paragraph scrolls through the viewport. */
export function ScrubText({ children, className }: { children: string; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReducedMotion()) return;
    let cancelled = false;
    let ctx: gsap.Context | undefined;
    fontsReady().then(() => {
      if (cancelled) return;
      ctx = gsap.context(() => {
        const split = SplitText.create(el, { type: "words", wordsClass: "w" });
        gsap.fromTo(
          split.words,
          { opacity: 0.14 },
          { opacity: 1, stagger: 0.1, ease: "none", scrollTrigger: { trigger: el, start: "top 78%", end: "bottom 42%", scrub: true } },
        );
      }, el);
    });
    return () => {
      cancelled = true;
      ctx?.revert();
    };
  }, []);
  return (
    <p ref={ref} className={className}>
      {children}
    </p>
  );
}

/** Infinite marquee that speeds up and flips with scroll velocity. */
export function Marquee({ items }: { items: ReactNode[] }) {
  const row = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = row.current;
    if (!el || prefersReducedMotion()) return;
    let x = 0;
    let dir = -1;
    let boost = 0;
    const st = ScrollTrigger.create({
      trigger: el,
      start: "top bottom",
      end: "bottom top",
      onUpdate: (self) => {
        dir = self.direction === 1 ? -1 : 1;
        boost = Math.min(Math.abs(self.getVelocity()) / 220, 9);
      },
    });
    const tick = () => {
      const half = el.scrollWidth / 2;
      x += dir * (0.6 + boost);
      boost *= 0.94;
      if (x <= -half) x += half;
      if (x > 0) x -= half;
      el.style.transform = `translate3d(${x}px,0,0)`;
    };
    gsap.ticker.add(tick);
    return () => {
      gsap.ticker.remove(tick);
      st.kill();
    };
  }, []);
  const set = items.map((it, i) => (
    <span className="item" key={i}>
      {it}
    </span>
  ));
  return (
    <div className="marquee" aria-hidden="true">
      <div className="row" ref={row}>
        {set}
        {set}
      </div>
    </div>
  );
}

/** Pulls its child toward the pointer. */
export function Magnetic({ children, strength = 0.35 }: { children: ReactNode; strength?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion() || !window.matchMedia("(pointer: fine)").matches) return;
    const xTo = gsap.quickTo(el, "x", { duration: 0.6, ease: "power3.out" });
    const yTo = gsap.quickTo(el, "y", { duration: 0.6, ease: "power3.out" });
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      xTo((e.clientX - (r.left + r.width / 2)) * strength);
      yTo((e.clientY - (r.top + r.height / 2)) * strength);
    };
    const leave = () => {
      gsap.to(el, { x: 0, y: 0, duration: 1, ease: "elastic.out(1, .4)" });
    };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    return () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
    };
  }, [strength]);
  return (
    <span ref={ref} style={{ display: "inline-block" }}>
      {children}
    </span>
  );
}
