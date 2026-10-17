# Validation and limitations

Status: source-reviewed experimental candidate with a reviewed standalone build. Local numerical and software checks pass. Real-browser qualification has not run. This is not a qualified release.

实验性候选版本：源码与单文件构建已审查，本地数值及软件检验通过。真实浏览器验证尚未运行；不是合格发布版本。

## Reproducible local checks

The following checks were rerun on this packaged snapshot on 2026-10-09 UTC:

- Node 24.19.0: `node --test tests/*.test.mjs`; 46 passed, zero failed or skipped.
- Python 3.12.14, NumPy 2.3.5, SciPy 1.17.0: independent first-quantized reference, seed 2401.
- 48 parameter models across L=2/3, N=1/2, j={0,0.7,1,2}, u={0,0.6,4}; 3,312 evolved-state/reference comparisons cover all basis preparations and eight seeded random normalized complex preparations per sector, at six times from zero through 2π.
- Maximum observed absolute JavaScript/reference error: 2.4158453015843406e-13, below the 1e-10 threshold.
- Fresh `python tools/oracle.py --check tests/fixtures/oracle.json` regeneration passed, maximum difference zero in this environment.
- Repeated `node tools/build.mjs` runs produced byte-identical 93,627-byte HTML, SHA-256 `3e428b06de4c8053f8e0fe919c32bb32d6769f54a42ab9a79de351898c308f95`.

Tests cover analytic trajectories, norm/energy/number conservation, unitarity and time reversal, zero-hopping and noninteracting limits, N=1 interaction independence, degenerate spectra, trace moments, complex passive-basis covariance, current signs, phase-state densities, global-phase invariance, symmetric-grid marginals, rectangular-sector identities and direct-sum zero expectation.

Reducer and display tests cover lesson-control isolation, resets, passive coordinates at nonzero interacting time, explicit editor normalization, partial/invalid drafts, language changes, formatting and rapid actions. Five controller tests use a minimal mock DOM. Build tests check deterministic output, inline-only runtime assets, module inclusion and JavaScript syntax. These are software checks, not a real-browser or accessibility assessment.

The numerical engine uses scaling-and-squaring with a convergent Taylor series for tiny dense matrices. It does not normalize an evolved state to conceal drift. An invariant failure above 1e-10 stops playback and reports an error.

## Outstanding browser qualification

None of the following has been established by real-browser testing of this candidate:

- Full lesson and sandbox operation
- Desktop, phone and landscape layout or representative screenshot review
- Native keyboard operation, focus, held pointer/range dragging or touch behavior
- Reduced motion, real browser zoom or background-tab pause/resume
- Direct offline file opening with networking disabled
- Assistive-technology behavior

The optional Playwright configuration, browser test code and hosted-workflow definition are included as unrun validation material. Their presence does not establish that the tests execute or pass. No browser evidence is included. Successful hosting alone would not establish offline file-opening behavior.

## Interpretation limits

Only the specified small, closed, finite-mode Bose–Hubbard model is covered. Physical sites are modeled spatial modes; the application does not reconstruct continuum fields. Pair-probability interpretations are specialized to N=2. The full bosonic Fock space remains infinite-dimensional; the app shows one complete selected fixed-number sector.

Numerical and software checks do not establish teaching effectiveness, comparative advantage or novelty. No learner study or learner data collection has been performed. The app is not a general quantum simulator and makes no continuum/QFT, phase-transition, teaching-superiority or new-physics claims.
