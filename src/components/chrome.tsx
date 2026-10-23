"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { gsap, ScrollTrigger, prefersReducedMotion } from "@/lib/gsap";
import { CAPABILITIES, NAV, SITE } from "@/lib/content";
import type { ShapeName } from "@/lib/shapes";
import { Logo } from "./Logo";
import { Mark } from "./Mark";
import { Magnetic } from "./motion";
import { useSite } from "./providers";
import { TransitionLink } from "./TransitionLink";

/* ---------------- Page curtain ---------------- */

export function Curtain() {
  const { registerCurtain } = useSite();
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current!;
    const mark = el.querySelector(".curtain-mark");
    registerCurtain({
      cover: () =>
        new Promise((resolve) => {
          gsap
            .timeline({ onComplete: () => resolve() })
            .set(el, { visibility: "visible" })
            .fromTo(el, { clipPath: "inset(100% 0 0 0 round 24px 24px 0 0)" }, { clipPath: "inset(0% 0 0 0 round 0px 0px 0 0)", duration: 0.75, ease: "melvo" })
            .fromTo(mark, { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.5, ease: "melvo" }, "-=0.35");
        }),
      reveal: () =>
        new Promise((resolve) => {
          gsap
            .timeline({ onComplete: () => resolve() })
            .to(mark, { autoAlpha: 0, y: -30, duration: 0.4, ease: "power2.in" })
            .to(el, { clipPath: "inset(0 0 100% 0 round 0 0 24px 24px)", duration: 0.8, ease: "melvo" }, "-=0.1")
            .set(el, { visibility: "hidden" });
        }),
    });
  }, [registerCurtain]);
  return (
    <div className="curtain" ref={ref} aria-hidden="true">
      <Mark className="curtain-mark" tone="dark" />
    </div>
  );
}

/* ---------------- Progressive blur under the header ---------------- */

export function EdgeBlur() {
  return (
    <div className="edge-blur" aria-hidden="true">
      <i className="l1" />
      <i className="l2" />
      <i className="l3" />
    </div>
  );
}

/* ---------------- Header ---------------- */

export function Header() {
  const { menuOpen, setMenuOpen } = useSite();
  const pathname = usePathname();

  useEffect(() => {
    document.documentElement.classList.toggle("menu-open", menuOpen);
  }, [menuOpen]);

  return (
    <header className="site-header">
      <div className="bar">
        <TransitionLink href="/" className="logo" aria-label="MELVO home">
          <Logo />
        </TransitionLink>
        <nav className="nav" aria-label="Main">
          {NAV.map((n) => (
            <TransitionLink key={n.href} href={n.href} className={`nav-link${pathname === n.href ? " is-active" : ""}`}>
              <span data-text={n.label}>{n.label}</span>
            </TransitionLink>
          ))}
        </nav>
        <div className="right">
          <Magnetic strength={0.2}>
            <TransitionLink href="/contact" className="pill pill--cta">
              <span className="pill-fill" />
              <span className="pill-text" data-text="Let's talk">
                Let&apos;s talk
              </span>
            </TransitionLink>
          </Magnetic>
          <button type="button" className="pill menu-btn" aria-expanded={menuOpen} aria-controls="site-menu" onClick={() => setMenuOpen(!menuOpen)}>
            <span className="pill-text">{menuOpen ? "Close" : "Menu"}</span>
          </button>
        </div>
      </div>
    </header>
  );
}

/* ---------------- Menu (small screens) ---------------- */

