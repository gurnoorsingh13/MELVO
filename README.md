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
| `src/components/chrome.tsx` | Page curtain, header, edge blur, mobile menu, floating card, footer |
| `src/components/motion.tsx` | Reveals, line reveals, rotating words, scroll-scrubbed text, shape trail |
| `src/components/Mark3D.tsx` | The mark as an extruded 3D object |
| `src/components/home.tsx` | Hero, statement, audience wall, capability rail, ways arc, stacking cards, CTAs |

Each section declares `data-theme-section` (`white` or `dark`); the page background swaps to match the section in the middle of the screen.

### Contact form

Set `CONTACT_WEBHOOK_URL` (Slack, Zapier, Make, a CRM webhook…) to receive enquiries.
Without it, enquiries are logged in development and the form shows an error in production,
so no visitor is told a message was sent when it wasn't.
