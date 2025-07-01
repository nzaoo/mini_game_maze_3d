// =============== GAME CONFIGURATION ===============
// Centralized configuration for all game settings

export const GameConfig = {
  // =============== DISPLAY SETTINGS ===============
  display: {
    width: window.innerWidth,
    height: window.innerHeight,
    aspectRatio: window.innerWidth / window.innerHeight,
    pixelRatio: Math.min(window.devicePixelRatio, 2),
    antialias: true,
    shadowMap: {
      enabled: true,
      type: 'PCFSoftShadowMap',
      size: 2048,
    },
    postProcessing: {
      enabled: true,
      bloom: {
        enabled: true,
        threshold: 0.8,
        strength: 0.5,
        radius: 0.5,
      },
      vignette: {
        enabled: true,
        offset: 0.5,
        darkness: 0.3,
      },
    },
  },

  // =============== PHYSICS SETTINGS ===============
  physics: {
    gravity: 35,
    friction: 12,
    normalSpeed: 35,
    runMultiplier: 1.8,
    jumpPower: 8,
    playerRadius: 0.3,
    collisionThreshold: 1.2,
    trapCollisionThreshold: 1.5,
    winThreshold: 1.5,
  },

  // =============== AUDIO SETTINGS ===============
  audio: {
    masterVolume: 0.5,
    musicVolume: 0.3,
    sfxVolume: 0.7,
    spatialAudio: true,
    maxDistance: 50,
    rolloffFactor: 1,
    sounds: {
      reward: '/audio/reward.mp3',
      trap: '/audio/trap.mp3',
      win: '/audio/win.mp3',
      lose: '/audio/lose.mp3',
      jump: '/audio/jump.mp3',
      footsteps: '/audio/footsteps.mp3',
      background: '/audio/music.mp3',
    },
  },

  // =============== GRAPHICS SETTINGS ===============
  graphics: {
    quality: 'high', // 'low', 'medium', 'high', 'ultra'
    textures: {
      enabled: true,
      resolution: 1024,
      compression: true,
    },
    lighting: {
      ambient: {
        intensity: 0.4,
        color: 0x404040,
      },
      directional: {
        intensity: 0.8,
        color: 0xffffff,
        position: { x: 10, y: 20, z: 10 },
      },
      flashlight: {
        intensity: 2,
        distance: 25,
        angle: Math.PI / 8,
        penumbra: 0.3,
        decay: 1.5,
      },
    },
    materials: {
      wall: {
        color: 0xcd853f,
        roughness: 0.8,
        metalness: 0.1,
      },
      reward: {
        color: 0xffd700,
        emissive: 0x444400,
        metalness: 0.1,
        roughness: 0.3,
      },
      trap: {
        color: 0xff4444,
        emissive: 0x440000,
        metalness: 0.2,
        roughness: 0.5,
      },
      finish: {
        color: 0x00ff00,
        emissive: 0x004400,
        metalness: 0.2,
        roughness: 0.4,
      },
    },
    particles: {
      enabled: true,
      maxParticles: 100,
      rewardParticles: 20,
      explosionParticles: 50,
    },
  },

  // =============== UI SETTINGS ===============
  ui: {
    theme: 'dark', // 'light', 'dark', 'auto'
    language: 'vi', // 'en', 'vi'
    fontSize: 'medium', // 'small', 'medium', 'large'
    animations: {
      enabled: true,
      duration: 300,
      easing: 'ease-out',
    },
    minimap: {
      size: 200,
      opacity: 0.8,
      showPlayer: true,
      showRewards: true,
      showTraps: true,
      showExit: true,
    },
    hud: {
      showScore: true,
      showTimer: true,
      showFPS: true,
      showControls: true,
    },
  },

  // =============== GAMEPLAY SETTINGS ===============
  gameplay: {
    difficulty: 'normal', // 'easy', 'normal', 'hard', 'expert'
    autoSave: true,
    checkpoints: true,
    invincibility: false,
    godMode: false,
    debugMode: false,
    controls: {
      mouseSensitivity: 1.0,
      invertY: false,
      smoothMovement: true,
      autoRun: false,
    },
  },

  // =============== PERFORMANCE SETTINGS ===============
  performance: {
    targetFPS: 60,
    adaptiveQuality: true,
    culling: true,
    instancing: true,
    compression: true,
    cache: {
      enabled: true,
      maxSize: 100 * 1024 * 1024, // 100MB
      expiration: 24 * 60 * 60 * 1000, // 24 hours
    },
  },

  // =============== NETWORK SETTINGS ===============
  network: {
    enabled: false,
    server: 'ws://localhost:8080',
    reconnectAttempts: 3,
    timeout: 5000,
    heartbeat: 30000,
  },

  // =============== STORAGE SETTINGS ===============
  storage: {
    prefix: 'maze_game_',
    encryption: false,
    compression: true,
    autoBackup: true,
  },
};

