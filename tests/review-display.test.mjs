/** Public regression coverage for independently discovered display/export issues. */
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { AppState as A } from '../src/state.mjs';
import { Views } from '../src/views.mjs';
import { Format as F } from '../src/format.mjs';
const act = (s, type, payload = {}) => A.reduce(s, {type, ...payload}).state;

test('a tiny nonzero annihilation output is not called an exact zero vector', () => {
  let s = act(A.initial('en'), 'ENTER_LESSON', {id: 'sandbox'});
  s = act(s, 'SET_SECTOR', {L: 2, N: 1});
  s = act(s, 'SET_EDITOR_DRAFT', {draft: [{re: '1e-13', im: '0'}, {re: '1', im: '0'}]});
  s = act(s, 'PREPARE_EDITOR');
  const vm = A.derive(s);
  assert.equal(vm.annihilationInspection.output[0][0], 1e-13);
  assert.ok(!Views.render(vm, s).includes('This map annihilates this particular input vector'));
});

test('display values above the stated tiny-noise threshold remain nonzero', () => {
  for (const value of [1e-7, -1e-7, 1e-8, 1e-12]) {
    assert.notEqual(Number(F.number(value)), 0, `The nonzero value ${value} displayed as ${F.number(value)}.`);
  }
});

test('standalone export carries copyright, MIT permission notice and CC link', () => {
  const html = readFileSync(new URL('../dist/sites-and-states.html', import.meta.url), 'utf8');
  assert.ok(html.includes('Copyright (c) 2026 Sites and States contributors'));
  assert.ok(html.includes('Permission is hereby granted'));
  assert.ok(html.includes('https://creativecommons.org/licenses/by/4.0/'));
});
