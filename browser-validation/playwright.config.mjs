import { defineConfig } from '@playwright/test';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
const root=fileURLToPath(new URL('../',import.meta.url));
export default defineConfig({
  testDir: './tests', fullyParallel: false, forbidOnly: !!process.env.CI,
  retries: 0, workers: 1, timeout: 45000,
  reporter: [['list'], ['json',{outputFile:resolve(root,'browser-results/results.json')}], ['html',{outputFolder:resolve(root,'browser-report'),open:'never'}]],
  outputDir:resolve(root,'browser-results'),
  use: {baseURL:'http://127.0.0.1:4173', screenshot:'only-on-failure',trace:'retain-on-failure'},
  projects:[
    {name:'desktop',use:{browserName:'chromium',viewport:{width:1440,height:900}}},
    {name:'phone',use:{browserName:'chromium',viewport:{width:360,height:800},hasTouch:true,isMobile:true}},
    {name:'landscape',use:{browserName:'chromium',viewport:{width:800,height:360},hasTouch:true,isMobile:true}}
  ],
  webServer:{cwd:root,command:'node browser-validation/serve.mjs',url:'http://127.0.0.1:4173',reuseExistingServer:false}
});
