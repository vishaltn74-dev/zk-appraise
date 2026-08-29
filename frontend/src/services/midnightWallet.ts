import { CompactProofPayload } from './proofService';

export interface SubmitCollateralTxParams {
  proof: string;
  valuationUsd: number;
  requestedLoanUsd: number;
  nullifierHash: string;
  vkCommitment?: string;
  scaleFactor?: number;
  quantizedValuationScalar?: string;
}

export interface MidnightTxResult {
  transactionHash: string;
  blockHeight: number;
  status: 'SUBMITTED' | 'CONFIRMED' | 'FAILED';
  submittedAt: number;
}

export class MidnightWalletService {
  private walletAddress: string | null = null;

  public setWalletAddress(address: string | null) {
    this.walletAddress = address;
  }

  public getWalletAddress(): string | null {
    return this.walletAddress;
  }

  public async submitCollateralProofTx(
    params: SubmitCollateralTxParams | CompactProofPayload & { requestedLoanUsd: number; valuationUsd: number }
  ): Promise<MidnightTxResult> {
    if (!this.walletAddress) {
      throw new Error('Midnight Lace Wallet is not connected.');
    }

    const proofHex = 'proofBytes512' in params ? params.proofBytes512 : params.proof;
    const nullifier = params.nullifierHash;
    const valuation = params.valuationUsd;
    const requested = params.requestedLoanUsd;

    console.log(`[Midnight SDK] Invoking LoanCollateralPool & AppraisalVerifier contracts...`);
    console.log(` - Proof: ${proofHex.slice(0, 18)}... (512 bytes)`);
    console.log(` - Verified Valuation: $${valuation.toLocaleString()}`);
    console.log(` - Loan Requested: $${requested.toLocaleString()}`);
    console.log(` - Nullifier: ${nullifier.slice(0, 18)}...`);

    // Simulate Midnight Compact contract validation & block inclusion
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const simulatedTxHash = '0xmn' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

    return {
      transactionHash: simulatedTxHash,
      blockHeight: 1482093 + Math.floor(Math.random() * 50),
      status: 'CONFIRMED',
      submittedAt: Date.now(),
    };
  }
}
