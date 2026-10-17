/** Controller regression tests adapted from independent review reproductions. This is a minimal mock, NOT a browser.
 * It models innerHTML removing old nodes and focus falling to body; it does not
 * model layout, accessibility trees, native pointer capture, or native widgets.
 * Run: node --test tests/controller.test.mjs
 * These tests preserve the real regression assertions; they do not qualify browser behavior.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { App } from '../src/app.mjs';

function fixture(t) {
  const listeners = {};
  let elements = [], raw = '', rafId = 0;
  const frames = new Map();
  const body = {tag: 'body', dataset: {}};
  const document = {
    activeElement: body, documentElement: {}, hidden: false,
    addEventListener() {}, removeEventListener() {}
  };
  globalThis.document = document;
  globalThis.window = {
    scrollX: 0, scrollY: 0, scrollTo() {},
    matchMedia() { return {matches: false, addEventListener() {}, removeEventListener() {}}; }
  };
  globalThis.requestAnimationFrame = callback => {frames.set(++rafId, callback); return rafId;};
  globalThis.cancelAnimationFrame = id => frames.delete(id);
  const root = {
    contains: x => elements.includes(x),
    addEventListener: (key, callback) => {listeners[key] = callback;},
    removeEventListener() {},
    querySelectorAll(selector) {
      if (selector === '[data-control]') return elements.filter(x => x.dataset.control);
      if (selector === 'details[data-details]') return elements.filter(x => x.tag === 'details' && x.dataset.details);
      return [];
    },
    querySelector(selector) {
      if (selector === '[data-status]') return elements.find(x => 'status' in x.dataset);
      const match = selector.match(/data-control="([^"]+)"/);
      return match ? elements.find(x => x.dataset.control === match[1]) : null;
    },
    set innerHTML(value) {
      raw = value;
      if (elements.includes(document.activeElement)) document.activeElement = body;
      elements = [...value.matchAll(/<(\w+)([^>]*)>/g)].map(([, tag, attrs]) => {
        const dataset = Object.fromEntries([...attrs.matchAll(/data-([\w-]+)(?:="([^"]*)")?/g)]
          .map(([, key, value]) => [key.replace(/-([a-z])/g, (_, c) => c.toUpperCase()), value ?? '']));
        return {
          tag, dataset,
          open: tag === 'details' && /\sopen(?:\s|$)/.test(attrs),
          value: attrs.match(/\bvalue="([^"]*)"/)?.[1] ?? '',
          textContent: dataset.control==='play' ? (value.match(/data-control="play">([^<]+)/)?.[1]??'') : '',
          selectionStart: 0, selectionEnd: 0,
          focus() { document.activeElement = this; },
          setSelectionRange(a, b) { this.selectionStart = a; this.selectionEnd = b; },
          closest() { return this; }
        };
      });
    },
    get innerHTML() { return raw; }
  };
  const app = App.mount(root);
  app.dispatch({type: 'ENTER_LESSON', id: 'sandbox'});
  t.after(() => app.destroy());
  return {
    app, root, document, frames, listeners,
    control: id => root.querySelector(`[data-control="${id}"]`),
    summary: () => elements.find(x => x.tag === 'summary'),
    click(id) { listeners.click({target: root.querySelector(`[data-control="${id}"]`), preventDefault() {}}); }
  };
}

test('mock: amplitude strings and active editor selection survive language redraw', t => {
  const f = fixture(t);
  f.app.dispatch({type: 'SET_EDITOR_DRAFT', draft: [{re: '-', im: '1e'}, {re: '0', im: '0'}, {re: '0', im: '0'}]});
  const input = f.control('editor-0-im'); input.focus(); input.setSelectionRange(1, 2);
  f.app.dispatch({type: 'SET_LANGUAGE', language: 'en'});
  assert.equal(f.control('editor-0-im').value, '1e');
  assert.equal(f.document.activeElement.dataset.control, 'editor-0-im');
  assert.equal(f.document.activeElement.selectionStart, 1);
  assert.equal(f.document.activeElement.selectionEnd, 2);
});

test('mock: unfinished time entry survives language redraw', t => {
  const f = fixture(t), input = f.control('time-entry'); input.value = '1e'; input.focus();
  f.listeners.input({target:input});
  f.app.dispatch({type: 'SET_LANGUAGE', language: 'en'});
  assert.equal(f.control('time-entry').value, '1e');
});

test('mock: summary focus survives an ordinary time redraw', t => {
  const f = fixture(t); f.summary().focus();
  f.app.dispatch({type: 'SET_TIME', tau: 0.1});
  assert.equal(f.document.activeElement.tag, 'summary');
});

test('mock: input event keeps the active native range node attached', t => {
  const f = fixture(t), input = f.control('time-slider'); input.value = '0.2'; input.focus();
  f.listeners.input({target: input});
  assert.ok(input === f.control('time-slider'), 'The original range node was removed during its own input event.');
});

test('mock: editing a draft pauses playback and refreshes the playback label', t => {
  const f = fixture(t);
  f.app.dispatch({type: 'SET_LANGUAGE', language: 'en'});
  f.app.dispatch({type: 'SET_EDITOR_DRAFT', draft: [{re: '1', im: '0'}, {re: '0', im: '0'}, {re: '0', im: '0'}]});
  f.click('play');
  const input = f.control('editor-0-re'); input.value = '-'; input.focus();
  f.listeners.input({target: input});
  assert.equal(f.frames.size, 0, 'Playback has stopped.');
  assert.equal(f.control('play').textContent, 'Play');
});
