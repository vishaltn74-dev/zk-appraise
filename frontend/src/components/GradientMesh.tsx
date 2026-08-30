import React from 'react';

export const GradientMesh: React.FC = () => {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
    >
      {/* base */}
      <div className="absolute inset-0 bg-background" />

      {/* deep indigo sweep — upper left */}
      <div
        className="absolute -inset-[10%] blur-[70px]"
        style={{
          background:
            'radial-gradient(65% 80% at 15% 22%, rgba(99,45,235,0.95) 0%, rgba(99,45,235,0.5) 30%, rgba(99,45,235,0.14) 52%, transparent 68%)',
          animation: 'drift 24s ease-in-out infinite',
        }}
      />

      {/* violet crest — upper right */}
      <div
        className="absolute -inset-[10%] blur-[75px]"
        style={{
          background:
            'radial-gradient(60% 75% at 82% 20%, rgba(147,97,255,0.9) 0%, rgba(147,97,255,0.48) 32%, rgba(147,97,255,0.12) 54%, transparent 70%)',
          animation: 'drift-alt 28s ease-in-out infinite',
        }}
      />

      {/* magenta-violet wave — center ribbon */}
      <div
        className="absolute -inset-[10%] blur-[80px]"
        style={{
          background:
            'radial-gradient(60% 70% at 48% 44%, rgba(180,90,255,0.8) 0%, rgba(180,90,255,0.38) 34%, rgba(180,90,255,0.1) 56%, transparent 72%)',
          animation: 'drift 32s ease-in-out infinite',
        }}
      />

      {/* deep purple trough — lower right */}
      <div
        className="absolute -inset-[10%] blur-[85px]"
        style={{
          background:
            'radial-gradient(60% 75% at 85% 78%, rgba(120,45,225,0.8) 0%, rgba(120,45,225,0.36) 34%, transparent 66%)',
          animation: 'drift-alt 30s ease-in-out infinite',
        }}
      />

      {/* bright lavender highlight — lower left crest */}
      <div
        className="absolute -inset-[10%] blur-[85px]"
        style={{
          background:
            'radial-gradient(52% 62% at 12% 82%, rgba(190,150,255,0.6) 0%, rgba(190,150,255,0.2) 40%, transparent 64%)',
          animation: 'drift 36s ease-in-out infinite',
        }}
      />

      {/* subtle grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.04) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
          maskImage:
            'radial-gradient(ellipse 80% 60% at 50% 30%, black 40%, transparent 100%)',
          WebkitMaskImage:
            'radial-gradient(ellipse 80% 60% at 50% 30%, black 40%, transparent 100%)',
        }}
      />

      {/* light top vignette for nav legibility */}
      <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-background/50 to-transparent" />
    </div>
  );
};
