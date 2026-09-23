import {project,validPolygon} from './geometry.mjs';

export const PROJECT_VERSION=4;
export const EDGE_TYPES=['Unlabeled','Ridge','Hip','Valley','Rake','Eave','Flashing'];
export const REPORT_EDGE_TYPES=['Ridge','Hip','Valley','Rake','Eave'];
const FACE_TYPES=['Main roof','Dormer','Porch','Garage'];
const cleanText=(value,max=300)=>String(value??'').replace(/[\u0000-\u001f\u007f]/g,' ').trim().slice(0,max);
const finite=(value,min,max,name)=>{const number=Number(value);if(!Number.isFinite(number)||number<min||number>max)throw Error(`Invalid ${name}`);return number};
const id=(value,prefix,index,used)=>{let next=cleanText(value,100);if(!next||used.has(next))next=`${prefix}-${index+1}-${Math.random().toString(36).slice(2,10)}`;used.add(next);return next};

export function createProjectState(){
 return {version:PROJECT_VERSION,address:'',origin:{lat:44.9385,lng:-123.0303},outlines:[],faces:[],settings:{width:16,maxLength:32,allowance:0,color:'#477785',autoSnap:true},materials:{panelType:'Standing seam',gauge:'26 ga',colorName:'Slate blue'},customer:{name:'',company:'',phone:'',email:''},quote:{projectName:'',number:'',date:new Date().toISOString().slice(0,10),validUntil:'',taxRate:0,materialPricePerSqFt:0,trimPrices:{Ridge:0,Hip:0,Valley:0,Rake:0,Eave:0},accessories:[],notes:''},panelOverrides:[],ui:{step:1,view:'map',showPanels:false,selectedFaceId:null,selectedOutlineId:null,selectedEdge:null,map:null,camera:null}};
}

export function snapshotProject(state,ui={}){
 const copy=structuredClone(state);
 copy.version=PROJECT_VERSION;
 copy.ui={...createProjectState().ui,...copy.ui,...structuredClone(ui)};
 return copy;
}

