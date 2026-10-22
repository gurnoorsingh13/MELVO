# MELVO Brand System v1.0

MELVO builds skills, businesses, brands and technology. Four capabilities, one system.

- **melvo.in** is the company: Learn, Brand, Sell, Scale.
- **melvo.fun** is the learning platform: the louder, younger sibling.

Tokens live in [`tokens.css`](tokens.css) and [`tokens.json`](tokens.json).

## Framework

LEARN → BRAND → SELL → SCALE

| Verb | Vertical |
|---|---|
| Learn | EdTech & Mentorship |
| Brand | Brand Building & Management |
| Sell | E-Commerce & Digital Commerce |
| Scale | Software & Technology |

This is a strategic foundation, not a slogan to repeat everywhere.

## Colour

| Name | Hex | Role | Share |
|---|---|---|---|
| Paper | `#EEF0EA` | Main background. Cool, green-leaning off-white. | ~60% |
| Ink | `#0B1A16` | Text and dark sections. Green-black, never pure black. | ~25% |
| Bottle Green | `#0B4A44` | Primary. Logo, key sections, primary actions. | ~10% |
| Stone Firozi | `#22C4CF` | Accent. The dot, highlights, motion, one block in the mark. | ~5% |
| Haldi | `#E9AE36` | Warm accent. melvo.fun and small tags only. | rare |

### Contrast (WCAG)

| Pair | Ratio | Use |
|---|---|---|
| Ink on Paper | 15.6:1 | All text |
| Bottle Green on Paper | 8.8:1 | All text |
| Paper on Bottle Green | 8.8:1 | All text |
| Firozi on Ink | 8.4:1 | All text. The signature pairing. |
| Haldi on Ink / Ink on Haldi | 9.0:1 | All text |
| Firozi on Bottle Green | 4.75:1 | Headings and emphasis |
| Firozi on Paper | 1.85:1 | **Shapes and fills only, never text** |

### Rules

1. Firozi is never text on Paper. On light backgrounds it is shapes, lines and fills.
2. Firozi stays scarce. If more than about 5% of a screen is firozi, it stops being special.
3. Haldi never appears on melvo.in except as a small tag (for example "New").
4. Verticals are told apart by **block shape**, not by colour. There are no per-vertical colours.

## Typography

All three faces are free (Google Fonts, SIL Open Font License).

| Role | Face | Use |
|---|---|---|
| Display and body | **Archivo** | Headlines at expanded widths, body at normal width. |
| Accent | **Newsreader Italic** | One emphasis word in a headline. |
| Utility | **Martian Mono** | Labels, numbers, tags. Small sizes only. |

### Archivo width rules

| Level | Width | Weight | Notes |
|---|---|---|---|
| Hero statement | 125% | 800 | Once per page. Drops to 108% under 560px. |
| Section heading | 112% | 800 | Default for display text. |
| Sub-head | 100% | 600 | |
| Body | 100% | 400 | Never wider than normal width. |

Display text: tracking `-0.035em`, leading `0.92`, `text-wrap: balance`.
Labels: Martian Mono, uppercase, 11–12px, tracking `0.08em`.

### Type rules

1. At most one serif word per headline, and not in every headline.
2. Expanded width is for statements, not paragraphs.
3. Martian Mono stays at label size. It gets heavy when large.
4. The logo is drawn, not typed. The wordmark in Archivo is a placeholder until the final logo is drawn.

## The dot

A small firozi square. It is the brand's module.

- Ends the wordmark: **melvo.** and **melvo.fun** (on melvo.fun the dot sits between the words).
- Ends key statements in place of a full stop.
- Used as bullet, cursor and loading indicator.

## The mark

An **M built from four blocks** in a 5:4 box. Block 3 is always firozi; the rest are Bottle Green on Paper, or Paper on Ink.
The blocks rearrange into one shape per vertical:

| Arrangement | Shape | Meaning |
|---|---|---|
| M | Tall, short, short, tall | The logo |
| Learn | Rising steps | Growth through skill |
| Brand | 2×2 grid | Identity as a system |
| Sell | Stacked parcels | Products moving |
| Scale | Growing bars | Systems that scale |

Coordinates are in `tokens.json` under `mark`. Transitions between shapes use `cubic-bezier(.7, 0, .2, 1)` over about 0.9s.

## melvo.in and melvo.fun

| | melvo.in | melvo.fun |
|---|---|---|
| Audience | Businesses, founders, institutions | Students, learners, schools |
| Lead colour | Bottle Green on Paper | Firozi on Ink, Haldi for tags |
| Layout | Large, precise, restrained | Same type, looser: tilted tags, stickers, annotations |
| Voice | "We build skills, businesses, brands and technology." | "Learn by building." |

## Voice

Short, direct, confident, warm. Verbs before nouns. Specifics over buzzwords.

- Yes: "We took 800 products to Amazon in 8 weeks."
- No: "End-to-end e-commerce solutions."

## Imagery

No stock photography. Real workshops, hands at work, products shot by MELVO's own studio, natural light.
The palette should appear in the frame naturally rather than through filters.

## Avoid

Corporate stiffness, childish education visuals, purple gradients, glowing "AI" visuals, generic startup illustrations,
and the overused template fonts (Inter, Satoshi, General Sans, Space Grotesk, DM Sans, Instrument Serif).
