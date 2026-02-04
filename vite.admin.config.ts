import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(() => {
  return {
    root: path.resolve(__dirname, 'admin'),
    envDir: __dirname,
    base: './',
    server: {
      port: 3002,
      host: '0.0.0.0'
    },
    plugins: [react()],
    resolve: {
      dedupe: ['react', 'react-dom', 'react-router-dom'],
      alias: {
        '@': path.resolve(__dirname, '.')
      }
    },
    build: {
      outDir: path.resolve(__dirname, 'dist-admin'),
      emptyOutDir: true
    }
  };
});
