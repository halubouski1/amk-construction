# AMK Construction — how we work

General rules: `CLAUDE-universal.md`. This file holds what is specific to AMK.

## Figma
- File "Untitled (Copy)", key `bjacwhrnbIGI0gmlbb2kCx`. Desktop home `42:2` (1920×11592). Popups: `42:624` "Get a free estimate" (modal `42:625`), `42:661` "Request sent" (modal `42:662`). Header dropdowns: `2004:4` Services open (panel `2004:52`), `2004:106` Hotel Services open (panel `2004:154`). Mobile frame `46:2` (360×11864), mobile menu `57:2`, mobile popups `57:60` / `57:93` (bottom sheets), sticky CTA bar `47:374`. No tablet frame (tablets use the mobile frame × --m).
- Section map (Figma y → section, height): 0 Header 92 · 92 Hero 988 · 1080 Trust bar 192 · 1272 Intro 1070 · 2342 Services 1476 · 3818 Why AMK 944 · 4762 Projects 1136 · 5898 Google reviews 741 · 6639 Process 547 · 7186 Service area 970 · 8156 Hotel services 1166 · 9322 FAQ 817 · 10139 Estimate form 900 · 11039 Footer 553. Every section has 150px top padding and none at the bottom.
- Originals: `../amk-construction-originals/figma` (raw MCP downloads, full-page screenshot), `../amk-construction-originals/images` (PNG sources for `npm run build:images`).

## Pages and HTML build
- Inner pages: Figma file `64lCi0IccWnnnnAhlJngja` (copy of the home file + inner pages, group `2001:64`): Services `89:2`/`89:425`, Service (Kitchen) `89:825`/`89:1265`, Hotel services `89:1673`/`89:1931`, Projects `89:2166`/`89:2393`, Project (Marble bath) `89:2607`/`89:2843`, Reviews `89:3049`/`89:3431`, About `89:3790`/`89:4236`, Blog `89:4640`/`89:4861`, Blog article `89:5066`/`89:5259`, Contact `89:5420`/`89:5693`. Extra photos: frame `80:2`.
- Sources live in `src/` (never edit the generated `*.html` / `<dir>/index.html`): `src/index.html`, `src/about/index.html`, … and shared partials in `src/partials/` (`head`, `header`, `footer`, `overlays` = mobile menu + sticky bar + popup, `trust`, `area`, `reviews`, `estimate`). `npm run build:html` (`tools/build-html.py`, part of `npm run build`) expands `{{include NAME}}`, `{{include header|KEY}}` (marks the nav item `data-nav="KEY"` with `aria-current="page"`) and `{{pic NAME|CLASS|SIZES|W|H|ALT|MODE}}`.
- Clean URLs as folders (`/about/`, `/services/kitchen-remodeling/`, …), `trailingSlash: true` on Vercel. All asset paths are root-absolute (`/assets/…`).
- Breakpoint upper bounds end in `.98px` (1279.98, 1023.98, 768.98, 480.98, 359.98, 1919.98): with browser zoom the viewport width can be fractional (1279.33) and fall between `max-width: 1279px` and `min-width: 1280px`.
- Local server: port 8766 (`python3 -m http.server 8766`); 8765 may be taken by another project.

## Typography
- Onest (SIL OFL), one variable WOFF2 (latin, 300–500) reused from Stonix: `assets/fonts/onest-latin.woff2`, preloaded. Page text 400/500; popup titles 300.
- "normal" line-heights written explicitly: 15 → 1.27, 16 → 1.25, 17 → 1.29, 18 → 1.28, 20 → 1.3, 22 → 1.27, 28 → 1.29.

## Build
- `npm run build:css` = `tools/scale-laptop.py` (laptop 1280–1919) + `tools/build-compact.py` (compact ≤1279 from `tools/compact.tpl.css`, `m(N)` → `calc(Npx * var(--m))`) + bundle.
- `npm run build` = laptop generator + `css/site.min.css` (normalize, Lenis, AOS, Swiper, style, media) + `js/site.min.js` (Lenis 1.1.13, AOS 2.3.4, Swiper 14.3.0 custom, main.js).
- Page bundles for the map, loaded by main.js only when the service-area section comes near: `js/map.min.js` (MapLibre GL 5.24.0 UMD) and `css/map.min.css`. MapLibre 6.x is ESM-only with a separate worker, so 5.x was kept.
- `npm run build:images` → `assets/images/*-<w>.webp|avif` from `tools/images.config.json` (widths = CSS box incl. cover crop at 1920 and ×0.75, ×2). `svc-bath` is WebP-only (its AVIF set was larger).
- Local check needs HTTP (`npm run serve`, port 8765): over `file://` Chrome blocks the font and the SVG mask icons.

