import { test,expect } from '@playwright/test';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
const control=(page,id)=>page.locator(`[data-control="${id}"]`);
const enter=async(page,id)=>{await control(page,`nav-${id}`).click();await expect(control(page,`nav-${id}`)).toHaveAttribute('aria-current','step');};
const numerical=async(locator,expected,tolerance=2e-6)=>{const actual=Number((await locator.innerText()).replace('−','-'));expect(Math.abs(actual-expected)).toBeLessThan(tolerance);};
const setRange=async(page,id,value,step)=>{const field=control(page,id);await field.focus();await field.press('Home');for(let k=0;k<Math.round(value/step);k++)await field.press('ArrowRight');};
const density=async(page,values)=>{for(let i=0;i<values.length;i++)await numerical(page.locator(`[data-density="${i}"]`),values[i]);};
const snap=async(page,info,name)=>{await page.screenshot({path:info.outputPath(`${name}.png`),fullPage:true});};
const openDetails=async(page,id)=>{const d=page.locator(`[data-details="${id}"]`);if(!await d.getAttribute('open').then(x=>x!==null))await d.locator('summary').click();};
const noOverflow=async page=>expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+1)).toBe(true);
test.beforeEach(async({page})=>{await page.goto('/');await expect(page.locator('.amplitude-grid')).toBeVisible();});
for(const language of ['zh','en'])test(`all six lessons, checks and resets (${language})`,async({page},info)=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await control(page,'language').selectOption(language);
 for(const [L,N,d] of [[2,1,2],[3,1,3],[2,2,3],[3,2,6]]){await control(page,`sector-${L}-${N}`).click();await expect(page.locator('[data-config]')).toHaveCount(d);await density(page,[N,...Array(L-1).fill(0)]);}
 await control(page,'answer-sites').click();await expect(page.locator('[data-feedback]')).toHaveClass(/incorrect/);await control(page,'answer-right').click();await expect(page.locator('[data-feedback]')).toHaveClass(/correct/);
 for(let id=2;id<=6;id++){
  await enter(page,id);await expect(page.locator('[data-control="j"]')).toHaveCount(0);await expect(page.locator('[data-control="editor-start"]')).toHaveCount(0);
  if(id===2){await control(page,'config-1').click();await density(page,[1.5,.5,0]);await expect(control(page,'grid-0-1')).toContainText('0.5i');await control(page,'grid-0-1').click();await expect(control(page,'grid-1-0')).toHaveClass(/selected/);}
  if(id===3){await control(page,'preset-noon').click();await density(page,[1,1]);await numerical(page.locator('[data-pair]'),1);await numerical(page.locator('[data-joint="0-1"]'),0);await snap(page,info,`${language}-same-density-pairs`);await control(page,'preset-split').click();await numerical(page.locator('[data-pair]'),0);await numerical(page.locator('[data-joint="0-1"]'),1);}
  if(id===4){await control(page,'time-π-4').click();await density(page,[1,1]);await numerical(page.locator('[data-pair]'),1);await expect(control(page,'config-0')).toContainText('0.707107i');await snap(page,info,`${language}-phase-evolution`);await control(page,'reset').click();await numerical(page.locator('[data-time]'),0);await numerical(page.locator('[data-pair]'),0);}
  if(id===5){await numerical(page.locator('[data-map-norm]'),2);await expect(page.locator('[data-map-output]')).toContainText('1.414214');await control(page,'map-site-1').click();await numerical(page.locator('[data-map-norm]'),0);await control(page,'map-site-0').click();await snap(page,info,`${language}-rectangular-map`);await control(page,'stage-1').click();await numerical(page.locator('[data-map-norm]'),1);await expect(page.locator('[data-map-output]')).toContainText('|0⟩');await control(page,'reset').click();await numerical(page.locator('[data-map-norm]'),2);}
  if(id===6){await control(page,'basis-standing').click();await density(page,[1,1]);await expect(page.locator('.mode-profile')).toHaveCount(2);await expect(control(page,'config-0')).toContainText('0.707107');await expect(control(page,'config-2')).toContainText('-0.707107');await snap(page,info,`${language}-passive-modes`);await control(page,'stage-1').click();await numerical(page.locator('[data-current="0"]'),2);await control(page,'time-π-8').click();await density(page,[1-1/Math.SQRT2,1+1/Math.SQRT2]);await control(page,'preset-phase-minus').click();await numerical(page.locator('[data-current="0"]'),-2);await control(page,'time-π-8').click();await density(page,[1+1/Math.SQRT2,1-1/Math.SQRT2]);}
  await control(page,'answer-right').click();await expect(page.locator('[data-feedback]')).toHaveClass(/correct/);await noOverflow(page);
 }
 await enter(page,4);await control(page,'next').click();await expect(control(page,'nav-5')).toHaveAttribute('aria-current','step');await control(page,'previous').click();await numerical(page.locator('[data-time]'),0);expect(errors).toEqual([]);
});
test('sandbox sectors, parameters, passive basis and explicit coefficient preparation',async({page},info)=>{
 await control(page,'language').selectOption('en');await enter(page,'sandbox');
 for(const [L,N,d] of [[2,1,2],[2,2,3],[3,1,3],[3,2,6]]){await control(page,`sector-${L}-${N}`).click();await expect(page.locator('[data-config]')).toHaveCount(d);await density(page,[N,...Array(L-1).fill(0)]);for(const button of await page.locator('[data-action="preset"]').all())await button.click();await control(page,'basis-standing').click();await control(page,'basis-site').click();}
 await control(page,'sector-3-2').click();await setRange(page,'j',.7,.05);await setRange(page,'u',.6,.1);await control(page,'time-entry').fill('0.13');await control(page,'time-apply').click();const before=await page.locator('[data-density]').allTextContents();await control(page,'basis-standing').click();expect(await page.locator('[data-density]').allTextContents()).toEqual(before);await numerical(page.locator('[data-time]'),.13);
 await openDetails(page,'editor');await control(page,'editor-start').click();await control(page,'editor-0-re').fill('-');await control(page,'prepare-editor').click();await expect(page.locator('[data-status]')).toContainText('Draft not applied');
 await control(page,'language').selectOption('zh');await expect(control(page,'editor-0-re')).toHaveValue('-');await control(page,'language').selectOption('en');
 for(const input of await page.locator('[data-input="coefficient"]').all())await input.fill('0');await control(page,'prepare-editor').click();await expect(page.locator('[data-status]')).toContainText('Draft not applied');
 await control(page,'editor-0-re').fill('2');await control(page,'prepare-editor').click();await expect(page.locator('[data-status]')).toContainText('norm 2');await numerical(page.locator('[data-time]'),0);await expect(control(page,'config-0').locator('.amplitude-value')).toHaveText('1');
 await setRange(page,'j',0,.05);await setRange(page,'u',0,.1);const frozen=await page.locator('[data-density]').allTextContents();await control(page,'time-entry').fill(String(2*Math.PI));await control(page,'time-apply').click();expect(await page.locator('[data-density]').allTextContents()).toEqual(frozen);
 await snap(page,info,'sandbox-all-six');await control(page,'reset').click();await expect(page.locator('[data-config]')).toHaveCount(3);await density(page,[1,1]);await numerical(page.locator('[data-time]'),0);await noOverflow(page);
});
test('keyboard navigation and incomplete drafts keep intended focus across language changes',async({page})=>{
 await control(page,'language').selectOption('en');await enter(page,'sandbox');await openDetails(page,'editor');await control(page,'editor-start').click();await control(page,'editor-0-re').fill('1e');
 await control(page,'language').focus();await control(page,'language').selectOption('zh');await expect(control(page,'language')).toBeFocused();await expect(control(page,'editor-0-re')).toHaveValue('1e');
 await control(page,'editor-0-re').focus();await control(page,'language').selectOption('en');await expect(control(page,'editor-0-re')).toBeFocused();await expect(control(page,'editor-0-re')).toHaveValue('1e');
 await control(page,'editor-0-re').press('Tab');await expect(control(page,'editor-0-im')).toBeFocused();await control(page,'cancel-editor').focus();await page.keyboard.press('Enter');await expect(control(page,'editor-start')).toBeVisible();
 await control(page,'basis-standing').focus();await page.keyboard.press('Space');await expect(control(page,'basis-standing')).toHaveAttribute('aria-pressed','true');
 await control(page,'time-entry').fill('1e');await control(page,'language').selectOption('zh');await expect(control(page,'time-entry')).toHaveValue('1e');
 await control(page,'time-slider').focus();await page.keyboard.press('ArrowRight');expect(Number(await page.locator('[data-time]').innerText())).toBeGreaterThan(0);
});
test('reduced motion, reflow and touch-sized controls',async({page},info)=>{
 await page.emulateMedia({reducedMotion:'reduce'});await enter(page,4);await expect(control(page,'play')).toHaveCount(0);await control(page,'time-π-4').click();await numerical(page.locator('[data-pair]'),1);await noOverflow(page);
 if(info.project.name==='desktop'){await page.setViewportSize({width:720,height:450});await noOverflow(page);await snap(page,info,'200-percent-equivalent-reflow');}
 const undersized=await page.locator('button:visible,input:visible,select:visible').evaluateAll(elements=>elements.filter(e=>{const r=e.getBoundingClientRect();return r.height<43.5||r.width<43.5;}).map(e=>({text:e.textContent,rect:e.getBoundingClientRect().toJSON()})));expect(undersized).toEqual([]);await snap(page,info,'responsive-reduced-motion');
});
test('standalone export opens with networking disabled and no HTTP runtime requests',async({browser},info)=>{
 const context=await browser.newContext({viewport:info.project.use.viewport,offline:true});const page=await context.newPage(),requests=[],errors=[];page.on('request',r=>{if(/^https?:/.test(r.url()))requests.push(r.url());});page.on('pageerror',e=>errors.push(e.message));await page.goto(pathToFileURL(resolve('dist/sites-and-states.html')).href);await expect(page.locator('[data-config]')).toHaveCount(2);await enter(page,4);await control(page,'time-π-4').click();await density(page,[1,1]);await numerical(page.locator('[data-pair]'),1);await snap(page,info,'offline-export');await page.reload();await expect(page.locator('[data-config]')).toHaveCount(2);expect(requests).toEqual([]);expect(errors).toEqual([]);await context.close();
});
test('continuous native range drag updates through intermediate frames',async({page,context},info)=>{
 await enter(page,4);const range=control(page,'time-slider');await range.scrollIntoViewIfNeeded();const box=await range.boundingBox();expect(box).not.toBeNull();const y=box.y+box.height/2,start=box.x+8,end=box.x+box.width-8;
 const intermediate=[];
 if(info.project.use.hasTouch){const session=await context.newCDPSession(page);await session.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:start,y,id:0}]});for(let k=1;k<=12;k++){await session.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:start+(end-start)*k/12,y,id:0}]});if([4,8].includes(k))intermediate.push(Number(await range.inputValue()));}await session.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await session.detach();}
 else{await page.mouse.move(start,y);await page.mouse.down();await page.mouse.move(start+(end-start)/3,y,{steps:4});intermediate.push(Number(await range.inputValue()));await page.mouse.move(start+2*(end-start)/3,y,{steps:4});intermediate.push(Number(await range.inputValue()));await page.mouse.move(end,y,{steps:4});await page.mouse.up();}
 expect(intermediate).toHaveLength(2);expect(intermediate[0]).toBeGreaterThan(.2);expect(intermediate[1]).toBeGreaterThan(intermediate[0]+.2);expect(Number(await range.inputValue())).toBeGreaterThan(intermediate[1]+.2);expect(Number(await range.inputValue())).toBeGreaterThan(1.35);await info.attach('held-drag-intermediate-values',{body:JSON.stringify(intermediate),contentType:'application/json'});await noOverflow(page);
});

