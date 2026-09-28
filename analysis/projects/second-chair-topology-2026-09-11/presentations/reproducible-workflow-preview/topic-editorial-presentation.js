(function () {
  'use strict';

  const PROJECTION_URL = new URL('topic-editorial-projection.json', location.href.replace('/figures/', '/'));
  const esc = value => String(value == null ? '' : value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const tokenValue = token => `var(${token || '--df-slate-500'})`;

  const CONTEST_POSITIONS = new Set(['Redirects', 'Mixed', 'Opposes']);
  const AUTHORED_LIMIT = 'The authored reading interprets the corpus provider\'s key findings and voice and era analyses for this topic, and was checked against them by an independent review; it is not a survey of the profession.';
  const SOURCE_LIMITED_NOTE = 'Source-limited: the sources recorded for this topic could not support an argued reading, so this panel shows the corpus provider\'s findings only.';
  const AUTHORED_PARTS = [
    ['what_it_argues_segments', 'What it argues', 'argues'],
    ['voice_split_segments', 'The voice split', 'voice'],
    ['era_arc_segments', 'The era arc', 'era'],
  ];

  function distributionHTML(rows, activeMode, env) {
    return `<div class="topic-distribution">${rows.map(row => {
      const token = activeMode === 'position'
        ? (CONTEST_POSITIONS.has(row.key) ? '--df-lens-primary' : '--df-slate-400')
        : env.item(activeMode, row.key)?.token || '--df-slate-500';
      const content = `<span>${esc(row.key)}</span><strong>${row.count.toLocaleString()} · ${row.share_pct.toFixed(1)}%</strong>`;
      return row.example_source_id
        ? `<button type="button" data-editorial-source="${esc(row.example_source_id)}" style="--share:${row.share_pct}%;--bar-colour:${tokenValue(token)}">${content}</button>`
        : `<div class="topic-distribution-row" style="--share:${row.share_pct}%;--bar-colour:${tokenValue(token)}">${content}</div>`;
    }).join('')}</div>`;
  }

  function representativeHTML(row, env) {
    const source = env.sourceProjection[row.source_id];
    return `<article class="topic-representative">
        <button type="button" data-editorial-source="${esc(row.source_id)}">${esc(row.title)}</button>
        <span><strong>${esc(row.recorded_position)}</strong><a href="${esc(source.record_href)}" data-reading-record="true">Saved record</a>${source.publisher_url ? `<a href="${esc(source.publisher_url)}" target="_blank" rel="noopener noreferrer">Publisher</a>` : '<em>No captured publisher link</em>'}</span>
      </article>`;
  }

  // Citation refs (kf:, kp:, voice:, era:, counts:, src:) are resolved here and never written to the page:
  // chips carry only their reader number, and the drawer shows what the ref points to.
  function citationRefs(reading) {
    const refs = [];
    AUTHORED_PARTS.forEach(([field]) => (reading[field] || []).forEach(segment => (segment.cite || []).forEach(ref => {
      if (!refs.includes(ref)) refs.push(ref);
    })));
    return refs;
  }

  function splitRef(ref) {
    const at = String(ref).indexOf(':');
    return [String(ref).slice(0, at), String(ref).slice(at + 1)];
  }

  function citationLabel(ref, packet) {
    const [kind, value] = splitRef(ref);
    if (kind === 'kf') return 'corpus provider key finding';
    if (kind === 'kp') return 'corpus provider key point';
    if (kind === 'voice') return `corpus provider analysis of the ${value} voice`;
    if (kind === 'era') return `corpus provider analysis of ${value}`;
    if (kind === 'counts') return `recorded stances by ${value === 'era' ? 'era' : 'voice'}`;
    if (kind === 'src') return `source: ${packet.cited_sources?.[value]?.title || 'corpus record'}`;
    return 'citation';
  }

  // Authors wrote segments with and without a leading space. Separate them here (whitespace only:
  // no segment text is altered), so a sentence never runs into the next one or into a chip.
  function segmentsHTML(segments, refs, packet) {
    let html = '';
    let openText = false;
    (segments || []).forEach(segment => {
      if (Array.isArray(segment.cite)) {
        html += `<span class="topic-cite-group">${segment.cite.map(ref => {
          const number = refs.indexOf(ref) + 1;
          return `<button type="button" class="topic-cite-chip" data-topic-cite="${number}" aria-expanded="false" aria-label="Citation ${number}: ${esc(citationLabel(ref, packet))}">${number}</button>`;
        }).join('')}</span>`;
        openText = false;
        return;
      }
      const text = segment.text || '';
      if (html && !/\s$/.test(html) && !/^\s/.test(text) && (!openText || /[.!?:;,)\]”’"']$/.test(html))) html += ' ';
      html += esc(text);
      openText = true;
    });
    return html;
  }

  function countsTableHTML(counts, facet, env) {
    const known = (facet === 'era' ? env.eras : env.voices) || [];
    const labels = [...known, ...Object.keys(counts || {}).filter(label => !known.includes(label)).sort()];
    const total = value => value && typeof value === 'object' ? Object.values(value).reduce((sum, count) => sum + Number(count || 0), 0) : Number(value || 0);
    const rows = labels.map(label => ({label, value: (counts || {})[label], count: total((counts || {})[label])}));
    if (facet !== 'era') rows.sort((a, b) => b.count - a.count || known.indexOf(a.label) - known.indexOf(b.label));
    return `<div class="topic-cite-counts"><table><thead><tr><th>${facet === 'era' ? 'Era' : 'Voice'}</th><th>Stances</th><th>Recorded positions</th></tr></thead><tbody>${rows.map(row => `<tr><td>${esc(row.label)}</td><td>${row.count.toLocaleString()}</td><td>${row.value && typeof row.value === 'object' ? Object.entries(row.value).map(([position, count]) => `${esc(position)} ${Number(count).toLocaleString()}`).join(' · ') : (row.count ? '' : 'none recorded')}</td></tr>`).join('')}</tbody></table></div>`;
  }

  function citationDrawerHTML(ref, number, packet, env) {
    const [kind, value] = splitRef(ref);
    const synthesis = packet.provider_synthesis || {};
    const topicRecord = synthesis.record_href ? `<a href="${esc(synthesis.record_href)}" data-reading-record="true">Saved topic record</a>` : '';
    let kicker = 'Citation';
    let body = '<p>This citation could not be resolved.</p>';
    if (kind === 'kf' && synthesis.key_findings?.[Number(value)] != null) {
      kicker = 'Corpus provider · key finding';
      body = `<p>${esc(synthesis.key_findings[Number(value)])}</p>${topicRecord}`;
    } else if (kind === 'kp' && packet.provider_drawer?.key_points?.[Number(value)]) {
      const point = packet.provider_drawer.key_points[Number(value)];
      kicker = 'Corpus provider · key point';
      body = `<p><strong>${esc(point.key_point)}</strong></p>${point.details ? `<p>${esc(point.details)}</p>` : ''}${topicRecord}`;
    } else if ((kind === 'voice' || kind === 'era') && packet.provider_perspectives?.[kind]?.[value]) {
      const perspective = packet.provider_perspectives[kind][value];
      kicker = `Corpus provider · ${kind === 'voice' ? 'voice' : 'era'} analysis`;
      body = `<p><strong>${esc(value)}</strong>${perspective.position ? ` · ${esc(perspective.position)}` : ''}</p><p>${esc(perspective.analysis)}</p>${topicRecord}`;
    } else if (kind === 'counts' && (value === 'voice' || value === 'era')) {
      kicker = `Recorded stances by ${value}`;
      body = `${countsTableHTML(packet[`positions_by_${value}`], value, env)}<p>Counts describe this curated corpus, not prevalence in the profession.</p>`;
    } else if (kind === 'src' && packet.cited_sources?.[value]) {
      const source = packet.cited_sources[value];
      kicker = 'Source';
      body = `<p><strong>${esc(source.title)}</strong></p><p>${esc((source.authors || []).join(', '))}${source.year ? `${(source.authors || []).length ? ' · ' : ''}${esc(source.year)}` : ''}</p>${source.record_href ? `<a href="${esc(source.record_href)}" data-reading-record="true">Saved record</a>` : '<span>Corpus record</span>'}`;
    }
    return `<div class="topic-cite-drawer-head"><span>${number} · ${esc(kicker)}</span><button type="button" data-topic-cite-close aria-label="Close citation">×</button></div>${body}`;
  }

  function quoteHTML(row, packet) {
    const source = packet.cited_sources?.[row.source_entity_id] || {};
    const meta = [source.title ? `<strong>${esc(source.title)}</strong>` : '', source.year ? esc(source.year) : ''].filter(Boolean).join(' · ');
    return `<figure class="topic-authored-quote">
        <blockquote>“${esc(row.quote)}”</blockquote>
        <figcaption>${meta ? `<span>${meta}</span>` : ''}${source.record_href ? `<a href="${esc(source.record_href)}" data-reading-record="true">Saved record</a>` : ''}${row.on_map === false ? '<em>not a source on this map</em>' : ''}${row.attribution ? `<span class="topic-quote-attribution">${esc(row.attribution)}</span>` : ''}</figcaption>
      </figure>`;
  }

  function authoredReadingHTML(id, packet, env) {
    const reading = packet.editorial_reading || {};
    if (reading.quality !== 'authored') return '';
    const refs = citationRefs(reading);
    const parts = AUTHORED_PARTS.map(([field, title, key]) => `<section class="topic-authored-part" data-authored-part="${key}"><h3>${title}</h3><p>${segmentsHTML(reading[field], refs, packet)}</p><div class="topic-cite-drawer" data-topic-cite-drawer hidden></div></section>`).join('');
    const analysis = (reading.analysis_reading_segments || []).map(segment => segment.text).filter(Boolean).map(text => `<p>${esc(text)}</p>`).join('');
    const quotes = (reading.quotes || []).map(row => quoteHTML(row, packet)).join('');
    return `<section class="topic-authored" data-topic-authored="${esc(id)}">
        ${parts}
        <section class="topic-analysis-reading" data-authored-part="analysis"><h3>The analysis's reading (not a source claim)</h3>${analysis}</section>
        ${quotes ? `<section class="topic-authored-quotes" data-authored-part="quotes"><h3>Quotes chosen for the argument</h3>${quotes}</section>` : ''}
      </section>`;
  }

  function topicPanelHTML(id, packet, env) {
    const synthesis = packet.provider_synthesis;
    const quality = packet.source_count <= 2 ? `<p class="topic-quality-note">Source-limited · ${packet.source_count} connected ${packet.source_count === 1 ? 'work' : 'works'}</p>` : '';
    // Decision 4 (2026-09-18): prefer the reading's own topic-specific reason over the generic note.
    const limitedReason = (packet.editorial_reading || {}).reason;
    const limited = packet.authoring_decision?.status === 'source-limited' ? `<p class="topic-source-limited-note">${esc(limitedReason || SOURCE_LIMITED_NOTE)}</p>` : '';
    return `<section class="topic-editorial-detail" data-topic-editorial-detail="${esc(id)}">
        ${quality}${limited}
        ${authoredReadingHTML(id, packet, env)}
        <section class="topic-provider-synthesis"><h3>What the corpus provider finds</h3><ul class="topic-provider-findings">${synthesis.key_findings.map(finding => `<li>${esc(finding)}</li>`).join('')}</ul><p class="topic-provider-attribution">Provider synthesis across the works the corpus provider assigns to this topic; not an independent Dragonfly finding. <a href="${esc(synthesis.record_href)}" data-reading-record="true">Saved topic record</a></p></section>
        <section><h3>Who says it</h3>${distributionHTML(packet.voice_distribution, 'voice', env)}</section>
        <section><h3>How it changes</h3>${distributionHTML(packet.era_distribution, 'era', env)}</section>
        <section><h3>Where it is contested</h3>${distributionHTML(packet.recorded_position_distribution, 'position', env)}</section>
        <section><h3>Read the evidence</h3><div class="topic-representatives">${packet.representative_sources.map(row => representativeHTML(row, env)).join('')}</div><p>The retained evidence passages, limitations and complete topic links continue below.</p></section>
      </section>`;
  }

  window.DFTopicEditorialRender = {topicPanelHTML, authoredReadingHTML, citationRefs, citationDrawerHTML, AUTHORED_LIMIT, SOURCE_LIMITED_NOTE};

  function installStyles() {
    if (document.getElementById('topic-editorial-presentation-style')) return;
    const style = document.createElement('style');
    style.id = 'topic-editorial-presentation-style';
    style.textContent = `
      .family-colour-legend{display:flex;flex-direction:column;flex-wrap:nowrap!important;align-items:stretch;gap:7px!important;padding:9px 18px 11px!important;overflow:hidden}
      .topic-colour-modes{display:flex;align-items:center;flex-wrap:wrap;gap:6px 12px}
      .topic-colour-modes strong{flex-basis:auto!important;font-family:var(--df-font-mono);font-size:var(--df-text-panel-label,11.5px);letter-spacing:.12em;text-transform:uppercase;margin-right:2px}
      .topic-colour-modes .chip{font-size:12px;padding:5px 9px;min-height:28px}
      .topic-colour-key{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:5px 14px;font-size:12px;color:var(--df-ink);padding-bottom:2px}
      .topic-colour-key span{display:inline-flex;align-items:flex-start;gap:6px;line-height:1.3;min-width:0}
      .topic-colour-key i{width:10px;height:10px;border-radius:50%;flex:none}
      .family-colour-legend>small{flex-basis:auto!important;color:var(--df-ink-muted);font-size:11.5px;line-height:1.35;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .topic-map-search{display:flex;align-items:center;gap:7px;margin-left:auto;min-width:min(260px,30vw)}
      .topic-map-search label{font:600 10.5px var(--df-font-mono);letter-spacing:.1em;text-transform:uppercase;color:var(--df-ink-muted)}
      .topic-map-search input{width:100%;min-height:30px;border:1px solid var(--df-border);background:var(--df-surface);color:var(--df-ink);padding:5px 8px;font:inherit;font-size:12px}
      .topic-map-search input:focus-visible{outline:2px solid var(--df-lens-primary);outline-offset:1px}
      .topic-map-search-status{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}
      #net .readability-overlay-label .node-label{font-size:var(--readability-topic-font,19px);font-weight:650}
      #net .node.source .node-circle{transition:fill .16s ease,stroke .16s ease}
      #net .node.topic .node-circle{transition:fill .16s ease,stroke .16s ease}
      #net.has-node-focus .edge.is-focus-edge{stroke:var(--edge-editorial,var(--df-slate-500))!important}
      .topic-editorial-overview{padding-bottom:20px}
      .topic-editorial-overview>h2{font-size:clamp(25px,2vw,34px);line-height:1.08;margin:8px 0 12px;letter-spacing:-.025em}
      .topic-editorial-overview>.reading-headline{font-size:16px;line-height:1.6;color:var(--df-ink-soft,var(--df-ink-muted));margin:0 0 22px}
      .topic-editorial-overview h3{font-size:14px;margin:24px 0 10px}
      .topic-dimension-list{display:grid;grid-template-columns:1fr 1fr;gap:7px}
      .topic-dimension-list button{appearance:none;border:0;border-left:4px solid var(--dimension-colour);background:color-mix(in srgb,var(--dimension-colour) 9%,var(--df-surface));color:var(--df-ink);padding:9px 10px;text-align:left;cursor:pointer}
      .topic-dimension-list button:hover,.topic-dimension-list button:focus-visible{background:color-mix(in srgb,var(--dimension-colour) 16%,var(--df-surface))}
      .topic-dimension-list button:focus-visible,.topic-finding-main:focus-visible,.topic-evidence-chip:focus-visible,.topic-source-row button:focus-visible,.topic-key-item:focus-visible,.topic-distribution button:focus-visible{outline:2px solid var(--df-lens-primary);outline-offset:2px}
      .topic-dimension-list span{display:block;font-size:12px;font-weight:700;line-height:1.25}
      .topic-dimension-list small{display:block;font-size:10.5px;line-height:1.35;color:var(--df-ink-muted);margin-top:3px}
      .topic-current-view{margin:18px 0 0;padding:13px 0 14px;border-top:1px solid var(--df-border);border-bottom:1px solid var(--df-border)}
      .topic-current-view .p-block-label{margin-bottom:6px;color:var(--df-lens-primary)}
      .topic-current-view h3{font-size:16px;margin:0 0 5px}
      .topic-current-view p{font-size:13px;line-height:1.55;color:var(--df-ink-muted);margin:0}
      .topic-panel-key{margin-top:15px}
      .topic-panel-key>h3{margin:0 0 8px}
      .topic-key-grid{display:grid;grid-template-columns:1fr 1fr;gap:5px 8px}
      .topic-key-item{display:flex;align-items:flex-start;gap:7px;appearance:none;border:0;background:transparent;color:var(--df-ink);padding:4px 0;text-align:left;font:inherit;font-size:11.5px;line-height:1.3;cursor:pointer}
      .topic-key-item i{width:9px;height:9px;border-radius:50%;flex:none;margin-top:3px;background:var(--key-colour)}
      .topic-key-item:hover{color:var(--df-lens-primary)}
      .topic-shape{border-top:1px solid var(--df-border);margin-top:22px}
      .topic-finding{border-top:1px solid var(--df-border);padding:12px 2px}
      .topic-finding:first-of-type{border-top:0}
      .topic-finding-main{display:grid;grid-template-columns:28px 1fr;gap:8px;width:100%;appearance:none;border:0;background:transparent;color:var(--df-ink);padding:0;text-align:left;cursor:pointer}
      .topic-finding-main:hover strong{color:var(--df-lens-primary)}
      .topic-finding-number{font-family:var(--df-font-mono);font-size:11px;color:var(--df-lens-primary);padding-top:2px}
      .topic-finding strong{display:block;font-size:14px;line-height:1.3}
      .topic-finding small{display:block;font-size:12px;line-height:1.5;color:var(--df-ink-muted);margin-top:3px}
      .topic-finding-consequence{font-size:11.5px;line-height:1.45;margin:7px 0 0 36px;color:var(--df-ink)}
      .topic-finding-links{display:flex;gap:5px;flex-wrap:wrap;margin:8px 0 0 36px}
      .topic-evidence-chip{appearance:none;border:1px solid color-mix(in srgb,var(--chip-colour,var(--df-lens-primary)) 32%,var(--df-border));background:color-mix(in srgb,var(--chip-colour,var(--df-lens-primary)) 9%,transparent);color:var(--df-ink);padding:4px 7px;font:600 10.5px var(--df-font-mono);cursor:pointer}
      .topic-howto{display:grid;gap:10px;margin:0 0 14px}
      .topic-howto-row{display:grid;grid-template-columns:27px 1fr;gap:9px;align-items:start;font-size:12px;line-height:1.5;color:var(--df-ink-muted)}
      .topic-howto-mark{display:grid;place-items:center;width:25px;height:25px;border:1px solid color-mix(in srgb,var(--df-lens-primary) 30%,var(--df-border));color:var(--df-lens-primary);font:700 11px var(--df-font-mono)}
      .topic-verification-list{margin:0 0 14px;padding:0;list-style:none}
      .topic-verification-list li{padding:8px 0;border-top:1px solid var(--df-border-soft);font-size:11.5px;line-height:1.45;color:var(--df-ink-muted)}
      .topic-verification-list strong{display:block;color:var(--df-ink);font-size:12px}
      .topic-verification-list code{white-space:normal;overflow-wrap:anywhere}
      .topic-overview-detail,.topic-source-register{border-top:1px solid var(--df-border);padding:0}
      .topic-overview-detail>summary,.topic-source-register>summary{font-size:12px;font-weight:700;cursor:pointer;padding:13px 0;list-style-position:inside}
      .topic-overview-detail>p,.topic-source-note{font-size:12px;line-height:1.55;color:var(--df-ink-muted);margin:0 0 14px}
      .topic-source-search{padding:2px 0 10px}
      .topic-source-search label{display:block;font-size:11px;font-weight:700;margin-bottom:5px}
      .topic-source-search input{width:100%;min-height:38px;border:1px solid var(--df-border);background:var(--df-surface);color:var(--df-ink);padding:8px 10px;font:inherit}
      .topic-source-search p{font-size:10.5px;color:var(--df-ink-muted);margin:5px 0 0}
      .topic-source-results{border-top:1px solid var(--df-border)}
      .topic-source-row{padding:9px 0;border-bottom:1px solid var(--df-border)}
      .topic-source-row>button{display:block;width:100%;appearance:none;border:0;background:transparent;color:var(--df-ink);padding:0;text-align:left;font:inherit;font-size:12px;font-weight:650;line-height:1.35;cursor:pointer}
      .topic-source-row>button:hover{color:var(--df-lens-primary)}
      .topic-source-row>span{display:flex;gap:12px;flex-wrap:wrap;margin-top:5px;font-size:10.5px}
      .topic-source-row a,.topic-source-actions a{color:var(--df-lens-primary);text-decoration:none}
      .topic-source-row a:hover,.topic-source-actions a:hover{text-decoration:underline}
      .topic-source-row em{color:var(--df-ink-muted);font-style:normal}
      .topic-source-more{appearance:none;border:1px solid var(--df-border);background:var(--df-surface);color:var(--df-ink);font:inherit;font-size:12px;padding:7px 10px;margin:10px 0;cursor:pointer}
      .topic-source-empty{font-size:12px;color:var(--df-ink-muted);padding:12px 0}
      .topic-source-actions{display:flex;align-items:center;flex-wrap:wrap;gap:8px 14px;margin:10px 0 16px;padding:10px 0;border-top:1px solid var(--df-border);border-bottom:1px solid var(--df-border);font-size:12px}
      .topic-source-actions span{color:var(--df-ink-muted)}
      .topic-editorial-detail{border-top:1px solid var(--df-border);border-bottom:1px solid var(--df-border);padding:14px 0 4px;margin:12px 0 18px}
      .topic-editorial-detail>section{margin:0 0 17px}
      .topic-editorial-detail h3{font-size:13px;margin:0 0 6px}
      .topic-editorial-detail p{font-size:12px;line-height:1.55;color:var(--df-ink-muted);margin:0}
      .topic-quality-note{font:600 10.5px var(--df-font-mono);letter-spacing:.07em;text-transform:uppercase;color:var(--df-lens-orange);margin-bottom:10px!important}
      .topic-distribution{display:grid;gap:7px;margin:9px 0}
      .topic-distribution button{position:relative;display:grid;grid-template-columns:minmax(0,1fr) auto;gap:8px;width:100%;appearance:none;border:0;background:transparent;color:var(--df-ink);padding:0 0 5px;text-align:left;font:inherit;font-size:11px;cursor:pointer}
      .topic-distribution button::after{content:"";position:absolute;left:0;bottom:0;width:var(--share);height:3px;background:var(--bar-colour,var(--df-lens-primary))}
      .topic-distribution button::before{content:"";position:absolute;left:0;right:0;bottom:0;height:3px;background:var(--df-border-soft)}
      .topic-distribution button::after{z-index:1}
      .topic-distribution-row{position:relative;display:grid;grid-template-columns:minmax(0,1fr) auto;gap:8px;color:var(--df-ink);padding:0 0 5px;font-size:11px}
      .topic-distribution-row::before{content:"";position:absolute;left:0;right:0;bottom:0;height:3px;background:var(--df-border-soft)}
      .topic-distribution-row::after{content:"";position:absolute;left:0;bottom:0;width:var(--share);height:3px;background:var(--bar-colour,var(--df-lens-primary));z-index:1}
      .topic-provider-findings{margin:4px 0 8px;padding:0 0 0 17px;display:grid;gap:6px}
      .topic-provider-findings li{font-size:12.5px;line-height:1.5;color:var(--df-ink)}
      .topic-provider-attribution{font-size:11px!important;line-height:1.45;color:var(--df-ink-muted)}
      .topic-provider-attribution a{color:var(--df-lens-primary);text-decoration:none}
      .topic-provider-attribution a:hover{text-decoration:underline}
      .topic-representatives{display:grid;gap:8px}
      .topic-representative{padding:7px 0;border-top:1px solid var(--df-border-soft);font-size:11.5px;line-height:1.4}
      .topic-representative>button{appearance:none;border:0;background:transparent;color:var(--df-ink);padding:0;text-align:left;font:650 11.5px var(--df-font);cursor:pointer}
      .topic-representative>button:hover{color:var(--df-lens-primary)}
      .topic-representative span{display:flex;gap:10px;flex-wrap:wrap;margin-top:4px;color:var(--df-ink-muted)}
      .topic-representative a{color:var(--df-lens-primary);text-decoration:none}
      .topic-authored{display:grid;gap:15px;margin:0 0 19px;padding:0 0 15px;border-bottom:1px solid var(--df-border)}
      .topic-authored>section{margin:0}
      .topic-editorial-detail .topic-authored p{font-size:13px;line-height:1.62;color:var(--df-ink);overflow-wrap:anywhere}
      .topic-editorial-detail .topic-analysis-reading p{color:var(--df-ink-muted)}
      .topic-cite-group{display:inline-flex;flex-wrap:wrap;gap:2px;margin:0 1px;vertical-align:1px}
      .topic-cite-chip{appearance:none;min-width:19px;height:17px;padding:0 4px;border:1px solid color-mix(in srgb,var(--df-lens-primary) 38%,var(--df-border));background:color-mix(in srgb,var(--df-lens-primary) 8%,var(--df-surface));color:var(--df-lens-primary);font:700 9.5px/15px var(--df-font-mono);text-align:center;cursor:pointer}
      .topic-cite-chip:hover,.topic-cite-chip[aria-expanded="true"]{background:var(--df-lens-primary);color:var(--df-surface)}
      .topic-cite-chip:focus-visible,.topic-cite-drawer button:focus-visible{outline:2px solid var(--df-lens-primary);outline-offset:1px}
      .topic-cite-drawer{margin:9px 0 0;padding:9px 11px 10px;border-left:3px solid var(--df-lens-primary);background:color-mix(in srgb,var(--df-lens-primary) 5%,var(--df-surface));font-size:12px;line-height:1.5;color:var(--df-ink)}
      .topic-cite-drawer-head{display:flex;align-items:flex-start;justify-content:space-between;gap:10px;margin-bottom:5px}
      .topic-cite-drawer-head span{font:600 10px var(--df-font-mono);letter-spacing:.08em;text-transform:uppercase;color:var(--df-ink-muted)}
      .topic-cite-drawer-head button{appearance:none;border:0;background:transparent;color:var(--df-ink-muted);font:inherit;font-size:14px;line-height:1;padding:0 2px;cursor:pointer}
      .topic-editorial-detail .topic-cite-drawer p{font-size:12px;line-height:1.55;color:var(--df-ink);margin:0 0 6px}
      .topic-cite-drawer a{color:var(--df-lens-primary);text-decoration:none}
      .topic-cite-drawer a:hover{text-decoration:underline}
      .topic-cite-counts{overflow-x:auto;margin:2px 0 6px}
      .topic-cite-counts table{width:100%;border-collapse:collapse;font-size:11px}
      .topic-cite-counts th,.topic-cite-counts td{padding:4px 6px 4px 0;border-top:1px solid var(--df-border-soft);text-align:left;vertical-align:top}
      .topic-cite-counts td:nth-child(2){font-variant-numeric:tabular-nums;white-space:nowrap}
      .topic-cite-counts td:last-child{color:var(--df-ink-muted)}
      .topic-authored-quotes figure{margin:0 0 11px;padding:0 0 0 11px;border-left:2px solid var(--df-border)}
      .topic-authored-quotes blockquote{margin:0;font-size:13px;line-height:1.55;color:var(--df-ink);overflow-wrap:anywhere}
      .topic-authored-quotes figcaption{display:flex;flex-wrap:wrap;gap:3px 10px;margin-top:5px;font-size:11px;line-height:1.45;color:var(--df-ink-muted)}
      .topic-authored-quotes figcaption strong{color:var(--df-ink);font-weight:650}
      .topic-authored-quotes .topic-quote-attribution{flex-basis:100%}
      .topic-authored-quotes a{color:var(--df-lens-primary);text-decoration:none}
      .topic-source-limited-note{font-size:12px!important;line-height:1.5;color:var(--df-ink-muted)!important;border-left:3px solid var(--df-lens-orange);padding:2px 0 2px 9px;margin:0 0 14px!important}
      @media(max-width:920px){
        html,body{height:auto!important;min-height:100%;overflow:auto!important}
        .viz-app{height:auto!important;min-height:100vh}
        .viz-workspace.df-reading-layout{display:flex!important;flex-direction:column;height:auto!important}
        .viz-workspace.df-reading-layout>.viz-canvas{order:0;flex:none;width:100%;height:520px;min-height:520px}
        .viz-workspace.df-reading-layout>.df-support-row{order:1;width:100%!important}
        .viz-workspace.df-reading-layout>.viz-panel{order:2;width:100%!important;min-height:520px}
        .viz-workspace.df-reading-layout>.panel-resize{display:none!important}
      }
      @media(max-width:980px){.topic-dimension-list{grid-template-columns:1fr}}
      @media(max-width:700px){.family-colour-legend{padding:9px 12px 11px!important}.topic-colour-modes{gap:5px}.topic-colour-key{grid-template-columns:repeat(2,minmax(0,1fr))}.family-colour-legend>small{display:none}.topic-map-search{order:2;flex-basis:100%;margin-left:0;min-width:0}.viz-canvas--doc .canvas{height:492px!important;min-height:492px!important}.topic-editorial-overview>h2{font-size:27px}}
      @media(max-width:430px){.topic-colour-key,.topic-key-grid{grid-template-columns:1fr}}
    `;
    document.head.appendChild(style);
  }

  function setup(projection) {
    installStyles();
    const dataElement = document.getElementById('viz-data');
    const layoutElement = document.getElementById('luna-presentation-layout');
    const net = document.getElementById('net');
    const legend = document.querySelector('.family-colour-legend');
    const general = document.getElementById('panel-general');
    if (!dataElement || !layoutElement || !net || !legend || !general) throw new Error('Topic editorial presentation hooks are missing');

    const spec = JSON.parse(dataElement.textContent);
    const layout = JSON.parse(layoutElement.textContent);
    const topics = new Map(spec.topics.map(topic => [topic.id, topic]));
    const sources = new Map(spec.sources.map(source => [source.id, source]));
    const topicProjection = projection.topics_by_id;
    const sourceProjection = projection.sources_by_id;
    const topicEvidence = projection.editorial_evidence.topics_by_id;
    const metricIndex = projection.editorial_evidence.metric_index;
    const family = new Map(projection.families.map(row => [row.key, row]));
    const dimensions = new Map(projection.dimensions.map(row => [row.key, row]));
    const eras = new Map(projection.eras.map(row => [row.key, row]));
    const voices = new Map(projection.voices.map(row => [row.key, row]));
    const scrutiny = new Map(projection.scrutiny.map(row => [row.key, row]));
    const sourceDimensions = new Map();
    const dimensionVotes = new Map();
    spec.edges.forEach(edge => {
      const key = topicProjection[edge.target]?.dimension;
      if (!key) return;
      const votes = dimensionVotes.get(edge.source) || new Map();
      votes.set(key, (votes.get(key) || 0) + 1);
      dimensionVotes.set(edge.source, votes);
    });
    dimensionVotes.forEach((votes, id) => {
      sourceDimensions.set(id, [...votes].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0][0]);
    });

    if (projection.counts.topics !== spec.topics.length || projection.counts.sources !== spec.sources.length || projection.counts.edges !== spec.edges.length) {
      throw new Error('Topic editorial projection does not match the displayed graph');
    }
    if (Object.keys(topicProjection).length !== spec.topics.length || Object.keys(sourceProjection).length !== spec.sources.length) {
      throw new Error('Topic editorial projection does not cover every displayed node');
    }
    legend.setAttribute('aria-label', 'Topic colour controls and key');

    const modes = [
      {key:'dimension', label:'Dimension'},
      {key:'family', label:'Family'},
      {key:'era', label:'Era'},
      {key:'voice', label:'Voice'},
      {key:'scrutiny', label:'Scrutiny'},
    ];
    let mode = 'dimension';

    function keyFor(id, kind, activeMode) {
      if (kind === 'topic') {
        const row = topicProjection[id];
        if (activeMode === 'dimension') return row.dimension;
        if (activeMode === 'family') return topics.get(id).dimension;
        if (activeMode === 'era') return row.dominant_era;
        if (activeMode === 'voice') return row.dominant_voice;
        return row.scrutiny;
      }
      const row = sourceProjection[id];
      if (activeMode === 'dimension') return sourceDimensions.get(id);
      if (activeMode === 'family') return row.family;
      if (activeMode === 'era') return row.era;
      if (activeMode === 'voice') return row.voice;
      return null;
    }

    function vocabulary(activeMode) {
      if (activeMode === 'dimension') return projection.dimensions;
      if (activeMode === 'family') return projection.families;
      if (activeMode === 'era') return projection.eras;
      if (activeMode === 'voice') return projection.voices;
      return projection.scrutiny;
    }

    function item(activeMode, key) {
      if (activeMode === 'dimension') return dimensions.get(key);
      if (activeMode === 'family') return family.get(key);
      if (activeMode === 'era') return eras.get(key);
      if (activeMode === 'voice') return voices.get(key);
      return scrutiny.get(key);
    }

    function colour(id, kind, activeMode) {
      if (activeMode === 'scrutiny' && kind === 'source') return tokenValue('--df-slate-500');
      return tokenValue(item(activeMode, keyFor(id, kind, activeMode))?.token);
    }

    function paint() {
      net.dataset.colourMode = mode;
      net.querySelectorAll('.node.topic').forEach(group => {
        const circle = group.querySelector('.node-circle');
        const value = colour(group.dataset.id, 'topic', mode);
        circle.style.setProperty('fill', value, 'important');
        circle.style.setProperty('stroke', value, 'important');
        circle.style.setProperty('fill-opacity', '.14', 'important');
      });
      net.querySelectorAll('.node.source').forEach(group => {
        const circle = group.querySelector('.node-circle');
        const value = colour(group.dataset.id, 'source', mode);
        circle.style.setProperty('fill', value, 'important');
        circle.style.setProperty('stroke', value, 'important');
        circle.style.setProperty('fill-opacity', mode === 'scrutiny' ? '.34' : '.5', 'important');
      });
      const edges = net.querySelectorAll('#edges .edge');
      spec.edges.forEach((edge, index) => {
        const value = colour(edge.target, 'topic', mode);
        edges[index]?.style.setProperty('--edge-editorial', value);
      });
      renderLegend();
    }

    function renderLegend() {
      const rows = vocabulary(mode);
      const explanatory = mode === 'dimension'
        ? 'The six colours are an editorial classification of the strategic question each topic primarily addresses.'
        : mode === 'family'
          ? 'Families reproduce the corpus taxonomy. A topic keeps its original measured family assignment.'
          : mode === 'era'
            ? 'Topics use their most common connected era; source dots use their publication era.'
            : mode === 'voice'
              ? 'Topics use their most common connected source voice; source dots use their recorded voice.'
              : 'Scrutiny is derived from connected voices and recorded pushback. It is a coverage signal, not a vote.';
      legend.innerHTML = `
        <div class="topic-colour-modes" role="group" aria-label="Colour the topic network by">
          <strong>Colour by</strong>
          ${modes.map(entry => `<button type="button" class="chip${entry.key === mode ? ' active' : ''}" data-topic-colour="${entry.key}" aria-pressed="${entry.key === mode}">${entry.label}</button>`).join('')}
        </div>
        <div class="topic-colour-key" role="list" aria-label="${esc(modes.find(entry => entry.key === mode).label)} colours">
          ${rows.map(row => `<span role="listitem" title="${esc(row.line || row.label)}"><i aria-hidden="true" style="background:${tokenValue(row.token)}"></i>${esc(row.label)}</span>`).join('')}
        </div>
        <small>${esc(explanatory)} Select a mark to trace its measured connections.</small>`;
      renderPanelMode();
    }

    legend.addEventListener('click', event => {
      const button = event.target.closest('[data-topic-colour]');
      if (!button || button.dataset.topicColour === mode) return;
      mode = button.dataset.topicColour;
      paint();
    });

    const networkState = window.DFTopicNetworkState;
    if (networkState?.spec?.topics) {
      networkState.spec.topics.forEach(topic => { topic.editorialLabel = topicProjection[topic.id].short_label; });
    }
    net.querySelectorAll('.node.topic').forEach(group => {
      const label = group.querySelector('.node-label');
      if (label) label.textContent = topicProjection[group.dataset.id].short_label;
    });
    if (window.DFSpreadRefreshLabels) window.DFSpreadRefreshLabels();

    function openNode(id) {
      const node = net.querySelector(`.node[data-id="${CSS.escape(id)}"]`);
      if (!node) return;
      node.dispatchEvent(new MouseEvent('click', {bubbles:true, cancelable:true, view:window}));
    }

    // Dense regions can contain several genuinely overlapping circles. Ask which
    // visible mark the reader means rather than letting SVG paint order choose.
    function installNodeChoice() {
      const chooser = document.createElement('div');
      chooser.id = 'topic-node-choice';
      chooser.hidden = true;
      chooser.setAttribute('role', 'dialog');
      chooser.setAttribute('aria-label', 'Overlapping nodes');
      const style = document.createElement('style');
      style.textContent = `
        #topic-node-choice{position:fixed;z-index:350;width:min(340px,calc(100vw - 20px));max-height:min(360px,calc(100vh - 20px));overflow:auto;padding:12px;background:var(--df-surface);border:1px solid var(--df-border);box-shadow:var(--df-shadow-panel);color:var(--df-ink)}
        #topic-node-choice[hidden]{display:none}
        #topic-node-choice p{margin:0 0 8px;font:600 13px var(--df-font)}
        #topic-node-choice button{display:block;width:100%;padding:8px 2px;text-align:left;background:transparent;border:0;border-top:1px solid var(--df-border);color:var(--df-ink);font:12px/1.4 var(--df-font);cursor:pointer}
        #topic-node-choice button:hover,#topic-node-choice button:focus-visible{background:var(--df-surface-alt,var(--df-surface));outline:2px solid var(--df-lens-primary);outline-offset:-2px}
      `;
      document.head.appendChild(style);
      document.body.appendChild(chooser);
      function close(restoreFocus) { chooser.hidden = true; if (restoreFocus) net.focus({preventScroll:true}); }
      chooser.addEventListener('click', event => {
        const button = event.target.closest('button');
        if (!button) return;
        close(false);
        if (button.dataset.chooseNode) openNode(button.dataset.chooseNode);
        else net.focus({preventScroll:true});
      });
      document.addEventListener('pointerdown', event => {
        if (!chooser.hidden && !chooser.contains(event.target)) close(false);
      }, true);
      document.addEventListener('keydown', event => {
        if (event.key === 'Escape' && !chooser.hidden) {
          event.preventDefault(); event.stopImmediatePropagation(); close(true);
        }
      }, true);
      net.addEventListener('click', event => {
        // Keyboard and named-label navigation already identify an exact node.
        if (!event.isTrusted || event.detail === 0 || !event.target.matches('.node-circle')) return;
        const matrix = net.getScreenCTM();
        const point = new DOMPoint(event.clientX, event.clientY).matrixTransform(matrix.inverse());
        const hitNode = event.target.closest('.node');
        // Click coordinates round to CSS pixels; preserve the browser's actual
        // hit and allow subpixel source dots at overview zoom to participate.
        const tolerance = .75 / Math.hypot(matrix.a, matrix.b);
        const candidates = [...net.querySelectorAll('.node')].filter(group => {
          const circle = group.querySelector('.node-circle'), style = getComputedStyle(group);
          if (style.display === 'none' || style.visibility === 'hidden' || Number(style.opacity) === 0) return false;
          return group === hitNode || Math.hypot(point.x - Number(circle.getAttribute('cx')), point.y - Number(circle.getAttribute('cy'))) <= Number(circle.getAttribute('r')) + tolerance;
        });
        if (candidates.length < 2) return;
        event.preventDefault(); event.stopImmediatePropagation();
        candidates.sort((a,b) => Number(b.classList.contains('topic')) - Number(a.classList.contains('topic')));
        chooser.innerHTML = '<p>These nodes overlap. Choose one:</p>' + candidates.map(group => {
          const id = group.dataset.id, topic = topics.has(id);
          const label = topic ? topicProjection[id].short_label : sources.get(id).label;
          return `<button type="button" data-choose-node="${esc(id)}">${topic ? 'Topic' : 'Source'} · ${esc(label)}</button>`;
        }).join('') + '<button type="button">Cancel</button>';
        chooser.hidden = false;
        chooser.style.left = Math.max(10, Math.min(event.clientX + 10, innerWidth - chooser.offsetWidth - 10)) + 'px';
        chooser.style.top = Math.max(10, Math.min(event.clientY + 10, innerHeight - chooser.offsetHeight - 10)) + 'px';
        chooser.querySelector('button').focus({preventScroll:true});
      }, true);
    }
    installNodeChoice();

    function installMapSearch() {
      const toolbar = document.querySelector('.spread-tools');
      if (!toolbar || toolbar.querySelector('#topic-map-search-input')) return;
      const host = document.createElement('div');
      host.className = 'topic-map-search';
      host.innerHTML = '<label for="topic-map-search-input">Search map</label><input id="topic-map-search-input" type="search" autocomplete="off" placeholder="Topic or source"><span class="topic-map-search-status" aria-live="polite"></span>';
      toolbar.appendChild(host);
      const input = host.querySelector('input');
      const status = host.querySelector('.topic-map-search-status');
      const candidates = [
        ...spec.topics.map(topic => ({id:topic.id, kind:'topic', label:topicProjection[topic.id].short_label, full:topic.label})),
        ...spec.sources.map(source => ({id:source.id, kind:'source', label:source.label, full:source.label})),
      ];
      input.addEventListener('keydown', event => {
        if (event.key !== 'Enter') return;
        event.preventDefault();
        const term = input.value.trim().toLocaleLowerCase();
        if (!term) { status.textContent = 'Enter a topic or source title.'; return; }
        const matches = candidates.filter(row => row.label.toLocaleLowerCase().includes(term) || row.full.toLocaleLowerCase().includes(term))
          .sort((a, b) => Number(a.kind !== 'topic') - Number(b.kind !== 'topic') || a.label.length - b.label.length || a.label.localeCompare(b.label));
        if (!matches.length) { status.textContent = `No map item matches ${input.value}.`; return; }
        openNode(matches[0].id);
        status.textContent = `Opened ${matches[0].kind}: ${matches[0].label}. ${matches.length} matches.`;
      });
    }
    installMapSearch();

    function metricReceipt(metricId) {
      const row = metricIndex[metricId];
      return `<code>${Number(row.value).toLocaleString()} ${esc(row.unit)} / denominator ${Number(row.denominator).toLocaleString()}</code> · ${esc(row.label)}`;
    }

    function findingHTML(row) {
      return `<article class="topic-finding">
        <button type="button" class="topic-finding-main" data-editorial-topic="${esc(row.topic)}">
          <span class="topic-finding-number">${esc(row.number)}</span><span><strong>${esc(row.title)}</strong><small>${esc(row.text)}</small></span>
        </button>
        <p class="topic-finding-consequence"><strong>Why it matters:</strong> ${esc(row.consequence)}</p>
        <div class="topic-finding-links" aria-label="Open evidence topics">${row.topic_ids.map(topicId => `<button type="button" class="topic-evidence-chip" data-editorial-topic="${esc(topicId)}" style="--chip-colour:${tokenValue(dimensions.get(topicProjection[topicId].dimension)?.token)}">${esc(topicProjection[topicId].short_label)}</button>`).join('')}</div>
      </article>`;
    }

    function renderPanelMode() {
      const current = general.querySelector('[data-topic-current-view]');
      const key = general.querySelector('[data-topic-panel-key]');
      if (!current || !key) return;
      const reading = projection.overview.current_views[mode];
      current.innerHTML = `<div class="p-block-label">Interpretation · ${esc(modes.find(row => row.key === mode).label)}</div><h3>${esc(reading.title)}</h3><p>${esc(reading.text)}</p>`;
      key.innerHTML = vocabulary(mode).map(row => `<button type="button" class="topic-key-item" data-editorial-key="${esc(row.key)}" style="--key-colour:${tokenValue(row.token)}"><i aria-hidden="true"></i><span>${esc(row.label)}</span></button>`).join('');
    }

    function overviewHTML() {
      const overview = projection.overview;
      const publicCount = Object.values(sourceProjection).filter(source => source.publisher_url).length;
      return `<article class="topic-editorial-overview">
        <p class="reading-kicker">${esc(overview.kicker)}</p>
        <h2>${esc(overview.title)}</h2>
        <p class="reading-headline">${esc(overview.summary)}</p>
        <section class="topic-current-view" data-topic-current-view aria-live="polite"></section>
        <section class="topic-panel-key" aria-labelledby="topic-panel-key-title"><h3 id="topic-panel-key-title">Visible key</h3><div class="topic-key-grid" data-topic-panel-key></div></section>
        <section class="topic-shape" aria-labelledby="topic-shape-title">
          <h3 id="topic-shape-title">What the shape says</h3>
          ${overview.findings.map(findingHTML).join('')}
        </section>
        <details class="topic-overview-detail"><summary>What this shows</summary><p>${esc(overview.what_this_shows)}</p></details>
        <details class="topic-overview-detail"><summary>How to read it</summary><div class="topic-howto">
          <div class="topic-howto-row"><span class="topic-howto-mark">T</span><span><strong>Topic</strong> · a large circle, sized by distinct connected source works.</span></div>
          <div class="topic-howto-row"><span class="topic-howto-mark">S</span><span><strong>Source</strong> · a small circle, sized by the number of topics it touches.</span></div>
          <div class="topic-howto-row"><span class="topic-howto-mark">—</span><span><strong>Connection</strong> · one retained source-to-topic position. Select either end to inspect the evidence.</span></div>
          <div class="topic-howto-row"><span class="topic-howto-mark">↔</span><span><strong>Distance</strong> · a layout aid. It does not measure agreement, influence or causal strength.</span></div>
        </div></details>
        <details class="topic-overview-detail"><summary>Verification · evidence for the ${overview.findings.length === 5 ? 'five' : overview.findings.length === 6 ? 'six' : overview.findings.length} findings</summary><ol class="topic-verification-list">${overview.findings.map(row => `<li><strong>${esc(row.number)} · ${esc(row.title)}</strong>${row.metric_ids.map(metricReceipt).join('<br>')}<br><span>Evidence anchors: ${(row.evidence_sources || []).map(source => `<a href="${esc(source.record_href)}" data-reading-record="true">${esc(source.title)}</a>`).join(' · ')}</span></li>`).join('')}</ol><p>${esc(overview.limits)}</p></details>
        <details class="topic-source-register"><summary>Source register · all ${projection.counts.sources.toLocaleString()} works</summary>
          <div class="topic-source-search"><label for="topic-source-query">Find a source</label><input id="topic-source-query" type="search" autocomplete="off" placeholder="Search source titles"><p><span data-source-result-count>${projection.counts.sources.toLocaleString()}</span> saved records · ${publicCount.toLocaleString()} captured publisher links</p></div>
          <div class="topic-source-results" aria-live="polite"></div>
          <button class="topic-source-more" type="button" hidden>Show more</button>
          ${publicCount < projection.counts.sources ? `<p class="topic-source-note">${(projection.counts.sources-publicCount).toLocaleString()} saved records have no publisher URL in the captured corpus. Their corpus records remain available.</p>` : ''}
        </details>
        <details class="topic-overview-detail"><summary>What it is built from</summary><p>${esc(overview.built_from)}</p><p>${esc(projection.method)}</p></details>
      </article>`;
    }

    general.innerHTML = overviewHTML();
    general.addEventListener('click', event => {
      const topicButton = event.target.closest('[data-editorial-topic]');
      if (topicButton) openNode(topicButton.dataset.editorialTopic);
      const keyButton = event.target.closest('[data-editorial-key]');
      if (keyButton) {
        const candidate = spec.topics
          .filter(topic => keyFor(topic.id, 'topic', mode) === keyButton.dataset.editorialKey)
          .sort((a, b) => b.source_reach - a.source_reach || a.id.localeCompare(b.id))[0];
        if (candidate) openNode(candidate.id);
      }
      const dimensionButton = event.target.closest('[data-editorial-dimension]');
      if (dimensionButton) {
        mode = 'dimension'; paint();
        const candidate = spec.topics
          .filter(topic => topicProjection[topic.id].dimension === dimensionButton.dataset.editorialDimension)
          .sort((a, b) => b.source_reach - a.source_reach || a.id.localeCompare(b.id))[0];
        if (candidate) openNode(candidate.id);
      }
    });

    const sourceRows = Object.entries(sourceProjection).sort((a, b) => a[1].title.localeCompare(b[1].title));
    const register = general.querySelector('.topic-source-register');
    const query = general.querySelector('#topic-source-query');
    const results = general.querySelector('.topic-source-results');
    const more = general.querySelector('.topic-source-more');
    let visible = 36;
    let filtered = sourceRows;

    function renderSources() {
      results.innerHTML = filtered.slice(0, visible).map(([id, source]) => `<article class="topic-source-row">
        <button type="button" data-editorial-source="${esc(id)}">${esc(source.title)}</button>
        <span><a href="${esc(source.record_href)}" data-reading-record="true">Saved corpus record</a>${source.publisher_url ? `<a href="${esc(source.publisher_url)}" target="_blank" rel="noopener noreferrer">Original publication</a>` : '<em>No captured original link</em>'}</span>
      </article>`).join('') || '<p class="topic-source-empty">No source titles match this search.</p>';
      general.querySelector('[data-source-result-count]').textContent = filtered.length.toLocaleString();
      more.hidden = visible >= filtered.length;
    }
    register.addEventListener('toggle', () => { if (register.open && !results.childElementCount) renderSources(); });
    query.addEventListener('input', () => {
      const term = query.value.trim().toLocaleLowerCase();
      filtered = term ? sourceRows.filter(([_id, source]) => source.title.toLocaleLowerCase().includes(term)) : sourceRows;
      visible = 36; renderSources();
    });
    more.addEventListener('click', () => { visible += 60; renderSources(); });
    results.addEventListener('click', event => {
      const button = event.target.closest('[data-editorial-source]');
      if (button) openNode(button.dataset.editorialSource);
    });

    const detail = document.getElementById('detail-host');
    const renderEnv = {item, sourceProjection, eras: projection.eras.map(row => row.key), voices: projection.voices.map(row => row.key)};

    function selectedId() {
      return detail?.querySelector('.reading-profile[data-reading-profile]')?.dataset.readingProfile
        || detail?.querySelector('[data-rich-profile]')?.dataset.richProfile;
    }

    function topicReadingHTML(id) {
      return topicPanelHTML(id, topicEvidence[id], renderEnv);
    }

    function sourceReadingHTML(id) {
      const source = sourceProjection[id];
      const connected = spec.edges.filter(edge => edge.source === id)
        .map(edge => edge.target)
        .sort((a, b) => topics.get(b).source_reach - topics.get(a).source_reach || a.localeCompare(b));
      return `<section class="topic-editorial-detail" data-topic-editorial-detail="${esc(id)}">
        <section><h3>Why it matters to this map</h3><p>This ${esc(source.voice)} source from ${esc(source.era)} connects to ${connected.length.toLocaleString()} ${connected.length === 1 ? 'topic' : 'topics'} in the captured graph. Its breadth shows where this work enters the corpus argument; it does not establish the work’s influence or the strength of its claims.</p></section>
        <section><h3>Topics carried by this source</h3><div class="topic-finding-links">${connected.slice(0, 8).map(topicId => `<button type="button" class="topic-evidence-chip" data-editorial-topic="${esc(topicId)}" style="--chip-colour:${tokenValue(dimensions.get(topicProjection[topicId].dimension)?.token)}">${esc(topicProjection[topicId].short_label)}</button>`).join('')}</div></section>
      </section>`;
    }

    function augmentDetail() {
      const profile = detail?.querySelector('.reading-profile[data-reading-profile]');
      const id = selectedId();
      if (!id || (!topics.has(id) && !sourceProjection[id]) || detail.querySelector(`[data-topic-editorial-detail="${CSS.escape(id)}"]`)) return;
      if (sourceProjection[id] && profile && !profile.querySelector('.topic-source-actions')) {
        const source = sourceProjection[id];
        const heading = profile.querySelector('h2');
        const actions = document.createElement('div');
        actions.className = 'topic-source-actions';
        actions.innerHTML = `<a href="${esc(source.record_href)}" data-reading-record="true">Read saved corpus record</a>${source.publisher_url ? `<a href="${esc(source.publisher_url)}" target="_blank" rel="noopener noreferrer">Open original publication</a>` : '<span>No publisher URL was captured for this source.</span>'}`;
        heading?.insertAdjacentElement('afterend', actions);
      }
      // The figure's embedded reading-data still marks every authored topic "source-limited",
      // because no Phase 2b pass updated it, so the panel kicker reads SOURCE-LIMITED READING
      // above an argued reading -- the opposite of what the panel contains. The editorial
      // projection is the authority on which topics are authored, so correct the kicker here.
      // The payload itself is still wrong; fixing it means a Phase 2b reading-data install.
      const kicker = profile?.querySelector('.reading-kicker');
      if (kicker && topicEvidence[id]?.editorial_reading?.quality === 'authored') {
        kicker.textContent = 'Dragonfly interpretation';
      }
      const anchor = profile?.querySelector('.reading-lead') || detail.querySelector('.detail-head');
      if (!anchor) return;
      anchor.insertAdjacentHTML('afterend', topics.has(id) ? topicReadingHTML(id) : sourceReadingHTML(id));
      const limits = profile?.querySelector('.reading-limits');
      if (topics.has(id) && topicEvidence[id].editorial_reading?.quality === 'authored' && limits && !limits.querySelector('.topic-authored-limit')) {
        limits.querySelector('summary')?.insertAdjacentHTML('afterend', `<p class="topic-authored-limit">${esc(AUTHORED_LIMIT)}</p>`);
      }
    }

    function toggleCitation(chip) {
      const block = chip.closest('[data-topic-authored]');
      const part = chip.closest('[data-authored-part]');
      const drawer = part?.querySelector('[data-topic-cite-drawer]');
      const packet = block && topicEvidence[block.dataset.topicAuthored];
      if (!drawer || !packet) return;
      const number = Number(chip.dataset.topicCite);
      const open = chip.getAttribute('aria-expanded') === 'true';
      block.querySelectorAll('.topic-cite-chip[aria-expanded="true"]').forEach(other => other.setAttribute('aria-expanded', 'false'));
      block.querySelectorAll('[data-topic-cite-drawer]').forEach(other => { other.hidden = true; other.innerHTML = ''; });
      if (open) return;
      const ref = citationRefs(packet.editorial_reading)[number - 1];
      if (!ref) return;
      drawer.innerHTML = citationDrawerHTML(ref, number, packet, renderEnv);
      drawer.hidden = false;
      block.querySelectorAll(`.topic-cite-chip[data-topic-cite="${number}"]`).forEach(match => match.setAttribute('aria-expanded', 'true'));
    }
    detail?.addEventListener('click', event => {
      const chip = event.target.closest('.topic-cite-chip');
      if (chip) { toggleCitation(chip); return; }
      const close = event.target.closest('[data-topic-cite-close]');
      if (close) {
        const block = close.closest('[data-topic-authored]');
        const chips = block?.querySelectorAll('.topic-cite-chip[aria-expanded="true"]');
        if (chips?.length) toggleCitation(chips[0]);
        chips?.[0]?.focus({preventScroll:true});
        return;
      }
      const sourceButton = event.target.closest('[data-editorial-source]');
      if (sourceButton) openNode(sourceButton.dataset.editorialSource);
      const topicButton = event.target.closest('[data-editorial-topic]');
      if (topicButton) openNode(topicButton.dataset.editorialTopic);
    });
    if (detail) new MutationObserver(augmentDetail).observe(detail, {childList:true, subtree:true});

    paint();
    document.documentElement.dataset.topicEditorialReady = 'true';
    window.DFTopicEditorial = {projection, paint, openNode, get mode(){ return mode; }};
  }

  function start() {
    fetch(PROJECTION_URL).then(response => {
      if (!response.ok) throw new Error(`Topic editorial projection failed to load: ${response.status}`);
      return response.json();
    }).then(setup).catch(error => {
      console.error(error);
      document.documentElement.dataset.topicEditorialError = 'true';
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, {once:true});
  else start();
})();