export function parseProject(input){
 const raw=typeof input==='string'?JSON.parse(input):structuredClone(input);
 if(!raw||![2,3,4].includes(raw.version)||!Array.isArray(raw.faces))throw Error('Unsupported or missing project-file version');
 if(raw.faces.length>100)throw Error('Project has too many roof planes');
 const origin={lat:finite(raw.origin?.lat,-85,85,'project latitude'),lng:finite(raw.origin?.lng,-180,180,'project longitude')};
 const validatePoints=(points,label)=>{
  if(!Array.isArray(points)||points.length<3||points.length>300)throw Error(`${label} has an invalid number of points`);
  const clean=points.map((point,index)=>({lat:finite(point?.lat,-85,85,`${label} point ${index+1} latitude`),lng:finite(point?.lng,-180,180,`${label} point ${index+1} longitude`)}));
  if(!validPolygon(clean.map(point=>project(point,origin))))throw Error(`${label} crosses itself or is too small`);
  return clean;
 };
 const used=new Set();
 const faces=raw.faces.map((face,index)=>{
  const points=validatePoints(face.points,`Roof plane ${index+1}`);
  return {id:id(face.id,'plane',index,used),name:cleanText(face.name||`Plane ${index+1}`,60)||`Plane ${index+1}`,type:FACE_TYPES.includes(face.type)?face.type:'Main roof',pitch:finite(face.pitch,0,24,`plane ${index+1} pitch`),bearing:finite(face.bearing,0,359,`plane ${index+1} direction`),eave:finite(face.eave,0,200,`plane ${index+1} low-edge height`),points,edges:points.map((_,edgeIndex)=>EDGE_TYPES.includes(face.edges?.[edgeIndex])?face.edges[edgeIndex]:'Unlabeled')};
 });
 const rawOutlines=raw.version>=3&&Array.isArray(raw.outlines)?raw.outlines:[];
 if(rawOutlines.length>20)throw Error('Project has too many outlines');
 const outlines=rawOutlines.map((outline,index)=>({id:id(outline.id,'outline',index,used),name:cleanText(outline.name||`Roof outline ${index+1}`,60)||`Roof outline ${index+1}`,points:validatePoints(outline.points,`Roof outline ${index+1}`)}));
 const defaults=createProjectState(),settings=raw.settings||{};
 const cleanSettings={width:finite(settings.width,1,120,'panel coverage width'),maxLength:finite(settings.maxLength,1,200,'maximum panel length'),allowance:finite(settings.allowance,0,48,'panel allowance'),color:/^#[a-f\d]{6}$/i.test(settings.color||'')?settings.color:defaults.settings.color,autoSnap:settings.autoSnap!==false};
 const materials={panelType:cleanText(raw.materials?.panelType||'Standing seam',80)||'Standing seam',gauge:cleanText(raw.materials?.gauge||'26 ga',30)||'26 ga',colorName:cleanText(raw.materials?.colorName||'Custom color',60)||'Custom color'};
 const customer={name:cleanText(raw.customer?.name,100),company:cleanText(raw.customer?.company,100),phone:cleanText(raw.customer?.phone,50),email:cleanText(raw.customer?.email,120)};
 const sourceQuote=raw.quote||{},trimPrices={};for(const type of REPORT_EDGE_TYPES)trimPrices[type]=finite(sourceQuote.trimPrices?.[type]??0,0,10000,`${type.toLowerCase()} price`);
 const accessories=Array.isArray(sourceQuote.accessories)?sourceQuote.accessories.slice(0,100).map((item,index)=>({description:cleanText(item?.description||`Additional item ${index+1}`,120),quantity:finite(item?.quantity??0,0,100000,`additional item ${index+1} quantity`),unitPrice:finite(item?.unitPrice??0,0,1000000,`additional item ${index+1} price`)})).filter(item=>item.description&&item.quantity>0):[];
 const quote={projectName:cleanText(sourceQuote.projectName,120),number:cleanText(sourceQuote.number,50),date:cleanText(sourceQuote.date,20),validUntil:cleanText(sourceQuote.validUntil,20),taxRate:finite(sourceQuote.taxRate??0,0,100,'tax rate'),materialPricePerSqFt:finite(sourceQuote.materialPricePerSqFt??0,0,10000,'panel material price'),trimPrices,accessories,notes:cleanText(sourceQuote.notes,5000)};
 const sourceUi=raw.ui||{},views=['map','plan','three'],mapView=sourceUi.map||raw.view||null;
 const mapState=mapView?.center&&Number.isFinite(Number(mapView.center.lat))&&Number.isFinite(Number(mapView.center.lng))?{center:{lat:finite(mapView.center.lat,-85,85,'map latitude'),lng:finite(mapView.center.lng,-180,180,'map longitude')},zoom:finite(mapView.zoom??18,3,23,'map zoom')}:null;
 const selectedFaceId=faces.some(face=>face.id===sourceUi.selectedFaceId)?sourceUi.selectedFaceId:null,selectedOutlineId=outlines.some(outline=>outline.id===sourceUi.selectedOutlineId)?sourceUi.selectedOutlineId:null;
 const camera=sourceUi.camera&&['target','radius','theta','phi'].every(key=>key==='target'||Number.isFinite(Number(sourceUi.camera[key])))?{target:{x:finite(sourceUi.camera.target?.x,-100000,100000,'camera target x'),y:finite(sourceUi.camera.target?.y,-100000,100000,'camera target y'),z:finite(sourceUi.camera.target?.z,-100000,100000,'camera target z')},radius:finite(sourceUi.camera.radius,1,10000,'camera radius'),theta:finite(sourceUi.camera.theta,-1000,1000,'camera angle'),phi:finite(sourceUi.camera.phi,.01,Math.PI/2,'camera elevation')}:null;
 const ui={step:Math.round(finite(sourceUi.step??1,1,5,'workflow step')),view:views.includes(sourceUi.view)?sourceUi.view:'map',showPanels:Boolean(sourceUi.showPanels),selectedFaceId,selectedOutlineId,selectedEdge:cleanText(sourceUi.selectedEdge,200)||null,map:mapState,camera};
 return {version:PROJECT_VERSION,address:cleanText(raw.address,300),origin,outlines,faces,settings:cleanSettings,materials,customer,quote,panelOverrides:Array.isArray(raw.panelOverrides)?structuredClone(raw.panelOverrides.slice(0,500)):[],ui};
}
