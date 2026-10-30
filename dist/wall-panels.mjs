import {FT,project,distance} from './geometry.mjs';
export const wallPanelDefaults={show:false,width:36,maxLength:20,allowance:0,color:'#82949e'};
export function wallPanelLayout(state){
 const settings={...wallPanelDefaults,...state.wallPanels},rows=[];
 for(const [index,part]of (state.building?.parts||(state.building?.footprint?[state.building]:[])).entries()){
  const points=part.footprint.map(p=>project(p,state.origin));
  for(let edge=0;edge<points.length;edge++){
   const a=points[edge],b=points[(edge+1)%points.length],widthFeet=distance(a,b)/FT,height=part.wallHeight;
   if(widthFeet<=0||height<=0)continue;
   const count=Math.ceil(widthFeet/(settings.width/12)-1e-7),length=Math.ceil((height+settings.allowance/12)*12-1e-7)/12;
   const panels=Array.from({length:count},(_,i)=>{const start=Math.min(1,i*settings.width/12/widthFeet),end=Math.min(1,(i+1)*settings.width/12/widthFeet),at=t=>({x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t});return {a:at(start),b:at(end),height,length,oversize:length>settings.maxLength}});
   rows.push({name:part.name||`Section ${index+1}`,edge:edge+1,a,b,height,widthFeet,panels,count,length,area:widthFeet*height});
  }
 }
 return {settings,rows,count:rows.reduce((n,r)=>n+r.count,0),area:rows.reduce((n,r)=>n+r.area,0),orderArea:rows.reduce((n,r)=>n+r.count*r.length*settings.width/12,0),oversize:rows.reduce((n,r)=>n+(r.length>settings.maxLength?r.count:0),0)};
}
