#!/usr/bin/env python3
"""Write src/services/<slug>/index.html for the five services that have no Figma page.

Figma only has the Kitchen remodeling page (89:825 / 89:1265). The other five pages
follow its structure (photo hero, trust bar, "what it includes" tiles, an optional
project gallery, timeline, Google reviews, FAQ, related services, estimate form) with
the photo hero of Services/Hotel, because the service photos are too small for the
full-bleed Kitchen hero. Copy uses the site's own wording; no prices or durations are
invented. Edit the data below, then run:

    python3 tools/gen-service-pages.py && npm run build
"""
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

# every service card: slug, image, title, card text (Figma 89:82), image alt
SERVICES = [
    ('kitchen-remodeling', 'svc-kitchen', 'Kitchen remodeling', 'Cabinets, quartz and granite counters, islands, backsplash, lighting.', 'Grey shaker kitchen with a stainless range'),
    ('bathroom-remodeling', 'svc-bath', 'Bathroom remodeling', 'Tile, vanities, glass showers, tub‑to‑shower conversions.', 'Bathroom with a glass walk-in shower and white vanity'),
    ('basement-finishing', 'svc-basement', 'Basement finishing', 'Framing, egress windows, theater rooms, guest suites.', 'Finished basement with a fireplace and wood-look floor'),
    ('showers-and-heated-floors', 'svc-shower', 'Showers and heated floors', 'Walk‑in and steam showers, heated tile floors.', 'Walk-in shower with large marble-look tile'),
    ('decks-and-exteriors', 'svc-exterior', 'Decks and exteriors', 'Composite and wood decks, fiber cement and vinyl siding.', 'New deck with white railings'),
    ('interior-and-flooring', 'svc-floor', 'Interior and flooring', 'LVP and tile floors, paint, wallpaper, mudrooms, saunas.', 'Wide-plank vinyl floor in a kitchen'),
]

