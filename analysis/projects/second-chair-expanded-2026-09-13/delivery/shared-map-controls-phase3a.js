(()=>{'use strict';
const spec=JSON.parse(document.getElementById('viz-data').textContent),svg=document.getElementById('ddm'),by=new Map(spec.nodes.map(n=>[n.id,n])),edgeBy=new Map(spec.edges.map(e=>[e.id,e]));
// Structural release guard: badges cannot refer to invisible or guessed arrows.
for(const l of spec.loops){if(l.edge_ids.length!==l.members.length)throw Error('Incomplete loop '+l.id);let negatives=0;l.edge_ids.forEach((id,i)=>{const e=edgeBy.get(id);if(!e||e.source!==l.members[i]||e.target!==l.members[(i+1)%l.members.length])throw Error('Broken directed loop '+l.id);if(e.type==='dampening')negatives++;else if(e.type!=='reinforcing')throw Error('Unsigned loop '+l.id)});if((negatives%2===1)!==(l.type==='B'))throw Error('Wrong loop polarity '+l.id)}
const xs=spec.nodes.filter(n=>n.node_kind!=='state').map(n=>n.x),ys=spec.nodes.filter(n=>n.node_kind!=='state').map(n=>n.y),home=[Math.min(...xs)-160,Math.min(...ys)-110,Math.max(...xs)-Math.min(...xs)+320,Math.max(...ys)-Math.min(...ys)+240];let box=home.slice(),drag=null,suppress=0;
const style=document.createElement('style');style.textContent=`
.viz-canvas{position:relative;padding:0!important;overflow:hidden!important}#ddm{width:100%!important;height:100%!important;min-width:0!important;min-height:0!important;position:absolute!important;inset:0!important}.viz-canvas .canvas{overflow:hidden!important}#ddm{touch-action:none;cursor:grab}#ddm.is-panning{cursor:grabbing}
.shared-tools{position:absolute;left:12px;top:12px;z-index:20;display:flex;gap:5px;align-items:center;flex-wrap:wrap;max-width:calc(100% - 24px);padding:5px;background:var(--df-surface);border-radius:6px;font:12px var(--df-font)}
.shared-tools button{font:inherit;color:var(--df-ink);background:var(--df-surface);border:1px solid var(--df-border);border-radius:4px;padding:5px 8px;cursor:pointer}.shared-tools span{color:var(--df-ink-muted)}
#ddm .node-label{font-size:calc(11px / var(--viz-svg-scale,1))!important}#ddm [data-node-kind=state] .node-circle{fill-opacity:.06;stroke-dasharray:3 3;stroke-width:1.7}
#ddm [data-node-kind=state]{display:none}#ddm[data-loop] [data-node-kind=state].in-loop{display:inline}#ddm [data-state-edge]{display:none}#ddm[data-loop] [data-state-edge].in-loop{display:inline}
#ddm [data-node-id].is-context{opacity:.72!important}#ddm [data-node-id].is-context .node-circle{stroke-width:4;stroke-dasharray:5 4}
#ddm .shared-context{fill:none;stroke:var(--df-ink-faint);stroke-width:1.3;stroke-dasharray:2 7;pointer-events:none}
#ddm .link.is-circuit .link-line{stroke-width:3.8;stroke-opacity:1}#ddm .link.is-circuit{opacity:1!important}#ddm .link.is-circuit .link-sign{opacity:1}
#ddm[data-focus=true] [data-node-id].is-dimmed:not(.is-context){opacity:.06!important;pointer-events:none}
#ddm[data-focus=true] [data-node-id].is-dimmed:not(.is-context) .node-label{display:none!important}
#ddm[data-focus=true] .link.is-dimmed{visibility:hidden;pointer-events:none}
#ddm[data-focus=true] .ov-dim{visibility:hidden;pointer-events:none}
#ddm [data-node-id].is-primary .node-circle{stroke-width:5;fill-opacity:.65}
#ddm .link.is-selected-edge .link-line{stroke-width:3;stroke-opacity:1}
#ddm .link.is-selected-edge{opacity:1!important}#ddm .link.is-selected-edge circle,#ddm .link.is-selected-edge .sign{opacity:1!important}
.shared-status{position:absolute;bottom:8px;left:12px;right:12px;z-index:15;width:fit-content;max-width:calc(100% - 24px);background:var(--df-surface);padding:7px 10px;border-radius:4px;color:var(--df-ink);font:12px/1.4 var(--df-font);pointer-events:none}
.shared-related{margin:12px 0;padding:10px 0;border-bottom:1px solid var(--df-border);font-size:13px}.shared-related summary{cursor:pointer;font-weight:600}.shared-related button{display:block;text-align:left;font:inherit;color:var(--df-ink);background:var(--df-surface);border:1px solid var(--df-border);border-radius:4px;padding:7px;margin:5px 0;width:100%;cursor:pointer}
#ddm .focus-ring{opacity:.3}.shared-map-key{color:var(--df-ink-muted);font-size:12px;line-height:1.4;margin-top:8px}
@media(max-width:700px){.shared-tools{left:5px;top:5px}.shared-tools span{display:none}}
`;document.head.appendChild(style);
const context=document.createElementNS('http://www.w3.org/2000/svg','g');context.id='shared-context';svg.insertBefore(context,document.getElementById('nodes'));
const tools=document.createElement('div');tools.className='shared-tools';tools.setAttribute('aria-label','Map navigation');tools.innerHTML='<button aria-label="Zoom in">+</button><button aria-label="Zoom out">−</button><button>Full map</button><span>Scroll for controls · drag to pan · Ctrl/⌘ + scroll to zoom</span>';document.querySelector('.viz-canvas').appendChild(tools);
const status=document.createElement('div');status.className='shared-status';status.setAttribute('role','status');status.setAttribute('aria-live','polite');document.querySelector('.viz-canvas').appendChild(status);
let labelFrame=0;
function draw(){svg.setAttribute('viewBox',box.join(' '));const r=svg.getBoundingClientRect();svg.style.setProperty('--viz-svg-scale',Math.min(r.width/box[2],r.height/box[3]));cancelAnimationFrame(labelFrame);labelFrame=requestAnimationFrame(placeLabels);}
function placeLabels(){
 const scale=svg.getScreenCTM().a,used=[],leaders=document.getElementById('shared-label-leaders')||document.createElementNS(svg.namespaceURI,'g');leaders.id='shared-label-leaders';leaders.style.pointerEvents='none';leaders.replaceChildren();if(!leaders.parentNode)svg.insertBefore(leaders,document.getElementById('nodes'));
 const labels=[...document.querySelectorAll('[data-node-id] .node-label')].filter(t=>getComputedStyle(t).display!=='none').sort((a,b)=>{const rank=t=>t.parentNode.classList.contains('is-primary')?0:t.parentNode.classList.contains('is-active')?1:t.parentNode.classList.contains('is-context')?2:3;return rank(a)-rank(b)});
 const measured=labels.map(t=>({t,b:t.getBBox(),x:+t.getAttribute('x'),y:+t.getAttribute('y')}));
 for(const {t,b,x,y} of measured){const n=by.get(t.parentNode.dataset.nodeId),r=+t.parentNode.querySelector('.node-circle').getAttribute('r');let chosen=false;
  for(let step=0;step<120;step++){const row=Math.floor(step/3),side=[0,-1,1][step%3],dx=side*(65+row*3)/scale,dy=r+18/scale+(row%2?-1:1)*Math.ceil(row/2)*16/scale,tx=n.x+dx,ty=n.y+dy;
   const rect={left:tx+b.x-x,right:tx+b.x-x+b.width,top:ty+b.y-y,bottom:ty+b.y-y+b.height};
   if(rect.left>=box[0]+4/scale&&rect.right<=box[0]+box[2]-4/scale&&rect.top>=box[1]+48/scale&&rect.bottom<=box[1]+box[3]-42/scale&&!used.some(a=>a.left<rect.right+4/scale&&rect.left<a.right+4/scale&&a.top<rect.bottom+3/scale&&rect.top<a.bottom+3/scale)){
    used.push(rect);chosen=true;t.setAttribute('x',tx);t.setAttribute('y',ty);
    if(Math.hypot(dx,dy)>r+30/scale){const line=document.createElementNS(svg.namespaceURI,'path');line.setAttribute('d',`M ${n.x} ${n.y} L ${tx} ${ty-8/scale}`);line.setAttribute('stroke','var(--df-ink-faint)');line.setAttribute('opacity','.35');line.setAttribute('fill','none');line.setAttribute('stroke-width',String(.6/scale));leaders.appendChild(line)}break;
   }
  }
  if(chosen)t.removeAttribute('data-label-layout-error');else t.setAttribute('data-label-layout-error','collision');
 }
}
function zoom(f,x=box[0]+box[2]/2,y=box[1]+box[3]/2){const w=Math.max(home[2]/8,Math.min(home[2]*1.3,box[2]*f)),k=w/box[2];box=[x+(box[0]-x)*k,y+(box[1]-y)*k,w,box[3]*k];draw()}
const buttons=tools.querySelectorAll('button');buttons[0].onclick=()=>zoom(.75);buttons[1].onclick=()=>zoom(1/.75);buttons[2].onclick=()=>window.SharedMap.reset();
window.SharedMap.closePanel=DFViz.closeDetail;
DFViz.closeDetail=()=>window.SharedMap.reset();
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function goButton(kind,id,label){return '<button type="button" data-shared-go="'+esc(kind)+'" data-shared-id="'+esc(id)+'">'+esc(label)+'</button>'}
function readingLinks(state){
 const host=document.getElementById('detail-host');let content='';
 if(state.kind==='node'){
  const node=by.get(state.id),edges=spec.edges.filter(e=>e.source===state.id||e.target===state.id);
  content+='<details class="shared-related"><summary>Direct connections ('+edges.length+')</summary>'+edges.map(e=>goButton('edge',e.id,by.get(e.source).label+' → '+by.get(e.target).label)+goButton('node',e.source===state.id?e.target:e.source,'Open '+by.get(e.source===state.id?e.target:e.source).label)).join('')+'</details>';
  const loops=spec.loops.filter(l=>l.members.includes(state.id)||(l.context_drivers||[]).includes(state.id));
  if(loops.length)content+='<details class="shared-related"><summary>Related loops ('+loops.length+')</summary>'+loops.map(l=>goButton('loops',l.id,l.id+' · '+l.label+(l.members.includes(state.id)?'':' · driver context'))).join('')+'</details>';
 }else if(state.kind==='loops'){
  const loop=spec.loops.find(l=>l.id===state.id);content+='<details class="shared-related"><summary>Trace the circuit ('+loop.edge_ids.length+' connections)</summary>'+loop.edge_ids.map(id=>{const e=edgeBy.get(id);return goButton('edge',id,by.get(e.source).label+' → '+by.get(e.target).label)}).join('')+'</details>';
  content+='<details class="shared-related"><summary>Nodes in this circuit</summary>'+loop.members.map(id=>goButton('node',id,by.get(id).label)).join('')+'</details>';
 }else if(state.kind==='edge'){
  const e=edgeBy.get(state.id);content+='<details open class="shared-related"><summary>Connection endpoints</summary>'+goButton('node',e.source,by.get(e.source).label)+goButton('node',e.target,by.get(e.target).label)+'</details>';
 }
 if(content){const nav=document.createElement('div');nav.id='shared-selection-links';nav.innerHTML=content;host.prepend(nav)}
}
document.addEventListener('click',event=>{const b=event.target.closest('[data-shared-go]');if(!b)return;event.preventDefault();DFViz.nav.go(b.dataset.sharedGo,b.dataset.sharedId,true)});
function renderSelection(state){
 context.replaceChildren();svg.removeAttribute('data-selected-loop');svg.dataset.selectionKind=state.kind;svg.dataset.selectionId=state.id||'';
 document.querySelectorAll('.is-context,.is-circuit,.is-selected-edge,.is-primary,.in-loop').forEach(n=>n.classList.remove('is-context','is-circuit','is-selected-edge','is-primary','in-loop'));svg.removeAttribute('data-loop');
 const selected=new Set(state.edges);document.querySelectorAll('[data-edge-id]').forEach(g=>g.classList.toggle('is-selected-edge',selected.has(g.dataset.edgeId)));
 let ids=state.nodes.slice(),description='';
 if(state.kind==='loops'){
  const loop=spec.loops.find(l=>l.id===state.id);svg.dataset.selectedLoop=loop.id;svg.dataset.loop=loop.id;loop.members.forEach(id=>{const g=document.querySelector('[data-node-id="'+id+'"]');if(g&&g.dataset.nodeKind==='state')g.classList.add('in-loop')});loop.edge_ids.forEach(id=>{const g=document.querySelector('[data-edge-id="'+id+'"]');if(g&&g.hasAttribute('data-state-edge'))g.classList.add('in-loop')});
  document.querySelectorAll('[data-edge-id]').forEach(g=>g.classList.toggle('is-circuit',selected.has(g.dataset.edgeId)));
  for(const id of loop.context_drivers||[]){const n=by.get(id);document.querySelector('[data-node-id="'+id+'"]').classList.add('is-context');const path=document.createElementNS(svg.namespaceURI,'path');path.setAttribute('class','shared-context');path.setAttribute('d',`M ${loop.x} ${loop.y} L ${n.x} ${n.y}`);path.dataset.contextDriver=id;context.appendChild(path);ids.push(id)}
  description=loop.id+' · '+loop.edge_ids.length+' circuit connections'+(loop.context_drivers.length?' · dotted guides show related drivers, not causes':'');
  document.dispatchEvent(new CustomEvent('shared:loop',{detail:{id:loop.id}}));
 }else if(state.kind==='node'){
  const n=by.get(state.id);document.querySelector('[data-node-id="'+state.id+'"]').classList.add('is-primary');description=n.label+' · '+state.edges.length+' direct incoming/outgoing connections';
 }else if(state.kind==='edge'){const e=edgeBy.get(state.id);description=by.get(e.source).label+' → '+by.get(e.target).label+' · one connection';}
 else if(state.kind==='filter'){description=state.filter.length?'Category filter · '+state.filter.length+' selected · Full map clears filters':"Full map · 18 drivers · 41 connections";}
 else if(state.kind==='overview'){description="Full map · 18 drivers · 41 connections";}
 else description=state.kind==='cascades'?'Open pathway · '+state.edges.length+' connections':'Threshold and its associated circuit';
 const focused=state.kind!=='overview'&&(state.kind!=='filter'||state.filter.length>0);svg.dataset.focus=String(focused);status.textContent=description;
 if(ids.length){const nodes=ids.map(id=>by.get(id)),x=nodes.map(n=>n.x),y=nodes.map(n=>n.y);box=[Math.min(...x)-180,Math.min(...y)-130,Math.max(...x)-Math.min(...x)+360,Math.max(...y)-Math.min(...y)+290]}else box=home.slice();
 readingLinks(state);draw();
}
document.addEventListener('shared:selection',event=>renderSelection(event.detail));
document.addEventListener('shared:visibility',()=>{if(window.SharedMap.state.kind==='overview')status.textContent=svg.classList.contains('show-unsigned')?"Full map · 18 drivers · 41 connections":"Full map · 30 signed connections · 11 connections with unfixed polarity hidden";});
renderSelection(window.SharedMap.state);
function point(e){return new DOMPoint(e.clientX,e.clientY).matrixTransform(svg.getScreenCTM().inverse())}
svg.addEventListener('wheel',e=>{if(!e.ctrlKey&&!e.metaKey)return;e.preventDefault();const p=point(e);zoom(Math.exp(Math.max(-100,Math.min(100,e.deltaY))*.002),p.x,p.y)},{passive:false});
svg.addEventListener('pointerdown',e=>{if(e.button!==0)return;drag={id:e.pointerId,x:e.clientX,y:e.clientY,box:box.slice(),scale:svg.getScreenCTM().a,moved:false}});
svg.addEventListener('pointermove',e=>{if(!drag||drag.id!==e.pointerId)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(Math.hypot(dx,dy)>4){drag.moved=true;svg.setPointerCapture(e.pointerId);svg.classList.add('is-panning');box=[drag.box[0]-dx/drag.scale,drag.box[1]-dy/drag.scale,drag.box[2],drag.box[3]];draw()}});
function end(e){if(!drag||drag.id!==e.pointerId)return;if(drag.moved)suppress=Date.now()+250;drag=null;svg.classList.remove('is-panning');if(svg.hasPointerCapture(e.pointerId))svg.releasePointerCapture(e.pointerId)}svg.addEventListener('pointerup',end);svg.addEventListener('pointercancel',end);svg.addEventListener('click',e=>{if(Date.now()<suppress){e.stopImmediatePropagation();e.preventDefault()}},true);
svg.addEventListener('click',e=>{if(Date.now()<suppress)return;if(e.target===svg||e.target.id==='ddm-bg')window.SharedMap.reset()});
svg.tabIndex=0;svg.addEventListener('keydown',e=>{if(e.target!==svg)return;if(['+','=','-','0','ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key))e.preventDefault();if(e.key==='+'||e.key==='=')zoom(.75);else if(e.key==='-')zoom(1/.75);else if(e.key==='0'){window.SharedMap.reset()}else if(e.key.startsWith('Arrow')){const step=box[2]*.08;if(e.key==='ArrowLeft')box[0]-=step;if(e.key==='ArrowRight')box[0]+=step;if(e.key==='ArrowUp')box[1]-=step;if(e.key==='ArrowDown')box[1]+=step;draw()}});
new ResizeObserver(draw).observe(svg);new MutationObserver(()=>{cancelAnimationFrame(labelFrame);labelFrame=requestAnimationFrame(placeLabels)}).observe(document.getElementById('nodes'),{attributes:true,attributeFilter:['class'],subtree:true});draw();document.documentElement.dataset.sharedGraphReady='true';
const query=new URLSearchParams(location.search),requestedKind=query.get('selection'),requestedId=query.get('selectionId');
if(['node','edge','cascades','thresholds'].includes(requestedKind)&&requestedId)requestAnimationFrame(()=>DFViz.nav.go(requestedKind,requestedId,false));
})();
