import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // API proxy disabled — frontend uses mock data until BE is connected.
});
