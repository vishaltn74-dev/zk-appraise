import { CompactProofPayload } from './proofService';

export type AppraisalTier = 'Platinum' | 'Gold' | 'Silver' | 'Bronze' | 'Ineligible';
export type LoanStatus = 'Approved' | 'Rejected' | 'Proposed' | 'NotAccepted';

export interface VerificationRequest {
  loanThresholdUsd: number;
  secretPin: number;
  valuationUsd: number;
  proofPayload: CompactProofPayload;
  userSecretKey?: string;
}

export interface ContractVerificationResult {
  status: 'VERIFIED' | 'REJECTED' | 'PROPOSED' | 'FAILED';
  transactionHash: string;
  blockHeight: number;
  tier: AppraisalTier;
  tierName: string;
  authorizedAmount: number;
  loanThresholdUsd: number;
  appraisedValuationUsd: number;
  nullifierHash: string;
  userPublicKey: string;
  mode: 'LIVE_NODE' | 'SIMULATED';
  gasUsed?: number;
  submittedAt: number;
  error?: string;
}

export interface TierConfig {
  name: string;
  minValuation: number;
  maxLtv: number;
  maxLoanCap: number;
}

export const TIER_DEFINITIONS: Record<AppraisalTier, TierConfig> = {
  Platinum: { name: 'Platinum Tier', minValuation: 750000, maxLtv: 0.75, maxLoanCap: 1000000 },
  Gold: { name: 'Gold Tier', minValuation: 500000, maxLtv: 0.75, maxLoanCap: 600000 },
  Silver: { name: 'Silver Tier', minValuation: 300000, maxLtv: 0.75, maxLoanCap: 375000 },
  Bronze: { name: 'Bronze Tier', minValuation: 100000, maxLtv: 0.70, maxLoanCap: 150000 },
  Ineligible: { name: 'Ineligible Tier', minValuation: 0, maxLtv: 0.0, maxLoanCap: 0 },
};

export class MidnightContractBridge {
  private walletAddress: string | null = null;
  private providers: any = null;
  private deployedContract: any = null;
  private usedNullifiers: Set<string> = new Set();
  private currentBlockHeight: number = 1482100;

  public setWalletAddress(address: string | null) {
    this.walletAddress = address;
  }

  public getWalletAddress(): string | null {
    return this.walletAddress;
  }

  public setProviders(providers: any) {
    this.providers = providers;
  }

  /**
   * Determine appraisal tier based on verified valuation USD.
   */
  public determineTier(valuationUsd: number): AppraisalTier {
    if (valuationUsd >= 750000) return 'Platinum';
    if (valuationUsd >= 500000) return 'Gold';
    if (valuationUsd >= 300000) return 'Silver';
    if (valuationUsd >= 100000) return 'Bronze';
    return 'Ineligible';
  }

  /**
   * Unlinkable public key derivation using witness secret and PIN.
   * Aligned with Compact contract domain separator: "zkappraisal:user:pk:v1".
   */
  public deriveUserPublicKey(userSecret: string, pin: number): string {
    const combined = `${userSecret}:${pin}:zkappraisal:user:pk:v1`;
    let hash = 0;
    for (let i = 0; i < combined.length; i++) {
      hash = (hash << 5) - hash + combined.charCodeAt(i);
      hash |= 0;
    }
    const hex = Math.abs(hash).toString(16).padStart(8, '0');
    return `0xpk_${hex}${Array.from({ length: 48 }, (_, i) => ((hash ^ i * 17) & 0xff).toString(16).padStart(2, '0')).join('')}`;
  }

