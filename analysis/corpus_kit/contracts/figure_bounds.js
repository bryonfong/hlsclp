/* Keep complete labels and hover cards inside their visible figure. Graph data,
   node positions and the user's pan/zoom transform are never changed. */
(function () {
'use strict';
const inset=6;
function correction(rect,bounds,pad=inset){
 return {x:rect.left<bounds.left+pad?bounds.left+pad-rect.left:Math.min(0,bounds.right-pad-rect.right),
         y:rect.top<bounds.top+pad?bounds.top+pad-rect.top:Math.min(0,bounds.bottom-pad-rect.bottom)};
}
if(typeof module==='object'&&module.exports)module.exports={correction};
if(typeof document==='undefined')return;
const records=new WeakMap();let pending=false,observer;
function visibleBounds(svg){
 const r=svg.getBoundingClientRect();let b={left:Math.max(0,r.left),right:Math.min(innerWidth,r.right),top:Math.max(0,r.top),bottom:Math.min(innerHeight,r.bottom)};
 // A scrollable canvas may expose only part of a larger SVG.
 for(let p=svg.parentElement;p&&p!==document.body;p=p.parentElement){
  const s=getComputedStyle(p),q=p.getBoundingClientRect();
  if(/hidden|clip|auto|scroll/.test(s.overflowX)){b.left=Math.max(b.left,q.left+p.clientLeft);b.right=Math.min(b.right,q.left+p.clientLeft+p.clientWidth)}
  if(/hidden|clip|auto|scroll/.test(s.overflowY)){b.top=Math.max(b.top,q.top+p.clientTop);b.bottom=Math.min(b.bottom,q.top+p.clientTop+p.clientHeight)}
 }
 return b;
}
function fitText(text,bounds){
 const style=getComputedStyle(text);if(style.display==='none'||style.visibility==='hidden'||!text.getClientRects().length||!text.textContent.trim())return;
 const owner=text.closest('g.node,g.driver-node,g[role="button"]'),mark=owner?.querySelector('circle,rect');
 if(mark){const m=mark.getBoundingClientRect();if(m.right<bounds.left||m.left>bounds.right||m.bottom<bounds.top||m.top>bounds.bottom)return;}
 let rec=records.get(text),current=text.getAttribute('transform')||'';
 if(!rec){rec={base:current,applied:current,source:text.innerHTML,wrapped:null};records.set(text,rec)}
 if(current!==rec.applied)rec.base=current;
 if(rec.wrapped!==text.innerHTML){rec.source=text.innerHTML;rec.wrapped=null;}
 if(current!==rec.base)text.setAttribute('transform',rec.base);
 let r=text.getBoundingClientRect(),matrix=text.getScreenCTM();if(!matrix||r.width===0||r.height===0)return;
 // Keep deliberately panned-off annotations offscreen, rather than collecting
 // link signs and section headings along the frame edge.
 if(!mark&&(r.right<bounds.left||r.left>bounds.right||r.bottom<bounds.top||r.top>bounds.bottom))return;
 const available=bounds.right-bounds.left-2*inset;
 if(available<30)return;
 if(r.width>available){
  // Wrap complete words using the loaded font; never truncate a name to fit.
  const probe=document.createElementNS('http://www.w3.org/2000/svg','text');probe.innerHTML=rec.source;
  const value=probe.children.length?[...probe.children].map(t=>t.textContent).join(' '):probe.textContent;
  const canvas=document.createElement('canvas'),ctx=canvas.getContext('2d');ctx.font=style.font||`${style.fontSize} ${style.fontFamily}`;
  const limit=available/Math.hypot(matrix.a,matrix.b),lines=[];let line='';
  for(const word of value.split(/\s+/)){
   if(ctx.measureText(word).width>limit){
    if(line){lines.push(line);line='';}
    for(const char of word){if(line&&ctx.measureText(line+char).width>limit){lines.push(line);line='';}line+=char;}
   }else{const next=line?line+' '+word:word;if(line&&ctx.measureText(next).width>limit){lines.push(line);line=word}else line=next;}
  }
  if(line)lines.push(line);
  const x=text.querySelector('tspan')?.getAttribute('x')||text.getAttribute('x')||'0';
  probe.replaceChildren();lines.forEach((line,i)=>{const span=document.createElementNS(probe.namespaceURI,'tspan');span.setAttribute('x',x);span.setAttribute('dy',i?'1.15em':'0');span.textContent=line;probe.appendChild(span)});
  if(text.innerHTML!==probe.innerHTML)text.innerHTML=probe.innerHTML;
  rec.wrapped=text.innerHTML;r=text.getBoundingClientRect();
 }
 const delta=correction(r,bounds),inverse=matrix.inverse();
 const x=inverse.a*delta.x+inverse.c*delta.y,y=inverse.b*delta.x+inverse.d*delta.y;
 const result=rec.base+((Math.abs(x)+Math.abs(y))>.01?` translate(${x} ${y})`:'');
 if(text.getAttribute('transform')!==result)text.setAttribute('transform',result);
 rec.applied=result;
}
function fitTips(){
 document.querySelectorAll('#tip,#tooltip,.tooltip').forEach(tip=>{
  const s=getComputedStyle(tip);if(s.display==='none'||s.visibility==='hidden'||Number(s.opacity)===0)return;
  tip.style.maxWidth=`${Math.max(40,Math.min(280,innerWidth-2*inset))}px`;
  tip.style.maxHeight=`${Math.max(40,innerHeight-2*inset)}px`;tip.style.overflowWrap='anywhere';tip.style.overflowY='auto';tip.style.boxSizing='border-box';
  const r=tip.getBoundingClientRect(),d=correction(r,{left:0,top:0,right:innerWidth,bottom:innerHeight});
  if(d.x)tip.style.left=(parseFloat(s.left)||r.left)+d.x+'px';
  if(d.y)tip.style.top=(parseFloat(s.top)||r.top)+d.y+'px';
 });
}
function watch(){observer.observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['transform','class','style','x','y','r','viewBox','hidden']})}
function refresh(){
 pending=false;observer.disconnect();
 try{document.querySelectorAll('svg').forEach(svg=>{if(svg.ownerSVGElement)return;const b=visibleBounds(svg);if(b.right-b.left<30||b.bottom-b.top<30)return;svg.querySelectorAll('text').forEach(t=>fitText(t,b))});fitTips()}
 finally{watch()}
}
function schedule(){if(!pending){pending=true;requestAnimationFrame(refresh)}}
function setup(){
 if(document.documentElement.dataset.figureBounds)return;
 document.documentElement.dataset.figureBounds='measured';observer=new MutationObserver(schedule);watch();
 new ResizeObserver(schedule).observe(document.body);
 document.querySelectorAll('svg').forEach(svg=>new ResizeObserver(schedule).observe(svg));
 document.addEventListener('pointerover',schedule,true);document.addEventListener('pointermove',schedule,true);document.addEventListener('focusin',schedule,true);document.addEventListener('scroll',schedule,true);window.addEventListener('resize',schedule);
 if(document.fonts)document.fonts.ready.then(schedule);schedule();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setup);else setup();
})();
