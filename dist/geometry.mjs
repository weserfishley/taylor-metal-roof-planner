// Coordinates are stored as latitude/longitude. Roof calculations use a local
// metric tangent plane, independent of the current map zoom or viewport.
export const R=6378137, FT=0.3048;
export const rad=d=>d*Math.PI/180;
export function project(p,origin){return {x:R*rad(p.lng-origin.lng)*Math.cos(rad(origin.lat)),y:R*rad(p.lat-origin.lat)};}
export function unproject(p,origin){return {lat:origin.lat+p.y/R*180/Math.PI,lng:origin.lng+p.x/(R*Math.cos(rad(origin.lat)))*180/Math.PI};}
export function area(p){return Math.abs(p.reduce((a,v,i)=>{const w=p[(i+1)%p.length];return a+v.x*w.y-w.x*v.y},0)/2);}
export function distance(a,b){return Math.hypot(a.x-b.x,a.y-b.y);}
export function slopeFactor(pitch){return Math.hypot(12,pitch)/12;}
export function axes(bearing){const a=rad(bearing);return {u:{x:Math.cos(a),y:-Math.sin(a)},v:{x:Math.sin(a),y:Math.cos(a)}};}
export function toUV(p,b){const {u,v}=axes(b);return {x:p.x*u.x+p.y*u.y,y:p.x*v.x+p.y*v.y};}
export function fromUV(p,b){const {u,v}=axes(b);return {x:p.x*u.x+p.y*v.x,y:p.x*u.y+p.y*v.y};}
function cross(a,b,c){return (b.x-a.x)*(c.y-a.y)-(b.y-a.y)*(c.x-a.x);}
export function validPolygon(p){
 if(p.length<3||area(p)<.05)return false;
 for(let i=0;i<p.length;i++){if(distance(p[i],p[(i+1)%p.length])<.03)return false;for(let j=i+1;j<p.length;j++){if(j===i+1||(i===0&&j===p.length-1))continue;const a=p[i],b=p[(i+1)%p.length],c=p[j],d=p[(j+1)%p.length];if(cross(a,b,c)*cross(a,b,d)<-1e-10&&cross(c,d,a)*cross(c,d,b)<-1e-10)return false;}}
 return true;
}
export function clipX(poly,limit,greater){let out=[];for(let i=0;i<poly.length;i++){const a=poly[i],b=poly[(i+1)%poly.length];const ai=greater?a.x>=limit:a.x<=limit,bi=greater?b.x>=limit:b.x<=limit;if(ai)out.push(a);if(ai!==bi){const t=(limit-a.x)/(b.x-a.x);out.push({x:limit,y:a.y+t*(b.y-a.y)})}}return out;}
export function planeData(face,origin){const points=face.points.map(p=>project(p,origin)),uv=points.map(p=>toUV(p,face.bearing));const top=Math.max(...uv.map(p=>p.y));return {points,uv,flat:area(points),surface:area(points)*slopeFactor(face.pitch),height:p=>(face.eave||0)*FT+(top-toUV(p,face.bearing).y)*face.pitch/12};}
export function edgeSurfaceLength(face,index,origin){const data=planeData(face,origin),a=data.points[index],b=data.points[(index+1)%data.points.length];return Math.hypot(distance(a,b),data.height(a)-data.height(b))/FT;}
export function resizeEdgeEndpoint(face,index,targetFeet,origin){
 const data=planeData(face,origin),a=data.points[index],b=data.points[(index+1)%data.points.length],plan=distance(a,b);
 if(!(targetFeet>0)||!Number.isFinite(targetFeet)||plan<.03)throw Error('Invalid roof-line length');
 const surface=Math.hypot(plan,data.height(a)-data.height(b)),targetPlan=targetFeet*FT/(surface/plan),scale=targetPlan/plan;
 return unproject({x:a.x+(b.x-a.x)*scale,y:a.y+(b.y-a.y)*scale},origin);
}
export function planeEquation(face,origin){const data=planeData(face,origin),v=axes(face.bearing).v,k=face.pitch/12,top=Math.max(...data.points.map(p=>toUV(p,face.bearing).y));return {gx:-v.x*k,gy:-v.y*k,c:(face.eave||0)*FT+top*k,height(p){return this.gx*p.x+this.gy*p.y+this.c}};}
const pointKey=p=>`${p.lat.toFixed(7)},${p.lng.toFixed(7)}`,sharedKey=(a,b)=>[pointKey(a),pointKey(b)].sort().join('|');
export function junctionReport(faces,origin,tolerance=.0254){
 const edges=new Map(),report=[];
 for(const face of faces)face.points.forEach((a,index)=>{const b=face.points[(index+1)%face.points.length],key=sharedKey(a,b);if(!edges.has(key))edges.set(key,[]);edges.get(key).push({face,index,a,b})});
 for(const matches of edges.values())if(matches.length>1)for(let i=0;i<matches.length;i++)for(let j=i+1;j<matches.length;j++){const left=matches[i],right=matches[j],a=project(left.a,origin),b=project(left.b,origin),p=planeEquation(left.face,origin),q=planeEquation(right.face,origin),gapA=p.height(a)-q.height(a),gapB=p.height(b)-q.height(b),maxGap=Math.max(Math.abs(gapA),Math.abs(gapB)),variation=Math.abs(gapA-gapB),status=maxGap<=tolerance?'aligned':variation<=tolerance?'offset':'conflict';report.push({kind:'edge',left,right,a,b,gapA,gapB,maxGap,variation,status})}
 return report;
}
function vertexGroups(faces){const groups=new Map();for(const face of faces)face.points.forEach((point,index)=>{const key=pointKey(point);if(!groups.has(key))groups.set(key,[]);groups.get(key).push({face,index,point})});return [...groups.entries()].map(([key,matches])=>({key,matches}));}
export function vertexJunctionReport(faces,origin,tolerance=.0254){const report=[];for(const group of vertexGroups(faces)){const unique=[...new Map(group.matches.map(match=>[match.face.id,match.face])).values()];if(unique.length<3)continue;const point=project(group.matches[0].point,origin),heights=unique.map(face=>({face,height:planeEquation(face,origin).height(point)})),low=Math.min(...heights.map(item=>item.height)),high=Math.max(...heights.map(item=>item.height));report.push({kind:'vertex',key:group.key,matches:group.matches,faces:unique,point,heightSpread:high-low,status:high-low<=tolerance?'aligned':'conflict'})}return report}
function clusterNearbyVertices(faces,origin,snapTolerance,fixedFaceId){const refs=[];for(const face of faces)face.points.forEach((point,index)=>refs.push({face,index,point,xy:project(point,origin)}));const parent=refs.map((_,index)=>index),find=index=>parent[index]===index?index:(parent[index]=find(parent[index])),join=(a,b)=>{a=find(a);b=find(b);if(a!==b)parent[b]=a};for(let i=0;i<refs.length;i++)for(let j=i+1;j<refs.length;j++)if(refs[i].face.id!==refs[j].face.id&&distance(refs[i].xy,refs[j].xy)<=snapTolerance)join(i,j);const groups=new Map();refs.forEach((ref,index)=>{const root=find(index);if(!groups.has(root))groups.set(root,[]);groups.get(root).push(ref)});let changed=0;for(const group of groups.values()){if(new Set(group.map(ref=>ref.face.id)).size<2)continue;const perFace=new Map();let ambiguous=false;for(const ref of group){if(perFace.has(ref.face.id)&&perFace.get(ref.face.id)!==ref.index){ambiguous=true;break}perFace.set(ref.face.id,ref.index)}if(ambiguous)continue;const fixed=group.find(ref=>ref.face.id===fixedFaceId),target=fixed?.xy||group.reduce((sum,ref)=>({x:sum.x+ref.xy.x/group.length,y:sum.y+ref.xy.y/group.length}),{x:0,y:0});for(const ref of group)if(distance(ref.xy,target)>1e-7){ref.face.points[ref.index]=unproject(target,origin);changed++}}return changed}
function insertNearbyEdgeVertices(faces,origin,snapTolerance){const requests=new Map();for(const source of faces)for(const sourcePoint of source.points){const p=project(sourcePoint,origin);for(const target of faces){if(target.id===source.id)continue;for(let index=0;index<target.points.length;index++){const a=project(target.points[index],origin),b=project(target.points[(index+1)%target.points.length],origin),ab={x:b.x-a.x,y:b.y-a.y},den=ab.x*ab.x+ab.y*ab.y;if(den<1e-8)continue;const t=((p.x-a.x)*ab.x+(p.y-a.y)*ab.y)/den;if(t<=.01||t>=.99)continue;const nearest={x:a.x+ab.x*t,y:a.y+ab.y*t};if(distance(p,nearest)>snapTolerance)continue;if(target.points.some(point=>distance(project(point,origin),p)<=snapTolerance*.15))continue;const key=`${target.id}:${index}`;if(!requests.has(key))requests.set(key,{target,index,items:[]});if(!requests.get(key).items.some(item=>distance(project(item.point,origin),p)<=snapTolerance*.15))requests.get(key).items.push({t,point:sourcePoint})}}}let inserted=0;const ordered=[...requests.values()].sort((a,b)=>a.target.id.localeCompare(b.target.id)||b.index-a.index);for(const request of ordered){request.items.sort((a,b)=>b.t-a.t);for(const item of request.items){request.target.points.splice(request.index+1,0,{...item.point});request.target.edges.splice(request.index+1,0,request.target.edges[request.index]||'Unlabeled');inserted++}}return inserted}
export function snapNearbyJunctions(faces,origin,{snapTolerance=6/12*FT,fixedFaceId=null}={}){if(!(snapTolerance>0))return {changed:false,moved:0,inserted:0};let moved=clusterNearbyVertices(faces,origin,snapTolerance,fixedFaceId),inserted=insertNearbyEdgeVertices(faces,origin,snapTolerance);if(inserted)moved+=clusterNearbyVertices(faces,origin,snapTolerance,fixedFaceId);return {changed:Boolean(moved||inserted),moved,inserted}}
function solveMultiPlaneVertices(faces,origin,tolerance,maxMove){let changed=0,rejected=0;for(const group of vertexGroups(faces)){const unique=[...new Map(group.matches.map(match=>[match.face.id,match.face])).values()];if(unique.length<3)continue;const current=project(group.matches[0].point,origin),equations=unique.map(face=>planeEquation(face,origin)),currentHeights=equations.map(eq=>eq.height(current));if(Math.max(...currentHeights)-Math.min(...currentHeights)<=tolerance)continue;const base=equations[0],rows=equations.slice(1).map(eq=>({x:eq.gx-base.gx,y:eq.gy-base.gy,b:base.c-eq.c}));let aa=0,ab=0,bb=0,ac=0,bc=0;for(const row of rows){aa+=row.x*row.x;ab+=row.x*row.y;bb+=row.y*row.y;ac+=row.x*row.b;bc+=row.y*row.b}const det=aa*bb-ab*ab;if(Math.abs(det)<1e-10)continue;const candidate={x:(ac*bb-bc*ab)/det,y:(aa*bc-ab*ac)/det};if(distance(current,candidate)>maxMove){rejected++;continue}const heights=equations.map(eq=>eq.height(candidate)),spread=Math.max(...heights)-Math.min(...heights);if(spread>tolerance){rejected++;continue}if(distance(current,candidate)<=1e-7)continue;for(const match of group.matches)match.face.points[match.index]=unproject(candidate,origin);changed++}return {changed,rejected}}
export function solvePlaneJunctions(faces,origin,{tolerance=.0254,snapTolerance=6/12*FT,maxMove=6*FT,iterations=8,fixedFaceId=null}={}){
 for(const face of faces)if(!Array.isArray(face.edges))face.edges=face.points.map(()=>'Unlabeled');
 const backup=structuredClone(faces),replacePoint=(oldKey,next)=>{for(const face of faces)for(let i=0;i<face.points.length;i++)if(pointKey(face.points[i])===oldKey)face.points[i]=unproject(next,origin)},topology=snapNearbyJunctions(faces,origin,{snapTolerance,fixedFaceId});
 let changed=topology.changed,rejected=0;
 for(let pass=0;pass<iterations;pass++){
  const problems=junctionReport(faces,origin,tolerance).filter(j=>j.status!=='aligned');
  let passChanged=false;
  for(const joint of problems){
   const p=planeEquation(joint.left.face,origin),q=planeEquation(joint.right.face,origin),nx=p.gx-q.gx,ny=p.gy-q.gy,den=nx*nx+ny*ny;
   if(den<1e-10){rejected++;continue}
   const c=p.c-q.c,moves=[joint.a,joint.b].map(point=>{const d=(nx*point.x+ny*point.y+c)/den;return {from:point,to:{x:point.x-nx*d,y:point.y-ny*d},distance:Math.abs(d)*Math.sqrt(den)}});
   if(moves.some(move=>move.distance>maxMove)){rejected++;continue}
   for(const move of moves)replacePoint(pointKey(unproject(move.from,origin)),move.to);passChanged=changed=true;
  }
  const vertices=solveMultiPlaneVertices(faces,origin,tolerance,maxMove);if(vertices.changed)passChanged=changed=true;rejected+=vertices.rejected;
  if(!problems.length&&!vertices.changed)break;
  if(!passChanged)break;
 }
 if(faces.some(face=>!validPolygon(face.points.map(point=>project(point,origin))))){faces.splice(0,faces.length,...backup);return {changed:false,rejected:rejected+1,restored:true,topology:{changed:false,moved:0,inserted:0},report:junctionReport(faces,origin,tolerance),vertexReport:vertexJunctionReport(faces,origin,tolerance)}}
 return {changed,rejected,restored:false,topology,report:junctionReport(faces,origin,tolerance),vertexReport:vertexJunctionReport(faces,origin,tolerance)};
}
export function panelLayout(face,origin,settings){
 const data=planeData(face,origin),poly=data.uv,w=settings.width/12*FT,max=settings.maxLength*FT,allow=settings.allowance/12*FT,factor=slopeFactor(face.pitch);
 const lo=Math.min(...poly.map(p=>p.x)),hi=Math.max(...poly.map(p=>p.x)),count=Math.ceil((hi-lo-1e-8)/w);if(!Number.isFinite(count)||count>3000)return [];
 const panels=[];
 for(let i=0;i<count;i++){const start=lo+i*w;const clipped=clipX(clipX(poly,start,true),start+w,false);if(clipped.length<3||area(clipped)<1e-6)continue;const min=Math.min(...clipped.map(p=>p.y)),maxV=Math.max(...clipped.map(p=>p.y));const length=Math.ceil(((maxV-min)*factor+allow)/FT*12-1e-8)/12;panels.push({index:i+1,polygon:clipped.map(p=>fromUV(p,face.bearing)),length,oversize:length*FT>max+1e-8,coverage:area(clipped)*factor/FT**2,orderArea:length*settings.width/12});}
 return panels;
}
export function summarize(faces,origin,settings){const rows=faces.map(f=>({face:f,...planeData(f,origin),panels:panelLayout(f,origin,settings)}));const all=rows.flatMap(r=>r.panels);return {rows,flat:rows.reduce((a,r)=>a+r.flat,0)/FT**2,surface:rows.reduce((a,r)=>a+r.surface,0)/FT**2,count:all.length,orderArea:all.reduce((a,r)=>a+r.orderArea,0),oversize:all.filter(p=>p.oversize).length,longest:Math.max(0,...all.map(p=>p.length))};}
