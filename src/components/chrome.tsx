"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { NAV, SITE } from "@/lib/content";
import type { ShapeName } from "@/lib/shapes";
import { Logo } from "./Logo";
import { Mark } from "./Mark";
import { Magnetic } from "./motion";
import { useSite } from "./providers";
import { TransitionLink } from "./TransitionLink";

/* ---------------- Preloader ---------------- */

const LOAD_KEY = "melvo-loaded";
const SEQUENCE: ShapeName[] = ["m", "learn", "brand", "sell", "scale", "m"];

export function Preloader() {
  const { setReady } = useSite();
  const root = useRef<HTMLDivElement>(null);
  const [shape, setShape] = useState<ShapeName>("m");
  const [count, setCount] = useState(0);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem(LOAD_KEY) === "1";
    } catch {}
    if (seen || prefersReducedMotion()) {
      setGone(true);
      setReady(true);
      return;
    }
    const el = root.current!;
    const counter = { v: 0 };
    const tl = gsap.timeline();
    tl.to(counter, {
      v: 100,
      duration: 1.8,
      ease: "power2.inOut",
      onUpdate: () => {
        const v = Math.round(counter.v);
        setCount(v);
        setShape(SEQUENCE[Math.min(SEQUENCE.length - 1, Math.floor((v / 100) * SEQUENCE.length))]);
      },
    })
      .to(el.querySelectorAll(".center > *"), { autoAlpha: 0, y: -20, duration: 0.4, stagger: 0.05, ease: "power2.in" }, "+=0.15")
      .add(() => setReady(true))
      .to(el.querySelectorAll(".panel"), { yPercent: -100, duration: 1, stagger: 0.07, ease: "power4.inOut" }, "<")
      .add(() => {
        setGone(true);
        try {
          sessionStorage.setItem(LOAD_KEY, "1");
        } catch {}
      });
    return () => {
      tl.kill();
    };
  }, [setReady]);

  if (gone) return null;
  return (
    <div className="preloader" ref={root} aria-hidden="true">
      <i className="panel" />
      <i className="panel" />
      <i className="panel" />
      <i className="panel" />
      <div className="center">
        <Mark shape={shape} tone="dark" duration={0.5} />
        <div className="line">
          <span>Thought of it?</span>
        </div>
        <span className="count">{String(count).padStart(3, "0")}</span>
      </div>
    </div>
  );
}

/* ---------------- Page curtain ---------------- */

export function Curtain() {
  const { registerCurtain } = useSite();
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const panels = () => ref.current?.querySelectorAll("i") ?? [];
    registerCurtain({
      cover: () =>
        new Promise((resolve) => {
          gsap.fromTo(panels(), { yPercent: 100 }, { yPercent: 0, duration: 0.7, stagger: 0.06, ease: "power4.inOut", onComplete: () => resolve() });
        }),
      reveal: () =>
        new Promise((resolve) => {
          gsap.to(panels(), {
            yPercent: -100,
            duration: 0.8,
            stagger: 0.06,
            ease: "power4.inOut",
            delay: 0.1,
            onComplete: () => {
              gsap.set(panels(), { yPercent: 100 });
              resolve();
            },
          });
        }),
    });
  }, [registerCurtain]);
  return (
    <div className="curtain" ref={ref} aria-hidden="true">
      <i />
      <i />
      <i />
      <i />
    </div>
  );
}

/* ---------------- Cursor ---------------- */

export function Cursor() {
  const ref = useRef<HTMLDivElement>(null);
  const [tag, setTag] = useState("");
  useEffect(() => {
    const el = ref.current;
    if (!el || !window.matchMedia("(pointer: fine)").matches || prefersReducedMotion()) return;
    const xTo = gsap.quickTo(el, "x", { duration: 0.35, ease: "power3.out" });
    const yTo = gsap.quickTo(el, "y", { duration: 0.35, ease: "power3.out" });
    const move = (e: PointerEvent) => {
      xTo(e.clientX);
      yTo(e.clientY);
      el.classList.add("is-live");
    };
    const leaveDoc = () => el.classList.remove("is-live");
    document.documentElement.addEventListener("pointerleave", leaveDoc);
    const over = (e: PointerEvent) => {
      const t = e.target as HTMLElement;
      const labelled = t.closest<HTMLElement>("[data-cursor]");
      setTag(labelled?.dataset.cursor ?? "");
      el.classList.toggle("has-tag", !!labelled);
      el.classList.toggle("is-link", !labelled && !!t.closest("a, button, summary, label"));
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerover", over);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerover", over);
      document.documentElement.removeEventListener("pointerleave", leaveDoc);
    };
  }, []);
  return (
    <div className="cursor" ref={ref} aria-hidden="true">
      <div className="sq" />
      <div className="tag">{tag}</div>
    </div>
  );
}

/* ---------------- Header ---------------- */

