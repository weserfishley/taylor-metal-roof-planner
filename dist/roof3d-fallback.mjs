import {FT,planeData,project} from './geometry.mjs';

// Compatibility preview for browsers where WebGL is disabled. It deliberately
// uses the same geographic plane data as the WebGL renderer, but is an SVG
// inspection view rather than a photorealistic renderer.
export function createViewer(host){
 let state,summary,showPanels,view={target:{x:0,y:0,z:0},radius:40,theta:.6,phi:.9};
 const point=(x,y,z)=>[(x-z)*.84,-(x+z)*.36-y];
 const make=(tag,attrs={},text='')=>{const node=document.createElementNS('http://www.w3.org/2000/svg',tag);for(const [key,value]of Object.entries(attrs))node.setAttribute(key,value);node.textContent=text;return node};
 function update(nextState,nextSummary,nextPanels){state=nextState;summary=nextSummary;showPanels=nextPanels;const svg=make('svg',{viewBox:'0 0 900 560',preserveAspectRatio:'xMidYMid meet',role:'img','aria-label':'Compatibility 3D roof preview'}),all=[];
  const faces=summary.rows.map(row=>({row,data:planeData(row.face,state.origin)}));
  for(const {data} of faces)for(const p of data.points){all.push(point(p.x,0,-p.y),point(p.x,data.height(p),-p.y))}
  if(state.building?.footprint?.length>=3)for(const geo of state.building.footprint){const p=project(geo,state.origin);all.push(point(p.x,0,-p.y),point(p.x,state.building.wallHeight*FT,-p.y))}
  const xs=all.map(p=>p[0]),ys=all.map(p=>p[1]),minX=Math.min(...xs,0),maxX=Math.max(...xs,1),minY=Math.min(...ys,0),maxY=Math.max(...ys,1),scale=Math.min(760/(maxX-minX||1),430/(maxY-minY||1)),tx=450-(minX+maxX)*scale/2,ty=300-(minY+maxY)*scale/2;
  const screen=p=>`${(p[0]*scale+tx).toFixed(2)},${(p[1]*scale+ty).toFixed(2)}`;
  svg.append(make('rect',{width:900,height:560,fill:'#0a2032'}));svg.append(make('text',{x:24,y:34,fill:'#c5e3e9','font-size':16,'font-family':'system-ui'},'3D compatibility preview · WebGL unavailable'));
  if(state.building?.footprint?.length>=3){const wallHeight=state.building.wallHeight*FT,footprint=state.building.footprint.map(p=>project(p,state.origin));for(let i=0;i<footprint.length;i++){const a=footprint[i],b=footprint[(i+1)%footprint.length];svg.append(make('polygon',{points:[point(a.x,0,-a.y),point(b.x,0,-b.y),point(b.x,wallHeight,-b.y),point(a.x,wallHeight,-a.y)].map(screen).join(' '),fill:'#6f8f9a',stroke:'#203f50','stroke-width':2}))}}
  for(const {row,data} of faces){const roof=data.points.map(p=>point(p.x,data.height(p),-p.y));svg.append(make('polygon',{points:roof.map(screen).join(' '),fill:state.settings.color,stroke:'#d5f2ff','stroke-width':2}));if(showPanels)for(const panel of row.panels)svg.append(make('polyline',{points:[...panel.polygon,panel.polygon[0]].map(p=>screen(point(p.x,data.height(p)+.03,-p.y))).join(' '),fill:'none',stroke:'#c5e3e9','stroke-width':.8}));}
  host.replaceChildren(svg);
 }
 function getViewState(){return view}
 function setViewState(saved){if(saved)view={...view,...saved,target:{...view.target,...saved.target}}}
 function captureViews(){return []}
 return {update,getViewState,setViewState,captureViews};
}
