import React, { useState } from 'react';
import { Wallet, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';

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
      // Midnight Lace Wallet DApp connector API
      if (typeof window !== 'undefined' && (window as any).midnight?.lace) {
        const wallet = await (window as any).midnight.lace.enable();
        const address = await wallet.getShieldedAddress();
        onConnect(address);
      } else {
        // Fallback for simulation / development mode
        setTimeout(() => {
          onConnect('mn_shielded_1q9x38a72kc89zp4l56v0u30rhw85s2m8k472nd09f');
        }, 500);
      }
    } catch (err) {
      console.error('Wallet connection failed:', err);
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between rounded-2xl glass-strong p-4 sm:p-5 mb-8 shadow-xl border border-white/10 gap-4">
      <div className="flex items-center space-x-3.5">
        <div className="grid h-11 w-11 place-items-center rounded-xl bg-white/[0.06] border border-white/10 shrink-0">
          <Wallet className={`h-5 w-5 ${isConnected ? 'text-accent' : 'text-indigo'}`} />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-foreground">
              Midnight DApp Connector
            </h3>
            {isConnected ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-mono font-medium text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-800/60">
                <CheckCircle2 className="w-3 h-3" />
                Lace Active
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] font-mono font-medium text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded-md border border-amber-800/60">
                <AlertCircle className="w-3 h-3" />
                Standby
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5 font-mono">
            {isConnected
              ? `Shielded: ${walletAddress?.slice(0, 16)}...${walletAddress?.slice(-6)}`
              : 'Connect Midnight Lace Wallet for shielded on-chain settlement'}
          </p>
        </div>
      </div>

      <div className="w-full sm:w-auto flex items-center justify-end">
        {isConnected ? (
          <button
            type="button"
            onClick={onDisconnect}
            className="w-full sm:w-auto rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-semibold text-secondary-foreground transition-all hover:bg-white/[0.08] hover:text-white"
          >
            Disconnect Wallet
          </button>
        ) : (
          <button
            type="button"
            onClick={handleConnect}
            disabled={isConnecting}
            className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo to-violet px-5 py-2.5 text-xs font-semibold text-white shadow-md shadow-violet/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60"
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>{isConnecting ? 'Connecting Lace...' : 'Connect Midnight Lace'}</span>
          </button>
        )}
      </div>
    </div>
  );
};
