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
export function panelLayout(face,origin,settings){
 const data=planeData(face,origin),poly=data.uv,w=settings.width/12*FT,max=settings.maxLength*FT,allow=settings.allowance/12*FT,factor=slopeFactor(face.pitch);
 const lo=Math.min(...poly.map(p=>p.x)),hi=Math.max(...poly.map(p=>p.x)),count=Math.ceil((hi-lo-1e-8)/w);if(!Number.isFinite(count)||count>3000)return [];
 const panels=[];
 for(let i=0;i<count;i++){const start=lo+i*w;const clipped=clipX(clipX(poly,start,true),start+w,false);if(clipped.length<3||area(clipped)<1e-6)continue;const min=Math.min(...clipped.map(p=>p.y)),maxV=Math.max(...clipped.map(p=>p.y));const length=Math.ceil(((maxV-min)*factor+allow)/FT*12-1e-8)/12;panels.push({index:i+1,polygon:clipped.map(p=>fromUV(p,face.bearing)),length,oversize:length*FT>max+1e-8,coverage:area(clipped)*factor/FT**2,orderArea:length*settings.width/12});}
 return panels;
}
export function summarize(faces,origin,settings){const rows=faces.map(f=>({face:f,...planeData(f,origin),panels:panelLayout(f,origin,settings)}));const all=rows.flatMap(r=>r.panels);return {rows,flat:rows.reduce((a,r)=>a+r.flat,0)/FT**2,surface:rows.reduce((a,r)=>a+r.surface,0)/FT**2,count:all.length,orderArea:all.reduce((a,r)=>a+r.orderArea,0),oversize:all.filter(p=>p.oversize).length,longest:Math.max(0,...all.map(p=>p.length))};}
