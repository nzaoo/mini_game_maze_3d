import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  base: '/mini_game_maze_3d/', // đúng với tên repo GitHub
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: resolve(__dirname, 'index.html'),
    },
  },
});
