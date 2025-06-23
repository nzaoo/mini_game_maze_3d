import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  base: '/mini_game_maze_3d/', // 🔁 đổi theo tên repo GitHub của bạn
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: resolve(__dirname, 'index.html'),
    },
  },
});
