import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import wasm from "vite-plugin-wasm";
import topLevelAwait from "vite-plugin-top-level-await";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    wasm(),
    topLevelAwait()
  ],
  build: {
    // Allows the use of top-level await in the final output
    target: 'esnext'
  },
  optimizeDeps: {
    esbuildOptions: {
      // Allows top-level await in dependencies during dev server pre-bundling
      supported: {
        'top-level-await': true
      },
    }
  }
})