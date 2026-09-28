(function () {
  'use strict';
  const esc = value => String(value == null ? '' : value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  window.DFActorDepth = {create};

  function create(projection, callbacks) {
    const depth = projection.actor_depth;
    if (!depth) return null;
    const entities = depth.entities_by_id, groups = depth.groups_by_id, relations = depth.relationships_by_id;
    const entityIds = Object.keys(entities), groupIds = Object.keys(groups);
    const curated = depth.curated_entities_by_id || {}, contextEntities = depth.context_entities_by_id || {}, contextRelations = depth.context_relationships_by_id || {};
    const categories = depth.categories_by_id || {};
    const categoryIds = Object.keys(categories);
    const evidence = depth.evidence_by_id;
    const wholeMap = projection.whole_map;
    const taxonomy = projection.display_groups;
    let mode = 'whole';
    let representation = 'actors';
    const name = endpoint => endpoint.kind === 'group' ? groups[endpoint.id].name : endpoint.id;
    const same = (endpoint, kind, id) => endpoint.kind === kind && endpoint.id === id;
    const related = (kind, id) => Object.values(contextEntities[id] ? contextRelations : relations).filter(r => same(r.source, kind, id) || same(r.target, kind, id));
    const strategicMap = window.DFStrategicMap.create({projection, depth, layout:window.DFActorLayout, root: callbacks.graphRoot,
      metricsById: callbacks.metricsById,
      onActor: callbacks.actor, onGroup: id => {setMode('core'); callbacks.group(id);},
      onRelationship: id => {setMode('core'); callbacks.relationship(id);}});
    const groupMap = window.DFActorGroups.create({projection,taxonomy,layout:window.DFActorLayout,root:callbacks.graphRoot,
      onGroup:callbacks.displayGroup,onRelationship:callbacks.groupRelationship});
    const wholeStageNote = () => {
      const state = callbacks.state();
      return state.level === 'L1_class'
        ? '14 actor categories · size = actor count · measured cross-category associations · layout for readability, not distance.'
        : representation==='groups' ? `${Object.keys(taxonomy.groups_by_id).length} actor groups · coloured diamonds · straight lines count cross-group actor-pair associations` : `${projection.counts.actors} retained measured actors + ${Object.keys(curated).length} curated actors · straight co-mention lines · scroll for controls; drag to pan; Ctrl/⌘ + scroll to zoom.`;
    };
    function setMode(value) {mode = value === 'core' ? 'core' : 'whole'; if(mode==='core')representation='actors'; document.body.dataset.depthMode = mode;}
    function setRepresentation(value){representation=value==='groups'?'groups':'actors';}
    function hasSelection(kind, id) {return kind==='map-group' ? !!groupMap.groups[id] : kind==='map-group-relationship' ? !!groupMap.relationships[id] : kind === 'actor' ? !!curated[id] : kind === 'strategic-relationship' ? !!relations[id] : kind === 'strategic-group' && !!groups[id];}
    function selectionHTML(kind, id) {
      if(kind==='map-group')return displayGroupHTML(id);
      if(kind==='map-group-relationship')return groupRelationshipHTML(id);
      const html = kind === 'strategic-relationship' ? relationHTML(relations[id]) : groupHTML(id);
      return '<article class="depth-reading"><p class="depth-kicker">Strategic core · '+(kind === 'strategic-relationship' ? 'relationship' : 'actor group')+'</p>'+html.replace('<details ', '<details open ')+'</article>';
    }
    const scopeNote = 'The core marks the current focus of detailed analysis. Actors outside it may still be consequential. A group reading describes the group; it does not establish the same behaviour for every member.';
    const style = document.createElement('style');
    style.textContent = `
      .depth-intro,.depth-reading{border-top:2px solid var(--df-lens-primary);padding:16px 0;margin:12px 0 20px}
      .depth-intro h3,.depth-reading h3{font-size:16px!important;line-height:1.35;margin:0 0 9px!important}
      .depth-intro p,.depth-reading p{font-size:13px!important;line-height:1.6;margin:0 0 12px!important}
      .depth-kicker{font:600 10px/1.5 var(--df-font-mono)!important;letter-spacing:.08em;text-transform:uppercase;color:var(--df-lens-primary)}
      .depth-nav,.depth-list{display:flex;flex-wrap:wrap;gap:7px 12px;margin:10px 0 14px}
      .depth-nav button,.depth-list button,.depth-endpoint{border:0;border-bottom:1px solid var(--df-border);background:transparent;font:inherit;font-size:12px;color:var(--df-primary);padding:3px 0;text-align:left;cursor:pointer}
      .depth-nav button[aria-pressed=true]{font-weight:700;border-color:var(--df-primary)}
      .depth-scope{color:var(--df-ink-muted);font-size:12px!important;line-height:1.5}
      .depth-detail{border-top:1px solid var(--df-border);padding:10px 0}
      .depth-detail>summary{font-size:13px;font-weight:650;line-height:1.45;cursor:pointer}
      .depth-section{padding-top:13px}.depth-section h4{font-size:13px;margin:0 0 6px}
      .depth-detail .depth-section p{font-size:12.5px!important}
      .depth-cite{border:0;background:transparent;color:var(--df-primary);font:600 10px var(--df-font-mono);vertical-align:super;cursor:pointer;padding:0 3px}
      .depth-source{margin:10px 0;padding:10px 0;border-top:1px solid var(--df-border)}
      .depth-source blockquote{font-size:12px;line-height:1.5;margin:8px 0;padding-left:12px;border-left:2px solid var(--df-border)}
      .depth-filter{display:block;font-size:12px;margin:12px 0}
      .depth-filter input{display:block;width:100%;box-sizing:border-box;margin:6px 0;padding:8px;border:1px solid var(--df-border);background:var(--df-surface);color:var(--df-ink);font:inherit}
      .depth-list [hidden],.depth-relation-index>[hidden]{display:none!important}
      .depth-category-links{margin:14px 0}
      .depth-coverage-controls{flex:1 0 100%;display:flex;gap:8px;flex-wrap:wrap;align-items:center}
      .depth-coverage-note{flex:1 0 100%;margin:0;font-size:12px;line-height:1.5;color:var(--df-ink-muted)}
      body[data-depth-mode=core] #net > g > g:not(.depth-strategic-network){display:none}
      body[data-map-representation=groups] #net > g > g:not(.actor-group-network){display:none!important}
      .display-group-legend{flex:1 0 100%;font-size:12px;margin:5px 0}
      .display-group-legend summary{cursor:pointer}
      .display-group-legend .depth-list{gap:9px 15px}
      .display-group-swatch{display:inline-block;width:9px;height:9px;transform:rotate(45deg);margin:0 7px 0 2px;background:var(--group-colour);vertical-align:middle}
      @media(max-width:700px){.depth-nav,.depth-list{gap:8px 12px}}
    `;
    document.head.appendChild(style);

    function segmentsHTML(segments) {
      return (segments || []).map(s => s.cite ? `<button class="depth-cite" data-depth-cite="${esc(s.cite.join(' '))}" aria-label="Read supporting evidence" aria-expanded="false">[${s.cite.length === 1 ? 'source' : 'sources'}]</button>` : esc(s.text)).join('');
    }
    function sectionsHTML(sections) {
      return (sections || []).map(s => `<section class="depth-section"><h4>${esc(s.heading)}</h4><p>${segmentsHTML(s.segments)}</p></section>`).join('');
    }
    function entityButton(id) { return `<button type="button" data-actor="${esc(id)}">${esc(id)}</button>`; }
    function measuredListHTML(ids){return ids.map(id=>{const a=projection.associations_by_id[id];return `<article class="actor-association"><button class="depth-endpoint" data-measured-association="${esc(id)}">${esc(a.source)} ↔ ${esc(a.target)}</button><p class="depth-scope">${a.support} windows · ${a.docSupport} documents · open the measured record and its sources</p></article>`;}).join('');}
    function displayGroupHTML(id){
      const g=groupMap.groups[id];
      return `<article class="depth-reading" data-display-group="${esc(id)}"><p class="depth-kicker">Whole map · actor group</p><h2><span class="display-group-swatch" style="--group-colour:var(--c${g.color_index})"></span>${esc(g.label)}</h2><p>${esc(g.description)}</p><p class="depth-scope">Primary roles organise this display; they are not claims of formal membership or common behaviour. One colour family can contain related groups with distinct labels.</p><h3>Named actors · ${g.actor_ids.length}</h3>${g.actor_ids.length?`<div class="depth-list">${g.actor_ids.map(entityButton).join('')}</div>`:'<p>This collective group has no named representative in the retained map. Its importance is not measured by a zero member count.</p>'}${groups[id]?`<h3>Strategic group reading</h3>${groupHTML(id)}`:''}${g.internal_association_ids?.length?`<details class="depth-detail"><summary>Within-group measured associations · ${g.internal_association_ids.length}</summary>${measuredListHTML(g.internal_association_ids)}</details>`:''}</article>`;
    }
    function groupRelationshipHTML(id){
      const r=groupMap.relationships[id];
      return `<article class="depth-reading" data-group-relationship="${esc(id)}"><p class="depth-kicker">Whole map · grouped co-mentions</p><h2>${esc(groupMap.groups[r.source].label)} ↔ ${esc(groupMap.groups[r.target].label)}</h2><p>${r.association_ids.length} retained actor-pair association${r.association_ids.length===1?' connects':'s connect'} these primary groups.</p><p class="depth-scope">This count combines actor pairs, not unique documents or text windows. It is not an analysed relationship between the groups. Open an actor-pair record below for its measurements and sources.</p>${measuredListHTML(r.association_ids)}</article>`;
    }
    function endpointHTML(endpoint) {
      return endpoint.kind === 'entity' ? `<button class="depth-endpoint" data-actor="${esc(endpoint.id)}">${esc(name(endpoint))}</button>` : `<button class="depth-endpoint" data-depth-group-target="${esc(endpoint.id)}">${esc(name(endpoint))} · group</button>`;
    }
    function relationHTML(r) {
      return `<details class="depth-detail" data-depth-relationship="${esc(r.id)}"><summary>${esc(name(r.source))} → ${esc(name(r.target))} · ${esc(r.type.replace(/_/g, ' '))}</summary><p class="depth-scope">${r.basis_kind === 'inference' ? 'Analytical inference from cited evidence' : 'Relationship supported by cited passages'} · confidence: ${esc(r.confidence)}. ${r.source.kind === 'group' || r.target.kind === 'group' ? 'This relationship concerns a group; it is not assigned to every member.' : 'This reading concerns the named actors.'}</p>${r.direction_note ? `<p class="depth-scope">${esc(r.direction_note)}</p>` : ""}<div class="depth-nav">${endpointHTML(r.source)} → ${endpointHTML(r.target)}</div>${sectionsHTML(r.sections)}<div class="depth-evidence-drawer" hidden></div></details>`;
    }
    function groupHTML(id) {
      const g = groups[id];
      return `<details class="depth-detail" data-depth-group="${esc(id)}"><summary>${esc(g.name)}</summary><p class="depth-scope">Strategic core · group reading. Members can have different interests and behaviour.</p>${sectionsHTML(g.panel_sections || g.sections)}<h4>Relationships involving this group</h4>${related('group', id).map(relationHTML).join('')}<div class="depth-evidence-drawer" hidden></div></details>`;
    }
    function wholeSourcesHTML(sources) {
      return sources.map(source => `<article class="depth-source"><strong>${esc(source.title)}</strong>${source.note ? `<p class="depth-scope">${esc(source.note)}</p>` : ''}<div class="actor-source-links">${source.record_href ? `<a href="${esc(source.record_href)}" data-reading-record="true">Read saved corpus record</a>` : ''}${source.url ? `<a href="${esc(source.url)}" target="_blank" rel="noopener noreferrer">Original publication</a>` : ''}</div></article>`).join('');
    }
    function wholeActorHTML(id) {
      const row = wholeMap?.actors_by_id[id];
      if (!row) return '';
      return `<article class="depth-reading" data-whole-actor="${esc(id)}"><p class="depth-kicker">Whole map · concise actor briefing</p><h2>${esc(id)}</h2><p>${esc(row.identity)}</p><h3>Why it matters here</h3><p>${esc(row.relevance)}</p><p class="depth-scope">Strategic relevance is analysis informed by the sources below. It does not assert a relationship with every connected actor.</p>${row.scope ? `<p class="depth-scope">${esc(row.scope)}</p>` : ''}<h3>Sources and context</h3>${wholeSourcesHTML(row.sources)}</article>`;
    }
    function researchContextHTML() {
      const row = wholeMap?.research_context;
      if (!row) return '';
      return `<section class="depth-section" data-research-context="true"><h3>${esc(row.title)}</h3><p>${esc(row.description)}</p><p class="depth-scope">${esc(row.scope)}</p><div class="depth-list">${row.actor_ids.map(entityButton).join('')}</div><details class="depth-detail"><summary>Research examples and sources</summary>${wholeSourcesHTML(row.sources)}</details></section>`;
    }
    function introHTML() {
      return `<section class="depth-intro"><p class="depth-kicker">Two levels of coverage</p><h3>Whole map and strategic core</h3><p><strong>Whole map:</strong> ${projection.counts.actors} retained actors and ${projection.counts.associations.toLocaleString()} measured associations (${projection.counts.drawn_associations} drawn). Named circles and straight lines show which actors are named together in this corpus. Choose Actor groups to see matching coloured diamonds and grouped co-mentions. Every actor has a readable briefing and sources; every measured line links to the documents behind its count.</p><p><strong>Strategic core:</strong> the selected set develops ${entityIds.length} named actors, ${groupIds.length} actor groups and ${Object.keys(relations).length} relationship readings.${categoryIds.length ? ` All ${categoryIds.length} actor categories also have substantive overviews, explaining shared interests and internal differences.` : ''}</p><p class="depth-scope">${scopeNote}</p>${Object.keys(curated).length ? `<p class="depth-scope">${Object.keys(curated).length} named actors are explicit curated additions outside the original extraction: ${Object.keys(curated).map(esc).join(", ")}. Their outlined circles have a fixed size, with no measured prominence implied. They appear as named circles in both coverage views. Group diamonds appear in the core and in the whole-map Actor groups view. The measured inventory stays ${projection.counts.actors}.</p>` : ""}<div class="depth-nav"><button data-depth-mode="whole" aria-pressed="${mode === 'whole'}">Whole map</button><button data-depth-mode="core" aria-pressed="${mode === 'core'}">Strategic core</button></div><p class="depth-scope">${mode === 'core' ? 'The core retains selected actor positions and zoom, replacing measured co-mentions with analysed relationships and group diamonds. Select an analysed relationship to read its mechanism and evidence. Circles are named actors; diamonds are groups. Solid lines are passage-supported; dashed lines are analytical inferences. Arrows follow the specific mechanism, not an overall ranking of influence.' : 'Choose Strategic core for selected actors, group diamonds and analysed relationships without moving the actors. The core actors are a subset; its relationships are a separate analytical layer.'}</p><details class="depth-detail"><summary>Why these actors?</summary><p>${esc(depth.expansion_selection_rationale || depth.selection_rationale || 'Selected to examine control of platforms, legal work and purchasing, alongside constraints from insurance and professional formation.')}</p><p>Coverage reflects the held corpus and the current research scope. Unassessed does not mean unimportant, and no observed tie does not prove no relationship.</p></details></section>`;
    }
    function categoryLinksHTML() {
      return categoryIds.length ? `<details class="depth-detail depth-category-links"><summary>Category overviews · ${categoryIds.length}</summary><div class="depth-list">${categoryIds.map(id => `<button type="button" data-class="${esc(id)}">${esc(categories[id].name)}</button>`).join('')}</div></details>` : '';
    }
    function catalogHTML() {
      return `<section class="depth-reading"><h3>Explore the strategic core</h3><p>Select a named actor for its own reading, or expand a group to read the shared dynamics. The core map includes every selected actor and group, including those outside the measured co-mention network.</p>${categoryLinksHTML()}<div class="depth-actor-index"><label class="depth-filter">Find a core actor<input type="search" data-depth-filter="actors" placeholder="Search ${entityIds.length} named actors" autocomplete="off"></label><p class="depth-scope depth-filter-count" aria-live="polite">${entityIds.length} named actors</p><div class="depth-list">${entityIds.map(entityButton).join('')}</div></div><details class="depth-detail"><summary>Actor-group readings · ${groupIds.length}</summary>${groupIds.map(groupHTML).join('')}</details><details class="depth-detail"><summary>Relationship readings · ${Object.keys(relations).length}</summary><label class="depth-filter">Find a connection<input type="search" data-depth-filter="relationships" placeholder="Actor, group or relationship type" autocomplete="off"></label><p class="depth-scope depth-filter-count" aria-live="polite">${Object.keys(relations).length} relationship readings</p><div class="depth-relation-index">${Object.values(relations).map(relationHTML).join('')}</div></details></section>`;
    }
    function categoryHTML(id) {
      const row = categories[id];
      return `<article class="depth-reading" data-depth-category="${esc(id)}"><p class="depth-kicker">Category overview · strategic context</p><h2>${esc(row.name)}</h2><p class="depth-scope">This reading explains the category. Individual members can have different interests, capabilities and behaviour.</p>${sectionsHTML(row.sections)}<h3>Named actors in the strategic core</h3><div class="depth-list">${(row.core_entity_ids || []).map(entityButton).join('')}</div>${(row.related_group_ids || []).length ? '<h3>Related actor-group readings</h3>'+row.related_group_ids.map(groupHTML).join('') : ''}<div class="depth-evidence-drawer" hidden></div></article>`;
    }
    function coreActorHTML(id) {
      const row = entities[id] || contextEntities[id];
      return `<article class="depth-reading" data-depth-actor="${esc(id)}"><p class="depth-kicker">${contextEntities[id] ? "Whole map · additional individual reading" : "Strategic core · named actor"}</p><h2>${esc(id)}</h2><p class="depth-scope">An actor-specific reading drawing on the held corpus and cited research. Group context is shown separately.</p>${curated[id] ? `<p class="depth-scope"><strong>Curated addition.</strong> ${esc(curated[id].category_label)}. This actor sits outside the original 268-name extraction; no measured corpus prominence is assigned. ${esc(curated[id].selection_rationale)}</p>` : ""}${contextEntities[id] ? `<p class="depth-scope">The strategic core now represents this project through Harvard Law School. This individual reading and its attributed connections are preserved here; personal claims have not been transferred to the institution.</p>` : ""}${sectionsHTML(row.sections || row.panel_sections)}<h3>Relationships involving ${esc(id)}</h3>${related('entity', id).map(relationHTML).join('') || '<p>No relationship dossier is included for this actor yet.</p>'}<div class="depth-evidence-drawer" hidden></div></article>`;
    }
    function decorate(panel, selection) {
      if (callbacks.state().level !== 'L2_entity' || (selection.kind === 'actor' && !entities[selection.id])) setMode('whole');
      if (selection.kind.startsWith('strategic-')) setMode('core');
      panel.querySelectorAll('[data-lens-actor]').forEach(host => {
        const row = projection.stakeholder_lens.actors_by_id[host.dataset.lensActor];
        const scope = depth.lens_scope_by_id?.[host.dataset.lensActor];
        if (scope && scope.scope !== 'entity') {
          const p = document.createElement('p'); p.className = 'depth-scope';
          p.textContent = 'Group or role context: this reading concerns '+row.name+'. Its claims do not automatically apply to each named member.';
          host.prepend(p);
        }
      });
      if (selection.kind === 'overview') {
        const old = panel.firstElementChild;
        if (mode === 'core' && old) {
          const details = document.createElement('details'); details.className = 'depth-detail';
          const summary = document.createElement('summary'); summary.textContent = 'Whole-map overview and existing readings';
          details.append(summary, old); panel.append(details);
        }
        panel.insertAdjacentHTML('afterbegin', introHTML() + (mode === 'core' ? catalogHTML() : `<details class="depth-detail"><summary>Browse the strategic-core readings</summary>${catalogHTML()}</details>`));
      } else if (selection.kind === 'actor') {
        representation='actors';
        if (entities[selection.id] || contextEntities[selection.id]) {
          const old = panel.firstElementChild;
          const details = document.createElement('details'); details.className = 'depth-detail';
          const summary = document.createElement('summary'); summary.textContent = 'Existing corpus profile, measured position and wider context';
          if (old) {details.append(summary, old); panel.append(details);}
          panel.insertAdjacentHTML('afterbegin', coreActorHTML(selection.id));
          if (selection.id === 'Harvard Business School') panel.querySelector('[data-depth-actor]').insertAdjacentHTML('beforeend', researchContextHTML());
          if (contextEntities[selection.id] && wholeMap?.actors_by_id[selection.id]) details.insertAdjacentHTML('afterbegin', wholeActorHTML(selection.id));
        } else {
          if (wholeMap?.actors_by_id[selection.id]) {
            const old = panel.firstElementChild;
            const details = document.createElement('details'); details.className = 'depth-detail';
            const summary = document.createElement('summary'); summary.textContent = 'Measured connections, earlier profile and group context';
            if (old) {details.append(summary, old); panel.append(details);}
            panel.insertAdjacentHTML('afterbegin', wholeActorHTML(selection.id));
          }
          panel.insertAdjacentHTML('afterbegin', '<p class="depth-scope"><strong>Whole map · outside the current strategic core.</strong> A concise identity, strategic context and sources; the core adds deeper actor and relationship analysis. This is a coverage distinction, not an importance ranking.</p>');
        }
      } else if (selection.kind === 'class') {
        if (categories[selection.id]) {
          const old = panel.firstElementChild;
          const details = document.createElement('details'); details.className = 'depth-detail';
          const summary = document.createElement('summary'); summary.textContent = 'Existing category profile, measured position and members';
          details.append(summary, old); panel.append(details);
          panel.insertAdjacentHTML('afterbegin', categoryHTML(selection.id));
          if (selection.id === 'academy') panel.querySelector('[data-depth-category]').insertAdjacentHTML('beforeend', researchContextHTML());
        } else {
          const ids = (depth.category_group_ids?.[selection.id] || []).filter(id => groups[id]);
          panel.insertAdjacentHTML('afterbegin', `<section class="depth-intro"><p class="depth-kicker">Whole-map category${ids.length ? ' · strategic-core group reading available' : ''}</p><p>A display category groups retained names. Its members need not share interests or behaviour.</p>${ids.length ? ids.map(groupHTML).join('') : '<p class="depth-scope">A new category-wide core reading is not included in this initial set. Existing category analysis remains below.</p>'}</section>`);
        }
      }
      if(selection.kind==='actor'&&taxonomy.actor_group_by_id[selection.id]){
        const gid=taxonomy.actor_group_by_id[selection.id],g=taxonomy.groups_by_id[gid],other=taxonomy.additional_group_ids_by_actor?.[selection.id]||[];
        panel.insertAdjacentHTML('afterbegin',`<p class="depth-scope"><span class="display-group-swatch" style="--group-colour:var(--c${g.color_index})"></span>Primary display group: <button class="depth-endpoint" data-display-group-target="${esc(gid)}">${esc(g.label)}</button>${other.length?' · Other roles: '+other.map(key=>esc(taxonomy.groups_by_id[key].label)).join(', '):''}</p>`);
      }
      refreshMap();
    }
    function refreshMap() {
      if (callbacks.state().level !== 'L2_entity') {setMode('whole');representation='actors';}
      document.body.dataset.depthMode = mode;
      document.body.dataset.mapRepresentation=representation;
      const active = mode === 'core';
      strategicMap.refresh({active,representation, ...callbacks.state()});
      groupMap.refresh({visible:representation==='groups'&&callbacks.state().level==='L2_entity',selection:callbacks.state().selection});
      if(callbacks.state().level==='L2_entity')document.querySelectorAll('#net g.node[data-node-id] circle').forEach(circle=>{const id=circle.parentElement.dataset.nodeId,g=taxonomy.groups_by_id[taxonomy.actor_group_by_id[id]];if(g)circle.setAttribute('fill',`var(--c${g.color_index})`);});
      document.querySelector('[data-map-groups]')?.setAttribute('aria-pressed',String(representation==='groups'));
      document.querySelectorAll('[data-size]').forEach(button=>{button.disabled=representation==='groups';button.title=representation==='groups'?'Group diamonds have equal size; select a group to see its named actors.':button.dataset.help;});
      const originalCategories=callbacks.state().level==='L1_class';
      const colourText=document.querySelector('[aria-label="Colour: primary actor group"] span');if(colourText)colourText.textContent=originalCategories?'Original category':'Primary actor group';
      const groupLegend=document.querySelector('.display-group-legend');if(groupLegend)groupLegend.hidden=originalCategories;
      if(representation==='groups')document.querySelector('[data-level="L2_entity"]')?.setAttribute('aria-pressed','false');
      document.querySelectorAll('button[data-depth-mode]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.depthMode === mode)));
      const note = document.querySelector('.depth-coverage-note');
      if (note) note.textContent = active ? 'Circles: named actors · diamonds: groups · solid lines: passage-supported · dashed lines: inference. Select a line for its analysis and evidence. Arrows follow the stated mechanism; group ties do not apply to every member. Circle sizes use whole-map corpus measures; group diamonds have equal size.' + (Object.keys(curated).length ? ' Outlined circles are curated additions, with no measured size.' : '') : representation==='groups' ? 'Whole map · actor groups: coloured diamonds use the same group definitions and colours as the core. Straight lines count retained actor-pair associations, not unique documents. Empty constituencies have no invented measured ties.' : 'Whole map: named circles and straight measured co-mentions. Strategic core: selected circles, coloured group diamonds and curved analysed relationships. Actor positions and zoom stay fixed. Colours identify primary display groups; outlined circles are curated additions.';
      document.getElementById('stage-note').textContent = active ? `${entityIds.length} named actors · ${groupIds.length} groups · ${Object.keys(relations).length} selectable strategic relationships · drag to pan; Ctrl/⌘ + scroll to zoom. Positions are for readability.` : wholeStageNote();
      document.getElementById('net').setAttribute('aria-label', active ? 'Strategic core actors and selectable analysed relationships' : 'Measured subject actor network');
      const headerNote = document.querySelector('header > p:last-child');
      if (headerNote) headerNote.textContent = active ? 'Strategic core: select an actor, group or relationship to read the analysis and its evidence.' : representation==='groups' ? 'Actor groups: coloured diamonds and straight aggregated co-mention lines. Select a group or connection to inspect its named actors and source records.' : 'Named actors and measured co-mentions. Straight lines do not establish influence or agreement. Switch to the core for analysed relationships and group diamonds at shared positions.';
      callbacks.controls?.();
    }
    function decorateMeasured(id) {
      const a = projection.associations_by_id[id]; if (!a) return;
      const panel = document.getElementById('panel');
      panel.querySelector('.depth-measured-reading')?.remove();
      const matches = Object.values(relations).filter(r => r.source.kind === 'entity' && r.target.kind === 'entity' && [r.source.id,r.target.id].includes(a.source) && [r.source.id,r.target.id].includes(a.target));
      panel.insertAdjacentHTML('afterbegin', `<section class="depth-reading depth-measured-reading"><p class="depth-kicker">Whole map · measured association</p><h2>${esc(a.source)} ↔ ${esc(a.target)}</h2><p>${a.support} co-mention windows across ${a.docSupport} documents.</p><p>The line records co-mention. ${matches.length ? 'Separate strategic-core readings for this exact pair are available below.' : 'This pair has no new strategic-core relationship reading yet; the measured record remains below.'}</p>${matches.map(relationHTML).join('')}</section>`);
      const record = wholeMap?.associations_by_id[id];
      if (record) panel.querySelector('.depth-measured-reading').insertAdjacentHTML('beforeend', `<details class="depth-detail" data-association-sources="${esc(id)}" ${record.source_ids.length <= 6 ? 'open' : ''}><summary>Sources behind this line · ${record.source_ids.length} documents</summary><p class="depth-scope">These documents contain the co-mention windows counted by the map. A mention may be incidental, a citation or an ambiguous name; it does not by itself establish a substantive connection. Saved records provide source metadata and captured analysis, not the full extracted text.</p>${wholeSourcesHTML(record.source_ids.map(key => wholeMap.sources_by_id[key]))}</details>`);
    }
    function handleClick(event) {
      if(event.target.closest('[data-map-groups]')){setMode('whole');representation='groups';callbacks.overview('whole');refreshMap();return;}
      if(event.target.closest('[data-level="L2_entity"]')){representation='actors';refreshMap();return;}
      const displayGroup=event.target.closest('[data-display-group-target]');
      if(displayGroup){const id=displayGroup.dataset.displayGroupTarget;if(mode==='core'&&groups[id])callbacks.group(id);else{setMode('whole');representation='groups';callbacks.displayGroup(id);}return;}
      const modeButton = event.target.closest('button[data-depth-mode]');
      if (modeButton) {representation='actors';setMode(modeButton.dataset.depthMode); callbacks.overview(mode); refreshMap(); return;}
      const groupButton = event.target.closest('[data-depth-group-target]');
      if (groupButton) {
        const id = groupButton.dataset.depthGroupTarget;
        setMode('core'); callbacks.group(id);
        return;
      }
      const cite = event.target.closest('[data-depth-cite]');
      if (!cite) return;
      const host = cite.closest('.depth-detail,.depth-reading');
      const drawer = host && [...host.children].find(e => e.classList.contains('depth-evidence-drawer'));
      if (!drawer) return;
      const key = cite.dataset.depthCite, show = drawer.hidden || drawer.dataset.key !== key;
      host.querySelectorAll('[data-depth-cite]').forEach(b => b.setAttribute('aria-expanded','false'));
      drawer.hidden = !show; drawer.dataset.key = key; cite.setAttribute('aria-expanded', String(show));
      if (show) drawer.innerHTML = key.split(' ').map(id => {
        const row = evidence[id]; if (!row) return '<p>Evidence record unavailable.</p>';
        const source = projection.sources_by_id[row.source_id || row.document_id];
        const href = row.record_href || source?.record_href;
        const url = row.public_url || source?.public_url;
        const capture = wholeMap?.evidence_capture_links[id];
        const excerpt = String(row.display_excerpt || row.passage || '').trim().split(/\s+/).slice(0,24).join(' ');
        return `<section class="depth-source"><strong>${esc(row.title || source?.title || 'Corpus evidence')}</strong>${row.byline ? '<p>'+esc(row.byline)+'</p>' : ''}${excerpt ? `<blockquote>${esc(excerpt)}…</blockquote>` : ''}<p class="depth-scope">Excerpt. Open the source for full context.</p><div class="actor-source-links">${href ? `<a href="${esc(href)}" data-reading-record="true">Read saved corpus record</a>` : ''}${url ? `<a href="${esc(url)}" target="_blank" rel="noopener noreferrer">Original publication</a>` : ''}${capture ? `<a href="${esc(capture)}" target="_blank" rel="noopener noreferrer">Open captured corpus metadata</a>` : ''}</div></section>`;
      }).join('');
    }
    const controls = document.querySelector('.subject-controls');
    if (controls) {
      controls.insertAdjacentHTML('afterbegin', `<div class="depth-coverage-controls"><strong class="cmd-inline-label">Coverage</strong><button class="chip" data-depth-mode="whole" aria-pressed="true">Whole map</button><button class="chip" data-depth-mode="core" aria-pressed="false">Strategic core</button><span>${entityIds.length} actors · ${groupIds.length} groups · ${Object.keys(relations).length} relationship readings in the core</span></div><p class="depth-coverage-note"></p>`);
      controls.querySelector('[data-level="L2_entity"]').insertAdjacentHTML('afterend','<button class="chip" data-map-groups="true" aria-pressed="false">Actor groups</button>');
      controls.querySelector('[data-level="L1_class"]').textContent='Original categories';
      controls.querySelector('[aria-label="View"]').title='Named actors, shared actor groups, or the original corpus categories.';
      const colour=controls.querySelector('[aria-label="Colour: assigned categories"]');if(colour){colour.setAttribute('aria-label','Colour: primary actor group');colour.innerHTML='<b class="cmd-inline-label">Colour</b><span>Primary actor group</span>';}
      controls.insertAdjacentHTML('beforeend',`<details class="display-group-legend"><summary>Group colours · ${Object.keys(taxonomy.groups_by_id).length} groups</summary><p>Circles are named actors; diamonds are groups. Related groups can share a colour family. The same group keeps its colour across views.</p><div class="depth-list">${Object.values(taxonomy.groups_by_id).map(g=>`<button data-display-group-target="${esc(g.id)}"><span class="display-group-swatch" style="--group-colour:var(--c${g.color_index})"></span>${esc(g.label)}</button>`).join('')}</div></details>`);
    }
    document.addEventListener('click', handleClick);
    document.addEventListener('input', event => {
      const input = event.target.closest('input[data-depth-filter]'); if (!input) return;
      const actors = input.dataset.depthFilter === 'actors';
      const host = input.closest(actors ? '.depth-actor-index' : '.depth-detail');
      const rows = [...host.querySelectorAll(actors ? '.depth-list > button[data-actor]' : '.depth-relation-index > [data-depth-relationship]')];
      const query = input.value.trim().toLocaleLowerCase();
      let matches = 0;
      rows.forEach(row => {
        const label = actors ? row.textContent : row.querySelector('summary').textContent;
        row.hidden = !label.toLocaleLowerCase().includes(query); if (!row.hidden) matches++;
      });
      host.querySelector('.depth-filter-count').textContent = `${matches} of ${rows.length} ${actors ? 'named actors' : 'relationship readings'}${matches ? '' : ' · no matches; try another name or type'}`;
    });
    document.addEventListener('df-measured-opened', event => decorateMeasured(event.detail.id));
    document.addEventListener('df-actor-drawn', refreshMap);
    document.getElementById('fit').addEventListener('click', () => {strategicMap.reset(); refreshMap();});
    return {decorate, refreshMap, decorateMeasured, hasSelection, selectionHTML, setMode, getMode: () => mode, setRepresentation,getRepresentation:()=>representation};
  }
})();
