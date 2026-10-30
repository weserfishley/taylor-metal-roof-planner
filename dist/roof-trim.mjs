import {FT,project,unproject,distance,validPolygon,planeEquation,planeData,toUV,edgeSurfaceLength,junctionReport,vertexJunctionReport} from './geometry.mjs';
export const trimDefaults={eave:false,fascia:false,fasciaDepth:6,eaveDepth:2,stockLength:10,color:'#d6dce0'};
const same=(a,b)=>distance(a,b)<.001;
const cross=(a,b)=>a.x*b.y-a.y*b.x;
function intersection(a,u,b,v){const det=cross(u,v);if(Math.abs(det)<1e-9)throw Error('This corner is too straight to offset safely.');const d={x:b.x-a.x,y:b.y-a.y},t=cross(d,v)/det;return {x:a.x+t*u.x,y:a.y+t*u.y}}
export function addRoofOverhang(faces,origin,faceId,edgeIndex,inches){
 const next=structuredClone(faces),face=next.find(f=>f.id===faceId),offset=Number(inches)/12*FT;
 if(!face||!['Eave','Rake'].includes(face.edges[edgeIndex])||!Number.isFinite(offset)||offset<=0||offset>4*FT)throw Error('Select an Eave or Rake and enter an added overhang from 0 to 48 inches.');
 const equations=new Map(next.map(f=>[f.id,planeEquation(f,origin)])),records=next.flatMap(f=>{const points=f.points.map(p=>project(p,origin)),signed=points.reduce((sum,p,i)=>sum+cross(p,points[(i+1)%points.length]),0);return points.map((a,i)=>{const b=points[(i+1)%points.length],len=distance(a,b),u={x:(b.x-a.x)/len,y:(b.y-a.y)/len};return {f,i,points,a,b,u,n:signed>0?{x:u.y,y:-u.x}:{x:-u.y,y:u.x}}})});
 const selected=records.find(r=>r.f.id===faceId&&r.i===edgeIndex),chain=[selected];
 if(records.some(r=>r!==selected&&((same(r.a,selected.a)&&same(r.b,selected.b))||(same(r.b,selected.a)&&same(r.a,selected.b)))))throw Error('Overhangs require an exterior roof edge, not a shared roof seam.');
 if(face.edges[edgeIndex]==='Rake'){let changed=true;while(changed){changed=false;for(const r of records){if(chain.includes(r)||r.f.edges[r.i]!=='Rake')continue;if(Math.abs(cross(r.u,selected.u))>1e-6||r.n.x*selected.n.x+r.n.y*selected.n.y<.999)continue;if(chain.some(c=>same(c.a,r.a)||same(c.a,r.b)||same(c.b,r.a)||same(c.b,r.b))){chain.push(r);changed=true}}}}
 const moves=[];for(const r of chain){const n=r.points.length,previous=r.points[(r.i+n-1)%n],after=r.points[(r.i+2)%n],a={x:r.a.x+r.n.x*offset,y:r.a.y+r.n.y*offset},b={x:r.b.x+r.n.x*offset,y:r.b.y+r.n.y*offset},newA=intersection(a,r.u,previous,{x:r.a.x-previous.x,y:r.a.y-previous.y}),newB=intersection(b,r.u,r.b,{x:after.x-r.b.x,y:after.y-r.b.y});for(const [old,p]of [[r.a,newA],[r.b,newB]]){if(distance(old,p)>offset*8)throw Error('This corner needs too large a movement; adjust it manually.');const found=moves.find(m=>same(m.old,old));if(found&&!same(found.p,p))throw Error('The rake corners have conflicting offsets.');if(!found)moves.push({old,p})}}
 for(const f of next){let changed=false;f.points=f.points.map(p=>{const move=moves.find(m=>same(m.old,project(p,origin)));if(!move)return p;changed=true;return unproject(move.p,origin)});if(!changed)continue;const points=f.points.map(p=>project(p,origin));if(!validPolygon(points))throw Error('The overhang would cross roof boundaries.');const low=points.reduce((a,b)=>toUV(a,f.bearing).y>toUV(b,f.bearing).y?a:b);f.eave=equations.get(f.id).height(low)/FT;if(f.eave<0||f.eave>200)throw Error('Overhang would move the roof outside the supported elevation range.')}
 const before=junctionReport(faces,origin),after=junctionReport(next,origin),key=j=>[j.left.face.id+':'+j.left.index,j.right.face.id+':'+j.right.index].sort().join('|'),bad=new Set(before.filter(j=>j.status!=='aligned').map(key)),vertexKey=j=>j.faces.map(f=>f.id).sort().join('|'),badVertices=new Set(vertexJunctionReport(faces,origin).filter(j=>j.status!=='aligned').map(vertexKey));if(after.some(j=>j.status!=='aligned'&&!bad.has(key(j)))||vertexJunctionReport(next,origin).some(j=>j.status!=='aligned'&&!badVertices.has(vertexKey(j))))throw Error('The overhang would create a pitched-plane junction conflict.');
 return next;
}
export function roofTrimLayout(state){
 const settings={...trimDefaults,...state.trim},segments=[],seen=new Set();let eave=0,fascia=0,eavePieces=0,fasciaPieces=0;
 for(const face of state.faces){const data=planeData(face,state.origin);for(let i=0;i<face.points.length;i++){const type=face.edges[i];if(!['Eave','Rake'].includes(type))continue;const a=face.points[i],b=face.points[(i+1)%face.points.length],key=[a,b].map(p=>p.lat.toFixed(7)+','+p.lng.toFixed(7)).sort().join('|');if(seen.has(key))continue;seen.add(key);const length=edgeSurfaceLength(face,i,state.origin),pieces=Math.ceil(length/settings.stockLength-1e-7),p=data.points[i],q=data.points[(i+1)%data.points.length],topA=data.height(p),topB=data.height(q);
 if(type==='Eave'&&settings.eave){eave+=length;eavePieces+=pieces;segments.push({faceId:face.id,kind:'Eave trim',a:p,b:q,topA,topB,depth:settings.eaveDepth/12*FT,length})}
 if(settings.fascia){fascia+=length;fasciaPieces+=pieces;segments.push({faceId:face.id,kind:'Fascia',a:p,b:q,topA,topB,depth:settings.fasciaDepth/12*FT,length})}
 }}
 return {settings,segments,eave,fascia,eavePieces,fasciaPieces};
}
