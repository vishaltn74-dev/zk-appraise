# ZK-Appraise: Production Circuit Audit Manifest

**Branch Target:** `cryptography-lead`  
**Circuit Version:** `v1.0.0-frozen`  
**Proving Engine:** EZKL (Halo2 Proving System / KZG Polynomial Commitment Scheme)  
**Elliptic Curve:** BN254 (`alt_bn128`)  
**Status:** **FROZEN & IMMUTABLE FOR THIRD-PARTY AUDIT**  

---

## 1. Circuit Architecture & Security Parameters

| Parameter | Specification | Description |
|---|---|---|
| **Proving System** | Halo2 KZG SNARK | Plonkish arithmetization with multi-point KZG openings |
| **Elliptic Curve** | BN254 ($F_p$, $F_q$) | $r \approx 2^{254}$, 128-bit cryptographic security |
| **Circuit Size ($k = \log_2(\text{rows})$)** | $k = 15$ | Target upper bound $2^{15} = 32,768$ rows |
| **Active Constraint Rows** | 1,036 rows | Arithmetized neural valuation graph |
| **Quantization Scale Factor ($S$)** | $S = 13$ | Dynamic fixed-point quantization ($2^{13} = 8,192$) |
| **Input Visibility** | `Private` | 5-feature property attributes shielded off-chain |
| **Parameter Visibility** | `Fixed` | Frozen neural model weights and biases |
| **Output Visibility** | `Public` | Quantized valuation scalar and VK hash commitment |

---

## 2. Immutable Circuit Artifacts (SHA-256 Checksums)

All binary, configuration, and key artifacts inside `zk-circuits/` are cryptographically frozen. Auditors must verify that local copies match these exact SHA-256 checksums:

| Artifact File | Size (Bytes) | Cryptographic SHA-256 Checksum |
|---|---|---|
| `model.onnx` | 1,857 | `0xcd6a58493040f05e7434185dbc8bc517c46b4dcc666d826015133bc5ebc4e0a8` |
| `input_calibration.json` | 4,786 | `0x09581b6aee1ade53f7e252d93d1593015dc680071b581aad1d6451a968c522f0` |
| `settings.json` | 1,695 | `0xa7ca177f2ba475dd73253fc22f673634d6764f91f958498daa978db9658fae4d` |
| `model.compiled` | 10,116 | `0xe1a93f935f345520e63c0c7efcf79a04265f2fb6d4becdd6ddc1bca5a4832d5f` |
| `kzg.srs` | 4,194,564 | `0xef8903c559b59a5bd6445c16fa272b8d95efd3c9c2c07dcb8fe05c55f8d990e1` |
| `pk.key` | 138,479,371 | `0x9d3f850fc194bc9174a4220ee68ec84bd09209f6d59929f2d11abe336685631b` |
| `vk.key` | 66,823 | `0x7e9b1978c4813b166a4026ce412d06a913c6e19dfb7bf0a91839e09a7a15952a` |
| `verifier_abi.json` | 2,818 | `0xfab9a654f8feac0618359bab25c5160b569edb3d5b021a86b6d7eb29b9945b84` |

> [!IMPORTANT]
> **Canonical Verification Key Commitment Hash:**  
> `0x7e9b1978c4813b166a4026ce412d06a913c6e19dfb7bf0a91839e09a7a15952a`  
> Any alteration to `vk.key` invalidates on-chain and off-chain smart contract verification.

---

## 3. Public and Private Input Schemas

### Public Inputs Tuple (`public_inputs_schema`)
Midnight Compact contracts and external auditors receive a 3-element public tuple:
1. `public_inputs[0]`: Quantized appraisal valuation output ($y_{\text{val}} = \text{valuation} \times 2^S$).
2. `public_inputs[1]`: Quantization scale factor multiplier ($2^S = 8,192$).
3. `public_inputs[2]`: Verification key commitment hash ($H(\text{vk}) = \text{SHA256}(\text{vk.key})$).

### Private Feature Vector (`private_inputs_schema`)
The property feature vector remains entirely confidential on the client:
- $x_0$: `square_footage` ($\text{sq ft} \in [300, 15000]$)
- $x_1$: `bedrooms` ($\text{count} \in [1, 10]$)
- $x_2$: `bathrooms` ($\text{count} \in [1, 8]$)
- $x_3$: `property_age` ($\text{years} \in [0, 120]$)
- $x_4$: `location_risk_score` ($\text{score} \in [1, 100]$)

---

## 4. Precision-Safe Collateral Inequality

To prevent integer division truncation and precision loss, smart contracts and verifiers evaluate threshold eligibility using multiplicative comparison:

$$\text{quantized\_valuation} \ge \text{min\_required\_threshold\_usd} \times 2^S$$

$$\iff y_{\text{val}} \ge \text{Threshold} \times 8192$$

---

## 5. Domain-Separated Nullifier Specification

To prevent double-collateralization and loan replay attacks without revealing property identities or owner keys:

$$\text{Nullifier} = \text{Poseidon}(\text{DOMAIN\_SEPARATOR\_V1}, \text{owner\_secret\_nonce}, \text{property\_hash})$$

- **Domain Separator:** `0x5a4b5f41505052414953455f4e554c4c49464945525f56315f4d49444e49474854` (`ZK_APPRAISE_NULLIFIER_V1_MIDNIGHT`)
- **Collision Guarantee:** Distinct borrower nonces or property hashes generate cryptographically independent nullifiers.

---

## 6. Auditor Standalone CLI Runbook

External auditors can verify any generated proof without installing the frontend or full smart contract simulator.

### Prerequisites
```bash
pip install -r requirements.txt # or pip install ezkl psutil pytest torch
```

### Execution Commands

```bash
# 1. Execute Self-Contained Auditor Pre-Flight Verification
python zk-circuits/src/verify_standalone.py --test-mock

# 2. Verify a Specific Generated Proof against Frozen VK and Settings
python zk-circuits/src/verify_standalone.py \
    --proof zk-circuits/proof.json \
    --vk zk-circuits/vk.key \
    --settings zk-circuits/settings.json \
    --srs zk-circuits/kzg.srs \
    --expected-vk-hash 0x7e9b1978c4813b166a4026ce412d06a913c6e19dfb7bf0a91839e09a7a15952a \
    --min-threshold 250000.0

# 3. Output Machine-Readable JSON for CI/CD Pipelines
python zk-circuits/src/verify_standalone.py \
    --proof zk-circuits/proof.json \
    --json
```

### Verification Exit Codes
- `0`: Proof is cryptographically valid, VK hash matches frozen key, and collateral meets required threshold.
- `1`: Verification failed (invalid proof, tampered inputs, or insufficient collateral).
- `2`: System or file error.

---

## 7. Cryptographic Sign-Off & Verification Evidence

- **Phase 1 (Circuit Compilation & Setup):** PASSED
- **Phase 2 (Numerical Fidelity & Accuracy):** PASSED ($\text{MAPE} = 0.000728\% \le 0.5\%$)
- **Phase 3 (Compact Contract Verifier ABI):** PASSED (Serialized 3-element tuple)
- **Phase 4 (Browser Wasm Prover Pipeline):** PASSED (Typed Web Worker + IndexedDB caching)
- **Phase 5 (Adversarial Penetration & Memory Stress):** PASSED (5/5 tests passing, peak RAM $0.251\text{ GB} \le 2.0\text{ GB}$)
- **Phase 6 (Key Freezing & Standalone Auditor CLI):** PASSED (Exit code 0)
