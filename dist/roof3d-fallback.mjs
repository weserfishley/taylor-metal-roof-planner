import {FT,planeData,project} from './geometry.mjs';

// Compatibility preview for browsers where WebGL is disabled. It deliberately
// uses the same geographic plane data as the WebGL renderer, but is an SVG
// inspection view rather than a photorealistic renderer.
export function createViewer(host){
 let state,summary,showPanels,drag,view={target:{x:0,y:0,z:0},radius:40,theta:.18,phi:.9,zoom:1,tilt:.36};
 const projected=(x,y,z)=>{const c=Math.cos(view.theta),s=Math.sin(view.theta),rx=x*c-z*s,depth=x*s+z*c;return {x:rx,y:-depth*view.tilt-y,depth}};
 const point=(x,y,z)=>{const p=projected(x,y,z);return [p.x,p.y]};
 const make=(tag,attrs={},text='')=>{const node=document.createElementNS('http://www.w3.org/2000/svg',tag);for(const [key,value]of Object.entries(attrs))node.setAttribute(key,value);node.textContent=text;return node};
 function update(nextState,nextSummary,nextPanels){state=nextState;summary=nextSummary;showPanels=nextPanels;const svg=make('svg',{viewBox:'0 0 900 560',preserveAspectRatio:'xMidYMid meet',role:'img','aria-label':'Compatibility 3D roof preview'}),all=[];
  const faces=summary.rows.map(row=>({row,data:planeData(row.face,state.origin)}));
  for(const {data} of faces)for(const p of data.points){all.push(point(p.x,0,-p.y),point(p.x,data.height(p),-p.y))}
  for(const part of state.building?.parts||(state.building?.footprint?[state.building]:[]))for(const geo of part.footprint){const p=project(geo,state.origin);all.push(point(p.x,0,-p.y),point(p.x,part.wallHeight*FT,-p.y))}
  const xs=all.map(p=>p[0]),ys=all.map(p=>p[1]),minX=Math.min(...xs,0),maxX=Math.max(...xs,1),minY=Math.min(...ys,0),maxY=Math.max(...ys,1),scale=Math.min(760/(maxX-minX||1),430/(maxY-minY||1))*view.zoom,tx=450-(minX+maxX)*scale/2,ty=300-(minY+maxY)*scale/2;
  const screen=p=>`${(p[0]*scale+tx).toFixed(2)},${(p[1]*scale+ty).toFixed(2)}`;
  svg.append(make('rect',{width:900,height:560,fill:'#0a2032'}));svg.append(make('text',{x:24,y:34,fill:'#c5e3e9','font-size':16,'font-family':'system-ui'},'3D compatibility preview · WebGL unavailable'));
  for(const part of state.building?.parts||(state.building?.footprint?[state.building]:[])){const wallHeight=part.wallHeight*FT,footprint=part.footprint.map(p=>project(p,state.origin)),walls=[];for(let i=0;i<footprint.length;i++){const a=footprint[i],b=footprint[(i+1)%footprint.length],shape=[projected(a.x,0,-a.y),projected(b.x,0,-b.y),projected(b.x,wallHeight,-b.y),projected(a.x,wallHeight,-a.y)];walls.push(shape)}for(const shape of walls.sort((a,b)=>b.reduce((n,p)=>n+p.depth,0)-a.reduce((n,p)=>n+p.depth,0)))svg.append(make('polygon',{points:shape.map(p=>screen([p.x,p.y])).join(' '),fill:'#6f8f9a',stroke:'#203f50','stroke-width':2}))}
  const renderedFaces=faces.map(item=>({...item,shape:item.data.points.map(p=>projected(p.x,item.data.height(p),-p.y))})).sort((a,b)=>b.shape.reduce((n,p)=>n+p.depth,0)-a.shape.reduce((n,p)=>n+p.depth,0));
  for(const {row,data,shape} of renderedFaces){svg.append(make('polygon',{points:shape.map(p=>screen([p.x,p.y])).join(' '),fill:state.settings.color,stroke:'#d5f2ff','stroke-width':2}));if(showPanels)for(const panel of row.panels)svg.append(make('polyline',{points:[...panel.polygon,panel.polygon[0]].map(p=>screen(point(p.x,data.height(p)+.03,-p.y))).join(' '),fill:'none',stroke:'#c5e3e9','stroke-width':.8}));}
  host.replaceChildren(svg);
 }
 host.style.touchAction='none';host.addEventListener('pointerdown',event=>{drag={x:event.clientX,y:event.clientY};host.setPointerCapture?.(event.pointerId)});host.addEventListener('pointermove',event=>{if(!drag||!state)return;view.theta+=(event.clientX-drag.x)*.012;view.tilt=Math.max(.08,Math.min(.7,view.tilt+(event.clientY-drag.y)*.002));drag={x:event.clientX,y:event.clientY};update(state,summary,showPanels)});host.addEventListener('pointerup',()=>drag=null);host.addEventListener('pointercancel',()=>drag=null);host.addEventListener('wheel',event=>{if(!state)return;event.preventDefault();view.zoom=Math.max(.45,Math.min(2.5,view.zoom*Math.exp(-event.deltaY*.001)));update(state,summary,showPanels)},{passive:false});
 function getViewState(){return view}
 function setViewState(saved){if(saved)view={...view,...saved,target:{...view.target,...saved.target},zoom:Math.max(.45,Math.min(2.5,Number(saved.zoom)||1)),tilt:Math.max(.08,Math.min(.7,Number(saved.tilt)||.36))}}
 function captureViews(){return []}
 return {update,getViewState,setViewState,captureViews};
}
