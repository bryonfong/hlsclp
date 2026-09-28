/* Shared display groups: straight lines aggregate measured actor-pair associations. */
(function(global){
  'use strict';
  const WIDTH=1100,HEIGHT=780;
  function wrap(label){const out=[];let line='';String(label).split(/\s+/).forEach(word=>{if(line&&line.length+word.length+1>22){out.push(line);line=word;}else line+=(line?' ':'')+word;});if(line)out.push(line);return out;}
  function placeLabels(nodes){
    const boxes=[];
    for(const n of nodes.slice().sort((a,b)=>b.label.length-a.label.length||a.id.localeCompare(b.id))){
      n.lines=wrap(n.label);n.labelWidth=Math.max(...n.lines.map(s=>s.length*7.4))+8;n.labelHeight=n.lines.length*16+5;
      let best=null,cost=Infinity;
      function consider(x,y){const b={x:x-n.labelWidth/2,y:y-12,w:n.labelWidth,h:n.labelHeight};
        if(b.x<8||b.x+b.w>WIDTH-8||b.y<8||b.y+b.h>HEIGHT-8)return;
        if(boxes.some(o=>b.x<o.x+o.w+5&&b.x+b.w+5>o.x&&b.y<o.y+o.h+5&&b.y+b.h+5>o.y))return;
        if(nodes.some(o=>b.x<o.x+18&&b.x+b.w>o.x-18&&b.y<o.y+18&&b.y+b.h>o.y-18))return;
        const c=(x-n.x)**2+(y-n.y-36)**2;if(c<cost){best={x,y,b};cost=c;}}
      consider(n.x,n.y+36);
      for(let r=28;r<600;r+=12){for(let a=0;a<Math.PI*2;a+=Math.PI/12)consider(n.x+Math.cos(a)*r,n.y+Math.sin(a)*r);if(best&&r*r>cost+5000)break;}
      if(!best)throw new Error('No readable group label position: '+n.id);
      n.labelX=best.x-n.x;n.labelY=best.y-n.y;n.labelBox=best.b;boxes.push(best.b);
    }
  }
  function prepare({projection,taxonomy,positions}){
    if(!positions||!taxonomy?.groups_by_id||!taxonomy?.actor_group_by_id)throw new Error('Group map requires shared positions and a display taxonomy.');
    const groups={},relationships={};
    for(const [id,g] of Object.entries(taxonomy.groups_by_id).sort(([a],[b])=>a.localeCompare(b))){
      if(!Number.isInteger(g.color_index)||g.color_index<0||g.color_index>13)throw new Error('Invalid group colour: '+id);
      groups[id]={...g,id,actor_ids:[...(g.actor_ids||[])],internal_association_ids:[]};
    }
    for(const [actor,id] of Object.entries(taxonomy.actor_group_by_id))if(!groups[id])throw new Error('Unknown primary group for '+actor);
    const seen=new Set();
    for(const a of Object.values(projection.associations_by_id||{})){
      if(seen.has(a.id))continue;seen.add(a.id);
      const source=taxonomy.actor_group_by_id[a.source],target=taxonomy.actor_group_by_id[a.target];
      if(!source||!target)throw new Error('Missing primary group for association '+a.id);
      if(source===target){groups[source].internal_association_ids.push(a.id);continue;}
      const pair=[source,target].sort(),id='group-edge:'+pair.join('|');
      if(!relationships[id])relationships[id]={id,source:pair[0],target:pair[1],kind:'aggregated-co-mention-association',association_ids:[],count:0};
      relationships[id].association_ids.push(a.id);
    }
    Object.values(relationships).forEach(r=>{r.association_ids.sort();r.count=r.association_ids.length;});
    Object.values(groups).forEach(g=>g.internal_association_ids.sort());
    const nodes=Object.values(groups).map(g=>({...g,positionKey:'group:'+g.id,r:13}));
    // Core positions are established by the shared strategic layer before this layer.
    for(const n of nodes.filter(n=>n.core_group_id)){
      if(!positions[n.positionKey])throw new Error('Missing shared core group position: '+n.id);
      Object.assign(n,positions[n.positionKey]);
    }
    const occupied=nodes.filter(n=>positions[n.positionKey]).map(n=>positions[n.positionKey]);
    for(const n of nodes){
      if(!positions[n.positionKey]){
        let best=null,score=-Infinity;
        for(let y=65;y<HEIGHT-75;y+=35)for(let x=80;x<WIDTH-80;x+=35){
          const clearance=occupied.length?Math.min(...occupied.map(p=>Math.hypot(x-p.x,y-p.y))):200;
          const value=clearance-.035*Math.hypot(x-WIDTH/2,y-HEIGHT/2);
          if(value>score){best={x,y};score=value;}}
        const hash=[...n.id].reduce((h,c)=>((h*31+c.charCodeAt(0))>>>0),12);
        best.x+=((hash%31)-15);best.y+=(((hash>>>8)%31)-15);
        positions[n.positionKey]=best;occupied.push(best);
      }
      Object.assign(n,positions[n.positionKey]);
    }
    placeLabels(nodes);
    const byId=new Map(nodes.map(n=>[n.id,n]));
    const edges=Object.values(relationships).map(r=>({...r,sourceNode:byId.get(r.source),targetNode:byId.get(r.target)}));
    edges.sort((a,b)=>edgeLength(b)-edgeLength(a)||a.id.localeCompare(b.id));
    fanAttachmentPoints(nodes,edges);
    return {groups,relationships,nodes,edges,byId,associationCount:seen.size};
  }
  function edgePath(r){const p=segment(r);return `M${p.x1},${p.y1}L${p.x2},${p.y2}`;}
  function edgeLength(r){return Math.hypot(r.sourceNode.x-r.targetNode.x,r.sourceNode.y-r.targetNode.y);}
  function segment(r){
    const a=r.sourceNode,b=r.targetNode,d=Math.max(1,edgeLength(r)),ux=(b.x-a.x)/d,uy=(b.y-a.y)/d;
    // Each end sits on the diamond perimeter. Small angular offsets separate
    // otherwise collinear links while the visible connection stays straight.
    const start=r.startAngle||0,end=r.endAngle||0;
    function port(n,x,y,angle){const ca=Math.cos(angle),sa=Math.sin(angle),dx=x*ca-y*sa,dy=x*sa+y*ca,k=13/(Math.abs(dx)+Math.abs(dy));return {x:n.x+dx*k,y:n.y+dy*k};}
    const p=port(a,ux,uy,start),q=port(b,-ux,-uy,end);
    return {x1:p.x,y1:p.y,x2:q.x,y2:q.y};
  }
  function fanAttachmentPoints(nodes,edges){
    const later=[];
    for(let i=edges.length-1;i>=0;i--){const r=edges[i];let best=exposedPoints(r,nodes,later).length,chosen=[0,0];
      if(best<8){for(const a of [0,.45,-.45,.9,-.9,1.2,-1.2]){for(const b of [0,-a,a,.9,-.9,1.2,-1.2]){r.startAngle=a;r.endAngle=b;const count=exposedPoints(r,nodes,later).length;if(count>best){best=count;chosen=[a,b];}if(best>=8)break;}if(best>=8)break;}}
      [r.startAngle,r.endAngle]=chosen;later.push(r);
    }
  }
  function exposedPoints(r,nodes,laterEdges){
    const s=segment(r),later=laterEdges.map(segment),out=[];
    for(let i=2;i<199;i++){const t=i/200,x=s.x1+(s.x2-s.x1)*t,y=s.y1+(s.y2-s.y1)*t;
      if(nodes.some(n=>{const b=n.labelBox;return Math.abs(x-n.x)<=17&&Math.abs(y-n.y)<=17||b&&x>=b.x-1&&x<=b.x+b.w+1&&y>=b.y-1&&y<=b.y+b.h+1;}))continue;
      if(later.some(p=>{if(x<Math.min(p.x1,p.x2)-5||x>Math.max(p.x1,p.x2)+5||y<Math.min(p.y1,p.y2)-5||y>Math.max(p.y1,p.y2)+5)return false;const dx=p.x2-p.x1,dy=p.y2-p.y1,d=dx*dx+dy*dy,u=d?Math.max(0,Math.min(1,((x-p.x1)*dx+(y-p.y1)*dy)/d)):0;return (x-p.x1-dx*u)**2+(y-p.y1-dy*u)**2<=25;}))continue;
      out.push({x,y});
    }
    return out;
  }
  function installStyles(){
    if(document.getElementById('actor-group-map-styles'))return;
    const s=document.createElement('style');s.id='actor-group-map-styles';s.textContent=`
      .actor-group-network{--group-bg:var(--bg);--group-ink:var(--df-ink,var(--ink))}
      .actor-group-line{fill:none;stroke:var(--soft);stroke-width:1.2;opacity:.32;pointer-events:none}
      .actor-group-edge-hit{fill:none;stroke:transparent;stroke-width:9;pointer-events:stroke;cursor:pointer;outline:none}
      .actor-group-edge.is-muted .actor-group-line{opacity:.055}
      .actor-group-edge.is-incident .actor-group-line{stroke:var(--accent);opacity:.8;stroke-width:2}
      .actor-group-edge.is-selected .actor-group-line,.actor-group-edge.is-hover .actor-group-line{stroke:var(--accent);opacity:1;stroke-width:3}
      .actor-group-node{cursor:pointer;outline:none}.actor-group-node.is-muted{opacity:.3}
      .actor-group-diamond{fill:var(--node-colour);stroke:var(--group-bg);stroke-width:2}
      .actor-group-node.is-selected .actor-group-diamond,.actor-group-node:focus .actor-group-diamond{stroke:var(--group-ink);stroke-width:3}
      .actor-group-label{font:650 14px var(--df-font,'IBM Plex Sans',sans-serif);text-anchor:middle;fill:var(--group-ink);stroke:var(--group-bg);stroke-width:4;paint-order:stroke;stroke-linejoin:round;pointer-events:none}
    `;document.head.appendChild(s);
  }
  function create({projection,taxonomy,layout,root,onGroup,onRelationship}){
    const d3=global.d3;if(!d3||!root||!layout)throw new Error('Group map requires D3, graph root and shared layout.');
    installStyles();const network=prepare({projection,taxonomy,positions:layout.positions});layout.remember?.();
    const {nodes,edges,groups,relationships}=network;
    const layer=d3.select(root).append('g').attr('class','actor-group-network').attr('data-actor-group-map','true').style('display','none');
    const es=layer.append('g').attr('class','actor-group-edges').selectAll('g').data(edges,r=>r.id).join('g').attr('class','actor-group-edge');
    es.append('path').attr('class','actor-group-line');
    const hits=es.append('path').attr('class','actor-group-edge-hit').attr('data-group-relationship',r=>r.id).attr('role','button').attr('tabindex',0).attr('aria-label',edgeLabel);
    hits.append('title').text(edgeLabel);
    const ns=layer.append('g').attr('class','actor-group-nodes').selectAll('g').data(nodes,n=>n.id).join('g').attr('class','actor-group-node').attr('data-actor-group',n=>n.id).attr('role','button').attr('tabindex',0).attr('aria-label',nodeLabel).style('--node-colour',n=>'var(--c'+n.color_index+')');
    ns.append('rect').attr('x',-16).attr('y',-16).attr('width',32).attr('height',32).attr('fill','transparent').attr('pointer-events','all');
    ns.append('path').attr('class','actor-group-diamond').attr('d','M0,-13L13,0L0,13L-13,0Z');
    ns.append('line').attr('class','actor-group-leader').attr('stroke','var(--soft)').attr('stroke-width',.7).attr('pointer-events','none');
    ns.append('rect').attr('class','actor-group-label-hit').attr('fill','transparent').attr('pointer-events','all');
    ns.append('text').attr('class','actor-group-label').each(function(n){n.lines.forEach((line,i)=>d3.select(this).append('tspan').attr('dy',i?'1.14em':0).text(line));});
    ns.append('title').text(nodeLabel);
    function edgeLabel(r){return groups[r.source].label+' — '+groups[r.target].label+' · '+r.count+' actor-pair association'+(r.count===1?'':'s');}
    function nodeLabel(n){return n.label+' · '+n.actor_ids.length+' named actor'+(n.actor_ids.length===1?'':'s')+' assigned to this group'+(!n.actor_ids.length?' · Collective group; no measured named members':'');}
    function hideTip(){const t=document.getElementById('tip');if(t)t.style.display='none';}
    function tooltip(ev,text,el){const t=document.getElementById('tip');if(!t)return;t.textContent=text;t.style.display='block';const b=el.getBoundingClientRect(),x=ev.type==='focus'?b.x+b.width/2:ev.clientX,y=ev.type==='focus'?b.y+b.height/2:ev.clientY;t.style.left=Math.max(8,Math.min(innerWidth-t.offsetWidth-8,x+12))+'px';t.style.top=Math.max(8,Math.min(innerHeight-t.offsetHeight-8,y+12))+'px';}
    function activate(ev,callback,id){if(ev.type==='keydown'&&!['Enter',' '].includes(ev.key))return;ev.preventDefault();ev.stopPropagation();hideTip();callback?.(id);}
    hits.on('click keydown',(ev,r)=>activate(ev,onRelationship,r.id)).on('mouseenter focus',function(ev,r){d3.select(this.parentNode).classed('is-hover',true);tooltip(ev,edgeLabel(r),this);}).on('mousemove',function(ev,r){tooltip(ev,edgeLabel(r),this);}).on('mouseleave blur',function(){d3.select(this.parentNode).classed('is-hover',false);hideTip();});
    ns.on('click keydown',(ev,n)=>activate(ev,onGroup,n.id)).on('mouseenter focus',function(ev,n){tooltip(ev,nodeLabel(n),this);}).on('mouseleave blur',hideTip).call(d3.drag().clickDistance(5).on('start',hideTip).on('drag',(ev,n)=>{layout.set(n.positionKey,{x:Math.max(28,Math.min(WIDTH-28,ev.x)),y:Math.max(28,Math.min(HEIGHT-28,ev.y))});paint();}));
    function paint(){nodes.forEach(n=>Object.assign(n,layout.positions[n.positionKey]));ns.attr('transform',n=>`translate(${n.x},${n.y})`);es.selectAll('path').attr('d',edgePath);}
    function label(){ns.select('text').attr('x',n=>n.labelX).attr('y',n=>n.labelY).selectAll('tspan').attr('x',n=>n.labelX);ns.select('.actor-group-label-hit').attr('x',n=>n.labelX-n.labelWidth/2).attr('y',n=>n.labelY-12).attr('width',n=>n.labelWidth).attr('height',n=>n.labelHeight);ns.select('.actor-group-leader').attr('x1',n=>n.labelX/Math.max(1,Math.hypot(n.labelX,n.labelY))*16).attr('y1',n=>n.labelY/Math.max(1,Math.hypot(n.labelX,n.labelY))*16).attr('x2',n=>n.labelX).attr('y2',n=>n.labelY-8);}
    function refresh({visible=false,selection={kind:'overview'}}={}){
      layer.style('display',visible?null:'none').attr('aria-hidden',String(!visible));if(!visible){hideTip();return;}paint();
      const chosen=relationships[selection.id],node=groups[selection.id],focused=new Set(chosen?[chosen.source,chosen.target]:node?[node.id]:[]);
      const incident=new Set(edges.filter(r=>chosen?r.id===chosen.id:focused.has(r.source)||focused.has(r.target)).map(r=>r.id)),neighbours=new Set(focused);edges.filter(r=>incident.has(r.id)).forEach(r=>{neighbours.add(r.source);neighbours.add(r.target);});
      es.classed('is-selected',r=>r.id===chosen?.id).classed('is-incident',r=>incident.has(r.id)).classed('is-muted',r=>focused.size>0&&!incident.has(r.id));hits.attr('aria-pressed',r=>String(r.id===chosen?.id));
      ns.classed('is-selected',n=>focused.has(n.id)).classed('is-muted',n=>focused.size>0&&!neighbours.has(n.id)).attr('aria-pressed',n=>String(focused.has(n.id)));
    }
    label();paint();document.addEventListener('df-actor-layout-changed',paint);
    return {refresh,groups,relationships};
  }
  global.DFActorGroups={create,prepare,edgePath,exposedPoints};
})(window);
