import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CapHero, CapIntro, Facts, NextCap, SellFlow, ServiceList } from "@/components/capability";
import { CtaBand } from "@/components/home";
import { CAPABILITIES, capability } from "@/lib/content";

export const dynamicParams = false;

export function generateStaticParams() {
  return CAPABILITIES.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const cap = capability(slug);
  if (!cap) return {};
  return { title: `${cap.verb}: ${cap.name}`, description: cap.summary };
}

export default async function CapabilityPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const cap = capability(slug);
  if (!cap) notFound();
  return (
    <>
      <CapHero cap={cap} />
      <CapIntro cap={cap} />
      <ServiceList cap={cap} />
      {cap.slug === "sell" && <SellFlow />}
      <Facts cap={cap} />
      <NextCap cap={cap} />
      <CtaBand title="Thought of it?" em="Let's build it." />
    </>
  );
}
