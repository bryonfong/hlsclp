/* Plain-data reading projection. No model inference, HTML or graph mutations. */
(function () {
'use strict';
const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
// Authored sections separate list items with blank lines; keep them as paragraphs, citations on the last.
const paragraphs = (text, citations) => { const parts = String(text ?? '').split(/\n\s*\n/).map(t => t.trim()).filter(Boolean); if (!parts.length) parts.push(''); return parts.map((t, i) => '<p>' + esc(t) + (i === parts.length - 1 ? ' ' + citations : '') + '</p>').join(''); };
const el = document.getElementById('reading-data');
const DATA = el ? JSON.parse(el.textContent) : null;
const FIGURE = new URLSearchParams(location.search).get('boardFigure');
let opener = null, last = 'overview', receiving = false, active = false;
// Preserve every word of the captured excerpt; only restore paragraph boundaries.
function passageHTML(text) {
 const damaged=/[\x00-\x08\x0b\x0e-\x1f\x7f-\x9f\ufffd]/.test(text);
 const metadata=/^\s*Topics:\s/.test(text)&&String(text).length<240;
 const warning=damaged?'<p class="reading-damage">Damaged text extraction: this passage contains corrupted characters. It is retained for inspection, not presented as readable or verified evidence. Check the original source.</p>':metadata?'<p class="reading-damage">Search metadata only: these tags do not substantiate an actor relationship or an analytical claim. The original retrieval is retained so this evidence weakness remains visible.</p>':'';
 const visible=String(text).replace(/[\x00-\x08\x0b\x0e-\x1f]/g,c=>String.fromCharCode(0x2400+c.charCodeAt(0)));
 return warning+visible.split(/\n\s*\n|\s{2,}(?=\S)/).filter(s=>s.trim()).map(s=>'<p>'+esc(s.trim()).replace(/\n/g,'<br>')+'</p>').join('');
}
function post(kind, id) { if (FIGURE && window.parent !== window) parent.postMessage({kind, version:1, figureId:FIGURE, selectionId:id}, location.origin); }
// Local saved records stay beside the argument; publisher pages remain separate.
function savedRecordURL(href) {
 try { const url=new URL(href,location.href);return /^https?:$/.test(url.protocol)&&url.origin===location.origin&&/\.html$/i.test(url.pathname)?url:null; } catch (_) { return null; }
}
function scrollContext(host) {
 const rows=[];for(let node=host;node;node=node.parentElement)if(node.scrollHeight>node.clientHeight||node.scrollWidth>node.clientWidth)rows.push({node,top:node.scrollTop,left:node.scrollLeft});
 return rows;
}
function restoreContext(rows,trigger) {
 trigger?.focus({preventScroll:true});rows.forEach(({node,top,left})=>{if(node.isConnected){node.scrollTop=top;node.scrollLeft=left;}});
}
let sourceReader=null;
function closeSource(restore=true) {
 if(!sourceReader)return;const state=sourceReader;sourceReader=null;state.abort?.abort();state.dialog.close();state.dialog.remove();if(restore)restoreContext(state.scroll,state.trigger);
}
function openSource(href,label,host,trigger) {
 const url=savedRecordURL(href);if(!url)return false;closeSource(false);
 const dialog=document.createElement('dialog');dialog.className='reading-source-dialog';dialog.setAttribute('aria-label','Saved corpus record');
 dialog.innerHTML='<header class="reading-source-toolbar"><button type="button" data-source-back>Back to reading</button><div><p class="reading-kicker">Saved corpus record</p><h2></h2></div><a target="_blank" rel="noopener noreferrer">Open saved record in new tab</a><button type="button" data-source-close aria-label="Close source reader">Close</button></header><p class="reading-source-status" role="status">Loading saved record…</p><iframe title="Saved corpus record" sandbox="allow-same-origin allow-popups" referrerpolicy="no-referrer"></iframe>';
 const frame=dialog.querySelector('iframe'),heading=dialog.querySelector('h2'),back=dialog.querySelector('[data-source-back]'),link=dialog.querySelector('a'),status=dialog.querySelector('[role="status"]');
 const state={dialog,frame,trigger,scroll:scrollContext(host),stack:[],url:null,label:null,abort:null,serial:0};sourceReader=state;
 async function navigate(next,title,restoreScroll=0){
  state.abort?.abort();state.abort=new AbortController();const serial=++state.serial;state.url=next;state.label=title;heading.textContent=title;link.href=next;back.textContent=state.stack.length?'Back to previous source':'Back to reading';status.hidden=false;status.textContent='Loading saved record…';frame.hidden=true;
  try{
   const response=await fetch(next,{method:'HEAD',signal:state.abort.signal,credentials:'same-origin'});if(!response.ok)throw new Error('HTTP '+response.status);if(sourceReader!==state||serial!==state.serial)return;
   frame.onload=()=>{
    if(sourceReader!==state||serial!==state.serial)return;status.hidden=true;frame.hidden=false;
    const doc=frame.contentDocument;if(doc){doc.documentElement.dataset.theme=document.documentElement.dataset.theme||'light';frame.contentWindow.scrollTo(0,restoreScroll);
     doc.addEventListener('click',event=>{const anchor=event.target.closest('a[href]');if(!anchor||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;const address=new URL(anchor.getAttribute('href'),next);
      if(address.origin===location.origin&&address.pathname===new URL(next).pathname&&address.hash)return;
      const saved=savedRecordURL(address.href);if(saved){event.preventDefault();state.stack.push({url:next,label:title,scroll:frame.contentWindow.scrollY});navigate(saved.href,anchor.textContent.trim()||'Saved corpus record');}
      else if(/^https?:$/.test(address.protocol)){event.preventDefault();window.open(address.href,'_blank','noopener,noreferrer');}
     });
    }
   };frame.src=next;
  }catch(error){if(error.name!=='AbortError'&&sourceReader===state&&serial===state.serial){status.hidden=false;status.textContent='This saved record could not be loaded. The reading is preserved; use Back to reading or try opening the saved record in a new tab.';}}
 }
 back.onclick=()=>{const previous=state.stack.pop();if(previous)navigate(previous.url,previous.label,previous.scroll);else closeSource();};dialog.querySelector('[data-source-close]').onclick=()=>closeSource();dialog.addEventListener('cancel',event=>{event.preventDefault();closeSource();});
 document.body.appendChild(dialog);dialog.showModal();back.focus({preventScroll:true});navigate(url.href,label);return true;
}
function recordLink(link) {
 const local=savedRecordURL(link.href);return '<a href="'+esc(link.href)+'" '+(local?'data-reading-record="true" ':'')+'target="_blank" rel="noopener noreferrer">'+esc(link.label)+(local?' <span class="reading-link-kind">Saved corpus record</span>':' <span class="reading-link-kind">Publisher / external source</span>')+'</a>';
}
function jumpTo(host,key){
 const target=[...host.querySelectorAll('[data-reading-section]')].find(node=>node.dataset.readingSection===key);if(!target)return;
 if(target.tagName==='DETAILS')target.open=true;for(let node=target.parentElement;node&&node!==host;node=node.parentElement)if(node.tagName==='DETAILS')node.open=true;
 target.setAttribute('tabindex','-1');target.focus({preventScroll:true});target.scrollIntoView({block:'start',behavior:'auto'});
}

const KICKER={'substantive':'Dragonfly interpretation','source-limited':'Source-limited reading','gap':'Evidence gap','record':'Corpus record'};
const dissentLabels=context=>context?.position_semantics?.contesting||['Opposes','Mixed','Redirects'];
// The saved-record directory is taken from the profile's own record links; nothing is invented.
function recordsBase(context){
 const hrefs=[...(context?.links||[]).map(l=>l.href),...(context?.source_profiles||[]).map(s=>s.record_href)];
 for(const href of hrefs){const m=/^(.*\/)(?:document|topic|group)-[^/]+\.html$/.exec(String(href||''));if(m)return m[1];}
 return null;
}
function sameRefs(a,b){const x=[...new Set(a||[])].sort(),y=[...new Set(b||[])].sort();return x.length>0&&x.length===y.length&&x.every((v,i)=>v===y[i]);}
function dissentHTML(context,cite){
 const stances=context?.stances||[],perspectives=[...(context?.comparative_perspectives||[])];
 const pushback=stances.filter(s=>dissentLabels(context).includes(s.position));
 if(!stances.length&&!perspectives.length)return '';
 const labelsForDissent=dissentLabels(context);
 const rank=v=>{const i=labelsForDissent.indexOf(v);return i<0?labelsForDissent.length:i;};
 perspectives.sort((a,b)=>rank(a.position)-rank(b.position));
 const base=recordsBase(context);
 let h='<section class="reading-section reading-dissent" data-reading-section="dissent" data-dissent-labels="'+esc(JSON.stringify(labelsForDissent))+'"><h3>Recorded dissent and comparative perspectives</h3>';
 if(stances.length)h+='<p class="reading-stances">'+(pushback.length?pushback.length+' of '+stances.length+' recorded stances push back: '+esc(pushback.map(s=>s.source_name+' ('+s.position+')').join('; '))+'.':'None of the '+stances.length+' recorded stances pushes back on the corpus proposition.')+' Stances concern the corpus topic proposition, not this reading.</p>';
 const labels=context?.document_labels||{};
 const label=did=>{const d=labels[did];if(!d||!d.source_name)return 'Saved source record · '+did;return (d.title||'Untitled document')+' — '+d.source_name+(d.slug?' (source identifier; no display name in the corpus)':'');};
 const links=ids=>base&&ids.length?'<div class="reading-record-links">'+ids.map(did=>recordLink({href:base+'document-'+did+'.html',label:label(did)})).join('')+'</div>':'';
 const stanceEntries=pushback.map(s=>'<article class="reading-perspective reading-stance-dissent" data-position="'+esc(s.position)+'"><h4>'+esc(s.source_name)+' · '+esc(s.position)+'</h4><p>'+esc(s.analysis||'Recorded position on the corpus topic proposition; open the saved source record for its account.')+'</p>'+(s.quotes||[]).map(q=>'<blockquote>'+passageHTML(q.text||'')+'</blockquote>'+links(q.document_ids||s.document_ids||[])).join('')+((s.quotes||[]).length?'':links(s.document_ids||[]))+'</article>').join('');
 h+=stanceEntries+perspectives.map(f=>'<article class="reading-perspective" data-position="'+esc(f.position)+'"><h4>'+esc(f.facetValue||f.facet||'Comparison')+' · '+esc(f.position)+'</h4><p>'+esc(f.positionAnalysis||'')+'</p>'+(f.quotes||[]).map(q=>{
  const quote=typeof q==='string'?{text:q}:q,ids=quote.document_ids||[];
  return '<blockquote>'+passageHTML(quote.text||quote.quote||quote.rationale||'')+'</blockquote>'+(quote.entityName?'<p class="reading-locator">'+esc(quote.entityName)+'</p>':'')+links(ids);
 }).join('')+'</article>').join('');
 return h+'</section>';
}
function render(data, id, host, go, native) {
 const p = data.profiles[id]; if (!p || !host) return false;
 closeSource(false);
 const support=p.claim_support||[],basisNames={'attributed-position':'Attributed position','analyst-interpretation':'Analyst interpretation','proposed-design':'Proposed design','analogy':'Analogy','reported-finding':'Reported finding','analysis-reading':'The analysis\'s reading','Analysis reading':'The analysis\'s reading'};
 const ids = [...new Set(p.sections.flatMap(s=>s.evidence_refs).concat((p.related||[]).flatMap(r=>r.evidence_refs),support.flatMap(s=>s.evidence_refs||[])))];
 const cite = refs => '<span class="reading-citations">'+refs.map(ref=>'<button type="button" data-reading-citation="'+esc(ref)+'" aria-label="Read source '+(ids.indexOf(ref)+1)+'">['+(ids.indexOf(ref)+1)+']</button>').join(' ')+'</span>';
 const claimCite=field=>cite(support.filter(s=>s.field===field).flatMap(s=>s.evidence_refs||[]));
 const headlineShown=p.headline&&(p.headline!==p.title||support.some(s=>s.field==='headline'));
 let h='<article class="reading-profile" data-reading-profile="'+esc(id)+'"><div class="reading-kicker">'+esc(KICKER[p.quality]||'Dragonfly interpretation')+'</div><h2>'+esc(p.title)+'</h2>'+(headlineShown?'<p class="reading-headline">'+esc(p.headline)+' '+claimCite('headline')+'</p>':'')+'<p class="reading-lead">'+esc(p.summary)+' '+claimCite('summary')+'</p>';
 const context=p.source_context,nav=p.sections.map((section,index)=>({key:'argument-'+index,label:section.heading}));
 const dissent=dissentHTML(context,cite);
 if(dissent)nav.push({key:'dissent',label:'Recorded dissent'});
 if(context?.points?.length)nav.push({key:'native',label:'Corpus synthesis ('+context.points.length+')'});
 nav.push({key:'corpus',label:'Source records'});if(ids.length)nav.push({key:'evidence',label:'Cited passages'});nav.push({key:'limits',label:'Limits'});
 if(nav.length>3)h+='<nav class="reading-section-nav" aria-label="Sections in this reading"><span>In this reading</span>'+nav.map(item=>'<button type="button" data-reading-jump="'+esc(item.key)+'">'+esc(item.label)+'</button>').join('')+'</nav>';
 // An unlabelled section citing exactly the refs of an earlier labelled section inherits that basis, visibly.
 const basisLine=(s,index)=>{
  if(s.basis)return '<span class="reading-basis">'+esc(basisNames[s.basis]||s.basis)+'</span>';
  for(let j=index-1;j>=0;j--){const prior=p.sections[j];if(prior.basis&&sameRefs(prior.evidence_refs,s.evidence_refs))return '<span class="reading-basis reading-basis-inherited">Same basis as above · '+esc(basisNames[prior.basis]||prior.basis)+'</span>';}
  return '';
 };
 h+=p.sections.map((s,index)=>'<section class="reading-section" data-reading-section="argument-'+index+'"><h3>'+esc(s.heading)+'</h3>'+basisLine(s,index)+(s.claims?.length?'<p>'+s.claims.map(c=>(c.basis&&c.basis!==s.basis?'<span class="reading-claim-basis">'+esc(basisNames[c.basis]||c.basis)+' · </span>':'')+esc(c.text)+' '+cite(c.evidence_refs)).join(' ')+'</p>':paragraphs(s.text,cite(s.evidence_refs)))+(s.support_note?'<details class="reading-support"><summary>Evidence and interpretation</summary><p>'+esc(s.support_note)+'</p></details>':'')+'</section>').join('');
 if(p.related?.length)h+='<section class="reading-section"><h3>Connections that matter</h3>'+p.related.map(r=>'<div class="reading-connection"><button class="reading-link" type="button" data-reading-target="'+esc(r.target)+'">'+esc(r.label)+'</button>'+(r.basis?'<span class="reading-basis">'+esc(r.basis)+'</span>':'')+'<p>'+esc(r.rationale)+' '+cite(r.evidence_refs)+'</p></div>').join('')+'</section>';
 h+=dissent;

 if(context?.points?.length){
  h+='<section class="reading-audit reading-native" data-reading-section="native"><p class="reading-kicker">Insight Bridge corpus synthesis</p><h3>What the corpus synthesis says</h3><p>These '+context.points.length+' cached key points are the native corpus synthesis, presented separately from the Dragonfly interpretation above. They are not quotations from a single source.</p>';
  const pushback=(context.stances||[]).filter(s=>dissentLabels(context).includes(s.position));
  if(pushback.length)h+='<p>'+pushback.length+' of '+context.stances.length+' recorded stances push back: '+esc(pushback.map(s=>s.source_name).join(', '))+'. These positions concern the corpus topic proposition, not agreement with the Dragonfly interpretation.</p>';
  else if(Object.keys(context.positions||{}).length)h+='<p>Positions on the corpus topic proposition: '+Object.entries(context.positions).map(([label,count])=>esc(label)+' '+count).join(' · ')+'. These positions do not rate agreement with the Dragonfly interpretation.</p>';
  h+='<details class="reading-native-points"><summary>Read all '+context.points.length+' corpus key points</summary>'+context.points.map(point=>'<section><h3>'+esc(point.heading)+'</h3><p>'+esc(point.text)+'</p></section>').join('')+'</details></section>';
 }
 h+='<section class="reading-audit reading-corpus" data-reading-section="corpus"><h3>Explore the corpus</h3>';
 if(context){
  h+='<p>'+esc(context.coverage)+'</p>';
  const profiles=context.source_profiles||[],profileLinks=new Set(profiles.map(source=>source.record_href));
  const sourceRows=profiles.map(source=>{
   const info=source.completeness||{},counts=[['key_points','key points'],['criteria','criteria'],['topics','topics']].filter(([key])=>Number.isInteger(info[key])).map(([key,label])=>info[key]+' '+label);
   return '<section class="reading-source-profile">'+recordLink({href:source.record_href,label:source.title||source.source_name||'Saved source profile'})+'<p class="reading-source-coverage">Captured source profile'+(counts.length?' · '+esc(counts.join(' · ')):'')+'. '+(info.text==='returned-extracted-text'?'Saved extracted text is available.':'Full extracted text is not available in this record.')+' The original publication has not been independently verified.</p>'+(source.publisher_url?'<a href="'+esc(source.publisher_url)+'" target="_blank" rel="noopener noreferrer">Open original publication</a>':'')+'</section>';
  });
  if(profiles.length)h+='<div class="reading-source-profiles">'+sourceRows.slice(0,3).join('')+(profiles.length>3?'<details class="reading-connections reading-all-sources"><summary>Browse all '+profiles.length+' saved source profiles · '+(profiles.length-3)+' more</summary>'+sourceRows.slice(3).join('')+'</details>':'')+'</div>';
  h+='<div class="reading-record-links">'+context.links.filter(link=>!profileLinks.has(link.href)).map(recordLink).join('')+'</div>';
 }
 else h+='<p>The passages below are a selected citation set, not a complete source review.</p>';
 if(p.corpus_links?.length)h+='<details class="reading-connections"><summary>Browse '+p.corpus_links.length+(data.basis==='qualitative'?' analytical connections':' measured connections')+'</summary><div class="reading-record-links">'+p.corpus_links.map(r=>'<button class="reading-link" type="button" data-reading-target="'+esc(r.target)+'">'+esc(r.label)+'</button>').join('')+'</div></details>';
 if(p.measurements?.length)h+='<details class="reading-connections"><summary>'+(data.basis==='qualitative'?'Assessment for this selection':'Measures for this selection')+'</summary>'+p.measurements.map(r=>'<div class="reading-measure"><span>'+esc(r.label)+'</span><span>'+esc(r.value)+'</span></div>').join('')+'</details>';
 h+='</section>';
 if(ids.length){
  const groups=new Map();ids.forEach(eid=>{const e=data.evidence[eid];if(!groups.has(e.document_id))groups.set(e.document_id,[]);groups.get(e.document_id).push(eid)});
  h+='<details class="reading-audit reading-evidence" data-reading-section="evidence"><summary>Evidence · '+groups.size+' cited sources'+'</summary>';
  if(ids.length)h+='<h3>Passages cited by the Dragonfly reading</h3><p>These are the exact retrieved passages cited above. A citation indicates the material used for an interpretation, not independent verification of every claim in it.</p>';
  groups.forEach(eids=>{const first=data.evidence[eids[0]],sourceProfile=context?.source_profiles?.find(source=>source.document_id===first.document_id);const fullSource=sourceProfile?'<div class="reading-record-links reading-cited-source-links">'+recordLink({href:sourceProfile.record_href,label:'Read saved source profile · '+(sourceProfile.title||first.title)})+(sourceProfile.publisher_url?'<a href="'+esc(sourceProfile.publisher_url)+'" target="_blank" rel="noopener noreferrer">Open original publication</a>':'')+'</div>':'';h+='<section class="reading-source-group" data-reading-document="'+esc(first.document_id)+'"><h3>'+esc(first.title)+'</h3>'+eids.map(eid=>{const e=data.evidence[eid];const uses=[...support.filter(s=>(s.evidence_refs||[]).includes(eid)).map(s=>s.field==='headline'?'Headline':'Summary'),...p.sections.filter(s=>s.evidence_refs.includes(eid)).map(s=>s.heading),...(p.related||[]).filter(r=>r.evidence_refs.includes(eid)).map(r=>r.label)];return '<section class="reading-source" data-reading-source="'+esc(eid)+'"><p class="reading-evidence-use">['+(ids.indexOf(eid)+1)+'] Cited for: '+esc(uses.join('; '))+'</p><details class="reading-passage"><summary>Read the complete retrieved passage · '+e.passage.trim().split(/\s+/).length+' words</summary><blockquote>'+passageHTML(e.passage)+'</blockquote></details>'+(e.url?recordLink({href:e.url,label:savedRecordURL(e.url)?'Read saved source record':'Open original publication'}):'')+'</section>'}).join('')+fullSource+'</section>'});h+='</details>';
 }
const SCOPE_LABEL={'imported':'Evidence drawn from a related record','related-topic':'Evidence from a related topic','no-clean-on-topic-passage':'No clean on-topic passage'};
 h+='<details class="reading-audit reading-limits" data-reading-section="limits"><summary>Limits of this reading</summary>'+(p.limitations||[]).map(s=>'<p>'+esc(s)+'</p>').join('')+(p.dissent_disposition?'<p class="reading-disposition">Recorded dissent not cited: '+esc(p.dissent_disposition.reason)+'</p>':'')+(p.evidence_scope?'<p class="reading-disposition">'+esc(SCOPE_LABEL[p.evidence_scope.disposition]||'Evidence scope')+': '+esc(p.evidence_scope.reason)+'</p>':'')+'<p>'+esc(context?.limits||'Only the cited retrieval passages are shown here. This is not an exhaustive review of the corpus or a verification of the original publications.')+'</p></details>';
 host.innerHTML=h+'</article>';
 host.onclick=ev=>{const record=ev.target.closest('[data-reading-record]');if(record&&!ev.ctrlKey&&!ev.metaKey&&!ev.shiftKey&&!ev.altKey){if(openSource(record.href,record.textContent.replace('Saved corpus record','').trim(),host,record))ev.preventDefault();return}const jump=ev.target.closest('[data-reading-jump]');if(jump){jumpTo(host,jump.dataset.readingJump);return}const target=ev.target.closest('[data-reading-target]');if(target){go(target.dataset.readingTarget);return}const citation=ev.target.closest('[data-reading-citation]');if(citation){const item=[...host.querySelectorAll('[data-reading-source]')].find(n=>n.dataset.readingSource===citation.dataset.readingCitation);if(item){item.closest('.reading-evidence').open=true;item.querySelector('.reading-passage').open=true;item.scrollIntoView({block:'start',behavior:'smooth'});}}};
 return true;
}
function show(id,host,native) { if(!DATA)return false;last=id;const ok=render(DATA,id,host,open,native);if(ok&&active&&!receiving)post('df-board-selection',id);return ok; }
function open(id) { if(DATA?.profiles[id]&&opener)opener(id); }
function setup() {
 if(!DATA)return;
 if(window.DFRichPanels){
  DFRichPanels.append=function(spec,id,host){show(id,host,host.innerHTML);};
  const spec=JSON.parse(document.getElementById('viz-data').textContent);
  opener=function(id){if(id==='overview'){DFViz.closeDetail();return}DFViz.nav.go(DATA.profiles[id].kind,id)};
  const close=DFViz.closeDetail;DFViz.closeDetail=function(){close();last='overview';if(!receiving)post('df-board-selection','overview');};
 }
 function ready(){
  if(window.DFRichPanels){const host=document.getElementById('panel-general');const controls=host.querySelector('.rich-tier-nav');if(controls)host.before(controls);show('overview',host,host.innerHTML);}
  if(FIGURE){
   const workspace=document.querySelector('.viz-workspace'), palette=document.querySelector('.cmd-palette');
   if(workspace&&palette)workspace.after(palette);
   const controls=document.querySelector('.rich-tier-nav');if(controls){const canvas=document.querySelector('.viz-canvas');canvas.after(controls);}
   const actorMain=document.querySelector('body:has(#net)>main'), actorBar=document.querySelector('body:has(#net)>.bar');
   if(actorMain&&actorBar)actorMain.after(actorBar);
   const search=document.getElementById('search');
   if(search){
    const dropdown=document.createElement('div');dropdown.className='reading-search';dropdown.hidden=true;search.parentElement.appendChild(dropdown);
    search.addEventListener('input',()=>{const q=search.value.trim().toLowerCase();const matches=Object.entries(DATA.profiles).filter(([id,p])=>p.kind==='actor'&&p.title.toLowerCase().includes(q));dropdown.hidden=!q;dropdown.innerHTML='<p>'+matches.length+' retained actors</p>'+matches.map(([id,p])=>'<button type="button" data-id="'+esc(id)+'">'+esc(p.title)+'</button>').join('');});
    dropdown.onclick=ev=>{const b=ev.target.closest('[data-id]');if(b){dropdown.hidden=true;open(b.dataset.id)}};
   }
  }
  active=true;post('df-board-ready',last);
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ready);else ready();
 window.addEventListener('message',ev=>{
  if(ev.source!==parent||ev.origin!==location.origin||!FIGURE)return;const m=ev.data;if(!m)return;
  if(m.kind==='df-theme'&&['light','dark'].includes(m.theme)){document.documentElement.dataset.theme=m.theme;return}
  if(m.kind==='df-board-open'&&m.version===1&&m.figureId===FIGURE&&DATA.profiles[m.selectionId]){receiving=true;open(m.selectionId);receiving=false;}
 });
}
window.DFReading={data:DATA,show,setup,setOpen:fn=>{opener=fn}};
window.DFBoardReading={render:function(figureId,id,host){const registry=JSON.parse(document.getElementById('viz-data').textContent).figures;const data=registry&&registry[figureId];return !!data&&render(data,id,host,target=>window.DFBoard.open(figureId,target));}};
})();
