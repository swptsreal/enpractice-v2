import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

/**
 * HTTP-only config used to verify the built app from a script.
 *
 * The real config serves over HTTPS because the Web Speech API and getUserMedia
 * require a secure context. That is correct for humans but a self-signed cert
 * makes scripted checks fail before they test anything. Same plugins, no TLS.
 */
export default defineConfig({
    plugins: [react(), tailwindcss()],
    server: { host: '127.0.0.1' },
});
