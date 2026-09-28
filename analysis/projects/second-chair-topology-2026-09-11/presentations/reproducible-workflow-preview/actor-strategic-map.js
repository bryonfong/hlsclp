/* One shared actor layout; authored relationships remain distinct from measured co-mentions. */
(function (global) {
  'use strict';
  const WIDTH = 1100, HEIGHT = 780;
  const GROUP_LABELS = {'A-08':'Venture investors','A-09':'Corporate buyers','A-10':'Large firms','A-15':'AI-native providers','A-16':'Junior workforce','A-17':'Legal education','A-23':'Legal consumers','A-24':'Insurers','A-28':'Courts','A-33':'Private equity'};
  const ANCHORS = {
    'foundation-model':[440,125], 'vendor-legal-ai':[425,360], 'incumbent-publisher':[220,205],
    'incumbent-firm':[210,520], 'client-inhouse':[200,650], 'capital':[120,300],
    'ai-native-firm':[710,520], 'alsp':[475,655], 'big-four':[560,650],
    'regulator-court':[905,205], 'a2j':[885,485], 'academy':[865,650],
    'individual':[680,680], 'analyst-press':[655,155]
  };
  const GROUP_ANCHORS = {'A-08':[160,125],'A-09':[330,675],'A-10':[135,520],'A-15':[685,545],'A-16':[485,560],'A-17':[835,680],'A-23':[1000,510],'A-24':[560,150],'A-28':[1000,310],'A-33':[105,375]};
  function key(endpoint) { return endpoint.kind + ':' + endpoint.id; }
  function lines(label, max = 21) {
    const result = []; let line = '';
    String(label).split(/\s+/).forEach(word => {if (line && line.length + word.length + 1 > max) { result.push(line); line = word; } else line += (line ? ' ' : '') + word;});
    if (line) result.push(line);
    return result;
  }
  function installStyles() {
    if (document.getElementById('depth-strategic-map-styles')) return;
    const style = document.createElement('style'); style.id = 'depth-strategic-map-styles';
    style.textContent = `
      .depth-strategic-network{--strategic-ink:var(--df-ink,var(--ink));--strategic-accent:var(--accent);--strategic-bg:var(--bg)}
      .depth-strategic-line{fill:none;stroke:var(--soft);stroke-width:1.25;opacity:.42;pointer-events:none}
      .depth-strategic-line.is-inference{stroke-dasharray:5 4;opacity:.38}
      .depth-strategic-hit{fill:none;stroke:transparent;stroke-width:11;cursor:pointer;pointer-events:stroke;outline:none}
      .depth-strategic-edge.is-muted .depth-strategic-line{opacity:.09}
      .depth-strategic-edge.is-incident .depth-strategic-line{stroke:var(--strategic-accent);stroke-width:2;opacity:.8}
      .depth-strategic-edge.is-selected .depth-strategic-line,.depth-strategic-edge.is-hover .depth-strategic-line{stroke:var(--strategic-accent);stroke-width:3.5;opacity:1}
      .depth-strategic-node{cursor:pointer;outline:none}
      .depth-strategic-node .depth-strategic-shape{fill:var(--node-colour,var(--accent));stroke:var(--strategic-bg);stroke-width:1.5}
      .depth-strategic-node.is-group .depth-strategic-shape{fill:var(--node-colour,var(--accent));stroke:var(--strategic-bg);stroke-width:2}
      .depth-strategic-node.is-curated .depth-strategic-shape{fill:var(--surface);stroke:var(--node-colour,var(--accent));stroke-width:2;stroke-dasharray:3 2}
      .depth-strategic-network[data-coverage=whole] .depth-strategic-node:not(.whole-label):not(.is-selected):not(:hover):not(:focus) .depth-strategic-label,
      .depth-strategic-network[data-coverage=whole] .depth-strategic-node:not(.whole-label):not(.is-selected):not(:hover):not(:focus) .depth-strategic-label-leader,
      .depth-strategic-network[data-coverage=whole] .depth-strategic-node:not(.whole-label):not(.is-selected):not(:hover):not(:focus) .depth-strategic-label-hit{display:none}
      .depth-strategic-node.is-muted{opacity:.35}
      .depth-strategic-node.is-selected .depth-strategic-shape,.depth-strategic-node:focus .depth-strategic-shape{stroke:var(--strategic-ink);stroke-width:3}
      .depth-strategic-label{fill:var(--strategic-ink);font:14px/1.1 var(--df-font,'IBM Plex Sans',sans-serif);text-anchor:middle;paint-order:stroke;stroke:var(--strategic-bg);stroke-width:4;stroke-linejoin:round;pointer-events:none}
      .depth-strategic-node.is-group .depth-strategic-label{font-weight:650}
      .depth-strategic-node.is-selected .depth-strategic-label{font-weight:700}
    `;
    document.head.appendChild(style);
  }
  function prepareNetwork({projection,depth,positions}) {
    if (!positions) throw new Error('Strategic map requires the whole-map positions.');
    const classes = Object.keys(projection.classes_by_id || {}).sort();
    const nodes = [
      ...Object.keys(depth.entities_by_id).sort().map(id => ({id,kind:'entity',label:id,classId:projection.actors_by_id[id]?.visibility?.class_id || depth.curated_entities_by_id?.[id]?.class_id,curated:!!depth.curated_entities_by_id?.[id]})),
      ...Object.keys(depth.groups_by_id).sort().map(id => ({id,kind:'group',label:GROUP_LABELS[id] || depth.groups_by_id[id].name,fullName:depth.groups_by_id[id].name}))
    ].map(n=>({...n,key:key(n),r:n.kind==='group'?13:n.curated?11:25,lines:lines(n.label)}));
    const occupied=Object.values(positions).map(p=>({x:p.x,y:p.y}));
    for(const n of nodes){
      const positionKey=n.kind==='group'?n.key:n.id;
      if(!positions[positionKey]){
        if(!n.curated && n.kind!=='group') throw new Error('Missing whole-map position for '+n.id);
        const anchor=(n.kind==='group'?GROUP_ANCHORS[n.id]:ANCHORS[n.classId]) || [550,390];
        let best=null,cost=Infinity;
        for(let y=35;y<HEIGHT-35;y+=14)for(let x=35;x<WIDTH-35;x+=14){
          const clearance=Math.min(...occupied.map(p=>Math.hypot(x-p.x,y-p.y)));
          if(clearance<30)continue;
          const candidate=(x-anchor[0])**2+(y-anchor[1])**2-clearance*25;
          if(candidate<cost){best={x,y};cost=candidate;}
        }
        if(!best)throw new Error('No clear position for authored map supplement '+n.id);
        positions[positionKey]=best;occupied.push(best);
      }
      n.positionKey=positionKey;Object.assign(n,positions[positionKey]);
    }
    const byKey=new Map(nodes.map(n=>[n.key,n]));
    const relations=Object.values(depth.relationships_by_id).sort((a,b)=>a.id.localeCompare(b.id)).map(r=>({...r,source:byKey.get(key(r.source)),target:byKey.get(key(r.target))}));
    if(relations.some(r=>!r.source || !r.target))throw new Error('A strategic relationship has an endpoint outside the strategic core.');
    const pairs=new Map();
    relations.forEach(r=>{const pair=[r.source.key,r.target.key].sort().join('|');if(!pairs.has(pair))pairs.set(pair,[]);pairs.get(pair).push(r);});
    pairs.forEach(rows=>rows.forEach((r,i)=>{r.curve=(i-(rows.length-1)/2)*42+(rows.length===1?12:0);r.canonicalSign=r.source.key<r.target.key?1:-1;}));
    placeLabels(nodes);
    routeForPointers(nodes,relations);
    const initialPositions=new Map(nodes.map(n=>[n.key,{x:n.x,y:n.y}]));
    return {classes,nodes,byKey,relations,initialPositions};
  }
  function placeLabels(nodes){
    const placed=[];
    // Labels can move around an anchor; actors never move to fit a core-only layout.
    for(const n of nodes.slice().sort((a,b)=>b.lines.join('').length-a.lines.join('').length||a.key.localeCompare(b.key))){
      n.labelWidth=Math.max(...n.lines.map(s=>s.length*7.4))+6;n.labelHeight=n.lines.length*15+5;
      let best=null,bestCost=Infinity;
      function consider(x,y){
        const box={x:x-n.labelWidth/2,y:y-12,w:n.labelWidth,h:n.labelHeight};
        if(box.x<8||box.x+box.w>WIDTH-8||box.y<8||box.y+box.h>HEIGHT-8)return;
        if(placed.some(b=>box.x<b.x+b.w+4&&box.x+box.w+4>b.x&&box.y<b.y+b.h+3&&box.y+box.h+3>b.y))return;
        if(nodes.some(a=>box.x<a.x+a.r+5&&box.x+box.w>a.x-a.r-5&&box.y<a.y+a.r+5&&box.y+box.h>a.y-a.r-5))return;
        const cost=(x-n.x)**2+(y-(n.y+40))**2;
        if(cost<bestCost){best={x,y,box};bestCost=cost;}
      }
      consider(n.x,n.y+43);
      for(let radius=28;radius<500;radius+=12){
        for(let angle=0;angle<Math.PI*2;angle+=Math.PI/12)consider(n.x+Math.cos(angle)*radius,n.y+Math.sin(angle)*radius);
        if(best&&radius*radius>bestCost+10000)break;
      }
      if(!best)throw new Error('No readable label placement for '+n.id);
      n.labelX=best.x-n.x;n.labelY=best.y-n.y;n.labelBox=best.box;placed.push(best.box);
    }
  }
  function edgePath(r){
      const a=r.source,b=r.target,dx=b.x-a.x,dy=b.y-a.y,dist=Math.max(1,Math.hypot(dx,dy));
      const bend=r.curve*r.canonicalSign,cx=(a.x+b.x)/2-dy/dist*bend,cy=(a.y+b.y)/2+dx/dist*bend;
      const startLength=Math.max(1,Math.hypot(cx-a.x,cy-a.y)),endLength=Math.max(1,Math.hypot(b.x-cx,b.y-cy));
      const start=a.r+3,end=b.r+7;
      return `M${a.x+(cx-a.x)/startLength*start},${a.y+(cy-a.y)/startLength*start}Q${cx},${cy} ${b.x-(b.x-cx)/endLength*end},${b.y-(b.y-cy)/endLength*end}`;
    }
  function pathPoints(relation,steps=80){
    const coords=edgePath(relation).match(/-?\d+(?:\.\d+)?(?:e[+-]?\d+)?/gi).map(Number),points=[];
    for(let i=0;i<=steps;i++){const t=i/steps,u=1-t;points.push([u*u*coords[0]+2*u*t*coords[2]+t*t*coords[4],u*u*coords[1]+2*u*t*coords[3]+t*t*coords[5]]);}
    points.bounds={left:Math.min(...points.map(p=>p[0]))-6,right:Math.max(...points.map(p=>p[0]))+6,top:Math.min(...points.map(p=>p[1]))-6,bottom:Math.max(...points.map(p=>p[1]))+6};
    return points;
  }
  function distanceToSegmentSquared(point,a,b){const dx=b[0]-a[0],dy=b[1]-a[1],den=dx*dx+dy*dy,t=den?Math.max(0,Math.min(1,((point[0]-a[0])*dx+(point[1]-a[1])*dy)/den)):0;return (point[0]-a[0]-t*dx)**2+(point[1]-a[1]-t*dy)**2;}
  function exposedPathPoints(relation,nodes,laterPaths){
    return pathPoints(relation).slice(2,-2).filter(point=>{
      if(point[0]<12||point[0]>WIDTH-12||point[1]<12||point[1]>HEIGHT-12)return false;
      // Conservative union of node hit areas across every metric circle size.
      if(nodes.some(n=>{const dx=point[0]-n.x,dy=point[1]-n.y,r=n.kind==='group'?13:n.curated?11:25,b=n.labelBox;return Math.abs(dx)<=r+3&&Math.abs(dy)<=r+5||b&&point[0]>=b.x-3&&point[0]<=b.x+b.w+3&&point[1]>=b.y-3&&point[1]<=b.y+b.h+3;}))return false;
      return !laterPaths.some(path=>{
        const bounds=path.bounds;if(point[0]<bounds.left||point[0]>bounds.right||point[1]<bounds.top||point[1]>bounds.bottom)return false;
        return path.some((a,i)=>{if(!i)return false;const b=path[i-1];return point[0]>=Math.min(a[0],b[0])-6&&point[0]<=Math.max(a[0],b[0])+6&&point[1]>=Math.min(a[1],b[1])-6&&point[1]<=Math.max(a[1],b[1])+6&&distanceToSegmentSquared(point,b,a)<=36;});
      });
    }).length;
  }
  function routeForPointers(nodes,relations){
    const laterPaths=[];
    // Work from the front of the SVG stack backwards: rerouting an earlier
    // edge cannot cover the selectable segment of an already checked edge.
    for(let i=relations.length-1;i>=0;i--){
      const relation=relations[i],original=relation.curve;
      let bestCurve=original,bestCount=exposedPathPoints(relation,nodes,laterPaths);
      if(bestCount<8){
        const sign=[...relation.id].reduce((sum,c)=>sum+c.charCodeAt(0),0)%2?1:-1;
        for(const offset of [32,-32,64,-64,100,-100,150,-150,210,-210,280,-280,360,-360,440,-440,540,-540,660,-660]){
          relation.curve=original+offset*sign;
          const count=exposedPathPoints(relation,nodes,laterPaths);
          if(count>bestCount){bestCount=count;bestCurve=relation.curve;}
          if(bestCount>=8)break;
        }
      }
      relation.curve=bestCurve;
      laterPaths.push(pathPoints(relation));
    }
  }
  function create({ projection, depth, root, layout = global.DFActorLayout, metricsById = {}, onActor, onGroup, onRelationship }) {
    const d3 = global.d3;
    if (!d3 || !root || !depth) throw new Error('Strategic map requires D3, a graph root and actor depth data.');
    installStyles();
    const {classes,nodes,byKey,relations,initialPositions}=prepareNetwork({projection,depth,positions:layout?.positions});
    layout.remember();
    const layer=d3.select(root).append('g').attr('class','depth-strategic-network').attr('data-strategic-map','true').style('display','none');
    const markerId='depth-strategic-arrow';
    layer.append('defs').append('marker').attr('id',markerId).attr('viewBox','0 -4 8 8').attr('refX',7).attr('refY',0).attr('markerWidth',7).attr('markerHeight',7).attr('markerUnits','userSpaceOnUse').attr('orient','auto').append('path').attr('d','M0,-3.3L7,0L0,3.3Z').attr('fill','var(--soft)');
    const edgeSelection=layer.append('g').attr('class','depth-strategic-edges').selectAll('g').data(relations,r=>r.id).join('g').attr('class','depth-strategic-edge');
    edgeSelection.append('path').attr('class',r=>'depth-strategic-line'+(r.basis_kind==='inference'?' is-inference':'')).attr('marker-end','url(#'+markerId+')');
    const hitSelection=edgeSelection.append('path').attr('class','depth-strategic-hit').attr('data-strategic-relationship',r=>r.id).attr('role','button').attr('tabindex',0).attr('aria-label',r=>relationshipLabel(r));
    hitSelection.append('title').text(r=>relationshipLabel(r));
    const nodeSelection=layer.append('g').attr('class','depth-strategic-nodes').selectAll('g').data(nodes,n=>n.key).join('g').attr('class',n=>'depth-strategic-node'+(n.kind==='group'?' is-group':n.curated?' is-curated':'')).attr('data-strategic-actor',n=>n.kind==='entity'?n.id:null).attr('data-strategic-group',n=>n.kind==='group'?n.id:null).attr('role','button').attr('tabindex',0).attr('aria-label',n=>n.kind==='group'?'Actor group: '+n.fullName:n.label).style('--node-colour',n=>'var(--c'+Math.max(0,classes.indexOf(n.classId))%14+')');
    // Tightly fitted symbol and label targets keep the node continuously clickable
    // without covering the relationship paths alongside its glyph.
    nodeSelection.append('rect').attr('class','depth-strategic-node-hit depth-strategic-symbol-hit').attr('fill','transparent').attr('pointer-events','all');
    nodeSelection.append('rect').attr('class','depth-strategic-node-hit depth-strategic-label-hit').attr('x',n=>-Math.max(...n.lines.map(s=>s.length*3.7))-3).attr('width',n=>Math.max(...n.lines.map(s=>s.length*3.7))*2+6).attr('height',n=>n.lines.length*15+5).attr('fill','transparent').attr('pointer-events','all');
    nodeSelection.append('path').attr('class','depth-strategic-shape');
    nodeSelection.append('line').attr('class','depth-strategic-label-leader').attr('stroke','var(--soft)').attr('stroke-width',.7).attr('opacity',.65).attr('pointer-events','none');
    nodeSelection.append('text').attr('class','depth-strategic-label').each(function(n){n.lines.forEach((line,i)=>d3.select(this).append('tspan').attr('x',0).attr('dy',i?'1.1em':0).text(line));});
    nodeSelection.append('title').text(n=>n.fullName||n.label);
    function relationshipLabel(r){return (r.source.fullName||r.source.label)+' → '+(r.target.fullName||r.target.label)+' · '+r.type.replace(/_/g,' ')+' · '+(r.basis_kind==='passage'?'Evidence-backed relationship':'Analytical inference');}
    function tooltip(event,text,element){const tip=document.getElementById('tip');if(!tip)return;tip.textContent=text;tip.style.display='block';const box=element.getBoundingClientRect();const x=Number.isFinite(event.clientX)&&event.type!=='focus'?event.clientX:box.x+box.width/2;const y=Number.isFinite(event.clientY)&&event.type!=='focus'?event.clientY:box.y+box.height/2;tip.style.left=Math.max(8,Math.min(innerWidth-tip.offsetWidth-8,x+12))+'px';tip.style.top=Math.max(8,Math.min(innerHeight-tip.offsetHeight-8,y+12))+'px';}
    function hideTip(){const tip=document.getElementById('tip');if(tip)tip.style.display='none';}
    function activate(event,callback,id){if(event.type==='keydown' && event.key!=='Enter' && event.key!==' ')return;event.preventDefault();event.stopPropagation();hideTip();callback?.(id);}
    hitSelection.on('click',(ev,r)=>activate(ev,onRelationship,r.id)).on('keydown',(ev,r)=>activate(ev,onRelationship,r.id)).on('mouseenter focus',function(ev,r){d3.select(this.parentNode).classed('is-hover',true);tooltip(ev,relationshipLabel(r),this);}).on('mousemove',function(ev,r){tooltip(ev,relationshipLabel(r),this);}).on('mouseleave blur',function(){d3.select(this.parentNode).classed('is-hover',false);hideTip();});
    nodeSelection.on('click keydown',(ev,n)=>activate(ev,n.kind==='group'?onGroup:onActor,n.id)).on('mouseenter focus',function(ev,n){tooltip(ev,(n.fullName||n.label)+(n.kind==='group'?' · Group-level reading':n.curated?' · Curated addition; no measured corpus size':' · Named actor'),this);}).on('mouseleave blur',hideTip).call(d3.drag().clickDistance(5).on('start',hideTip).on('drag',(ev,n)=>{layout.set(n.positionKey,{x:Math.max(28,Math.min(WIDTH-28,ev.x)),y:Math.max(28,Math.min(HEIGHT-28,ev.y))});paint();}));
    function paint(){nodes.forEach(n=>{Object.assign(n,layout.positions[n.positionKey]);n.labelBox={x:n.x+n.labelX-n.labelWidth/2,y:n.y+n.labelY-12,w:n.labelWidth,h:n.labelHeight};});nodeSelection.attr('transform',n=>`translate(${n.x},${n.y})`);edgeSelection.selectAll('path').attr('d',edgePath);}
    function metric(n,sizeBy){const m=metricsById instanceof Map?metricsById.get(n.id):metricsById[n.id];if(sizeBy==='eigenvector')return Math.max(0,m?.eigenvector||0);if(sizeBy==='betweenness')return Math.max(0,m?.betweenness??projection.metric_index?.['actor:'+n.id+':brokerage']?.value??0);return Math.max(0,m?.docs??projection.actors_by_id[n.id]?.visibility?.documents??0);}
    function resize(sizeBy){
      nodes.forEach(n=>n.r=n.kind==='group'?13:n.curated?11:layout.radius(n.id,sizeBy));
      nodeSelection.select('.depth-strategic-shape').attr('d',n=>n.kind==='group'?`M0,${-n.r}L${n.r},0L0,${n.r}L${-n.r},0Z`:`M${-n.r},0a${n.r},${n.r} 0 1,0 ${n.r*2},0a${n.r},${n.r} 0 1,0 ${-n.r*2},0`);
      nodeSelection.select('text').attr('x',n=>n.labelX).attr('y',n=>n.labelY).selectAll('tspan').attr('x',n=>n.labelX);
      nodeSelection.select('.depth-strategic-symbol-hit').attr('x',n=>-n.r-3).attr('y',n=>-n.r-3).attr('width',n=>2*n.r+6).attr('height',n=>2*n.r+8);
      nodeSelection.select('.depth-strategic-label-hit').attr('x',n=>n.labelX-n.labelWidth/2).attr('y',n=>n.labelY-12).attr('width',n=>n.labelWidth).attr('height',n=>n.labelHeight);
      nodeSelection.select('.depth-strategic-label-leader').attr('x1',n=>n.labelX/Math.max(1,Math.hypot(n.labelX,n.labelY))*(n.r+3)).attr('y1',n=>n.labelY/Math.max(1,Math.hypot(n.labelX,n.labelY))*(n.r+3)).attr('x2',n=>n.labelX).attr('y2',n=>n.labelY-8);
      paint();
    }
    function refresh({active=false,level='L2_entity',selection={kind:'overview'},sizeBy='docs',representation='actors'}={}){
      const visible=level==='L2_entity'&&representation==='actors';
      layer.style('display',visible?null:'none').attr('aria-hidden',String(!visible)).attr('data-coverage',active?'core':'whole');
      edgeSelection.style('display',active?null:'none');
      nodeSelection.style('display',n=>n.kind==='group'&&!active?'none':null).classed('whole-label',n=>n.curated||metric(n,'docs')>=70);
      const taxonomy=projection.display_groups;
      const colourFor=n=>taxonomy?.groups_by_id[n.kind==='group'?n.id:taxonomy.actor_group_by_id[n.id]]?.color_index;
      nodeSelection.style('--node-colour',n=>`var(--c${colourFor(n)??Math.max(0,classes.indexOf(n.classId))%14})`);
      d3.select(root).selectAll('g.node').style('display',n=>visible&&byKey.has('entity:'+n.id)?'none':null);
      if(!visible){hideTip();return;}
      resize(sizeBy);
      const selectedRelation=relations.find(r=>r.id===selection.id && /relationship/.test(selection.kind));
      const selectedNode=byKey.get((selection.kind==='actor'?'entity':selection.kind==='strategic-group'?'group':selection.kind)+':'+selection.id);
      const focusedKeys=new Set(selectedRelation?[selectedRelation.source.key,selectedRelation.target.key]:selectedNode?[selectedNode.key]:[]);
      const incident=new Set(relations.filter(r=>selectedRelation?r.id===selectedRelation.id:focusedKeys.has(r.source.key)||focusedKeys.has(r.target.key)).map(r=>r.id));
      const neighbours=new Set(focusedKeys);relations.filter(r=>incident.has(r.id)).forEach(r=>{neighbours.add(r.source.key);neighbours.add(r.target.key);});
      if(!active&&selection.kind==='actor'){
        focusedKeys.clear();focusedKeys.add('entity:'+selection.id);neighbours.clear();neighbours.add('entity:'+selection.id);
        Object.values(projection.associations_by_id).filter(r=>r.source===selection.id||r.target===selection.id).forEach(r=>{neighbours.add('entity:'+r.source);neighbours.add('entity:'+r.target);});
      }
      edgeSelection.classed('is-selected',r=>r===selectedRelation).classed('is-incident',r=>incident.has(r.id)).classed('is-muted',r=>focusedKeys.size>0&&!incident.has(r.id));
      hitSelection.attr('aria-pressed',r=>String(r===selectedRelation));
      nodeSelection.classed('is-selected',n=>focusedKeys.has(n.key)).classed('is-muted',n=>focusedKeys.size>0&&!neighbours.has(n.key)).attr('aria-pressed',n=>String(focusedKeys.has(n.key)));
    }
    function reset(){layout.reset();paint();hideTip();}
    document.addEventListener('df-actor-layout-changed',paint);
    resize('docs');
    return {refresh,reset};
  }
  global.DFStrategicMap={create,prepareNetwork,edgePath,pathPoints,exposedPathPoints};
})(window);
