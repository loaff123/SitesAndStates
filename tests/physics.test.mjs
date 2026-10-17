import test from 'node:test';
import assert from 'node:assert/strict';
import { M } from '../src/math.mjs';
import { Physics } from '../src/physics.mjs';
import { near, vector, randomVector, random } from './helpers.mjs';
test('basis_order_and_dimension',()=>{
  assert.deepEqual(Physics.basis({L:2,N:1}),[[1,0],[0,1]]);
  assert.deepEqual(Physics.basis({L:2,N:2}),[[2,0],[1,1],[0,2]]);
  assert.deepEqual(Physics.basis({L:3,N:1}),[[1,0,0],[0,1,0],[0,0,1]]);
  assert.deepEqual(Physics.basis({L:3,N:2}),[[2,0,0],[1,1,0],[1,0,1],[0,2,0],[0,1,1],[0,0,2]]);
});
test('rectangular_map_and_number',()=>{
  const s={L:2,N:2},A=Physics.annihilation(s,0); assert.equal(A.length,2);assert.equal(A[0].length,3);
  near(M.apply(A,vector([1,0,0])),vector([Math.SQRT2,0]));
  near(M.mul(M.adjoint(A),A),[[[2,0],[0,0],[0,0]],[[0,0],[1,0],[0,0]],[[0,0],[0,0],[0,0]]]);
  near(M.apply(Physics.annihilation({L:2,N:1},0),vector([1,0])),vector([1]));
  for(const L of [2,3]) for(const N of [1,2]) for(let site=0;site<L;site++){
    const A=Physics.annihilation({L,N},site),B=Physics.annihilation({L,N:N+1},site);
    near(M.mul(M.adjoint(A),A),Physics.bilinear({L,N},site,site));
    near(M.add(M.mul(B,M.adjoint(B)),M.scale(M.mul(M.adjoint(A),A),[-1,0])),M.identity(Physics.basis({L,N}).length));
  }
});
test('analytic_split_trajectory',()=>{
  for(const j of [.25,1,2]) for(let k=0;k<=80;k++){
    const tau=k/20,c=Physics.evolve(Physics.hamiltonian({L:2,N:2},j,0),vector([0,1,0]),tau);
    near(c,[[0,Math.sin(2*j*tau)/Math.SQRT2],[Math.cos(2*j*tau),0],[0,Math.sin(2*j*tau)/Math.SQRT2]]);
    const p=Physics.predict({L:2,N:2},j,0,c);near(p.density,[1,1]);near(p.pairProbability,Math.sin(2*j*tau)**2);
  }
});
test('diagonal zero hopping and N1 interaction independence',()=>{
  const s={L:3,N:2}, c=randomVector(6),tau=.7,u=4;
  const expected=c.map((x,k)=>[0,3,5].includes(k)?[x[0]*Math.cos(u*tau)+x[1]*Math.sin(u*tau),x[1]*Math.cos(u*tau)-x[0]*Math.sin(u*tau)]:x);
  near(Physics.evolve(Physics.hamiltonian(s,0,u),c,tau),expected);
  for(const L of [2,3]) near(Physics.hamiltonian({L,N:1},1,0),Physics.hamiltonian({L,N:1},1,4));
});
test('norm energy number and time reversal at extreme controls',()=>{
  const rng=random();
  for(const L of [2,3]) for(const N of [1,2]) for(const j of [0,.7,1,2]) for(const u of [0,.6,4]){
    const s={L,N},H=Physics.hamiltonian(s,j,u),c=randomVector(Physics.basis(s).length,rng),t=2*Math.PI;
    const ct=Physics.evolve(H,c,t),p=Physics.predict(s,j,u,ct),p0=Physics.predict(s,j,u,c);
    near(p.norm,1);near(p.density.reduce((a,b)=>a+b,0),N);near(p.energy,p0.energy);near(Physics.evolve(H,ct,-t),c);
  }
});
test('invalid sector vector and operator sites are rejected',()=>{
  assert.throws(()=>Physics.basis({L:4,N:1}),/sector/i);
  assert.throws(()=>Physics.annihilation({L:2,N:0},0),/sector|vacuum/i);
  assert.throws(()=>Physics.annihilation({L:2,N:1},2),/site/i);
  assert.throws(()=>Physics.evolve(Physics.hamiltonian({L:2,N:1},1,0),vector([0,0]),1),/norm/i);
  assert.throws(()=>Physics.evolve([[[0,0],[1,0]],[[0,0],[0,0]]],vector([1,0]),1),/Hermitian/i);
});
