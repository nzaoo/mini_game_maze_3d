// =============== GAME CONSTANTS ===============
// Centralized constants for the maze game

// Game states
export const GAME_STATES = {
  LOADING: 'loading',
  MENU: 'menu',
  PLAYING: 'playing',
  PAUSED: 'paused',
  GAME_OVER: 'game_over',
  GAME_WIN: 'game_win',
  LEVEL_COMPLETE: 'level_complete',
};

// Level types
export const LEVEL_TYPES = {
  NORMAL: 'normal',
  SPEED_RUN: 'speed_run',
  PERFECT: 'perfect',
  SURVIVAL: 'survival',
};

// Item types
export const ITEM_TYPES = {
  CONSUMABLE: 'consumable',
  POWER_UP: 'powerUp',
  KEY: 'key',
  GEM: 'gem',
};

// Power-up types
export const POWER_UP_TYPES = {
  SPEED_BOOST: 'speedBoost',
  JUMP_BOOST: 'jumpBoost',
  INVINCIBILITY: 'invincibility',
  MAGNET: 'magnet',
  DOUBLE_POINTS: 'doublePoints',
};

// Achievement categories
export const ACHIEVEMENT_CATEGORIES = {
  SPEED: 'speed',
  SCORE: 'score',
  EXPLORATION: 'exploration',
  SURVIVAL: 'survival',
  PERFECTION: 'perfection',
  SPECIAL: 'special',
};

// Audio types
export const AUDIO_TYPES = {
  SFX: 'sfx',
  MUSIC: 'music',
  AMBIENT: 'ambient',
};

// Particle effect types
export const PARTICLE_TYPES = {
  EXPLOSION: 'explosion',
  FIRE: 'fire',
  SPARKLE: 'sparkle',
  SMOKE: 'smoke',
  REWARD: 'reward',
  TRAP: 'trap',
};

// Post-processing effects
export const POST_PROCESSING_EFFECTS = {
  BLOOM: 'bloom',
  VIGNETTE: 'vignette',
  COLOR_CORRECTION: 'colorCorrection',
  CHROMATIC_ABERRATION: 'chromaticAberration',
  MOTION_BLUR: 'motionBlur',
  DEPTH_OF_FIELD: 'depthOfField',
};

// Quality presets
export const QUALITY_PRESETS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  ULTRA: 'ultra',
};

// Difficulty levels
export const DIFFICULTY_LEVELS = {
  EASY: 'easy',
  NORMAL: 'normal',
  HARD: 'hard',
  EXPERT: 'expert',
};

// UI themes
export const UI_THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  AUTO: 'auto',
};

// Languages
export const LANGUAGES = {
  EN: 'en',
  VI: 'vi',
};

// Font sizes
export const FONT_SIZES = {
  SMALL: 'small',
  MEDIUM: 'medium',
  LARGE: 'large',
};

// Maze tile types
export const TILE_TYPES = {
  WALL: '1',
  PATH: '0',
  REWARD: 'R',
  TRAP: 'T',
  START: 'S',
  END: 'E',
  KEY: 'K',
  GEM: 'G',
};

// Physics constants
export const PHYSICS = {
  GRAVITY: 35,
  FRICTION: 12,
  NORMAL_SPEED: 35,
  RUN_MULTIPLIER: 1.8,
  JUMP_POWER: 8,
  PLAYER_RADIUS: 0.3,
  COLLISION_THRESHOLD: 1.2,
  TRAP_COLLISION_THRESHOLD: 1.5,
  WIN_THRESHOLD: 1.5,
};

// Audio constants
export const AUDIO = {
  MASTER_VOLUME: 0.5,
  MUSIC_VOLUME: 0.3,
  SFX_VOLUME: 0.7,
  MAX_DISTANCE: 50,
  ROLLOFF_FACTOR: 1,
};

// UI constants
export const UI = {
  MINIMAP_SIZE: 200,
  MINIMAP_OPACITY: 0.8,
  ANIMATION_DURATION: 300,
  NOTIFICATION_DURATION: 3000,
};

// Performance constants
export const PERFORMANCE = {
  TARGET_FPS: 60,
  MAX_PARTICLES: 100,
  SHADOW_MAP_SIZE: 2048,
  TEXTURE_RESOLUTION: 1024,
};

// Storage keys
export const STORAGE_KEYS = {
  GAME_CONFIG: 'maze_game_config',
  INVENTORY: 'maze_game_inventory',
  ACHIEVEMENTS: 'maze_game_achievements',
  AUDIO_SETTINGS: 'maze_game_audio_settings',
  STATISTICS: 'maze_game_statistics',
};

// Event types
export const EVENT_TYPES = {
  GAME_START: 'game_start',
  GAME_OVER: 'game_over',
  GAME_WIN: 'game_win',
  LEVEL_COMPLETE: 'level_complete',
  REWARD_COLLECTED: 'reward_collected',
  TRAP_HIT: 'trap_hit',
  ACHIEVEMENT_UNLOCKED: 'achievement_unlocked',
  POWER_UP_ACTIVATED: 'power_up_activated',
  INVENTORY_UPDATED: 'inventory_updated',
};

// Error types
export const ERROR_TYPES = {
  WEBGL_NOT_SUPPORTED: 'webgl_not_supported',
  AUDIO_NOT_SUPPORTED: 'audio_not_supported',
  ASSET_LOAD_FAILED: 'asset_load_failed',
  CONFIG_LOAD_FAILED: 'config_load_failed',
  SAVE_FAILED: 'save_failed',
};

// Debug flags
export const DEBUG_FLAGS = {
  SHOW_FPS: false,
  SHOW_COLLISION_BOXES: false,
  SHOW_PARTICLE_COUNT: false,
  SHOW_PERFORMANCE_METRICS: false,
  ENABLE_CONSOLE_LOGGING: false,
}; 