PAGES = {
    'bathroom-remodeling': dict(
        meta='Bathroom remodeling in West Chester and Chester County: tile, vanities, glass showers, tub-to-shower conversions and heated floors. Free written estimate.',
        title='Bathroom remodeling <br>in West Chester, PA',
        lead='Tile, vanities, glass showers and tub‑to‑shower conversions, <br class="br-design">planned and built by our own crew.',
        hero=[('svc-bath', 'Remodeled bathroom with a glass walk-in shower and a white vanity'),
              ('prj-chevron', 'Bathroom with a double vanity and a chevron tile wall'),
              ('prj-bluetile', 'Walk-in shower with blue subway tile'),
              ('prj-b042', 'Master bathroom with a navy vanity and marble floor')],
        included_title='What a bathroom <br>remodel includes',
        tiles=[('Tile', 'Floor and wall tile, from large‑format porcelain to mosaic.'),
               ('Vanities', 'Single or double vanities with new tops and faucets.'),
               ('Glass showers', 'Frameless and framed glass enclosures.'),
               ('Tub‑to‑shower', 'Old tubs replaced with walk‑in showers.'),
               ('Lighting and fans', 'New fixtures, recessed lights and quiet exhaust fans.'),
               ('Heated floors', 'Electric radiant heat under the new tile.')],
        gallery=dict(title='Bathroom projects', lead='Real bathrooms we finished <br class="br-compact">in Chester County.', button='See all bathrooms',
                     big=('prj-chevron', 'Bathroom with a double vanity and a chevron tile wall'),
                     stack=[('prj-bluetile', 'Walk-in shower with blue subway tile'), ('prj-b042', 'Master bathroom with a navy vanity and marble floor')],
                     bottom=[('prj-b015', 'Bathroom with a glass shower, a teak bench and a white vanity'), ('prj-b047', 'Double vanity with a chevron tile wall and wainscoting'), ('prj-marble', 'Marble bathroom with a freestanding tub')]),
        timeline_title='From estimate <br class="br-compact">to first shower',
        timeline_lead='How a bathroom remodel runs, <br class="br-compact">step by step.',
        steps=[('Design and estimate', 'We measure, talk through layout and finishes, and send a written estimate.'),
               ('Permits and ordering', 'We pull permits and order the vanity, tile, fixtures and glass.'),
               ('Demolition and rough‑in', 'Old bathroom out, plumbing and wiring moved where the new layout needs them.'),
               ('Tile, vanity, glass', 'Waterproofing and tile, then the vanity and fixtures; glass is measured and set.'),
               ('Finish and walkthrough', 'Paint, trim and touch‑ups, then a final walkthrough together.')],
        faq_title='Bathroom <br>remodeling FAQ',
        faq=[('How long does a bathroom remodel take?', 'It depends on the size, the tile and whether plumbing moves. The written estimate includes the schedule before work starts.'),
             ('Can you turn a tub into a walk‑in shower?', 'Yes. Tub‑to‑shower conversions are one of our most common bathroom projects.'),
             ('Do you handle permits?', 'Yes. We pull Chester County permits and schedule the inspections.'),
             ('Can you add heated floors?', 'Yes. Electric radiant heat can go under the new tile in most bathrooms.')],
    ),
    'basement-finishing': dict(
        meta='Basement finishing in West Chester and Chester County: framing, egress windows, guest suites, theater rooms, lighting and flooring. Free written estimate.',
        title='Basement finishing <br>in West Chester, PA',
        lead='Framing, egress windows, theater rooms and guest suites, <br class="br-design">with permits and licensed trades.',
        hero=[('svc-basement', 'Finished basement with a stone fireplace and wood-look floor')],
        included_title='What a basement <br>finish includes',
        tiles=[('Framing and insulation', 'Walls framed, insulated and closed with drywall.'),
               ('Egress windows', 'Code‑compliant windows for bedrooms and safety.'),
               ('Guest suites', 'A bedroom, a closet and a full bathroom.'),
               ('Theater and rec rooms', 'Wiring for the TV, sound and lighting.'),
               ('Lighting and electrical', 'Recessed lights, outlets and circuits by licensed electricians.'),
               ('Flooring', 'LVP or carpet that suits a below‑grade space.')],
        gallery=None,
        timeline_title='From estimate <br class="br-compact">to move‑in',
        timeline_lead='How a basement finish runs, <br class="br-compact">step by step.',
        steps=[('Design and estimate', 'We measure, plan the rooms with you and send a written estimate.'),
               ('Permits', 'We pull the permit and plan the inspections around the build.'),
               ('Framing and rough‑in', 'Walls framed, plumbing and wiring run and inspected before the walls close.'),
               ('Drywall, paint, floors', 'Drywall hung and finished, walls painted, floors laid.'),
               ('Finish and walkthrough', 'Doors, trim and fixtures, then a final walkthrough together.')],
        faq_title='Basement <br>finishing FAQ',
        faq=[('Do I need a permit to finish a basement?', 'Usually yes. We check with your township, pull the permit and schedule the inspections.'),
             ('Can you add a bathroom in the basement?', 'Yes. The plumbing is planned and priced in the estimate and done by licensed plumbers.'),
             ('Do you install egress windows?', 'Yes. We cut the opening, install the window and finish it inside and out.')],
    ),
    'showers-and-heated-floors': dict(
        meta='Walk-in and steam showers and heated tile floors in West Chester and Chester County, built and waterproofed by our own crew. Free written estimate.',
        title='Showers and heated floors <br>in West Chester, PA',
        title_class='page-hero__title--long',  # 88px would take 3 lines
        lead='Walk‑in and steam showers and heated tile floors, <br class="br-design">built and waterproofed by our own crew.',
        hero=[('svc-shower', 'Walk-in shower with large marble-look tile and a glass door'),
              ('prj-b049', 'Marble-look shower wall with a lit chevron niche'),
              ('prj-b008', 'Walk-in glass shower with a hexagon tile floor under skylights'),
              ('prj-b061', 'Shower with a blue hexagon tile wall')],
        included_title='What a shower <br>project includes',
        tiles=[('Walk‑in showers', 'Curbless or low‑curb showers with glass.'),
               ('Steam showers', 'Sealed enclosures with a steam generator.'),
               ('Waterproofing', 'A waterproof membrane behind every tiled wall and floor.'),
               ('Niches and benches', 'Built‑in niches and seats, tiled to match.'),
               ('Heated floors', 'Electric radiant heat under the new tile.'),
               ('Glass and fixtures', 'Frameless glass, valves and shower heads.')],
        gallery=dict(title='Shower projects', lead='Real showers we built <br class="br-compact">in Chester County.', button='See all projects',
                     big=('prj-b049', 'Marble-look shower wall with a lit chevron niche'),
                     stack=[('prj-bluetile', 'Walk-in shower with blue subway tile'), ('prj-b061', 'Shower with a blue hexagon tile wall')],
                     bottom=[('prj-b008', 'Walk-in glass shower with a hexagon tile floor under skylights'), ('svc-shower', 'Walk-in shower with large marble-look tile'), ('prj-b035', 'Shower wall with blue glazed subway tile')]),
        timeline_title='From estimate <br class="br-compact">to first shower',
        timeline_lead='How a shower project runs, <br class="br-compact">step by step.',
        steps=[('Design and estimate', 'We measure, pick the layout and finishes with you and send a written estimate.'),
               ('Ordering', 'Tile, glass, valves and heating mats ordered before demolition.'),
               ('Demolition and rough‑in', 'Old shower out, plumbing moved, heating mats wired by an electrician.'),
               ('Waterproofing and tile', 'Membrane on walls and floor, then tile, niches and benches.'),
               ('Glass and walkthrough', 'Glass and fixtures installed, then a final walkthrough together.')],
        faq_title='Showers and <br>heated floors FAQ',
        faq=[('What is the difference between a walk‑in and a steam shower?', 'A walk‑in shower is an open tiled shower with glass. A steam shower is fully sealed and has a steam generator, so it needs more planning.'),
             ('Can you add heated floors to an existing bathroom?', 'Yes, when the floor tile is replaced. The heating mat goes under the new tile.'),
             ('How much do heated floors cost to run?', 'It depends on the room size and how long the floor is on. We go through it for your room during the estimate.')],
    ),
    'decks-and-exteriors': dict(
        meta='Composite and wood decks, railings, fiber cement and vinyl siding in West Chester and Chester County, built by our own crew. Free written estimate.',
        title='Decks and exteriors <br>in West Chester, PA',
        lead='Composite and wood decks, fiber cement and vinyl siding, <br class="br-design">built and installed by our own crew.',
        hero=[('svc-exterior', 'New composite deck with white railings'),
              ('prj-pool', 'Backyard pool with a paver surround')],
        included_title='What a deck <br>or siding job includes',
        tiles=[('Composite decks', 'Low‑maintenance boards with hidden fasteners.'),
               ('Wood decks', 'Pressure‑treated or hardwood decking.'),
               ('Railings', 'Composite, aluminum or wood railings.'),
               ('Stairs and landings', 'Steps and landings built to code.'),
               ('Fiber cement siding', 'Lap and panel siding with new trim.'),
               ('Vinyl siding', 'Insulated or standard vinyl siding.')],
        gallery=None,
        timeline_title='From estimate <br class="br-compact">to first cookout',
        timeline_lead='How a deck or siding job runs, <br class="br-compact">step by step.',
        steps=[('Design and estimate', 'We measure, bring material samples and send a written estimate.'),
               ('Permits and materials', 'We pull the permit and order boards, railings or siding.'),
               ('Footings and framing', 'Footings dug and inspected, the frame built; for siding, the old siding comes off.'),
               ('Decking, railings, siding', 'Boards, railings and stairs installed, or siding and trim hung.'),
               ('Cleanup and walkthrough', 'The yard cleaned up, then a final walkthrough together.')],
        faq_title='Decks and <br>exteriors FAQ',
        faq=[('Composite or wood?', 'Composite needs less upkeep, wood costs less up front. We bring samples of both to the visit.'),
             ('Does a deck need a permit?', 'Most do. We pull the permit and schedule the inspections.'),
             ('Do you replace siding?', 'Yes, fiber cement and vinyl, including trim and wraps.')],
    ),
    'interior-and-flooring': dict(
        meta='LVP and tile floors, painting, wallpaper, mudrooms and saunas in West Chester and Chester County, done by our own crew. Free written estimate.',
        title='Interior and flooring <br>in West Chester, PA',
        lead='LVP and tile floors, paint, wallpaper, mudrooms and saunas, <br class="br-design">done by our own crew.',
        hero=[('svc-floor', 'Wide-plank vinyl floor in a remodeled kitchen'),
              ('kitchen-k8283', 'White kitchen with a marble-look counter and vinyl plank floor')],
        included_title='What interior <br>work includes',
        tiles=[('LVP floors', 'Waterproof luxury vinyl plank for any room.'),
               ('Tile floors', 'Porcelain and ceramic tile, laid flat and level.'),
               ('Painting', 'Walls, ceilings and trim, with furniture protected.'),
               ('Wallpaper', 'Accent walls and full rooms, hung and trimmed.'),
               ('Mudrooms', 'Built‑in benches, hooks and storage.'),
               ('Saunas', 'Indoor saunas framed, wired and finished.')],
        gallery=None,
        timeline_title='From estimate <br class="br-compact">to finished room',
        timeline_lead='How interior work runs, <br class="br-compact">step by step.',
        steps=[('Visit and estimate', 'We measure, bring samples and send a written estimate.'),
               ('Materials ordered', 'Flooring, paint and wallpaper ordered for your rooms.'),
               ('Prep and protection', 'Furniture moved and covered, floors protected, old flooring out.'),
               ('Install and paint', 'Floors laid, walls painted or papered, built‑ins finished.'),
               ('Cleanup and walkthrough', 'Furniture back in place, then a final walkthrough together.')],
        faq_title='Interior and <br>flooring FAQ',
        faq=[('Can you do the floors in the whole house?', 'Yes. We plan the rooms in an order that keeps the house usable while we work.'),
             ('Do I need to move the furniture?', 'No. We move and cover it, then put it back.'),
             ('Do you build saunas?', 'Yes. Indoor saunas are framed, wired by a licensed electrician and finished by our crew.')],
    ),
}

