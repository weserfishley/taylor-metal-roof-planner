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
 for(const matches of edges.values())if(matches.length>1)for(let i=0;i<matches.length;i++)for(let j=i+1;j<matches.length;j++){const left=matches[i],right=matches[j],a=project(left.a,origin),b=project(left.b,origin),p=planeEquation(left.face,origin),q=planeEquation(right.face,origin),gapA=p.height(a)-q.height(a),gapB=p.height(b)-q.height(b),maxGap=Math.max(Math.abs(gapA),Math.abs(gapB)),variation=Math.abs(gapA-gapB),status=maxGap<=tolerance?'aligned':variation<=tolerance?'offset':'conflict';report.push({left,right,a,b,gapA,gapB,maxGap,variation,status})}
 return report;
}
export function solvePlaneJunctions(faces,origin,{tolerance=.0254,maxMove=6*FT,iterations=8,fixedFaceId=null}={}){
 const backup=structuredClone(faces),replacePoint=(oldKey,next)=>{for(const face of faces)for(let i=0;i<face.points.length;i++)if(pointKey(face.points[i])===oldKey)face.points[i]=unproject(next,origin)};
 let changed=false,rejected=0;
 for(let pass=0;pass<iterations;pass++){
  const problems=junctionReport(faces,origin,tolerance).filter(j=>j.status!=='aligned');if(!problems.length)break;
  let passChanged=false;
  for(const joint of problems){
   const p=planeEquation(joint.left.face,origin),q=planeEquation(joint.right.face,origin),nx=p.gx-q.gx,ny=p.gy-q.gy,den=nx*nx+ny*ny;
   if(den<1e-10){const shift=(joint.gapA+joint.gapB)/2/FT;if(Math.abs(shift)>maxMove/FT){rejected++;continue}if(joint.right.face.id===fixedFaceId)joint.left.face.eave=(joint.left.face.eave||0)-shift;else joint.right.face.eave=(joint.right.face.eave||0)+shift;passChanged=changed=true;continue}
   const c=p.c-q.c,moves=[joint.a,joint.b].map(point=>{const d=(nx*point.x+ny*point.y+c)/den;return {from:point,to:{x:point.x-nx*d,y:point.y-ny*d},distance:Math.abs(d)*Math.sqrt(den)}});
   if(moves.some(move=>move.distance>maxMove)){rejected++;continue}
   for(const move of moves)replacePoint(pointKey(unproject(move.from,origin)),move.to);passChanged=changed=true;
  }
  if(!passChanged)break;
 }
 if(faces.some(face=>!validPolygon(face.points.map(point=>project(point,origin))))){faces.splice(0,faces.length,...backup);return {changed:false,rejected:rejected+1,restored:true,report:junctionReport(faces,origin,tolerance)}}
 return {changed,rejected,restored:false,report:junctionReport(faces,origin,tolerance)};
}
export function panelLayout(face,origin,settings){
 const data=planeData(face,origin),poly=data.uv,w=settings.width/12*FT,max=settings.maxLength*FT,allow=settings.allowance/12*FT,factor=slopeFactor(face.pitch);
 const lo=Math.min(...poly.map(p=>p.x)),hi=Math.max(...poly.map(p=>p.x)),count=Math.ceil((hi-lo-1e-8)/w);if(!Number.isFinite(count)||count>3000)return [];
 const panels=[];
 for(let i=0;i<count;i++){const start=lo+i*w;const clipped=clipX(clipX(poly,start,true),start+w,false);if(clipped.length<3||area(clipped)<1e-6)continue;const min=Math.min(...clipped.map(p=>p.y)),maxV=Math.max(...clipped.map(p=>p.y));const length=Math.ceil(((maxV-min)*factor+allow)/FT*12-1e-8)/12;panels.push({index:i+1,polygon:clipped.map(p=>fromUV(p,face.bearing)),length,oversize:length*FT>max+1e-8,coverage:area(clipped)*factor/FT**2,orderArea:length*settings.width/12});}
 return panels;
}
export function summarize(faces,origin,settings){const rows=faces.map(f=>({face:f,...planeData(f,origin),panels:panelLayout(f,origin,settings)}));const all=rows.flatMap(r=>r.panels);return {rows,flat:rows.reduce((a,r)=>a+r.flat,0)/FT**2,surface:rows.reduce((a,r)=>a+r.surface,0)/FT**2,count:all.length,orderArea:all.reduce((a,r)=>a+r.orderArea,0),oversize:all.filter(p=>p.oversize).length,longest:Math.max(0,...all.map(p=>p.length))};}
