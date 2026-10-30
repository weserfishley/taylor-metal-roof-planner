import {wallCells,getWalls} from './walls.mjs';
export const wallPanelDefaults={show:false,width:36,maxLength:20,allowance:0,color:'#82949e'};
export function wallPanelLayout(state){
 const settings={...wallPanelDefaults,...state.wallPanels},rows=[];
 for(const [index,wall]of getWalls(state).entries()){
  const {a,b,widthFeet,height}=wall;if(widthFeet<=0||height<=0)continue;
  const total=Math.ceil(widthFeet/(settings.width/12)-1e-7),length=Math.ceil((height+settings.allowance/12)*12-1e-7)/12,panels=[];
  if(total>12000)throw Error('Wall is too long for the selected coverage.');
  for(let i=0;i<total;i++){const start=i*settings.width/12,end=Math.min(widthFeet,(i+1)*settings.width/12),cells=wallCells(wall,start,end);if(!cells.length)continue;const at=x=>({x:a.x+(b.x-a.x)*x/widthFeet,y:a.y+(b.y-a.y)*x/widthFeet});panels.push({a:at(start),b:at(end),height,length,oversize:length>settings.maxLength,cells})}
  const cells=wallCells(wall),area=cells.reduce((sum,c)=>sum+(c.right-c.left)*(c.top-c.bottom),0);
  rows.push({...wall,edge:index+1,panels,count:panels.length,length,area,cells});
 }
 return {settings,rows,count:rows.reduce((n,r)=>n+r.count,0),area:rows.reduce((n,r)=>n+r.area,0),orderArea:rows.reduce((n,r)=>n+r.count*r.length*settings.width/12,0),oversize:rows.reduce((n,r)=>n+(r.length>settings.maxLength?r.count:0),0)};
}
