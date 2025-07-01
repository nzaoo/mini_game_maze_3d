// =============== GAME TYPES DEFINITIONS ===============
// Type definitions for better code organization and documentation

/**
 * @typedef {Object} Vector3
 * @property {number} x - X coordinate
 * @property {number} y - Y coordinate
 * @property {number} z - Z coordinate
 */

/**
 * @typedef {Object} GameState
 * @property {THREE.Scene} scene - Three.js scene
 * @property {THREE.Camera} camera - Three.js camera
 * @property {THREE.WebGLRenderer} renderer - Three.js renderer
 * @property {PointerLockControls} controls - Pointer lock controls
 * @property {Array} rewards - Array of reward objects
 * @property {Array} traps - Array of trap objects
 * @property {Array} walls - Array of wall objects
 * @property {Vector3} endPosition - End position coordinates
 * @property {number} score - Current score
 * @property {boolean} isGameOver - Game over state
 * @property {boolean} isGameWin - Game win state
 * @property {number} currentLevel - Current level index
 * @property {number} tileSize - Size of maze tiles
 * @property {number} timeLeft - Time remaining
 * @property {number} timerInterval - Timer interval ID
 * @property {THREE.SpotLight} flashlight - Flashlight object
 * @property {Array} mazeMap - Current maze map
 */

/**
 * @typedef {Object} Item
 * @property {string} id - Unique item identifier
 * @property {string} name - Item display name
 * @property {string} type - Item type (consumable, powerUp, key, gem)
 * @property {string} description - Item description
 * @property {string} icon - Item icon path
 * @property {number} quantity - Current quantity
 * @property {number} maxQuantity - Maximum stack size
 * @property {ItemEffect} effect - Item effect configuration
 * @property {string} rarity - Item rarity (common, rare, epic, legendary)
 */

/**
 * @typedef {Object} ItemEffect
 * @property {string} type - Effect type (heal, speed, jump, invincibility, magnet, doublePoints)
 * @property {number} value - Effect value
 * @property {number} duration - Effect duration in milliseconds
 */

/**
 * @typedef {Object} PowerUp
 * @property {boolean} active - Whether power-up is active
 * @property {number} duration - Remaining duration
 * @property {number} maxDuration - Maximum duration
 */

/**
 * @typedef {Object} ParticleConfig
 * @property {number} maxParticles - Maximum number of particles
 * @property {number} particleLifetime - Particle lifetime in milliseconds
 * @property {number} emissionRate - Particles per second
 * @property {Vector3} gravity - Gravity vector
 * @property {Vector3} wind - Wind vector
 */

/**
 * @typedef {Object} GameConfig
 * @property {DisplayConfig} display - Display settings
 * @property {PhysicsConfig} physics - Physics settings
 * @property {AudioConfig} audio - Audio settings
 * @property {GraphicsConfig} graphics - Graphics settings
 * @property {UIConfig} ui - UI settings
 * @property {GameplayConfig} gameplay - Gameplay settings
 * @property {PerformanceConfig} performance - Performance settings
 */

/**
 * @typedef {Object} DisplayConfig
 * @property {number} width - Display width
 * @property {number} height - Display height
 * @property {number} aspectRatio - Aspect ratio
 * @property {number} pixelRatio - Device pixel ratio
 * @property {boolean} antialias - Antialiasing enabled
 * @property {ShadowMapConfig} shadowMap - Shadow map settings
 * @property {PostProcessingConfig} postProcessing - Post-processing settings
 */

/**
 * @typedef {Object} ShadowMapConfig
 * @property {boolean} enabled - Shadow mapping enabled
 * @property {string} type - Shadow map type
 * @property {number} size - Shadow map size
 */

/**
 * @typedef {Object} PostProcessingConfig
 * @property {boolean} enabled - Post-processing enabled
 * @property {BloomConfig} bloom - Bloom effect settings
 * @property {VignetteConfig} vignette - Vignette effect settings
 */

/**
 * @typedef {Object} BloomConfig
 * @property {boolean} enabled - Bloom enabled
 * @property {number} threshold - Bloom threshold
 * @property {number} strength - Bloom strength
 * @property {number} radius - Bloom radius
 */

/**
 * @typedef {Object} VignetteConfig
 * @property {boolean} enabled - Vignette enabled
 * @property {number} offset - Vignette offset
 * @property {number} darkness - Vignette darkness
 */

