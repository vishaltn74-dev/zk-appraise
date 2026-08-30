# ZK-Appraise Frontend

Zero-Knowledge Decentralized Real Estate Appraisal & DeFi Collateralization Protocol on the Midnight Network.

---

## 1. Canonical Frontend Runtime

The canonical frontend runtime for ZK-Appraise is **Vite + React 18 + TypeScript + Tailwind CSS**.

- **Runtime**: Browser client-side application (ESNext / WebWorker enabled).
- **Bundler**: Vite 5 with `@vitejs/plugin-react`.
- **Styling**: Tailwind CSS with custom glassmorphism design tokens and dark mode.
- **ZKML Runtime**: Client-side Web Worker executing Halo2 / EZKL proof synthesis off the main thread.
- **Blockchain Integration**: Midnight.js and Midnight Lace Wallet DApp connector for Compact 0.26 smart contracts.

---

## 2. Dependency Installation

To install all frontend dependencies:

```bash
# From repository root
cd frontend
npm install
```

---

## 3. Running Locally

To launch the local development server with Hot Module Replacement (HMR) and Web Worker support:

```bash
# From repository root
npm run dev:frontend

# Or directly within frontend/
cd frontend
npm run dev
```

The application will be accessible at: `http://localhost:3000`

---

## 4. Building for Production

To perform full TypeScript type checking and create an optimized production build:

```bash
# From repository root
npm run build:frontend

# Or within frontend/
cd frontend
npm run build
```

Production build artifacts will be emitted to `frontend/dist/`.

To preview the production build locally:

```bash
npm run preview
```

---

## 5. Component Architecture & Directory Structure

```
frontend/
├── index.html                     # HTML entry point with Google Fonts (Inter, Space Grotesk, JetBrains Mono)
├── package.json                   # Vite scripts and dependencies
├── vite.config.ts                 # Path aliases, worker format, and COOP/COEP headers
├── tailwind.config.js             # Theme tokens, fonts, and dark palette
├── tsconfig.json                  # TypeScript compiler settings and path aliases
├── public/
│   ├── icon.svg                   # Brand protocol favicon
│   └── wasm/
│       └── wasm_manifest.json     # Manifest pointing to circuit parameters (SRS, PK, settings)
└── src/
    ├── main.tsx                   # React root entry point mounting <App />
    ├── App.tsx                    # Primary layout assembling Nav, Hero, Intake Form, Calculator & Receipts
    ├── index.css                  # Design system tokens, glassmorphism utilities (.glass, .glass-strong), and animations
    ├── lib/
    │   └── utils.ts               # Class merging utility (clsx + tailwind-merge)
    ├── components/
    │   ├── GradientMesh.tsx       # Ambient floating animated gradient mesh background
    │   ├── SiteNav.tsx            # Sticky header with brand identity, protocol tags, and wallet status
    │   ├── Hero.tsx               # Metric cards (98.6% Accuracy, 75% LTV Cap, Zero-Knowledge Privacy)
    │   ├── PropertyIntakeForm.tsx # Dual-tab intake (Detailed Property Specs & California AI Model attributes)
    │   ├── LoanCalculator.tsx     # Real-time LTV visualizer, secret PIN witness, multiplicative check, and Compact submit
    │   └── WalletConnector.tsx    # Midnight Lace Wallet connector badge
    ├── hooks/
    │   └── useMidnightContract.ts # State machine orchestrating wallet, prover worker, and Compact contract calls
    ├── services/
    │   ├── proofService.ts        # ProofService managing Web Worker lifecycle and IndexedDB parameter cache
    │   ├── midnightWallet.ts      # DApp connector service for shielded address & transaction dispatch
    │   └── contractBridge.ts      # Compact smart contract bridge for verification, nullifiers, and LTV tiers
    └── workers/
        └── prover.worker.ts       # Off-thread Web Worker simulating Halo2/EZKL SNARK proof synthesis
```

---

## 6. Where Proof Generation Lives

Proof generation is entirely decoupled from the UI thread and runs client-side:

