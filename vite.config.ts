import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import viteCompression from "vite-plugin-compression";

export default defineConfig(({ mode }) => {
  // Charge les variables d'environnement selon le mode (development ou production)
  const env = loadEnv(mode, process.cwd());

  return {
    server: {
      port: 5173,
      host: "0.0.0.0",
      open: true,
      proxy: {
        "/api": {
          // Utilise localhost sur ton Mac, mais en production 
          // c'est la Rewrite Rule de CyberPanel qui prend le relais
          target: "http://127.0.0.1:5000",
          changeOrigin: true,
          secure: false,
        },
        "/uploads": {
          target: "http://127.0.0.1:5000",
          changeOrigin: true,
          secure: false,
        },
      },
    },
    build: {
      outDir: "dist",
      sourcemap: false,
      minify: "terser",
      terserOptions: {
        compress: {
          drop_console: true,
        },
      },
      rollupOptions: {
        output: {
          // Nommage clair des fichiers pour faciliter l'inspection
          entryFileNames: `assets/[name]-[hash].js`,
          chunkFileNames: `assets/[name]-[hash].js`,
          assetFileNames: `assets/[name]-[hash].[ext]`,
        },
      },
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    plugins: [
      react(),
      // Génère .gz et .br pour les assets en production
      viteCompression({
        verbose: true,
        disable: false,
        threshold: 10240,
        algorithm: 'gzip',
        ext: '.gz',
      }),
      viteCompression({
        verbose: true,
        disable: false,
        threshold: 10240,
        algorithm: 'brotliCompress',
        ext: '.br',
      }),
    ],
  };
});