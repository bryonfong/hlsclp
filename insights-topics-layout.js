/* Contextual navigation is derived from existing headings; never a second taxonomy. */
(() => {
  const main = document.getElementById('topics-main');
  if (!main || !main.classList.contains('topics-layout')) return;
  const families = [...main.querySelectorAll('.topic-family')];
  const sections = [...main.querySelectorAll('.topic-family,.topic-theme')];
  const links = [...main.querySelectorAll('.topics-nav-list a')];
  const groups = [...main.querySelectorAll('[data-toc-family]')];
  const toggle = document.getElementById('topics-contents-toggle');
  const contents = document.getElementById('topics-contents-panel');
  const current = document.getElementById('topics-current-label');
  const drawer = document.getElementById('regdrawer');
  let returnTarget = null;
  const targets = new Map(sections.map(section => [section.id, section]));
  let queued = false;
  let top = 142;
  function closeContents(restore = false) {
    contents.hidden = true;
    toggle.setAttribute('aria-expanded', 'false');
    if (restore) toggle.focus();
  }
  function headerHeight() {
    const header = document.querySelector('.site-nav');
    const sub = document.querySelector('.corpus-sub');
    const subSticky = sub && getComputedStyle(sub).position === 'sticky';
    top = (header ? header.getBoundingClientRect().height : 0) +
      (subSticky ? sub.getBoundingClientRect().height : 0) + 20;
    document.body.style.setProperty('--topics-top', `${top}px`);
  }
  function update() {
    queued = false;
    const mobile = getComputedStyle(toggle.parentElement).display !== 'none';
    const threshold = top + (mobile ? toggle.getBoundingClientRect().height : 0) + 16;
    let visible = sections.filter(s => !s.hidden && !s.closest('.topic-family').hidden);
    let active = visible[0];
    for (const section of visible) {
      if (section.getBoundingClientRect().top <= threshold) active = section;
      else break;
    }
    const family = active?.closest('.topic-family') || families.find(f => !f.hidden);
    const familyId = family?.id;
    for (const group of groups) {
      const section = targets.get(group.dataset.tocFamily);
      group.hidden = !!section?.hidden;
      group.querySelector('ul').hidden = group.dataset.tocFamily !== familyId;
    }
    for (const a of links) {
      const target = targets.get(a.hash.slice(1));
      const isHidden = !target || target.hidden || target.closest('.topic-family').hidden;
      a.parentElement.hidden = isHidden;
      const familyRail = !!a.closest('.topics-family-nav');
      const selected = !isHidden && (familyRail ? target.id === familyId : target.id === active?.id);
      if (selected) a.setAttribute('aria-current', 'location');
      else a.removeAttribute('aria-current');
    }
    const familyName = family?.querySelector('h2').textContent;
    const themeName = active?.classList.contains('topic-theme') ? active.querySelector('h3').textContent : '';
    current.textContent = familyName ? familyName + (themeName ? ' › ' + themeName : '') : 'No matching topics';
  }
  function schedule() {
    if (!queued) { queued = true; requestAnimationFrame(update); }
  }
  toggle.addEventListener('click', () => {
    contents.hidden = !contents.hidden;
    toggle.setAttribute('aria-expanded', String(!contents.hidden));
  });
  contents.addEventListener('click', e => { if (e.target.closest('a[href^="#"]')) closeContents(); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Tab' && drawer && !drawer.hidden) {
      const stops = [...drawer.querySelectorAll('a[href],button,input,summary,[tabindex="0"]')]
        .filter(node => node.getClientRects().length && !node.disabled);
      const first = stops[0], last = stops[stops.length - 1];
      if (first && e.shiftKey && (document.activeElement === first || document.activeElement === drawer)) {
        e.preventDefault(); last.focus();
      } else if (last && !e.shiftKey && document.activeElement === last) {
        e.preventDefault(); first.focus();
      }
    }
    if (e.key === 'Escape' && !contents.hidden) { closeContents(true); e.preventDefault(); }
  });
  // Nested source readings replace their links. Keep the original page trigger
  // so closing a topic → source → Back chain restores keyboard position.
  document.addEventListener('click', e => {
    if (!drawer || !drawer.hidden || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;
    const a = e.target.closest('a[href]');
    if (a && /insights-(topics|sources)\.html#/.test(a.getAttribute('href'))) returnTarget = a;
  }, true);
  if (drawer) new MutationObserver(() => {
    if (drawer.hidden && returnTarget?.isConnected) {
      returnTarget.focus({preventScroll:true}); returnTarget = null;
    }
  }).observe(drawer, {attributes:true, attributeFilter:['hidden']});
  addEventListener('scroll', schedule, { passive: true });
  addEventListener('hashchange', schedule);
  addEventListener('resize', () => { headerHeight(); schedule(); });
  // Existing search/clear/unfold handlers run first; refresh after their DOM changes.
  document.getElementById('topic-filter').addEventListener('input', schedule);
  document.getElementById('topic-clear').addEventListener('click', schedule);
  document.getElementById('topic-unfold').addEventListener('click', schedule);
  main.addEventListener('toggle', schedule, true);
  const resize = new ResizeObserver(() => { headerHeight(); schedule(); });
  for (const selector of ['.site-nav','.corpus-sub','.topics-article']) {
    const node = document.querySelector(selector); if (node) resize.observe(node);
  }
  headerHeight(); schedule();
})();
