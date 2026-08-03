# Heritage Natural Stone — Website (Pilot)

One-page, contact-first B2B site for Heritage Natural Stone.
Static HTML/CSS/JS — no build step, published directly via GitHub Pages.

**Live:** https://batudemir14.github.io/heritage-natural-stone/

## Structure

```
index.html        one-page layout (Hero → Who We Are → What We Do → Our Values → Contact)
css/style.css     design system & layout
js/main.js        header state, mobile menu, scroll reveals, active nav
assets/marble/    marble textures (procedurally generated — placeholder until real photography)
assets/logo-mark.svg
```

## Design rules (from the internal design guide)

| Color | Hex | Use |
|---|---|---|
| Heritage Charcoal | `#2A2825` | hero, footer, dark premium moments |
| Alabaster | `#F8F3EA` | main content ground |
| Quarry Gold | `#CBAE82` | thin rules, numbers, selective accents |
| Intelligence Navy | `#1F3E52` | sourcing / technology / info areas |

Typography: Cinzel (wordmark) · Cormorant Garamond (display) · Inter (body).

## TODO before launch

- [ ] Replace placeholder WhatsApp number (`wa.me/905000000000`) — 2 places in `index.html`
- [ ] Confirm contact email (`info@heritagenaturalstone.com`)
- [ ] Replace generated marble textures with real slab / quarry photography
- [ ] Custom domain (`heritagenaturalstone.com`) → set up CNAME
- [ ] Privacy / legal page
- [ ] Analytics

## Publishing

Pushed to `main` → GitHub Pages deploys automatically. No build.

## Image licensing

All marble textures in `assets/marble/` are procedurally generated for this
project (no third-party imagery). They are placeholders pending real photography.
