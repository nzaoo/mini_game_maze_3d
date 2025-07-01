# 📁 Source Code Structure

This directory contains all the source code for the Maze Game 3D project.

## 🗂️ Directory Structure

```
src/
├── index.js              # Main exports and module organization
├── main.js               # Main game logic and initialization
├── maze-data.js          # Maze level definitions and data
├── style.css             # Game styles and UI
├── core/                 # Core game classes
│   ├── GameState.js      # Game state management
│   └── MazeGame.js       # Main game class
├── managers/             # Game managers and controllers
│   ├── AudioManager.js   # Audio system management
│   ├── UIManager.js      # User interface management
│   ├── PhysicsManager.js # Physics and movement
│   ├── CollisionManager.js # Collision detection
│   └── PerformanceMonitor.js # Performance tracking
├── components/           # Reusable game components
│   ├── ParticleSystem.js # Particle effects system
│   ├── PostProcessing.js # Post-processing effects
│   ├── InventorySystem.js # Inventory and items
│   └── AchievementSystem.js # Achievements system
├── utils/                # Utility functions
│   └── math-utils.js     # Mathematical utilities
├── config/               # Configuration files
│   └── game-config.js    # Game configuration
├── constants/            # Game constants
│   └── game-constants.js # Centralized constants
├── types/                # Type definitions
│   └── game-types.js     # Game type definitions
└── test/                 # Unit tests
    ├── setup.js          # Test setup and mocks
    └── game.test.js      # Game tests
```

## 🔧 Module Organization

### Core (`core/`)
Contains the fundamental game classes that handle the main game logic and state management.

### Managers (`managers/`)
Contains classes that manage specific aspects of the game (audio, UI, physics, etc.).

### Components (`components/`)
Contains reusable game components that can be instantiated and used throughout the game.

### Utils (`utils/`)
Contains utility functions and helper classes that provide common functionality.

### Config (`config/`)
Contains configuration files that define game settings and parameters.

### Constants (`constants/`)
Contains centralized constants used throughout the game.

### Types (`types/`)
Contains TypeScript-style type definitions for better code documentation.

### Test (`test/`)
Contains unit tests and test utilities.

## 📦 Import/Export Pattern

All modules are exported through `src/index.js` for easy importing:

```javascript
// Import from main exports
import { GameState, AudioManager, ParticleSystem } from './src/index.js';

// Or import directly from specific modules
import { configManager } from './src/config/game-config.js';
import { MathUtils } from './src/utils/math-utils.js';
```

## 🎯 Development Guidelines

1. **Modular Design**: Keep modules focused on a single responsibility
2. **Clear Exports**: Export only what's needed from each module
3. **Consistent Naming**: Use descriptive names for files and classes
4. **Documentation**: Add JSDoc comments for public APIs
5. **Testing**: Write tests for new functionality
6. **Configuration**: Use the config system for customizable settings

## 🔄 Adding New Features

1. **New Component**: Add to `components/` directory
2. **New Manager**: Add to `managers/` directory
3. **New Utility**: Add to `utils/` directory
4. **New Constants**: Add to `constants/game-constants.js`
5. **New Types**: Add to `types/game-types.js`
6. **Update Exports**: Add to `src/index.js`

## 🧪 Testing

Run tests with:
```bash
npm run test
```

Tests are located in the `test/` directory and follow the same structure as the source code. 