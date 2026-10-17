# Validation and limitations

Status: source-reviewed experimental release with passing local numerical/software checks and bounded hosted Chromium qualification. Twenty-four browser cases passed; three real background-tab visibility cases were explicitly skipped because the headless runner did not expose that capability. This is not a claim of universal browser, accessibility or teaching-effectiveness validation.

实验性版本：源码与单文件构建已审查，本地数值和软件检验通过；托管 Chromium 的 24 项浏览器用例通过。3 项真实后台标签页可见性用例因无头浏览器不支持而明确跳过。尚未完成全浏览器、辅助技术或教学效果验证。

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

## Hosted Chromium qualification: 2026-10-17 UTC

[Exact-input workflow run](https://github.com/loaff123/SitesAndStates/actions/runs/39010487813) tested commit `dd26ce98e49a8d06aa010f9ffc4a6d836ed27a79` with Node 24.21.0, Playwright 1.64.0 and Chrome for Testing 156.0.8078.4 on Ubuntu. The current changes are documentation-only; application, tests, fixture and standalone export are unchanged from that tested source.

- All 46 Node tests passed, with no failures or skips.
- Deterministic rebuild matched the committed standalone HTML and the SHA-256 above.
- Independent regeneration checked all 3,312 reference evolutions successfully.
- The browser runner executed 27 cases with one worker: 24 passed, three skipped, zero failures or flaky results.
- Desktop (1440×900), phone (360×800) and landscape (800×360) contexts passed all six lessons in both languages, sector and sandbox controls, resets, explicit coefficient preparation, partial-draft preservation, keyboard/focus transitions, reduced motion and 44-pixel control targets.
- Native intermediate range dragging, playback start/pause/end and standalone file opening with networking disabled passed in all three contexts. Device contexts emulate Chromium viewports and touch; they are not physical-device certification.
- Three real background-tab pause/resume cases were skipped: opening another page and bringing it to front did not make the original page hidden in hosted headless Chromium. No synthetic visibility event was substituted.

[Exact-commit browser evidence](https://github.com/loaff123/SitesAndStates/actions/runs/39010487813/artifacts/12092692512) contains the report, input commit, build checksum and 34 screenshots. Archive SHA-256: `03c99fa595ad80870752dae5c7d6202b7a9bbfb090034e73347b7a8d176c2981`. GitHub retains this artifact for 14 days; its planned expiry is 2026-10-31.

Six representative screenshots were visually reviewed: English desktop rectangular map, Chinese phone passive modes, English landscape sandbox, English phone same-density comparison, Chinese 200%-equivalent viewport reflow and Chinese desktop offline export. No clipping or overlapping content was observed in those images. This is a bounded visual review, not a full accessibility audit.

## Remaining browser and accessibility limits

- Actual background-tab pause/resume remains unverified because the runner did not expose genuine visibility changes.
- Actual browser zoom is unverified. The passed 720×450 desktop reflow check is a 200%-equivalent viewport test, not evidence of real browser zoom.
- Assistive-technology behavior, other browser engines and physical devices have not been assessed.
- Browser qualification does not establish teaching effectiveness, comparative advantage or universal support.

## Interpretation limits

Only the specified small, closed, finite-mode Bose–Hubbard model is covered. Physical sites are modeled spatial modes; the application does not reconstruct continuum fields. Pair-probability interpretations are specialized to N=2. The full bosonic Fock space remains infinite-dimensional; the app shows one complete selected fixed-number sector.

Numerical and software checks do not establish teaching effectiveness, comparative advantage or novelty. No learner study or learner data collection has been performed. The app is not a general quantum simulator and makes no continuum/QFT, phase-transition, teaching-superiority or new-physics claims.
