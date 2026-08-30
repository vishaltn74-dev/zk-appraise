# ZK Real Estate Appraisal Verifier — Technical Specification

## 1. High-Level Architecture

### Core Privacy Goal
Prove that a property's appraised value ≥ loan threshold **without revealing**:
- The raw appraisal value
- The property address/identifier (beyond what's needed for attestation)
- The appraiser's identity
- The specific loan amount requested (only the outcome tier)

### Trust Model
- **Attestation Providers** (licensed appraisers/agencies) sign appraisal reports off-chain via Schnorr signatures on Jubjub
- **Contract** verifies signatures in-circuit and enforces eligibility tiers
- **Applicant** holds a secret key + PIN; identity derived via witness (never `ownPublicKey()`)

---

## 2. Ledger State — Public vs. Private Boundaries

### 2.1 Public Ledger (`export ledger`)

| Field | Type | Purpose | Visibility |
|-------|------|---------|------------|
| `appraisalRegistry` | `MerkleTree<16, Bytes<32>>` | Stores **commitments** of attested appraisal reports (hash of appraisal data + nonce). Allows anonymous membership proof. | Public — only commitments visible |
| `nullifiers` | `Set<Bytes<32>>` | Prevents double-use of same appraisal report. Reveals nullifier on spend, not commitment. | Public |
| `providers` | `Map<Uint<16>, JubjubPoint>` | Registered attestation provider public keys (by providerId). | Public |
| `contractAdmin` | `AdminPublicKey` | Admin public key (derived from secret + domain separator). | Public |
| `loanOutcomes` | `Map<Bytes<32>, Map<Uint<16>, LoanOutcome>>` | **Only loan results** — keyed by applicant's derived `UserPublicKey`, then loanId. Stores `LoanOutcome { authorizedAmount: Uint<16>, status: LoanStatus, appraisalTier: AppraisalTier }`. | Public |
| `blacklist` | `Set<UserPublicKey>` | Revoked applicant keys (derived public keys). | Public |
| `round` | `Counter` | Sequence counter for admin key rotation / replay protection. | Public |

### 2.2 Private State (Witness / Off-Chain Only)

| Data | Source | Never On-Chain |
|------|--------|----------------|
| Raw appraisal value (`Uint<64>`) | Attestation provider witness | ✅ |
| Property identifier / address | Attestation provider witness | ✅ |
| Appraiser license ID | Attestation provider witness | ✅ |
| Appraisal timestamp | Attestation provider witness | ✅ |
| Attestation Schnorr signature | Attestation API response | ✅ |
| Applicant secret key (`UserSecretKey = Bytes<32>`) | User wallet / localStorage | ✅ |
| Applicant PIN (`Uint<16>`) | User input per transaction | ✅ |
| Nonce for appraisal commitment | Fresh randomness per appraisal | ✅ |

### 2.3 Derived Public Identifiers (On-Chain but Unlinkable to Wallet)

| Derived Value | Circuit | Domain Separator |
|---------------|---------|------------------|
| `UserPublicKey` | `deriveUserPublicKey(sk, pin)` | `"zkappraisal:user:pk:v1"` |
| `AdminPublicKey` | `deriveAdminPublicKey(sk)` | `"zkappraisal:admin:pk:v1"` |
| `AppraisalCommitment` | `commitment(sk, appraisalData, nonce)` | `"zkappraisal:appraisal:commit:v1"` |
| `AppraisalNullifier` | `nullifier(sk, appraisalData)` | `"zkappraisal:appraisal:nullifier:v1"` |

---

## 3. Circuit Logic

### 3.1 Core Circuits

#### `requestAppraisalVerification(loanThreshold: Uint<16>, secretPin: Uint<16>): []`
**Purpose**: Prove an attested appraisal exists meeting the threshold, record loan outcome.

**Private Inputs (Witness)**:
- `getAttestedAppraisalWitness(): [AppraisalReport, SchnorrSignature, Uint<16>]`
  - `AppraisalReport { value: Uint<64>, propertyHash: Bytes<32>, appraiserId: Uint<16>, timestamp: Uint<64>, nonce: Bytes<32> }`
  - `SchnorrSignature { announcement: JubjubPoint, response: Field }`
  - `providerId: Uint<16>`
- `getUserSecret(): UserSecretKey`
- `findAppraisalPath(commitment: Bytes<32>): MerkleTreePath<16, Bytes<32>>`

**Logic**:
1. Derive `userPk = deriveUserPublicKey(sk, pin)`
2. Assert `!blacklist.member(userPk)`
3. Reconstruct `commitment = commitment(sk, appraisalReport, nonce)` inside circuit
4. Verify `appraisalRegistry.checkRoot(path.root) == commitment` → proves appraisal is registered **without revealing which one**
5. Verify Schnorr signature: `schnorrVerify(msg, signature, providers[providerId])`
   - `msg = [value, propertyHash, appraiserId, timestamp, transientHash(userPk)]`
   - Domain separation: attestation binds to *this* user's derived key
6. Assert `appraisalReport.value >= loanThreshold`
7. Determine `tier = tierForValue(appraisalReport.value)` (see §3.3)
8. `authorizedAmount = min(loanThreshold, tier.maxLoan)`
9. `status = (authorizedAmount == loanThreshold) ? Approved : Proposed`
10. Insert `loanOutcomes[userPk][loanId] = { authorizedAmount, status, appraisalTier: tier }`
11. Record `nullifier = nullifier(sk, appraisalReport)`; assert `!nullifiers.member(nullifier)`; `nullifiers.insert(nullifier)`
12. Increment `loanId` counter per user (or global)

#### `respondToLoan(loanId: Uint<16>, secretPin: Uint<16>, accept: Boolean): []`
**Purpose**: Accept or decline a `Proposed` loan offer.

**Logic**:
1. Derive `userPk`, load `outcome = loanOutcomes[userPk][loanId]`
2. Assert `outcome.status == Proposed`
3. If `accept`: `outcome.status = Approved`; else `outcome.status = NotAccepted`
4. Update ledger

#### `changePin(oldPin: Uint<16>, newPin: Uint<16>): []`
**Purpose**: Migrate loan records to new derived key (batched, 5 per tx like zkloan).

**Logic**:
1. Derive `oldPk = deriveUserPublicKey(sk, oldPin)`, `newPk = deriveUserPublicKey(sk, newPin)`
2. Assert `oldPk != newPk`
3. Migrate up to 5 loan entries from `loanOutcomes[oldPk]` → `loanOutcomes[newPk]`
4. Track progress in `pinMigration[oldPk]` counter

---

### 3.2 Admin Circuits (Guard: `deriveAdminPublicKey(getUserSecret()) == contractAdmin`)

| Circuit | Purpose |
|---------|---------|
| `registerProvider(providerId: Uint<16>, providerPk: JubjubPoint)` | Onboard attestation provider |
| `rotateAdmin(newAdmin: AdminPublicKey)` | Key rotation |
| `blacklistUser(userPk: UserPublicKey)` | Revoke applicant |
| `registerAppraisal(commitment: Bytes<32>)` | Provider submits appraisal commitment to registry |

---

### 3.3 Appraisal Tiers & Loan Limits

| Tier | Min Appraisal Value | Max Loan Amount |
|------|---------------------|-----------------|
| `Platinum` | ≥ $1,000,000 | $500,000 |
| `Gold` | ≥ $500,000 | $250,000 |
| `Silver` | ≥ $250,000 | $100,000 |
| `Bronze` | ≥ $100,000 | $50,000 |
| `Ineligible` | < $100,000 | $0 (Rejected) |

**Threshold logic**: User requests `loanThreshold`. Contract computes `authorizedAmount = min(loanThreshold, tier.maxLoan)`. If `authorizedAmount < loanThreshold` → `Proposed` (user must accept reduced amount via `respondToLoan`).

---

## 4. Attestation Flow (Off-Chain → In-Circuit)

```
┌─────────────┐     ┌──────────────────┐     ┌──────────────────┐
│  Applicant  │────▶│ Attestation API  │────▶│  Midnight Chain  │
│  (User)     │     │  (Appraiser)     │     │  (Contract)      │
└─────────────┘     └──────────────────┘     └──────────────────┘
      │                      │                        │
      │ 1. Submit property  │                        │
      │    details + user   │                        │
      │    PubKeyHash       │                        │
      │────────────────────▶│                        │
      │                     │ 2. Verify appraisal    │
      │                     │    data, compute       │
      │                     │    msg = [value,       │
      │                     │    propertyHash,       │
      │                     │    appraiserId,        │
      │                     │    timestamp,          │
      │                     │    userPubKeyHash]     │
      │                     │                        │
      │                     │ 3. Schnorr sign with   │
      │                     │    provider secret key │
      │                     │                        │
      │ ◀───────────────────│ 4. Return {signature,  │
      │    {sig, providerId}│    providerId}        │
      │                     │                        │
      │ 5. requestAppraisalVerification(threshold, pin)
      │    + private state  │                        │
      │    (appraisal, sig, │                        │
      │     providerId, sk) │                        │
      │────────────────────▶│                        │
      │                     │                        │ 6. In-circuit:
      │                     │                        │    - Verify sig
      │                     │                        │    - Check tier
      │                     │                        │    - Record outcome
      │                     │                        │
      │ ◀───────────────────│ 7. LoanOutcome on      │
      │    (public ledger)  │    loanOutcomes map    │
```

**Attestation API Requirements**:
- Jubjub provider keypair (generated at startup, rotated via admin)
- Challenge computed via `pureCircuits.schnorrChallenge(msg)` (matching in-circuit)
- Binds to `transientHash(deriveUserPublicKey(sk, pin))` — same as circuit
- Rate-limited, input-validated, HTTPS only

---

## 5. Security Patterns Applied (from midnight-security)

| Pattern | Implementation |
|---------|----------------|
| **No sensitive circuit args** | `loanThreshold` is public (acceptable); appraisal data, PIN, secret key all via witness |
| **Anonymous membership** | `MerkleTree<16, Bytes<32>>` for appraisal registry — `checkRoot` reveals nothing about which appraisal |
| **Commitment + Nullifier** | `commitment(sk, data, nonce)` inserted to registry; `nullifier(sk, data)` prevents reuse; **different domain separators** |
| **Domain separation** | Unique `pad(32, "zkappraisal:...")` per derived key / commitment / nullifier |
| **No `ownPublicKey()`** | Identity from `deriveUserPublicKey(getUserSecret(), pin)` — witness-derived |
| **Witness validation** | All witness outputs `assert`ed before use (value ranges, provider registration, blacklist) |
| **Replay protection** | `round` counter in admin key derivation; nullifiers for appraisals |
| **Persistent hashes** | All ledger commitments use `persistentCommit` / `persistentHash` |
| **Guaranteed vs fallible** | Admin actions (guaranteed) minimal; loan verification (fallible) asserts before state writes |

---

## 6. Merkle Tree Sizing

| Tree | Depth | Max Leaves | Rationale |
|------|-------|------------|-----------|
| `appraisalRegistry` | 16 | 65,536 | Expected < 50k active appraisals; HistoricMerkleTree if frequent inserts between proof gen/submission |

---

## 7. TypeScript Integration Surface

### Private State Schema
```typescript
interface ZKAppraisalPrivateState {
  appraisalReport: {
    value: bigint;
    propertyHash: Uint8Array;     // 32 bytes
    appraiserId: bigint;
    timestamp: bigint;
    nonce: Uint8Array;            // 32 bytes
  };
  attestationSignature: SchnorrSignature;
  providerId: bigint;
  userSecretKey: Uint8Array;      // 32 bytes
}
```

### Key Functions (`lib/zkappraisal.ts`)
| Function | Purpose |
|----------|---------|
| `getOrCreateUserSecret()` | Persist 32-byte secret |
| `deriveUserPublicKey(session, pin)` | Call pure circuit off-chain |
| `fetchAttestation(apiUrl, report, userPubKeyHash)` | POST to attestation API |
| `requestAppraisalVerification(session, addr, threshold, pin, privateState)` | Submit verification |
| `respondToLoan(session, addr, loanId, pin, accept)` | Accept/decline |
| `fetchLoanOutcomes(queryUrl, addr, userPkBytes)` | Indexer read |

---

## 8. Deployment & Operations

| Component | Detail |
|-----------|--------|
| **Compact version** | 0.22–0.23 |
| **Node.js** | ≥ 22 |
| **Proof server** | 8.0.3 (Docker) |
| **Network** | Preprod / Mainnet |
| **ZK assets** | Synced to `public/zk/zkappraisal/` for browser |
| **Attestation API** | Separate service, provider key rotated via admin circuit |

---

## 9. Open Design Decisions (Confirm Before Coding)

1. **Loan ID scheme**: Per-user counter vs global counter?
2. **Appraisal registry**: `MerkleTree` vs `HistoricMerkleTree` — frequency of new appraisals between proof gen and submission?
3. **Property identifier**: Hash on-chain (`propertyHash: Bytes<32>`) or full address in witness only?
4. **Multi-appraisal support**: Allow multiple appraisals per property? (Current: one active via nullifier)
5. **Tier configuration**: Hardcoded in contract vs admin-updatable `Map<AppraisalTier, TierConfig>`?
6. **Frontend**: Next.js + 1AM (copy leaderboard-dapp) or CLI-only first?

---

*This specification defines the exact privacy boundaries, circuit responsibilities, and data flows. Ready to implement `.compact` once design decisions are confirmed.*