HERO_SIZES = '(max-width: 1279.98px) 100vw, (min-width: 1920px) 1112px, 820px'
RELATED_SIZES = '(max-width: 480px) 290px, (max-width: 1279.98px) 363px, (min-width: 1920px) 549px, 412px'


def gallery_html(g):
    if not g:
        return ''
    big_img, big_alt = g['big']
    stack = '\n'.join(f'              <div class="gallery__item">{{{{pic {img}||(max-width: 1279.98px) 50vw, (min-width: 1920px) 632px, 474px|632|352|{alt}}}}}</div>' for img, alt in g['stack'])
    bottom = []
    for i, (img, alt) in enumerate(g['bottom']):
        if i < 2:
            bottom.append(f'            <div class="gallery__item">{{{{pic {img}||(max-width: 1279.98px) 50vw, (min-width: 1920px) 549px, 412px|549|560|{alt}}}}}</div>')
        else:  # the phone grid is 1 big + 2 × 2
            bottom.append(f'            <div class="gallery__item d-only">{{{{pic {img}||(min-width: 1920px) 549px, 412px|549|560|{alt}}}}}</div>')
    bottom = '\n'.join(bottom)
    return f'''
    <!-- Project gallery (Kitchen projects pattern, node 89:933 / 89:1360) -->
    <section class="section kprojects" aria-labelledby="kprojects-title">
      <div class="container">
        <div class="section-head">
          <div class="section-head__text">
            <h2 class="title" id="kprojects-title">{g['title']}</h2>
            <p class="lead">{g['lead']}</p>
          </div>
          <div class="section-head__aside">
            <a class="btn" href="/projects/">{g['button']} <span class="icon icon--arrow" aria-hidden="true"></span></a>
          </div>
        </div>
        <div class="gallery">
          <div class="gallery__top">
            <div class="gallery__item gallery__item--big">{{{{pic {big_img}||(max-width: 1279.98px) 100vw, (min-width: 1920px) 1032px, 774px|1032|720|{big_alt}}}}}</div>
            <div class="gallery__stack">
{stack}
            </div>
          </div>
          <div class="gallery__bottom">
{bottom}
          </div>
        </div>
      </div>
    </section>
'''


