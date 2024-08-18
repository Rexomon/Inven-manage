/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly BASE_URL: string;
    // tambahkan variabel lingkungan lainnya di sini jika diperlukan
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
