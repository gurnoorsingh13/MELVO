"use client";

import Link from "next/link";
import type { ComponentProps, MouseEvent } from "react";
import { useSite } from "./providers";

type Props = ComponentProps<typeof Link> & { href: string };

/** A Link that plays the curtain before navigating. External and modified clicks behave normally. */
export function TransitionLink({ href, onClick, ...rest }: Props) {
  const { navigate } = useSite();
  const handle = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e);
    if (e.defaultPrevented) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    if (!href.startsWith("/") || href.startsWith("//")) return;
    if (href.startsWith("/#")) return;
    e.preventDefault();
    navigate(href);
  };
  return <Link href={href} onClick={handle} {...rest} />;
}
