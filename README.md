# 空间与量子态 · Sites and States

同一条物理直线，完整可见的量子态。一个中英双语的小型 Bose–Hubbard 教学实验，用六步探索连接空间模式、占据配置、复振幅与可观测量。所有配置都可见，最多六个复振幅。

One physical line. The whole quantum state. A small bilingual Bose–Hubbard teaching experiment connecting spatial modes, occupation configurations, complex amplitudes and observable predictions through six guided steps. Every configuration is visible, with at most six complex amplitudes.

**Experimental teaching prototype. Numerical checks test the model and software; learning effectiveness has not been evaluated.**

**实验性教学原型。数值检验针对模型与软件；教学效果尚未评估。**

## Open it / 打开

Open `dist/sites-and-states.html` in a modern browser. The export contains its own code and styles: no account, installation, server, CDN, external font or network request is needed at runtime. External credit links open only when followed. This project collects no data and stores no learner answers. Reload starts over.

用现代浏览器打开 `dist/sites-and-states.html`。导出文件包含全部代码与样式，无需账户、安装、服务器或运行时网络请求。外部参考链接仅在主动点击时打开。不收集数据、不保存学习者答案；刷新页面会重新开始。

See [validation status](docs/VALIDATION.md) for exactly which environments and interactions have been checked. Source `index.html` uses ES modules and is intended for a local static server; use the exported HTML for direct file opening.

## Build and test / 构建与检验

Requires Node 20 or newer. No package download is needed.

    node --test tests/*.test.mjs
    node tools/build.mjs

The build is deterministic and writes the standalone HTML to `dist/`. The source modules and browser export use the same mathematical and lesson logic.

To regenerate the independent first-quantized scientific reference, use Python 3.10+ with the verification-only packages in `verification-requirements.txt`:

    python tools/oracle.py --check tests/fixtures/oracle.json
    python tools/oracle.py --output tests/fixtures/oracle.json

The app and normal Node tests do not require Python. The checked-in reference records its NumPy/SciPy versions and seed. A floating-point tolerance of 1e-10 is used; exact decimal byte equality across numerical libraries is not required.

## Six steps / 六步探索

1. Physical dimension, site count and fixed-number sector dimension
2. A complex amplitude belongs to an entire occupation configuration
3. Same site density and one-body matrix, different pair correlations
4. An evolving state with constant site density in one exact example
5. Zero field expectation and a nonzero rectangular annihilation map
6. Passive standing-mode coordinates versus distinct phase preparations

Then use the sandbox: all four L/N sectors, compatible presets, bounded hopping and interaction, time, passive mode coordinates and an explicitly normalized coefficient editor. Changing the model resets the state and clock. Changing coordinates preserves them. Keyboard controls and reduced-motion operation are included.

## What is and is not modeled

- Open one-dimensional chain, L=2 or 3 retained spatial modes
- N=1 or 2 identical spinless bosons, a complete fixed-N sector
- Closed-system pure-state evolution under the specified finite-mode Bose–Hubbard Hamiltonian, up to floating-point error
- Dimensionless j=J/E₀, u=U/E₀ and τ=E₀t/ℏ, with a fixed E₀ independent of J
- Exact probability predictions, without sampling or a collapse simulation

A site is a modeled spatial mode, not a claim about a continuum point field. The full bosonic Fock space remains infinite-dimensional; this application displays a complete selected sector. A two-coordinate grid uses coordinate slots for identical particles, not permanent particle names or two spatial directions. Standing modes extend over the same physical sites. There are no continuum/QFT/Standard Model, phase-transition, novel-physics or teaching-superiority claims.

Read [the model and conventions](docs/MODEL.md), [validation and limitations](docs/VALIDATION.md), and [sources and alternatives](docs/CREDITS.md).

## Related work and contribution

QuVis, Quantum Flytrap, QuTiP and other tools already provide substantial quantum education and simulation capabilities. Browser access, state visualization, multilingual support and basis changes are not new here. This experiment proposes a narrow six-task workflow with a fully visible tiny state, including number-sector operator maps. Its pedagogical value remains unvalidated. A notebook or lesson using established tools remains a reasonable alternative.

## Licensing

Original program logic, tests and scripts: [MIT](LICENSE). Original educational prose and visual design: [CC BY 4.0](LICENSE-CONTENT). The generated HTML contains both and retains both notices. No QuVis or other third-party prose, worksheets, code, visuals or assets were copied.

## Optional hosted browser qualification

The app and offline build remain dependency-free. `browser-validation/` is a separate, optional Playwright 1.64.0 test package. The read-only GitHub workflow installs its pinned validation dependencies in the hosted runner and exercises desktop, phone and landscape contexts, both languages, keyboard interactions, continuous range dragging, playback and a network-disabled file-open of the standalone export. Artifacts are named for the exact commit. Hosted Chromium qualification passed 24 browser cases, with three explicit background-tab visibility skips; six representative screenshots were reviewed. See the [validation report](docs/VALIDATION.md) for the exact commit/run, measured coverage and remaining limits.

Actual browser zoom is distinct from 200%-equivalent viewport reflow. Background-tab pause/resume is marked untested if hosted headless Chromium does not expose real visibility changes; no synthetic visibility event is passed off as that evidence.
