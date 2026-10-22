# MELVO

A multidisciplinary company that builds skills, businesses, brands and technology.

- melvo.in: the company (Learn, Brand, Sell, Scale). This repository.
- melvo.fun: the learning platform.

Brand system: [`brand/BRAND.md`](brand/BRAND.md)

## Website

Next.js 15 (App Router), TypeScript, GSAP (ScrollTrigger, SplitText) and Lenis smooth scroll.

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build
npm run typecheck
```

### Structure

| Path | What |
|---|---|
| `src/app/page.tsx` | Home |
| `src/app/[slug]/page.tsx` | Capability pages: `/learn`, `/brand`, `/sell`, `/scale` |
| `src/app/about`, `src/app/contact` | About and Start a project |
| `src/app/api/contact/route.ts` | Contact form endpoint |
| `src/lib/content.ts` | All site copy |
| `src/lib/logo.ts`, `src/lib/shapes.ts` | Logo and mark geometry, generated from `brand/` |
| `src/components/chrome.tsx` | Preloader, page curtain, cursor, header, menu, footer |
| `src/components/motion.tsx` | Line reveals, scroll-scrubbed text, marquee, magnetic buttons |

### Contact form

Set `CONTACT_WEBHOOK_URL` (Slack, Zapier, Make, a CRM webhook…) to receive enquiries.
Without it, enquiries are logged in development and the form shows an error in production,
so no visitor is told a message was sent when it wasn't.
