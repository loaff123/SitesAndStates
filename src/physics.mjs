import { C, M } from './math.mjs';
function validateSector({L,N}) {
  if(![2,3].includes(L)||!Number.isInteger(N)||N<0||N>3) throw new Error('Sector requires L=2 or 3 and N=0…3 (sandbox: N=1 or 2).');
}
function basis(sector) {
  validateSector(sector);
  function enumerate(L,N) {if(L===1)return [[N]];const out=[];for(let n=N;n>=0;n--)for(const rest of enumerate(L-1,N-n))out.push([n,...rest]);return out;}
  return enumerate(sector.L,sector.N);
}
function siteCheck(sector,site) { validateSector(sector);if(!Number.isInteger(site)||site<0||site>=sector.L)throw new Error('Site index outside sector.'); }
function annihilation(sector,site) {
  siteCheck(sector,site);if(sector.N===0)throw new Error('Vacuum sector has no lower nonnegative sector.');
  const from=basis(sector),to=basis({...sector,N:sector.N-1}),lookup=new Map(to.map((n,i)=>[n.join(','),i]));const A=M.zeros(to.length,from.length);
  from.forEach((n,col)=>{if(n[site]){const m=[...n];m[site]--;A[lookup.get(m.join(','))][col]=[Math.sqrt(n[site]),0];}});return A;
}
function bilinear(sector,i,j) {
  siteCheck(sector,i);siteCheck(sector,j);const states=basis(sector),lookup=new Map(states.map((n,k)=>[n.join(','),k]));const A=M.zeros(states.length,states.length);
  states.forEach((n,col)=>{if(n[j]){const m=[...n];let factor=Math.sqrt(m[j]);m[j]--;factor*=Math.sqrt(m[i]+1);m[i]++;A[lookup.get(m.join(','))][col]=[factor,0];}});return A;
}
function hamiltonian(sector,j,u) {
  if(!Number.isFinite(j)||!Number.isFinite(u))throw new Error('Hamiltonian parameters must be finite.');
  const states=basis(sector);let H=M.zeros(states.length,states.length);
  states.forEach((n,i)=>{H[i][i]=[u*n.reduce((sum,k)=>sum+k*(k-1)/2,0),0];});
  for(let i=0;i<sector.L-1;i++)H=M.add(H,M.scale(M.add(bilinear(sector,i,i+1),bilinear(sector,i+1,i)),[-j,0]));
  return H;
}
function evolve(H,c,tau) {
  const [r,k]=M.shape(H);if(r!==k||c.length!==r)throw new Error('Evolution dimension mismatch.');
  if(!Number.isFinite(tau))throw new Error('Time must be finite.');
  if(M.normInf(M.add(H,M.scale(M.adjoint(H),[-1,0])))>1e-12)throw new Error('Hamiltonian must be Hermitian.');
  const norm=M.inner(c,c)[0];if(Math.abs(norm-1)>1e-10)throw new Error('Prepared vector must have unit norm.');
  return M.apply(M.expm(M.scale(H,[0,-tau])),c);
}
function expect(c,A) {return M.inner(c,M.apply(A,c));}
function predict(sector,j,u,c) {
  const states=basis(sector);if(c.length!==states.length)throw new Error('State dimension does not match sector.');
  const norm=M.inner(c,c)[0],prob=c.map(C.abs2),density=Array.from({length:sector.L},(_,i)=>states.reduce((sum,n,k)=>sum+prob[k]*n[i],0));
  const pairs=[];for(let i=0;i<sector.L;i++)for(let k=i+1;k<sector.L;k++)pairs.push({i,j:k,value:states.reduce((sum,n,a)=>sum+prob[a]*n[i]*n[k],0)});
  const gamma=Array.from({length:sector.L},(_,i)=>Array.from({length:sector.L},(_,k)=>expect(c,bilinear(sector,i,k))));
  const currents=Array.from({length:sector.L-1},(_,i)=>2*j*gamma[i][i+1][1]);
  const pairProbability=sector.N===2?states.reduce((sum,n,k)=>sum+prob[k]*n.reduce((s,a)=>s+a*(a-1)/2,0),0):null;
  return {norm,density,pairProbability,pairs,gamma,currents,energy:expect(c,hamiltonian(sector,j,u))[0],fieldExpectations:Array(sector.L).fill(0)};
}
export const Physics=Object.freeze({basis,annihilation,bilinear,hamiltonian,evolve,predict});
