# Design system

An editorial–scientific identity: restrained, typographic, generous with space; satellite imagery used as documentary illustration, always credited.

## Colour

| Token | Hex | Use |
|---|---|---|
| `pine` | `#172D28` | Primary dark green — hero, footer, dark bands, primary buttons, headings on paper |
| `pine-2` | `#1E3A33` | Raised surface on pine |
| `forest` | `#31564D` | Secondary green — hover on buttons, "active" status |
| `paper` | `#F6F4EE` | Page background |
| `paper-2` | `#EFEBE1` | Alternate bands (appointments, selected publications) |
| `stone` | `#D8D1C2` | Hairline rules, chip borders |
| `gold` | `#B48D59` | Ornament on light; **text only on pine** (4.8:1) |
| `gold-ink` | `#7A5D35` | Gold for small text on paper (5.5:1; 5.1:1 on paper-2) — years, kickers, DOI links |
| `ink` | `#202724` | Body text (13.9:1 on paper) |
| `muted` | `#4B5751` | Secondary text on paper (6.9:1) |
| `mist` | `#C9D3CD` | Secondary text on pine (9.5:1) |

Gold `#B48D59` on paper is 2.8:1, so it is never used for text there; `gold-ink` is.

## Type

- **Newsreader** (serif) — headings, lede paragraphs, long-form reading (`.prose-editorial`, 1.2rem/1.7, max ~70ch).
- **Inter** (sans) — navigation, kickers, metadata, captions, controls.
- Fluid scale: `text-display` (2.75→5.75rem), `text-headline` (2→3.25rem), `text-title` (1.5→2rem), `text-lede` (1.18→1.42rem).
- **Kicker**: Inter 0.72rem, 600, 0.16em tracking, uppercase, `gold-ink` (gold on pine).

## Layout

- Container `max-w-[84rem]`, gutters 16 / 32 / 48 px (mobile / sm / lg). 12-column grid on md+.
- Sections `py-24 lg:py-32`; hairline `stone` rules separate list items instead of cards.
- Numbered section labels (01–06) on the homepage; numbered themes everywhere for continuity.

## Components

| Component | File | Notes |
|---|---|---|
| Header | `components/site-header.tsx` | Transparent over the home hero, solid paper with blur on scroll; full-screen pine menu on mobile (Esc closes, scroll locked) |
| Footer | `components/site-footer.tsx` | Pine; affiliation, verified scholarly links, image-credits link |
| Page header | `components/ui.tsx#PageHeader` | Kicker, h1, lede |
| Section heading | `components/ui.tsx#SectionHeading` | Index, kicker, h2, "view all" link |
| Figure | `components/ui.tsx#Figure` | Image + mandatory credit |
| Evidence chain | `components/evidence-chain.tsx` | 5-step "orbit to outcome" ordered list; vertical on mobile, horizontal on md+ |
| Project card | `components/project-card.tsx` | Period, status dot, title, abstract, funder, primary theme |
| Citation | `components/publication.tsx` | Year column, title link, authors (Brown bolded), source, DOI |
| Bibliography explorer | `components/publication-explorer.tsx` | Search, type/theme/year filters, selected toggle, BibTeX export, copy citation; URL-synced filters; full list server-rendered |
| Project explorer | `components/project-explorer.tsx` | Theme and status filters |

## Motion

Fade-and-rise on scroll (`[data-reveal]`, 0.8s, editorial ease), underline-grow links, 1px hover translations. All motion is disabled under `prefers-reduced-motion`; content is never hidden without JavaScript (no-js class + 2.5s CSS failsafe).

## Accessibility

Skip link; one `h1` per page (checked by `npm run check:site`); visible focus rings (`gold-ink` on paper, `gold` on pine); `aria-current` on navigation; filter buttons use `aria-pressed`; live result counts; all images have alt text and credits; colour pairs meet WCAG AA.
