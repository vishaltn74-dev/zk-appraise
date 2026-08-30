import { deployContract, findDeployedContract } from '@midnight-ntwrk/midnight-js-contracts';
import { Contract } from '../contracts/managed/contract/index.js'; 

export interface AppraiserAPI {
  registerNewProvider: (providerId: number, providerKey: Uint8Array) => Promise<any>;
  requestVerification: (loanThreshold: number, secretPin: number) => Promise<any>;
}

export async function setupAppraiserContract(providers: any): Promise<AppraiserAPI> {
  const deployOptions: any = {
    compiledContract: Contract,
    privateStateId: 'appraiserPrivateState',
    initialPrivateState: {},
  };
  const deployedContract = await (deployContract as any)(providers, deployOptions);

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

export async function getDeployedAppraiserContract(providers: any, contractAddress: string): Promise<AppraiserAPI> {
  const findOptions: any = {
    contractAddress,
    compiledContract: Contract,
    privateStateId: 'appraiserPrivateState',
    initialPrivateState: {},
  };
  const deployedContract = await (findDeployedContract as any)(providers, findOptions);

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