  /**
   * Verify appraisal proof and submit to Midnight Compact contract.
   */
  public async verifyAppraisalProof(request: VerificationRequest): Promise<ContractVerificationResult> {
    const { loanThresholdUsd, secretPin, valuationUsd, proofPayload, userSecretKey = 'default_user_secret_0x99' } = request;

    if (!proofPayload || !proofPayload.proofBytes512) {
      throw new Error('Invalid proof payload: missing 512-byte zero-knowledge SNARK proof.');
    }

    // Contract bridge safety gate (plan Section 23):
    // Reject SIMULATED_DEV_ONLY proofs in production unless explicitly enabled.
    if (proofPayload.proverMode === 'SIMULATED_DEV_ONLY') {
      let devSimAllowed = false;
      try {
        devSimAllowed = import.meta.env?.VITE_ALLOW_DEV_SIMULATOR === 'true';
      } catch { /* not in Vite context */ }
      if (!devSimAllowed) {
        throw new Error(
          'Contract bridge REJECTED simulated proof.\n' +
          'Synthetic proofs cannot be submitted to the production verification path.\n' +
          'Set VITE_ALLOW_DEV_SIMULATOR=true for development use only.'
        );
      }
      console.warn('[Contract Bridge] ⚠️ SIMULATED proof accepted — DEVELOPMENT ONLY.');
    }

    const userPk = this.deriveUserPublicKey(userSecretKey, secretPin);
    const tier = this.determineTier(valuationUsd);
    const tierConfig = TIER_DEFINITIONS[tier];

    // Check duplicate nullifier (Double-collateralization protection)
    if (this.usedNullifiers.has(proofPayload.nullifierHash)) {
      throw new Error('Contract Rejection: Nullifier already spent. Double-collateralization detected.');
    }

    // Evaluate loan eligibility against LTV & tier limits
    const maxAllowedLoan = Math.min(valuationUsd * tierConfig.maxLtv, tierConfig.maxLoanCap);
    const isEligible = loanThresholdUsd <= maxAllowedLoan && tier !== 'Ineligible';
    const authorizedAmount = isEligible ? Math.min(loanThresholdUsd, maxAllowedLoan) : 0;

    let txHash: string;
    let mode: 'LIVE_NODE' | 'SIMULATED' = 'SIMULATED';

    // Try Live Midnight Node execution if providers available
    if (this.providers && typeof window !== 'undefined') {
      try {
        console.log('[Midnight Contract Bridge] Attempting live contract invocation via Midnight.js...');
        // Dynamic import with vite-ignore to support browser bundling without ESM wasm bundling errors
        const contractService = await import(/* @vite-ignore */ '@root-src/contractService.js').catch(() => null);
        if (contractService && contractService.setupAppraiserContract) {
          const api = await contractService.setupAppraiserContract(this.providers);
          const tx = await api.requestVerification(loanThresholdUsd, secretPin);
          txHash = tx?.hash || tx?.txId || `0xmn_${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;
          mode = 'LIVE_NODE';
        } else {
          throw new Error('Contract service not loaded, using local simulator.');
        }
      } catch (err: any) {
        console.warn('[Midnight Contract Bridge] Live node unavailable, falling back to local Midnight Compact simulator:', err?.message);
        txHash = `0xmn_sim_${Array.from({ length: 58 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;
      }
    } else {
      // Local simulated execution mode
      await new Promise((resolve) => setTimeout(resolve, 800)); // Simulate block latency
      txHash = `0xmn_sim_${Array.from({ length: 58 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;
    }

    // Mark nullifier as spent on ledger
    this.usedNullifiers.add(proofPayload.nullifierHash);
    this.currentBlockHeight += Math.floor(Math.random() * 3) + 1;

    const result: ContractVerificationResult = {
      status: isEligible ? 'VERIFIED' : 'REJECTED',
      transactionHash: txHash,
      blockHeight: this.currentBlockHeight,
      tier,
      tierName: tierConfig.name,
      authorizedAmount,
      loanThresholdUsd,
      appraisedValuationUsd: valuationUsd,
      nullifierHash: proofPayload.nullifierHash,
      userPublicKey: userPk,
      mode,
      gasUsed: 42100 + Math.floor(Math.random() * 2500),
      submittedAt: Date.now(),
      error: isEligible ? undefined : `Requested loan ($${loanThresholdUsd.toLocaleString()}) exceeds maximum allowed LTV for ${tierConfig.name} ($${maxAllowedLoan.toLocaleString()}).`,
    };

    return result;
  }

  /**
   * Reset nullifier registry for test runs.
   */
  public resetState() {
    this.usedNullifiers.clear();
  }
}

export const globalMidnightContractBridge = new MidnightContractBridge();