/**
 * @typedef {Object} PhysicsConfig
 * @property {number} gravity - Gravity strength
 * @property {number} friction - Friction coefficient
 * @property {number} normalSpeed - Normal movement speed
 * @property {number} runMultiplier - Running speed multiplier
 * @property {number} jumpPower - Jump power
 * @property {number} playerRadius - Player collision radius
 * @property {number} collisionThreshold - Collision detection threshold
 * @property {number} trapCollisionThreshold - Trap collision threshold
 * @property {number} winThreshold - Win condition threshold
 */

/**
 * @typedef {Object} AudioConfig
 * @property {number} masterVolume - Master volume (0-1)
 * @property {number} musicVolume - Music volume (0-1)
 * @property {number} sfxVolume - Sound effects volume (0-1)
 * @property {boolean} spatialAudio - Spatial audio enabled
 * @property {number} maxDistance - Maximum audio distance
 * @property {number} rolloffFactor - Audio rolloff factor
 * @property {Object} sounds - Sound file paths
 */

/**
 * @typedef {Object} GraphicsConfig
 * @property {string} quality - Graphics quality level
 * @property {TextureConfig} textures - Texture settings
 * @property {LightingConfig} lighting - Lighting settings
 * @property {MaterialConfig} materials - Material settings
 * @property {ParticleConfig} particles - Particle settings
 */

/**
 * @typedef {Object} TextureConfig
 * @property {boolean} enabled - Textures enabled
 * @property {number} resolution - Texture resolution
 * @property {boolean} compression - Texture compression
 */

/**
 * @typedef {Object} LightingConfig
 * @property {LightConfig} ambient - Ambient light settings
 * @property {LightConfig} directional - Directional light settings
 * @property {SpotLightConfig} flashlight - Flashlight settings
 */

/**
 * @typedef {Object} LightConfig
 * @property {number} intensity - Light intensity
 * @property {number} color - Light color (hex)
 */

/**
 * @typedef {Object} SpotLightConfig
 * @property {number} intensity - Light intensity
 * @property {number} distance - Light distance
 * @property {number} angle - Light angle
 * @property {number} penumbra - Light penumbra
 * @property {number} decay - Light decay
 */

/**
 * @typedef {Object} MaterialConfig
 * @property {MaterialSettings} wall - Wall material settings
 * @property {MaterialSettings} reward - Reward material settings
 * @property {MaterialSettings} trap - Trap material settings
 * @property {MaterialSettings} finish - Finish material settings
 */

/**
 * @typedef {Object} MaterialSettings
 * @property {number} color - Material color (hex)
 * @property {number} emissive - Emissive color (hex)
 * @property {number} metalness - Metalness value (0-1)
 * @property {number} roughness - Roughness value (0-1)
 */

/**
 * @typedef {Object} UIConfig
 * @property {string} theme - UI theme (light, dark, auto)
 * @property {string} language - UI language
 * @property {string} fontSize - Font size (small, medium, large)
 * @property {AnimationConfig} animations - Animation settings
 * @property {MinimapConfig} minimap - Minimap settings
 * @property {HUDConfig} hud - HUD settings
 */

/**
 * @typedef {Object} AnimationConfig
 * @property {boolean} enabled - Animations enabled
 * @property {number} duration - Animation duration
 * @property {string} easing - Animation easing function
 */

/**
 * @typedef {Object} MinimapConfig
 * @property {number} size - Minimap size
 * @property {number} opacity - Minimap opacity
 * @property {boolean} showPlayer - Show player position
 * @property {boolean} showRewards - Show reward positions
 * @property {boolean} showTraps - Show trap positions
 * @property {boolean} showExit - Show exit position
 */

/**
 * @typedef {Object} HUDConfig
 * @property {boolean} showScore - Show score display
 * @property {boolean} showTimer - Show timer display
 * @property {boolean} showFPS - Show FPS counter
 * @property {boolean} showControls - Show controls help
 */

/**
 * @typedef {Object} GameplayConfig
 * @property {string} difficulty - Game difficulty
 * @property {boolean} autoSave - Auto-save enabled
 * @property {boolean} checkpoints - Checkpoints enabled
 * @property {boolean} invincibility - Invincibility mode
 * @property {boolean} godMode - God mode enabled
 * @property {boolean} debugMode - Debug mode enabled
 * @property {ControlsConfig} controls - Control settings
 */

