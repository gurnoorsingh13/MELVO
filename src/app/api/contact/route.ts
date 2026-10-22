import { NextResponse } from "next/server";

type Payload = {
  who?: string;
  needs?: string[];
  timing?: string;
  name?: string;
  email?: string;
  phone?: string;
  org?: string;
  message?: string;
  website?: string;
};

const clip = (v: unknown, n = 2000) => (typeof v === "string" ? v.trim().slice(0, n) : "");

/**
 * Receives the contact form. Set CONTACT_WEBHOOK_URL (Slack, Zapier, Make, a CRM…) to forward
 * enquiries. Without it, enquiries are only logged in development and refused in production,
 * so nobody is told their message was sent when it wasn't.
 */
export async function POST(req: Request) {
  let body: Payload;
  try {
    body = (await req.json()) as Payload;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  if (body.website) return NextResponse.json({ ok: true }); // honeypot

  const enquiry = {
    who: clip(body.who, 100),
    needs: Array.isArray(body.needs) ? body.needs.map((n) => clip(n, 100)).slice(0, 20) : [],
    timing: clip(body.timing, 100),
    name: clip(body.name, 200),
    email: clip(body.email, 200),
    phone: clip(body.phone, 50),
    org: clip(body.org, 200),
    message: clip(body.message, 5000),
    receivedAt: new Date().toISOString(),
  };
  if (!enquiry.name || !enquiry.message || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(enquiry.email)) {
    return NextResponse.json({ error: "Please add your name, a valid email and a short message." }, { status: 400 });
  }

  const hook = process.env.CONTACT_WEBHOOK_URL;
  if (!hook) {
    if (process.env.NODE_ENV !== "production") {
      console.log("[contact] enquiry (no CONTACT_WEBHOOK_URL set):", enquiry);
      return NextResponse.json({ ok: true });
    }
    return NextResponse.json({ error: "The form is not connected yet." }, { status: 503 });
  }

  const res = await fetch(hook, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ text: `New MELVO enquiry from ${enquiry.name} <${enquiry.email}>`, enquiry }),
  }).catch(() => null);
  if (!res || !res.ok) return NextResponse.json({ error: "We could not send your message." }, { status: 502 });
  return NextResponse.json({ ok: true });
}
