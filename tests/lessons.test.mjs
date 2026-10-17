import test from 'node:test';
import assert from 'node:assert/strict';
import { Lessons } from '../src/lessons.mjs';
import { Copy } from '../src/copy.mjs';
import { AppState } from '../src/state.mjs';
import { near } from './helpers.mjs';
test('guided checks have original bilingual feedback and correct alternatives',()=>{
 for(const language of ['zh','en'])for(let id=1;id<=6;id++)for(const stage of id===5||id===6?[0,1]:[0]){
  const lesson=Lessons.get(id,language,stage);assert.ok(lesson.title&&lesson.intro&&lesson.prediction&&lesson.explanation);assert.equal(lesson.choices.filter(x=>Lessons.check(id,stage,x.id).correct).length,1);for(const c of lesson.choices){const result=Lessons.check(id,stage,c.id);assert.ok(lesson.feedback[result.feedbackKey]);}
 }
 assert.deepEqual(Object.keys(Copy.all.zh).sort(),Object.keys(Copy.all.en).sort());
});
test('lesson numerical fixtures remain linked to real engine',()=>{
 let s=AppState.initial();const set=(type,args={})=>{s=AppState.reduce(s,{type,...args}).state;};
 set('ENTER_LESSON',{id:2});near(AppState.derive(s).prediction.density,[1.5,.5,0]);near(AppState.derive(s).grid[0][1],[0,.5]);
 set('ENTER_LESSON',{id:4});set('SET_TIME',{tau:Math.PI/4});near(AppState.derive(s).prediction.density,[1,1]);near(AppState.derive(s).prediction.pairProbability,1);
 set('ENTER_LESSON',{id:5});near(AppState.derive(s).annihilationInspection.output,[[Math.SQRT2,0],[0,0]]);set('SET_LESSON_STAGE',{stage:1});near(AppState.derive(s).annihilationInspection.output,[[1,0]]);
 set('ENTER_LESSON',{id:6});set('SET_LESSON_STAGE',{stage:1});set('SET_TIME',{tau:Math.PI/8});near(AppState.derive(s).prediction.density,[1-1/Math.SQRT2,1+1/Math.SQRT2]);
});
