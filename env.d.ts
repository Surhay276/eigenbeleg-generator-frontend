/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Adresse des Backends, z. B. https://eigenbeleg-backend.onrender.com */
  readonly VITE_API_BASE_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
