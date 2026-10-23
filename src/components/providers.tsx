"use client";

import Lenis from "lenis";
import { usePathname, useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { gsap, ScrollTrigger, prefersReducedMotion } from "@/lib/gsap";

type SiteState = {
  ready: boolean;
  setReady: (v: boolean) => void;
  menuOpen: boolean;
  setMenuOpen: (v: boolean) => void;
  lenis: React.RefObject<Lenis | null>;
  navigate: (href: string) => void;
  registerCurtain: (fns: CurtainFns) => void;
};
type CurtainFns = { cover: () => Promise<void>; reveal: () => Promise<void> };

const SiteContext = createContext<SiteState | null>(null);

export function useSite() {
  const ctx = useContext(SiteContext);
  if (!ctx) throw new Error("useSite must be used inside <SiteProvider>");
  return ctx;
}

export function SiteProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const lenis = useRef<Lenis | null>(null);
  const curtain = useRef<CurtainFns | null>(null);
  const navigating = useRef(false);
  const router = useRouter();
  const pathname = usePathname();

  // No preloader: the page is ready as soon as it has mounted and fonts are in.
  useEffect(() => {
    const go = () => setReady(true);
    if (document.fonts) document.fonts.ready.then(go);
    else go();
  }, []);

  // Each section names a theme; the page background follows whichever section holds the middle of the screen.
  useEffect(() => {
    const body = document.body;
    const sections = Array.from(document.querySelectorAll<HTMLElement>("[data-theme-section]"));
    let timer = 0;
    const set = (theme: string | undefined, animate = true) => {
      if (!theme || body.dataset.theme === theme) return;
      if (animate && !prefersReducedMotion()) {
        body.classList.add("theme-swap");
        window.clearTimeout(timer);
        timer = window.setTimeout(() => body.classList.remove("theme-swap"), 700);
      }
      body.dataset.theme = theme;
    };
    set(sections[0]?.dataset.themeSection, false);
    const triggers = sections.map((s) =>
      ScrollTrigger.create({
        trigger: s,
        start: "top 50%",
        end: "bottom 50%",
        onToggle: (self) => self.isActive && set(s.dataset.themeSection),
      }),
    );
    return () => {
      triggers.forEach((t) => t.kill());
      window.clearTimeout(timer);
    };
  }, [pathname]);

  // Smooth scroll, driven by the GSAP ticker so ScrollTrigger stays in sync.
  useEffect(() => {
    if (prefersReducedMotion()) return;
    const l = new Lenis({ lerp: 0.09, wheelMultiplier: 1 });
    lenis.current = l;
    l.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => l.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(tick);
      l.destroy();
      lenis.current = null;
    };
  }, []);

  useEffect(() => {
    if (menuOpen) lenis.current?.stop();
    else lenis.current?.start();
  }, [menuOpen]);

  const registerCurtain = useCallback((fns: CurtainFns) => {
    curtain.current = fns;
  }, []);

  const navigate = useCallback(
    async (href: string) => {
      if (navigating.current) return;
      if (href === pathname) {
        setMenuOpen(false);
        lenis.current ? lenis.current.scrollTo(0) : window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      navigating.current = true;
      if (curtain.current && !prefersReducedMotion()) await curtain.current.cover();
      setMenuOpen(false);
      router.push(href, { scroll: false });
    },
    [pathname, router],
  );

  // After a route change: jump to top behind the curtain, then lift it.
  const firstPath = useRef(true);
  useEffect(() => {
    if (firstPath.current) {
      firstPath.current = false;
      return;
    }
    lenis.current?.scrollTo(0, { immediate: true, force: true });
    window.scrollTo(0, 0);
    requestAnimationFrame(() => {
      ScrollTrigger.refresh();
      const done = () => {
        navigating.current = false;
      };
      if (curtain.current && !prefersReducedMotion()) curtain.current.reveal().then(done);
      else done();
    });
  }, [pathname]);

  return (
    <SiteContext.Provider value={{ ready, setReady, menuOpen, setMenuOpen, lenis, navigate, registerCurtain }}>
      {children}
    </SiteContext.Provider>
  );
}
