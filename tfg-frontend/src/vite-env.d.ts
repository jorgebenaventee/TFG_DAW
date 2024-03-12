/// <reference types="vite/client" />
interface ImportMetaEnv {
  VITE_BACK_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
