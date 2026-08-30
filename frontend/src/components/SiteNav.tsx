import React from 'react';
import { Wallet } from 'lucide-react';

interface SiteNavProps {
  walletAddress: string | null;
  isConnected: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
}

export const SiteNav: React.FC<SiteNavProps> = ({
  walletAddress,
  isConnected,
  onConnect,
  onDisconnect,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/[0.08] bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
        {/* Brand identity */}
        <div className="flex items-center space-x-3.5">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display text-xl font-bold tracking-tight text-foreground">
                VeilCred
              </span>
              <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-semibold text-accent border border-accent/30 uppercase tracking-wider font-mono">
                v3 ZKML
              </span>
            </div>
            <p className="text-xs text-muted-foreground hidden sm:block">
              Privacy-Preserving Home Equity &bull; Midnight Network
            </p>
          </div>
        </div>

        {/* Wallet button */}
        <div className="flex items-center space-x-3">

          {/* Quick wallet trigger */}
          {isConnected ? (
            <button
              onClick={onDisconnect}
              className="inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-950/40 px-3.5 py-1.5 text-xs font-medium text-emerald-300 transition-colors hover:bg-emerald-950/70 shadow-sm"
              title="Click to disconnect Midnight wallet"
            >
              <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-mono">{walletAddress ? `${walletAddress.slice(0, 8)}...${walletAddress.slice(-4)}` : 'Connected'}</span>
            </button>
          ) : (
            <button
              onClick={onConnect}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo to-violet px-4 py-1.5 text-xs font-semibold text-white shadow-md shadow-violet/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Wallet className="h-3.5 w-3.5" />
              <span>Connect Lace</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
