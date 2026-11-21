/* AMK Construction: Lenis smooth scroll, sticky header, mega menus, scroll animations, projects slider, FAQ,
   custom dropdowns, estimate modal, forms, service-area map. Every init returns early
   when its markup is missing, so the same file serves every page. */
(() => {
  const root = document.documentElement;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const canHover = matchMedia('(hover: hover) and (pointer: fine)');
  const compactMq = matchMedia('(max-width: 1279.98px)');
  let lenis = null;

  /* ---------- Smooth scroll (Lenis) ----------
     Own rAF loop; off with reduced motion; stopped while the modal is open (initModal).
     In-page # links go through lenis.scrollTo. Inner scroll areas carry data-lenis-prevent. */
  function initSmoothScroll() {
    if (reducedMotion.matches || typeof window.Lenis !== 'function') return;
    lenis = new window.Lenis({ lerp: 0.1, smoothWheel: true, wheelMultiplier: 1 });
    const raf = (time) => {
      lenis.raf(time);
      requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);
  }

  function initAnchorLinks() {
    const header = document.querySelector('[data-header]');
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[href^="#"]');
      if (!link || link.hasAttribute('data-modal-open') || e.defaultPrevented) return;
      const id = link.getAttribute('href').slice(1);
      const target = id === 'top' ? document.body : document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      const y = id === 'top' ? 0 : target.getBoundingClientRect().top + scrollY;
      // Going up the header comes back, so leave room for it; going down it hides
      const offset = y < scrollY && header ? -header.offsetHeight : 0;
      if (lenis) lenis.scrollTo(y + offset, { duration: 1.2 });
      else scrollTo({ top: y + offset, behavior: reducedMotion.matches ? 'auto' : 'smooth' });
      history.replaceState(null, '', `#${id}`);
    });
  }

  /* ---------- --fixed-vh: set in <head>; updated only when the width changes ---------- */
  function initFixedVh() {
    let lastWidth = innerWidth;
    addEventListener('resize', () => {
      if (innerWidth === lastWidth) return;
      lastWidth = innerWidth;
      root.style.setProperty('--fixed-vh', innerHeight + 'px');
    });
  }

  /* ---------- Skip link shows only for keyboard users ---------- */
  function initKeyboardMode() {
    addEventListener('keydown', (e) => e.key === 'Tab' && root.classList.add('has-kbd'));
    addEventListener('pointerdown', () => root.classList.remove('has-kbd'));
  }

  /* ---------- Sticky header: hides while scrolling down, comes back on the way up ---------- */
  function initHeader() {
    const header = document.querySelector('[data-header]');
    if (!header) return;
    let last = scrollY;
    let ticking = false;

    const update = () => {
      ticking = false;
      const y = Math.max(0, scrollY);
      header.classList.toggle('is-scrolled', y > 4);
      if (Math.abs(y - last) < 6) return;
      const menuOpen = header.querySelector('[data-mega].is-open');
      const hide = y > last && y > header.offsetHeight && !menuOpen && !root.classList.contains('is-locked');
      header.classList.toggle('is-hidden', hide);
      last = y;
    };

    addEventListener('scroll', () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    }, { passive: true });
    // Keyboard users tabbing into a hidden header get it back
    header.addEventListener('focusin', () => header.classList.remove('is-hidden'));
    update();
  }

  /* ---------- Mega menus (nodes 2004:52, 2004:154) ----------
     Mouse: open on hover with a short intent delay, close shortly after leaving.
     Keyboard / touch: the button toggles. Esc, outside click and focus leaving close it.
     The picture beside the links follows the hovered link ([data-promo] → [data-promo-img]). */
  function initMegaMenus() {
    const items = [...document.querySelectorAll('[data-mega]')];
    if (!items.length) return;
    const OPEN_DELAY = 0;
    const CLOSE_DELAY = 180;

    const hydrate = (item) => {
      item.querySelectorAll('img[data-srcset]').forEach((img) => {
        img.srcset = img.dataset.srcset;
        img.removeAttribute('data-srcset');
      });
    };

    const setPromo = (item, name) => {
      const media = item.querySelector('[data-promo-media]');
      if (!media) return;
      const target = media.querySelector(`[data-promo-img="${name}"]`) || media.querySelector('.mega__img');
      media.querySelectorAll('.mega__img').forEach((img) => img.classList.toggle('is-active', img === target));
    };
    const resetPromo = (item) => {
      const first = item.querySelector('.mega__img');
      if (first) setPromo(item, first.dataset.promoImg);
    };

    const close = (item) => {
      if (!item.classList.contains('is-open')) return;
      item.classList.remove('is-open');
      item.querySelector('.nav__link').setAttribute('aria-expanded', 'false');
      clearTimeout(item._resetTimer);
      item._resetTimer = setTimeout(() => resetPromo(item), 450);
    };
    const open = (item) => {
      items.forEach((other) => other !== item && close(other));
      hydrate(item);
      clearTimeout(item._resetTimer);
      item.classList.add('is-open');
      item.querySelector('.nav__link').setAttribute('aria-expanded', 'true');
    };

    items.forEach((item) => {
      const button = item.querySelector('.nav__link');
      let pointerType = '';

      item.addEventListener('pointerenter', (e) => {
        if (e.pointerType !== 'mouse') return;
        clearTimeout(item._timer);
        item._timer = setTimeout(() => open(item), item.classList.contains('is-open') ? 0 : OPEN_DELAY);
      });
      item.addEventListener('pointerleave', (e) => {
        if (e.pointerType !== 'mouse') return;
        clearTimeout(item._timer);
        item._timer = setTimeout(() => close(item), CLOSE_DELAY);
      });

      button.addEventListener('pointerdown', (e) => (pointerType = e.pointerType));
      button.addEventListener('click', () => {
        // A mouse already opened it on hover: a click should not close it again
        if (pointerType === 'mouse' && canHover.matches) {
          pointerType = '';
          open(item);
          return;
        }
        pointerType = '';
        if (item.classList.contains('is-open')) close(item);
        else open(item);
      });

      item.querySelectorAll('[data-promo]').forEach((link) => {
        const show = () => setPromo(item, link.dataset.promo);
        link.addEventListener('pointerenter', show);
        link.addEventListener('focus', show);
      });

      item.addEventListener('keydown', (e) => {
        if (e.key !== 'Escape' || !item.classList.contains('is-open')) return;
        close(item);
        button.focus();
      });
      item.addEventListener('focusout', (e) => {
        if (!item.contains(e.relatedTarget)) close(item);
      });
      // Choosing a link (or the promo button) closes the menu
      item.querySelectorAll('.mega a').forEach((a) => a.addEventListener('click', () => close(item)));
    });

    document.addEventListener('click', (e) => {
      items.forEach((item) => !item.contains(e.target) && close(item));
    });
  }

  /* ---------- Scroll animations (AOS): attributes come from this one list ---------- */
  const ANIMATIONS = [
    { selector: '.trust__item', effect: 'fade-up', stagger: 100, offset: 0 },

    { selector: '.page-hero__body > *', effect: 'fade-up', stagger: 80, offset: 0 },
    { selector: '.story__title, .story__text > p', effect: 'fade-up', stagger: 100 },
    { selector: '.values .title', effect: 'fade-up' },
    { selector: '.value-tile', effect: 'fade-up', stagger: 100 },
    { selector: '.work__slider', effect: 'fade-up', delay: 100, media: '(min-width: 1280px)' },
    { selector: '.section-lead', effect: 'fade-up', delay: 100 },
    { selector: '.gallery__item', effect: 'fade-up', stagger: 80 },
    { selector: '.related__slider', effect: 'fade-up', delay: 100, media: '(min-width: 1280px)' },

    { selector: '.intro__body > *', effect: 'fade-up', stagger: 100 },
    { selector: '.intro__media', effect: 'fade-up', duration: 1000 },

    { selector: '.section-head__text > *', effect: 'fade-up', stagger: 100 },
    { selector: '.section-head__aside', effect: 'fade-up', delay: 200 },
    { selector: '.why .title, .process .title', effect: 'fade-up' },

    { selector: '.svc-card', effect: 'fade-up', stagger: 100, staggerGroup: 3, media: '(min-width: 1280px)' },
    { selector: '.svc-card', effect: 'fade-up', stagger: 120, staggerGroup: 2, media: '(max-width: 1279.98px)' },
    { selector: '.why-row', effect: 'fade-up', stagger: 80 },
    { selector: '.projects__slider', effect: 'fade-up', delay: 100, media: '(min-width: 1280px)' },

    { selector: '.reviews__summary', effect: 'fade-up' },
    { selector: '.review-card', effect: 'fade-up', stagger: 100, media: '(min-width: 1280px)' },

    { selector: '.step', effect: 'fade-up', stagger: 100 },

    { selector: '.area__intro > :not(.towns)', effect: 'fade-up', stagger: 100 },
    { selector: '.towns', effect: 'fade-up', delay: 200 },
    { selector: '.area-map', effect: 'fade', duration: 1100, delay: 100 },

    { selector: '.hotel-card', effect: 'fade-up', stagger: 120 },

    { selector: '.faq__intro > *', effect: 'fade-up', stagger: 100 },
    { selector: '.faq-item', effect: 'fade-up', stagger: 70 },

    { selector: '.estimate__media', effect: 'fade-up', duration: 1000 },
    { selector: '.estimate__panel > *', effect: 'fade-up', stagger: 100 },

    { selector: '.footer__top > *', effect: 'fade-up', stagger: 80, offset: 0 },
  ];

  function initAnimations() {
    if (!window.AOS || reducedMotion.matches) return;
    ANIMATIONS.forEach((item) => {
      if (item.media && !matchMedia(item.media).matches) return;
      document.querySelectorAll(item.selector).forEach((node, index) => {
        const step = item.staggerGroup ? index % item.staggerGroup : index;
        // aos.css only ships delay rules in steps of 50 ms
        const delay = Math.round(((item.delay || 0) + (item.stagger || 0) * step) / 50) * 50;
        node.setAttribute('data-aos', item.effect);
        if (delay) node.setAttribute('data-aos-delay', String(Math.min(delay, 3000)));
        if (item.duration) node.setAttribute('data-aos-duration', String(item.duration));
        if (item.offset !== undefined) node.setAttribute('data-aos-offset', String(item.offset));
      });
    });
    window.AOS.init({ once: true, duration: 900, easing: 'ease-out-cubic', offset: 80 });
    // Late images and fonts move trigger positions
    addEventListener('load', () => window.AOS.refresh());
  }

  /* ---------- Sliders (Swiper) ----------
     The gap comes from the slider's --slider-gap (24 at 1920, generated ×0.75 on laptops,
     m(12) on compact screens), re-read on resize. Compact screens add dots
     ([data-dots-for]) and a second pair of arrows under the track. */
  const sliderGap = (el) => parseFloat(getComputedStyle(el).columnGap) || 0;

  function bindDots(swiper, holder) {
    if (!holder) return;
    const render = () => {
      const count = swiper.snapGrid.length;
      if (holder.children.length !== count) {
        holder.replaceChildren(...Array.from({ length: count }, (_, i) => {
          const dot = document.createElement('button');
          dot.type = 'button';
          dot.className = 'slider-dot';
          dot.setAttribute('aria-label', `Go to ${i + 1} of ${count}`);
          dot.addEventListener('click', () => swiper.slideTo(i));
          return dot;
        }));
      }
      [...holder.children].forEach((dot, i) => {
        const active = i === swiper.snapIndex;
        dot.classList.toggle('is-active', active);
        dot.setAttribute('aria-current', String(active));
      });
    };
    swiper.on('snapIndexChange snapGridLengthChange resize', render);
    render();
  }

  function createSlider(el, name, label) {
    const { Navigation, Keyboard, A11y } = window.SwiperModules;
    const swiper = new window.Swiper(el, {
      modules: [Navigation, Keyboard, A11y],
      slidesPerView: 'auto',
      spaceBetween: sliderGap(el),
      speed: reducedMotion.matches ? 0 : (compactMq.matches ? 480 : 850),
      threshold: 4,
      longSwipesRatio: 0.2,
      grabCursor: true,
      resistanceRatio: 0.55,
      keyboard: { enabled: true, onlyInViewport: true },
      navigation: {
        prevEl: [...document.querySelectorAll(`[data-${name}-prev]`)],
        nextEl: [...document.querySelectorAll(`[data-${name}-next]`)],
      },
      a11y: { prevSlideMessage: `Previous ${label}`, nextSlideMessage: `Next ${label}` },
      on: {
        touchStart: () => !compactMq.matches && el.classList.add('is-grabbing'),
        touchEnd: () => el.classList.remove('is-grabbing'),
        resize: (sw) => {
          const gap = sliderGap(el);
          if (gap !== sw.params.spaceBetween) {
            sw.params.spaceBetween = gap;
            sw.update();
          }
        },
      },
    });
    bindDots(swiper, document.querySelector(`[data-dots-for="${name}"]`));
    // Load every slide's photo once the slider is near, so none decodes in the middle of a swipe
    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      io.disconnect();
      el.querySelectorAll('img[loading="lazy"]').forEach((img) => (img.loading = 'eager'));
    }, { rootMargin: '600px 0px' });
    io.observe(el);
    return swiper;
  }

  /* Every [data-slider="name"]: Recent projects (home), Our work (About), …
     Arrows are [data-<name>-prev|next], dots [data-dots-for="<name>"]. */
  function initSliders() {
    if (!window.Swiper) return;
    document.querySelectorAll('[data-slider]').forEach((el) => {
      createSlider(el, el.dataset.slider, el.dataset.sliderLabel || 'slide');
    });
  }

  /* Google reviews: a 2 × 2 grid on desktop, a swipe track on compact screens (node 56:43) */
  function initReviewsSlider() {
    const el = document.querySelector('[data-reviews-slider]');
    if (!el || !window.Swiper) return;
    const compact = matchMedia('(max-width: 1279.98px)');
    let swiper = null;
    const sync = () => {
      if (compact.matches && !swiper) {
        swiper = createSlider(el, 'reviews', 'review');
      } else if (!compact.matches && swiper) {
        swiper.destroy(true, true);
        swiper = null;
        document.querySelector('[data-dots-for="reviews"]')?.replaceChildren();
      }
    };
    compact.addEventListener('change', sync);
    sync();
  }

  /* ---------- Mobile menu (node 57:2) ----------
     Burger opens a full-screen panel; Services / Hotel Services are accordions.
     Page scroll (and Lenis) stops while it is open; Esc and any link close it. */
  function initMobileMenu() {
    const menu = document.querySelector('[data-mobile-menu]');
    const opener = document.querySelector('[data-menu-open]');
    if (!menu || !opener) return;
    const compact = matchMedia('(max-width: 1279.98px)');

    const open = () => {
      menu.inert = false;
      menu.classList.add('is-open');
      opener.setAttribute('aria-expanded', 'true');
      root.classList.add('is-locked', 'is-menu-open');
      lenis?.stop();
      menu.querySelector('[data-menu-close]')?.focus({ preventScroll: true });
    };
    const close = (refocus = true) => {
      if (!menu.classList.contains('is-open')) return;
      menu.classList.remove('is-open');
      menu.inert = true;
      opener.setAttribute('aria-expanded', 'false');
      root.classList.remove('is-locked', 'is-menu-open');
      lenis?.start();
      if (refocus) opener.focus({ preventScroll: true });
    };

    opener.addEventListener('click', open);
    // Closing first lets the link's own action run on an unlocked page (anchor scroll, popup)
    menu.querySelectorAll('[data-menu-close]').forEach((el) => {
      el.addEventListener('click', () => close(el.tagName === 'BUTTON'));
    });
    menu.addEventListener('keydown', (e) => e.key === 'Escape' && close());
    compact.addEventListener('change', () => !compact.matches && close(false));

    menu.querySelectorAll('[data-menu-group]').forEach((group) => {
      const toggle = group.querySelector('.mnav__link');
      toggle.addEventListener('click', () => {
        const isOpen = !group.classList.contains('is-open');
        group.classList.toggle('is-open', isOpen);
        toggle.setAttribute('aria-expanded', String(isOpen));
      });
    });
  }

  /* ---------- Sticky call / estimate bar (node 47:374) ----------
     Compact screens only: slides up once the hero has scrolled away and hides again
     from the estimate form down (form and footer stay uncovered). */
  function initStickyCta() {
    const bar = document.querySelector('[data-sticky-cta]');
    const hero = document.querySelector('.hero');
    if (!bar || !hero) return;
    const form = document.querySelector('#estimate');
    let heroVisible = true;
    let formReached = false;
    const sync = () => bar.classList.toggle('is-visible', !heroVisible && !formReached);
    new IntersectionObserver(([entry]) => {
      heroVisible = entry.isIntersecting;
      sync();
    }).observe(hero);
    if (form) {
      // on screen, or already scrolled past it into the footer
      new IntersectionObserver(([entry]) => {
        formReached = entry.isIntersecting || entry.boundingClientRect.top < 0;
        sync();
      }).observe(form);
    }
  }

  /* ---------- Intro slideshow ([data-slideshow]) ----------
     Endless crossfade with a slow zoom-out, one photo every SLIDE_TIME. Runs only while
     the block is on screen and the tab is visible; reduced motion = first photo only. */
  const SLIDE_TIME = 3200;

  function initSlideshow() {
    document.querySelectorAll('[data-slideshow]').forEach((box) => {
      const slides = [...box.querySelectorAll('[data-slide]')];
      if (slides.length < 2 || reducedMotion.matches) return;
      let current = 0;
      let timer = 0;
      let visible = false;

      const show = (index) => {
        current = index % slides.length;
        slides.forEach((slide, i) => {
          slide.classList.toggle('is-active', i === current);
          slide.setAttribute('aria-hidden', String(i !== current));
        });
      };
      const stop = () => {
        clearTimeout(timer);
        timer = 0;
      };
      const run = () => {
        stop();
        if (!visible || document.hidden) return;
        timer = setTimeout(() => {
          show(current + 1);
          run();
        }, SLIDE_TIME);
      };

      new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
        run();
      }, { threshold: 0.1 }).observe(box);
      document.addEventListener('visibilitychange', run);
    });
  }

  /* ---------- FAQ accordion (node 42:502): one item open at a time ---------- */
  function initAccordion() {
    document.querySelectorAll('[data-accordion]').forEach((list) => {
      const items = [...list.querySelectorAll('.faq-item')];
      const setOpen = (item, isOpen) => {
        item.classList.toggle('is-open', isOpen);
        item.querySelector('.faq-item__btn').setAttribute('aria-expanded', String(isOpen));
      };
      items.forEach((item) => {
        item.querySelector('.faq-item__btn').addEventListener('click', () => {
          const isOpen = !item.classList.contains('is-open');
          items.forEach((other) => other !== item && setOpen(other, false));
          setOpen(item, isOpen);
        });
      });
    });
  }

  /* ---------- Custom dropdown ([data-dropdown], Project type) ----------
     Toggle with aria-expanded, listbox with aria-activedescendant. The value lives in the
     root's data-value and a hidden input; a `change` event fires on the root. */
  function initDropdowns() {
    const all = [...document.querySelectorAll('[data-dropdown]')];
    if (!all.length) return;

    all.forEach((dd) => {
      const toggle = dd.querySelector('.select__toggle');
      const menu = dd.querySelector('.select__menu');
      const valueEl = dd.querySelector('.select__value');
      const input = dd.querySelector('input[type="hidden"]');
      const options = [...dd.querySelectorAll('.select__option')];
      let active = -1;

      const highlight = (index) => {
        options.forEach((o, i) => o.classList.toggle('is-focused', i === index));
        active = index;
        if (index >= 0) {
          menu.setAttribute('aria-activedescendant', options[index].id);
          options[index].scrollIntoView({ block: 'nearest' });
        } else {
          menu.removeAttribute('aria-activedescendant');
        }
      };
      const open = () => {
        all.forEach((other) => other !== dd && other._close?.());
        dd.classList.add('is-open');
        toggle.setAttribute('aria-expanded', 'true');
        // open upwards when the list would not fit below (e.g. in the mobile bottom sheet)
        const box = toggle.getBoundingClientRect();
        const below = innerHeight - box.bottom;
        dd.classList.toggle('is-up', below < menu.scrollHeight + 16 && box.top > below);
        const selected = options.findIndex((o) => o.getAttribute('aria-selected') === 'true');
        highlight(selected >= 0 ? selected : 0);
        menu.focus({ preventScroll: true });
      };
      const close = (refocus) => {
        if (!dd.classList.contains('is-open')) return;
        dd.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
        highlight(-1);
        if (refocus) toggle.focus({ preventScroll: true });
      };
      const choose = (index) => {
        const option = options[index];
        options.forEach((o) => o.setAttribute('aria-selected', String(o === option)));
        dd.dataset.value = option.dataset.value;
        input.value = option.dataset.value;
        valueEl.textContent = option.dataset.value;
        dd.classList.add('has-value');
        dd.dispatchEvent(new Event('change', { bubbles: true }));
        close(true);
      };
      dd._close = () => close(false);
      dd._reset = () => {
        options.forEach((o) => o.setAttribute('aria-selected', 'false'));
        delete dd.dataset.value;
        input.value = '';
        valueEl.textContent = valueEl.dataset.placeholder;
        dd.classList.remove('has-value');
        close(false);
      };

      // A tap on the toggle must not first close the list through focusout (touch browsers
      // don't focus buttons on tap) and then reopen it with the click
      let pressingToggle = false;
      toggle.addEventListener('pointerdown', () => (pressingToggle = true));
      toggle.addEventListener('click', () => {
        pressingToggle = false;
        if (dd.classList.contains('is-open')) close(true);
        else open();
      });
      toggle.addEventListener('keydown', (e) => {
        if (!['ArrowDown', 'ArrowUp'].includes(e.key)) return;
        e.preventDefault();
        open();
      });
      options.forEach((option, i) => {
        option.addEventListener('click', () => choose(i));
        option.addEventListener('pointermove', () => active !== i && highlight(i));
      });
      menu.addEventListener('keydown', (e) => {
        const last = options.length - 1;
        const keys = {
          ArrowDown: () => highlight(Math.min(last, active + 1)),
          ArrowUp: () => highlight(Math.max(0, active - 1)),
          Home: () => highlight(0),
          End: () => highlight(last),
          Enter: () => active >= 0 && choose(active),
          ' ': () => active >= 0 && choose(active),
          Escape: () => close(true),
        };
        if (e.key === 'Tab') {
          close(false);
          return;
        }
        if (!keys[e.key]) return;
        e.preventDefault();
        e.stopPropagation(); // Esc must not also close the modal around the dropdown
        keys[e.key]();
      });
      menu.addEventListener('focusout', (e) => {
        if (pressingToggle) return;
        if (!dd.contains(e.relatedTarget)) close(false);
      });
    });

    document.addEventListener('pointerdown', (e) => {
      all.forEach((dd) => !dd.contains(e.target) && dd._close());
    });
  }

  /* ---------- Estimate modal (nodes 42:624 form, 42:661 sent): native <dialog> ---------- */
  const modal = document.querySelector('[data-modal]');
  let returnFocus = null;
  let closeTimer = 0;

  function setModalView(name) {
    modal.querySelectorAll('[data-modal-view]').forEach((view) => {
      view.hidden = view.dataset.modalView !== name;
    });
    modal.setAttribute('aria-labelledby', name === 'sent' ? 'modal-sent-title' : 'modal-title');
  }

  // Compact screens: the panel is a bottom sheet that slides up / down (Web Animations, see compact.tpl.css)
  const SHEET_IN = { duration: 750, easing: 'cubic-bezier(0.32, 0.72, 0, 1)' };
  const SHEET_OUT = { duration: 420, easing: 'cubic-bezier(0.4, 0, 0.9, 0.6)', fill: 'forwards' };
  const sheetMode = () => compactMq.matches && !reducedMotion.matches;
  const slideSheet = (from, to, timing) => {
    const panel = modal.querySelector('.modal__panel');
    panel.getAnimations().forEach((a) => a.cancel());
    return panel.animate([{ transform: `translateY(${from})` }, { transform: `translateY(${to})` }], timing);
  };

  // Keep the dialog on the visible part of the screen (mobile keyboards shrink it), so the
  // sheet sits above the keyboard instead of the page being scrolled under it.
  const vv = window.visualViewport;
  function fitToViewport() {
    if (!modal?.open || !vv || !compactMq.matches) {
      modal?.style.removeProperty('height');
      modal?.style.removeProperty('top');
      return;
    }
    modal.style.height = `${vv.height}px`;
    modal.style.top = `${vv.offsetTop}px`;
  }
  vv?.addEventListener('resize', fitToViewport);
  vv?.addEventListener('scroll', fitToViewport);

  function openModal(view = 'form', trigger = document.activeElement) {
    if (!modal) return;
    clearTimeout(closeTimer);
    setModalView(view);
    if (!modal.open) {
      returnFocus = trigger;
      const panel = modal.querySelector('.modal__panel');
      // park the sheet below the screen before the dialog's first paint
      if (sheetMode()) panel.style.transform = 'translateY(100%)';
      modal.showModal();
      root.classList.add('is-locked');
      lenis?.stop();
      fitToViewport();
      if (sheetMode()) {
        slideSheet('100%', '0', SHEET_IN).finished.then(() => panel.style.removeProperty('transform')).catch(() => {});
      }
      requestAnimationFrame(() => requestAnimationFrame(() => modal.classList.add('is-open')));
    }
    const focusTarget = view === 'sent' || compactMq.matches
      ? modal.querySelector(view === 'sent' ? '#modal-sent-title' : '#modal-title')
      : modal.querySelector('#m-name');
    focusTarget?.focus({ preventScroll: true });
  }

  function closeModal() {
    if (!modal?.open) return;
    modal.classList.remove('is-open');
    if (sheetMode()) slideSheet('0', '100%', SHEET_OUT);
    closeTimer = setTimeout(() => {
      modal.close();
      modal.querySelector('.modal__panel').getAnimations().forEach((a) => a.cancel());
      fitToViewport();
      root.classList.remove('is-locked');
      lenis?.start();
      setModalView('form');
      resetForm(modal.querySelector('[data-form]'));
      returnFocus?.focus?.({ preventScroll: true });
    }, reducedMotion.matches ? 0 : (compactMq.matches ? 440 : 380));
  }

  function initModal() {
    if (!modal) return;
    document.addEventListener('click', (e) => {
      const opener = e.target.closest('[data-modal-open]');
      if (!opener) return;
      e.preventDefault();
      openModal('form', opener);
    });
    modal.querySelectorAll('[data-modal-close]').forEach((btn) => btn.addEventListener('click', closeModal));
    // Esc animates out instead of the instant native close
    modal.addEventListener('cancel', (e) => {
      e.preventDefault();
      closeModal();
    });
    // A press on the backdrop (outside the panel) closes
    modal.addEventListener('pointerdown', (e) => {
      if (!e.target.closest('.modal__panel')) closeModal();
    });
  }

  /* ---------- Forms: section form (node 42:537) and the modal form ----------
     No backend yet: a valid submit shows the modal's "sent" view. */
  const VALIDATORS = {
    required: (v) => (v.trim() ? '' : 'Please fill this in.'),
    phone: (v) => (v.replace(/\D/g, '').replace(/^1/, '').length === 10 ? '' : 'Enter a 10-digit phone number.'),
    email: (v) => (!v.trim() || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? '' : 'Enter a valid email.'),
  };

  const check = (input) => {
    const message = VALIDATORS[input.dataset.validate](input.value);
    const error = document.getElementById(input.getAttribute('aria-describedby'));
    input.setAttribute('aria-invalid', String(Boolean(message)));
    if (error) error.textContent = message;
    return !message;
  };

  // US format while typing: (302) 241-9466
  const formatPhone = (value) => {
    const d = value.replace(/\D/g, '').replace(/^1/, '').slice(0, 10);
    if (d.length < 4) return d;
    if (d.length < 7) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
    return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
  };

  function resetForm(form) {
    if (!form) return;
    form.reset();
    form.querySelectorAll('[aria-invalid]').forEach((el) => el.removeAttribute('aria-invalid'));
    form.querySelectorAll('.field-error').forEach((el) => (el.textContent = ''));
    form.querySelectorAll('[data-dropdown]').forEach((dd) => dd._reset?.());
  }

  function initForms() {
    document.querySelectorAll('[data-form]').forEach((form) => {
      const fields = [...form.querySelectorAll('[data-validate]')];
      fields.forEach((input) => {
        input.addEventListener('blur', () => input.value && check(input));
        input.addEventListener('input', () => {
          if (input.type === 'tel') input.value = formatPhone(input.value);
          if (input.getAttribute('aria-invalid') === 'true') check(input);
        });
      });

      form.addEventListener('submit', (event) => {
        event.preventDefault();
        const invalid = fields.filter((input) => !check(input));
        if (invalid.length) {
          invalid[0].focus();
          return;
        }
        // TODO: send new FormData(form) to form.getAttribute('action') once the backend exists
        const fromModal = Boolean(form.closest('[data-modal]'));
        resetForm(form);
        openModal('sent', fromModal ? returnFocus : form.querySelector('[type="submit"]'));
      });
    });
  }

  /* ---------- Service-area map (node 42:417) ----------
     The static Figma composition (pins, labels, tooltip) works on its own. When the section
     comes near, MapLibre GL + OpenFreeMap tiles load (page bundle) and a live map fades in
     with the same pins and tooltip. Towns in the list and pins on the map drive one tooltip. */
  const TOWNS = {
    'west-chester': { name: 'West Chester, PA', note: 'Our home base', lng: -75.6055, lat: 39.9607, home: true },
    exton: { name: 'Exton, PA', note: 'Chester County', lng: -75.6207, lat: 40.029, side: 'top' },
    malvern: { name: 'Malvern, PA', note: 'Chester County', lng: -75.5138, lat: 40.0362, side: 'top' },
    downingtown: { name: 'Downingtown, PA', note: 'Chester County', lng: -75.7033, lat: 40.0065, side: 'left' },
    paoli: { name: 'Paoli, PA', note: 'Chester County', lng: -75.4766, lat: 40.042, side: 'right' },
    'east-goshen': { name: 'East Goshen, PA', note: 'Chester County', lng: -75.5427, lat: 39.9935, side: 'right' },
    westtown: { name: 'Westtown, PA', note: 'Chester County', lng: -75.5527, lat: 39.9437, side: 'right' },
    'glen-mills': { name: 'Glen Mills, PA', note: 'Delaware County', lng: -75.4877, lat: 39.9134, side: 'right' },
    wilmington: { name: 'Wilmington, DE', note: 'New Castle County, DE', lng: -75.5484, lat: 39.7447, side: 'right' },
  };
  const MAP_EXTRAS = [
    { label: 'Philadelphia', lng: -75.1652, lat: 39.9526, kind: 'city' },
    { label: 'CHESTER COUNTY', lng: -75.8, lat: 39.835, kind: 'county' },
  ];
  // The tooltip sits below-left of the pin: its top-right corner 18px left of and 16px below the pin centre (Figma)
  const TIP_GAP_X = 18;
  const TIP_GAP_Y = 16;

  const loadScript = (src) => new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = src;
    s.onload = resolve;
    s.onerror = reject;
    document.head.append(s);
  });
  const loadCss = (href) => new Promise((resolve, reject) => {
    const l = document.createElement('link');
    l.rel = 'stylesheet';
    l.href = href;
    l.onload = resolve;
    l.onerror = reject;
    document.head.append(l);
  });

  function initServiceMap() {
    const box = document.querySelector('[data-area-map]');
    if (!box) return;
    const tip = box.querySelector('[data-map-tip]');
    const tipTitle = tip.querySelector('[data-tip-title]');
    const tipText = tip.querySelector('[data-tip-text]');
    const townLinks = [...document.querySelectorAll('[data-town]')];
    let current = 'west-chester';
    let project = null; // live map: (lng, lat) → {x, y}; null = static Figma coordinates

    const scale = () => parseFloat(getComputedStyle(box).getPropertyValue('--map-scale')) || 1;

    const pinCentre = (id) => {
      if (project) return project(TOWNS[id].lng, TOWNS[id].lat);
      const pin = box.querySelector(`[data-map-static] [data-pin="${id}"]`);
      return { x: pin.offsetLeft + pin.offsetWidth / 2, y: pin.offsetTop + pin.offsetHeight / 2 };
    };

    const placeTip = () => {
      const k = scale();
      const p = pinCentre(current);
      const w = tip.offsetWidth;
      const h = tip.offsetHeight;
      let x = p.x - TIP_GAP_X * k - w;
      let y = p.y + TIP_GAP_Y * k;
      if (x < 16 * k) x = p.x + TIP_GAP_X * k;
      if (y + h > box.clientHeight - 16 * k) y = p.y - TIP_GAP_Y * k - h;
      tip.style.setProperty('--tip-x', `${Math.round(x)}px`);
      tip.style.setProperty('--tip-y', `${Math.round(y)}px`);
    };

    const select = (id) => {
      if (!TOWNS[id] || id === current) return;
      current = id;
      townLinks.forEach((a) => a.classList.toggle('is-active', a.dataset.town === id));
      box.querySelectorAll('[data-pin]').forEach((pin) => pin.classList.toggle('is-active', pin.dataset.pin === id));
      tip.classList.add('is-switching');
      setTimeout(() => {
        tipTitle.textContent = TOWNS[id].name;
        tipText.textContent = TOWNS[id].note;
        placeTip();
        tip.classList.remove('is-switching');
      }, reducedMotion.matches ? 0 : 160);
    };

    townLinks.forEach((a) => {
      a.addEventListener('pointerenter', () => select(a.dataset.town));
      a.addEventListener('focus', () => select(a.dataset.town));
    });
    box.addEventListener('click', (e) => {
      const pin = e.target.closest('[data-pin]');
      if (pin) select(pin.dataset.pin);
    });
    box.addEventListener('pointerover', (e) => {
      const pin = e.target.closest('[data-pin]');
      if (pin) select(pin.dataset.pin);
    });

    placeTip();
    addEventListener('resize', placeTip);
    document.fonts?.ready.then(placeTip);

    // Live map, loaded once the section is near
    const io = new IntersectionObserver((entries) => {
      if (!entries.some((e) => e.isIntersecting)) return;
      io.disconnect();
      Promise.all([loadCss(box.dataset.mapCss), loadScript(box.dataset.mapJs)])
        .then(startLiveMap)
        .catch(() => { /* offline or blocked: the static map stays */ });
    }, { rootMargin: '700px 0px' });
    io.observe(box);

    function startLiveMap() {
      const gl = window.maplibregl;
      if (!gl) return;
      const css = getComputedStyle(root);
      const token = (name) => css.getPropertyValue(name).trim();
      let map;
      try {
        map = new gl.Map({
          container: box.querySelector('[data-map-gl]'),
          style: box.dataset.mapStyle,
          bounds: [[-76.02, 39.66], [-75.1, 40.17]],
          fitBoundsOptions: { padding: 20 },
          minZoom: 7,
          maxZoom: 13,
          dragRotate: false,
          pitchWithRotate: false,
          touchPitch: false,
          cooperativeGestures: true,
          attributionControl: { compact: true },
        });
      } catch {
        return; // no WebGL: keep the static map
      }
      map.touchZoomRotate.disableRotation();
      map.addControl(new gl.NavigationControl({ showCompass: false }), 'top-right');

      const failTimer = setTimeout(() => map.remove(), 12000);

      map.on('load', () => {
        clearTimeout(failTimer);
        styleMap(map, token);
        fetch(box.dataset.mapGeojson)
          .then((r) => r.json())
          .then((data) => addServiceArea(map, data, token))
          .catch(() => {});
        addMarkers(map, gl);
        project = (lng, lat) => map.project([lng, lat]);
        // Zooming out past the fitted view crowds the labels: limit it and fade them out early
        const fitted = map.getZoom();
        map.setMinZoom(fitted - 1);
        const syncZoom = () => box.classList.toggle('is-zoomed-out', map.getZoom() < fitted - 0.3);
        map.on('zoom', syncZoom);
        syncZoom();
        box.classList.add('is-live');
        placeTip();
        map.on('move', placeTip);
        map.on('resize', placeTip);
      });
    }

    function styleMap(map, token) {
      const land = token('--c-map-land');
      const water = token('--c-map-water');
      const road = token('--c-map-road');
      const hide = /^(park|landcover_|landuse_|building|aeroway|railway|highway_path|highway_minor|road_|tunnel_|highway-name|highway-shield|road_shield|airport|label_|waterway_line_label|water_name)/;
      map.getStyle().layers.forEach((layer) => {
        const { id } = layer;
        if (id === 'background') {
          map.setPaintProperty(id, 'background-color', land);
        } else if (id === 'water') {
          map.setPaintProperty(id, 'fill-color', water);
        } else if (id === 'waterway') {
          map.setPaintProperty(id, 'line-color', water);
        } else if (/^boundary_/.test(id)) {
          map.setPaintProperty(id, 'line-color', water);
          map.setPaintProperty(id, 'line-width', 2);
          map.setPaintProperty(id, 'line-dasharray', [1]);
        } else if (/^highway_(major|motorway)/.test(id) && layer.type === 'line') {
          map.setPaintProperty(id, 'line-color', road);
        } else if (id === 'label_state') {
          map.setLayoutProperty(id, 'text-transform', 'uppercase');
          map.setLayoutProperty(id, 'text-letter-spacing', 0.18);
          map.setLayoutProperty(id, 'text-size', 13);
          map.setPaintProperty(id, 'text-color', token('--c-map-label'));
          map.setPaintProperty(id, 'text-halo-width', 0);
        } else if (hide.test(id)) {
          map.setLayoutProperty(id, 'visibility', 'none');
        }
      });
    }

    function addServiceArea(map, data, token) {
      const before = map.getStyle().layers.find((l) => l.type === 'symbol')?.id;
      map.addSource('service-area', { type: 'geojson', data });
      map.addLayer({ id: 'service-fill', type: 'fill', source: 'service-area', paint: { 'fill-color': token('--c-red'), 'fill-opacity': 0.07 } }, before);
      map.addLayer({ id: 'service-line', type: 'line', source: 'service-area', paint: { 'line-color': token('--c-red'), 'line-width': 1.25 } }, before);
    }

    function addMarkers(map, gl) {
      const marker = (lng, lat, el) => new gl.Marker({ element: el, anchor: 'center' }).setLngLat([lng, lat]).addTo(map);

      MAP_EXTRAS.forEach((extra) => {
        const el = document.createElement('div');
        if (extra.kind === 'city') {
          el.className = 'gl-marker gl-marker--top';
          el.innerHTML = `<span class="map-pin map-pin--city"></span><span class="map-label map-label--city">${extra.label}</span>`;
        } else {
          el.className = 'gl-marker gl-marker--label';
          el.innerHTML = `<span class="map-label map-label--region map-label--county">${extra.label}</span>`;
        }
        marker(extra.lng, extra.lat, el);
      });

      Object.entries(TOWNS).forEach(([id, town]) => {
        const el = document.createElement('div');
        el.className = `gl-marker gl-marker--${town.side || 'none'}`;
        const label = town.home ? '' : `<span class="map-label">${town.name.replace(/, PA$/, '')}</span>`;
        el.innerHTML = `<button class="map-pin${town.home ? ' map-pin--home' : ''}${id === current ? ' is-active' : ''}" type="button" data-pin="${id}" aria-label="${town.name}"></button>${label}`;
        marker(town.lng, town.lat, el);
      });
    }
  }

  initSmoothScroll();
  initFixedVh();
  initKeyboardMode();
  initAnchorLinks();
  initHeader();
  initMegaMenus();
  initAnimations();
  initSliders();
  initReviewsSlider();
  initMobileMenu();
  initStickyCta();
  initSlideshow();
  initAccordion();
  initDropdowns();
  initModal();
  initForms();
  initServiceMap();
})();