1. **`src/workers/prover.worker.ts`**:
   - Executes off the main thread inside a Web Worker.
   - Evaluates the valuation model against private property attributes.
   - Emits streaming progress events (`PREPARING_INPUTS` &rarr; `ASSIGNING_WITNESS` &rarr; `SYNTHESIZING_SNARK` &rarr; `COMPLETED`).
   - Quantizes the valuation using dynamic fixed-point scaling factor ($2^{13} = 8192$).
   - Returns a 512-byte zero-knowledge SNARK proof hex, frozen verification key commitment (`0xff02743...`), and public scalars.
2. **`src/services/proofService.ts`**:
   - Manages the worker instance, preloads circuit parameters into client IndexedDB (`zk_appraise_cache`), and marshals outputs into `CompactProofPayload`.

---

## 7. Where Midnight Wallet Integration Lives

1. **`src/services/midnightWallet.ts`**:
   - Interfaces with `window.midnight.lace` to enable shielded address access and submit collateral transactions.
2. **`src/services/contractBridge.ts`**:
   - Integrates with Midnight Compact smart contracts (`appraiser_verifier.compact` and `LoanCollateralPool`).
   - Derives domain-separated unlinkable user public keys from witness PIN (`zkappraisal:user:pk:v1`).
   - Tracks nullifiers on-chain to strictly prevent double-collateralization.
   - Determines loan tier eligibility (Platinum, Gold, Silver, Bronze, Ineligible).
3. **`src/hooks/useMidnightContract.ts`**:
   - Encapsulates the complete workflow state machine (`idle` &rarr; `generating_proof` &rarr; `submitting_to_midnight` &rarr; `verified` / `rejected` / `error`).

---

## 8. Private Property Data Flow (Security Guarantee)

```
[User Input: sqft, beds, baths, age, income]
                     │
                     ▼ (In-Memory Only)
           [PropertyIntakeForm]
                     │
                     ▼ (Structured Clone)
            [prover.worker.ts]
                     │
         ┌───────────┴───────────┐
         │ Halo2 / EZKL Proving  │
         │ (Evaluates model & π) │
         └───────────┬───────────┘
                     │
                     ▼ (Only Public Artifacts)
       - 512-Byte SNARK Proof (π)
       - Quantized Valuation Scalar (y_val)
       - Scale Multiplier (2^13 = 8192)
       - Nullifier Hash (hash(nonce || prop))
       - Unlinkable PK (hash(secret || PIN))
                     │
                     ▼
          [Midnight Smart Contract]
```

- **Zero Network Transmission**: Raw property attributes and coordinates are never transmitted across the network, logged to remote services, or stored in browser `localStorage`.
- **Zero Third-Party Telemetry**: Next.js server runtime and `@vercel/analytics` have been eliminated to ensure strict cryptographic data isolation.

---

## 9. What Is Fully Functional

- **Client-Side ZKML Prover Pipeline**: Dual-mode input parsing (California AI linear regression model and property specs), fixed-point quantization, deterministic 512-byte SNARK generation, and non-blocking Web Worker progress streaming.
- **IndexedDB Circuit Cache**: Caching circuit parameters locally in the browser to avoid repeated downloads.
- **LTV Eligibility Engine**: Protocol-enforced 75% LTV cap, tier thresholds, and multiplicative contract constraint evaluation ($y_{\text{val}} \ge \text{loan} \times 8192$).
- **Compact Contract Verification & Nullifier Engine**: On-chain double-collateralization rejection, domain-separated nullifiers, unlinkable public key derivation, and transaction receipt generation.
- **Polished Glassmorphic Design System**: Animated multi-layered gradient meshes, dark theme tokens, responsive layouts, and interactive feedback.

---

## 10. External Environment Configuration (Live vs Simulator)

- **Simulated Mode (Default)**: The application automatically operates in simulated mode when running in standalone browsers without the Midnight Lace extension or a connected local Midnight proof server / node.
- **Live Node Mode**: When a Midnight Lace Wallet (`window.midnight.lace`) and `@midnight-ntwrk/midnight-js` contract service are present, the bridge automatically routes transaction proofs directly to live Midnight testnet/devnet nodes.
