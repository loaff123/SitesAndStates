import assert from 'node:assert/strict';
export const z = x => [x, 0];
export const vector = xs => xs.map(x => Array.isArray(x) ? x : z(x));
export function near(actual,expected,tolerance=1e-10) {
  if (Array.isArray(expected)) { assert.equal(actual.length,expected.length); expected.forEach((x,i)=>near(actual[i],x,tolerance)); }
  else assert.ok(Number.isFinite(actual) && Math.abs(actual-expected)<=tolerance, `${actual} != ${expected} (tol ${tolerance})`);
}
export function random(seed=2401) { let s=seed>>>0; return ()=>{s=(1664525*s+1013904223)>>>0; return s/4294967296;}; }
export function randomVector(n,rng=random()) { const c=Array.from({length:n},()=>[rng()-.5,rng()-.5]); const norm=Math.sqrt(c.reduce((s,[r,i])=>s+r*r+i*i,0)); return c.map(([r,i])=>[r/norm,i/norm]); }
