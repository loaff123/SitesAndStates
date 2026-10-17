import { Physics } from './physics.mjs';
function list(sector){
  Physics.basis(sector);if(![1,2].includes(sector.N))throw new Error('Presets require N=1 or 2.');
  const ids=['left','right'];
  if(sector.N===1)ids.push('uniform');else if(sector.L===2)ids.push('split','noon','phase-plus','phase-minus');else ids.push('edges','double-superposition');
  return ids.map(id=>({id,labelKey:`preset.${id}`}));
}
function vector(id,sector){
  if(!list(sector).some(p=>p.id===id))throw new Error('Preset is not compatible with this sector.');
  const states=Physics.basis(sector),c=states.map(()=>[0,0]);
  const put=(occupation,z)=>{const index=states.findIndex(n=>n.every((x,i)=>x===occupation[i]));c[index]=z;};
  if(id==='left')c[0]=[1,0];if(id==='right')c[c.length-1]=[1,0];
  if(id==='uniform')c.forEach((_,i)=>{c[i]=[1/Math.sqrt(sector.L),0];});
  if(id==='split')c[1]=[1,0];if(id==='noon'){c[0]=[1/Math.SQRT2,0];c[2]=[1/Math.SQRT2,0];}
  if(id==='phase-plus'||id==='phase-minus'){c[0]=[.5,0];c[1]=[0,(id==='phase-plus'?1:-1)/Math.SQRT2];c[2]=[-.5,0];}
  if(id==='edges')put([1,0,1],[1,0]);
  if(id==='double-superposition')states.forEach((n,i)=>{if(n.includes(2))c[i]=[1/Math.sqrt(3),0];});
  return c;
}
export const Presets=Object.freeze({list,vector});
