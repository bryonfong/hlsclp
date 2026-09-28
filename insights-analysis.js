(function(){
'use strict';
// HIDDEN 2026-09-26: 'dynamics','scenarios' removed from this list to withhold those
// two lenses from view. Their panels, iframes and data are untouched in the markup —
// re-add the ids here (and un-comment the nav links) to bring them back.
const ids=['topics','actors'];
const links=[...document.querySelectorAll('[data-insights-view]')];
const frames=[...document.querySelectorAll('.analysis-figure')].filter(f=>ids.includes(f.id.replace('analysis-','')));
const stage=document.querySelector('.analysis-stage');
const watched=new WeakSet();let warmScheduled=false;
function alignDiagram(){
 const outer=document.querySelector('.analysis-panel:not([hidden]) iframe');if(!outer)return;
 let doc=outer.contentDocument;if(!doc)return;
 const nested=doc.querySelector('#dynamics-frame,#scenarios-frame');
 if(nested){if(!watched.has(nested)){watched.add(nested);nested.addEventListener('load',alignDiagram)}doc=nested.contentDocument}
 if(!doc)return;const svg=doc.querySelector('.viz-canvas svg,#stage svg');
 if(svg)svg.setAttribute('preserveAspectRatio','xMidYMin meet');
}
function theme(frame){
 const value=document.documentElement.dataset.theme||'light';
 try{if(frame.contentDocument)frame.contentDocument.documentElement.dataset.theme=value;frame.contentWindow.postMessage({kind:'df-theme',theme:value},location.origin)}catch(e){}
}
function load(frame){
 if(frame.getAttribute('src'))return;
 frame.parentElement.querySelector('.analysis-loading').hidden=false;
 const url=new URL(frame.dataset.src,location.href);url.searchParams.set('theme',document.documentElement.dataset.theme||'light');
 if(location.hostname==='visuals.dragonflythinking.com'||location.hostname.endsWith('.pages.dev'))url.pathname=url.pathname.replace(/\.html$/,'');
 frame.src=url.href;
}
function warmNext(){
 if(navigator.connection?.saveData)return;
 const pending=frames.find(f=>f.getAttribute('src')&&f.dataset.ready!=='true');
 if(pending){pending.addEventListener('load',scheduleWarm,{once:true});return}
 const next=frames.find(f=>!f.getAttribute('src'));if(next){next.addEventListener('load',scheduleWarm,{once:true});load(next)}
}
function scheduleWarm(){if(warmScheduled)return;warmScheduled=true;const idle=window.requestIdleCallback||((fn)=>setTimeout(fn,200));idle(()=>{warmScheduled=false;warmNext()},{timeout:1500})}
frames.forEach(frame=>frame.addEventListener('load',()=>{
 if(!frame.getAttribute('src')||frame.contentDocument?.URL==='about:blank')return;
 frame.dataset.ready='true';frame.parentElement.querySelector('.analysis-loading').hidden=true;theme(frame);alignDiagram();scheduleWarm();
}));
function resize(){stage.style.setProperty('--analysis-top',Math.round(stage.getBoundingClientRect().top+scrollY)+'px')}
function select(value,updateHash){
 const id=ids.includes(value)?value:'topics';
 ids.forEach(key=>{const panel=document.getElementById('panel-'+key);panel.hidden=key!==id;panel.inert=key!==id});
 links.forEach(link=>{if(link.dataset.insightsView===id)link.setAttribute('aria-current','page');else link.removeAttribute('aria-current')});
 const title=id==='topics'?'Topic map':id.charAt(0).toUpperCase()+id.slice(1);document.querySelector('.analysis-heading').textContent=title;document.title=title+' — Insights · AI & the Legal Profession';
 document.documentElement.dataset.analysisTab=id;
 const frame=document.getElementById('analysis-'+id);load(frame);theme(frame);alignDiagram();resize();
 if(updateHash&&location.hash!=='#'+id)history.pushState(null,'','#'+id);
}
links.filter(link=>ids.includes(link.dataset.insightsView)).forEach(link=>{
 link.addEventListener('click',event=>{if(event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;event.preventDefault();select(link.dataset.insightsView,true)});
 const prepare=()=>load(document.getElementById('analysis-'+link.dataset.insightsView));link.addEventListener('pointerenter',prepare,{once:true});link.addEventListener('focus',prepare,{once:true});
});
window.addEventListener('hashchange',()=>select(location.hash.slice(1),false));
window.addEventListener('resize',resize);
new MutationObserver(()=>frames.forEach(theme)).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
select(location.hash.slice(1),false);
})();
