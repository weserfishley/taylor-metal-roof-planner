import * as THREE from './vendor/three.module.js';
import {planeData,FT,junctionReport} from './geometry.mjs';
export function createViewer(host){
 const renderer=new THREE.WebGLRenderer({antialias:true,alpha:false});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setClearColor('#0a2032');host.append(renderer.domElement);
 const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(40,1,.01,100000);scene.add(new THREE.HemisphereLight(0xd9f4ff,0x172838,2.5));const sun=new THREE.DirectionalLight(0xffffff,2);sun.position.set(30,70,20);scene.add(sun);
 let group=new THREE.Group();scene.add(group);let target=new THREE.Vector3(),radius=40,theta=.6,phi=.9,drag=null;
 function draw(){if(host.hidden)return;const w=host.clientWidth,h=host.clientHeight;if(!w||!h)return;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();camera.position.set(target.x+radius*Math.sin(phi)*Math.sin(theta),target.y+radius*Math.cos(phi),target.z+radius*Math.sin(phi)*Math.cos(theta));camera.lookAt(target);renderer.render(scene,camera)}
 renderer.domElement.addEventListener('pointerdown',e=>{drag={x:e.clientX,y:e.clientY};renderer.domElement.setPointerCapture(e.pointerId)});renderer.domElement.addEventListener('pointermove',e=>{if(!drag)return;theta-=(e.clientX-drag.x)*.009;phi=Math.max(.06,Math.min(Math.PI/2-.025,phi+(e.clientY-drag.y)*.009));drag={x:e.clientX,y:e.clientY};draw()});renderer.domElement.addEventListener('pointerup',()=>drag=null);renderer.domElement.addEventListener('pointercancel',()=>drag=null);renderer.domElement.addEventListener('wheel',e=>{e.preventDefault();radius=Math.max(1,Math.min(10000,radius*Math.exp(e.deltaY*.001)));draw()},{passive:false});new ResizeObserver(draw).observe(host);
 function clear(){group.traverse(x=>{x.geometry?.dispose();if(Array.isArray(x.material))x.material.forEach(m=>m.dispose());else x.material?.dispose()});scene.remove(group);group=new THREE.Group();scene.add(group)}
 function line(points,color,width=1){const g=new THREE.BufferGeometry().setFromPoints(points);const l=new THREE.Line(g,new THREE.LineBasicMaterial({color,linewidth:width}));group.add(l)}
 function mesh(points,data,color,offset=0){const contour=points.map(p=>new THREE.Vector2(p.x,p.y));const indices=THREE.ShapeUtils.triangulateShape(contour,[]).flat();const positions=points.flatMap(p=>[p.x,data.height(p)+offset,-p.y]);const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setIndex(indices);geometry.computeVertexNormals();group.add(new THREE.Mesh(geometry,new THREE.MeshStandardMaterial({color,metalness:.35,roughness:.5,side:THREE.DoubleSide,polygonOffset:true,polygonOffsetFactor:1,polygonOffsetUnits:1})));}
 function update(state,summary,showPanels,reset){clear();const faceData=new Map();for(const row of summary.rows){const data=planeData(row.face,state.origin);faceData.set(row.face.id,data);mesh(data.points,data,state.settings.color);const to3=(p,offset=0)=>new THREE.Vector3(p.x,data.height(p)+offset,-p.y);line([...data.points,data.points[0]].map(p=>to3(p,.015)),0x9ee7ff);if(showPanels)for(const panel of row.panels){line([...panel.polygon,panel.polygon[0]].map(p=>to3(p,.035)),panel.oversize?0xffb960:0xc5e3e9)}
 // Vertical reference lines make the entered low-edge height visible.
 for(const p of data.points)line([new THREE.Vector3(p.x,0,-p.y),to3(p)],0x274a60);
 }
 // Validate each shared seam against both pitched plane equations. Conflicts
 // stay visible instead of being hidden by moving user-authored geometry.
 for(const joint of junctionReport(state.faces,state.origin)){const left=faceData.get(joint.left.face.id),right=faceData.get(joint.right.face.id),color=joint.status==='aligned'?0x58e3a5:joint.status==='offset'?0xffc44d:0xff5573,toAverage=p=>new THREE.Vector3(p.x,(left.height(p)+right.height(p))/2+.06,-p.y);line([toAverage(joint.a),toAverage(joint.b)],color,3);if(joint.status!=='aligned')for(const p of [joint.a,joint.b])line([new THREE.Vector3(p.x,left.height(p),-p.y),new THREE.Vector3(p.x,right.height(p),-p.y)],0xff5573,3)}
 const bounds=new THREE.Box3().setFromObject(group);const size=new THREE.Vector3();if(!bounds.isEmpty()){bounds.getSize(size);if(reset){bounds.getCenter(target);radius=Math.max(size.x,size.y,size.z)*2.2+5}}else{target.set(0,0,0);radius=30}
 const gridSize=Math.max(30,Math.ceil(Math.max(size.x,size.z)*1.6/10)*10);const grid=new THREE.GridHelper(gridSize,Math.min(100,gridSize),0x35617a,0x18384f);grid.position.set(target.x,0,target.z);group.add(grid);draw();
 }
 return {update};
}
