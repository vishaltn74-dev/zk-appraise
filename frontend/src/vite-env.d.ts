/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_PROVER_MODE?: string;
  readonly VITE_ALLOW_DEV_SIMULATOR?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
