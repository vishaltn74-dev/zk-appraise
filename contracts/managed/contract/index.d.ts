import type * as __compactRuntime from '@midnight-ntwrk/compact-runtime';

export enum LoanStatus { Approved = 0,
                         Rejected = 1,
                         Proposed = 2,
                         NotAccepted = 3
}

export enum AppraisalTier { Platinum = 0,
                            Gold = 1,
                            Silver = 2,
                            Bronze = 3,
                            Ineligible = 4
}

export type LoanOutcome = { authorizedAmount: bigint;
                            status: LoanStatus;
                            appraisalTier: AppraisalTier
                          };

export type LoanKey = { user: UserPublicKey; loanId: bigint };

export type AppraisalReport = { value: bigint;
                                propertyHash: Uint8Array;
                                appraiserId: bigint;
                                timestamp: bigint;
                                nonce: Uint8Array
                              };

export type UserSecretKey = Uint8Array;

export type UserPublicKey = Uint8Array;

export type AdminPublicKey = Uint8Array;

export type SchnorrSignature = Uint8Array;

export type Witnesses<PS> = {
  getAttestedAppraisalWitness(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, [AppraisalReport,
                                                                                           SchnorrSignature,
                                                                                           bigint]];
  getUserSecret(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, UserSecretKey];
  getAppraisalCommitment(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, Uint8Array];
  findAppraisalPath(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, { leaf: Uint8Array,
                                                                                  path: { sibling: { field: bigint
                                                                                                   },
                                                                                          goes_left: boolean
                                                                                        }[]
                                                                                }];
}

export type ImpureCircuits<PS> = {
  requestAppraisalVerification(context: __compactRuntime.CircuitContext<PS>,
                               loanThreshold_0: bigint,
                               secretPin_0: bigint): Promise<__compactRuntime.CircuitResults<PS, []>>;
  respondToLoan(context: __compactRuntime.CircuitContext<PS>,
                loanId_0: bigint,
                secretPin_0: bigint,
                accept_0: boolean): Promise<__compactRuntime.CircuitResults<PS, []>>;
  changePin(context: __compactRuntime.CircuitContext<PS>,
            oldPin_0: bigint,
            newPin_0: bigint): Promise<__compactRuntime.CircuitResults<PS, []>>;
  registerProvider(context: __compactRuntime.CircuitContext<PS>,
                   providerId_0: bigint,
                   providerPk_0: __compactRuntime.JubjubPoint): Promise<__compactRuntime.CircuitResults<PS, []>>;
  rotateAdmin(context: __compactRuntime.CircuitContext<PS>,
              newAdmin_0: AdminPublicKey): Promise<__compactRuntime.CircuitResults<PS, []>>;
  blacklistUser(context: __compactRuntime.CircuitContext<PS>,
                userPk_0: UserPublicKey): Promise<__compactRuntime.CircuitResults<PS, []>>;
  registerAppraisal(context: __compactRuntime.CircuitContext<PS>,
                    commitment_0: Uint8Array): Promise<__compactRuntime.CircuitResults<PS, []>>;
}

export type ProvableCircuits<PS> = {
  requestAppraisalVerification(context: __compactRuntime.CircuitContext<PS>,
                               loanThreshold_0: bigint,
                               secretPin_0: bigint): Promise<__compactRuntime.CircuitResults<PS, []>>;
  respondToLoan(context: __compactRuntime.CircuitContext<PS>,
                loanId_0: bigint,
                secretPin_0: bigint,
                accept_0: boolean): Promise<__compactRuntime.CircuitResults<PS, []>>;
  changePin(context: __compactRuntime.CircuitContext<PS>,
            oldPin_0: bigint,
            newPin_0: bigint): Promise<__compactRuntime.CircuitResults<PS, []>>;
  registerProvider(context: __compactRuntime.CircuitContext<PS>,
                   providerId_0: bigint,
                   providerPk_0: __compactRuntime.JubjubPoint): Promise<__compactRuntime.CircuitResults<PS, []>>;
  rotateAdmin(context: __compactRuntime.CircuitContext<PS>,
              newAdmin_0: AdminPublicKey): Promise<__compactRuntime.CircuitResults<PS, []>>;
  blacklistUser(context: __compactRuntime.CircuitContext<PS>,
                userPk_0: UserPublicKey): Promise<__compactRuntime.CircuitResults<PS, []>>;
  registerAppraisal(context: __compactRuntime.CircuitContext<PS>,
                    commitment_0: Uint8Array): Promise<__compactRuntime.CircuitResults<PS, []>>;
}

