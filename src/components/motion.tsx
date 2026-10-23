"use client";

import { createElement, useEffect, useRef, useState, type CSSProperties, type ElementType, type ReactNode } from "react";
import { gsap, ScrollTrigger, SplitText, prefersReducedMotion } from "@/lib/gsap";
import { FIROZI_INDEX, SHAPES, type ShapeName } from "@/lib/shapes";
import { useSite } from "./providers";

const fontsReady = () => (typeof document !== "undefined" && document.fonts ? document.fonts.ready : Promise.resolve());

type GroupProps = {
  as?: ElementType;
  className?: string;
  children: ReactNode;
  /** "ready" plays on page load (heroes); "scroll" plays when scrolled into view. */
  trigger?: "ready" | "scroll";
  start?: string;
  stagger?: number;
  delay?: number;
  id?: string;
  style?: CSSProperties;
};

/** Direct children rise and fade in, one after another. */
export function Reveal({ as = "div", className, children, trigger = "scroll", start = "top 82%", stagger = 0.1, delay = 0, id, style }: GroupProps) {
  const ref = useRef<HTMLElement>(null);
  const { ready } = useSite();
  const gate = trigger === "scroll" || ready;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const items = Array.from(el.children) as HTMLElement[];
    if (prefersReducedMotion()) {
      el.classList.add("is-in");
      return;
    }
    if (!gate) return;
    const ctx = gsap.context(() => {
      gsap.set(items, { y: "2em", autoAlpha: 0 });
      el.classList.add("is-in");
      const play = () =>
        gsap.to(items, { y: 0, autoAlpha: 1, duration: 1, stagger, delay, ease: "melvo", clearProps: "transform,opacity,visibility" });
      if (trigger === "ready") play();
      else ScrollTrigger.create({ trigger: el, start, once: true, onEnter: play });
    }, el);
    return () => ctx.revert();
  }, [trigger, start, stagger, delay, gate]);

  return createElement(as, { ref, className: `reveal${className ? ` ${className}` : ""}`, id, style }, children);
}

/** Masked line-by-line reveal for big type. Lines are re-joined afterwards so text reflows normally. */
export function Lines({ as = "div", className, children, trigger = "scroll", start = "top 85%", delay = 0, id, style }: GroupProps) {
  const ref = useRef<HTMLElement>(null);
  const { ready } = useSite();
  const gate = trigger === "scroll" || ready;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReducedMotion()) {
      el.classList.add("is-in");
      return;
    }
    if (!gate) return;
    let cancelled = false;
    let ctx: gsap.Context | undefined;
    fontsReady().then(() => {
      if (cancelled) return;
      ctx = gsap.context(() => {
        const split = SplitText.create(el, { type: "lines", mask: "lines", linesClass: "ln" } as SplitText.Vars);
        el.classList.add("is-in");
        const t = gsap.timeline({ paused: true, onComplete: () => split.revert() });
        t.from(split.lines, { yPercent: 110, stagger: 0.08, duration: 1.1, ease: "melvo", delay });
        if (trigger === "ready") t.play();
        else ScrollTrigger.create({ trigger: el, start, once: true, onEnter: () => t.play() });
      }, el);
    });
    return () => {
      cancelled = true;
      ctx?.revert();
    };
  }, [trigger, start, delay, gate]);

  return createElement(as, { ref, className: `lines${className ? ` ${className}` : ""}`, id, style }, children);
}

/** A word that swaps in place on a loop, with the slot resizing to fit. */
export function RotatingWords({ words, interval = 2.2, className }: { words: string[]; interval?: number; className?: string }) {
  const slot = useRef<HTMLSpanElement>(null);
  const [first] = useState(words[0]);

  useEffect(() => {
    const el = slot.current;
    if (!el || words.length < 2 || prefersReducedMotion()) return;
    const spans = Array.from(el.querySelectorAll<HTMLElement>(".rw"));
    let i = 0;
    let call: gsap.core.Tween | undefined;
    const ctx = gsap.context(() => {
      gsap.set(spans.slice(1), { yPercent: 120, autoAlpha: 0 });
      gsap.set(el, { width: spans[0].offsetWidth });
      const step = () => {
        const next = (i + 1) % spans.length;
        gsap.to(el, { width: spans[next].offsetWidth, duration: 0.75, ease: "power4.inOut" });
        gsap.to(spans[i], { yPercent: -120, autoAlpha: 0, duration: 0.6, ease: "power4.inOut" });
        gsap.fromTo(spans[next], { yPercent: 120, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 0.75, ease: "power4.inOut" });
        i = next;
        call = gsap.delayedCall(interval, step);
      };
      call = gsap.delayedCall(interval, step);
    }, el);
    const onResize = () => gsap.set(el, { width: spans[i].offsetWidth });
    window.addEventListener("resize", onResize);
    return () => {
      call?.kill();
      window.removeEventListener("resize", onResize);
      ctx.revert();
    };
  }, [words, interval]);

  return (
    <span className={`rotating${className ? ` ${className}` : ""}`} ref={slot}>
      <span className="sr-only">{first}</span>
      {words.map((w, i) => (
        <span className="rw" key={w} aria-hidden="true" style={i === 0 ? undefined : { position: "absolute", left: 0, top: 0 }}>
          {w}
        </span>
      ))}
    </span>
  );
}

