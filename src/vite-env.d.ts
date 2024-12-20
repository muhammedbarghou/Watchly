/// <reference types="vite/client" />

interface ImportMetaEnv {
  VITE_API_URL: string; // Example property, add your actual environment variables here
  // Add other environment variables as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
