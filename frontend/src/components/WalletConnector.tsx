import React, { useState } from 'react';

interface WalletConnectorProps {
  onConnect: (address: string) => void;
  onDisconnect: () => void;
  isConnected: boolean;
  walletAddress: string | null;
}

export const WalletConnector: React.FC<WalletConnectorProps> = ({
  onConnect,
  onDisconnect,
  isConnected,
  walletAddress,
}) => {
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      // Simulate Midnight Lace Wallet DApp connector API
      if ((window as any).midnight?.lace) {
        const wallet = await (window as any).midnight.lace.enable();
        const address = await wallet.getShieldedAddress();
        onConnect(address);
      } else {
        // Fallback for simulation / development mode
        setTimeout(() => {
          onConnect('mn_shielded_1q9x38a72kc89zp4l56v0u30rhw85s2m8k472nd09f');
        }, 600);
      }
    } catch (err) {
      console.error('Wallet connection failed:', err);
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded-xl p-4 mb-6 shadow-xl">
      <div className="flex items-center space-x-3">
        <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-emerald-400' : 'bg-amber-400'}`} />
        <div>
          <h3 className="text-sm font-semibold text-white">Midnight DApp Connector</h3>
          <p className="text-xs text-slate-400">
            {isConnected ? `Shielded: ${walletAddress?.slice(0, 14)}...${walletAddress?.slice(-6)}` : 'Disconnected (Lace Wallet)'}
          </p>
        </div>
      </div>

      {isConnected ? (
        <button
          onClick={onDisconnect}
          className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs py-2 px-4 rounded-lg transition-colors border border-slate-700"
        >
          Disconnect
        </button>
      ) : (
        <button
          onClick={handleConnect}
          disabled={isConnecting}
          className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium text-xs py-2 px-4 rounded-lg transition-all shadow-md shadow-indigo-500/20 disabled:opacity-50"
        >
          {isConnecting ? 'Connecting Lace Wallet...' : 'Connect Lace Wallet'}
        </button>
      )}
    </div>
  );
};
