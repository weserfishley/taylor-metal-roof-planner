import assert from 'node:assert/strict';
import {FT,gableHouseTemplate,unproject,summarize,planeData} from './dist/geometry.mjs';
import {createProjectState,snapshotProject,parseProject} from './dist/project.mjs';
const state=createProjectState();state.building={kind:'multi-gable',parts:[]};
for(const [index,name] of ['Bedroom','Garage','Office'].entries()){
 const part=gableHouseTemplate({widthFeet:20,depthFeet:16,pitch:6,eaveHeight:10,centerXFeet:index*24,name});
 const footprint=part.footprint.map(p=>unproject(p,state.origin));
 state.building.parts.push({id:`part-${index}`,name,wallHeight:10,footprint});
 state.faces.push(...part.faces.map((face,j)=>({...face,id:`face-${index}-${j}`,points:face.points.map(p=>unproject(p,state.origin))})));
}
const restored=parseProject(JSON.stringify(snapshotProject(state)));
assert.deepEqual(restored.building,state.building);assert.equal(restored.faces.length,6);
assert.ok(Math.abs(summarize(restored.faces,restored.origin,restored.settings).flat-960)<1e-5);
const d=planeData(restored.faces[4],restored.origin);assert.ok(Math.abs(d.height(d.points[2])/FT-14)<1e-5);
assert.throws(()=>parseProject({...snapshotProject(state),building:{parts:[{wallHeight:10,footprint:[]}]}}),/footprint/i);
console.log('PASS: three named sections, offset geometry, ridge heights, combined takeoff, and complete section save/load');
