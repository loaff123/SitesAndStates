import { Copy } from './copy.mjs';
function number(x){if(!Number.isFinite(x))return '—';if(Math.abs(x)<5e-13)return '0';if(Math.abs(x)<.001)return x.toExponential(5).replace(/(\.\d*?[1-9])0+e/,'$1e').replace(/\.0+e/,'e').replace('e+','e');return x.toFixed(6).replace(/\.?0+$/,'');}
function complex([r,i]){const a=number(r),b=number(Math.abs(i));if(b==='0')return a;if(a==='0')return `${i<0?'−':''}${b}i`;return `${a} ${i<0?'−':'+'} ${b}i`;}
function phase(z,language){const magnitude=Math.hypot(...z);if(magnitude===0)return Copy.get(language,'phaseUndefined');if(magnitude<1e-12)return Copy.get(language,'phaseUnresolved');return `${number(Math.atan2(z[1],z[0]))} rad`;}
function ket(n,basis='site'){return `|${n.join('')}⟩${basis==='standing'?'_b':'_a'}`;}
function escape(s){return String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;');}
function textState(vector,basis,language){return vector.map((z,i)=>`${complex(z)} ${ket(basis[i])}`).join(' + ');}
export const Format=Object.freeze({number,complex,phase,ket,escape,textState});
