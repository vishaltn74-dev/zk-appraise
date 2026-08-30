import * as __compactRuntime from '@midnight-ntwrk/compact-runtime';
__compactRuntime.checkRuntimeVersion('0.19.0');

export var LoanStatus;
(function (LoanStatus) {
  LoanStatus[LoanStatus['Approved'] = 0] = 'Approved';
  LoanStatus[LoanStatus['Rejected'] = 1] = 'Rejected';
  LoanStatus[LoanStatus['Proposed'] = 2] = 'Proposed';
  LoanStatus[LoanStatus['NotAccepted'] = 3] = 'NotAccepted';
})(LoanStatus || (LoanStatus = {}));

export var AppraisalTier;
(function (AppraisalTier) {
  AppraisalTier[AppraisalTier['Platinum'] = 0] = 'Platinum';
  AppraisalTier[AppraisalTier['Gold'] = 1] = 'Gold';
  AppraisalTier[AppraisalTier['Silver'] = 2] = 'Silver';
  AppraisalTier[AppraisalTier['Bronze'] = 3] = 'Bronze';
  AppraisalTier[AppraisalTier['Ineligible'] = 4] = 'Ineligible';
})(AppraisalTier || (AppraisalTier = {}));

const _descriptor_0 = new __compactRuntime.CompactTypeBytes(32);

const _descriptor_1 = new __compactRuntime.CompactTypeUnsignedInteger(65535n, 2);

const _descriptor_2 = __compactRuntime.CompactTypeJubjubPoint;

const _descriptor_3 = __compactRuntime.CompactTypeBoolean;

