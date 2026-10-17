/** Deterministic bounded bundler for this project's local named-export modules. */
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const modules=['math','physics','representations','presets','copy','lessons','state','format','views','controls','app'];
const pieces=[];
for(const name of modules){
 let source=await readFile(`src/${name}.mjs`,'utf8');const exported=[...source.matchAll(/^export const (\w+)\s*=/gm)].map(m=>m[1]);
 if(!exported.length)throw new Error(`No recognized namespace export in ${name}`);
 source=source.replace(/^import \{([^}]+)\} from '\.\/(\w+)\.mjs';\s*$/gm,(_,names,dependency)=>{
   if(!modules.slice(0,modules.indexOf(name)).includes(dependency))throw new Error(`Unknown or unordered dependency ${dependency}`);
   return names.split(',').map(n=>{const parts=n.trim().split(/\s+as\s+/);return parts.length===2?`const ${parts[1]}=${parts[0]};`:'';}).join('\n');
 }).replace(/^export const /gm,'const ');
 if(/^\s*(import|export)\b/m.test(source))throw new Error(`Unsupported module syntax in ${name}`);
 pieces.push(`// module: ${name}.mjs\nconst {${exported.join(',')}}=(()=>{\n${source}\nreturn {${exported.join(',')}};\n})();`);
}
const script=`(()=>{\n'use strict';\n${pieces.join('\n')}\n})();`,css=await readFile('src/styles.css','utf8');
if(script.includes('</script>')||css.includes('</style>'))throw new Error('Embedded closing tag is not supported.');
const hash=createHash('sha256').update(script).update(css).digest('hex');
let html=await readFile('index.html','utf8');
html=html.replace('<link rel="stylesheet" href="./src/styles.css">',`<style>\n${css}\n</style>`).replace('<script type="module" src="./src/app.mjs"></script>',`<script>\n${script}\n</script>`).replace('<!doctype html>',`<!doctype html>\n<!-- Sites and States offline export; source SHA256 ${hash}. Original code MIT; original educational copy and visuals CC BY 4.0. -->`);
const escape=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const codeLicense=await readFile('LICENSE','utf8'),contentLicense=await readFile('LICENSE-CONTENT','utf8');
html=html.replace('</body>',`<details class="license-notices"><summary>Licenses / 许可</summary><pre>${escape(codeLicense)}</pre><pre>${escape(contentLicense)}</pre><a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a></details>\n</body>`);
await mkdir('dist',{recursive:true});await writeFile('dist/sites-and-states.html',html);console.log(`Built dist/sites-and-states.html (${Buffer.byteLength(html)} bytes; ${hash.slice(0,12)})`);