## Components
- `.btn` + `--md` (header, 50), `--sm` (dropdown promo, 44), `--modal` (56, centred fill), `--outline`, `--outline-light`, `--glass`. Hover: a circle fill grows from the arrow (`--fill-x`), the arrow flies out and back (`@keyframes arrow-fly`).
- `.round-btn`: 60px slider arrows. `.arrow-link`: red text link with an arrow.
- `.icon icon--{arrow,chevron,prev,next,close,check,star,phone,facebook,instagram,youtube,google}`: SVG masks in `assets/icons/`. The colour Google "G" is an `<img>` (`google-logo.svg`).
- Smooth scroll: Lenis (`initSmoothScroll`, own rAF loop, off with reduced motion, stopped while the modal is open). In-page `#` links go through `lenis.scrollTo` (`initAnchorLinks`; going up leaves room for the header). Inner scroll areas (`.select__menu`, the dialog) carry `data-lenis-prevent`.
- Header nav: every item covers the full header height and half the 40px gap on each side (`.nav__link` padding 0 20px, `.nav` margin 0 −20px), so hovering anywhere in that column opens the menu at once.
- Arrow icons on hover turn from ↗ to → (`rotate: 45deg`), no fly-out.
- Header `[data-header]`: fixed; `.is-hidden` while scrolling down past the header, back on scroll up; `.is-scrolled` adds a shadow (`initHeader`).
- Mega menus `[data-mega]` (`initMegaMenus`): hover with intent delay (mouse), click/keyboard toggle, Esc, outside click. Links `[data-promo="<image>"]` switch the picture `[data-promo-img]` inside `[data-promo-media]`. Menu images keep their srcset in `data-srcset` until the first open. Pictures: Services → the client's service photos (default `prj-marble`, as in Figma); Hotel → guest room / hallway (flooring) / bathroom (maintenance).
- Projects slider `[data-projects-slider]` + `[data-projects-prev|next]`: Swiper (Navigation, Keyboard, A11y), `slidesPerView: auto`, 24px gap (18 on laptop), track runs off the right edge (`.projects { overflow-x: clip }`).
- FAQ `[data-accordion]`: `.faq-item(.is-open)`, `grid-template-rows` 0fr → 1fr, one open at a time.
- Custom dropdown `[data-dropdown]` (`.select`): toggle + `role=listbox` with `aria-activedescendant`, value in `data-value` + hidden input `project_type`, fires `change`. Arrows/Home/End/Enter/Space/Esc.
- Modal `[data-modal]`: native `<dialog>` with views `form` / `sent`; `[data-modal-open]` opens it, `[data-modal-close]`, Esc and backdrop close it; `html.is-locked`.
- Forms `[data-form]`: `data-validate` = required | phone | email; phone is formatted as `(302) 241-9466` while typing. A valid submit opens the "sent" view.
- Service-area map `[data-area-map]` (`initServiceMap`): the static Figma composition (`map-counties.svg` + pins/labels at unitless `--x/--y` × `--map-scale`) is shown first and is the fallback. The live map (OpenFreeMap "positron" restyled to the design tokens `--c-map-*`, service counties from `assets/data/service-area.geojson`: Chester PA, Delaware PA, New Castle DE) fades in over it (`.is-live`). Town links `[data-town]` and pins `[data-pin]` drive one tooltip `[data-map-tip]`.
- Intro (node 42:79) is full-bleed: a growing `::before` spacer keeps the text on the container line, the photo (`flex: 1 1 760px`) runs to the right screen edge on any width. Slideshow `[data-slideshow]` (`initSlideshow`): `[data-slide]` crossfade with a slow zoom-out, `[data-slide-to]` progress bars; the bar's animation is the timer (5s), paused off screen / on hover / hidden tab; reduced motion = no autoplay. Photos: intro, prj-marble, prj-bluetile, prj-chevron.
- Estimate section is full-bleed too: photo `flex: 1 1 860px` from the left screen edge, panel fixed 1060px to the right edge.
- `picture > source { display: none }`: with `picture { display: contents }` a `<source>` would otherwise be a flex item and take a gap.
- Compact layout (≤1279): `--m` 1 (≤480), 1.1 (481–768), 1.15 (769–1023), 1.25 (1024–1279), 0.889 (≤359); gutter 20 × m on phones, 40 × m on tablets; tablets (769–1279) get 3-column services, a 4-up trust bar, 2-column steps and a 4-column footer, buttons sized to their label. Text that differs between the desktop and mobile frames: `.d-only` / `.m-only` spans; mobile-only line breaks: `<br class="br-compact">`.
- Mobile menu `[data-mobile-menu]` (`initMobileMenu`): `[data-menu-open]` burger, `[data-menu-close]` links/buttons, accordions `[data-menu-group]`; clip-path unroll + staggered items; page scroll and Lenis stop while open.
- Sticky bar `[data-sticky-cta]` (`initStickyCta`): compact only, shows after the hero, hides from the estimate form down.
- Sliders: `createSlider()` for projects and reviews (reviews only on compact; desktop keeps the 2×2 grid). Gap from `--slider-gap` read via `column-gap`; dots `[data-dots-for]`; arrows `[data-<name>-prev|next]` (several per slider allowed). Compact swipe speed 480ms.
- Popups on compact: the same `<dialog>` as a bottom sheet (scrolls inside on short screens); focus goes to the title, not an input, so the keyboard does not jump the sheet. Dropdowns open upwards when there is no room below (`.select.is-up`).
- Scroll animations: AOS from the `ANIMATIONS` list in main.js. Hero content uses CSS keyframes (from opacity 0.01).

