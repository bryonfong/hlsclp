/* mark-engine.js — renders the crimson dragonfly from the canonical silhouette.
   One path set, multiple colour modes. Keeps the board file editable. */
(function () {
  // Canonical Dragonfly silhouette (viewBox 0 0 44 74). Compound-eye node + wing blade.
  const PATHS = {
    tail:   "M18.7789 54.348C16.1764 59.7108 16.8255 65.8664 20.7104 72.6492L18.707 74C18.707 74 -1.24472 52.0978 27.6752 37L30.6395 40.9373L32 42.7444C27.5035 44.8931 21.5436 48.6516 18.7789 54.348Z",
    lower:  "M34.6475 41.4992L32.1146 42.6517C27.3369 44.8199 23.1591 45.6807 19.5407 45.6807C6.70267 45.6807 0.891861 34.8677 0.122958 33.3113C-0.0746235 32.9128 -0.0317744 32.4253 0.234842 32.075C0.499078 31.7219 0.93709 31.5723 1.34654 31.6942L34.6475 41.4992Z",
    mid:    "M34.6448 41.4988L31.8667 41.316C20.5332 40.3412 12.268 35.8651 7.30229 28.0099C3.01739 21.2313 2.97217 14.5591 2.97217 14.2799C2.97217 13.8279 3.22449 13.4217 3.61252 13.2415C3.99341 13.0663 4.43617 13.1424 4.74325 13.437L34.6448 41.4988Z",
    eye:    "M39.8853 40.3006C41.6233 40.3006 43.0323 38.7979 43.0323 36.9442C43.0323 35.0906 41.6233 33.5879 39.8853 33.5879C38.1473 33.5879 36.7383 35.0906 36.7383 36.9442C36.7383 38.7979 38.1473 40.3006 39.8853 40.3006Z",
    upper:  "M34.6433 41.4976L32.2414 40.1241C6.88184 25.5993 15.2207 3.18372 16.2539 0.675335C16.4253 0.264041 16.8062 0 17.2252 0H17.2299C17.6537 0.00253885 18.0344 0.271658 18.2011 0.685489L34.6433 41.4976Z"
  };
  // Eye-node centre (compound-eye treatment draws concentric lenses here).
  const EYE = { cx: 39.885, cy: 36.944, r: 3.15 };

  function color(mode) {
    // returns [tail, lower, mid, eye, upper]
    switch (mode) {
      case 'tonal':  return ['#6E1020', '#6E1020', '#8F1728', '#A51C30', '#A51C30'];
      case 'mono':   return ['#A51C30', '#A51C30', '#A51C30', '#A51C30', '#A51C30'];
      case 'deep':   return ['#8F1728', '#8F1728', '#8F1728', '#A51C30', '#A51C30'];
      case 'black':  return ['#0f172a', '#0f172a', '#0f172a', '#0f172a', '#0f172a'];
      case 'white':  return ['#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff'];
      default:       return ['#A51C30', '#A51C30', '#A51C30', '#A51C30', '#A51C30'];
    }
  }

  // mode: tonal | mono | deep | black | white | compound
  function svg(mode, opts) {
    opts = opts || {};
    const h = opts.height || 74;
    // padded viewBox (mark is 44x74; add 6u margin each side) so wing tips never
    // clip against a tight container; width scales to the padded box.
    const w = (h / 86) * 56;
    const c = color(mode === 'compound' ? 'mono' : mode);
    let body =
      `<path d="${PATHS.tail}" fill="${c[0]}"/>` +
      `<path d="${PATHS.lower}" fill="${c[1]}"/>` +
      `<path d="${PATHS.mid}" fill="${c[2]}"/>`;
    if (mode === 'compound') {
      const ec = '#A51C30';
      // wing blade in crimson, eye becomes concentric lenses (multi-lens vision)
      body += `<path d="${PATHS.upper}" fill="${ec}"/>`;
      body +=
        `<circle cx="${EYE.cx}" cy="${EYE.cy}" r="${EYE.r}" fill="none" stroke="${ec}" stroke-width="0.9"/>` +
        `<circle cx="${EYE.cx}" cy="${EYE.cy}" r="${EYE.r * 0.6}" fill="none" stroke="${ec}" stroke-width="0.9"/>` +
        `<circle cx="${EYE.cx}" cy="${EYE.cy}" r="0.9" fill="${ec}"/>`;
    } else {
      body += `<path d="${PATHS.eye}" fill="${c[3]}"/>`;
      body += `<path d="${PATHS.upper}" fill="${c[4]}"/>`;
    }
    const label = opts.label || 'Crimson dragonfly mark';
    return `<svg viewBox="-6 -6 56 86" width="${w.toFixed(1)}" height="${h}" ` +
      `fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${label}" ` +
      `style="display:block;overflow:visible;${opts.style || ''}">${body}</svg>`;
  }

  // Favicon-safe: drop the faint tail, fatten strokes implicitly by using the
  // three boldest masses + solid eye. Reads at 16px.
  function favicon(mode, opts) {
    opts = opts || {};
    const h = opts.height || 32;
    const w = (h / 74) * 44;
    const c = color(mode || 'mono');
    const body =
      `<path d="${PATHS.lower}" fill="${c[1]}"/>` +
      `<path d="${PATHS.mid}" fill="${c[2]}"/>` +
      `<path d="${PATHS.eye}" fill="${c[3]}"/>` +
      `<path d="${PATHS.upper}" fill="${c[4]}"/>`;
    return `<svg viewBox="0 0 44 74" width="${w.toFixed(1)}" height="${h}" fill="none" ` +
      `xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Favicon dragonfly" ` +
      `style="display:block;${opts.style || ''}">${body}</svg>`;
  }

  window.Dragonfly = { svg, favicon, PATHS, EYE };
})();