/**
 * @typedef {Object} ControlsConfig
 * @property {number} mouseSensitivity - Mouse sensitivity
 * @property {boolean} invertY - Invert Y axis
 * @property {boolean} smoothMovement - Smooth movement enabled
 * @property {boolean} autoRun - Auto-run enabled
 */

/**
 * @typedef {Object} PerformanceConfig
 * @property {number} targetFPS - Target FPS
 * @property {boolean} adaptiveQuality - Adaptive quality enabled
 * @property {boolean} culling - Frustum culling enabled
 * @property {boolean} instancing - Instanced rendering enabled
 * @property {boolean} compression - Asset compression enabled
 * @property {CacheConfig} cache - Cache settings
 */

/**
 * @typedef {Object} CacheConfig
 * @property {boolean} enabled - Caching enabled
 * @property {number} maxSize - Maximum cache size in bytes
 * @property {number} expiration - Cache expiration time in milliseconds
 */

/**
 * @typedef {Object} LevelData
 * @property {Array} mazeMap - Maze layout array
 * @property {number} timeLimit - Level time limit
 * @property {number} rewardValue - Reward point value
 * @property {number} trapDamage - Trap damage amount
 * @property {Vector3} startPosition - Starting position
 * @property {Vector3} endPosition - End position
 * @property {Array} rewards - Reward positions
 * @property {Array} traps - Trap positions
 * @property {Array} keys - Key positions
 * @property {Array} gems - Gem positions
 */

/**
 * @typedef {Object} PlayerData
 * @property {Vector3} position - Player position
 * @property {Vector3} velocity - Player velocity
 * @property {Vector3} direction - Player direction
 * @property {Object} move - Movement state
 * @property {boolean} canJump - Can player jump
 * @property {boolean} mouseDown - Mouse button state
 * @property {number} health - Player health
 * @property {number} score - Player score
 * @property {number} level - Current level
 */

/**
 * @typedef {Object} GameEvent
 * @property {string} type - Event type
 * @property {Object} data - Event data
 * @property {number} timestamp - Event timestamp
 */

/**
 * @typedef {Object} Achievement
 * @property {string} id - Achievement ID
 * @property {string} name - Achievement name
 * @property {string} description - Achievement description
 * @property {string} icon - Achievement icon
 * @property {boolean} unlocked - Achievement unlocked
 * @property {number} unlockDate - Unlock timestamp
 * @property {Object} requirements - Unlock requirements
 */

/**
 * @typedef {Object} Statistics
 * @property {number} totalPlayTime - Total play time in milliseconds
 * @property {number} levelsCompleted - Number of levels completed
 * @property {number} totalScore - Total score earned
 * @property {number} rewardsCollected - Number of rewards collected
 * @property {number} trapsHit - Number of times hit by traps
 * @property {number} deaths - Number of deaths
 * @property {number} jumps - Number of jumps performed
 * @property {number} distanceTraveled - Total distance traveled
 */

// Export type definitions for use in other modules
export const GameTypes = {
  Vector3: 'Vector3',
  GameState: 'GameState',
  Item: 'Item',
  ItemEffect: 'ItemEffect',
  PowerUp: 'PowerUp',
  ParticleConfig: 'ParticleConfig',
  GameConfig: 'GameConfig',
  DisplayConfig: 'DisplayConfig',
  ShadowMapConfig: 'ShadowMapConfig',
  PostProcessingConfig: 'PostProcessingConfig',
  BloomConfig: 'BloomConfig',
  VignetteConfig: 'VignetteConfig',
  PhysicsConfig: 'PhysicsConfig',
  AudioConfig: 'AudioConfig',
  GraphicsConfig: 'GraphicsConfig',
  TextureConfig: 'TextureConfig',
  LightingConfig: 'LightingConfig',
  LightConfig: 'LightConfig',
  SpotLightConfig: 'SpotLightConfig',
  MaterialConfig: 'MaterialConfig',
  MaterialSettings: 'MaterialSettings',
  UIConfig: 'UIConfig',
  AnimationConfig: 'AnimationConfig',
  MinimapConfig: 'MinimapConfig',
  HUDConfig: 'HUDConfig',
  GameplayConfig: 'GameplayConfig',
  ControlsConfig: 'ControlsConfig',
  PerformanceConfig: 'PerformanceConfig',
  CacheConfig: 'CacheConfig',
  LevelData: 'LevelData',
  PlayerData: 'PlayerData',
  GameEvent: 'GameEvent',
  Achievement: 'Achievement',
  Statistics: 'Statistics'
}; 