export type PureCircuits = {
  deriveUserPublicKey(sk_0: UserSecretKey, pin_0: bigint): UserPublicKey;
  deriveAdminPublicKey(sk_0: UserSecretKey): AdminPublicKey;
}

export type Circuits<PS> = {
  deriveUserPublicKey(context: __compactRuntime.CircuitContext<PS>,
                      sk_0: UserSecretKey,
                      pin_0: bigint): Promise<__compactRuntime.CircuitResults<PS, UserPublicKey>>;
  deriveAdminPublicKey(context: __compactRuntime.CircuitContext<PS>,
                       sk_0: UserSecretKey): Promise<__compactRuntime.CircuitResults<PS, AdminPublicKey>>;
  requestAppraisalVerification(context: __compactRuntime.CircuitContext<PS>,
                               loanThreshold_0: bigint,
                               secretPin_0: bigint): Promise<__compactRuntime.CircuitResults<PS, []>>;
  respondToLoan(context: __compactRuntime.CircuitContext<PS>,
                loanId_0: bigint,
                secretPin_0: bigint,
                accept_0: boolean): Promise<__compactRuntime.CircuitResults<PS, []>>;
  changePin(context: __compactRuntime.CircuitContext<PS>,
            oldPin_0: bigint,
            newPin_0: bigint): Promise<__compactRuntime.CircuitResults<PS, []>>;
  registerProvider(context: __compactRuntime.CircuitContext<PS>,
                   providerId_0: bigint,
                   providerPk_0: __compactRuntime.JubjubPoint): Promise<__compactRuntime.CircuitResults<PS, []>>;
  rotateAdmin(context: __compactRuntime.CircuitContext<PS>,
              newAdmin_0: AdminPublicKey): Promise<__compactRuntime.CircuitResults<PS, []>>;
  blacklistUser(context: __compactRuntime.CircuitContext<PS>,
                userPk_0: UserPublicKey): Promise<__compactRuntime.CircuitResults<PS, []>>;
  registerAppraisal(context: __compactRuntime.CircuitContext<PS>,
                    commitment_0: Uint8Array): Promise<__compactRuntime.CircuitResults<PS, []>>;
}

export type Ledger = {
  appraisalRegistry: {
    isFull(): boolean;
    checkRoot(rt_0: { field: bigint }): boolean;
    root(): __compactRuntime.MerkleTreeDigest;
    firstFree(): bigint;
    pathForLeaf(index_0: bigint, leaf_0: Uint8Array): __compactRuntime.MerkleTreePath<Uint8Array>;
    findPathForLeaf(leaf_0: Uint8Array): __compactRuntime.MerkleTreePath<Uint8Array> | undefined
  };
  nullifiers: {
    isEmpty(): boolean;
    size(): bigint;
    member(elem_0: Uint8Array): boolean;
    [Symbol.iterator](): Iterator<Uint8Array>
  };
  providers: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: bigint): boolean;
    lookup(key_0: bigint): __compactRuntime.JubjubPoint;
    [Symbol.iterator](): Iterator<[bigint, __compactRuntime.JubjubPoint]>
  };
  readonly contractAdmin: AdminPublicKey;
  loanOutcomes: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: LoanKey): boolean;
    lookup(key_0: LoanKey): LoanOutcome;
    [Symbol.iterator](): Iterator<[LoanKey, LoanOutcome]>
  };
  blacklist: {
    isEmpty(): boolean;
    size(): bigint;
    member(elem_0: UserPublicKey): boolean;
    [Symbol.iterator](): Iterator<UserPublicKey>
  };
  readonly round: bigint;
  readonly nextLoanId: bigint;
  pinMigration: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: UserPublicKey): boolean;
    lookup(key_0: UserPublicKey): bigint;
    [Symbol.iterator](): Iterator<[UserPublicKey, bigint]>
  };
}

export type ContractReferenceLocations = any;

export declare const contractReferenceLocations : ContractReferenceLocations;

export declare class Contract<PS = any, W extends Witnesses<PS> = Witnesses<PS>> {
  witnesses: W;
  circuits: Circuits<PS>;
  impureCircuits: ImpureCircuits<PS>;
  provableCircuits: ProvableCircuits<PS>;
  constructor(witnesses: W);
  initialState(context: __compactRuntime.ConstructorContext<PS>): Promise<__compactRuntime.ConstructorResult<PS>>;
}

export declare function ledger(state: __compactRuntime.StateValue | __compactRuntime.ChargedState): Ledger;
export declare const pureCircuits: PureCircuits;
export declare const expectedVk: Record<string, string>;
