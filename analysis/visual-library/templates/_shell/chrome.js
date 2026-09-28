/* ════════════════════════════════════════════════════════════════════════
   DRAGONFLY · CHROME  (canonical, config-driven)
   ────────────────────────────────────────────────────────────────────────
   Injects the shared page chrome — the top bar (brand · global nav · identity
   meta · tools · theme toggle) and the tab railway — then wires the dropdown
   accordion and the theme controller, and fires `chrome:ready`.

   SHARED FURNITURE: this is the ONE chrome engine, consumed by every page
   host (_interactive-visual-dashboard, single-visual-report, …). It lives in
   templates/_shell/ so the templates can't drift. Pairs with _shell/shell.css,
   foundations/tokens.css, and foundations/theme-sync.js (the iframe side).

   SCOPE: the shell renders NAVIGATION ONLY — global header + tab bar + theme.
   The command palette and the context/detail panel belong to the visualisation
   itself (see visualisations/<slug>/rendered.html), not to the shell. The shell
   wraps a viz; it never reaches inside it.

   DECOUPLED: everything deliverable-specific comes from a `window.DF_CHROME`
   config object the page declares BEFORE this script. Nothing here is keyed to
   any one deliverable.

   THEME: this is the BROADCASTER. The toggle flips <html data-theme>, persists
   to localStorage['df-theme'], and posts { kind:'df-theme', theme } to every
   iframe; an embedded viz that loads foundations/theme-sync.js follows along.

   EMBED: when <html data-embed> is set (a viz opened with ?embed=1), the shell
   does NOT inject — the viz renders chrome-less so a host can supply one outer
   shell. So a `rendered.html` is full-page standalone AND chrome-less embedded.

   CONFIG SHAPE (all keys optional except `tabs` if you want a railway):
     window.DF_CHROME = {
       brand:          { href, label, logoBlack, logoWhite },
       family:         { num, name },          // active Visual Family → breadcrumb
       nav:            [ { id, name, href, group, accent } ],  // optional global section nav
       // `group` (a moduleGroups id) turns a nav entry into a DROP-DOWN of that
       // group's modules — title + tag down the left, the hovered one shown as
       // motif + title + sentence on the right. `accent` is a --df-* token name
       // that tints the panel and its motif. Without `group` it is a plain link.
       activeNav:      'visualisations',       // which nav id is lit (else none)
       classification: 'Reference' | { label, cls },   // header status pill
       meta:           [ { label, img } | { label, svg } | { badge, isVersion } ],  // identity strip
       // A `badge` meta entry renders a filled chip in place of icon + label;
       // `isVersion: true` marks it [data-df-version] so window.DF_VERSION fills
       // it (and any page-level badge carrying the same attribute).
       provenance:     { caption, rows:[{k,v}], tags:[{cls,label}], note },
       modules:        [ { num, title, href, tab, group, motif, tag, blurb, status } ],
       // The one page list. Fills the All-Modules hamburger AND the section
       // drop-downs above: `motif` names a symbol in canonical/assets/motifs.js,
       // `tag` is the short line in the list, `blurb` the sentence under the
       // large preview, `status:'planned'` greys and marks a page not yet built.
       tabs:           [ { tab, name, href, color, num, count } ],  // railway; family tabs carry num+count
       github:         'https://…' | { href, label },   // repo link, left of theme toggle
       updates:        { label },                        // megaphone → glassmorphism briefing-calendar dropdown (data: window.DF_UPDATES)
     };
   The active tab is read from <body data-tab>; matched against tabs[].tab.
   ════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  var CFG = window.DF_CHROME || {};
  var body = document.body;
  var ACTIVE_TAB = body.getAttribute('data-tab') || '';

  function esc(s) { return String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

  // Page-depth base prefix. A page deeper than the site root sets
  // `window.DF_BASE` (e.g. '../' or '../../') BEFORE this script so the shared
  // DF_CHROME config — authored with root-relative paths — still resolves. Left
  // unset (default '') it is a no-op, so every existing host is unaffected.
  var BASE = window.DF_BASE || '';
  function withBase(p) { return (p && !/^(?:[a-z][a-z0-9+.-]*:|\/|#)/i.test(p)) ? BASE + p : p; }

  // ── Where a link opens ───────────────────────────────────────────────────
  // One rule, applied everywhere the chrome renders a link: a page of the SITE
  // (index, foundations, visualisations, the update briefings) replaces the
  // current view — the header travels with you, so a new tab would only strand
  // a duplicate. A page from `canonical/` — a template, a visualisation, a
  // reference — is an ARTEFACT, not a site page: it carries no site header and
  // is something you look at beside the site, so it opens in its own tab.
  // Tested on the CONFIG href (root-relative) so page depth is irrelevant.
  function isArtefact(p) { return /(^|\/)canonical\//.test(p || ''); }
  function targetAttr(p) { return isArtefact(p) ? ' target="_blank" rel="noopener"' : ''; }

  // ── Icons ──────────────────────────────────────────────────────────────
  var HEX  = '<svg viewBox="0 0 16 16" aria-hidden="true"><polygon points="4.4,1.6 11.6,1.6 15.2,8 11.6,14.4 4.4,14.4 0.8,8"/></svg>';
  var INFO = '<svg class="cmd-section-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>';
  var MOON = '<svg class="theme-ic theme-ic-moon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
  var GITHUB = '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 .5C5.37.5 0 5.78 0 12.292c0 5.211 3.438 9.63 8.205 11.188.6.111.82-.254.82-.567 0-.28-.011-1.022-.017-2.005-3.338.711-4.042-1.582-4.042-1.582-.546-1.361-1.333-1.724-1.333-1.724-1.089-.731.084-.716.084-.716 1.205.082 1.838 1.215 1.838 1.215 1.07 1.803 2.809 1.282 3.495.981.108-.763.417-1.282.76-1.577-2.665-.297-5.466-1.309-5.466-5.827 0-1.287.465-2.339 1.235-3.164-.135-.297-.54-1.497.105-3.121 0 0 1.005-.31 3.3 1.209.96-.262 1.98-.392 3-.398 1.02.006 2.04.136 3 .398 2.28-1.519 3.285-1.209 3.285-1.209.645 1.624.24 2.824.12 3.121.765.825 1.23 1.877 1.23 3.164 0 4.53-2.805 5.527-5.475 5.817.42.354.81 1.077.81 2.182 0 1.578-.015 2.846-.015 3.229 0 .315.21.689.825.573C20.565 21.917 24 17.495 24 12.292 24 5.78 18.627.5 12 .5z"/></svg>';
  var MEGAPHONE = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m3 11 18-5v12L3 14v-3z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/></svg>';
  var SUN  = '<svg class="theme-ic theme-ic-sun" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>';

  // ── Top-bar pieces ───────────────────────────────────────────────────────
  function brandHTML() {
    var b = CFG.brand; if (!b) return '';
    return '<a class="top-bar-brand" href="' + esc(withBase(b.href || '#')) + '" aria-label="' + esc(b.label || 'Home') + '">'
      + (b.logoBlack ? '<img class="brand-logo brand-logo--black" src="' + esc(withBase(b.logoBlack)) + '" alt="' + esc(b.label || '') + '">' : '')
      + (b.logoWhite ? '<img class="brand-logo brand-logo--white" src="' + esc(withBase(b.logoWhite)) + '" alt="" aria-hidden="true">' : '')
      + '</a>';
  }
  function breadcrumbHTML() {
    var f = CFG.family; if (!f) return '';
    return '<div class="top-bar-breadcrumb" aria-label="Visual family">'
      + '<span class="bc-sep" aria-hidden="true"></span>'
      + (f.num != null ? '<span class="bc-num">' + esc(('0' + f.num).slice(-2)) + '</span>' : '')
      + '<span class="bc-name">' + esc(f.name) + '</span></div>';
  }
  // Four-family global nav — the gradient-underline menu (like the index). Built
  // from moduleFamilies (the four families) + modules (their hrefs); the active
  // family is CFG.family.num. Each item links to its family's FIRST member; a
  // family with no members renders disabled. Falls back to the single breadcrumb
  // when no moduleFamilies are declared (so other templates are unaffected).
  function familyNavHTML() {
    var fams = CFG.moduleFamilies; if (!fams || !fams.length) return '';
    var activeNum = (CFG.family && CFG.family.num != null) ? CFG.family.num : null;
    var mods = CFG.modules || [];
    var items = fams.map(function (fam) {
      var firstTab = (fam.tabs || [])[0];
      var mod = firstTab ? mods.filter(function (m) { return m.tab === firstTab; })[0] : null;
      var href = mod ? mod.href : null;
      var on = (fam.num === activeNum);
      var num = esc(('0' + fam.num).slice(-2));
      var inner = '<span class="fam-num" aria-hidden="true">' + num + '</span><span class="fam-name">' + esc(fam.name) + '</span>';
      if (!href) return '<span class="family-nav-item is-disabled" aria-disabled="true" title="No visualisations yet">' + inner + '</span>';
      return '<a class="family-nav-item' + (on ? ' active' : '') + '" data-family-num="' + esc(fam.num) + '" href="' + esc(href) + '"' + (on ? ' aria-current="page"' : '') + '>' + inner + '</a>';
    }).join('');
    return '<nav class="family-nav" aria-label="Visual families">' + items + '</nav>';
  }
  function classificationHTML() {
    var c = CFG.classification; if (!c) return '';
    var label = (typeof c === 'string') ? c : (c.label || '');
    var cls = (typeof c === 'object' && c.cls) ? ' ' + esc(c.cls) : '';
    return '<span class="top-bar-classification' + cls + '">' + esc(label) + '</span>';
  }
  // ── Global section nav, with drop-down menus ─────────────────────────────
  // A nav entry that names a `group` (matching a moduleGroups[].id) is not just
  // a link — it OPENS. Under it drops a two-column panel: the pages of that
  // section down the left (title · what it is), and the hovered one shown on the
  // right (motif · title · what you get). The motif is the SAME one the page's
  // card uses on index.html, from the shared sprite in canonical/assets/motifs.js
  // — the menu owns no artwork of its own, so a motif is redrawn in one place and
  // changes everywhere. It appears ONCE per menu, at a size it can be read: a
  // thumbnail beside every row was a mark rather than a drawing, and doubled the
  // pointer to the same page.
  //
  // The entry stays a LINK: clicking "Foundations" still lands on that section
  // of the landing page. The menu is what hovering (or tabbing in) reveals — so
  // the header gained a shortcut without losing the destination it had.
  //
  // A nav entry with no `group`, or whose group holds no modules, renders as the
  // plain link it always was. Nothing here is required of a nav config.
  function navMegaItemHTML(m, i) {
    var planned = (m.status === 'planned');
    return '<a class="nav-mega-item' + (planned ? ' is-planned' : '') + '" role="menuitem" data-i="' + i + '"'
      + ' href="' + esc(withBase(m.href || '#')) + '"' + targetAttr(m.href) + '>'
      + '<span class="nmi-text">'
      +   '<span class="nmi-title">' + esc(m.title) + '</span>'
      +   (m.tag ? '<span class="nmi-tag">' + esc(m.tag) + '</span>' : '')
      + '</span>'
      + '</a>';
  }
  function navMegaPreviewHTML(m, i) {
    return '<div class="nav-mega-preview' + (i === 0 ? ' is-on' : '') + '" data-i="' + i + '">'
      + '<span class="nmp-frame" aria-hidden="true"><svg viewBox="0 0 240 120" preserveAspectRatio="xMidYMid meet"><use href="#' + esc(m.motif) + '"/></svg></span>'
      + '<span class="nmp-title">' + esc(m.title) + (m.status === 'planned' ? '<span class="nmp-flag">Planned</span>' : '') + '</span>'
      + (m.blurb ? '<p class="nmp-blurb">' + esc(m.blurb) + '</p>' : '')
      + '</div>';
  }
  function globalNavHTML() {
    if (!CFG.nav || !CFG.nav.length) return '';
    var mods = CFG.modules || [];
    var items = CFG.nav.map(function (g) {
      var on = (g.id === CFG.activeNav);
      var members = g.group ? mods.filter(function (m) { return m.group === g.group; }) : [];
      var link = '<a class="global-nav-item' + (on ? ' active' : '') + '" data-group="' + esc(g.id) + '" href="' + esc(withBase(g.href || '#')) + '"' + (on ? ' aria-current="page"' : '') + '>' + esc(g.name);
      if (!members.length) return link + '</a>';
      // Two columns of rows once a section outgrows a comfortable single list —
      // Templates is eleven pages, and an eleven-deep menu runs off the screen.
      var cols = members.length > 6 ? 2 : 1;
      // The section accent tints the menu AND the motifs inside it: the drawings
      // read var(--mv-accent) for their accent marks, so setting it here is what
      // makes a Foundations menu red and a Templates menu plum, with no second
      // copy of the artwork.
      var accent = g.accent ? ' style="--nm-accent: var(' + esc(g.accent) + '); --mv-accent: var(' + esc(g.accent) + ');"' : '';
      return '<div class="nav-mega" data-group="' + esc(g.id) + '"' + accent + '>'
        + link + '<svg class="nav-mega-chev" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="6 9 12 15 18 9"/></svg></a>'
        + '<div class="nav-mega-panel" role="menu" aria-label="' + esc(g.name) + '">'
        +   '<div class="nav-mega-list" style="--nm-cols:' + cols + '">' + members.map(navMegaItemHTML).join('') + '</div>'
        +   '<div class="nav-mega-previews">' + members.map(navMegaPreviewHTML).join('') + '</div>'
        + '</div></div>';
    }).join('');
    return '<nav class="global-nav" aria-label="Site sections">' + items + '</nav>';
  }
  function metaHTML() {
    if (!CFG.meta || !CFG.meta.length) return '';
    var items = CFG.meta.map(function (m) {
      // A `badge` entry is a filled chip rather than an icon + label pair — the
      // version stamp is the case it was added for. It takes its position from
      // the array like any other meta item, so where it sits in the strip is a
      // config decision, not a CSS one. Marked [data-df-version] when it holds
      // the version, so stampVersion() keeps it and the page's own badge on the
      // same string. Styled by .top-bar-meta .meta-badge in shell.css.
      if (m.badge) return '<span class="meta-badge"' + (m.isVersion ? ' data-df-version' : '') + '>' + esc(m.badge) + '</span>';
      var icon = m.img ? '<span class="meta-icon meta-icon-dragonfly" aria-hidden="true"><img src="' + esc(withBase(m.img)) + '" alt=""></span>'
               : m.svg ? '<span class="meta-icon" aria-hidden="true">' + m.svg + '</span>' : '';
      var cls = m.cls ? ' ' + esc(m.cls) : '';   // optional emphasis class (e.g. is-client → blue)
      return icon + '<span class="meta-label' + cls + '">' + esc(m.label) + '</span>';
    }).join('');
    return '<div class="top-bar-meta" id="df-top-meta">' + items + '</div>';
  }
  function provenanceHTML() {
    var p = CFG.provenance; if (!p) return '';
    var rows = (p.rows || []).map(function (r) { return '<div class="prov-row"><span class="prov-k">' + esc(r.k) + '</span><span class="prov-v">' + esc(r.v) + '</span></div>'; }).join('');
    var tags = (p.tags || []).map(function (t) { return '<span class="footer-tag ' + esc(t.cls) + '">' + esc(t.label) + '</span>'; }).join('');
    return '<div class="cmd-section top-bar-conf" data-section="provenance">'
      + '<button class="cmd-section-trigger top-bar-conf-trigger" type="button" aria-haspopup="true" aria-expanded="false">' + INFO + '<span class="cmd-section-name">Provenance &amp; status</span></button>'
      + '<div class="cmd-section-popover top-bar-conf-popover" role="menu">'
      +   (p.caption ? '<p class="top-bar-conf-caption">' + esc(p.caption) + '</p>' : '')
      +   rows
      +   (tags ? '<hr class="conf-divider" aria-hidden="true"><div class="footer-block-label">Tagging legend</div><div class="footer-tag-legend">' + tags + '</div>' : '')
      +   (p.note ? '<p class="conf-note">' + esc(p.note) + '</p>' : '')
      + '</div></div>';
  }
  function moduleItemHTML(m) {
    var on = (m.tab && m.tab === ACTIVE_TAB);
    return '<a class="modules-menu-item' + (on ? ' is-active' : '') + '" role="menuitem" href="' + esc(withBase(m.href || '#')) + '"' + targetAttr(m.href) + (on ? ' aria-current="page"' : '') + '>'
      + '<span class="mod-num" aria-hidden="true">' + esc(m.num) + '</span>'
      + '<span class="mod-title">' + esc(m.title) + '</span>'
      + '<span class="mod-underline" aria-hidden="true"></span></a>';
  }
  function modulesHTML() {
    if (!CFG.modules || !CFG.modules.length) return '';
    var label   = esc(CFG.modulesLabel   || 'All Modules');
    var caption = esc(CFG.modulesCaption || 'Every section, in order. Jump to any module.');
    var body;
    if (CFG.moduleGroups && CFG.moduleGroups.length) {
      // Generic grouping (a site menu, not a viz family) — modules carry a
      // `group` id matching a moduleGroups[].id; the header is the plain group
      // name (no "Family N:" prefix, and no four-family nav side effect). Empty
      // groups are dropped.
      body = CFG.moduleGroups.map(function (g) {
        var members = CFG.modules.filter(function (m) { return m.group === g.id; });
        if (!members.length) return '';
        return '<div class="modules-group-label">' + esc(g.name) + '</div>' + members.map(moduleItemHTML).join('');
      }).join('');
    } else if (CFG.moduleFamilies && CFG.moduleFamilies.length) {
      // Group the modules under their visual family, in family order — each
      // group headed "Family N: <name>". An empty family still shows its header.
      body = CFG.moduleFamilies.map(function (fam) {
        var members = CFG.modules.filter(function (m) { return (fam.tabs || []).indexOf(m.tab) !== -1; });
        var head = '<div class="modules-group-label">Family ' + esc(fam.num) + ': ' + esc(fam.name) + '</div>';
        return head + (members.length ? members.map(moduleItemHTML).join('') : '<p class="modules-group-empty">No modules yet.</p>');
      }).join('');
    } else {
      body = CFG.modules.map(moduleItemHTML).join('');
    }
    return '<div class="cmd-section top-bar-modules" data-section="modules">'
      // aria-label duplicates the visible name deliberately: below 400px the CSS
      // hides .cmd-section-name to buy the wordmark room, and the burger inside
      // is aria-hidden — without this the button would lose its only name.
      + '<button class="cmd-section-trigger top-bar-modules-trigger" type="button" aria-haspopup="true" aria-expanded="false" aria-label="' + esc(label) + '">'
      +   '<span class="modules-burger" aria-hidden="true"><span class="mb-bar"></span><span class="mb-bar"></span><span class="mb-bar"></span></span>'
      +   '<span class="cmd-section-name">' + label + '</span></button>'
      + '<div class="cmd-section-popover top-bar-modules-popover" role="menu">'
      +   '<p class="modules-caption">' + caption + '</p>'
      +   '<nav class="modules-menu">' + body + '</nav></div></div>';
  }
  function themeToggleHTML() {
    return '<button class="top-bar-theme-toggle" id="df-theme-toggle" type="button" aria-pressed="false" aria-label="Switch theme" title="Toggle theme">' + MOON + SUN + '</button>';
  }
  // Optional repo link — same square button shape as the theme toggle, sits to its
  // left. Only renders when CFG.github is set, so other hosts are unaffected.
  function githubHTML() {
    var g = CFG.github; if (!g) return '';
    var href = (typeof g === 'string') ? g : (g.href || '#');
    var label = (typeof g === 'object' && g.label) ? g.label : 'View source on GitHub';
    return '<a class="top-bar-github" href="' + esc(href) + '" target="_blank" rel="noopener" aria-label="' + esc(label) + '" title="' + esc(label) + '">' + GITHUB + '</a>';
  }
  // ── Updates "new briefing" dot ───────────────────────────────────────────
  // Content-driven, client-only: window.DF_UPDATES (newest-first, from
  // site-chrome.js) is the truth; we light a red dot on the megaphone when its
  // newest date is newer than localStorage['df-updates-seen']. A page that sets
  // window.DF_IS_UPDATES stamps the newest date as seen, clearing the dot.
  var UPDATES_SEEN_KEY = 'df-updates-seen';
  // The seen-stamp is the newest entry's date plus its optional `rev` (e.g.
  // "2026-06-30#2"). Bumping `rev` on an already-published briefing that gained
  // material new content re-lights the dot for readers who saw the earlier
  // version — a same-day expansion still counts as new, without faking a future
  // date. '#' sorts before digits, so a newer calendar date always wins anyway.
  function latestUpdateStamp() {
    var u = window.DF_UPDATES; if (!u || !u.length) return null;
    var max = null, rev = '';
    for (var i = 0; i < u.length; i++) {
      var e = u[i]; if (!e || !e.date) continue;
      if (max === null || e.date > max) { max = e.date; rev = e.rev ? '#' + e.rev : ''; }
    }
    return max === null ? null : max + rev;   // ISO date (+ optional #rev), sorts lexically
  }
  function updatesUnseen() {
    var latest = latestUpdateStamp(); if (!latest) return false;
    var seen = null; try { seen = localStorage.getItem(UPDATES_SEEN_KEY); } catch (e) {}
    return !seen || seen < latest;
  }
  function markUpdatesSeen() {
    var latest = latestUpdateStamp(); if (!latest) return;
    try { localStorage.setItem(UPDATES_SEEN_KEY, latest); } catch (e) {}
  }

  // The glassmorphism briefing calendar — built from window.DF_UPDATES. Opens on
  // the newest briefing's month; ‹ / › step month-by-month so older briefings
  // (e.g. June) stay reachable. Navigation is clamped to the span of months that
  // actually hold briefings, so you can't wander into empty months forever.
  function updatesCalendarHTML(viewY, viewM) {
    var MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    var DOWS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
    var u = (window.DF_UPDATES || []).slice().filter(function (x) { return x && x.date; });
    if (!u.length) return '<div class="uc-empty">No briefings yet. They’ll appear here as they’re run.</div>';
    u.sort(function (a, b) { return a.date < b.date ? 1 : a.date > b.date ? -1 : 0; });   // newest first
    function parse(d) { var p = String(d).split('-'); return { y: +p[0], m: +p[1], d: +p[2] }; }
    var idx = function (y, m) { return y * 12 + (m - 1); };                 // sortable month key
    var parsed = u.map(function (x) { var p = parse(x.date); p.it = x; return p; });
    var keys = parsed.map(function (p) { return idx(p.y, p.m); });
    var minIdx = Math.min.apply(null, keys), maxIdx = Math.max.apply(null, keys);
    var latest = parse(u[0].date);
    // Default to the latest month; clamp any requested month into the briefing span.
    var vIdx = (viewY && viewM) ? idx(viewY, viewM) : idx(latest.y, latest.m);
    if (vIdx < minIdx) vIdx = minIdx; if (vIdx > maxIdx) vIdx = maxIdx;
    var y = Math.floor(vIdx / 12), mo = (vIdx % 12) + 1, byDay = {};
    parsed.forEach(function (p) { if (p.y === y && p.m === mo) byDay[p.d] = p.it; });
    var firstDow = (new Date(y, mo - 1, 1).getDay() + 6) % 7;   // Monday-first
    var daysIn = new Date(y, mo, 0).getDate();
    var prevOff = vIdx <= minIdx, nextOff = vIdx >= maxIdx;
    var navBtn = function (dir, off) {
      return '<button class="uc-nav uc-' + dir + '" type="button" data-dir="' + (dir === 'prev' ? -1 : 1) + '"'
        + (off ? ' disabled' : '') + ' aria-label="' + (dir === 'prev' ? 'Previous' : 'Next') + ' month">'
        + (dir === 'prev' ? '‹' : '›') + '</button>';
    };
    var html = '<div class="uc-head">' + navBtn('prev', prevOff)
      + '<span class="uc-month">' + esc(MONTHS[mo - 1] + ' ' + y) + '</span>'
      + navBtn('next', nextOff) + '</div>'
      + '<div class="uc-grid" data-y="' + y + '" data-m="' + mo + '">';
    for (var d = 0; d < 7; d++) html += '<div class="uc-dow">' + DOWS[d] + '</div>';
    for (var e = 0; e < firstDow; e++) html += '<span class="uc-day is-empty"></span>';
    for (var day = 1; day <= daysIn; day++) {
      var it = byDay[day];
      if (it) {
        var on = (y === latest.y && mo === latest.m && day === latest.d) ? ' is-latest' : '';
        html += '<a class="uc-day is-available' + on + '" role="menuitem" href="' + esc(withBase(it.href || '#')) + '" aria-label="' + esc(day + ' ' + MONTHS[mo - 1] + ' ' + y + ' briefing') + '">' + day + '</a>';
      } else {
        html += '<span class="uc-day">' + day + '</span>';
      }
    }
    return html + '</div><div class="uc-note">Dates with a briefing are highlighted. Use ‹ / › to browse other months.</div>';
  }

  // "Latest updates / releases" — a square megaphone button that DROPS a
  // glassmorphism briefing calendar in the header (no separate page). Carries a
  // red dot when an unseen briefing exists; opening the menu clears it. Only
  // renders when CFG.updates is set, so other hosts are unaffected.
  function updatesHTML() {
    var u = CFG.updates; if (!u) return '';
    var label = (typeof u === 'object' && u.label) ? u.label : (typeof u === 'string' ? 'Latest updates & releases' : 'Latest updates & releases');
    var unseen = updatesUnseen();
    var aria = unseen ? label + ' — new briefing' : label;
    var dot = unseen ? '<span class="top-bar-updates-dot" aria-hidden="true"></span>' : '';
    return '<div class="top-bar-updates-wrap">'
      + '<button class="top-bar-updates" id="df-updates-btn" type="button" aria-haspopup="true" aria-expanded="false" aria-label="' + esc(aria) + '" title="' + esc(aria) + '">' + MEGAPHONE + dot + '</button>'
      + '<div class="top-bar-updates-cal" id="df-updates-cal" role="menu" aria-label="Briefing calendar" hidden>' + updatesCalendarHTML() + '</div>'
      + '</div>';
  }
  // Wire the megaphone dropdown: toggle open/close, close on outside click / Escape,
  // and stamp the newest briefing as seen (clearing the dot) the moment it opens.
  function setupUpdatesMenu() {
    var btn = document.getElementById('df-updates-btn');
    var cal = document.getElementById('df-updates-cal');
    if (!btn || !cal) return;
    function close() { cal.hidden = true; btn.setAttribute('aria-expanded', 'false'); }
    function open() {
      cal.hidden = false; btn.setAttribute('aria-expanded', 'true');
      markUpdatesSeen();
      var dot = btn.querySelector('.top-bar-updates-dot'); if (dot) dot.remove();
    }
    btn.addEventListener('click', function (e) { e.stopPropagation(); cal.hidden ? open() : close(); });
    document.addEventListener('click', function (e) { if (!cal.hidden && !cal.contains(e.target) && !btn.contains(e.target)) close(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !cal.hidden) close(); });
    // Month stepper — delegated so it survives the innerHTML re-render. Reads the
    // current month off the grid, shifts by the button's ±1, re-renders in place
    // (the calendar stays open; day-links keep working).
    cal.addEventListener('click', function (e) {
      var nav = e.target.closest ? e.target.closest('.uc-nav') : null;
      if (!nav || nav.disabled) return;
      e.stopPropagation();
      var grid = cal.querySelector('.uc-grid');
      if (!grid) return;
      var idx = (+grid.getAttribute('data-y')) * 12 + ((+grid.getAttribute('data-m')) - 1) + (+nav.getAttribute('data-dir'));
      cal.innerHTML = updatesCalendarHTML(Math.floor(idx / 12), (idx % 12) + 1);
    });
  }
  function headerHTML() {
    var tools = provenanceHTML() + modulesHTML();
    var family = familyNavHTML() || breadcrumbHTML();   // four-family nav, or the single breadcrumb fallback
    return '<header class="top-bar-wrap"><div class="top-bar">'
      + '<div class="top-bar-lead">' + brandHTML() + family + globalNavHTML() + '</div>'
      + '<div class="top-bar-right">' + classificationHTML() + metaHTML() + (tools ? '<div class="top-bar-tools">' + tools + '</div>' : '') + '<div class="top-bar-actions">' + updatesHTML() + githubHTML() + themeToggleHTML() + '</div></div>'
      + '</div></header>';
  }

  // ── Tab railway ──────────────────────────────────────────────────────────
  function tabbarHTML() {
    if (!CFG.tabs || !CFG.tabs.length) return '';
    var tabs = CFG.tabs.map(function (t) {
      var on = (t.tab === ACTIVE_TAB);
      // --tab-ink carries the TEXT colour: the token's -ink companion when one
      // exists (e.g. --df-agent-strategy-ink — gold text fails on white), else
      // the accent itself. Underline + hex always keep --tab-color.
      var style = t.color ? ' style="--tab-color:var(' + esc(t.color) + ');--tab-ink:var(' + esc(t.color) + '-ink, var(' + esc(t.color) + '))"' : '';
      var lead = (t.num != null) ? '<span class="tab-btn-num" aria-hidden="true">' + esc(('0' + t.num).slice(-2)) + '</span>' : '';
      var trail = (t.count != null) ? '<span class="tab-btn-count">' + esc(t.count) + '</span>'
                                    : '<span class="tab-btn-hex" aria-hidden="true">' + HEX + '</span>';
      return '<a class="tab-btn' + (on ? ' active' : '') + '" data-tab="' + esc(t.tab) + '" href="' + esc(t.href || '#') + '"' + style + (on ? ' aria-current="page"' : '') + '>'
        + lead + '<span class="tab-btn-name">' + esc(t.name) + '</span>' + trail + '</a>';
    }).join('');
    return '<div class="tab-bar-wrap"><nav class="tab-bar" aria-label="Visual families">' + tabs + '</nav></div>';
  }

  function firstEl(html) { var t = document.createElement('div'); t.innerHTML = html.trim(); return t.firstChild; }

  // Each tab is a full page navigation, so the railway re-renders at
  // scrollLeft 0 — anchor it back onto the active tab, centred when possible.
  function anchorActiveTab(wrap) {
    var rail = wrap.querySelector('.tab-bar');
    var on = rail && rail.querySelector('.tab-btn.active');
    if (!on) return;
    rail.scrollLeft = on.offsetLeft - (rail.clientWidth - on.offsetWidth) / 2;
  }

  // ── Dropdown accordion (single-open) ─────────────────────────────────────
  function wirePopovers() {
    function closeAll(except) {
      document.querySelectorAll('.cmd-section.is-open').forEach(function (s) {
        if (s === except) return;
        s.classList.remove('is-open');
        var t = s.querySelector('.cmd-section-trigger'); if (t) t.setAttribute('aria-expanded', 'false');
      });
    }
    document.querySelectorAll('.top-bar-wrap .cmd-section-trigger').forEach(function (trig) {
      trig.addEventListener('click', function (ev) {
        ev.stopPropagation();
        var s = trig.closest('.cmd-section'), open = s.classList.contains('is-open');
        closeAll(s); s.classList.toggle('is-open', !open); trig.setAttribute('aria-expanded', open ? 'false' : 'true');
      });
    });
    document.addEventListener('click', function (ev) {
      if (ev.target.closest('.top-bar-wrap .cmd-section-popover') || ev.target.closest('.top-bar-wrap .cmd-section-trigger')) return;
      closeAll(null);
    });
    document.addEventListener('keydown', function (ev) { if (ev.key === 'Escape') closeAll(null); });
  }

  // ── Section drop-downs (.nav-mega) ───────────────────────────────────────
  // Opens on hover and on keyboard focus, closes on leave, blur or Escape. The
  // leave is delayed a beat because the pointer has to cross the gap between the
  // nav item and the panel below it; closing the instant it left the label would
  // make the menu impossible to reach.
  //
  // The right-hand preview follows the row under the pointer (or the focus ring),
  // so scanning the list and reading the detail is one gesture. Row 0 is lit
  // from the start, so the panel is never blank on open.
  function setupNavMenus() {
    var menus = [].slice.call(document.querySelectorAll('.nav-mega'));
    if (!menus.length) return;
    var CLOSE_DELAY = 160;

    function closeAll(except) {
      menus.forEach(function (m) {
        if (m === except) return;
        m.classList.remove('is-open');
        var t = m.querySelector('.global-nav-item'); if (t) t.setAttribute('aria-expanded', 'false');
      });
    }
    menus.forEach(function (menu) {
      var trigger = menu.querySelector('.global-nav-item');
      var panel   = menu.querySelector('.nav-mega-panel');
      var rows    = [].slice.call(menu.querySelectorAll('.nav-mega-item'));
      var shots   = [].slice.call(menu.querySelectorAll('.nav-mega-preview'));
      var timer   = null;

      function open() {
        clearTimeout(timer);
        closeAll(menu);
        menu.classList.add('is-open');
        if (trigger) trigger.setAttribute('aria-expanded', 'true');
        clampPanel();
      }
      function close() {
        menu.classList.remove('is-open');
        if (trigger) trigger.setAttribute('aria-expanded', 'false');
      }
      function closeSoon() { clearTimeout(timer); timer = setTimeout(close, CLOSE_DELAY); }

      // The panel hangs from the left edge of its nav item. On a narrow window a
      // late item (Templates, two columns wide) would run off the right — so nudge
      // it back inside rather than letting the page grow a scrollbar.
      function clampPanel() {
        if (!panel) return;
        panel.style.left = '0px';
        var box = panel.getBoundingClientRect();
        var over = box.right - (window.innerWidth - 16);
        if (over > 0) panel.style.left = (-over) + 'px';
      }

      function light(i) {
        rows.forEach(function (r, n) { r.classList.toggle('is-on', n === i); });
        shots.forEach(function (s, n) { s.classList.toggle('is-on', n === i); });
      }
      rows.forEach(function (row, i) {
        row.addEventListener('mouseenter', function () { light(i); });
        row.addEventListener('focus', function () { open(); light(i); });
      });

      if (trigger) trigger.addEventListener('focus', open);
      menu.addEventListener('mouseenter', open);
      menu.addEventListener('mouseleave', closeSoon);
      menu.addEventListener('focusout', function (ev) {
        if (!menu.contains(ev.relatedTarget)) close();
      });
    });
    document.addEventListener('keydown', function (ev) {
      if (ev.key !== 'Escape') return;
      var open = document.querySelector('.nav-mega.is-open');
      if (!open) return;
      var t = open.querySelector('.global-nav-item');
      closeAll(null);
      if (t) t.focus();
    });
    window.addEventListener('resize', function () { closeAll(null); });
  }

  // ── Theme controller ─────────────────────────────────────────────────────
  var THEME_KEY = 'df-theme';
  function currentTheme() { return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light'; }
  // persist=true ONLY for an explicit user toggle. Persisting on init would freeze whatever
  // default a reader happened to meet first, and no page could ever set its own default again.
  function applyTheme(theme, persist) {
    theme = (theme === 'dark') ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', theme);
    if (persist) { try { localStorage.setItem(THEME_KEY, theme); } catch (e) {} }
    var btn = document.getElementById('df-theme-toggle');
    if (btn) { var d = theme === 'dark'; btn.setAttribute('aria-pressed', d ? 'true' : 'false'); btn.setAttribute('title', d ? 'Light mode' : 'Dark mode'); }
    document.querySelectorAll('iframe').forEach(function (f) { try { f.contentWindow.postMessage({ kind: 'df-theme', theme: theme }, '*'); } catch (e) {} });
  }
  function setupTheme() {
    var saved = null; try { saved = localStorage.getItem(THEME_KEY); } catch (e) {}
    // First-time visitors get the shell default (dark) unless the page opts out with
    // DF_CHROME.defaultTheme:'light'. An explicit toggle (saved) always wins over both.
    // ?theme=light|dark (tools/shot.sh's verification pin) sits between the two — a
    // deliberate one-shot override for a fresh profile with nothing saved yet. Without
    // this, setupTheme() re-applied localStorage/cfg on every init and silently
    // clobbered the page's own first-paint ?theme= hook, so --theme could only ever
    // "work" by accident of matching the page's default.
    var q = /[?&]theme=(light|dark)/.exec(location.search);
    var cfg = (window.DF_CHROME && window.DF_CHROME.defaultTheme) === 'light' ? 'light' : 'dark';
    applyTheme((saved === 'light' || saved === 'dark') ? saved : (q ? q[1] : cfg));
    var btn = document.getElementById('df-theme-toggle');
    if (btn) btn.addEventListener('click', function () { applyTheme(currentTheme() === 'dark' ? 'light' : 'dark', true); });
    window.addEventListener('message', function (ev) {
      var d = ev.data || {};
      if (d && d.kind === 'df-theme-request') { try { (ev.source || window).postMessage({ kind: 'df-theme', theme: currentTheme() }, '*'); } catch (e) {} }
    });
  }

  // ── Version stamp ────────────────────────────────────────────────────────
  // ONE release string fills every version badge on the page. `window.DF_VERSION`
  // (set in site-chrome.js, bumped by release-notes.mjs) is the source; anything
  // marked [data-df-version] follows it — the header chip built above, and a
  // page's own hero badge (index.html's .ds-version). The literal left in the
  // HTML is the no-JS fallback and what a reader sees in source; this is what
  // stops the two drifting when only one gets edited.
  function stampVersion() {
    var v = window.DF_VERSION; if (!v) return;
    var label = /^v/i.test(v) ? v : 'v' + v;
    var els = document.querySelectorAll('[data-df-version]');
    for (var i = 0; i < els.length; i++) els[i].textContent = label;
  }

  // ── Init ─────────────────────────────────────────────────────────────────
  function init() {
    // Embedded (?embed → data-embed): render chrome-less; the host supplies the
    // shell. The page's own version badge is still stamped — it belongs to the
    // page, not to the chrome, so it survives the bail-out.
    if (document.documentElement.hasAttribute('data-embed')) { stampVersion(); document.dispatchEvent(new CustomEvent('chrome:ready')); return; }
    // On the updates surface, stamp the newest briefing as seen BEFORE the header
    // renders — so the dot clears here and on every other page next visit.
    if (window.DF_IS_UPDATES) markUpdatesSeen();
    var header = firstEl(headerHTML());
    body.insertBefore(header, body.firstChild);
    var bar = tabbarHTML();
    if (bar) {
      var barEl = firstEl(bar);
      body.insertBefore(barEl, header.nextSibling);
      anchorActiveTab(barEl);
    }
    wirePopovers();
    setupNavMenus();
    setupUpdatesMenu();
    setupTheme();
    stampVersion();   // after the header exists, so its chip is stamped too
    document.dispatchEvent(new CustomEvent('chrome:ready'));
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
