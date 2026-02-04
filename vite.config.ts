import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      resolve: {
        dedupe: ['react', 'react-dom', 'react-router-dom'],
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
