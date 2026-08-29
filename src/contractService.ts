import { deployContract, findDeployedContract } from '@midnight-ntwrk/midnight-js';
import * as contract from '../contracts/managed/contract/index.js'; 

export interface AppraiserAPI {
  registerNewProvider: (providerId: number, providerKey: Uint8Array) => Promise<any>;
  requestVerification: (loanThreshold: number, secretPin: number) => Promise<any>;
}

export async function setupAppraiserContract(providers: any): Promise<AppraiserAPI> {
  const deployedContract = await deployContract(providers, {
    privateStateId: 'appraiserPrivateState',
    contract: (contract as any).contract, 
    initialPrivateState: (contract as any).initialPrivateState ?? {},
  });

  return {
    async registerNewProvider(providerId: number, providerKey: Uint8Array) {
      const tx = await deployedContract.callTx.registerProvider(providerId, providerKey);
      return tx;
    },
    
    async requestVerification(loanThreshold: number, secretPin: number) {
      const tx = await deployedContract.callTx.requestAppraisalVerification(loanThreshold, secretPin);
      return tx;
    }
  };
}