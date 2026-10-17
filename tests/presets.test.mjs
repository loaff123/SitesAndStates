import test from 'node:test';
import assert from 'node:assert/strict';
import { C } from '../src/math.mjs';
import { Physics } from '../src/physics.mjs';
import { Presets } from '../src/presets.mjs';
import { near } from './helpers.mjs';
test('every compatible preset is normalized and incompatible states reject',()=>{
 for(const L of [2,3])for(const N of [1,2])for(const {id}of Presets.list({L,N})){const c=Presets.vector(id,{L,N});near(c.reduce((s,z)=>s+C.abs2(z),0),1);assert.equal(c.length,Physics.basis({L,N}).length);}
 assert.throws(()=>Presets.vector('phase-plus',{L:3,N:2}),/preset|compatible/i);
});
test('same density and gamma can hide different pairs',()=>{
 const s={L:2,N:2},a=Physics.predict(s,1,0,Presets.vector('split',s)),b=Physics.predict(s,1,0,Presets.vector('noon',s));
 near(a.density,[1,1]);near(b.density,[1,1]);near(a.gamma,b.gamma);near(a.pairs[0].value,1);near(b.pairs[0].value,0);near(a.pairProbability,0);near(b.pairProbability,1);
});
test('phase current sign and later density',()=>{
 const s={L:2,N:2};for(const [id,sign] of [['phase-plus',1],['phase-minus',-1]]){
  const c=Presets.vector(id,s),p=Physics.predict(s,1,0,c);near(c.map(C.abs2),[.25,.5,.25]);near(p.gamma[0][1],[0,sign]);near(p.currents,[2*sign]);
  const q=Physics.predict(s,1,0,Physics.evolve(Physics.hamiltonian(s,1,0),c,Math.PI/8));near(q.density,[1-sign/Math.SQRT2,1+sign/Math.SQRT2]);
 }
});
test('global phase changes no prediction',()=>{
 const s={L:3,N:2},c=Presets.vector('double-superposition',s),z=[Math.cos(.731),Math.sin(.731)],a=Physics.predict(s,.7,.6,c),b=Physics.predict(s,.7,.6,c.map(x=>C.mul(x,z)));
 near(a.density,b.density);near(a.gamma,b.gamma);near(a.pairProbability,b.pairProbability);near(a.energy,b.energy);near(a.currents,b.currents);near(a.fieldExpectations,b.fieldExpectations);a.pairs.forEach((p,i)=>near(p.value,b.pairs[i].value));
});
