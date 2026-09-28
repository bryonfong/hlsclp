(function () {
  'use strict';

  const PROJECTION_URL = new URL('../actor-editorial-projection.json?v=core50-20260920', location.href);
  const WHOLE_MAP_URL = new URL('../actor-whole-map.json?v=whole-map-20260920', location.href);
  const GROUPS_URL = new URL('../actor-display-groups.json?v=group-views-20260920', location.href);
  const esc = value => String(value == null ? '' : value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const number = value => value == null ? '—' : Number(value).toLocaleString();
  const decimal = (value, places = 3) => value == null ? '—' : Number(value).toFixed(places);

  function installStyles() {
    if (document.getElementById('actor-editorial-presentation-style')) return;
    const style = document.createElement('style');
    style.id = 'actor-editorial-presentation-style';
    style.textContent = `
      body>main{grid-template-columns:minmax(0,1fr) minmax(400px,470px)}
      body>main>aside{background:var(--df-surface-raised,#f2f3f5);padding:0 24px 30px;min-height:0}
      body>main>aside .panel-nav{background:var(--df-surface-raised,#f2f3f5);padding:12px 0 10px}
      #panel{max-width:680px;margin:0 auto;padding-bottom:18px}
      .actor-editorial{padding:8px 0 24px}
      .actor-editorial .actor-badge{font-family:var(--df-font-mono,ui-monospace,monospace);font-size:10.5px;line-height:1.35;letter-spacing:.11em;text-transform:uppercase;color:var(--df-lens-primary,var(--accent));margin:8px 0 10px}
      .actor-editorial>h2{font-size:clamp(25px,2vw,34px)!important;line-height:1.08!important;letter-spacing:-.025em;margin:0 0 13px!important}
      .actor-editorial .actor-summary{font-size:15px;line-height:1.58;color:var(--df-ink-soft,var(--soft));margin:0 0 20px}
      .actor-current-view{padding:12px 13px;border-left:4px solid var(--df-lens-primary,var(--accent));background:var(--df-surface,#fff);margin:18px 0}
      .actor-current-view strong{display:block;font-size:13px;line-height:1.3;margin-bottom:4px}
      .actor-current-view p{font-size:12px;line-height:1.5;margin:0!important;color:var(--df-ink-muted,var(--soft))}
      .actor-key{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin:9px 0 20px}
      .actor-key>div{padding:8px 9px;background:var(--df-surface,#fff);border:1px solid var(--df-border,var(--border));font-size:11px;line-height:1.4}
      .actor-key strong{display:block;color:var(--df-ink,var(--ink));font-size:11.5px;margin-bottom:2px}
      .actor-shape{border-top:1px solid var(--df-border,var(--border));margin-top:20px}
      .actor-shape>h3,.actor-section>h3{font-size:14px!important;margin:21px 0 9px!important}
      .actor-finding{display:grid;grid-template-columns:30px 1fr;gap:8px;padding:13px 2px;border-top:1px solid var(--df-border,var(--border))}
      .actor-finding:first-of-type{border-top:0}
      .actor-finding-number{font-family:var(--df-font-mono,ui-monospace,monospace);font-size:11px;color:var(--df-lens-primary,var(--accent));padding-top:2px}
      .actor-finding h4{font-size:14px;line-height:1.32;margin:0 0 4px}
      .actor-finding p{font-size:12px;line-height:1.5;color:var(--df-ink-muted,var(--soft));margin:0 0 8px!important}
      .actor-reference-list{display:flex;flex-wrap:wrap;gap:5px 9px;align-items:center}
      .actor-reference-list button{appearance:none;border:0;background:transparent;color:var(--df-lens-primary,var(--accent));font:inherit;font-size:11px;padding:0;text-align:left;text-decoration:underline;text-decoration-thickness:1px;text-underline-offset:2px;cursor:pointer}
      .actor-reference-list span{font-size:10.5px;color:var(--df-ink-muted,var(--soft))}
      .actor-card-proof{margin-top:8px;border-top:0!important}
      .actor-card-proof>summary{font-size:10.5px;font-weight:650;color:var(--df-ink-muted,var(--soft))}
      .actor-card-proof .actor-source-links{padding-top:7px}
      .actor-accordion{border-top:1px solid var(--df-border,var(--border));padding:0;margin:0!important}
      .actor-accordion>summary{font-size:12px;font-weight:700;color:var(--df-ink,var(--ink));padding:13px 0;cursor:pointer;list-style-position:inside}
      .actor-accordion>p,.actor-accordion>div>p{font-size:12px;line-height:1.55;color:var(--df-ink-muted,var(--soft));margin:0 0 14px!important}
      .actor-section{border-top:1px solid var(--df-border,var(--border));padding:0 0 15px}
      .actor-section>p{font-size:12.5px;line-height:1.58;margin:0 0 10px!important}
      .actor-unknown{padding:10px 11px;background:var(--df-surface,#fff);border:1px solid var(--df-border,var(--border));color:var(--df-ink-muted,var(--soft))}
      .actor-role-description{font-size:15px!important;font-weight:650;line-height:1.45!important;margin-bottom:8px!important}
      .actor-measure-grid{display:grid;grid-template-columns:1fr 1fr;gap:0 16px;background:var(--df-surface,#fff);padding:5px 11px;border:1px solid var(--df-border,var(--border))}
      .actor-measure-grid .row{min-width:0}
      .actor-measure-grid .row span:first-child{color:var(--df-ink-muted,var(--soft))}
      .actor-measure-grid .row span:last-child{text-align:right}
      .actor-association,.actor-relationship,.actor-source-row{padding:10px 0;border-top:1px solid var(--df-border,var(--border))}
      .actor-association:first-of-type,.actor-relationship:first-of-type,.actor-source-row:first-of-type{border-top:0}
      .actor-association-head,.actor-relationship-head{display:flex;justify-content:space-between;align-items:baseline;gap:12px}
      .actor-association-head button,.actor-relationship-head button{appearance:none;border:0;background:transparent;color:var(--df-lens-primary,var(--accent));padding:0;text-align:left;font:inherit;font-weight:650;cursor:pointer}
      .actor-association-head span,.actor-relationship-head span{font-size:10.5px;color:var(--df-ink-muted,var(--soft));text-align:right}
      .actor-association p,.actor-relationship p{font-size:11.5px!important;color:var(--df-ink-muted,var(--soft));margin:4px 0 0!important}
      .actor-measured-open{font-size:10.5px!important;font-weight:500!important;margin-top:5px}
      .actor-source-row h4{font-size:12px;margin:0 0 5px}
      .actor-source-row blockquote{font-size:11.5px;line-height:1.5;margin:7px 0;padding-left:11px}
      .actor-source-links{display:flex;gap:7px 13px;flex-wrap:wrap;font-size:11px}
      .actor-source-links a{color:var(--df-lens-primary,var(--accent));text-decoration:none}
      .actor-source-links a:hover{text-decoration:underline}
      .actor-source-register-search{padding:2px 0 10px}
      .actor-source-register-search label{display:block;font-size:11px;font-weight:700;margin-bottom:5px}
      .actor-source-register-search input{width:100%;min-height:36px;padding:7px 9px;border:1px solid var(--df-border,var(--border));background:var(--df-surface,#fff);color:var(--df-ink,var(--ink));font:inherit}
      .actor-source-register-results{max-height:360px;overflow:auto;border-top:1px solid var(--df-border,var(--border))}
      .actor-source-register-results .actor-source-row{padding:8px 0}
      .actor-source-register-results p{font-size:11.5px;margin:0 0 5px!important;color:var(--df-ink,var(--ink))}
      .actor-profile-section{padding:10px 0;border-top:1px solid var(--df-border,var(--border))}
      .actor-profile-section h4{font-size:12px;margin:0 0 5px}
      .actor-profile-section p{font-size:11.5px!important;line-height:1.5;margin:0!important;color:var(--df-ink-muted,var(--soft))}
      .actor-profile-section small{display:block;margin-top:5px;color:var(--df-ink-muted,var(--soft))}
      .actor-proof{font:10px/1.55 var(--df-font-mono,ui-monospace,monospace);overflow-wrap:anywhere;color:var(--df-ink-muted,var(--soft))}
      .actor-disclosure{font-size:12px!important;line-height:1.5!important;color:var(--df-ink-muted,var(--soft));padding:8px 10px;border-left:3px solid var(--df-border,var(--border));background:var(--df-surface,#fff);margin:0 0 16px!important}
      .actor-stakeholder{border-top:2px solid var(--df-lens-primary,var(--accent))}
      .actor-stakeholder>h4,.actor-rail-entry .actor-stakeholder-name{font-size:14px;line-height:1.35;margin:0 0 7px;color:var(--df-ink,var(--ink))}
      .actor-stakeholder-block{padding:9px 0;border-top:1px solid var(--df-border,var(--border))}
      .actor-stakeholder-block>strong{display:block;font-size:11.5px;margin-bottom:4px;color:var(--df-ink,var(--ink))}
      .actor-stakeholder-block p{font-size:12.5px!important;line-height:1.58;margin:0 0 6px!important;color:var(--df-ink,var(--ink))}
      .actor-stakeholder-block .actor-relationship p{font-size:11.5px!important;color:var(--df-ink-muted,var(--soft))}
      .actor-chips{display:flex;flex-wrap:wrap;gap:5px;margin:0 0 8px!important}
      .actor-chips span{font-size:10.5px;line-height:1.3;padding:3px 7px;border:1px solid var(--df-border,var(--border));background:var(--df-surface,#fff);color:var(--df-ink,var(--ink));overflow-wrap:anywhere}
      .actor-cite{appearance:none;border:0;background:transparent;color:var(--df-lens-primary,var(--accent));font:inherit;font-size:.72em;font-weight:700;vertical-align:super;line-height:1;padding:0 1px;cursor:pointer}
      .actor-cite[aria-expanded="true"]{text-decoration:underline}
      .actor-lens-drawer{margin:8px 0 4px;padding:6px 11px;background:var(--df-surface,#fff);border:1px solid var(--df-border,var(--border))}
      .actor-byline{font-size:11px!important;margin:0 0 4px!important;color:var(--df-ink-muted,var(--soft))}
      .actor-group-reading{font-size:12px!important;line-height:1.5!important;color:var(--df-ink-muted,var(--soft));margin:-2px 0 8px!important;font-style:italic}
      .actor-member-link{font-size:12px!important;margin:0 0 14px!important;color:var(--df-ink-muted,var(--soft))}
      .actor-member-link button{appearance:none;border:0;background:transparent;color:var(--df-lens-primary,var(--accent));font:inherit;font-weight:650;padding:0;text-align:left;cursor:pointer;text-decoration:underline;text-underline-offset:2px}
      .actor-rail-entry>summary{font-weight:650}
      .actor-relationship-head .actor-lens-counterpart{font-size:12px;font-weight:650;text-align:left;color:var(--df-ink,var(--ink))}
      .actor-accordion>h4{font-size:12px;margin:10px 0 6px}
      .actor-accordion .note{font-size:11.5px;line-height:1.5;color:var(--df-ink-muted,var(--soft))}
      @media(max-width:1000px){body>main{grid-template-columns:minmax(0,1fr) minmax(350px,410px)}}
      @media(max-width:700px){body>main{display:contents!important}body>main>#stage{order:0}body>main>aside{order:3;max-height:none;min-height:70vh;border-left:0;border-top:1px solid var(--df-border,var(--border));padding:0 16px 24px}.actor-key,.actor-measure-grid{grid-template-columns:1fr}}
    `;
    document.head.appendChild(style);
  }

  function setup(projection) {
    installStyles();
    const panel = document.getElementById('panel');
    if (!panel || typeof showPanel !== 'function' || typeof open !== 'function') throw new Error('Actor editorial presentation hooks are missing');
    if (projection.counts.actors !== actorMap.size || projection.counts.classes !== classMap.size || projection.counts.associations !== DATA.levels.L2_entity.edges.length || projection.counts.interpreted_relationships !== ENRICHMENT.relationships.length) {
      throw new Error('Actor editorial projection does not match the displayed contract');
    }

    const actors = projection.actors_by_id;
    const classes = projection.classes_by_id;
    const communities = projection.communities_by_id;
    const associations = projection.associations_by_id;
    const relationships = projection.relationships_by_id;
    const sources = projection.sources_by_id;
    const metrics = projection.metric_index;
    const evidence = new Map(ENRICHMENT.evidence.map(row => [row.id, row]));
    const sourceRows = Object.values(sources).sort((a, b) => a.title.localeCompare(b.title) || a.id.localeCompare(b.id));
    let sourceFilter = '';
    const depthView = window.DFActorDepth?.create(projection, {
      graphRoot: root.node(), metricsById: Object.fromEntries(actorMap),
      controls:updateControls,
      state: () => ({level, sizeBy, selection: selected}),
      overview: mode => {
        if (level !== 'L2_entity') {level = 'L2_entity'; draw();}
        open('overview', 'overview');
      },
      actor: id => open('actor', id), group: id => open('strategic-group', id),
      displayGroup: id => open('map-group', id), groupRelationship: id => open('map-group-relationship', id),
      relationship: id => open('strategic-relationship', id)
    });

    function sourceLinks(source) {
      return `<div class="actor-source-links"><a href="${esc(source.record_href)}" data-reading-record="true">Read saved corpus record</a>${source.public_url ? `<a href="${esc(source.public_url)}" target="_blank" rel="noopener noreferrer">Original publication</a>` : '<span>No captured public link</span>'}</div>`;
    }

    function metricRows(ids) {
      return ids.map(id => metrics[id]).filter(Boolean).map(row => `<div class="row"><span>${esc(row.label)}</span><span>${esc(row.value)}</span></div>`).join('');
    }

    function referenceLinks(row) {
      const links = [];
      (row.actor_ids || []).forEach(id => links.push(`<button type="button" data-actor="${esc(id)}">${esc(id)}</button>`));
      (row.class_ids || []).forEach(id => links.push(`<button type="button" data-class="${esc(id)}">${esc(classes[id].title)}</button>`));
      (row.community_ids || []).forEach(id => links.push(`<button type="button" data-community="${esc(id)}">${esc(communities[id].title)}</button>`));
      const count = (row.evidence_refs || []).length;
      if (count) links.push(`<span>${count} cited passage${count === 1 ? '' : 's'}</span>`);
      return `<div class="actor-reference-list">${links.join('')}</div>`;
    }

    function proofLinks(evidenceRefs) {
      const seen = new Set();
      const rows = (evidenceRefs || []).map(id => {
        const record = projection.evidence_by_id[id];
        if (!record || seen.has(record.source_id)) return '';
        seen.add(record.source_id);
        const source = sources[record.source_id];
        return `<div class="actor-source-row"><h4>${esc(source.title)}</h4>${bylineHTML(source)}${sourceLinks(source)}</div>`;
      }).filter(Boolean).join('');
      return rows || '<p>No source link is attached to this record.</p>';
    }

    const lens = projection.stakeholder_lens || null;
    const lensActors = lens ? lens.actors_by_id : {};
    const CONTROL_TYPES = new Set(['supply', 'dependency', 'gatekeeping', 'transactional']);

    function bylineHTML(row) {
      return row && row.byline ? `<p class="actor-byline">${esc(row.byline)}</p>` : '';
    }

    function segmentsHTML(segments, counter) {
      return (segments || []).map(segment => {
        if (segment.cite) {
          counter.n += 1;
          return `<button type="button" class="actor-cite" data-lens-cite="${esc(segment.cite.join(' '))}" aria-expanded="false" aria-label="Show cited passage ${counter.n}">${counter.n}</button>`;
        }
        return esc(segment.text);
      }).join('');
    }

    function lensName(id) {
      return lensActors[id] ? lensActors[id].name : '';
    }

    function lensRelationshipHTML(relationship, lensId, counter) {
      const outgoing = relationship.source === lensId;
      const other = outgoing ? relationship.target : relationship.source;
      const arrow = relationship.asymmetry === 'reciprocal' ? '↔' : outgoing ? '→' : '←';
      return `<article class="actor-relationship"><div class="actor-relationship-head"><span class="actor-lens-counterpart">${arrow} ${esc(lensName(other))}</span><span>${esc(relationship.type)} · ${esc(relationship.asymmetry)} · confidence ${esc(relationship.confidence)}</span></div><p>${segmentsHTML(relationship.basis_segments, counter)}</p></article>`;
    }

    function stakeholderBodyHTML(lensId, counter) {
      const row = lensActors[lensId];
      // Schema 1.2 (Step A6): the reviewed Phase 2b panel replaces the seed run's fixed
      // strategic fields. Its sections carry their own headings, in the order A4 set.
      if (row.panel_sections && row.panel_sections.length) {
        const chips = `<p class="actor-chips"><span>${esc(row.type)}</span><span>Position: ${esc(row.position)}</span><span>Salience: ${esc(row.salience)}</span><span>Confidence: ${esc(row.confidence)}</span></p>`;
        const sources = row.power_sources && row.power_sources.length
          ? `<div class="actor-stakeholder-block"><strong>Power sources</strong><p>${row.power_sources.map(esc).join('; ')}</p></div>` : '';
        const sections = row.panel_sections.map(section =>
          `<div class="actor-stakeholder-block" data-panel-section="${esc(section.key)}"><strong>${esc(section.heading)}</strong><p>${segmentsHTML(section.segments, counter)}</p></div>`).join('');
        const blocs = (row.coalition_ids || []).map(id => lens.coalitions_by_id[id]).filter(Boolean).map(coalition =>
          `<div class="actor-stakeholder-block"><strong>Coalition</strong><p>${esc(coalition.name)}</p><p><em>Joint action.</em> ${segmentsHTML(coalition.joint_action_segments, counter)}</p><p><em>Formation condition.</em> ${segmentsHTML(coalition.formation_condition_segments, counter)}</p><p><em>Fracture condition.</em> ${segmentsHTML(coalition.fracture_condition_segments, counter)}</p></div>`).join('');
        return chips + sources + sections + blocs;
      }
      const rels = row.relationship_ids.map(id => lens.relationships_by_id[id]);
      const control = rels.filter(rel => CONTROL_TYPES.has(rel.type));
      const other = rels.filter(rel => !CONTROL_TYPES.has(rel.type));
      const coalitions = row.coalition_ids.map(id => lens.coalitions_by_id[id]);
      return `<p class="actor-chips"><span>${esc(row.type)}</span><span>Position: ${esc(row.position)}</span><span>Salience: ${esc(row.salience)}</span><span>Confidence: ${esc(row.confidence)}</span></p>
        <div class="actor-stakeholder-block"><strong>Power sources</strong><p>${row.power_sources.map(esc).join('; ')}</p></div>
        <div class="actor-stakeholder-block"><strong>Power mechanism</strong><p>${segmentsHTML(row.power_mechanism_segments, counter)}</p></div>
        <div class="actor-stakeholder-block"><strong>Trajectory</strong><p class="actor-chips"><span>Direction: ${esc(row.trajectory.direction)}</span></p><p>${segmentsHTML(row.trajectory.timescale_segments, counter)}</p><p>${segmentsHTML(row.trajectory.mechanism_segments, counter)}</p></div>
        ${control.length ? `<div class="actor-stakeholder-block"><strong>What it controls and depends on</strong>${control.map(rel => lensRelationshipHTML(rel, lensId, counter)).join('')}</div>` : ''}
        ${other.length ? `<div class="actor-stakeholder-block"><strong>Relationships</strong>${other.map(rel => lensRelationshipHTML(rel, lensId, counter)).join('')}</div>` : ''}
        ${coalitions.map(coalition => `<div class="actor-stakeholder-block"><strong>Coalition</strong><p>${esc(coalition.name)}</p><p><em>Joint action.</em> ${segmentsHTML(coalition.joint_action_segments, counter)}</p><p><em>Formation condition.</em> ${segmentsHTML(coalition.formation_condition_segments, counter)}</p><p><em>Fracture condition.</em> ${segmentsHTML(coalition.fracture_condition_segments, counter)}</p></div>`).join('')}`;
    }

    function stakeholderHTML(ids, counter, note) {
      if (!lens || !ids || !ids.length) return '';
      return ids.map(lensId => `<section class="actor-section actor-stakeholder" data-lens-drawer-host="true" data-lens-actor="${esc(lensId)}"><h3>Stakeholder reading</h3>${note ? `<p class="actor-group-reading">${esc(note)}</p>` : ''}<h4>${esc(lensName(lensId))}</h4>${stakeholderBodyHTML(lensId, counter)}<div class="actor-lens-drawer" hidden></div></section>`).join('');
    }

    function memberLinksHTML(ids) {
      if (!lens || !ids || !ids.length) return '';
      return ids.map(lensId => {
        const target = lensActors[lensId].targets[0];
        const attr = target.kind === 'class' ? 'data-class' : 'data-actor';
        return `<p class="actor-member-link">Covered by stakeholder reading: <button type="button" ${attr}="${esc(target.id)}">${esc(lensName(lensId))}</button></p>`;
      }).join('');
    }

    function lensLimitsHTML(counter) {
      if (!lens) return '';
      return `<p class="note">Stakeholder reading disposition: ${esc(lens.disposition)}</p>${lens.limitations_segments.map(segments => `<p class="note">${segmentsHTML(segments, counter)}</p>`).join('')}`;
    }

    function drawerHTML(refs) {
      return refs.map(ref => {
        const row = lens.evidence_by_id[ref];
        if (!row) return '';
        return `<article class="actor-source-row"><h4>${esc(row.title)}</h4>${bylineHTML(row)}<blockquote>“${esc(row.passage)}”</blockquote>${sourceLinks(row)}</article>`;
      }).join('');
    }

    function currentView() {
      const key = level === 'L1_class' ? 'L1_class|count' : `${level}|${sizeBy}`;
      return projection.overview.current_views[key];
    }

    function overviewHTML() {
      const overview = projection.overview;
      const view = currentView();
      const counter = {n: 0};
      return `<article class="actor-editorial actor-editorial-overview">
        <p class="actor-badge">${esc(overview.badge)}</p>
        <h2>${esc(overview.headline)}</h2>
        <p class="actor-summary">${esc(overview.summary)}</p>
        <section class="actor-current-view" aria-live="polite"><strong>${esc(view.title)}</strong><p>${esc(view.text)}</p></section>
        <section aria-labelledby="actor-key-title"><h3 id="actor-key-title">How to decode the map</h3><div class="actor-key">${overview.key.map(row => `<div><strong>${esc(row.label)}</strong>${esc(row.text)}</div>`).join('')}</div></section>
        <section class="actor-shape" aria-labelledby="actor-shape-title"><h3 id="actor-shape-title">What the shape says</h3>
          ${overview.findings.map(row => `<article class="actor-finding"><span class="actor-finding-number">${esc(row.number)}</span><div><h4>${esc(row.title)}</h4><p>${esc(row.text)}</p>${referenceLinks(row)}<details class="actor-card-proof"><summary>Evidence and measures</summary>${proofLinks(row.evidence_refs)}${row.metric_refs?.length ? `<div class="actor-measure-grid">${metricRows(row.metric_refs)}</div>` : ''}</details></div></article>`).join('')}
        </section>
        ${overview.stakeholder_rail && lens ? `<section class="actor-shape actor-rail" aria-labelledby="actor-rail-title"><h3 id="actor-rail-title">${esc(overview.stakeholder_rail.heading)}</h3>${overview.stakeholder_rail.lens_actor_ids.map(lensId => `<details class="actor-accordion actor-rail-entry" data-lens-drawer-host="true" data-lens-actor="${esc(lensId)}"><summary>${esc(lensName(lensId))}</summary>${stakeholderBodyHTML(lensId, {n: 0})}<div class="actor-lens-drawer" hidden></div></details>`).join('')}</section>` : ''}
        <details class="actor-accordion"><summary>What this shows</summary><p>${esc(overview.what_this_shows)}</p></details>
        <details class="actor-accordion"><summary>How to read</summary><p>${esc(overview.how_to_read)}</p></details>
        <details class="actor-accordion"><summary>Verification</summary><p>${esc(overview.verification)}</p><p class="actor-proof">Network ${esc(projection.source_contract.network_sha256)}<br>Enrichment ${esc(projection.source_contract.enrichment_sha256)}<br>Frozen layout ${esc(projection.source_contract.layout_sha256)}</p></details>
        <details class="actor-accordion actor-source-register"><summary>Original corpus source register · ${number(projection.counts.source_records)} cited records</summary><div class="actor-source-register-search"><label for="actor-source-query">Find a cited source</label><input id="actor-source-query" type="search" autocomplete="off" value="${esc(sourceFilter)}" placeholder="Search source titles or IDs"><p>This register covers the original corpus profiles. Additional sources are linked in each actor briefing and relationship reading.</p></div><div class="actor-source-register-results"></div></details>
        <details class="actor-accordion"><summary>What it is built from</summary><p>${esc(overview.built_from)}</p><div class="actor-measure-grid">${metricRows(overview.network_metric_refs)}</div></details>
        <details class="actor-accordion" data-lens-drawer-host="true"><summary>Limits</summary>${overview.limitations.map(text => `<p>${esc(text)}</p>`).join('')}${lensLimitsHTML(counter)}<div class="actor-lens-drawer" hidden></div></details>
      </article>`;
    }

    function excerpt(text) {
      const words = String(text || '').replace(/\s+/g, ' ').trim().split(' ');
      return words.slice(0, 24).join(' ') + (words.length > 24 ? '…' : '');
    }

    function evidenceHTML(refs) {
      const bySource = new Map();
      (refs || []).forEach(id => {
        const row = evidence.get(id);
        if (row && !bySource.has(row.document_id)) bySource.set(row.document_id, row);
      });
      if (!bySource.size) return '<p class="actor-unknown">No passage-grounded evidence is attached to this actor profile.</p>';
      return [...bySource.values()].map(row => {
        const source = sources[row.document_id];
        return `<article class="actor-source-row"><h4>${esc(row.title)}</h4>${bylineHTML(source)}<blockquote>“${esc(excerpt(row.passage))}”</blockquote>${sourceLinks(source)}</article>`;
      }).join('');
    }

    function actorHTML(id) {
      const actor = actors[id];
      if (!actor && projection.actor_depth?.curated_entities_by_id?.[id]) return '';
      const node = actorMap.get(id);
      const associationRows = actor.association_ids.slice(0, 12).map(ident => associations[ident]);
      const relationshipRows = actor.relationship_ids.map(ident => relationships[ident]);
      const sections = actor.sections || [];
      const counter = {n: 0};
      const why = actor.why_this_actor_matters;
      const roleLine = actor.description && actor.description !== actor.disclosure ? `<p class="actor-role-description">${esc(actor.description)}</p>` : '';
      const whyText = why.moved_to_limitations ? '' : `<p>${esc(why.text)}</p>`;
      const profile = sections.length ? `<details class="actor-accordion"><summary>Read the passage-grounded profile</summary>${sections.map(section => `<article class="actor-profile-section"><h4>${esc(section.heading)}</h4><p>${esc(section.text)}</p><small>${esc(section.basis || 'Basis recorded in the accepted profile')} · ${(section.evidence_refs || []).length} cited passage${(section.evidence_refs || []).length === 1 ? '' : 's'}</small></article>`).join('')}</details>` : '';
      const mapped = (actor.stakeholder_reading_ids || []).length > 0;
      return `<article class="actor-editorial actor-detail" data-editorial-actor="${esc(id)}">
        <p class="actor-badge">Actor briefing · evidence-bound</p><h2>${esc(actor.title)}</h2>
        ${actor.disclosure ? `<p class="actor-disclosure">${esc(actor.disclosure)}</p>` : ''}
        ${stakeholderHTML(actor.stakeholder_reading_ids, counter, actor.stakeholder_reading_note)}
        ${memberLinksHTML(actor.stakeholder_member_of)}
        ${roleLine || whyText || profile ? `<section class="actor-section"><h3>Why this actor matters</h3>${roleLine}${whyText}${profile}</section>` : ''}
        <section class="actor-section"><h3>How visible it is in this corpus</h3><div class="actor-measure-grid"><div class="row"><span>Documents</span><span>${number(actor.visibility.documents)}</span></div><div class="row"><span>Text windows</span><span>${number(actor.visibility.windows)}</span></div><div class="row"><span>Share of actor windows</span><span>${actor.visibility.window_share == null ? '—' : decimal(actor.visibility.window_share * 100, 2) + '%'}</span></div><div class="row"><span>Assigned category</span><span><button type="button" class="text-link" data-class="${esc(actor.visibility.class_id)}">${esc(classes[actor.visibility.class_id].title)}</button></span></div></div>${actor.visibility.community_id ? `<p><button type="button" class="text-link" data-community="${esc(actor.visibility.community_id)}">${esc(communities[actor.visibility.community_id].title)}</button></p>` : ''}</section>
        <section class="actor-section"><h3>Interpreted relationships</h3>${relationshipRows.length ? relationshipRows.map(row => { const other = row.source === id ? row.target : row.source; return `<article class="actor-relationship"><div class="actor-relationship-head"><button type="button" data-actor="${esc(other)}">${esc(row.source)} → ${esc(row.target)}</button><span>${esc(row.type)}</span></div><p>${esc(row.summary)}</p><p>Basis: ${row.inference ? 'analyst inference from cited passages' : 'relationship reported in cited passages'} · Confidence: not separately rated in the current record.</p><details class="actor-card-proof"><summary>Evidence and sources</summary>${proofLinks(row.evidence_refs)}</details></article>`; }).join('') : '<p class="actor-unknown">No passage-grounded interpreted relationship is supplied for this actor. Its measured associations remain co-mention records only.</p>'}</section>
        <section class="actor-section"><h3>Evidence and sources</h3>${evidenceHTML(actor.evidence_refs)}</section>
        <details class="actor-accordion actor-measured"><summary>Measured position</summary><p>Measured co-mention pattern. This is not a relationship claim.</p><h4>Major associations</h4>${associationRows.length ? associationRows.map(row => { const other = row.source === id ? row.target : row.source; return `<article class="actor-association"><div class="actor-association-head"><button type="button" data-actor="${esc(other)}">${esc(other)}</button><span>NPMI ${decimal(row.npmi, 2)} · ${number(row.support)} windows / ${number(row.docSupport)} documents</span></div><button type="button" class="actor-measured-open" data-measured-association="${esc(row.id)}">Open measured record</button></article>`; }).join('') : '<p class="actor-unknown">No association clears the retained backbone threshold for this actor.</p>'}<p class="note">Showing ${associationRows.length} of ${actor.association_ids.length} complete backbone associations, strongest measured lift first.</p><h4>Verification</h4><div class="actor-measure-grid"><div class="row"><span>Backbone degree</span><span>${number(node.degree)}</span></div><div class="row"><span>Drawn ties</span><span>${number(DATA.levels.L2_entity.edges.filter(row => row.drawable && (row.source === id || row.target === id)).length)}</span></div><div class="row"><span>Betweenness</span><span>${decimal(node.betweenness, 4)}</span></div><div class="row"><span>Eigenvector</span><span>${node.eigenvector == null ? 'Unavailable' : decimal(node.eigenvector, 4)}</span></div></div></details>
        <details class="actor-accordion" data-lens-drawer-host="true"><summary>Limits</summary>${actor.limitations.map(text => `<p class="note">${esc(text)}</p>`).join('')}${mapped ? lensLimitsHTML(counter) : ''}<p class="note">Visibility measures the captured corpus. It is not a power, importance or market-share score.</p><p class="note">Degree, betweenness, eigenvector and community membership describe position in the complete co-mention backbone, including affiliation associations not drawn as lines. They do not establish real-world power or influence.</p><div class="actor-lens-drawer" hidden></div></details>
      </article>`;
    }

    function groupedHTML(kind, id) {
      const row = kind === 'class' ? classes[id] : communities[id];
      const community = kind === 'community';
      const measure = row.measurements || {};
      const refs = [...new Set((row.sections || []).flatMap(section => section.evidence_refs || []))];
      const counter = {n: 0};
      return `<article class="actor-editorial actor-group-detail"><p class="actor-badge">${community ? 'Statistical community' : 'Assigned actor category'}</p><h2>${esc(row.title)}</h2>${row.disclosure ? `<p class="actor-disclosure">${esc(row.disclosure)}</p>` : ''}<p class="actor-summary">${esc(row.headline || row.summary)}</p>${stakeholderHTML(row.stakeholder_reading_ids, counter)}<section class="actor-section"><h3>What this grouping shows</h3><p>${esc(row.summary)}</p></section><section class="actor-section"><h3>Actors in this grouping</h3><div class="actor-reference-list">${row.actor_ids.map(actorId => `<button type="button" data-actor="${esc(actorId)}">${esc(actorId)}</button>`).join('')}</div></section>${row.sections?.length ? `<details class="actor-accordion"><summary>Passage-grounded reading</summary>${row.sections.map(section => `<article class="actor-profile-section"><h4>${esc(section.heading)}</h4><p>${esc(section.text)}</p><small>${esc(section.basis || 'Basis recorded in the accepted profile')}</small></article>`).join('')}</details>` : ''}<section class="actor-section"><h3>Evidence and sources</h3>${evidenceHTML(refs)}</section><details class="actor-accordion actor-measured"><summary>Measured position</summary>${community ? `<div class="actor-measure-grid"><div class="row"><span>Members</span><span>${number(row.actor_ids.length)}</span></div></div>` : `<div class="actor-measure-grid"><div class="row"><span>Actors</span><span>${number(measure.actors)}</span></div><div class="row"><span>Windows</span><span>${number(measure.windows)}</span></div><div class="row"><span>Within-category ties</span><span>${number(measure.withinEdges)}</span></div><div class="row"><span>Within-category density</span><span>${decimal(measure.withinDensity, 4)}</span></div></div>`}<p class="note">These values describe the captured corpus and calculated graph.</p>${(row.limitations || []).map(text => `<p class="note">${esc(text)}</p>`).join('')}${(row.stakeholder_reading_ids || []).length ? `<div data-lens-drawer-host="true">${lensLimitsHTML(counter)}<div class="actor-lens-drawer" hidden></div></div>` : ''}</details></article>`;
    }

    function renderSourceRegister() {
      const host = panel.querySelector('.actor-source-register-results');
      if (!host) return;
      const term = sourceFilter.trim().toLocaleLowerCase();
      const filtered = term ? sourceRows.filter(row => `${row.title} ${row.id}`.toLocaleLowerCase().includes(term)) : sourceRows;
      host.innerHTML = filtered.slice(0, 60).map(row => `<article class="actor-source-row"><p>${esc(row.title)}</p>${bylineHTML(row)}${sourceLinks(row)}</article>`).join('') + (filtered.length > 60 ? `<p class="note">Showing 60 of ${number(filtered.length)} matches. Refine the search to narrow the register.</p>` : '');
    }

    function editorialShowPanel() {
      document.getElementById('search').value = '';
      if (selected.kind === 'overview') panel.innerHTML = overviewHTML();
      else if (selected.kind === 'actor') panel.innerHTML = actorHTML(selected.id);
      else if (selected.kind === 'class' || selected.kind === 'community') panel.innerHTML = groupedHTML(selected.kind, selected.id);
      else if (depthView?.hasSelection(selected.kind, selected.id)) panel.innerHTML = depthView.selectionHTML(selected.kind, selected.id);
      else return false;
      document.getElementById('back').disabled = cursor === 0;
      document.getElementById('forward').disabled = cursor === history.length - 1;
      highlight();
      depthView?.decorate(panel, selected);
      return true;
    }

    panel.addEventListener('click', event => {
      const cite = event.target.closest('[data-lens-cite]');
      if (cite && lens) {
        event.preventDefault();
        const host = cite.closest('[data-lens-drawer-host]');
        const drawer = host && [...host.querySelectorAll('.actor-lens-drawer')].pop();
        if (!drawer) return;
        const key = cite.dataset.lensCite;
        const reopen = drawer.hidden || drawer.dataset.cite !== key;
        host.querySelectorAll('[data-lens-cite][aria-expanded="true"]').forEach(button => button.setAttribute('aria-expanded', 'false'));
        if (reopen) {
          drawer.innerHTML = drawerHTML(key.split(' '));
          drawer.dataset.cite = key;
          drawer.hidden = false;
          cite.setAttribute('aria-expanded', 'true');
        } else {
          drawer.hidden = true;
          drawer.dataset.cite = '';
        }
        return;
      }
      const measured = event.target.closest('[data-measured-association]');
      if (measured) {
        event.preventDefault();
        DFNetworkDetails.open(measured.dataset.measuredAssociation);
      }
    });
    panel.addEventListener('toggle', event => {
      if (event.target.matches('.actor-source-register') && event.target.open) renderSourceRegister();
    }, true);
    panel.addEventListener('input', event => {
      if (event.target.id !== 'actor-source-query') return;
      sourceFilter = event.target.value;
      renderSourceRegister();
    });

    showPanel = editorialShowPanel;
    editorialShowPanel();
    document.documentElement.dataset.actorEditorialReady = 'true';
    window.DFActorEditorial = {projection, render: editorialShowPanel, selectActor: id => open('actor', id), curatedActors: Object.keys(projection.actor_depth?.curated_entities_by_id || {}).map(id => ({id,label:id,curated:true})), depthHas: depthView?.hasSelection, getCoverage: depthView?.getMode, setCoverage: depthView?.setMode, getRepresentation:depthView?.getRepresentation, setRepresentation:depthView?.setRepresentation};
  }

  function start() {
    Promise.all([PROJECTION_URL, WHOLE_MAP_URL, GROUPS_URL].map(url => fetch(url).then(response => {
      if (!response.ok) throw new Error(`Actor reading failed to load: ${response.status} ${url.pathname}`);
      return response.json();
    }))).then(([projection, wholeMap, displayGroups]) => setup({...projection, whole_map: wholeMap, display_groups:displayGroups})).catch(error => {
      console.error(error);
      document.documentElement.dataset.actorEditorialError = 'true';
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, {once:true});
  else start();
})();
