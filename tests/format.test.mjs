import test from 'node:test';
import assert from 'node:assert/strict';
import { Format } from '../src/format.mjs';
test('format_phase_and_zero',()=>{
 assert.match(Format.phase([0,0],'en'),/undefined/);
 assert.match(Format.phase([0,1e-14],'en'),/unresolved/);
 assert.match(Format.phase([0,1],'en'),/1\.570796/);
 assert.match(Format.phase([0,-1],'en'),/-1\.570796/);
 assert.equal(Format.number(-1e-14),'0');assert.match(Format.ket([2,0],'standing'),/b/);assert.match(Format.ket([1,1],'site'),/a/);
 assert.match(Format.escape('<script>&"'),/&lt;script&gt;&amp;&quot;/);
});
test('small nonzero values retain significant digits and normalization never reports false zero',()=>{
 for(const value of [1e-7,-1e-7,1e-8,1e-12,1.23456789e-6])assert.ok(Math.abs((Number(Format.number(value))-value)/value)<1e-4);
 assert.notEqual(Format.complex([0,1e-7]),'0');assert.equal(Format.number(-0),'0');
});
