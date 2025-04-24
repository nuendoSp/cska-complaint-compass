import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser',
    assetsInlineLimit: 0,
    cssCodeSplit: true,
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug'],
      },
    },
    rollupOptions: {
      output: {
        format: 'es',
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
        manualChunks: undefined
      },
      input: {
        main: path.resolve(__dirname, 'index.html')
      }
    }
  },
  server: {
    port: 5173,
    open: true,
    host: true,
    strictPort: true,
    hmr: {
      overlay: false
    },
    watch: {
      usePolling: false,
      interval: 100
    }
  },
  optimizeDeps: {
    esbuildOptions: {
      target: 'esnext'
    },
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@supabase/supabase-js',
      'zod',
      'react-hook-form',
      '@hookform/resolvers'
    ]
  },
  base: '/',
  publicDir: 'public',
  experimental: {
    renderBuiltUrl(filename, { hostType, type, hostId }) {
      return `/${filename}`;
    }
  },
  appType: 'spa',
  ssr: {
    noExternal: true
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
  }
});
