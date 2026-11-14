import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// base './' keeps asset URLs relative so the build works under any sub-path.
export default defineConfig({
  base: './',
  plugins: [react()],
});