export function Header() {
  const { menuOpen, setMenuOpen } = useSite();
  const pathname = usePathname();
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current!;
    let last = window.scrollY;
    const probe = 34;
    const update = () => {
      const y = window.scrollY;
      const down = y > last;
      el.classList.toggle("is-hidden", down && y > 160 && !document.documentElement.classList.contains("menu-open"));
      last = y;
      let dark = false;
      document.querySelectorAll<HTMLElement>("[data-header='dark']").forEach((s) => {
        const r = s.getBoundingClientRect();
        if (r.top <= probe && r.bottom >= probe) dark = true;
      });
      el.classList.toggle("on-dark", dark);
    };
    update();
    const t = window.setTimeout(update, 400);
    window.addEventListener("scroll", update, { passive: true });
    return () => {
      window.removeEventListener("scroll", update);
      window.clearTimeout(t);
    };
  }, [pathname]);

  useEffect(() => {
    document.documentElement.classList.toggle("menu-open", menuOpen);
    if (menuOpen) ref.current?.classList.remove("is-hidden");
  }, [menuOpen]);

  return (
    <header className="site-header" ref={ref}>
      <div className="container bar">
        <TransitionLink href="/" className="logo" aria-label="MELVO home">
          <Logo />
        </TransitionLink>
        <div className="right">
          <span className="cta-btn">
            <Magnetic>
              <TransitionLink href="/contact" className="btn btn--sm">
                Start a project <span className="arrow">→</span>
              </TransitionLink>
            </Magnetic>
          </span>
          <Magnetic strength={0.25}>
            <button type="button" className="menu-btn" aria-expanded={menuOpen} aria-controls="site-menu" onClick={() => setMenuOpen(!menuOpen)}>
              <span>{menuOpen ? "Close" : "Menu"}</span>
              <span className="bars" aria-hidden="true">
                <i />
                <i />
              </span>
            </button>
          </Magnetic>
        </div>
      </div>
    </header>
  );
}

/* ---------------- Menu ---------------- */

export function Menu() {
  const { menuOpen, setMenuOpen } = useSite();
  const pathname = usePathname();
  const ref = useRef<HTMLDivElement>(null);
  const tl = useRef<gsap.core.Timeline | null>(null);
  const [shape, setShape] = useState<ShapeName>("m");

  useEffect(() => {
    const el = ref.current!;
    tl.current = gsap
      .timeline({ paused: true, onReverseComplete: () => el.classList.remove("is-open") })
      .to(el.querySelectorAll(".panels i"), { scaleY: 1, duration: 0.8, stagger: 0.05, ease: "power4.inOut" })
      .fromTo(el.querySelectorAll("nav a"), { yPercent: 110 }, { yPercent: 0, duration: 1, stagger: 0.05, ease: "expo.out" }, "-=0.35")
      .fromTo(el.querySelectorAll(".fade"), { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.05, ease: "expo.out" }, "<0.1");
    return () => {
      tl.current?.kill();
    };
  }, []);

  useEffect(() => {
    const el = ref.current!;
    if (menuOpen) {
      el.classList.add("is-open");
      tl.current?.timeScale(1).play();
    } else if (tl.current && tl.current.progress() > 0) {
      tl.current.timeScale(1.6).reverse();
    }
  }, [menuOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setMenuOpen]);

  return (
    <div className="menu" id="site-menu" ref={ref} aria-hidden={!menuOpen}>
      <div className="panels">
        <i />
        <i />
        <i />
        <i />
      </div>
      <div className="container inner">
        <div className="cols">
          <nav aria-label="Main">
            <ul>
              {NAV.map((n, i) => (
                <li key={n.href}>
                  <TransitionLink
                    href={n.href}
                    className={pathname === n.href ? "is-active" : undefined}
                    tabIndex={menuOpen ? 0 : -1}
                    onPointerEnter={() => setShape(n.shape)}
                    onFocus={() => setShape(n.shape)}
                    onPointerLeave={() => setShape("m")}
                  >
                    <span className="n">{String(i + 1).padStart(2, "0")}</span>
                    {n.label}
                  </TransitionLink>
                </li>
              ))}
            </ul>
          </nav>
          <div className="mark-box fade">
            <Mark shape={shape} tone="dark" />
            <span className="label muted">Learn · Brand · Sell · Scale</span>
          </div>
        </div>
        <div className="foot fade">
          <a href={SITE.funUrl} target="_blank" rel="noopener" className="label" tabIndex={menuOpen ? 0 : -1}>
            melvo.fun ↗
          </a>
          <a href={`mailto:${SITE.email}`} className="label" tabIndex={menuOpen ? 0 : -1}>
            {SITE.email}
          </a>
          <span className="label muted">Thought of it? Let&apos;s build it.</span>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Footer ---------------- */

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="site-footer" data-header="dark">
      <div className="container">
        <div className="cols">
          <div>
            <p className="lead">
              Thought of it? <span className="em">Let&apos;s build it.</span>
            </p>
            <Magnetic>
              <TransitionLink href="/contact" className="btn btn--light">
                Start a project <span className="arrow">→</span>
              </TransitionLink>
            </Magnetic>
          </div>
          <div>
            <h4 className="label muted">Capabilities</h4>
            <ul>
              {NAV.slice(0, 4).map((n) => (
                <li key={n.href}>
                  <TransitionLink href={n.href} className="link-u">
                    {n.label}
                  </TransitionLink>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="label muted">Company</h4>
            <ul>
              <li>
                <TransitionLink href="/about" className="link-u">
                  About
                </TransitionLink>
              </li>
              <li>
                <TransitionLink href="/contact" className="link-u">
                  Contact
                </TransitionLink>
              </li>
              <li>
                <a href={SITE.funUrl} target="_blank" rel="noopener" className="link-u">
                  melvo.fun ↗
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="label muted">Say hello</h4>
            <ul>
              <li>
                <a href={`mailto:${SITE.email}`} className="link-u">
                  {SITE.email}
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="giant" aria-hidden="true">
          <Logo withMark={false} />
        </div>
        <div className="legal">
          <span className="label">© {year} MELVO</span>
          <span className="label">Learn something. Build something.</span>
        </div>
      </div>
    </footer>
  );
}
