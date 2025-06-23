import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  base: '/mini_game_maze_3d/', // Đúng tên repo GitHub Pages
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: resolve(__dirname, 'index.html'),
    },
  },
});
