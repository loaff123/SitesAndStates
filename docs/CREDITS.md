# Sources, established alternatives and attribution

All interface prose and visuals in this project are original. No third-party worksheets, simulation assets, prose or code were copied. Mathematical ideas and the named tools below are established work. This is a scoped comparison based on documentation and publications, not an exhaustive uniqueness finding or a comparative learner/usability study.

## Existing tools

- [QuVis](https://www.st-andrews.ac.uk/physics/quvis/) already teaches two-particle spatial wavefunctions, symmetry and probability densities, with guided challenges. Its [Fermions and Bosons simulation](https://www.st-andrews.ac.uk/physics/quvis/simulations_html5/sims/FermionsBosons/FermionsBosons.html) is especially relevant. Its materials have their own licensing; no CC-BY-NC-SA QuVis content is incorporated here.
- [Quantum Flytrap](https://quantumflytrap.com/) is the closest conceptual alternative: optical layouts, multipartite ket states, operators and basis changes, including Chinese support. See the [authors' paper](https://arxiv.org/abs/2203.13300). The possible distinction here is the small six-task sequence, not generic visualization, multilingual access or basis switching.
- [BraKetVue](https://github.com/Quantum-Flytrap/bra-ket-vue) is a related visualization component resource. This project does not depend on it.
- [QuTiP tutorials](https://qutip.org/qutip-tutorials/index.html) cover quantum states, operators, tensor products and dynamics. The [QuTiP Virtual Lab](https://qutip.org/qutip-virtual-lab.html) also provides a browser-based experience. A QuTiP notebook/lesson is a credible lower-maintenance alternative to this standalone interface.
- [QuSpin's Bose–Hubbard example](https://quspin.github.io/QuSpin/examples/example7.html) offers established numerical many-body methods and examples, with programming prerequisites.
- [Quirk](https://github.com/Strilanc/Quirk) offers immediate circuit simulation and state displays. This lesson avoids an extra qubit encoding of bosonic occupations.
- [PhET Quantum Wave Interference](https://phet.colorado.edu/en/simulations/quantum-wave-interference) and [Falstad's quantum simulation](https://www.falstad.com/qm1d/) are useful wavefunction prerequisites; this project is not a broad replacement.

## Physics references

- Jaksch et al., [Cold Bosonic Atoms in Optical Lattices](https://arxiv.org/abs/cond-mat/9805329). Physical context for the optical-lattice Bose–Hubbard construction, not a claim that every experimental lattice equals this toy system.
- Zhang and Dong, [Exact diagonalization: the Bose–Hubbard model as an example](https://arxiv.org/abs/1102.4006). Occupation bases and finite-sector exact diagonalization.
- Daley, [Second quantisation notes](https://users.physics.ox.ac.uk/~Foot/SummerSchool/DaleySecondQuantisation.pdf). Creation/annihilation operators and many-particle descriptions.
- Gardiner, [A particle-number-conserving Bogoliubov method](https://arxiv.org/abs/quant-ph/9703005). Context for number-conserving formulations; the app itself does not implement Bogoliubov theory.

## Numerical reference

The independent verification script uses NumPy for first-quantized tensor matrices and SciPy's matrix exponential. Runtime JavaScript uses a small independently implemented dense complex exponential and occupation-sector operators. Neither dependency is needed to use the exported browser app.

## What remains unclaimed

No demonstrated learning benefit, superiority, exhaustive novelty, new physics or general curriculum coverage is claimed. No learner recruitment or study was performed. A future evaluation could justify revision, a narrower contributed lesson, or discontinuing the standalone interface.
