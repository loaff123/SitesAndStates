import { AppState } from './state.mjs';
import { Lessons } from './lessons.mjs';
import { Copy } from './copy.mjs';
import { Format as F } from './format.mjs';
import { Views } from './views.mjs';
import { Controls } from './controls.mjs';
function mount(root){
 let state=AppState.initial(),playing=false,frame=null,originTime=0,originTau=0,lastPaint=0;
 const motion=window.matchMedia('(prefers-reduced-motion: reduce)');
 function stop(){playing=false;if(frame!==null)cancelAnimationFrame(frame);frame=null;}
 function capture(){const active=document.activeElement;return {id:root.contains(active)?active.dataset.control:null,start:active?.selectionStart,end:active?.selectionEnd,details:[...root.querySelectorAll('details[data-details]')].filter(x=>x.open).map(x=>x.dataset.details),scrollX:window.scrollX,scrollY:window.scrollY};}
 function render({preserve=true,resetDetails=false,announce=false}={}){
  const saved=preserve?capture():null,t=key=>F.escape(Copy.get(state.language,key));let vm;
  try{vm=AppState.derive(state);}catch{stop();state={...state,statusKey:'status.numeric',statusArgs:{}};const status=root.querySelector('[data-status]');if(status)status.textContent=Copy.get(state.language,'status.numeric');return;}
  const lesson=state.lessonId==='sandbox'?null:Lessons.get(state.lessonId,state.language,state.lessonStage);
  document.documentElement.lang=state.language==='zh'?'zh-Hans':'en';document.title=`${Copy.get(state.language,'brand')} · Sites and States`;
  root.innerHTML=`<a class="skip-link" href="#experiment">${t('skip')}</a><header class="app-header"><a class="wordmark" href="#" data-action="reset-all" data-control="home"><span class="brand-icon" aria-hidden="true">s/s</span><span><strong>${t('brand')}</strong><span class="tagline">${t('tagline')}</span></span></a><div class="header-actions"><span class="prototype-pill">EXPERIMENTAL · 0.1</span><label class="sr-only" for="language">${t('language')}</label><select id="language" data-input="language" data-control="language"><option value="zh" ${state.language==='zh'?'selected':''}>中文</option><option value="en" ${state.language==='en'?'selected':''}>English</option></select></div></header><nav class="lesson-nav" aria-label="${t('lessons')}">${Array.from({length:6},(_,i)=>`<button data-action="lesson" data-control="nav-${i+1}" data-lesson="${i+1}" aria-current="${state.lessonId===i+1?'step':'false'}"><span>${String(i+1).padStart(2,'0')}</span><span>${F.escape(Lessons.get(i+1,state.language).title)}</span></button>`).join('')}<button data-action="lesson" data-control="nav-sandbox" data-lesson="sandbox" aria-current="${state.lessonId==='sandbox'?'step':'false'}"><span>↗</span><span>${t('sandbox')}</span></button></nav><div class="model-strip"><div class="model-badge">${t('badge')}<span>${t(state.displayBasis==='site'?'siteBasis':'standingBasis')} · j=${F.number(state.j)} · u=${F.number(state.u)} · τ=${F.number(state.tau)}</span></div><div class="dimensions">${[['dimPhysical',1],['dimModes',state.sector.L],['dimParticles',state.sector.N],['dimSector',vm.displayVector.length]].map(([label,n])=>`<div><span>${t(label)}</span><strong>${n}</strong></div>`).join('')}</div></div><div class="status-bar" data-status ${announce?'role="status" aria-live="polite"':'aria-live="off"'}>${F.escape(Copy.get(state.language,state.statusKey,Object.fromEntries(Object.entries(state.statusArgs).map(([k,v])=>[k,typeof v==='number'?F.number(v):v]))))}${state.statusArgs.draftCanceled?` ${t('status.draftCanceled')}`:''}</div><main id="experiment" class="workspace" tabindex="-1">${Controls.render({...state,playing,reducedMotion:motion.matches},lesson)}${Views.render(vm,state)}</main><footer><p class="release">${t('release')}</p><p>${t('scope')}</p><details data-details="credits"><summary data-control="credits-summary">${t('credits')}</summary><p>${t('creditsText')}</p><p class="credit-links"><a href="https://www.st-andrews.ac.uk/physics/quvis/" target="_blank" rel="noreferrer">QuVis</a><a href="https://quantumflytrap.com/" target="_blank" rel="noreferrer">Quantum Flytrap</a><a href="https://qutip.org/" target="_blank" rel="noreferrer">QuTiP</a><a href="https://quspin.github.io/" target="_blank" rel="noreferrer">QuSpin</a><a href="https://github.com/Strilanc/Quirk" target="_blank" rel="noreferrer">Quirk</a><a href="https://phet.colorado.edu/en/simulations/quantum-wave-interference" target="_blank" rel="noreferrer">PhET</a><a href="https://www.falstad.com/qm1d/" target="_blank" rel="noreferrer">Falstad</a><a href="https://arxiv.org/abs/cond-mat/9805329" target="_blank" rel="noreferrer">Bose–Hubbard model</a></p><p>Original code: MIT · Original educational text and visuals: CC BY 4.0 · Sites and States contributors.</p></details></footer>`;
  if(saved){if(!resetDetails)for(const detail of root.querySelectorAll('details[data-details]'))detail.open=saved.details.includes(detail.dataset.details);const focused=saved.id?[...root.querySelectorAll('[data-control]')].find(x=>x.dataset.control===saved.id):null;if(focused){focused.focus({preventScroll:true});if(typeof saved.start==='number'&&typeof focused.setSelectionRange==='function'){try{focused.setSelectionRange(saved.start,saved.end);}catch{}}}window.scrollTo(saved.scrollX,saved.scrollY);}
 }
 function renderLive(announce=false){
  const saved=capture();let vm;try{vm=AppState.derive(state);}catch{stop();state={...state,statusKey:'status.numeric',statusArgs:{}};render();return;}
  // Replace scientific views only. Native inputs keep their actual DOM nodes,
  // including a range thumb's ongoing pointer interaction and text selections.
  if(root.querySelector('.physical')){
    const container=document.createElement('div');container.innerHTML=Views.render(vm,state);
    for(const name of ['physical','amplitudes','predictions','mathematics']){
      const old=root.querySelector(`.${name}`),fresh=container.querySelector(`.${name}`);if(old&&fresh)old.replaceWith(fresh);
    }
    for(const detail of root.querySelectorAll('details[data-details]'))detail.open=saved.details.includes(detail.dataset.details);
  }
  const setText=(selector,value)=>{const el=root.querySelector(selector);if(el)el.textContent=value;};
  setText('[data-control="play"]',Copy.get(state.language,playing?'pause':'play'));
  setText('[data-time]',F.number(state.tau));
  for(const name of ['j','u'])setText(`.range-label[for="control-${name}"] output`,F.number(state[name]));
  for(const [id,value]of [['time-slider',state.tau],['time-entry',state.timeDraft??F.number(state.tau)],['j',state.j],['u',state.u]]){const el=root.querySelector(`[data-control="${id}"]`);if(el)el.value=String(value);}
  setText('.model-badge>span',`${Copy.get(state.language,state.displayBasis==='site'?'siteBasis':'standingBasis')} · j=${F.number(state.j)} · u=${F.number(state.u)} · τ=${F.number(state.tau)}`);
  setText('[data-status]',Copy.get(state.language,state.statusKey,Object.fromEntries(Object.entries(state.statusArgs).map(([k,v])=>[k,typeof v==='number'?F.number(v):v])))+(state.statusArgs.draftCanceled?' '+Copy.get(state.language,'status.draftCanceled'):''));
  const status=root.querySelector('[data-status]');status?.setAttribute?.('aria-live',announce?'polite':'off');
  const focused=saved.id?[...root.querySelectorAll('[data-control]')].find(x=>x.dataset.control===saved.id):null;
  if(focused&&focused!==document.activeElement){focused.focus({preventScroll:true});if(typeof saved.start==='number'&&typeof focused.setSelectionRange==='function'){try{focused.setSelectionRange(saved.start,saved.end);}catch{}}}
 }
 function dispatch(action,options={}){const change=AppState.reduce(state,action);state=change.state;if(change.effects.pause)stop();if(options.live)renderLive(change.effects.announce);else if(options.render!==false)render({resetDetails:['ENTER_LESSON','SET_LESSON_STAGE','RESET','RESET_ALL'].includes(action.type),announce:change.effects.announce});return state;}
 function tick(now){if(!playing)return;const max=state.lessonId===4?Math.PI/2:2*Math.PI;const tau=Math.min(max,originTau+(now-originTime)/1000*.35);if(now-lastPaint>=80||tau===max){dispatch({type:'SET_TIME',tau},{live:true});lastPaint=now;}if(tau>=max){stop();render();}else frame=requestAnimationFrame(tick);}
 function play(){if(playing){stop();render();return;}if(motion.matches)return;const allowed=Lessons.allowedActions(state.lessonId,state.lessonStage);if(!allowed.includes('SET_TIME')||state.lessonId===6)return;playing=true;originTau=state.tau;originTime=performance.now();lastPaint=originTime;render();frame=requestAnimationFrame(tick);}
 function click(event){const el=event.target.closest('[data-action]');if(!el||!root.contains(el))return;event.preventDefault();const type=el.dataset.action;
  if(type==='lesson')dispatch({type:'ENTER_LESSON',id:el.dataset.lesson==='sandbox'?'sandbox':Number(el.dataset.lesson)});
  if(type==='reset')dispatch({type:'RESET'});if(type==='reset-all')dispatch({type:'RESET_ALL'});
  if(type==='sector')dispatch({type:'SET_SECTOR',L:Number(el.dataset.l),N:Number(el.dataset.n)});
  if(type==='stage')dispatch({type:'SET_LESSON_STAGE',stage:Number(el.dataset.stage)});
  if(type==='preset')dispatch({type:'PREPARE_PRESET',id:el.dataset.preset});
  if(type==='basis')dispatch({type:'SET_BASIS',basis:el.dataset.basis});
  if(type==='time'){stop();dispatch({type:'SET_TIME',tau:Number(el.dataset.tau)});}
  if(type==='time-apply'){stop();const value=root.querySelector('[data-control="time-entry"]').value;dispatch({type:'SET_TIME',tau:value.trim()===''?NaN:Number(value)});}
  if(type==='play')play();if(type==='select-config')dispatch({type:'SELECT_CONFIGURATION',index:Number(el.dataset.index)});
  if(type==='select-grid')dispatch({type:'SELECT_GRID_CONFIGURATION',index:Number(el.dataset.index)});
  if(type==='map-site')dispatch({type:'SELECT_MAP_SITE',site:Number(el.dataset.site)});
  if(type==='answer')dispatch({type:'ANSWER',answer:el.dataset.answer});
  if(type==='editor-start'){const draft=AppState.derive(state).displayVector.map(([re,im])=>({re:String(re),im:String(im)}));dispatch({type:'SET_EDITOR_DRAFT',draft});}
  if(type==='prepare-editor')dispatch({type:'PREPARE_EDITOR'});if(type==='cancel-editor')dispatch({type:'CANCEL_EDITOR'});
 }
 function input(event){const el=event.target;
  if(el.dataset.input==='time-draft')dispatch({type:'SET_TIME_DRAFT',value:el.value},{live:true});
  if(el.dataset.input==='coefficient'){const draft=state.editorDraft.map(x=>({...x}));draft[Number(el.dataset.index)][el.dataset.part]=el.value;dispatch({type:'SET_EDITOR_DRAFT',draft},{live:true});}
  if(el.dataset.input==='parameter')dispatch({type:'SET_PARAMETERS',[el.dataset.parameter]:Number(el.value)},{live:true});
  if(el.dataset.input==='time'){stop();dispatch({type:'SET_TIME',tau:Number(el.value)},{live:true});}
 }
 function change(event){if(event.target.dataset.input==='language')dispatch({type:'SET_LANGUAGE',language:event.target.value});}
 function hidden(){if(document.hidden){stop();render();}}
 function reduced(){if(motion.matches)stop();render();}
 root.addEventListener('click',click);root.addEventListener('input',input);root.addEventListener('change',change);document.addEventListener('visibilitychange',hidden);motion.addEventListener('change',reduced);render({preserve:false});
 return {dispatch,getState:()=>structuredClone(state),destroy(){stop();root.removeEventListener('click',click);root.removeEventListener('input',input);root.removeEventListener('change',change);document.removeEventListener('visibilitychange',hidden);motion.removeEventListener('change',reduced);}};
}
export const App=Object.freeze({mount});
if(typeof document!=='undefined'){const root=document.getElementById('app');if(root)App.mount(root);}
