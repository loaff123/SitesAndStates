import { C, M } from './math.mjs';
import { Physics } from './physics.mjs';
function embedding(sector) {
  const states=Physics.basis(sector),{L,N}=sector;if(N===1)return M.identity(L);if(N!==2)throw new Error('Displayed representations require N=1 or 2.');
  const B=M.zeros(L*L,states.length);
  states.forEach((n,col)=>{const slots=n.flatMap((count,i)=>Array(count).fill(i));const [i,j]=slots;if(i===j)B[i*L+j][col]=[1,0];else {B[i*L+j][col]=[1/Math.SQRT2,0];B[j*L+i][col]=[1/Math.SQRT2,0];}});return B;
}
function standingModes(L) {
  if(![2,3].includes(L))throw new Error('Standing modes require L=2 or 3.');
  return Array.from({length:L},(_,j)=>Array.from({length:L},(_,k)=>[Math.sqrt(2/(L+1))*Math.sin(Math.PI*(j+1)*(k+1)/(L+1)),0]));
}
function lift(sector,q) {
  const [rows,cols]=M.shape(q);if(rows!==sector.L||cols!==sector.L)throw new Error('Mode transformation shape does not match sites.');
  if(M.normInf(M.add(M.mul(M.adjoint(q),q),M.scale(M.identity(rows),[-1,0])))>1e-10)throw new Error('Mode transformation must be unitary.');
  const B=embedding(sector);return sector.N===1?q.map(row=>row.map(z=>[...z])):M.mul(M.mul(M.adjoint(B),M.kron(q,q)),B);
}
function coordinates(c,S){return M.apply(M.adjoint(S),c);}
function operator(O,S){return M.mul(M.mul(M.adjoint(S),O),S);}
function grid(sector,c){if(sector.N!==2)return null;const v=M.apply(embedding(sector),c);return Array.from({length:sector.L},(_,i)=>v.slice(i*sector.L,(i+1)*sector.L));}
export const Representations=Object.freeze({embedding,standingModes,lift,coordinates,operator,grid});
