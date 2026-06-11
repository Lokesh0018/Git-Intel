import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/analyze': 'http://localhost:4000',
      '/profile': 'http://localhost:4000',
      '/skills': 'http://localhost:4000',
      '/scores': 'http://localhost:4000',
      '/insights': 'http://localhost:4000',
      '/job-match': 'http://localhost:4000',
      '/report': 'http://localhost:4000',
      '/health': 'http://localhost:4000'
    }
  }
});
