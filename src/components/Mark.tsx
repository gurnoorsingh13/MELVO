"use client";

import { useEffect, useRef } from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { FIROZI_INDEX, SHAPES, type ShapeName } from "@/lib/shapes";

type Props = {
  shape?: ShapeName;
  tone?: "light" | "dark";
  className?: string;
  duration?: number;
  title?: string;
};

const BASE = { light: "var(--green)", dark: "var(--paper)" };

/** The four-panel mark. Changing `shape` morphs the panels between arrangements. */
export function Mark({ shape = "m", tone = "light", className, duration = 0.9, title }: Props) {
  const ref = useRef<SVGSVGElement>(null);
  const first = useRef(true);

  useEffect(() => {
    const polys = ref.current?.querySelectorAll("polygon");
    if (!polys) return;
    const pts = SHAPES[shape];
    const fz = FIROZI_INDEX[shape];
    polys.forEach((p, i) => {
      const fill = i === fz ? "var(--firozi)" : BASE[tone];
      if (first.current || prefersReducedMotion()) {
        p.setAttribute("points", pts[i]);
        p.style.fill = fill;
      } else {
        gsap.to(p, { attr: { points: pts[i] }, duration, ease: "power4.inOut", delay: i * 0.04, overwrite: true });
        p.style.fill = fill;
      }
    });
    first.current = false;
  }, [shape, tone, duration]);

  const init = SHAPES[shape];
  const fz = FIROZI_INDEX[shape];
  return (
    <svg
      ref={ref}
      className={className}
      viewBox="-2 -2 104 84"
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      {init.map((p, i) => (
        <polygon key={i} points={p} style={{ fill: i === fz ? "var(--firozi)" : BASE[tone], transition: "fill .6s" }} />
      ))}
    </svg>
  );
}
