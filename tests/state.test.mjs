import test from 'node:test';
import assert from 'node:assert/strict';
import { AppState as A } from '../src/state.mjs';
import { Physics } from '../src/physics.mjs';
import { Presets } from '../src/presets.mjs';
import { near } from './helpers.mjs';
const act=(s,type,payload={})=>A.reduce(s,{type,...payload}).state;
const sandbox=()=>act(A.initial(),'ENTER_LESSON',{id:'sandbox'});
test('lesson_initials_and_controls',()=>{
 let s=A.initial();assert.deepEqual(s.sector,{L:2,N:1});near(s.preparedSiteVector,[[1,0],[0,0]]);
 for(const id of [1,2,3,4,5,6]){s=act(s,'ENTER_LESSON',{id});const initial=s.preparedSiteVector;s=act(s,'SET_PARAMETERS',{j:2,u:4});near(s.preparedSiteVector,initial);assert.equal(s.j,1);assert.equal(s.u,0);assert.equal(s.tau,0);assert.equal(act(s,'SET_EDITOR_DRAFT',{draft:[{re:'1',im:'0'}]}).editorDraft,null);if([1,2,3,5].includes(id))assert.equal(act(s,'SET_TIME',{tau:1}).tau,0);}
});
test('reset_contract_all_sectors',()=>{
 let s=sandbox();for(const L of [2,3])for(const N of [1,2]){s=act(s,'SET_SECTOR',{L,N});assert.deepEqual(s.sector,{L,N});assert.equal(s.j,1);assert.equal(s.u,0);assert.equal(s.tau,0);assert.equal(s.displayBasis,'site');near(s.preparedSiteVector,Presets.vector('left',{L,N}));s=act(s,'SET_PARAMETERS',{j:.7,u:.6});s=act(s,'SET_TIME',{tau:.4});s=act(s,'SET_BASIS',{basis:'standing'});}
 s=act(s,'RESET');assert.deepEqual(s.sector,{L:2,N:2});near(s.preparedSiteVector,Presets.vector('split',s.sector));assert.equal(s.displayBasis,'site');
 s=act(s,'ENTER_LESSON',{id:6});s=act(s,'SET_LESSON_STAGE',{stage:1});s=act(s,'PREPARE_PRESET',{id:'phase-minus'});s=act(s,'SET_TIME',{tau:Math.PI/8});s=act(s,'SET_LESSON_STAGE',{stage:0});near(s.preparedSiteVector,Presets.vector('split',s.sector));assert.equal(s.tau,0);
});
test('parameter change restores the prepared state instead of making a hidden quench',()=>{
 let s=sandbox();s=act(s,'SET_TIME',{tau:Math.PI/4});s=act(s,'SET_PARAMETERS',{j:0,u:4});assert.equal(s.tau,0);near(A.derive(s).siteVector,Presets.vector('split',s.sector));
});
test('passive_at_interacting_nonzero_time',()=>{
 let s=sandbox();s=act(s,'SET_SECTOR',{L:3,N:2});s=act(s,'SET_PARAMETERS',{j:.7,u:.6});s=act(s,'SET_TIME',{tau:.13});const a=A.derive(s);s=act(s,'SET_BASIS',{basis:'standing'});const b=A.derive(s);assert.equal(s.tau,.13);near(a.siteVector,b.siteVector);near(a.prediction.density,b.prediction.density);near(a.prediction.gamma,b.prediction.gamma);assert.notDeepEqual(a.displayVector,b.displayVector);
});
test('numeric_draft_language_and_invalid_input',()=>{
 let s=sandbox();const draft=[{re:'-',im:'1e'},{re:'',im:'0'},{re:'0',im:'0'}];s=act(s,'SET_EDITOR_DRAFT',{draft});s=act(s,'SET_LANGUAGE',{language:'en'});assert.deepEqual(s.editorDraft,draft);const old=s.preparedSiteVector;s=act(s,'PREPARE_EDITOR');near(s.preparedSiteVector,old);assert.equal(s.statusKey,'status.invalidDraft');
 for(const re of ['0','Infinity','1000001']){s=act(s,'SET_EDITOR_DRAFT',{draft:[{re,im:'0'},{re:'0',im:'0'},{re:'0',im:'0'}]});s=act(s,'PREPARE_EDITOR');near(s.preparedSiteVector,old);}
 s=act(s,'SET_EDITOR_DRAFT',{draft:[{re:'2',im:'0'},{re:'0',im:'0'},{re:'0',im:'0'}]});s=act(s,'PREPARE_EDITOR');near(s.preparedSiteVector,[[1,0],[0,0],[0,0]]);assert.equal(s.statusArgs.norm,2);
 s=act(s,'SET_BASIS',{basis:'standing'});s=act(s,'SET_EDITOR_DRAFT',{draft:[{re:'1',im:'0'},{re:'0',im:'0'},{re:'0',im:'0'}]});s=act(s,'PREPARE_EDITOR');near(A.derive(s).displayVector,[[1,0],[0,0],[0,0]]);
 s=act(s,'SET_EDITOR_DRAFT',{draft});s=act(s,'SET_BASIS',{basis:'site'});assert.equal(s.editorDraft,null);assert.equal(s.statusArgs.draftCanceled,true);
});
test('rapid actions are deterministic and refuse unsupported input',()=>{
 let s=sandbox();for(let k=0;k<30;k++){s=act(s,'SET_TIME',{tau:k/10});s=act(s,'SET_BASIS',{basis:k%2?'standing':'site'});}near(A.derive(s).siteVector,Physics.evolve(Physics.hamiltonian(s.sector,s.j,s.u),s.preparedSiteVector,s.tau));
 const before=s;s=act(s,'SET_TIME',{tau:Infinity});assert.equal(s.tau,before.tau);s=act(s,'SET_SECTOR',{L:7,N:2});assert.deepEqual(s.sector,before.sector);s=act(s,'ENTER_LESSON',{id:99});assert.equal(s.lessonId,before.lessonId);
});
test('site coordinate-grid highlighting cannot masquerade as standing-mode configuration',()=>{
 let s=sandbox();s=act(s,'SET_BASIS',{basis:'standing'});s=act(s,'SELECT_GRID_CONFIGURATION',{index:1});assert.equal(s.selectedConfiguration,null);assert.equal(s.selectedGridConfiguration,1);assert.equal(s.displayBasis,'standing');
 s=act(s,'SET_BASIS',{basis:'site'});s=act(s,'SELECT_GRID_CONFIGURATION',{index:1});assert.equal(s.selectedConfiguration,1);
});
test('unfinished time drafts are preserved on language change and cleared on explicit apply or reset',()=>{
 let s=sandbox();s=act(s,'SET_TIME_DRAFT',{value:'1e'});s=act(s,'SET_LANGUAGE',{language:'en'});assert.equal(s.timeDraft,'1e');assert.equal(s.tau,0);
 s=act(s,'SET_TIME',{tau:.13});assert.equal(s.timeDraft,null);s=act(s,'SET_TIME_DRAFT',{value:'-'});s=act(s,'RESET');assert.equal(s.timeDraft,null);
});
