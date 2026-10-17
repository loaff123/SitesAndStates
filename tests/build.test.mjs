import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { Script } from 'node:vm';
test('build_self_contained and deterministic with runnable classic script syntax',()=>{
 execFileSync(process.execPath,['tools/build.mjs']);const a=readFileSync('dist/sites-and-states.html','utf8');
 execFileSync(process.execPath,['tools/build.mjs']);const b=readFileSync('dist/sites-and-states.html','utf8');assert.equal(a,b);
 assert.ok(a.length<300000,'Keep the offline app small.');
 assert.ok(!/<(?:script|img)[^>]+src=/i.test(a));assert.ok(!/<link[^>]+(?:stylesheet|preload)/i.test(a));
 const script=a.match(/<script>([\s\S]*?)<\/script>/)[1];assert.ok(!/\b(import|fetch|XMLHttpRequest|WebSocket)\s*\(/.test(script));assert.ok(!/\bimport\s/.test(script));new Script(script);
 for(const id of ['math','physics','representations','presets','copy','lessons','state','format','views','controls','app'])assert.equal((a.match(new RegExp(`module: ${id}\\.mjs`,'g'))||[]).length,1);
});