def hero_media(photos):
    """One photo, or a crossfading slideshow (initSlideshow) when there are several."""
    if len(photos) == 1:
        img, alt = photos[0]
        return f'<div class="page-hero__media">\n        {{{{pic {img}||{HERO_SIZES}|820|988|{alt}|lcp}}}}\n      </div>'
    items = ';'.join(f'{img}:{alt}' for img, alt in photos)
    return (f'<div class="page-hero__media" data-slideshow data-interval="4500" role="group" aria-roledescription="carousel" aria-label="Projects we finished">\n'
            f'        {{{{slides {HERO_SIZES}|820|988|Projects we finished|{items}}}}}\n      </div>')


def page_html(slug, p):
    name = next(s[2] for s in SERVICES if s[0] == slug)
    tiles = '\n'.join(f'          <li class="value-tile"><h3 class="value-tile__title">{t}</h3><p class="value-tile__text">{d}</p></li>' for t, d in p['tiles'])
    steps = '\n'.join(f'          <li class="why-row"><span class="why-row__num">{i:02d}</span><h3 class="why-row__title">{t}</h3><p class="why-row__text">{d}</p></li>' for i, (t, d) in enumerate(p['steps'], 1))
    faq = []
    for i, (q, a) in enumerate(p['faq'], 1):
        first = i == 1
        faq.append(f'''          <div class="faq-item{' is-open' if first else ''}">
            <h3><button class="faq-item__btn" type="button" aria-expanded="{'true' if first else 'false'}" aria-controls="faq-{i}" id="faq-q-{i}"><span class="faq-item__q">{q}</span> <span class="faq-item__icon" aria-hidden="true"></span></button></h3>
            <div class="faq-item__panel" id="faq-{i}" role="region" aria-labelledby="faq-q-{i}"><div class="faq-item__inner"><p class="faq-item__answer">{a}</p></div></div>
          </div>''')
    faq = '\n'.join(faq)
    related = '\n'.join(f'''            <a class="swiper-slide svc-card related-card" href="/services/{s}/">
              <div class="svc-card__media">{{{{pic {img}||{RELATED_SIZES}|549|420|{alt}}}}}</div>
              <div class="svc-card__head"><h3 class="svc-card__title">{t}</h3><span class="icon icon--arrow" aria-hidden="true"></span></div>
              <p class="svc-card__desc">{d}</p>
            </a>''' for s, img, t, d, alt in SERVICES if s != slug)
    return f'''<!doctype html>
<html lang="en">
<head>
  {{{{include head}}}}
  <title>{name} in West Chester, PA | AMK Construction</title>
  <meta name="description" content="{p['meta']}">
</head>
<body>
  <a class="skip-link" href="#main">Skip to content</a>

  {{{{include header|services}}}}

  <main id="main">
    <!-- Generated by tools/gen-service-pages.py (Kitchen page structure, photo hero) -->
    <section class="page-hero page-hero--photo page-hero--short page-hero--services" aria-labelledby="page-title">
      <div class="page-hero__body">
        <nav class="breadcrumbs" aria-label="Breadcrumb"><a href="/">Home</a><span aria-hidden="true">/</span><a href="/services/">Services</a><span aria-hidden="true">/</span><span aria-current="page">{name}</span></nav>
        <h1 class="{' '.join(filter(None, ['page-hero__title', p.get('title_class')]))}" id="page-title">{p['title']}</h1>
        <p class="page-hero__lead">{p['lead']}</p>
        <div class="page-hero__cta">
          <a class="btn" href="/contact/" data-modal-open>Get a free estimate <span class="icon icon--arrow" aria-hidden="true"></span></a>
          <a class="btn btn--outline" href="tel:+13022419466">Call (302) 241‑9466 <span class="icon icon--arrow" aria-hidden="true"></span></a>
        </div>
        <p class="page-hero__note d-only">Free written estimate, no obligation</p>
      </div>
      {hero_media(p['hero'])}
    </section>

    {{{{include trust}}}}

    <section class="section values included" aria-labelledby="included-title">
      <div class="container">
        <h2 class="title" id="included-title">{p['included_title']}</h2>
        <p class="lead section-lead">Everything below is planned, priced <br class="br-compact">and built by our own crew.</p>
        <ul class="values__tiles">
{tiles}
        </ul>
      </div>
    </section>
{gallery_html(p['gallery'])}
    <section class="section why timeline" aria-labelledby="timeline-title">
      <div class="container">
        <h2 class="title" id="timeline-title">{p['timeline_title']}</h2>
        <p class="lead section-lead">{p['timeline_lead']}</p>
        <ol class="why__rows">
{steps}
        </ol>
      </div>
    </section>

    {{{{include reviews}}}}

    <section class="section faq faq--wide" id="faq" aria-labelledby="faq-title">
      <div class="container faq__inner">
        <div class="faq__intro">
          <h2 class="title" id="faq-title">{p['faq_title']}</h2>
          <p class="lead d-only">Still unsure? Call <a href="tel:+13022419466">(302) 241‑9466</a> and talk to Alex directly.</p>
        </div>
        <div class="faq__list" data-accordion>
{faq}
        </div>
      </div>
    </section>

    <section class="section related" aria-labelledby="related-title">
      <div class="container">
        <div class="section-head">
          <div class="section-head__text">
            <h2 class="title" id="related-title">Related services</h2>
          </div>
          <div class="section-head__aside">
            <button class="round-btn round-btn--prev" type="button" aria-label="Previous service" data-related-prev><span class="icon icon--prev" aria-hidden="true"></span></button>
            <button class="round-btn round-btn--next" type="button" aria-label="Next service" data-related-next><span class="icon icon--next" aria-hidden="true"></span></button>
          </div>
        </div>
        <div class="swiper related__slider" data-slider="related" data-slider-label="service">
          <div class="swiper-wrapper">
{related}
          </div>
        </div>
        <div class="slider-controls m-only">
          <div class="slider-dots" data-dots-for="related" role="group" aria-label="Choose a service"></div>
          <div class="slider-controls__arrows">
            <button class="round-btn round-btn--prev" type="button" aria-label="Previous service" data-related-prev><span class="icon icon--prev" aria-hidden="true"></span></button>
            <button class="round-btn round-btn--next" type="button" aria-label="Next service" data-related-next><span class="icon icon--next" aria-hidden="true"></span></button>
          </div>
        </div>
      </div>
    </section>

    {{{{include estimate}}}}
  </main>

  {{{{include footer}}}}

  {{{{include overlays}}}}
</body>
</html>
'''


def main():
    for slug, data in PAGES.items():
        out = ROOT / 'src' / 'services' / slug / 'index.html'
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_text(page_html(slug, data))
        print(f'{out.relative_to(ROOT)}')


if __name__ == '__main__':
    main()
