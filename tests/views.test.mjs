import test from 'node:test';
import assert from 'node:assert/strict';
import { Views } from '../src/views.mjs';
import { Controls } from '../src/controls.mjs';
import { AppState } from '../src/state.mjs';
import { Lessons } from '../src/lessons.mjs';
const enter=id=>AppState.reduce(AppState.initial('en'),{type:'ENTER_LESSON',id}).state;
test('all amplitudes and distinct mathematical panels are rendered',()=>{
 let s=enter('sandbox');s=AppState.reduce(s,{type:'SET_SECTOR',L:3,N:2}).state;const html=Views.render(AppState.derive(s),s);
 assert.equal((html.match(/data-config=/g)||[]).length,6);assert.match(html,/Mean occupation/);assert.match(html,/phase undefined/);assert.match(html,/coordinate slot/i);assert.match(html,/mathematical norm/i);assert.match(html,/factorial moment/);
});
test('lesson-only controls cannot leak parameter sliders or editor',()=>{
 for(const id of [1,2,3,4,5,6]){const s=enter(id),html=Controls.render(s,Lessons.get(id,'en'));assert.ok(!html.includes('data-control="j"'));assert.ok(!html.includes('data-control="editor-'));if([1,2,3,5].includes(id))assert.ok(!html.includes('data-control="time-slider"'));}
 const s=enter('sandbox'),html=Controls.render(s,null);assert.match(html,/data-control="j"/);assert.match(html,/data-control="editor-start"/);
});
test('standing coordinates show extended profiles but preserve physical site heading',()=>{
 let s=enter(6);s=AppState.reduce(s,{type:'SET_BASIS',basis:'standing'}).state;const html=Views.render(AppState.derive(s),s);assert.match(html,/Profiles of extended modes/);assert.match(html,/not new localized sites/);assert.match(html,/Mean occupation/);
});
test('selected exchanged grid cells include a local combined probability',()=>{
 let s=enter(2);const html=Views.render(AppState.derive(s),s);assert.match(html,/data-grid-combined/);assert.match(html,/exchanged entries combined/);
});
