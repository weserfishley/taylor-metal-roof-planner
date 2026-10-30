import {FT,project,distance} from './geometry.mjs';
export function getWalls(state){
 const walls=[];
 for(const [i,part] of (state.building?.parts||(state.building?.footprint?[state.building]:[])).entries())for(let edge=0;edge<part.footprint.length;edge++)walls.push({id:`${part.id||'building-'+i}:${edge}`,name:`${part.name||'Main house'} / wall ${edge+1}`,a:part.footprint[edge],b:part.footprint[(edge+1)%part.footprint.length],height:part.wallHeight});
 walls.push(...(state.walls||[]));
 return walls.map(wall=>{const a=project(wall.a,state.origin),b=project(wall.b,state.origin);return {...wall,a,b,widthFeet:distance(a,b)/FT,openings:(state.wallOpenings||[]).filter(o=>o.wallId===wall.id)}});
}
export function validateOpening(wall,opening,others=[]){
 if(![opening.offset,opening.width,opening.height,opening.sill].every(Number.isFinite)||opening.offset<0||opening.width<=0||opening.height<=0||opening.sill<0||opening.offset+opening.width>wall.widthFeet+1e-6||opening.sill+opening.height>wall.height+1e-6)throw Error('The opening must fit within the wall. Check its offset, width, height, and sill height.');
 if(others.some(o=>o.wallId===wall.id&&opening.offset<o.offset+o.width-1e-6&&opening.offset+opening.width>o.offset+1e-6&&opening.sill<o.sill+o.height-1e-6&&opening.sill+opening.height>o.sill+1e-6))throw Error('This opening overlaps another door or window.');
}
// Decompose the visible wall into rectangles around measured openings.
export function wallCells(wall,start=0,end=wall.widthFeet){
 const xs=[...new Set([start,end,...wall.openings.flatMap(o=>[o.offset,o.offset+o.width]).filter(x=>x>start&&x<end)])].sort((a,b)=>a-b),cells=[];
 for(let i=0;i<xs.length-1;i++){const left=xs[i],right=xs[i+1],mid=(left+right)/2,holes=wall.openings.filter(o=>mid>o.offset&&mid<o.offset+o.width).sort((a,b)=>a.sill-b.sill);let bottom=0;for(const hole of holes){if(hole.sill>bottom)cells.push({left,right,bottom,top:hole.sill});bottom=Math.max(bottom,hole.sill+hole.height)}if(bottom<wall.height)cells.push({left,right,bottom,top:wall.height})}
 return cells;
}
export function wallPoint(wall,x,z){const t=x/wall.widthFeet;return {x:wall.a.x+(wall.b.x-wall.a.x)*t,y:z*FT,z:-(wall.a.y+(wall.b.y-wall.a.y)*t)}};
