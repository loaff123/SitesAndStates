import { C, M } from './math.mjs';
import { Physics } from './physics.mjs';
import { Representations } from './representations.mjs';
import { Presets } from './presets.mjs';
import { Lessons } from './lessons.mjs';
function initial(language='zh'){return {...Lessons.initial(1),language,editorDraft:null,answerState:null,statusKey:'status.ready',statusArgs:{}};}
function result(state,pause=false,announce=false){return {state,effects:{pause,announce}};}
function status(state,key,args={},pause=true){return result({...state,statusKey:key,statusArgs:args},pause,true);}
function derive(state){
  const {sector,j,u,tau,preparedSiteVector,displayBasis,mapSite}=state,H=Physics.hamiltonian(sector,j,u),siteVector=Physics.evolve(H,preparedSiteVector,tau);
  const q=Representations.standingModes(sector.L),S=Representations.lift(sector,q),prediction=Physics.predict(sector,j,u,siteVector),base=Physics.predict(sector,j,u,preparedSiteVector);
  if(Math.abs(prediction.norm-1)>1e-10||Math.abs(prediction.density.reduce((a,b)=>a+b,0)-sector.N)>1e-10||Math.abs(prediction.energy-base.energy)>1e-10)throw new Error('Numerical invariant check failed.');
  const A=Physics.annihilation(sector,mapSite),output=M.apply(A,siteVector);
  return {siteVector,displayVector:displayBasis==='site'?siteVector:Representations.coordinates(siteVector,S),sectorBasis:Physics.basis(sector),S,H,
    displayH:displayBasis==='site'?H:Representations.operator(H,S),prediction,grid:Representations.grid(sector,siteVector),modeProfiles:q,
    annihilationInspection:{matrix:A,output,normSquared:M.inner(output,output)[0],sourceBasis:Physics.basis(sector),targetBasis:Physics.basis({...sector,N:sector.N-1}),sourceN:sector.N,targetN:sector.N-1}};
}
function reduce(state,action){
  const bad=()=>status(state,'status.invalid',{},false);
  if(!action||!Lessons.allowedActions(state.lessonId,state.lessonStage).includes(action.type))return status(state,'status.unavailable',{},false);
  const canceled={draftCanceled:!!state.editorDraft};
  try{
    switch(action.type){
      case 'ENTER_LESSON':
        if(action.id!=='sandbox'&&(!Number.isInteger(action.id)||action.id<1||action.id>6))return bad();
        return status({...state,...Lessons.initial(action.id),editorDraft:null,answerState:null},'status.lesson',canceled);
      case 'SET_LESSON_STAGE':
        if(![0,1].includes(action.stage))return bad();
        return status({...state,...Lessons.initial(state.lessonId,action.stage),editorDraft:null,answerState:null},'status.lesson',canceled);
      case 'RESET': return status({...state,...Lessons.initial(state.lessonId),editorDraft:null,answerState:null},'status.lesson',canceled);
      case 'RESET_ALL': return status(initial(state.language),'status.lesson',canceled);
      case 'SET_LANGUAGE':
        if(!['zh','en'].includes(action.language))return bad();
        return result({...state,language:action.language},false,false);
      case 'SET_SECTOR':{
        const sector={L:action.L,N:action.N};if(![2,3].includes(sector.L)||![1,2].includes(sector.N))return bad();
        return status({...state,sector,j:1,u:0,tau:0,timeDraft:null,displayBasis:'site',preparedSiteVector:Presets.vector('left',sector),selectedConfiguration:0,selectedGridConfiguration:null,mapSite:0,editorDraft:null,answerState:null},'status.sector',canceled);
      }
      case 'SET_PARAMETERS':{
        const j=action.j??state.j,u=action.u??state.u;if(!Number.isFinite(j)||!Number.isFinite(u)||j<0||j>2||u<0||u>4)return bad();
        return status({...state,j,u,tau:0,timeDraft:null,editorDraft:null},'status.parameters',canceled);
      }
      case 'PREPARE_PRESET':{
        if(state.lessonId===3&&!['split','noon'].includes(action.id)||state.lessonId===6&&!['phase-plus','phase-minus'].includes(action.id))return bad();
        return status({...state,preparedSiteVector:Presets.vector(action.id,state.sector),tau:0,timeDraft:null,editorDraft:null,selectedConfiguration:0},'status.prepared',canceled);
      }
      case 'SET_BASIS':
        if(!['site','standing'].includes(action.basis))return bad();
        return status({...state,displayBasis:action.basis,timeDraft:null,selectedConfiguration:null,selectedGridConfiguration:null,editorDraft:null},'status.basis',canceled);
      case 'SET_TIME_DRAFT':
        if(typeof action.value!=='string')return bad();
        return result({...state,timeDraft:action.value},true,false);
      case 'SET_TIME':{
        const max=state.lessonId===4?Math.PI/2:2*Math.PI;
        if(!Number.isFinite(action.tau)||action.tau<0||action.tau>max||state.lessonId===6&&action.tau!==0&&action.tau!==Math.PI/8)return bad();
        return result({...state,tau:action.tau,timeDraft:null},false,false);
      }
      case 'SELECT_CONFIGURATION':{
        if(!Number.isInteger(action.index)||action.index<0||action.index>=Physics.basis(state.sector).length)return bad();
        return result({...state,selectedConfiguration:action.index,selectedGridConfiguration:state.displayBasis==='site'?action.index:state.selectedGridConfiguration},false,false);
      }
      case 'SELECT_GRID_CONFIGURATION':{
        if(state.sector.N!==2||!Number.isInteger(action.index)||action.index<0||action.index>=Physics.basis(state.sector).length)return bad();
        return result({...state,selectedGridConfiguration:action.index,selectedConfiguration:state.displayBasis==='site'?action.index:state.selectedConfiguration},false,false);
      }
      case 'SELECT_MAP_SITE':
        if(!Number.isInteger(action.site)||action.site<0||action.site>=state.sector.L)return bad();
        return result({...state,mapSite:action.site},false,false);
      case 'SET_EDITOR_DRAFT':{
        if(!Array.isArray(action.draft)||action.draft.length!==Physics.basis(state.sector).length||!action.draft.every(x=>typeof x.re==='string'&&typeof x.im==='string'))return bad();
        return result({...state,editorDraft:action.draft.map(x=>({...x}))},true,false);
      }
      case 'CANCEL_EDITOR':return status({...state,editorDraft:null},'status.canceled');
      case 'PREPARE_EDITOR':{
        if(!state.editorDraft)return bad();
        const decimal=/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?$/;
        if(!state.editorDraft.every(x=>[x.re,x.im].every(s=>decimal.test(s.trim())&&Number.isFinite(Number(s))&&Math.abs(Number(s))<=1e6)))return status(state,'status.invalidDraft');
        const raw=state.editorDraft.map(x=>[Number(x.re),Number(x.im)]),norm2=M.inner(raw,raw)[0];if(norm2<=1e-24)return status(state,'status.invalidDraft');
        const norm=Math.sqrt(norm2),normalized=raw.map(z=>C.scale(z,1/norm));
        const preparedSiteVector=state.displayBasis==='site'?normalized:M.apply(derive(state).S,normalized);
        return status({...state,preparedSiteVector,tau:0,timeDraft:null,editorDraft:null},'status.normalized',{norm});
      }
      case 'ANSWER':{
        if(state.lessonId==='sandbox')return bad();
        const lesson=Lessons.get(state.lessonId,state.language,state.lessonStage);if(!lesson.choices.some(x=>x.id===action.answer))return bad();
        return status({...state,answerState:{answer:action.answer,...Lessons.check(state.lessonId,state.lessonStage,action.answer)}},'status.answer',{},false);
      }
      default:return bad();
    }
  }catch{return bad();}
}
export const AppState=Object.freeze({initial,reduce,derive});