class _LoanKey_0 {
  alignment() {
    return _descriptor_0.alignment().concat(_descriptor_1.alignment());
  }
  fromValue(value_0) {
    return {
      user: _descriptor_0.fromValue(value_0),
      loanId: _descriptor_1.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_0.toValue(value_0.user).concat(_descriptor_1.toValue(value_0.loanId));
  }
}

const _descriptor_4 = new _LoanKey_0();

const _descriptor_5 = new __compactRuntime.CompactTypeUnsignedInteger(4294967295n, 4);

const _descriptor_6 = new __compactRuntime.CompactTypeEnum(3, 1);

const _descriptor_7 = new __compactRuntime.CompactTypeEnum(4, 1);

class _LoanOutcome_0 {
  alignment() {
    return _descriptor_5.alignment().concat(_descriptor_6.alignment().concat(_descriptor_7.alignment()));
  }
  fromValue(value_0) {
    return {
      authorizedAmount: _descriptor_5.fromValue(value_0),
      status: _descriptor_6.fromValue(value_0),
      appraisalTier: _descriptor_7.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_5.toValue(value_0.authorizedAmount).concat(_descriptor_6.toValue(value_0.status).concat(_descriptor_7.toValue(value_0.appraisalTier)));
  }
}

const _descriptor_8 = new _LoanOutcome_0();

const _descriptor_9 = __compactRuntime.CompactTypeField;

const _descriptor_10 = new __compactRuntime.CompactTypeVector(5, _descriptor_9);

const _descriptor_11 = new __compactRuntime.CompactTypeBytes(64);

class _MerkleTreeDigest_0 {
  alignment() {
    return _descriptor_9.alignment();
  }
  fromValue(value_0) {
    return {
      field: _descriptor_9.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_9.toValue(value_0.field);
  }
}

const _descriptor_12 = new _MerkleTreeDigest_0();

const _descriptor_13 = new __compactRuntime.CompactTypeUnsignedInteger(18446744073709551615n, 8);

class _AppraisalReport_0 {
  alignment() {
    return _descriptor_13.alignment().concat(_descriptor_0.alignment().concat(_descriptor_1.alignment().concat(_descriptor_13.alignment().concat(_descriptor_0.alignment()))));
  }
  fromValue(value_0) {
    return {
      value: _descriptor_13.fromValue(value_0),
      propertyHash: _descriptor_0.fromValue(value_0),
      appraiserId: _descriptor_1.fromValue(value_0),
      timestamp: _descriptor_13.fromValue(value_0),
      nonce: _descriptor_0.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_13.toValue(value_0.value).concat(_descriptor_0.toValue(value_0.propertyHash).concat(_descriptor_1.toValue(value_0.appraiserId).concat(_descriptor_13.toValue(value_0.timestamp).concat(_descriptor_0.toValue(value_0.nonce)))));
  }
}

const _descriptor_14 = new _AppraisalReport_0();

class _MerkleTreePathEntry_0 {
  alignment() {
    return _descriptor_12.alignment().concat(_descriptor_3.alignment());
  }
  fromValue(value_0) {
    return {
      sibling: _descriptor_12.fromValue(value_0),
      goes_left: _descriptor_3.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_12.toValue(value_0.sibling).concat(_descriptor_3.toValue(value_0.goes_left));
  }
}

const _descriptor_15 = new _MerkleTreePathEntry_0();

const _descriptor_16 = new __compactRuntime.CompactTypeVector(16, _descriptor_15);

class _MerkleTreePath_0 {
  alignment() {
    return _descriptor_0.alignment().concat(_descriptor_16.alignment());
  }
  fromValue(value_0) {
    return {
      leaf: _descriptor_0.fromValue(value_0),
      path: _descriptor_16.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_0.toValue(value_0.leaf).concat(_descriptor_16.toValue(value_0.path));
  }
}

const _descriptor_17 = new _MerkleTreePath_0();

class _tuple_0 {
  alignment() {
    return _descriptor_14.alignment().concat(_descriptor_11.alignment().concat(_descriptor_1.alignment()));
  }
  fromValue(value_0) {
    return [
      _descriptor_14.fromValue(value_0),
      _descriptor_11.fromValue(value_0),
      _descriptor_1.fromValue(value_0)
    ]
  }
  toValue(value_0) {
    return _descriptor_14.toValue(value_0[0]).concat(_descriptor_11.toValue(value_0[1]).concat(_descriptor_1.toValue(value_0[2])));
  }
}

const _descriptor_18 = new _tuple_0();

const _descriptor_19 = new __compactRuntime.CompactTypeBytes(6);

class _LeafPreimage_0 {
  alignment() {
    return _descriptor_19.alignment().concat(_descriptor_0.alignment());
  }
  fromValue(value_0) {
    return {
      domain_sep: _descriptor_19.fromValue(value_0),
      data: _descriptor_0.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_19.toValue(value_0.domain_sep).concat(_descriptor_0.toValue(value_0.data));
  }
}

const _descriptor_20 = new _LeafPreimage_0();

const _descriptor_21 = new __compactRuntime.CompactTypeVector(2, _descriptor_0);

const _descriptor_22 = new __compactRuntime.CompactTypeVector(5, _descriptor_0);

const _descriptor_23 = new __compactRuntime.CompactTypeVector(2, _descriptor_9);

const _descriptor_24 = new __compactRuntime.CompactTypeVector(3, _descriptor_0);

class _Either_0 {
  alignment() {
    return _descriptor_3.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment()));
  }
  fromValue(value_0) {
    return {
      is_left: _descriptor_3.fromValue(value_0),
      left: _descriptor_0.fromValue(value_0),
      right: _descriptor_0.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_3.toValue(value_0.is_left).concat(_descriptor_0.toValue(value_0.left).concat(_descriptor_0.toValue(value_0.right)));
  }
}

const _descriptor_25 = new _Either_0();

const _descriptor_26 = new __compactRuntime.CompactTypeUnsignedInteger(340282366920938463463374607431768211455n, 16);

class _ContractAddress_0 {
  alignment() {
    return _descriptor_0.alignment();
  }
  fromValue(value_0) {
    return {
      bytes: _descriptor_0.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_0.toValue(value_0.bytes);
  }
}

const _descriptor_27 = new _ContractAddress_0();

const _descriptor_28 = new __compactRuntime.CompactTypeUnsignedInteger(255n, 1);

export class Contract {
  witnesses;
  constructor(...args_0) {
    if (args_0.length !== 1) {
      throw new __compactRuntime.CompactError(`Contract constructor: expected 1 argument, received ${args_0.length}`);
    }
    const witnesses_0 = args_0[0];
    if (typeof(witnesses_0) !== 'object') {
      throw new __compactRuntime.CompactError('first (witnesses) argument to Contract constructor is not an object');
    }
    if (typeof(witnesses_0.getAttestedAppraisalWitness) !== 'function') {
      throw new __compactRuntime.CompactError('first (witnesses) argument to Contract constructor does not contain a function-valued field named getAttestedAppraisalWitness');
    }
    if (typeof(witnesses_0.getUserSecret) !== 'function') {
      throw new __compactRuntime.CompactError('first (witnesses) argument to Contract constructor does not contain a function-valued field named getUserSecret');
    }
    if (typeof(witnesses_0.getAppraisalCommitment) !== 'function') {
      throw new __compactRuntime.CompactError('first (witnesses) argument to Contract constructor does not contain a function-valued field named getAppraisalCommitment');
    }
    if (typeof(witnesses_0.findAppraisalPath) !== 'function') {
      throw new __compactRuntime.CompactError('first (witnesses) argument to Contract constructor does not contain a function-valued field named findAppraisalPath');
    }
    this.witnesses = witnesses_0;
    this.circuits = {
      async deriveUserPublicKey(context, ...args_1) {
        return { result: pureCircuits.deriveUserPublicKey(...args_1), context };
      },
      async deriveAdminPublicKey(context, ...args_1) {
        return { result: pureCircuits.deriveAdminPublicKey(...args_1), context };
      },
      requestAppraisalVerification: async (...args_1) => {
        if (args_1.length !== 3) {
          throw new __compactRuntime.CompactError(`requestAppraisalVerification: expected 3 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const loanThreshold_0 = args_1[1];
        const secretPin_0 = args_1[2];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.callContext.currentQueryContext != undefined)) {
          __compactRuntime.typeError('requestAppraisalVerification',
                                     'argument 1 (as invoked from Typescript)',
                                     'appraiser_verifier.compact line 143 char 1',
                                     'CircuitContext',
                                     contextOrig_0)
        }
        if (!(typeof(loanThreshold_0) === 'bigint' && loanThreshold_0 >= 0n && loanThreshold_0 <= 4294967295n)) {
          __compactRuntime.typeError('requestAppraisalVerification',
                                     'argument 1 (argument 2 as invoked from Typescript)',
                                     'appraiser_verifier.compact line 143 char 1',
                                     'Uint<0..4294967296>',
                                     loanThreshold_0)
        }
        if (!(typeof(secretPin_0) === 'bigint' && secretPin_0 >= 0n && secretPin_0 <= 65535n)) {
          __compactRuntime.typeError('requestAppraisalVerification',
                                     'argument 2 (argument 3 as invoked from Typescript)',
                                     'appraiser_verifier.compact line 143 char 1',
                                     'Uint<0..65536>',
                                     secretPin_0)
        }
        const context = __compactRuntime.copyCircuitContext(contextOrig_0);
        const partialProofData = {
          input: {
            value: _descriptor_5.toValue(loanThreshold_0).concat(_descriptor_1.toValue(secretPin_0)),
            alignment: _descriptor_5.alignment().concat(_descriptor_1.alignment())
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = await this._requestAppraisalVerification_0(context,
                                                                    partialProofData,
                                                                    loanThreshold_0,
                                                                    secretPin_0);
        partialProofData.output = { value: [], alignment: [] };
        __compactRuntime.finalizeCallProofData(context, partialProofData);
        return { result: result_0, context: context, gasCost: context.callContext.currentGasCost };
      },
      respondToLoan: async (...args_1) => {
        if (args_1.length !== 4) {
          throw new __compactRuntime.CompactError(`respondToLoan: expected 4 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const loanId_0 = args_1[1];
        const secretPin_0 = args_1[2];
        const accept_0 = args_1[3];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.callContext.currentQueryContext != undefined)) {
          __compactRuntime.typeError('respondToLoan',
                                     'argument 1 (as invoked from Typescript)',
                                     'appraiser_verifier.compact line 200 char 1',
                                     'CircuitContext',
                                     contextOrig_0)
        }
        if (!(typeof(loanId_0) === 'bigint' && loanId_0 >= 0n && loanId_0 <= 65535n)) {
          __compactRuntime.typeError('respondToLoan',
                                     'argument 1 (argument 2 as invoked from Typescript)',
                                     'appraiser_verifier.compact line 200 char 1',
                                     'Uint<0..65536>',
                                     loanId_0)
        }
        if (!(typeof(secretPin_0) === 'bigint' && secretPin_0 >= 0n && secretPin_0 <= 65535n)) {
          __compactRuntime.typeError('respondToLoan',
                                     'argument 2 (argument 3 as invoked from Typescript)',
                                     'appraiser_verifier.compact line 200 char 1',
                                     'Uint<0..65536>',
                                     secretPin_0)
        }
        if (!(typeof(accept_0) === 'boolean')) {
          __compactRuntime.typeError('respondToLoan',
                                     'argument 3 (argument 4 as invoked from Typescript)',
                                     'appraiser_verifier.compact line 200 char 1',
                                     'Boolean',
                                     accept_0)
        }
        const context = __compactRuntime.copyCircuitContext(contextOrig_0);
        const partialProofData = {
          input: {
            value: _descriptor_1.toValue(loanId_0).concat(_descriptor_1.toValue(secretPin_0).concat(_descriptor_3.toValue(accept_0))),
            alignment: _descriptor_1.alignment().concat(_descriptor_1.alignment().concat(_descriptor_3.alignment()))
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = await this._respondToLoan_0(context,
                                                     partialProofData,
                                                     loanId_0,
                                                     secretPin_0,
                                                     accept_0);
        partialProofData.output = { value: [], alignment: [] };
        __compactRuntime.finalizeCallProofData(context, partialProofData);
        return { result: result_0, context: context, gasCost: context.callContext.currentGasCost };
      },
      changePin: async (...args_1) => {
        if (args_1.length !== 3) {
          throw new __compactRuntime.CompactError(`changePin: expected 3 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const oldPin_0 = args_1[1];
        const newPin_0 = args_1[2];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.callContext.currentQueryContext != undefined)) {
          __compactRuntime.typeError('changePin',
                                     'argument 1 (as invoked from Typescript)',
                                     'appraiser_verifier.compact line 221 char 1',
                                     'CircuitContext',
                                     contextOrig_0)
        }
        if (!(typeof(oldPin_0) === 'bigint' && oldPin_0 >= 0n && oldPin_0 <= 65535n)) {
          __compactRuntime.typeError('changePin',
                                     'argument 1 (argument 2 as invoked from Typescript)',
                                     'appraiser_verifier.compact line 221 char 1',
                                     'Uint<0..65536>',
                                     oldPin_0)
        }
        if (!(typeof(newPin_0) === 'bigint' && newPin_0 >= 0n && newPin_0 <= 65535n)) {
          __compactRuntime.typeError('changePin',
                                     'argument 2 (argument 3 as invoked from Typescript)',
                                     'appraiser_verifier.compact line 221 char 1',
                                     'Uint<0..65536>',
                                     newPin_0)
        }
        const context = __compactRuntime.copyCircuitContext(contextOrig_0);
        const partialProofData = {
          input: {
            value: _descriptor_1.toValue(oldPin_0).concat(_descriptor_1.toValue(newPin_0)),
            alignment: _descriptor_1.alignment().concat(_descriptor_1.alignment())
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = await this._changePin_0(context,
                                                 partialProofData,
                                                 oldPin_0,
                                                 newPin_0);
        partialProofData.output = { value: [], alignment: [] };
        __compactRuntime.finalizeCallProofData(context, partialProofData);
        return { result: result_0, context: context, gasCost: context.callContext.currentGasCost };
      },
      registerProvider: async (...args_1) => {
        if (args_1.length !== 3) {
          throw new __compactRuntime.CompactError(`registerProvider: expected 3 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const providerId_0 = args_1[1];
        const providerPk_0 = args_1[2];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.callContext.currentQueryContext != undefined)) {
          __compactRuntime.typeError('registerProvider',
                                     'argument 1 (as invoked from Typescript)',
                                     'appraiser_verifier.compact line 235 char 1',
                                     'CircuitContext',
                                     contextOrig_0)
        }
        if (!(typeof(providerId_0) === 'bigint' && providerId_0 >= 0n && providerId_0 <= 65535n)) {
          __compactRuntime.typeError('registerProvider',
                                     'argument 1 (argument 2 as invoked from Typescript)',
                                     'appraiser_verifier.compact line 235 char 1',
                                     'Uint<0..65536>',
                                     providerId_0)
        }
        if (!(typeof(providerPk_0.x) === 'bigint' && typeof(providerPk_0.y) === 'bigint')) {
          __compactRuntime.typeError('registerProvider',
                                     'argument 2 (argument 3 as invoked from Typescript)',
                                     'appraiser_verifier.compact line 235 char 1',
                                     'JubjubPoint',
                                     providerPk_0)
        }
        const context = __compactRuntime.copyCircuitContext(contextOrig_0);
        const partialProofData = {
          input: {
            value: _descriptor_1.toValue(providerId_0).concat(_descriptor_2.toValue(providerPk_0)),
            alignment: _descriptor_1.alignment().concat(_descriptor_2.alignment())
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = await this._registerProvider_0(context,
                                                        partialProofData,
                                                        providerId_0,
                                                        providerPk_0);
        partialProofData.output = { value: [], alignment: [] };
        __compactRuntime.finalizeCallProofData(context, partialProofData);
        return { result: result_0, context: context, gasCost: context.callContext.currentGasCost };
      },
      rotateAdmin: async (...args_1) => {
        if (args_1.length !== 2) {
          throw new __compactRuntime.CompactError(`rotateAdmin: expected 2 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const newAdmin_0 = args_1[1];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.callContext.currentQueryContext != undefined)) {
          __compactRuntime.typeError('rotateAdmin',
                                     'argument 1 (as invoked from Typescript)',
                                     'appraiser_verifier.compact line 244 char 1',
                                     'CircuitContext',
                                     contextOrig_0)
        }
        if (!(newAdmin_0.buffer instanceof ArrayBuffer && newAdmin_0.BYTES_PER_ELEMENT === 1 && newAdmin_0.length === 32)) {
          __compactRuntime.typeError('rotateAdmin',
                                     'argument 1 (argument 2 as invoked from Typescript)',
                                     'appraiser_verifier.compact line 244 char 1',
                                     'Bytes<32>',
                                     newAdmin_0)
        }
        const context = __compactRuntime.copyCircuitContext(contextOrig_0);
        const partialProofData = {
          input: {
            value: _descriptor_0.toValue(newAdmin_0),
            alignment: _descriptor_0.alignment()
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = await this._rotateAdmin_0(context,
                                                   partialProofData,
                                                   newAdmin_0);
        partialProofData.output = { value: [], alignment: [] };
        __compactRuntime.finalizeCallProofData(context, partialProofData);
        return { result: result_0, context: context, gasCost: context.callContext.currentGasCost };
      },
      blacklistUser: async (...args_1) => {
        if (args_1.length !== 2) {
          throw new __compactRuntime.CompactError(`blacklistUser: expected 2 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const userPk_0 = args_1[1];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.callContext.currentQueryContext != undefined)) {
          __compactRuntime.typeError('blacklistUser',
                                     'argument 1 (as invoked from Typescript)',
                                     'appraiser_verifier.compact line 253 char 1',
                                     'CircuitContext',
                                     contextOrig_0)
        }
        if (!(userPk_0.buffer instanceof ArrayBuffer && userPk_0.BYTES_PER_ELEMENT === 1 && userPk_0.length === 32)) {
          __compactRuntime.typeError('blacklistUser',
                                     'argument 1 (argument 2 as invoked from Typescript)',
                                     'appraiser_verifier.compact line 253 char 1',
                                     'Bytes<32>',
                                     userPk_0)
        }
        const context = __compactRuntime.copyCircuitContext(contextOrig_0);
        const partialProofData = {
          input: {
            value: _descriptor_0.toValue(userPk_0),
            alignment: _descriptor_0.alignment()
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = await this._blacklistUser_0(context,
                                                     partialProofData,
                                                     userPk_0);
        partialProofData.output = { value: [], alignment: [] };
        __compactRuntime.finalizeCallProofData(context, partialProofData);
        return { result: result_0, context: context, gasCost: context.callContext.currentGasCost };
      },
      registerAppraisal: async (...args_1) => {
        if (args_1.length !== 2) {
          throw new __compactRuntime.CompactError(`registerAppraisal: expected 2 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const commitment_0 = args_1[1];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.callContext.currentQueryContext != undefined)) {
          __compactRuntime.typeError('registerAppraisal',
                                     'argument 1 (as invoked from Typescript)',
                                     'appraiser_verifier.compact line 261 char 1',
                                     'CircuitContext',
                                     contextOrig_0)
        }
        if (!(commitment_0.buffer instanceof ArrayBuffer && commitment_0.BYTES_PER_ELEMENT === 1 && commitment_0.length === 32)) {
          __compactRuntime.typeError('registerAppraisal',
                                     'argument 1 (argument 2 as invoked from Typescript)',
                                     'appraiser_verifier.compact line 261 char 1',
                                     'Bytes<32>',
                                     commitment_0)
        }
        const context = __compactRuntime.copyCircuitContext(contextOrig_0);
        const partialProofData = {
          input: {
            value: _descriptor_0.toValue(commitment_0),
            alignment: _descriptor_0.alignment()
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = await this._registerAppraisal_0(context,
                                                         partialProofData,
                                                         commitment_0);
        partialProofData.output = { value: [], alignment: [] };
        __compactRuntime.finalizeCallProofData(context, partialProofData);
        return { result: result_0, context: context, gasCost: context.callContext.currentGasCost };
      }
    };
    this.impureCircuits = {
      requestAppraisalVerification: this.circuits.requestAppraisalVerification,
      respondToLoan: this.circuits.respondToLoan,
      changePin: this.circuits.changePin,
      registerProvider: this.circuits.registerProvider,
      rotateAdmin: this.circuits.rotateAdmin,
      blacklistUser: this.circuits.blacklistUser,
      registerAppraisal: this.circuits.registerAppraisal
    };
    this.provableCircuits = {
      requestAppraisalVerification: this.circuits.requestAppraisalVerification,
      respondToLoan: this.circuits.respondToLoan,
      changePin: this.circuits.changePin,
      registerProvider: this.circuits.registerProvider,
      rotateAdmin: this.circuits.rotateAdmin,
      blacklistUser: this.circuits.blacklistUser,
      registerAppraisal: this.circuits.registerAppraisal
    };
  }
  async initialState(...args_0) {
    if (args_0.length !== 1) {
      throw new __compactRuntime.CompactError(`Contract state constructor: expected 1 argument (as invoked from Typescript), received ${args_0.length}`);
    }
    const constructorContext_0 = args_0[0];
    if (typeof(constructorContext_0) !== 'object') {
      throw new __compactRuntime.CompactError(`Contract state constructor: expected 'constructorContext' in argument 1 (as invoked from Typescript) to be an object`);
    }
    if (!('initialPrivateState' in constructorContext_0)) {
      throw new __compactRuntime.CompactError(`Contract state constructor: expected 'initialPrivateState' in argument 1 (as invoked from Typescript)`);
    }
    if (!('initialZswapLocalState' in constructorContext_0)) {
      throw new __compactRuntime.CompactError(`Contract state constructor: expected 'initialZswapLocalState' in argument 1 (as invoked from Typescript)`);
    }
    if (typeof(constructorContext_0.initialZswapLocalState) !== 'object') {
      throw new __compactRuntime.CompactError(`Contract state constructor: expected 'initialZswapLocalState' in argument 1 (as invoked from Typescript) to be an object`);
    }
    const state_0 = new __compactRuntime.ContractState();
    let stateValue_0 = __compactRuntime.StateValue.newArray();
    stateValue_0 = stateValue_0.arrayPush(__compactRuntime.StateValue.newNull());
    stateValue_0 = stateValue_0.arrayPush(__compactRuntime.StateValue.newNull());
    stateValue_0 = stateValue_0.arrayPush(__compactRuntime.StateValue.newNull());
    stateValue_0 = stateValue_0.arrayPush(__compactRuntime.StateValue.newNull());
    stateValue_0 = stateValue_0.arrayPush(__compactRuntime.StateValue.newNull());
    stateValue_0 = stateValue_0.arrayPush(__compactRuntime.StateValue.newNull());
    stateValue_0 = stateValue_0.arrayPush(__compactRuntime.StateValue.newNull());
    stateValue_0 = stateValue_0.arrayPush(__compactRuntime.StateValue.newNull());
    stateValue_0 = stateValue_0.arrayPush(__compactRuntime.StateValue.newNull());
    state_0.data = new __compactRuntime.ChargedState(stateValue_0);
    state_0.setOperation('requestAppraisalVerification', new __compactRuntime.ContractOperation());
    state_0.setOperation('respondToLoan', new __compactRuntime.ContractOperation());
    state_0.setOperation('changePin', new __compactRuntime.ContractOperation());
    state_0.setOperation('registerProvider', new __compactRuntime.ContractOperation());
    state_0.setOperation('rotateAdmin', new __compactRuntime.ContractOperation());
    state_0.setOperation('blacklistUser', new __compactRuntime.ContractOperation());
    state_0.setOperation('registerAppraisal', new __compactRuntime.ContractOperation());
    const context = __compactRuntime.createCircuitContext('constructor', __compactRuntime.dummyContractAddress(), constructorContext_0.initialZswapLocalState.coinPublicKey, state_0.data, constructorContext_0.initialPrivateState);
    const partialProofData = {
      input: { value: [], alignment: [] },
      output: undefined,
      publicTranscript: [],
      privateTranscriptOutputs: []
    };
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_28.toValue(0n),
                                                                                              alignment: _descriptor_28.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newArray()
                                                          .arrayPush(__compactRuntime.StateValue.newBoundedMerkleTree(
                                                                       new __compactRuntime.StateBoundedMerkleTree(16)
                                                                     )).arrayPush(__compactRuntime.StateValue.newCell({ value: _descriptor_13.toValue(0n),
                                                                                                                        alignment: _descriptor_13.alignment() }))
                                                          .encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_28.toValue(1n),
                                                                                              alignment: _descriptor_28.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newMap(
                                                          new __compactRuntime.StateMap()
                                                        ).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_28.toValue(2n),
                                                                                              alignment: _descriptor_28.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newMap(
                                                          new __compactRuntime.StateMap()
                                                        ).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_28.toValue(3n),
                                                                                              alignment: _descriptor_28.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(new Uint8Array(32)),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_28.toValue(4n),
                                                                                              alignment: _descriptor_28.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newMap(
                                                          new __compactRuntime.StateMap()
                                                        ).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_28.toValue(5n),
                                                                                              alignment: _descriptor_28.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newMap(
                                                          new __compactRuntime.StateMap()
                                                        ).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_28.toValue(6n),
                                                                                              alignment: _descriptor_28.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_13.toValue(0n),
                                                                                              alignment: _descriptor_13.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_28.toValue(7n),
                                                                                              alignment: _descriptor_28.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_13.toValue(0n),
                                                                                              alignment: _descriptor_13.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_28.toValue(8n),
                                                                                              alignment: _descriptor_28.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newMap(
                                                          new __compactRuntime.StateMap()
                                                        ).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    const tmp_0 = 1n;
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_28.toValue(6n),
                                                                  alignment: _descriptor_28.alignment() } }] } },
                                       { addi: { immediate: parseInt(__compactRuntime.valueToBigInt(
                                                              { value: _descriptor_1.toValue(tmp_0),
                                                                alignment: _descriptor_1.alignment() }
                                                                .value
                                                            )) } },
                                       { ins: { cached: true, n: 1 } }]);
    const tmp_1 = 1n;
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_28.toValue(7n),
                                                                  alignment: _descriptor_28.alignment() } }] } },
                                       { addi: { immediate: parseInt(__compactRuntime.valueToBigInt(
                                                              { value: _descriptor_1.toValue(tmp_1),
                                                                alignment: _descriptor_1.alignment() }
                                                                .value
                                                            )) } },
                                       { ins: { cached: true, n: 1 } }]);
    state_0.data = new __compactRuntime.ChargedState(context.callContext.currentQueryContext.state.state);
    return {
      currentContractState: state_0,
      currentPrivateState: context.callContext.currentPrivateState,
      currentZswapLocalState: context.callContext.currentZswapLocalState
    }
  }
  _merkleTreePathRoot_0(path_0) {
    return { field:
               this._folder_0((...args_0) =>
                                this._merkleTreePathEntryRoot_0(...args_0),
                              this._degradeToTransient_0(this._persistentHash_3({ domain_sep:
                                                                                    new Uint8Array([109, 100, 110, 58, 108, 104]),
                                                                                  data:
                                                                                    path_0.leaf })),
                              path_0.path) };
  }
  _merkleTreePathEntryRoot_0(recursiveDigest_0, entry_0) {
    const left_0 = entry_0.goes_left ? recursiveDigest_0 : entry_0.sibling.field;
    const right_0 = entry_0.goes_left ?
                    entry_0.sibling.field :
                    recursiveDigest_0;
    return this._transientHash_1([left_0, right_0]);
  }
  _transientHash_0(value_0) {
    const result_0 = __compactRuntime.transientHash(_descriptor_0, value_0);
    return result_0;
  }
  _transientHash_1(value_0) {
    const result_0 = __compactRuntime.transientHash(_descriptor_23, value_0);
    return result_0;
  }
  _persistentHash_0(value_0) {
    const result_0 = __compactRuntime.persistentHash(_descriptor_24, value_0);
    return result_0;
  }
  _persistentHash_1(value_0) {
    const result_0 = __compactRuntime.persistentHash(_descriptor_21, value_0);
    return result_0;
  }
  _persistentHash_2(value_0) {
    const result_0 = __compactRuntime.persistentHash(_descriptor_22, value_0);
    return result_0;
  }
  _persistentHash_3(value_0) {
    const result_0 = __compactRuntime.persistentHash(_descriptor_20, value_0);
    return result_0;
  }
  _degradeToTransient_0(x_0) {
    const result_0 = __compactRuntime.degradeToTransient(x_0);
    return result_0;
  }
  _getAttestedAppraisalWitness_0(context, partialProofData) {
    const witnessContext_0 = __compactRuntime.createWitnessContext(ledger(context.callContext.currentQueryContext.state), context.callContext.currentPrivateState, context.callContext.currentQueryContext.address);
    const [nextPrivateState_0, result_0] = this.witnesses.getAttestedAppraisalWitness(witnessContext_0);
    context.callContext.currentPrivateState = nextPrivateState_0;
    if (!(Array.isArray(result_0) && result_0.length === 3  && typeof(result_0[0]) === 'object' && typeof(result_0[0].value) === 'bigint' && result_0[0].value >= 0n && result_0[0].value <= 18446744073709551615n && result_0[0].propertyHash.buffer instanceof ArrayBuffer && result_0[0].propertyHash.BYTES_PER_ELEMENT === 1 && result_0[0].propertyHash.length === 32 && typeof(result_0[0].appraiserId) === 'bigint' && result_0[0].appraiserId >= 0n && result_0[0].appraiserId <= 65535n && typeof(result_0[0].timestamp) === 'bigint' && result_0[0].timestamp >= 0n && result_0[0].timestamp <= 18446744073709551615n && result_0[0].nonce.buffer instanceof ArrayBuffer && result_0[0].nonce.BYTES_PER_ELEMENT === 1 && result_0[0].nonce.length === 32 && result_0[1].buffer instanceof ArrayBuffer && result_0[1].BYTES_PER_ELEMENT === 1 && result_0[1].length === 64 && typeof(result_0[2]) === 'bigint' && result_0[2] >= 0n && result_0[2] <= 65535n)) {
      __compactRuntime.typeError('getAttestedAppraisalWitness',
                                 'return value',
                                 'appraiser_verifier.compact line 54 char 1',
                                 '[struct AppraisalReport<value: Uint<0..18446744073709551616>, propertyHash: Bytes<32>, appraiserId: Uint<0..65536>, timestamp: Uint<0..18446744073709551616>, nonce: Bytes<32>>, Bytes<64>, Uint<0..65536>]',
                                 result_0)
    }
    partialProofData.privateTranscriptOutputs.push({
      value: _descriptor_18.toValue(result_0),
      alignment: _descriptor_18.alignment()
    });
    return result_0;
  }
  _getUserSecret_0(context, partialProofData) {
    const witnessContext_0 = __compactRuntime.createWitnessContext(ledger(context.callContext.currentQueryContext.state), context.callContext.currentPrivateState, context.callContext.currentQueryContext.address);
    const [nextPrivateState_0, result_0] = this.witnesses.getUserSecret(witnessContext_0);
    context.callContext.currentPrivateState = nextPrivateState_0;
    if (!(result_0.buffer instanceof ArrayBuffer && result_0.BYTES_PER_ELEMENT === 1 && result_0.length === 32)) {
      __compactRuntime.typeError('getUserSecret',
                                 'return value',
                                 'appraiser_verifier.compact line 55 char 1',
                                 'Bytes<32>',
                                 result_0)
    }
    partialProofData.privateTranscriptOutputs.push({
      value: _descriptor_0.toValue(result_0),
      alignment: _descriptor_0.alignment()
    });
    return result_0;
  }
  _getAppraisalCommitment_0(context, partialProofData) {
    const witnessContext_0 = __compactRuntime.createWitnessContext(ledger(context.callContext.currentQueryContext.state), context.callContext.currentPrivateState, context.callContext.currentQueryContext.address);
    const [nextPrivateState_0, result_0] = this.witnesses.getAppraisalCommitment(witnessContext_0);
    context.callContext.currentPrivateState = nextPrivateState_0;
    if (!(result_0.buffer instanceof ArrayBuffer && result_0.BYTES_PER_ELEMENT === 1 && result_0.length === 32)) {
      __compactRuntime.typeError('getAppraisalCommitment',
                                 'return value',
                                 'appraiser_verifier.compact line 56 char 1',
                                 'Bytes<32>',
                                 result_0)
    }
    partialProofData.privateTranscriptOutputs.push({
      value: _descriptor_0.toValue(result_0),
      alignment: _descriptor_0.alignment()
    });
    return result_0;
  }
  _findAppraisalPath_0(context, partialProofData) {
    const witnessContext_0 = __compactRuntime.createWitnessContext(ledger(context.callContext.currentQueryContext.state), context.callContext.currentPrivateState, context.callContext.currentQueryContext.address);
    const [nextPrivateState_0, result_0] = this.witnesses.findAppraisalPath(witnessContext_0);
    context.callContext.currentPrivateState = nextPrivateState_0;
    if (!(typeof(result_0) === 'object' && result_0.leaf.buffer instanceof ArrayBuffer && result_0.leaf.BYTES_PER_ELEMENT === 1 && result_0.leaf.length === 32 && Array.isArray(result_0.path) && result_0.path.length === 16 && result_0.path.every((t) => typeof(t) === 'object' && typeof(t.sibling) === 'object' && typeof(t.sibling.field) === 'bigint' && t.sibling.field >= 0 && t.sibling.field <= __compactRuntime.MAX_FIELD && typeof(t.goes_left) === 'boolean'))) {
      __compactRuntime.typeError('findAppraisalPath',
                                 'return value',
                                 'appraiser_verifier.compact line 57 char 1',
                                 'struct MerkleTreePath<leaf: Bytes<32>, path: Vector<16, struct MerkleTreePathEntry<sibling: struct MerkleTreeDigest<field: Field>, goes_left: Boolean>>>',
                                 result_0)
    }
    partialProofData.privateTranscriptOutputs.push({
      value: _descriptor_17.toValue(result_0),
      alignment: _descriptor_17.alignment()
    });
    return result_0;
  }
  _deriveUserPublicKey_0(sk_0, pin_0) {
    return this._persistentHash_0([new Uint8Array([122, 107, 97, 112, 112, 114, 97, 105, 115, 97, 108, 58, 117, 115, 101, 114, 58, 112, 107, 58, 118, 49, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
                                   sk_0,
                                   __compactRuntime.convertBigintToBytes(32,
                                                                         pin_0,
                                                                         'appraiser_verifier.compact line 69 char 7')]);
  }
  _deriveAdminPublicKey_0(sk_0) {
    return this._persistentHash_1([new Uint8Array([122, 107, 97, 112, 112, 114, 97, 105, 115, 97, 108, 58, 97, 100, 109, 105, 110, 58, 112, 107, 58, 118, 49, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
                                   sk_0]);
  }
  _commitment_0(sk_0, report_0) {
    return this._persistentHash_2([new Uint8Array([122, 107, 97, 112, 112, 114, 97, 105, 115, 97, 108, 58, 97, 112, 112, 114, 58, 99, 111, 109, 109, 105, 116, 58, 118, 49, 0, 0, 0, 0, 0, 0]),
                                   sk_0,
                                   report_0.propertyHash,
                                   __compactRuntime.convertBigintToBytes(32,
                                                                         report_0.appraiserId,
                                                                         'appraiser_verifier.compact line 89 char 7'),
                                   __compactRuntime.convertBigintToBytes(32,
                                                                         report_0.timestamp,
                                                                         'appraiser_verifier.compact line 90 char 7')]);
  }
  _nullifier_0(sk_0, report_0) {
    return this._persistentHash_2([new Uint8Array([122, 107, 97, 112, 112, 114, 97, 105, 115, 97, 108, 58, 97, 112, 112, 114, 58, 110, 117, 108, 108, 105, 102, 105, 101, 114, 58, 118, 49, 0, 0, 0]),
                                   sk_0,
                                   report_0.propertyHash,
                                   __compactRuntime.convertBigintToBytes(32,
                                                                         report_0.appraiserId,
                                                                         'appraiser_verifier.compact line 101 char 7'),
                                   __compactRuntime.convertBigintToBytes(32,
                                                                         report_0.timestamp,
                                                                         'appraiser_verifier.compact line 102 char 7')]);
  }
  _tierForValue_0(value_0) {
    if (value_0 >= 1000000n) {
      return 0;
    } else {
      if (value_0 >= 500000n) {
        return 1;
      } else {
        if (value_0 >= 250000n) {
          return 2;
        } else {
          if (value_0 >= 100000n) { return 3; } else { return 4; }
        }
      }
    }
  }
  _maxLoanForTier_0(tier_0) {
    if (tier_0 === 0) {
      return 500000n;
    } else {
      if (tier_0 === 1) {
        return 250000n;
      } else {
        if (tier_0 === 2) {
          return 100000n;
        } else {
          if (tier_0 === 3) { return 50000n; } else { return 0n; }
        }
      }
    }
  }
  _schnorrVerify_0(msg_0, signature_0, pk_0) { return true; }
  async _requestAppraisalVerification_0(context,
                                        partialProofData,
                                        loanThreshold_0,
                                        secretPin_0)
  {
    const sk_0 = this._getUserSecret_0(context, partialProofData);
    const userPk_0 = this._deriveUserPublicKey_0(sk_0, secretPin_0);
    __compactRuntime.assert(!_descriptor_3.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                       partialProofData,
                                                                                       [
                                                                                        { dup: { n: 0 } },
                                                                                        { idx: { cached: false,
                                                                                                 pushPath: false,
                                                                                                 path: [
                                                                                                        { tag: 'value',
                                                                                                          value: { value: _descriptor_28.toValue(5n),
                                                                                                                   alignment: _descriptor_28.alignment() } }] } },
                                                                                        { push: { storage: false,
                                                                                                  value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(userPk_0),
                                                                                                                                               alignment: _descriptor_0.alignment() }).encode() } },
                                                                                        'member',
                                                                                        { popeq: { cached: true,
                                                                                                   result: undefined } }]).value),
                            'User is blacklisted');
    const __compact_pattern_tmp1_0 = this._getAttestedAppraisalWitness_0(context,
                                                                         partialProofData);
    const report_0 = __compact_pattern_tmp1_0[0];
    const signature_0 = __compact_pattern_tmp1_0[1];
    const providerId_0 = __compact_pattern_tmp1_0[2];
    __compactRuntime.assert(_descriptor_3.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                      partialProofData,
                                                                                      [
                                                                                       { dup: { n: 0 } },
                                                                                       { idx: { cached: false,
                                                                                                pushPath: false,
                                                                                                path: [
                                                                                                       { tag: 'value',
                                                                                                         value: { value: _descriptor_28.toValue(2n),
                                                                                                                  alignment: _descriptor_28.alignment() } }] } },
                                                                                       { push: { storage: false,
                                                                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_1.toValue(providerId_0),
                                                                                                                                              alignment: _descriptor_1.alignment() }).encode() } },
                                                                                       'member',
                                                                                       { popeq: { cached: true,
                                                                                                  result: undefined } }]).value),
                            'Provider not registered');
    const providerPk_0 = _descriptor_2.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                   partialProofData,
                                                                                   [
                                                                                    { dup: { n: 0 } },
                                                                                    { idx: { cached: false,
                                                                                             pushPath: false,
                                                                                             path: [
                                                                                                    { tag: 'value',
                                                                                                      value: { value: _descriptor_28.toValue(2n),
                                                                                                               alignment: _descriptor_28.alignment() } }] } },
                                                                                    { idx: { cached: false,
                                                                                             pushPath: false,
                                                                                             path: [
                                                                                                    { tag: 'value',
                                                                                                      value: { value: _descriptor_1.toValue(providerId_0),
                                                                                                               alignment: _descriptor_1.alignment() } }] } },
                                                                                    { popeq: { cached: false,
                                                                                               result: undefined } }]).value);
    const reportCommitment_0 = this._commitment_0(sk_0, report_0);
    const witnessCommitment_0 = this._getAppraisalCommitment_0(context,
                                                               partialProofData);
    __compactRuntime.assert(this._equal_0(reportCommitment_0,
                                          witnessCommitment_0),
                            'Commitment mismatch');
    const path_0 = this._findAppraisalPath_0(context, partialProofData);
    let tmp_0;
    __compactRuntime.assert((tmp_0 = this._merkleTreePathRoot_0(path_0),
                             _descriptor_3.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                       partialProofData,
                                                                                       [
                                                                                        { dup: { n: 0 } },
                                                                                        { idx: { cached: false,
                                                                                                 pushPath: false,
                                                                                                 path: [
                                                                                                        { tag: 'value',
                                                                                                          value: { value: _descriptor_28.toValue(0n),
                                                                                                                   alignment: _descriptor_28.alignment() } }] } },
                                                                                        { idx: { cached: false,
                                                                                                 pushPath: false,
                                                                                                 path: [
                                                                                                        { tag: 'value',
                                                                                                          value: { value: _descriptor_28.toValue(0n),
                                                                                                                   alignment: _descriptor_28.alignment() } }] } },
                                                                                        'root',
                                                                                        { push: { storage: false,
                                                                                                  value: __compactRuntime.StateValue.newCell({ value: _descriptor_12.toValue(tmp_0),
                                                                                                                                               alignment: _descriptor_12.alignment() }).encode() } },
                                                                                        'eq',
                                                                                        { popeq: { cached: true,
                                                                                                   result: undefined } }]).value)),
                            'Appraisal not in registry');
    const userPkHash_0 = this._transientHash_0(userPk_0);
    const msg_0 = [report_0.value,
                   __compactRuntime.convertBytesToUint(52435875175126190479447740508185965837690552500527637822603658699938581184512n,
                                                       32,
                                                       report_0.propertyHash,
                                                       'Field',
                                                       'appraiser_verifier.compact line 165 char 5'),
                   report_0.appraiserId,
                   report_0.timestamp,
                   userPkHash_0];
    __compactRuntime.assert(this._schnorrVerify_0(msg_0,
                                                  signature_0,
                                                  providerPk_0),
                            'Invalid attestation signature');
    let t_0;
    __compactRuntime.assert((t_0 = report_0.value, t_0 >= loanThreshold_0),
                            'Appraisal value below loan threshold');
    const tier_0 = this._tierForValue_0(report_0.value);
    const maxLoan_0 = this._maxLoanForTier_0(tier_0);
    const authorizedAmount_0 = loanThreshold_0 <= maxLoan_0 ?
                               loanThreshold_0 :
                               maxLoan_0;
    const status_0 = authorizedAmount_0 === loanThreshold_0 ? 0 : 2;
    const loanId_0 = ((t1) => {
                       if (t1 > 65535n) {
                         throw new __compactRuntime.CompactError('appraiser_verifier.compact line 183 char 18: cast from Field or Uint value to smaller Uint value failed: ' + t1 + ' is greater than 65535');
                       }
                       return t1;
                     })(_descriptor_13.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                   partialProofData,
                                                                                   [
                                                                                    { dup: { n: 0 } },
                                                                                    { idx: { cached: false,
                                                                                             pushPath: false,
                                                                                             path: [
                                                                                                    { tag: 'value',
                                                                                                      value: { value: _descriptor_28.toValue(7n),
                                                                                                               alignment: _descriptor_28.alignment() } }] } },
                                                                                    { popeq: { cached: true,
                                                                                               result: undefined } }]).value));
    const outcome_0 = { authorizedAmount: authorizedAmount_0,
                        status: status_0,
                        appraisalTier: tier_0 };
    const loanKey_0 = { user: userPk_0, loanId: loanId_0 };
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_28.toValue(4n),
                                                                  alignment: _descriptor_28.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_4.toValue(loanKey_0),
                                                                                              alignment: _descriptor_4.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_8.toValue(outcome_0),
                                                                                              alignment: _descriptor_8.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 1 } }]);
    const nul_0 = this._nullifier_0(sk_0, report_0);
    __compactRuntime.assert(!_descriptor_3.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                       partialProofData,
                                                                                       [
                                                                                        { dup: { n: 0 } },
                                                                                        { idx: { cached: false,
                                                                                                 pushPath: false,
                                                                                                 path: [
                                                                                                        { tag: 'value',
                                                                                                          value: { value: _descriptor_28.toValue(1n),
                                                                                                                   alignment: _descriptor_28.alignment() } }] } },
                                                                                        { push: { storage: false,
                                                                                                  value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(nul_0),
                                                                                                                                               alignment: _descriptor_0.alignment() }).encode() } },
                                                                                        'member',
                                                                                        { popeq: { cached: true,
                                                                                                   result: undefined } }]).value),
                            'Appraisal already used');
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_28.toValue(1n),
                                                                  alignment: _descriptor_28.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(nul_0),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newNull().encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 1 } }]);
    const tmp_1 = 1n;
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_28.toValue(7n),
                                                                  alignment: _descriptor_28.alignment() } }] } },
                                       { addi: { immediate: parseInt(__compactRuntime.valueToBigInt(
                                                              { value: _descriptor_1.toValue(tmp_1),
                                                                alignment: _descriptor_1.alignment() }
                                                                .value
                                                            )) } },
                                       { ins: { cached: true, n: 1 } }]);
    return [];
  }
  async _respondToLoan_0(context,
                         partialProofData,
                         loanId_0,
                         secretPin_0,
                         accept_0)
  {
    const sk_0 = this._getUserSecret_0(context, partialProofData);
    const userPk_0 = this._deriveUserPublicKey_0(sk_0, secretPin_0);
    __compactRuntime.assert(!_descriptor_3.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                       partialProofData,
                                                                                       [
                                                                                        { dup: { n: 0 } },
                                                                                        { idx: { cached: false,
                                                                                                 pushPath: false,
                                                                                                 path: [
                                                                                                        { tag: 'value',
                                                                                                          value: { value: _descriptor_28.toValue(5n),
                                                                                                                   alignment: _descriptor_28.alignment() } }] } },
                                                                                        { push: { storage: false,
                                                                                                  value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(userPk_0),
                                                                                                                                               alignment: _descriptor_0.alignment() }).encode() } },
                                                                                        'member',
                                                                                        { popeq: { cached: true,
                                                                                                   result: undefined } }]).value),
                            'User is blacklisted');
    const loanKey_0 = { user: userPk_0, loanId: loanId_0 };
    __compactRuntime.assert(_descriptor_3.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                      partialProofData,
                                                                                      [
                                                                                       { dup: { n: 0 } },
                                                                                       { idx: { cached: false,
                                                                                                pushPath: false,
                                                                                                path: [
                                                                                                       { tag: 'value',
                                                                                                         value: { value: _descriptor_28.toValue(4n),
                                                                                                                  alignment: _descriptor_28.alignment() } }] } },
                                                                                       { push: { storage: false,
                                                                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_4.toValue(loanKey_0),
                                                                                                                                              alignment: _descriptor_4.alignment() }).encode() } },
                                                                                       'member',
                                                                                       { popeq: { cached: true,
                                                                                                  result: undefined } }]).value),
                            'Loan not found');
    const outcome_0 = _descriptor_8.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                partialProofData,
                                                                                [
                                                                                 { dup: { n: 0 } },
                                                                                 { idx: { cached: false,
                                                                                          pushPath: false,
                                                                                          path: [
                                                                                                 { tag: 'value',
                                                                                                   value: { value: _descriptor_28.toValue(4n),
                                                                                                            alignment: _descriptor_28.alignment() } }] } },
                                                                                 { idx: { cached: false,
                                                                                          pushPath: false,
                                                                                          path: [
                                                                                                 { tag: 'value',
                                                                                                   value: { value: _descriptor_4.toValue(loanKey_0),
                                                                                                            alignment: _descriptor_4.alignment() } }] } },
                                                                                 { popeq: { cached: false,
                                                                                            result: undefined } }]).value);
    __compactRuntime.assert(outcome_0.status === 2, 'Loan not in Proposed state');
    const newStatus_0 = accept_0 ? 0 : 3;
    const updatedOutcome_0 = { authorizedAmount: outcome_0.authorizedAmount,
                               status: newStatus_0,
                               appraisalTier: outcome_0.appraisalTier };
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_28.toValue(4n),
                                                                  alignment: _descriptor_28.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_4.toValue(loanKey_0),
                                                                                              alignment: _descriptor_4.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_8.toValue(updatedOutcome_0),
                                                                                              alignment: _descriptor_8.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 1 } }]);
    return [];
  }
  async _changePin_0(context, partialProofData, oldPin_0, newPin_0) {
    const sk_0 = this._getUserSecret_0(context, partialProofData);
    const oldPk_0 = this._deriveUserPublicKey_0(sk_0, oldPin_0);
    const newPk_0 = this._deriveUserPublicKey_0(sk_0, newPin_0);
    __compactRuntime.assert(!this._equal_1(oldPk_0, newPk_0),
                            'New PIN must be different from old PIN');
    const migrationCount_0 = _descriptor_3.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                       partialProofData,
                                                                                       [
                                                                                        { dup: { n: 0 } },
                                                                                        { idx: { cached: false,
                                                                                                 pushPath: false,
                                                                                                 path: [
                                                                                                        { tag: 'value',
                                                                                                          value: { value: _descriptor_28.toValue(8n),
                                                                                                                   alignment: _descriptor_28.alignment() } }] } },
                                                                                        { push: { storage: false,
                                                                                                  value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(oldPk_0),
                                                                                                                                               alignment: _descriptor_0.alignment() }).encode() } },
                                                                                        'member',
                                                                                        { popeq: { cached: true,
                                                                                                   result: undefined } }]).value)
                             ?
                             _descriptor_1.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                       partialProofData,
                                                                                       [
                                                                                        { dup: { n: 0 } },
                                                                                        { idx: { cached: false,
                                                                                                 pushPath: false,
                                                                                                 path: [
                                                                                                        { tag: 'value',
                                                                                                          value: { value: _descriptor_28.toValue(8n),
                                                                                                                   alignment: _descriptor_28.alignment() } }] } },
                                                                                        { idx: { cached: false,
                                                                                                 pushPath: false,
                                                                                                 path: [
                                                                                                        { tag: 'value',
                                                                                                          value: { value: _descriptor_0.toValue(oldPk_0),
                                                                                                                   alignment: _descriptor_0.alignment() } }] } },
                                                                                        { popeq: { cached: false,
                                                                                                   result: undefined } }]).value)
                             :
                             0n;
    __compactRuntime.assert(migrationCount_0 < 5n,
                            'Migration batch limit reached');
    const tmp_0 = ((t1) => {
                    if (t1 > 65535n) {
                      throw new __compactRuntime.CompactError('appraiser_verifier.compact line 232 char 49: cast from Field or Uint value to smaller Uint value failed: ' + t1 + ' is greater than 65535');
                    }
                    return t1;
                  })(migrationCount_0 + 5n);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_28.toValue(8n),
                                                                  alignment: _descriptor_28.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(oldPk_0),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_1.toValue(tmp_0),
                                                                                              alignment: _descriptor_1.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 1 } }]);
    return [];
  }
  async _registerProvider_0(context,
                            partialProofData,
                            providerId_0,
                            providerPk_0)
  {
    const sk_0 = this._getUserSecret_0(context, partialProofData);
    const adminPk_0 = this._deriveAdminPublicKey_0(sk_0);
    __compactRuntime.assert(this._equal_2(_descriptor_0.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                                    partialProofData,
                                                                                                    [
                                                                                                     { dup: { n: 0 } },
                                                                                                     { idx: { cached: false,
                                                                                                              pushPath: false,
                                                                                                              path: [
                                                                                                                     { tag: 'value',
                                                                                                                       value: { value: _descriptor_28.toValue(3n),
                                                                                                                                alignment: _descriptor_28.alignment() } }] } },
                                                                                                     { popeq: { cached: false,
                                                                                                                result: undefined } }]).value),
                                          adminPk_0),
                            'Not authorized as admin');
    __compactRuntime.assert(!_descriptor_3.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                       partialProofData,
                                                                                       [
                                                                                        { dup: { n: 0 } },
                                                                                        { idx: { cached: false,
                                                                                                 pushPath: false,
                                                                                                 path: [
                                                                                                        { tag: 'value',
                                                                                                          value: { value: _descriptor_28.toValue(2n),
                                                                                                                   alignment: _descriptor_28.alignment() } }] } },
                                                                                        { push: { storage: false,
                                                                                                  value: __compactRuntime.StateValue.newCell({ value: _descriptor_1.toValue(providerId_0),
                                                                                                                                               alignment: _descriptor_1.alignment() }).encode() } },
                                                                                        'member',
                                                                                        { popeq: { cached: true,
                                                                                                   result: undefined } }]).value),
                            'Provider already registered');
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_28.toValue(2n),
                                                                  alignment: _descriptor_28.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_1.toValue(providerId_0),
                                                                                              alignment: _descriptor_1.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_2.toValue(providerPk_0),
                                                                                              alignment: _descriptor_2.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 1 } }]);
    return [];
  }
  async _rotateAdmin_0(context, partialProofData, newAdmin_0) {
    const sk_0 = this._getUserSecret_0(context, partialProofData);
    const currentAdminPk_0 = this._deriveAdminPublicKey_0(sk_0);
    __compactRuntime.assert(this._equal_3(_descriptor_0.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                                    partialProofData,
                                                                                                    [
                                                                                                     { dup: { n: 0 } },
                                                                                                     { idx: { cached: false,
                                                                                                              pushPath: false,
                                                                                                              path: [
                                                                                                                     { tag: 'value',
                                                                                                                       value: { value: _descriptor_28.toValue(3n),
                                                                                                                                alignment: _descriptor_28.alignment() } }] } },
                                                                                                     { popeq: { cached: false,
                                                                                                                result: undefined } }]).value),
                                          currentAdminPk_0),
                            'Not authorized as admin');
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_28.toValue(3n),
                                                                                              alignment: _descriptor_28.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(newAdmin_0),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    const tmp_0 = 1n;
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_28.toValue(6n),
                                                                  alignment: _descriptor_28.alignment() } }] } },
                                       { addi: { immediate: parseInt(__compactRuntime.valueToBigInt(
                                                              { value: _descriptor_1.toValue(tmp_0),
                                                                alignment: _descriptor_1.alignment() }
                                                                .value
                                                            )) } },
                                       { ins: { cached: true, n: 1 } }]);
    return [];
  }
  async _blacklistUser_0(context, partialProofData, userPk_0) {
    const sk_0 = this._getUserSecret_0(context, partialProofData);
    const adminPk_0 = this._deriveAdminPublicKey_0(sk_0);
    __compactRuntime.assert(this._equal_4(_descriptor_0.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                                    partialProofData,
                                                                                                    [
                                                                                                     { dup: { n: 0 } },
                                                                                                     { idx: { cached: false,
                                                                                                              pushPath: false,
                                                                                                              path: [
                                                                                                                     { tag: 'value',
                                                                                                                       value: { value: _descriptor_28.toValue(3n),
                                                                                                                                alignment: _descriptor_28.alignment() } }] } },
                                                                                                     { popeq: { cached: false,
                                                                                                                result: undefined } }]).value),
                                          adminPk_0),
                            'Not authorized as admin');
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_28.toValue(5n),
                                                                  alignment: _descriptor_28.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(userPk_0),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newNull().encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 1 } }]);
    return [];
  }
  async _registerAppraisal_0(context, partialProofData, commitment_0) {
    const sk_0 = this._getUserSecret_0(context, partialProofData);
    const adminPk_0 = this._deriveAdminPublicKey_0(sk_0);
    __compactRuntime.assert(this._equal_5(_descriptor_0.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                                    partialProofData,
                                                                                                    [
                                                                                                     { dup: { n: 0 } },
                                                                                                     { idx: { cached: false,
                                                                                                              pushPath: false,
                                                                                                              path: [
                                                                                                                     { tag: 'value',
                                                                                                                       value: { value: _descriptor_28.toValue(3n),
                                                                                                                                alignment: _descriptor_28.alignment() } }] } },
                                                                                                     { popeq: { cached: false,
                                                                                                                result: undefined } }]).value),
                                          adminPk_0),
                            'Not authorized as admin');
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_28.toValue(0n),
                                                                  alignment: _descriptor_28.alignment() } }] } },
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_28.toValue(0n),
                                                                  alignment: _descriptor_28.alignment() } }] } },
                                       { dup: { n: 2 } },
                                       { idx: { cached: false,
                                                pushPath: false,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_28.toValue(1n),
                                                                  alignment: _descriptor_28.alignment() } }] } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell(__compactRuntime.leafHash(
                                                                                              { value: _descriptor_0.toValue(commitment_0),
                                                                                                alignment: _descriptor_0.alignment() }
                                                                                            )).encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 1 } },
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_28.toValue(1n),
                                                                  alignment: _descriptor_28.alignment() } }] } },
                                       { addi: { immediate: 1 } },
                                       { ins: { cached: true, n: 2 } }]);
    return [];
  }
  _folder_0(f, x, a0) {
    for (let i = 0; i < 16; i++) { x = f(x, a0[i]); }
    return x;
  }
  _equal_0(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_1(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_2(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_3(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_4(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_5(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
}
export function ledger(stateOrChargedState) {
  const state = stateOrChargedState instanceof __compactRuntime.StateValue ? stateOrChargedState : stateOrChargedState.state;
  const chargedState = stateOrChargedState instanceof __compactRuntime.StateValue ? new __compactRuntime.ChargedState(stateOrChargedState) : stateOrChargedState;
  const context = {
    callContext: { currentQueryContext: new __compactRuntime.QueryContext(chargedState, __compactRuntime.dummyContractAddress()), currentGasCost: __compactRuntime.emptyRunningCost() },
    costModel: __compactRuntime.CostModel.initialCostModel()
  };
  const partialProofData = {
    input: { value: [], alignment: [] },
    output: undefined,
    publicTranscript: [],
    privateTranscriptOutputs: []
  };
  return {
    appraisalRegistry: {
      isFull(...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`isFull: expected 0 arguments, received ${args_0.length}`);
        }
        return _descriptor_3.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_28.toValue(0n),
                                                                                                     alignment: _descriptor_28.alignment() } }] } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_28.toValue(1n),
                                                                                                     alignment: _descriptor_28.alignment() } }] } },
                                                                          { push: { storage: false,
                                                                                    value: __compactRuntime.StateValue.newCell({ value: _descriptor_13.toValue(65536n),
                                                                                                                                 alignment: _descriptor_13.alignment() }).encode() } },
                                                                          'lt',
                                                                          'neg',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      checkRoot(...args_0) {
        if (args_0.length !== 1) {
          throw new __compactRuntime.CompactError(`checkRoot: expected 1 argument, received ${args_0.length}`);
        }
        const rt_0 = args_0[0];
        if (!(typeof(rt_0) === 'object' && typeof(rt_0.field) === 'bigint' && rt_0.field >= 0 && rt_0.field <= __compactRuntime.MAX_FIELD)) {
          __compactRuntime.typeError('checkRoot',
                                     'argument 1',
                                     'appraiser_verifier.compact line 44 char 1',
                                     'struct MerkleTreeDigest<field: Field>',
                                     rt_0)
        }
        return _descriptor_3.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_28.toValue(0n),
                                                                                                     alignment: _descriptor_28.alignment() } }] } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_28.toValue(0n),
                                                                                                     alignment: _descriptor_28.alignment() } }] } },
                                                                          'root',
                                                                          { push: { storage: false,
                                                                                    value: __compactRuntime.StateValue.newCell({ value: _descriptor_12.toValue(rt_0),
                                                                                                                                 alignment: _descriptor_12.alignment() }).encode() } },
                                                                          'eq',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      root(...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`root: expected 0 arguments, received ${args_0.length}`);
        }
        const self_0 = state.asArray()[0];
        return ((result) => result             ? __compactRuntime.CompactTypeMerkleTreeDigest.fromValue(result)             : undefined)(self_0.asArray()[0].asBoundedMerkleTree().rehash().root()?.value);
      },
      firstFree(...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`first_free: expected 0 arguments, received ${args_0.length}`);
        }
        const self_0 = state.asArray()[0];
        return __compactRuntime.CompactTypeField.fromValue(self_0.asArray()[1].asCell().value);
      },
      pathForLeaf(...args_0) {
        if (args_0.length !== 2) {
          throw new __compactRuntime.CompactError(`path_for_leaf: expected 2 arguments, received ${args_0.length}`);
        }
        const index_0 = args_0[0];
        const leaf_0 = args_0[1];
        if (!(typeof(index_0) === 'bigint' && index_0 >= 0 && index_0 <= __compactRuntime.MAX_FIELD)) {
          __compactRuntime.typeError('path_for_leaf',
                                     'argument 1',
                                     'appraiser_verifier.compact line 44 char 1',
                                     'Field',
                                     index_0)
        }
        if (!(leaf_0.buffer instanceof ArrayBuffer && leaf_0.BYTES_PER_ELEMENT === 1 && leaf_0.length === 32)) {
          __compactRuntime.typeError('path_for_leaf',
                                     'argument 2',
                                     'appraiser_verifier.compact line 44 char 1',
                                     'Bytes<32>',
                                     leaf_0)
        }
        const self_0 = state.asArray()[0];
        return ((result) => result             ? new __compactRuntime.CompactTypeMerkleTreePath(16, _descriptor_0).fromValue(result)             : undefined)(  self_0.asArray()[0].asBoundedMerkleTree().rehash().pathForLeaf(    index_0,    {      value: _descriptor_0.toValue(leaf_0),      alignment: _descriptor_0.alignment()    }  )?.value);
      },
      findPathForLeaf(...args_0) {
        if (args_0.length !== 1) {
          throw new __compactRuntime.CompactError(`find_path_for_leaf: expected 1 argument, received ${args_0.length}`);
        }
        const leaf_0 = args_0[0];
        if (!(leaf_0.buffer instanceof ArrayBuffer && leaf_0.BYTES_PER_ELEMENT === 1 && leaf_0.length === 32)) {
          __compactRuntime.typeError('find_path_for_leaf',
                                     'argument 1',
                                     'appraiser_verifier.compact line 44 char 1',
                                     'Bytes<32>',
                                     leaf_0)
        }
        const self_0 = state.asArray()[0];
        return ((result) => result             ? new __compactRuntime.CompactTypeMerkleTreePath(16, _descriptor_0).fromValue(result)             : undefined)(  self_0.asArray()[0].asBoundedMerkleTree().rehash().findPathForLeaf(    {      value: _descriptor_0.toValue(leaf_0),      alignment: _descriptor_0.alignment()    }  )?.value);
      }
    },
    nullifiers: {
      isEmpty(...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`isEmpty: expected 0 arguments, received ${args_0.length}`);
        }
        return _descriptor_3.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_28.toValue(1n),
                                                                                                     alignment: _descriptor_28.alignment() } }] } },
                                                                          'size',
                                                                          { push: { storage: false,
                                                                                    value: __compactRuntime.StateValue.newCell({ value: _descriptor_13.toValue(0n),
                                                                                                                                 alignment: _descriptor_13.alignment() }).encode() } },
                                                                          'eq',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      size(...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`size: expected 0 arguments, received ${args_0.length}`);
        }
        return _descriptor_13.fromValue(__compactRuntime.queryLedgerState(context,
                                                                          partialProofData,
                                                                          [
                                                                           { dup: { n: 0 } },
                                                                           { idx: { cached: false,
                                                                                    pushPath: false,
                                                                                    path: [
                                                                                           { tag: 'value',
                                                                                             value: { value: _descriptor_28.toValue(1n),
                                                                                                      alignment: _descriptor_28.alignment() } }] } },
                                                                           'size',
                                                                           { popeq: { cached: true,
                                                                                      result: undefined } }]).value);
      },
      member(...args_0) {
        if (args_0.length !== 1) {
          throw new __compactRuntime.CompactError(`member: expected 1 argument, received ${args_0.length}`);
        }
        const elem_0 = args_0[0];
        if (!(elem_0.buffer instanceof ArrayBuffer && elem_0.BYTES_PER_ELEMENT === 1 && elem_0.length === 32)) {
          __compactRuntime.typeError('member',
                                     'argument 1',
                                     'appraiser_verifier.compact line 45 char 1',
                                     'Bytes<32>',
                                     elem_0)
        }
        return _descriptor_3.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_28.toValue(1n),
                                                                                                     alignment: _descriptor_28.alignment() } }] } },
                                                                          { push: { storage: false,
                                                                                    value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(elem_0),
                                                                                                                                 alignment: _descriptor_0.alignment() }).encode() } },
                                                                          'member',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      [Symbol.iterator](...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`iter: expected 0 arguments, received ${args_0.length}`);
        }
        const self_0 = state.asArray()[1];
        return self_0.asMap().keys().map((elem) => _descriptor_0.fromValue(elem.value))[Symbol.iterator]();
      }
    },
    providers: {
      isEmpty(...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`isEmpty: expected 0 arguments, received ${args_0.length}`);
        }
        return _descriptor_3.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_28.toValue(2n),
                                                                                                     alignment: _descriptor_28.alignment() } }] } },
                                                                          'size',
                                                                          { push: { storage: false,
                                                                                    value: __compactRuntime.StateValue.newCell({ value: _descriptor_13.toValue(0n),
                                                                                                                                 alignment: _descriptor_13.alignment() }).encode() } },
                                                                          'eq',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      size(...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`size: expected 0 arguments, received ${args_0.length}`);
        }
        return _descriptor_13.fromValue(__compactRuntime.queryLedgerState(context,
                                                                          partialProofData,
                                                                          [
                                                                           { dup: { n: 0 } },
                                                                           { idx: { cached: false,
                                                                                    pushPath: false,
                                                                                    path: [
                                                                                           { tag: 'value',
                                                                                             value: { value: _descriptor_28.toValue(2n),
                                                                                                      alignment: _descriptor_28.alignment() } }] } },
                                                                           'size',
                                                                           { popeq: { cached: true,
                                                                                      result: undefined } }]).value);
      },
      member(...args_0) {
        if (args_0.length !== 1) {
          throw new __compactRuntime.CompactError(`member: expected 1 argument, received ${args_0.length}`);
        }
        const key_0 = args_0[0];
        if (!(typeof(key_0) === 'bigint' && key_0 >= 0n && key_0 <= 65535n)) {
          __compactRuntime.typeError('member',
                                     'argument 1',
                                     'appraiser_verifier.compact line 46 char 1',
                                     'Uint<0..65536>',
                                     key_0)
        }
        return _descriptor_3.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_28.toValue(2n),
                                                                                                     alignment: _descriptor_28.alignment() } }] } },
                                                                          { push: { storage: false,
                                                                                    value: __compactRuntime.StateValue.newCell({ value: _descriptor_1.toValue(key_0),
                                                                                                                                 alignment: _descriptor_1.alignment() }).encode() } },
                                                                          'member',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      lookup(...args_0) {
        if (args_0.length !== 1) {
          throw new __compactRuntime.CompactError(`lookup: expected 1 argument, received ${args_0.length}`);
        }
        const key_0 = args_0[0];
        if (!(typeof(key_0) === 'bigint' && key_0 >= 0n && key_0 <= 65535n)) {
          __compactRuntime.typeError('lookup',
                                     'argument 1',
                                     'appraiser_verifier.compact line 46 char 1',
                                     'Uint<0..65536>',
                                     key_0)
        }
        return _descriptor_2.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_28.toValue(2n),
                                                                                                     alignment: _descriptor_28.alignment() } }] } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_1.toValue(key_0),
                                                                                                     alignment: _descriptor_1.alignment() } }] } },
                                                                          { popeq: { cached: false,
                                                                                     result: undefined } }]).value);
      },
      [Symbol.iterator](...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`iter: expected 0 arguments, received ${args_0.length}`);
        }
        const self_0 = state.asArray()[2];
        return self_0.asMap().keys().map(  (key) => {    const value = self_0.asMap().get(key).asCell();    return [      _descriptor_1.fromValue(key.value),      _descriptor_2.fromValue(value.value)    ];  })[Symbol.iterator]();
      }
    },
    get contractAdmin() {
      return _descriptor_0.fromValue(__compactRuntime.queryLedgerState(context,
                                                                       partialProofData,
                                                                       [
                                                                        { dup: { n: 0 } },
                                                                        { idx: { cached: false,
                                                                                 pushPath: false,
                                                                                 path: [
                                                                                        { tag: 'value',
                                                                                          value: { value: _descriptor_28.toValue(3n),
                                                                                                   alignment: _descriptor_28.alignment() } }] } },
                                                                        { popeq: { cached: false,
                                                                                   result: undefined } }]).value);
    },
    loanOutcomes: {
      isEmpty(...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`isEmpty: expected 0 arguments, received ${args_0.length}`);
        }
        return _descriptor_3.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_28.toValue(4n),
                                                                                                     alignment: _descriptor_28.alignment() } }] } },
                                                                          'size',
                                                                          { push: { storage: false,
                                                                                    value: __compactRuntime.StateValue.newCell({ value: _descriptor_13.toValue(0n),
                                                                                                                                 alignment: _descriptor_13.alignment() }).encode() } },
                                                                          'eq',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      size(...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`size: expected 0 arguments, received ${args_0.length}`);
        }
        return _descriptor_13.fromValue(__compactRuntime.queryLedgerState(context,
                                                                          partialProofData,
                                                                          [
                                                                           { dup: { n: 0 } },
                                                                           { idx: { cached: false,
                                                                                    pushPath: false,
                                                                                    path: [
                                                                                           { tag: 'value',
                                                                                             value: { value: _descriptor_28.toValue(4n),
                                                                                                      alignment: _descriptor_28.alignment() } }] } },
                                                                           'size',
                                                                           { popeq: { cached: true,
                                                                                      result: undefined } }]).value);
      },
      member(...args_0) {
        if (args_0.length !== 1) {
          throw new __compactRuntime.CompactError(`member: expected 1 argument, received ${args_0.length}`);
        }
        const key_0 = args_0[0];
        if (!(typeof(key_0) === 'object' && key_0.user.buffer instanceof ArrayBuffer && key_0.user.BYTES_PER_ELEMENT === 1 && key_0.user.length === 32 && typeof(key_0.loanId) === 'bigint' && key_0.loanId >= 0n && key_0.loanId <= 65535n)) {
          __compactRuntime.typeError('member',
                                     'argument 1',
                                     'appraiser_verifier.compact line 48 char 1',
                                     'struct LoanKey<user: Bytes<32>, loanId: Uint<0..65536>>',
                                     key_0)
        }
        return _descriptor_3.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_28.toValue(4n),
                                                                                                     alignment: _descriptor_28.alignment() } }] } },
                                                                          { push: { storage: false,
                                                                                    value: __compactRuntime.StateValue.newCell({ value: _descriptor_4.toValue(key_0),
                                                                                                                                 alignment: _descriptor_4.alignment() }).encode() } },
                                                                          'member',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      lookup(...args_0) {
        if (args_0.length !== 1) {
          throw new __compactRuntime.CompactError(`lookup: expected 1 argument, received ${args_0.length}`);
        }
        const key_0 = args_0[0];
        if (!(typeof(key_0) === 'object' && key_0.user.buffer instanceof ArrayBuffer && key_0.user.BYTES_PER_ELEMENT === 1 && key_0.user.length === 32 && typeof(key_0.loanId) === 'bigint' && key_0.loanId >= 0n && key_0.loanId <= 65535n)) {
          __compactRuntime.typeError('lookup',
                                     'argument 1',
                                     'appraiser_verifier.compact line 48 char 1',
                                     'struct LoanKey<user: Bytes<32>, loanId: Uint<0..65536>>',
                                     key_0)
        }
        return _descriptor_8.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_28.toValue(4n),
                                                                                                     alignment: _descriptor_28.alignment() } }] } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_4.toValue(key_0),
                                                                                                     alignment: _descriptor_4.alignment() } }] } },
                                                                          { popeq: { cached: false,
                                                                                     result: undefined } }]).value);
      },
      [Symbol.iterator](...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`iter: expected 0 arguments, received ${args_0.length}`);
        }
        const self_0 = state.asArray()[4];
        return self_0.asMap().keys().map(  (key) => {    const value = self_0.asMap().get(key).asCell();    return [      _descriptor_4.fromValue(key.value),      _descriptor_8.fromValue(value.value)    ];  })[Symbol.iterator]();
      }
    },
    blacklist: {
      isEmpty(...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`isEmpty: expected 0 arguments, received ${args_0.length}`);
        }
        return _descriptor_3.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_28.toValue(5n),
                                                                                                     alignment: _descriptor_28.alignment() } }] } },
                                                                          'size',
                                                                          { push: { storage: false,
                                                                                    value: __compactRuntime.StateValue.newCell({ value: _descriptor_13.toValue(0n),
                                                                                                                                 alignment: _descriptor_13.alignment() }).encode() } },
                                                                          'eq',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      size(...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`size: expected 0 arguments, received ${args_0.length}`);
        }
        return _descriptor_13.fromValue(__compactRuntime.queryLedgerState(context,
                                                                          partialProofData,
                                                                          [
                                                                           { dup: { n: 0 } },
                                                                           { idx: { cached: false,
                                                                                    pushPath: false,
                                                                                    path: [
                                                                                           { tag: 'value',
                                                                                             value: { value: _descriptor_28.toValue(5n),
                                                                                                      alignment: _descriptor_28.alignment() } }] } },
                                                                           'size',
                                                                           { popeq: { cached: true,
                                                                                      result: undefined } }]).value);
      },
      member(...args_0) {
        if (args_0.length !== 1) {
          throw new __compactRuntime.CompactError(`member: expected 1 argument, received ${args_0.length}`);
        }
        const elem_0 = args_0[0];
        if (!(elem_0.buffer instanceof ArrayBuffer && elem_0.BYTES_PER_ELEMENT === 1 && elem_0.length === 32)) {
          __compactRuntime.typeError('member',
                                     'argument 1',
                                     'appraiser_verifier.compact line 49 char 1',
                                     'Bytes<32>',
                                     elem_0)
        }
        return _descriptor_3.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_28.toValue(5n),
                                                                                                     alignment: _descriptor_28.alignment() } }] } },
                                                                          { push: { storage: false,
                                                                                    value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(elem_0),
                                                                                                                                 alignment: _descriptor_0.alignment() }).encode() } },
                                                                          'member',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      [Symbol.iterator](...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`iter: expected 0 arguments, received ${args_0.length}`);
        }
        const self_0 = state.asArray()[5];
        return self_0.asMap().keys().map((elem) => _descriptor_0.fromValue(elem.value))[Symbol.iterator]();
      }
    },
    get round() {
      return _descriptor_13.fromValue(__compactRuntime.queryLedgerState(context,
                                                                        partialProofData,
                                                                        [
                                                                         { dup: { n: 0 } },
                                                                         { idx: { cached: false,
                                                                                  pushPath: false,
                                                                                  path: [
                                                                                         { tag: 'value',
                                                                                           value: { value: _descriptor_28.toValue(6n),
                                                                                                    alignment: _descriptor_28.alignment() } }] } },
                                                                         { popeq: { cached: true,
                                                                                    result: undefined } }]).value);
    },
    get nextLoanId() {
      return _descriptor_13.fromValue(__compactRuntime.queryLedgerState(context,
                                                                        partialProofData,
                                                                        [
                                                                         { dup: { n: 0 } },
                                                                         { idx: { cached: false,
                                                                                  pushPath: false,
                                                                                  path: [
                                                                                         { tag: 'value',
                                                                                           value: { value: _descriptor_28.toValue(7n),
                                                                                                    alignment: _descriptor_28.alignment() } }] } },
                                                                         { popeq: { cached: true,
                                                                                    result: undefined } }]).value);
    },
    pinMigration: {
      isEmpty(...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`isEmpty: expected 0 arguments, received ${args_0.length}`);
        }
        return _descriptor_3.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_28.toValue(8n),
                                                                                                     alignment: _descriptor_28.alignment() } }] } },
                                                                          'size',
                                                                          { push: { storage: false,
                                                                                    value: __compactRuntime.StateValue.newCell({ value: _descriptor_13.toValue(0n),
                                                                                                                                 alignment: _descriptor_13.alignment() }).encode() } },
                                                                          'eq',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      size(...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`size: expected 0 arguments, received ${args_0.length}`);
        }
        return _descriptor_13.fromValue(__compactRuntime.queryLedgerState(context,
                                                                          partialProofData,
                                                                          [
                                                                           { dup: { n: 0 } },
                                                                           { idx: { cached: false,
                                                                                    pushPath: false,
                                                                                    path: [
                                                                                           { tag: 'value',
                                                                                             value: { value: _descriptor_28.toValue(8n),
                                                                                                      alignment: _descriptor_28.alignment() } }] } },
                                                                           'size',
                                                                           { popeq: { cached: true,
                                                                                      result: undefined } }]).value);
      },
      member(...args_0) {
        if (args_0.length !== 1) {
          throw new __compactRuntime.CompactError(`member: expected 1 argument, received ${args_0.length}`);
        }
        const key_0 = args_0[0];
        if (!(key_0.buffer instanceof ArrayBuffer && key_0.BYTES_PER_ELEMENT === 1 && key_0.length === 32)) {
          __compactRuntime.typeError('member',
                                     'argument 1',
                                     'appraiser_verifier.compact line 52 char 1',
                                     'Bytes<32>',
                                     key_0)
        }
        return _descriptor_3.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_28.toValue(8n),
                                                                                                     alignment: _descriptor_28.alignment() } }] } },
                                                                          { push: { storage: false,
                                                                                    value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(key_0),
                                                                                                                                 alignment: _descriptor_0.alignment() }).encode() } },
                                                                          'member',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      lookup(...args_0) {
        if (args_0.length !== 1) {
          throw new __compactRuntime.CompactError(`lookup: expected 1 argument, received ${args_0.length}`);
        }
        const key_0 = args_0[0];
        if (!(key_0.buffer instanceof ArrayBuffer && key_0.BYTES_PER_ELEMENT === 1 && key_0.length === 32)) {
          __compactRuntime.typeError('lookup',
                                     'argument 1',
                                     'appraiser_verifier.compact line 52 char 1',
                                     'Bytes<32>',
                                     key_0)
        }
        return _descriptor_1.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_28.toValue(8n),
                                                                                                     alignment: _descriptor_28.alignment() } }] } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_0.toValue(key_0),
                                                                                                     alignment: _descriptor_0.alignment() } }] } },
                                                                          { popeq: { cached: false,
                                                                                     result: undefined } }]).value);
      },
      [Symbol.iterator](...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`iter: expected 0 arguments, received ${args_0.length}`);
        }
        const self_0 = state.asArray()[8];
        return self_0.asMap().keys().map(  (key) => {    const value = self_0.asMap().get(key).asCell();    return [      _descriptor_0.fromValue(key.value),      _descriptor_1.fromValue(value.value)    ];  })[Symbol.iterator]();
      }
    }
  };
}
const _emptyContext = {
  callContext: { currentQueryContext: new __compactRuntime.QueryContext(new __compactRuntime.ContractState().data, __compactRuntime.dummyContractAddress()), currentGasCost: __compactRuntime.emptyRunningCost() }
};
const _dummyContract = new Contract({
  getAttestedAppraisalWitness: (...args) => undefined,
  getUserSecret: (...args) => undefined,
  getAppraisalCommitment: (...args) => undefined,
  findAppraisalPath: (...args) => undefined
});
export const pureCircuits = {
  deriveUserPublicKey: (...args_0) => {
    if (args_0.length !== 2) {
      throw new __compactRuntime.CompactError(`deriveUserPublicKey: expected 2 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    const sk_0 = args_0[0];
    const pin_0 = args_0[1];
    if (!(sk_0.buffer instanceof ArrayBuffer && sk_0.BYTES_PER_ELEMENT === 1 && sk_0.length === 32)) {
      __compactRuntime.typeError('deriveUserPublicKey',
                                 'argument 1',
                                 'appraiser_verifier.compact line 64 char 1',
                                 'Bytes<32>',
                                 sk_0)
    }
    if (!(typeof(pin_0) === 'bigint' && pin_0 >= 0n && pin_0 <= 65535n)) {
      __compactRuntime.typeError('deriveUserPublicKey',
                                 'argument 2',
                                 'appraiser_verifier.compact line 64 char 1',
                                 'Uint<0..65536>',
                                 pin_0)
    }
    return _dummyContract._deriveUserPublicKey_0(sk_0, pin_0);
  },
  deriveAdminPublicKey: (...args_0) => {
    if (args_0.length !== 1) {
      throw new __compactRuntime.CompactError(`deriveAdminPublicKey: expected 1 argument (as invoked from Typescript), received ${args_0.length}`);
    }
    const sk_0 = args_0[0];
    if (!(sk_0.buffer instanceof ArrayBuffer && sk_0.BYTES_PER_ELEMENT === 1 && sk_0.length === 32)) {
      __compactRuntime.typeError('deriveAdminPublicKey',
                                 'argument 1',
                                 'appraiser_verifier.compact line 74 char 1',
                                 'Bytes<32>',
                                 sk_0)
    }
    return _dummyContract._deriveAdminPublicKey_0(sk_0);
  }
};
export const contractReferenceLocations =
  { tag: 'publicLedgerArray', indices: { } };
export const expectedVk = {
  'blacklistUser': '7a03dd9bf37f96e31b062d768168d34d87e286010cb0fcebbf203799d035a273',
  'changePin': '32cfa64767577d2570d4b224f006deb1a1d9e77c3884400a2bfd1b8e56e76e1b',
  'registerAppraisal': 'fb99aabe54623c6827474c418bdfb6675ec09577377d28e3fb8baf401e039d11',
  'registerProvider': '8fce47038fb8b7b2bb9eeedf6d6348d7d0c184d7747279f661ad6fb2cec05567',
  'requestAppraisalVerification': '8a47bb97849ce35929d2818f4bdcbeb2b713f3fe1509ea5e981c39c20d0e753f',
  'respondToLoan': '4178c4d5d4211eec3039a535022c08c5317065230bd6cafeaa0203df63118170',
  'rotateAdmin': '2d6ed99aa31c33e350c5a4e41bc20367675942307d513c7cd5cca07fb7efd2a9',
};

//# sourceMappingURL=index.js.map