## Status (November 2026)

| Page | Desktop 1920 | Laptop ×0.75 | Tablet | Mobile 360 |
|---|---|---|---|---|
| about (89:3790 / 89:4236) | done | generated | from mobile × --m | done |
| services/kitchen-remodeling (89:825 / 89:1265) | done | generated | from mobile × --m | done |
| index + popups + dropdowns + mobile menu | done (42:2, 42:624, 42:661, 2004:52, 2004:154) | generated; 1440 OK, 1280 overflows by 70px (fixed laptop widths) — next step | from the mobile frame × --m, no overflow 769–1279 | done (46:2, 57:2, 57:60, 57:93, 47:374), no overflow 320–768 |

## Deviations from Figma
- Hero is one screen tall (`--fixed-vh` − header, min 760px) instead of a fixed 988px; content pinned 120px from the bottom as in Figma.
- Hero background is a still image for now (Figma names it "video loop"). The source is 1672px wide, so it is upscaled slightly at 1920.
- Nav items open/hover: red text and the 2px line under the header, without switching to Medium weight (Figma active item is Medium; the weight change would shift the menu).
- Popups are centred on the screen.
- Review cards are 300/272px tall vs 302/273 in Figma (Figma rounds the 28.5px line height). The same rounding (FAQ items 97.5 vs 98, Why rows) moves the sections below Projects up by 3–12px at 1920.
- Intro: one photo in Figma; here a 4-photo slideshow, and the photo runs to the right screen edge on screens wider than 1920 (client request).
- Recent projects: 8 cards (Figma 4); the 4 extra cards reuse the client's service photos.
- Hotel cards got the arrow row of the service cards (client request).
- Why AMK rows have no hover (client request).
- Descriptions wrap with Figma's line breaks (`<br class="br-design">`) instead of fixed box widths.
- Service-area live map: real geography, so pins sit where the towns really are, not at the Figma positions; the static layer keeps the Figma positions.

- Mobile: review cards keep the full Google review text (the mobile frame shortens/paraphrases the quotes); 2 of the 8 project titles wrap to 3 lines; the mobile popup has Email instead of "About the project" (as in the frames).

## Content flagged to the client
- Kitchen page: FAQ answers 2–4 are draft copy written by us (Figma has the questions and only the first answer); the mobile hero uses the same photo as desktop (the mobile frame shows a different kitchen).
- FAQ answers 2–6 are draft copy written by us (Figma has only the first answer). No prices or durations were invented; please confirm.
- Map tooltip notes per town ("Chester County", "Delaware County", …) and the town list link to `#projects` until town pages exist.
- All service, hotel, project, review and footer links point to sections of this page or to placeholders (`#blog`, `#privacy`, `#terms`, socials, Google reviews).
- Forms have no backend yet: they validate and show the "sent" popup. Set `action` and wire submit in `js/main.js` (TODO there).
- Extra project cards: captions and "Chester County, PA" locations are placeholders; please send the real project names and towns.
- "Something else" was added to the Project type options; the option list itself is ours.
- Map tiles come from OpenFreeMap (free, no key; attribution shown). Ask the client if they prefer another provider.
