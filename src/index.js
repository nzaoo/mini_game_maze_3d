// =============== MAZE GAME - MAIN EXPORTS ===============
// Central export file for all game modules

// Core game classes
export { GameState } from './core/GameState.js';
export { MazeGame } from './core/MazeGame.js';

// Managers
export { AudioManager } from './managers/AudioManager.js';
export { UIManager } from './managers/UIManager.js';
export { PhysicsManager } from './managers/PhysicsManager.js';
export { CollisionManager } from './managers/CollisionManager.js';
export { PerformanceMonitor } from './managers/PerformanceMonitor.js';

// Components
export { ParticleSystem } from './components/ParticleSystem.js';
export { PostProcessing } from './components/PostProcessing.js';
export { InventorySystem } from './components/InventorySystem.js';
export { AchievementSystem } from './components/AchievementSystem.js';

// Utilities
export { MathUtils } from './utils/math-utils.js';

// Configuration
export { configManager, GameConfig } from './config/game-config.js';

// Data
export { mazeMaps, levelSettings } from './maze-data.js';

// Constants
export * from './constants/game-constants.js';

// Types
export * from './types/game-types.js';

// Main game initialization
export { initGame } from './main.js'; 