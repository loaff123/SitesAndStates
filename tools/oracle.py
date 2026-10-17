"""Independent first-quantized oracle. Does not import or translate the JS engine.

N=2 lives first in the L**2 tensor space, with contact potential only on |j,j>.
Only then do we project onto the normalized symmetric subspace. Evolution uses
SciPy's independently maintained matrix exponential. Seed and full inputs travel
with the fixtures; generator version metadata is informational.
"""
import argparse
import itertools
import json
from pathlib import Path
import numpy as np
import scipy
from scipy.linalg import expm


def serialize(z):
    z = np.asarray(z)
    return np.stack((z.real, z.imag), axis=-1).tolist()


def sector_space(L, N):
    occupations = set()
    for slots in itertools.combinations_with_replacement(range(L), N):
        occupations.add(tuple(slots.count(j) for j in range(L)))
    basis = sorted(occupations, reverse=True)
    if N == 1:
        return basis, np.eye(L, dtype=complex)
    B = np.zeros((L * L, len(basis)), complex)
    for col, n in enumerate(basis):
        entries = [(r, s) for r in range(L) for s in range(L)
                   if tuple((r == j) + (s == j) for j in range(L)) == n]
        for r, s in entries:
            B[r * L + s, col] = 1 / np.sqrt(len(entries))
    return basis, B


def generate():
    rng = np.random.default_rng(2401)
    models = []
    for L in (2, 3):
        eye = np.eye(L)
        q = np.sqrt(2 / (L + 1)) * np.sin(np.pi * np.outer(np.arange(1, L + 1), np.arange(1, L + 1)) / (L + 1))
        for N in (1, 2):
            basis, B = sector_space(L, N)
            d = len(basis)
            inputs = list(np.eye(d, dtype=complex))
            for _ in range(8):
                c = rng.normal(size=d) + 1j * rng.normal(size=d)
                inputs.append(c / np.linalg.norm(c))
            S = q.astype(complex) if N == 1 else B.conj().T @ np.kron(q, q) @ B
            gamma_ops = []
            for i in range(L):
                row = []
                for k in range(L):
                    op = np.zeros((L, L)); op[i, k] = 1
                    row.append(op if N == 1 else np.kron(op, eye) + np.kron(eye, op))
                gamma_ops.append(row)
            for j in (0, .7, 1, 2):
                single = np.diag([-j] * (L - 1), 1) + np.diag([-j] * (L - 1), -1)
                for u in (0, .6, 4):
                    full = single if N == 1 else np.kron(single, eye) + np.kron(eye, single) + np.diag([u if r == s else 0 for r in range(L) for s in range(L)])
                    H = B.conj().T @ full @ B
                    times = (0, .13, np.pi / 8, np.pi / 4, np.pi / 2, 2 * np.pi)
                    evolutions = [expm(-1j * full * tau) for tau in times]
                    states = []
                    for c in inputs:
                        results = []
                        for tau, evolution in zip(times, evolutions):
                            psi = evolution @ (B @ c)
                            gamma = np.array([[np.vdot(psi, op @ psi) for op in row] for row in gamma_ops])
                            if N == 2:
                                probability = np.abs(psi.reshape(L, L)) ** 2
                                density = 2 * probability.sum(axis=1)
                                pair = float(np.trace(probability))
                                pairs = [float(probability[r, s] + probability[s, r]) for r in range(L) for s in range(r + 1, L)]
                            else:
                                density = np.abs(psi) ** 2; pair = None
                                pairs = [0.0 for r in range(L) for s in range(r + 1, L)]
                            results.append(dict(tau=float(tau), vector=serialize(B.conj().T @ psi), density=density.tolist(), gamma=serialize(gamma),
                                                currents=[float(2*j*gamma[r,r+1].imag) for r in range(L-1)],
                                                energy=float(np.vdot(psi, full @ psi).real), pairs=pairs, pairProbability=pair))
                        states.append(dict(input=serialize(c), evolutions=results))
                    models.append(dict(sector=dict(L=L,N=N),j=j,u=u,basis=basis,H=serialize(H),S=serialize(S),modeH=serialize(S.conj().T@H@S),states=states))
    return dict(schemaVersion=1, generator=dict(method='symmetrized first-quantized tensor space and scipy.linalg.expm',seed=2401,numpy=np.__version__,scipy=scipy.__version__),models=models)


def compare(a,b,path='root'):
    if isinstance(a,dict):
        if a.keys()!=b.keys(): raise AssertionError(f'Keys differ: {path}')
        return max((compare(a[k],b[k],path+'.'+k) for k in a if k!='generator'),default=0)
    if isinstance(a,(list,tuple)):
        if len(a)!=len(b): raise AssertionError(f'Length differs: {path}')
        return max((compare(x,y,f'{path}[{i}]') for i,(x,y) in enumerate(zip(a,b))),default=0)
    if isinstance(a,(float,int)):
        error=abs(a-b)
        if not np.isfinite(error) or error>1e-10: raise AssertionError(f'{path}: {a} versus {b}')
        return error
    if a!=b: raise AssertionError(f'Value differs: {path}')
    return 0


if __name__ == '__main__':
    parser=argparse.ArgumentParser(); group=parser.add_mutually_exclusive_group(required=True)
    group.add_argument('--output',type=Path);group.add_argument('--check',type=Path)
    args=parser.parse_args(); result=generate()
    count=sum(len(s['evolutions']) for m in result['models'] for s in m['states'])
    if args.output:
        args.output.parent.mkdir(parents=True,exist_ok=True)
        args.output.write_text(json.dumps(result,sort_keys=True,separators=(',',':'))+'\n')
        print(f'Wrote {len(result["models"])} model cases, {count} evolutions to {args.output}.')
    else:
        error=compare(result,json.loads(args.check.read_text()))
        print(f'Independent regeneration passed: {count} evolutions; maximum difference {error:.3g}.')
