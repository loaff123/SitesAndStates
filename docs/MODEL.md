# Model, representations and interaction contract

## Finite model and units

There are L=2 or 3 retained spatial modes along one physical line, with open ends and N=1 or 2 identical spinless bosons. The pure state includes every occupation configuration in the selected N sector. No hard-core restriction is imposed.

Use a fixed reference energy E₀ independent of J, j=J/E₀, u=U/E₀, τ=E₀t/ℏ. Then

    h = H/E₀ = −j Σᵢ (aᵢ†aᵢ₊₁ + aᵢ₊₁†aᵢ) + (u/2) Σᵢ nᵢ(nᵢ−1)
    c(τ) = exp(−i h τ)c(0)

The neighbor sum contains each link once. This clock remains valid at j=0. Sandbox bounds are j∈[0,2], u∈[0,4], τ∈[0,2π]. N=1 has no interaction contribution at any u.

The model is finite-mode, not a continuum reconstruction. These two- or three-site systems are not labeled as thermodynamic phases or a Mott transition. Evolution is exact within this specified Hamiltonian up to floating-point error.

## Basis order and dimensions

Descending lexicographic order is used everywhere:

- (L,N)=(2,1): |10⟩, |01⟩
- (2,2): |20⟩, |11⟩, |02⟩
- (3,1): |100⟩, |010⟩, |001⟩
- (3,2): |200⟩, |110⟩, |101⟩, |020⟩, |011⟩, |002⟩

The dimension is C(N+L−1,N): 2,3,3,6 respectively. These complex basis directions are not extra physical directions. Full finite-L bosonic Fock space is the direct sum of every nonnegative-N sector and is infinite-dimensional. Every configuration of the displayed sector is retained. Limiting each site to occupancy at most one would change the model.

Configuration probabilities |cₙ|² sum to one. Mean occupations ⟨nᵢ⟩ sum to N. Neither list recovers all relative phases of the complex state. Global phase is retained numerically/displayed but does not change predictions. Exact-zero amplitude has undefined phase; tiny nonzero amplitudes below 1e-12 have phase unresolved at display precision, rather than mathematically undefined phase.

## Observables and current sign

The one-body density matrix is γᵢⱼ=⟨aᵢ†aⱼ⟩ in site coordinates. Current on the directed link i→i+1 is

    kᵢ,ᵢ₊₁ = −i j (aᵢ†aᵢ₊₁ − aᵢ₊₁†aᵢ)
    ⟨kᵢ,ᵢ₊₁⟩ = 2j Im γᵢ,ᵢ₊₁

In particular d⟨n₁⟩/dτ=−⟨k₁₂⟩. Physical current has units E₀/ℏ.

For N=2, the probability that both bosons share a site is Σᵢ⟨nᵢ(nᵢ−1)/2⟩. The unhalved factorial moment would be twice that probability. For i≠j, ⟨nᵢnⱼ⟩ is the unordered coincidence probability for one boson in each site. The UI specializes these interpretations to N=2, and marks the pair experiment not applicable for N=1. No measurement sampling, shot sequence, particle removal experiment or collapse is simulated.

## Symmetric coordinate slots

For N=2,

    Ψ(r,s)=⟨0|aₛaᵣ|Ψ₂⟩/√2
    Ψ(j,j)=c₂ₑⱼ
    Ψ(j,k)=cₑⱼ₊ₑₖ/√2, j≠k

Both axes are coordinate slots along the same physical line. The particles are identical; slots are not permanent identities. The grid is always in site coordinates, even when the occupation-amplitude panel is in standing-mode coordinates.

Σᵣₛ|Ψ(r,s)|²=1 and ⟨nᵣ⟩=2Σₛ|Ψ(r,s)|². Off-diagonal unordered coincidences combine both exchanged cells. Grid selection and standing-mode configuration selection are kept distinct to avoid confusing their coordinate systems.

## Number-sector maps

The exact annihilation map aᵢ:H_N→H_(N−1) is rectangular:

    aᵢ|…,nᵢ,…⟩=√nᵢ |…,nᵢ−1,…⟩

For example a₁|20⟩=√2|10⟩, whose squared norm is 2. This is an unnormalized mathematical output, not a 200% removal probability. At N=1 the output sector is the one-dimensional vacuum sector. The UI does not apply this map as a physical operation.

For every fixed-N state, αᵢ=⟨Ψ_N|aᵢ|Ψ_N⟩=0 because the output is in an orthogonal number sector. This does not imply zero particles, zero density, absent first-order coherence or a zero operator. At N=1, cᵢ=⟨0|aᵢ|Ψ₁⟩ is a different matrix element.