export function Menu() {
  const { menuOpen, setMenuOpen } = useSite();
  const pathname = usePathname();
  const ref = useRef<HTMLDivElement>(null);
  const tl = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    const el = ref.current!;
    tl.current = gsap
      .timeline({ paused: true, onReverseComplete: () => el.classList.remove("is-open") })
      .fromTo(el.querySelector(".sheet"), { clipPath: "inset(0 0 100% 0 round 20px)" }, { clipPath: "inset(0 0 0% 0 round 20px)", duration: 0.7, ease: "melvo" })
      .fromTo(el.querySelectorAll(".sheet li, .sheet .foot"), { y: 40, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.7, stagger: 0.05, ease: "melvo" }, "-=0.35");
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
      tl.current.timeScale(1.5).reverse();
    }
  }, [menuOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setMenuOpen]);

  return (
    <div className="menu" id="site-menu" ref={ref} aria-hidden={!menuOpen}>
      <div className="sheet">
        <ul>
          {[...NAV, { href: "/contact", label: "Contact" }].map((n) => (
            <li key={n.href}>
              <TransitionLink href={n.href} className={pathname === n.href ? "is-active" : undefined} tabIndex={menuOpen ? 0 : -1}>
                {n.label}.
              </TransitionLink>
            </li>
          ))}
        </ul>
        <div className="foot">
          <a href={SITE.funUrl} target="_blank" rel="noopener" tabIndex={menuOpen ? 0 : -1}>
            melvo.fun ↗
          </a>
          <a href={`mailto:${SITE.email}`} tabIndex={menuOpen ? 0 : -1}>
            {SITE.email}
          </a>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Floating card ---------------- */

const CYCLE: ShapeName[] = ["learn", "brand", "sell", "scale"];

/** A small card that stays in the corner, cycling through the four capabilities. */
export function FloatCard() {
  const ref = useRef<HTMLAnchorElement>(null);
  const [i, setI] = useState(0);
  const pathname = usePathname();

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const id = window.setInterval(() => setI((v) => (v + 1) % CYCLE.length), 2600);
    return () => window.clearInterval(id);
  }, []);

  // Step aside while the footer is on screen.
  useEffect(() => {
    const el = ref.current;
    const foot = document.querySelector(".site-footer");
    if (!el || !foot) return;
    const st = ScrollTrigger.create({
      trigger: foot,
      start: "top bottom",
      onToggle: (self) => el.classList.toggle("is-away", self.isActive),
    });
    return () => st.kill();
  }, [pathname]);

  const cap = CAPABILITIES[i];
  return (
    <TransitionLink href={`/${cap.slug}`} className="float-card" ref={ref} aria-label={`Explore ${cap.verb}`}>
      <div className="fc-art">
        <Mark shape={CYCLE[i]} tone="dark" duration={0.8} />
      </div>
      <span className="fc-pill">
        <span className="fc-word" key={cap.slug}>
          {cap.verb}
        </span>
        <span aria-hidden="true">↗</span>
      </span>
    </TransitionLink>
  );
}

/* ---------------- Footer ---------------- */

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="site-footer" data-theme-section="dark">
      <div className="wrap">
        <h2 className="bye" aria-label="Bye.">
          Bye<span className="dot" />
        </h2>
        <div className="cols">
          <ul className="big">
            {[...NAV, { href: "/contact", label: "Contact" }].map((n) => (
              <li key={n.href}>
                <TransitionLink href={n.href}>{n.label}.</TransitionLink>
              </li>
            ))}
          </ul>
          <ul className="small">
            <li>
              <a href={SITE.funUrl} target="_blank" rel="noopener">
                melvo.fun ↗
              </a>
            </li>
            <li>
              <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
            </li>
            <li>
              <TransitionLink href="/contact">Start a project</TransitionLink>
            </li>
          </ul>
          <div className="say">
            <p>Thought of it? Let&apos;s build it.</p>
            <TransitionLink href="/contact" className="field">
              <span>Tell us about your idea</span>
              <span className="circle" aria-hidden="true">
                →
              </span>
            </TransitionLink>
            <small>One team for learning, brand, commerce and technology.</small>
          </div>
        </div>
        <div className="legal">
          <span>© {year} MELVO. All rights reserved.</span>
          <span>Learn · Brand · Sell · Scale</span>
        </div>
      </div>
    </footer>
  );
}
