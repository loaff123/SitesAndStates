import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { C, M } from '../src/math.mjs';
import { Physics } from '../src/physics.mjs';
import { Representations as R } from '../src/representations.mjs';
import { near } from './helpers.mjs';
const fixture=JSON.parse(readFileSync(new URL('./fixtures/oracle.json',import.meta.url),'utf8'));
let maxError=0,cases=0;
function compare(a,b){if(Array.isArray(b)){assert.equal(a.length,b.length);b.forEach((v,i)=>compare(a[i],v));}else {maxError=Math.max(maxError,Math.abs(a-b));near(a,b);}}
test('oracle_H_evolution_observables independent first-quantized construction',()=>{
 assert.equal(fixture.schemaVersion,1);
 for(const model of fixture.models){
  const {sector,j,u,H,states,S,modeH}=model;assert.deepEqual(Physics.basis(sector),model.basis);compare(Physics.hamiltonian(sector,j,u),H);compare(R.lift(sector,R.standingModes(sector.L)),S);compare(R.operator(H,S),modeH);
  for(const state of states)for(const expected of state.evolutions){
   const c=Physics.evolve(H,state.input,expected.tau),p=Physics.predict(sector,j,u,c);compare(c,expected.vector);compare(p.density,expected.density);compare(p.gamma,expected.gamma);compare(p.currents,expected.currents);compare(p.energy,expected.energy);compare(p.norm,1);compare(p.pairs.map(x=>x.value),expected.pairs);if(sector.N===2)compare(p.pairProbability,expected.pairProbability);cases++;
  }
 }
 console.log(`Independent oracle: ${cases} evolutions; max absolute error ${maxError}`);
});
test('analytic spectra through traces of powers include exact degeneracy',()=>{
 for(const j of [0,.7,1,2])for(const u of [0,.6,4]){
  const H=Physics.hamiltonian({L:2,N:2},j,u),eigen=[u,(u-Math.sqrt(u*u+16*j*j))/2,(u+Math.sqrt(u*u+16*j*j))/2];let power=M.identity(3);
  for(let k=1;k<=3;k++){power=M.mul(power,H);near(power.reduce((s,row,i)=>s+row[i][0],0),eigen.reduce((s,x)=>s+x**k,0));}
  const H3=Physics.hamiltonian({L:3,N:2},j,u);near(H3.reduce((s,row,i)=>s+row[i][0],0),3*u);near(M.mul(H3,H3).reduce((s,row,i)=>s+row[i][0],0),3*u*u+20*j*j);
 }
 for(const j of [0,.7,1,2]){const H=Physics.hamiltonian({L:3,N:2},j,0),e=[-2*Math.SQRT2*j,-Math.SQRT2*j,0,0,Math.SQRT2*j,2*Math.SQRT2*j];let P=M.identity(6);for(let k=1;k<=6;k++){P=M.mul(P,H);near(P.reduce((s,r,i)=>s+r[i][0],0),e.reduce((s,x)=>s+x**k,0),1e-10);}}
});
test('zero fixed-number expectation is direct-sum orthogonality, not zero operator',()=>{
 for(const L of [2,3])for(const N of [1,2]){
  const s={L,N},d=Physics.basis(s).length,lower=Physics.basis({L,N:N-1}).length;
  for(let site=0;site<L;site++){
   const a=Physics.annihilation(s,site),full=M.zeros(lower+d,lower+d);a.forEach((row,i)=>row.forEach((z,j)=>{full[i][lower+j]=z;}));
   for(let k=0;k<d;k++){const c=Array.from({length:lower+d},(_,i)=>[+(i===lower+k),0]);near(M.inner(c,M.apply(full,c)),[0,0]);near(M.inner(M.apply(full,c),M.apply(full,c))[0],Physics.basis(s)[k][site]);}
  }
 }
});