/** Words go from faint to solid as the paragraph scrolls through the viewport. */
export function ScrubText({ children, className, as = "p" }: { children: string; className?: string; as?: ElementType }) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    let cancelled = false;
    let ctx: gsap.Context | undefined;
    fontsReady().then(() => {
      if (cancelled) return;
      ctx = gsap.context(() => {
        const split = SplitText.create(el, { type: "words", wordsClass: "w" });
        gsap.fromTo(
          split.words,
          { opacity: 0.18 },
          { opacity: 1, stagger: 0.1, ease: "none", scrollTrigger: { trigger: el, start: "top 80%", end: "bottom 50%", scrub: true } },
        );
      }, el);
    });
    return () => {
      cancelled = true;
      ctx?.revert();
    };
  }, []);
  return createElement(as, { ref, className }, children);
}

const TRAIL: { shape: ShapeName; bg: string; tone: "light" | "dark" }[] = [
  { shape: "learn", bg: "var(--green)", tone: "dark" },
  { shape: "brand", bg: "var(--paper)", tone: "light" },
  { shape: "sell", bg: "var(--ink)", tone: "dark" },
  { shape: "scale", bg: "var(--firozi)", tone: "light" },
  { shape: "m", bg: "var(--paper-2)", tone: "light" },
];

/** Tiles carrying the mark shapes spill out behind the pointer while it moves over the section. */
export function ShapeTrail({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const wrap = ref.current;
    if (!wrap || prefersReducedMotion() || !window.matchMedia("(pointer: fine) and (min-width: 1000px)").matches) return;
    const tiles = Array.from(wrap.querySelectorAll<HTMLElement>(".trail-tile"));
    const born = new Map<HTMLElement, number>();
    let idx = 0;
    let last = { x: -999, y: -999 };
    const hide = (t: HTMLElement) => gsap.to(t, { autoAlpha: 0, scale: 0, rotation: 200, duration: 0.7, ease: "power2.in" });
    const move = (e: MouseEvent) => {
      if ((e.target as Element).closest("a, button")) return;
      const r = wrap.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      if (Math.hypot(x - last.x, y - last.y) < window.innerWidth / 16) return;
      const t = tiles[idx % tiles.length];
      gsap.set(t, { left: x, top: y, zIndex: idx });
      gsap.fromTo(t, { autoAlpha: 0, scale: 0, rotation: -60 }, { autoAlpha: 1, scale: 1, rotation: [-12, 0, 12, 0][idx % 4], duration: 0.35, ease: "power3.out", overwrite: true });
      born.set(t, Date.now());
      const old = tiles[(idx - 5 + tiles.length * 10) % tiles.length];
      if (old !== t && born.has(old)) {
        hide(old);
        born.delete(old);
      }
      last = { x, y };
      idx++;
    };
    const sweep = window.setInterval(() => {
      const now = Date.now();
      born.forEach((at, t) => {
        if (now - at > 420) {
          hide(t);
          born.delete(t);
        }
      });
    }, 100);
    wrap.addEventListener("mousemove", move);
    return () => {
      wrap.removeEventListener("mousemove", move);
      window.clearInterval(sweep);
    };
  }, []);
  const tiles = Array.from({ length: 15 }, (_, i) => TRAIL[i % TRAIL.length]);
  return (
    <div className={`trail${className ? ` ${className}` : ""}`} ref={ref}>
      <div className="trail-layer" aria-hidden="true">
        {tiles.map((t, i) => (
          <div className="trail-tile" key={i} style={{ background: t.bg }}>
            <svg viewBox="-2 -2 104 84">
              {SHAPES[t.shape].map((p, j) => (
                <polygon key={j} points={p} fill={j === FIROZI_INDEX[t.shape] ? (t.bg === "var(--firozi)" ? "var(--ink)" : "var(--firozi)") : t.tone === "dark" ? "var(--paper)" : "var(--green)"} />
              ))}
            </svg>
          </div>
        ))}
      </div>
      {children}
    </div>
  );
}

/** Pulls its child toward the pointer. */
export function Magnetic({ children, strength = 0.3 }: { children: ReactNode; strength?: number }) {
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
    const leave = () => gsap.to(el, { x: 0, y: 0, duration: 1, ease: "elastic.out(1, .4)" });
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