test('real playback start, pause and bounded endpoint',async({page})=>{
 await control(page,'language').selectOption('en');await enter(page,4);await control(page,'play').click();await expect(control(page,'play')).toHaveText('Pause');await expect.poll(async()=>Number(await page.locator('[data-time]').innerText())).toBeGreaterThan(.05);
 await control(page,'play').click();await expect(control(page,'play')).toHaveText('Play');const paused=await page.locator('[data-time]').innerText();await page.waitForTimeout(350);expect(await page.locator('[data-time]').innerText()).toBe(paused);
 await control(page,'time-entry').fill('1.5');await control(page,'time-apply').click();await control(page,'play').click();await expect(control(page,'play')).toHaveText('Play');await numerical(page.locator('[data-time]'),Math.PI/2);
});
test('actual background-tab pause when the hosted browser exposes visibility changes',async({page,context},info)=>{
 await control(page,'language').selectOption('en');await enter(page,4);await control(page,'play').click();await expect.poll(async()=>Number(await page.locator('[data-time]').innerText())).toBeGreaterThan(.02);
 const other=await context.newPage();await other.goto('about:blank');await other.bringToFront();const hidden=await page.evaluate(()=>document.hidden);
 await info.attach('actual-tab-visibility',{body:JSON.stringify({hidden,method:'new page + bringToFront; no synthetic visibility event'}),contentType:'application/json'});
 if(!hidden){await other.close();test.skip(true,'Hosted headless Chromium does not expose background tab visibility; actual hidden/resume coverage remains untested.');}
 await expect(control(page,'play')).toHaveText('Play');const paused=await page.locator('[data-time]').innerText();await page.waitForTimeout(350);expect(await page.locator('[data-time]').innerText()).toBe(paused);await page.bringToFront();await expect(control(page,'play')).toHaveText('Play');expect(await page.locator('[data-time]').innerText()).toBe(paused);await other.close();
});
