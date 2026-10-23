"use client";

import { useEffect, useRef } from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { FIROZI_INDEX, SHAPES, type ShapeName } from "@/lib/shapes";

type Props = {
  shape?: ShapeName;
  /** "paper" faces suit dark sections, "green" faces suit light ones. */
  tone?: "paper" | "green";
  layers?: number;
  /** Depth of the extrusion as a share of the mark's width. */
  depth?: number;
  className?: string;
  /** Follow the pointer anywhere on the page. */
  follow?: boolean;
};

const FACE = {
  paper: { face: "#F4F6F1", side: "#9FAAA3", accent: "#22C4CF", accentSide: "#0F7F87" },
  green: { face: "#0B4A44", side: "#06231F", accent: "#22C4CF", accentSide: "#0F7F87" },
};

/** The mark as a solid object: stacked slices give it real depth, and it turns toward the pointer. */
export function Mark3D({ shape = "m", tone = "paper", layers = 22, depth = 0.16, className, follow = true }: Props) {
  const root = useRef<HTMLDivElement>(null);
  const body = useRef<HTMLDivElement>(null);
  const first = useRef(true);

  useEffect(() => {
    const el = root.current;
    const b = body.current;
    if (!el || !b) return;
    const size = () => {
      const w = el.offsetWidth;
      b.querySelectorAll<SVGSVGElement>("svg").forEach((s, i) => {
        s.style.transform = `translateZ(${(-i * w * depth) / layers}px)`;
      });
    };
    size();
    const ro = new ResizeObserver(size);
    ro.observe(el);
    return () => ro.disconnect();
  }, [layers, depth]);

  useEffect(() => {
    const b = body.current;
    if (!b || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.set(b, { rotationY: -24, rotationX: 14 });
      gsap.to(b, { y: "-3%", duration: 3.2, ease: "sine.inOut", repeat: -1, yoyo: true });
    });
    if (!follow) {
      const spin = gsap.fromTo(b, { rotationY: -34 }, { rotationY: 30, rotationX: 22, duration: 5.5, ease: "sine.inOut", repeat: -1, yoyo: true });
      return () => {
        spin.kill();
        ctx.revert();
      };
    }
    const ry = gsap.quickTo(b, "rotationY", { duration: 1.4, ease: "power3.out" });
    const rx = gsap.quickTo(b, "rotationX", { duration: 1.4, ease: "power3.out" });
    const move = (e: PointerEvent) => {
      const nx = e.clientX / window.innerWidth - 0.5;
      const ny = e.clientY / window.innerHeight - 0.5;
      ry(nx * 56);
      rx(14 - ny * 30);
    };
    window.addEventListener("pointermove", move);
    return () => {
      window.removeEventListener("pointermove", move);
      ctx.revert();
    };
  }, [follow]);

  useEffect(() => {
    const b = body.current;
    if (!b) return;
    const pts = SHAPES[shape];
    const fz = FIROZI_INDEX[shape];
    const c = FACE[tone];
    b.querySelectorAll("svg").forEach((svg, li) => {
      svg.querySelectorAll("polygon").forEach((p, i) => {
        const isFace = li === 0;
        const fill = i === fz ? (isFace ? c.accent : c.accentSide) : isFace ? c.face : c.side;
        p.style.fill = fill;
        if (first.current || prefersReducedMotion()) p.setAttribute("points", pts[i]);
        else gsap.to(p, { attr: { points: pts[i] }, duration: 1.1, ease: "power4.inOut", delay: i * 0.05, overwrite: true });
      });
    });
    first.current = false;
  }, [shape, tone]);

  const init = SHAPES[shape];
  return (
    <div className={`m3d${className ? ` ${className}` : ""}`} ref={root} aria-hidden="true">
      <div className="m3d-body" ref={body}>
        {Array.from({ length: layers }, (_, li) => (
          <svg key={li} viewBox="-2 -2 104 84" className={li === 0 ? "face" : undefined}>
            {init.map((p, i) => (
              <polygon key={i} points={p} />
            ))}
          </svg>
        ))}
      </div>
    </div>
  );
}