Do not multiply the zero square projection P_N aᵢ P_N to get nᵢ. The implementation uses the full rectangular map and/or direct number-conserving bilinear operators. Tests compose a†a through N−1 and aa† through N+1, then compare their difference on H_N. Finite square cutoff matrices cannot globally realize [a,a†]=I; missing intermediate sectors must not be silently replaced by zero.

## Passive standing-mode coordinates

The single-particle standing-mode matrix is

    qⱼₖ = √(2/(L+1)) sin(π(j+1)(k+1)/(L+1))

with zero-based j,k. Its columns express bₖ†=Σⱼqⱼₖaⱼ†. These modes extend across the original sites. For L=2 they are even/odd modes. For the open chain they are not called momentum eigenstates.

Let B embed normalized occupation states into the symmetric ordered-coordinate tensor space. Lift q to S=q for N=1 and S=B†(q⊗q)B for N=2. Then

    c_b=S†c_a; O_b=S†O_aS; h_b=S†h_aS.

The whole Hamiltonian transforms, including interaction terms. A 2×2 single-particle transform cannot act directly on the three-component two-boson vector. For L2,N2 in the listed occupation order,

    S = [ 1/2    1/√2     1/2  ]
        [ 1/√2   0       −1/√2 ]
        [ 1/2   −1/√2     1/2  ]

    h_b = [ u/2−2j  0  u/2    ]
          [ 0       u  0      ]
          [ u/2     0  u/2+2j ]

Thus |11⟩_a=(|20⟩_b−|02⟩_b)/√2 without any physical change. The physical-sites panel and site-coordinate predictions stay unchanged.

## Worked lessons

At L2,N2, |11⟩ and NOON+=(|20⟩+|02⟩)/√2 both have mean occupations (1,1) and γ=diag(1,1). However ⟨n₁n₂⟩ is 1 versus 0; same-site probability is 0 versus 1.

With c(0)=|11⟩ and u=0,

    c(τ)=cos(2jτ)|11⟩+i sin(2jτ)NOON+.

Density remains (1,1), and same-site probability is sin²(2jτ). At j=1,τ=π/4, the state is i NOON+, equivalent to NOON+ up to global phase. The UI locks these assumptions in this lesson rather than generalizing them to other preparations.

The fixed-number Hartree states c±=(1/2,±i/√2,−1/2) have equal occupation probabilities (1/4,1/2,1/4) but γ₁₂=±i and currents ±2j initially. At j=1,u=0,τ=π/8, their densities are (1−1/√2,1+1/√2) and the reverse. They are not Glauber coherent states; αᵢ still vanishes.

The L3,N2 coefficient-location lesson uses (|200⟩+i|110⟩)/√2, density (1.5,0.5,0), and Ψ(1,2)=Ψ(2,1)=i/2. The highlighted occupation configuration never replaces the complete state's mean-density view.

## Preparation, time and reset semantics

- Every lesson entry/back/next/reset restores its prescribed model, preparation, site basis and τ0. Language is retained. Answers are ephemeral and progression is not locked.
- Sandbox entry/reset is L2,N2,j1,u0,|11⟩,site basis,τ0.
- Sandbox L/N changes reset j1,u0,site basis,τ0 and all-left |N0…0⟩. This is a new model/sector, not unitary evolution.
- Parameter changes restore the previously prepared state at τ0. They are not a hidden quench at the current evolved state.
- Preset changes prepare the specified state at τ0, retaining model parameters and display basis.
- Passive basis changes preserve physical state, time and predictions and clear coordinate selections/drafts visibly.
- Evolution always starts from the prepared vector at the requested absolute τ, never repeated incremental integration.
- Editor changes are drafts. Only explicit normalization/preparation changes the state, with its previous norm reported. Nonfinite, empty, oversized or zero-norm input is rejected. Standing-basis draft coordinates are converted back to the canonical site vector.
- Language changes preserve physical state and incomplete numeric draft text. A deliberately focused language control retains focus; an active editor retains focus when language changes without moving focus there.
- No autoplay. Hidden tabs pause playback. Reduced-motion users have manual time exploration instead of continuous playback.

All-left/all-right exist in every sector. N1 also offers equal single-particle amplitudes. L2,N2 offers split, NOON+,c+,c−. L3,N2 offers |101⟩ and (|200⟩+|020⟩+|002⟩)/√3.
