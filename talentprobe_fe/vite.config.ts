import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

const securityHeaders = {
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "X-Frame-Options": "DENY",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
  "Cross-Origin-Opener-Policy": "same-origin",
  "Cross-Origin-Resource-Policy": "same-origin",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
  "Content-Security-Policy": [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' https://accounts.google.com https://accounts.gstatic.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://accounts.google.com",
    "style-src-elem 'self' 'unsafe-inline' https://fonts.googleapis.com https://accounts.google.com",
    "img-src 'self' data: https:",
    "font-src 'self' data: https://fonts.gstatic.com",
    "connect-src 'self' http: https: ws: wss:",
    "frame-src 'self' https://accounts.google.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'"
  ].join("; "),
};

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
    headers: securityHeaders,
  },
  preview: {
    headers: securityHeaders,
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
