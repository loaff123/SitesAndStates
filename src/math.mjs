/** Small dense complex arithmetic. A scalar is [real, imaginary]. No mutation. */
export const C = Object.freeze({
  add: (a,b) => [a[0]+b[0],a[1]+b[1]],
  sub: (a,b) => [a[0]-b[0],a[1]-b[1]],
  mul: (a,b) => [a[0]*b[0]-a[1]*b[1],a[0]*b[1]+a[1]*b[0]],
  conj: a => [a[0],-a[1]],
  scale: (a,x) => [a[0]*x,a[1]*x],
  abs2: a => a[0]*a[0]+a[1]*a[1],
  valid: a => Array.isArray(a)&&a.length===2&&a.every(Number.isFinite)
});
function shape(A) {
  if(!Array.isArray(A)||!A.length||!Array.isArray(A[0])||!A[0].length) throw new Error('Matrix shape must be nonempty.');
  const width=A[0].length;
  if(!A.every(row=>Array.isArray(row)&&row.length===width)) throw new Error('Matrix must have a rectangular shape.');
  if(!A.every(row=>row.every(C.valid))) throw new Error('Matrix entries must be finite complex pairs.');
  return [A.length,width];
}
function zeros(rows,cols) {
  if(!Number.isInteger(rows)||!Number.isInteger(cols)||rows<1||cols<1) throw new Error('Invalid matrix shape.');
  return Array.from({length:rows},()=>Array.from({length:cols},()=>[0,0]));
}
function identity(n) { const A=zeros(n,n);for(let i=0;i<n;i++) A[i][i]=[1,0];return A; }
function add(A,B) { const [r,c]=shape(A),[rb,cb]=shape(B);if(r!==rb||c!==cb) throw new Error('Matrix shape mismatch.');return A.map((row,i)=>row.map((z,j)=>C.add(z,B[i][j]))); }
function scale(A,z) { shape(A);if(!C.valid(z)) throw new Error('Scale must be finite.');return A.map(row=>row.map(x=>C.mul(x,z))); }
function mul(A,B) {
  const [r,k]=shape(A),[kb,c]=shape(B);if(k!==kb) throw new Error('Matrix dimension mismatch.');
  const out=zeros(r,c);
  for(let i=0;i<r;i++) for(let a=0;a<k;a++) for(let j=0;j<c;j++) {
    const x=A[i][a],y=B[a][j];out[i][j][0]+=x[0]*y[0]-x[1]*y[1];out[i][j][1]+=x[0]*y[1]+x[1]*y[0];
  }
  return out;
}
function adjoint(A) { const [r,c]=shape(A);return Array.from({length:c},(_,j)=>Array.from({length:r},(_,i)=>C.conj(A[i][j]))); }
function apply(A,v) { if(!Array.isArray(v)||!v.every(C.valid)) throw new Error('Vector must have finite entries.');return mul(A,v.map(z=>[z])).map(row=>row[0]); }
function inner(a,b) { if(!Array.isArray(a)||!Array.isArray(b)||a.length!==b.length||!a.every(C.valid)||!b.every(C.valid)) throw new Error('Vector shape or finite-value error.');return a.reduce((sum,z,i)=>C.add(sum,C.mul(C.conj(z),b[i])),[0,0]); }
function kron(A,B) {
  const [r,c]=shape(A),[rb,cb]=shape(B);const out=zeros(r*rb,c*cb);
  for(let i=0;i<r;i++) for(let j=0;j<c;j++) for(let a=0;a<rb;a++) for(let b=0;b<cb;b++) out[i*rb+a][j*cb+b]=C.mul(A[i][j],B[a][b]);
  return out;
}
function normInf(A) { shape(A);return Math.max(...A.map(row=>row.reduce((sum,z)=>sum+Math.hypot(...z),0))); }
function expm(A) {
  const [n,m]=shape(A);if(n!==m) throw new Error('Matrix exponential requires square shape.');
  const norm=normInf(A);if(norm===0)return identity(n);
  const s=Math.max(0,Math.ceil(Math.log2(norm/.5)));if(s>60) throw new Error('Numerical exponential scale exceeded.');
  const a=scale(A,[2**(-s),0]);let term=identity(n),out=identity(n),converged=false;
  for(let k=1;k<=64;k++) {term=scale(mul(term,a),[1/k,0]);out=add(out,term);if(normInf(term)<2e-16){converged=true;break;}}
  if(!converged) throw new Error('Numerical exponential failed to converge.');
  for(let k=0;k<s;k++) out=mul(out,out);
  shape(out);return out;
}
export const M=Object.freeze({zeros,identity,add,scale,mul,adjoint,apply,inner,kron,normInf,expm,shape});
