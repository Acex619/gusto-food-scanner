import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
base: mode === 'production' ? '/gusto-food-scanner/' : '/',
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src")
    },
  },
  define: {
    global: 'globalThis',
    'process.env': {}
  },
  optimizeDeps: {
    include: ['react', 'react-dom']
  },
  build: {
    chunkSizeWarningLimit: 1000, // Increase warning limit to 1000kb
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Create vendor chunk for node_modules
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'react-vendor';
            }
            if (id.includes('@radix-ui') || id.includes('class-variance-authority') || id.includes('clsx')) {
              return 'ui-libs';
            }
            if (id.includes('@tanstack') || id.includes('axios')) {
              return 'data-processing';
            }
            if (id.includes('@zxing')) {
              return 'barcode-scanning';
            }
            return 'vendor'; // All other node_modules
          }
          
          // Don't try to create a specific chunk for UI components folder
          // Let them be bundled with their importers
        }
      }
    }
  }
}));
