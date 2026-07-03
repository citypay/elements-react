import {defineConfig} from "vite";
import react from "@vitejs/plugin-react";
import {existsSync, readFileSync} from "node:fs";
import {resolve} from "node:path";

const certPath = resolve(__dirname, "certs/localhost.pem");
const keyPath = resolve(__dirname, "certs/localhost-key.pem");
const hasHttpsCerts = existsSync(certPath) && existsSync(keyPath);

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  server: {
    host: "localhost",
    port: 3000,
    strictPort: true,
    proxy: {
      "/verify-auth": {
        target: "https://localhost:3005",
        changeOrigin: true,
        secure: false,
      },
    },
    https: hasHttpsCerts
      ? {
          cert: readFileSync(certPath),
          key: readFileSync(keyPath),
        }
      : undefined,
  },
});
