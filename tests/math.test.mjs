import test from 'node:test';
import assert from 'node:assert/strict';
import { C, M } from '../src/math.mjs';
import { near, vector } from './helpers.mjs';
test('complex arithmetic preserves conjugation and imaginary signs',()=>{
  near(C.mul([1,2],[3,-4]),[11,2]); near(C.conj([2,3]),[2,-3]); near(C.abs2([3,4]),25);
  near(C.add([1,2],[3,4]),[4,6]); near(C.sub([1,2],[3,4]),[-2,-2]);
});
test('dense rectangular products and adjoints',()=>{
  const A=[vector([1,[0,1],2]),vector([3,0,4])];
  assert.equal(M.adjoint(A).length,3); near(M.apply(A,vector([1,2,3])),[[7,2],[15,0]]);
  near(M.inner(vector([[0,1],2]),vector([1,[0,1]])),[0,1]);
  near(M.mul(M.identity(2),A),A);
});
test('exponential exact zero and diagonal phases',()=>{
  near(M.expm(M.zeros(3,3)),M.identity(3));
  const A=[[[0,Math.PI], [0,0]], [[0,0],[0,-Math.PI/2]]];
  near(M.expm(A),[[[-1,0],[0,0]],[[0,0],[0,-1]]]);
});
test('exponential repeated eigenvalues and inverse retain unitarity',()=>{
  const A=[[[0,1],[0,2]],[[0,2],[0,1]]]; const U=M.expm(A);
  near(M.mul(M.adjoint(U),U),M.identity(2)); near(M.mul(U,M.expm(M.scale(A,[-1,0]))),M.identity(2));
});
test('invalid matrix shapes and nonfinite inputs fail visibly',()=>{
  assert.throws(()=>M.mul([[ [1,0] ]],M.identity(2)),/shape|dimension/i);
  assert.throws(()=>M.expm([[[1,0]],[[1,0],[2,0]]]),/shape|rectangular|square/i);
  assert.throws(()=>M.expm([[[Infinity,0]]]),/finite/i);
});