// =============== QUALITY PRESETS ===============
export const QualityPresets = {
  low: {
    display: {
      pixelRatio: 1,
      antialias: false,
      shadowMap: { enabled: false },
    },
    graphics: {
      quality: 'low',
      textures: { resolution: 512 },
      particles: { enabled: false },
    },
    performance: {
      targetFPS: 30,
      adaptiveQuality: false,
    },
  },
  medium: {
    display: {
      pixelRatio: 1,
      antialias: true,
      shadowMap: { enabled: true, size: 1024 },
    },
    graphics: {
      quality: 'medium',
      textures: { resolution: 1024 },
      particles: { enabled: true, maxParticles: 50 },
    },
    performance: {
      targetFPS: 60,
      adaptiveQuality: true,
    },
  },
  high: {
    display: {
      pixelRatio: 2,
      antialias: true,
      shadowMap: { enabled: true, size: 2048 },
    },
    graphics: {
      quality: 'high',
      textures: { resolution: 2048 },
      particles: { enabled: true, maxParticles: 100 },
    },
    performance: {
      targetFPS: 60,
      adaptiveQuality: true,
    },
  },
  ultra: {
    display: {
      pixelRatio: 2,
      antialias: true,
      shadowMap: { enabled: true, size: 4096 },
    },
    graphics: {
      quality: 'ultra',
      textures: { resolution: 4096 },
      particles: { enabled: true, maxParticles: 200 },
    },
    performance: {
      targetFPS: 60,
      adaptiveQuality: false,
    },
  },
};

// =============== DIFFICULTY PRESETS ===============
export const DifficultyPresets = {
  easy: {
    physics: {
      gravity: 30,
      friction: 10,
      normalSpeed: 30,
    },
    gameplay: {
      invincibility: false,
      checkpoints: true,
    },
  },
  normal: {
    physics: {
      gravity: 35,
      friction: 12,
      normalSpeed: 35,
    },
    gameplay: {
      invincibility: false,
      checkpoints: true,
    },
  },
  hard: {
    physics: {
      gravity: 40,
      friction: 15,
      normalSpeed: 40,
    },
    gameplay: {
      invincibility: false,
      checkpoints: false,
    },
  },
  expert: {
    physics: {
      gravity: 45,
      friction: 18,
      normalSpeed: 45,
    },
    gameplay: {
      invincibility: false,
      checkpoints: false,
    },
  },
};

// =============== CONFIGURATION UTILITIES ===============
export class ConfigManager {
  constructor() {
    this.config = { ...GameConfig };
    this.loadFromStorage();
  }

  // Load configuration from localStorage
  loadFromStorage() {
    try {
      const stored = localStorage.getItem('maze_game_config');
      if (stored) {
        const parsed = JSON.parse(stored);
        this.config = { ...this.config, ...parsed };
      }
    } catch (error) {
      console.warn('Failed to load config from storage:', error);
    }
  }

  // Save configuration to localStorage
  saveToStorage() {
    try {
      localStorage.setItem('maze_game_config', JSON.stringify(this.config));
    } catch (error) {
      console.warn('Failed to save config to storage:', error);
    }
  }

  // Get configuration value
  get(path) {
    return path.split('.').reduce((obj, key) => obj?.[key], this.config);
  }

  // Set configuration value
  set(path, value) {
    const keys = path.split('.');
    const lastKey = keys.pop();
    const obj = keys.reduce(
      (obj, key) => (obj[key] = obj[key] || {}),
      this.config,
    );
    obj[lastKey] = value;
    this.saveToStorage();
  }

  // Apply quality preset
  applyQualityPreset(preset) {
    const presetConfig = QualityPresets[preset];
    if (presetConfig) {
      this.config = { ...this.config, ...presetConfig };
      this.saveToStorage();
    }
  }

  // Apply difficulty preset
  applyDifficultyPreset(preset) {
    const presetConfig = DifficultyPresets[preset];
    if (presetConfig) {
      this.config = { ...this.config, ...presetConfig };
      this.saveToStorage();
    }
  }

  // Reset to defaults
  reset() {
    this.config = { ...GameConfig };
    this.saveToStorage();
  }

  // Get all configuration
  getAll() {
    return { ...this.config };
  }
}

// Export default instance
export const configManager = new ConfigManager();
