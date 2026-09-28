(function(){
'use strict';
const DATA=JSON.parse(document.getElementById('visual-suite-data').textContent),host=document.querySelector('[data-visual-host]');
const prefix=window.DF_VISUAL_SUITE_ASSET_PREFIX||'',frames=new Map();
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
host.innerHTML=DATA.navigation.map((row,i)=>'<iframe id="figure-'+esc(row.id)+'" '+(i?'data-src':'src')+'="'+esc(row.href)+'" data-visual="'+esc(row.id)+'" title="'+esc(row.label)+'" aria-hidden="'+(i?'true':'false')+'"'+(i?' tabindex="-1"':' class="is-active"')+'></iframe>').join('')+'<div class="visual-suite-loading" role="status">Loading visualisation…</div>';
const loading=host.querySelector('.visual-suite-loading');let active=DATA.navigation[0].id;
window.DF_CHROME={defaultTheme:'light',brand:{href:'index.html',label:'Dragonfly Thinking',logoBlack:prefix+'visual-library/assets/logos/dt-logo-black.webp',logoWhite:prefix+'visual-library/assets/logos/dt-logo-white.webp'},family:{name:DATA.title},meta:[{label:'Exploration · visualisations'}],tabs:DATA.navigation.map((row,i)=>({tab:row.id,num:i+1,name:row.label,href:'#'+row.id}))};
document.body.dataset.tab=active;
function theme(frame){
  const value=document.documentElement.dataset.theme||'light';
  try{frame.contentWindow.postMessage({kind:'df-theme',theme:value},location.origin)}catch(e){}
  try{if(frame.contentDocument)frame.contentDocument.documentElement.dataset.theme=value}catch(e){}
}
function load(frame){if(!frame.getAttribute('src'))frame.setAttribute('src',frame.dataset.src)}
function ready(frame){frame.dataset.ready='true';if(frame.dataset.visual===active)loading.hidden=true;theme(frame)}
host.querySelectorAll('iframe').forEach(frame=>{frames.set(frame.dataset.visual,frame);frame.addEventListener('load',()=>ready(frame));});
function select(id){const frame=frames.get(id);if(!frame)return false;active=id;document.body.dataset.tab=id;document.title=(DATA.navigation.find(r=>r.id===id)?.label||DATA.title)+' — '+DATA.title;frames.forEach((candidate,key)=>{const on=key===id;candidate.classList.toggle('is-active',on);candidate.setAttribute('aria-hidden',String(!on));candidate.tabIndex=on?0:-1});document.querySelectorAll('.tab-btn[data-tab]').forEach(tab=>{const on=tab.dataset.tab===id;tab.classList.toggle('active',on);if(on)tab.setAttribute('aria-current','page');else tab.removeAttribute('aria-current')});loading.hidden=frame.dataset.ready==='true';if(!loading.hidden)loading.textContent='Loading '+id+'…';load(frame);theme(frame);return true}
document.addEventListener('click',event=>{const tab=event.target.closest('.tab-btn[data-tab]');if(tab&&frames.has(tab.dataset.tab)){event.preventDefault();select(tab.dataset.tab)}},true);
document.addEventListener('themechange',()=>frames.forEach(theme));
new MutationObserver(records=>{
  if(records.some(record=>record.attributeName==='data-theme'))frames.forEach(theme);
}).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
const warm=DATA.navigation.slice(1).map(row=>row.id);function warmNext(){const id=warm.shift();if(!id)return;const frame=frames.get(id);load(frame);if(frame.dataset.ready==='true')setTimeout(warmNext,200);else frame.addEventListener('load',()=>setTimeout(warmNext,200),{once:true})}
window.addEventListener('load',()=>{const idle=window.requestIdleCallback||function(cb){setTimeout(cb,250)};idle(warmNext,{timeout:1500})},{once:true});
window.DFVisualSuite={select,getState:()=>({active,frames:Object.fromEntries([...frames].map(([id,frame])=>[id,{ready:frame.dataset.ready==='true',src:frame.getAttribute('src')}]))})};
document.documentElement.dataset.visualSuiteReady='true';
})();
