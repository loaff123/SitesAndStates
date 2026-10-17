import test from 'node:test';
import { C, M } from '../src/math.mjs';
import { Physics } from '../src/physics.mjs';
import { Representations as R } from '../src/representations.mjs';
import { near,vector,randomVector,random } from './helpers.mjs';
const gramSchmidt=(L,rng)=>{
  const cols=[];
  for(let k=0;k<L;k++) {let v=randomVector(L,rng);for(const u of cols){const a=M.inner(u,v);v=v.map((x,i)=>C.sub(x,C.mul(a,u[i])));}const norm=Math.sqrt(M.inner(v,v)[0]);cols.push(v.map(x=>C.scale(x,1/norm)));}
  return Array.from({length:L},(_,i)=>cols.map(c=>c[i]));
};
test('lift_exact_even_odd',()=>{
  const s={L:2,N:2},S=R.lift(s,R.standingModes(2)),a=1/Math.SQRT2;
  near(S,[vector([.5,a,.5]),vector([a,0,-a]),vector([.5,-a,.5])]);
  near(R.coordinates(vector([0,1,0]),S),vector([a,0,-a]));
  for(const j of [0,.7,2])for(const u of [0,.6,4])near(R.operator(Physics.hamiltonian(s,j,u),S),[vector([u/2-2*j,0,u/2]),vector([0,u,0]),vector([u/2,0,u/2+2*j])]);
});
test('passive_covariance_complex',()=>{
  const rng=random();for(const L of [2,3])for(const N of [1,2])for(let trial=0;trial<12;trial++){
    const s={L,N},d=Physics.basis(s).length,q=gramSchmidt(L,rng),S=R.lift(s,q),c=randomVector(d,rng),cb=R.coordinates(c,S);
    near(M.mul(M.adjoint(S),S),M.identity(d));near(M.apply(S,cb),c);
    const operators=[];for(let i=0;i<L;i++)for(let k=0;k<L;k++)operators.push(Physics.bilinear(s,i,k));
    for(let i=0;i<L;i++)for(let k=i+1;k<L;k++)operators.push(M.mul(Physics.bilinear(s,i,i),Physics.bilinear(s,k,k)));
    const H=Physics.hamiltonian(s,.7,.8);operators.push(H);
    for(let i=0;i<L-1;i++)operators.push(M.scale(M.add(Physics.bilinear(s,i,i+1),M.scale(Physics.bilinear(s,i+1,i),[-1,0])),[0,-.7]));
    for(const O of operators)near(M.inner(c,M.apply(O,c)),M.inner(cb,M.apply(R.operator(O,S),cb)));
    near(Physics.evolve(R.operator(H,S),cb,.4),R.coordinates(Physics.evolve(H,c,.4),S));
  }
});
test('coordinate_slot_marginals',()=>{
  const rng=random();for(const L of [2,3]){
    const s={L,N:2},d=Physics.basis(s).length,B=R.embedding(s);near(M.mul(M.adjoint(B),B),M.identity(d));
    const states=[...Array.from({length:d},(_,k)=>vector(Array.from({length:d},(_,i)=>+(i===k)))),...Array.from({length:8},()=>randomVector(d,rng))];
    for(const c of states){const g=R.grid(s,c),p=Physics.predict(s,1,0,c);near(g,M.adjoint(g).map(row=>row.map(C.conj)));near(g.flat().reduce((sum,z)=>sum+C.abs2(z),0),1);near(g.map(row=>2*row.reduce((sum,z)=>sum+C.abs2(z),0)),p.density);for(const {i,j,value}of p.pairs)near(C.abs2(g[i][j])+C.abs2(g[j][i]),value);}
  }
});
