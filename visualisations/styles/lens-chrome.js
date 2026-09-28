/* ════════════════════════════════════════════════════════════════════════
   DRAGONFLY · LENS CHROME CONFIG  (W1-1)
   ────────────────────────────────────────────────────────────────────────
   The ONE `window.DF_CHROME` declaration for the nine lens pages. It is a
   single shared file rather than a per-page literal for the reason W1-1
   exists at all: the header has to be the SAME OBJECT on every page a reader
   moves between, and nine copies of a config drift the moment one is edited.
   Loaded immediately BEFORE styles/chrome.js, which reads it.

   BRAND RESTORED IN W1-2. It was held back at W1-1 for one reason: all nine
   still carried their own logo inside `header.figure`, so declaring it would
   have put two Dragonfly wordmarks on every page — the exact defect that made
   build-driver-map-v3.py un-wire chrome.js in the first place. W1-2 deleted
   that header on all nine, so the chrome is now the only wordmark on the page
   and this is where it is declared.

   The page-level `.brand-logo` rules went with the markup, and had to: chrome.js
   emits its own mark as `.brand-logo brand-logo--black`, so a leftover page rule
   would have overridden the shell's sizing for the header it had just injected.
   If a lens page's wordmark ever renders at the wrong size, look for a
   `.brand-logo` rule that came back, in actor-map.template.html or in the
   build-scenario-views.py fork.

   PATHS ARE PAGE-RELATIVE, and `window.DF_BASE` is deliberately unset. The nine
   all sit in `visualisations/`, one level below the insights pages, and the
   assets sit in `visualisations/styles/` beside this file. chrome.js prefixes
   config paths with DF_BASE, so setting it would break both the logo and the
   back link at once.

   ONE NAV ITEM, AND IT IS NEVER LIT. See `activeNav` below.

   ONE NAV ITEM, NO DROP-DOWN. The plan's first draft of this item put a
   seven-page "Navigation" menu beside the back link. Dropped on Linda's call,
   18 Aug: the lens pages are a chain a reader moves along, and the one move
   the header owes them is the way back out of it. The seven insights pages
   keep their own sub-nav on their own side of the boundary.

   THE RAILWAY (W1-4) IS STEP NAVIGATION, NOT A MODE TOGGLE. Seven entries, one
   per lens, in the order the chain reads. It never reintroduces the essay /
   visualisation split the earlier surface had: every destination is a lens page,
   and there is no second row offering the same content in another form. Active
   state comes from `<body data-tab>`, which each page has carried since W1-3 —
   the railway matches on the same key the per-lens accent is scoped to, so a tab
   and the page it opens cannot come up different colours.

   The seven names carry their own index (`01 Topic network`), which is the shape
   the canonical woven-report reference uses and the shape the plan specifies:
   `{ tab, name, href, color }` and nothing else. chrome.js supplies the motif —
   a hex glyph that fills with the tab's colour on hover and when active.

   07 IS THE SCENARIOS TRIO BEHIND ONE TAB. Three pages, one lens; the tab points
   at settlements, which is the entry the insights grid already treats as primary,
   and the suite's own rail moves a reader between the three once inside.

   WHAT THE RAILWAY REPLACES. `lens_series_rail.py` used to paste a `.series-rail`
   row onto the deployed pages after every build — a back link and the partnership
   credit. W1-1 moved both into the header, so from W1-4 that row was the same two
   destinations, twice on one page. The patcher is retired in the same commit.
   Its OTHER job, the `legal-theme` handoff, is not lost: it moved into the
   pre-paint bootstrap in actor-map.template.html and build-scenario-views.py,
   which is where it should always have been.

   PARTNERSHIP LINE. chrome.js escapes every config string, so a line carrying
   three links cannot be expressed as config. It is rendered on `chrome:ready`
   instead — the extension point chrome.js fires for exactly this — which keeps
   styles/chrome.js byte-identical to canonical. Forking the engine to carry one
   deliverable's credit line would put this project's needs inside shared
   furniture; this keeps them on the page side of the boundary.
   ════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  // Substituted from LENS_HUES in build/chromeshell.py when the config is published.
  // Reading the authored file directly will therefore find no HUES — that is the point:
  // one map, in Python, and no second copy here to fall out of step with it.
  var HUES = {
    topic: '--df-lens-cobalt',
    actors: '--df-lens-plum',
    drivers: '--df-lens-magenta',
    doctrine: '--df-lens-teal',
    practitioner: '--df-lens-indigo',
    interventions: '--df-lens-green',
    scenarios: '--df-lens-orange'
  };

  // The chain, in reading order. Names carry their index; hues come from the map above.
  var LENSES = [
    { tab: 'topic',         name: '01 Topic network',        href: 'topic-network-v2.html' },
    { tab: 'actors',        name: '02 Actor map',            href: 'actors-map.html' },
    { tab: 'drivers',       name: '03 Drivers and systems',  href: 'drivers-systems-map-v3.html' },
    { tab: 'doctrine',      name: '04 Doctrine timeline',    href: 'doctrine-timeline.html' },
    { tab: 'practitioner',  name: '05 Practitioner record',  href: 'practitioner-record.html' },
    { tab: 'interventions', name: '06 Intervention landscape', href: 'intervention-landscape.html' },
    { tab: 'scenarios',     name: '07 Scenarios',            href: 'scenarios-settlements.html' }
  ];

  window.DF_CHROME = {
    brand: {
      href: 'https://dragonflythinking.com',
      label: 'Dragonfly Thinking',
      logoBlack: 'styles/dt-logo-black.webp',
      logoWhite: 'styles/dt-logo-white.webp'
    },
    // Lens pages sit in visualisations/, one level below the insights pages.
    nav: [
      { id: 'back', name: 'Back to Analysis', href: '../insights-analysis.html' }
    ],
    // NO activeNav, deliberately. `Back to Lens Chain` is a destination, not a
    // location: lighting it says "you are on the lens chain" to a reader who is
    // not, and chrome.js also stamps aria-current="page" on whatever is lit, so a
    // screen reader was being told the same untruth. Omitting the key lights
    // nothing, which is the honest state — where the reader actually is, is what
    // the railway below shows. (Linda's call, 18 Aug, during W3-1.)
    tabs: LENSES.map(function (l) {
      return { tab: l.tab, name: l.name, href: l.href, color: HUES[l.tab] };
    }),
    // DEFER TO WHAT THE PAGE ALREADY DECIDED. Every one of the nine runs a
    // pre-paint bootstrap in <head> that resolves ?theme= → localStorage →
    // prefers-color-scheme and stamps <html data-theme> before first paint.
    // chrome.js's own setupTheme() consults localStorage ONLY, so a hardcoded
    // default here overrides the URL parameter — measured: every page opened
    // with ?theme=dark came back light. Passing the resolved value through
    // makes chrome.js agree with the bootstrap instead of fighting it, and
    // keeps ?theme= working, which the build's own screenshot gates rely on.
    defaultTheme: document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light'
  };

  // ── The project mark ────────────────────────────────────────────────────
  // The red dragonfly + "AI & the Legal Profession" that opens the ACTIONS
  // group. This is the canonical icon asset verbatim —
  // ~/dragonfly-design/design-system-site/canonical/assets/logos/dragonfly-red-icon.svg
  // (all five path masses, its own four-tone red, not mark-engine.js's flat
  // #A51C30) — inlined rather than fetched, since it is one small icon on
  // nine pages. An earlier pass here hand-picked four of the five masses to
  // match the FAVICON convention (drops the faint tail, reads at 16px) and
  // that is what was clipping: the tail is short but not blank, and cutting
  // it left the silhouette looking bitten off at this render size. The full
  // five-path mark, unmodified, is what does not clip. The title borrows the
  // insights site's h1 face — Crimson Pro, weight 560 — sized down to sit
  // level with "Insight Bridge" rather than at display scale;
  // .lens-project-title in chromeshell.py's CSS carries that sizing, not
  // this string.
  var PROJECT_MARK_SVG =
    '<svg viewBox="0 0 44 74" width="9.5" height="16" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true">'
    + '<path d="M18.7789 54.348C16.1764 59.7108 16.8255 65.8664 20.7104 72.6492L18.707 74C18.707 74 -1.24472 52.0978 27.6752 37L30.6395 40.9373L32 42.7444C27.5035 44.8931 21.5436 48.6516 18.7789 54.348Z" fill="#7C0A35"/>'
    + '<path d="M34.6475 41.4992L32.1146 42.6517C27.3369 44.8199 23.1591 45.6807 19.5407 45.6807C6.70267 45.6807 0.891861 34.8677 0.122958 33.3113C-0.0746235 32.9128 -0.0317744 32.4253 0.234842 32.075C0.499078 31.7219 0.93709 31.5723 1.34654 31.6942L34.6475 41.4992Z" fill="#7C0A35"/>'
    + '<path d="M34.6448 41.4988L31.8667 41.316C20.5332 40.3412 12.268 35.8651 7.30229 28.0099C3.01739 21.2313 2.97217 14.5591 2.97217 14.2799C2.97217 13.8279 3.22449 13.4217 3.61252 13.2415C3.99341 13.0663 4.43617 13.1424 4.74325 13.437L34.6448 41.4988Z" fill="#801318"/>'
    + '<path d="M39.8853 40.3006C41.6233 40.3006 43.0323 38.7979 43.0323 36.9442C43.0323 35.0906 41.6233 33.5879 39.8853 33.5879C38.1473 33.5879 36.7383 35.0906 36.7383 36.9442C36.7383 38.7979 38.1473 40.3006 39.8853 40.3006Z" fill="#BA1B23"/>'
    + '<path d="M34.6433 41.4976L32.2414 40.1241C6.88184 25.5993 15.2207 3.18372 16.2539 0.675335C16.4253 0.264041 16.8062 0 17.2252 0H17.2299C17.6537 0.00253885 18.0344 0.271658 18.2011 0.685489L34.6433 41.4976Z" fill="#BA1B23"/>'
    + '</svg>';

  // ── The "who did what" corner-arrow icon ────────────────────────────────
  // Replaces the bare "→" glyph the credit link used to end in — a top-right
  // (north-east) corner arrow, matched to the icon-button glyphs chrome.js
  // itself draws (currentColor stroke, so it inherits .lp-credit's colour and
  // its hover state for free — no separate hover rule needed on the svg).
  var CORNER_ARROW_SVG =
    '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" '
    + 'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17 17 7M8 7h9v9"/></svg>';

  // ── The partnership line ────────────────────────────────────────────────
  // Rendered into the header's ACTIONS group, immediately left of the theme
  // toggle, once chrome.js has built the bar. It sits right rather than beside
  // the nav because it is a credit, not a destination: the left of the bar is
  // where a reader looks to move, and a credit line there reads as navigation
  // that does not navigate.
  //
  // Guarded on every lookup: an unguarded getElementById in bar code has
  // already shipped a page with no map once in this project, and this runs on
  // all nine.
  document.addEventListener('chrome:ready', function () {
    var actions = document.querySelector('.top-bar-wrap .top-bar-actions');
    if (!actions) return;                                  // no header rendered (embed mode)
    if (actions.querySelector('.lens-partnership')) return; // idempotent: never render it twice

    var mark = document.createElement('a');
    mark.className = 'lens-project-id';
    mark.href = '../insights.html';
    mark.setAttribute('aria-label', 'AI & the Legal Profession — insights home');
    mark.innerHTML = PROJECT_MARK_SVG + '<span class="lens-project-title">AI &amp; the Legal Profession</span>';

    var el = document.createElement('div');
    el.className = 'lens-partnership';
    el.innerHTML =
      '<a href="https://insightbridge-secondchair.aicolab.org/insight-bridge" target="_blank" rel="noopener">Insight Bridge</a>'
      + '<span class="lp-x" aria-hidden="true">×</span>'
      + '<a href="https://dragonflythinking.com" target="_blank" rel="noopener">Dragonfly Thinking</a>'
      + '<a class="lp-credit" href="../insights.html#partnership">who did what' + CORNER_ARROW_SVG + '</a>';

    // First children of the actions group, project mark leading — the theme
    // toggle is the last thing in the bar and stays there.
    actions.insertBefore(el, actions.firstChild);
    actions.insertBefore(mark, actions.firstChild);
  });
})();
